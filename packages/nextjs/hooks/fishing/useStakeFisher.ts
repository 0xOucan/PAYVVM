/**
 * Custom hook for MATE token staking to become a fisher
 * Uses EIP-191 signature-based staking via the Staking contract
 */

import { useState, useEffect } from 'react';
import { useAccount, useSignMessage, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, zeroAddress } from 'viem';
import { useEvvmId } from '../payvvm/useEvvmState';

// Contract addresses
const EVVM_ADDRESS = '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e' as const;
const STAKING_ADDRESS = '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816' as const;
const MATE_TOKEN = '0x0000000000000000000000000000000000000001' as const;

// Staking contract ABI
const STAKING_ABI = [
  {
    name: 'publicStaking',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'isStaking', type: 'bool' },
      { name: 'amountOfStaking', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'signature', type: 'bytes' },
      { name: 'priorityFee_EVVM', type: 'uint256' },
      { name: 'nonce_EVVM', type: 'uint256' },
      { name: 'priorityFlag_EVVM', type: 'bool' },
      { name: 'signature_EVVM', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'getStakingNonce',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getAmountStaked',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'allowPublicStaking',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: 'flag', type: 'bool' }],
  },
] as const;

// EVVM ABI for staker status
const EVVM_ABI = [
  {
    name: 'isAddressStaker',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'getNextCurrentSyncNonce',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
] as const;

/**
 * Construct staking message for EIP-191 signing
 * Format: {evvmID},publicStaking,{isStaking},{amountOfStaking},{nonce}
 */
export function constructStakingMessage(
  evvmId: bigint,
  isStaking: boolean,
  amountOfStaking: string,
  nonce: string
): string {
  const stakingFlag = isStaking ? 'true' : 'false';
  const message = `${evvmId},publicStaking,${stakingFlag},${amountOfStaking},${nonce}`;
  return message;
}

/**
 * Hook for MATE token staking
 */
export function useStakeFisher() {
  const { address } = useAccount();
  const [stakingData, setStakingData] = useState<{
    amount: string;
    isStaking: boolean;
  } | null>(null);

  // Get EVVM ID
  const { data: evvmId, isLoading: isLoadingEvvmId } = useEvvmId();

  // Get staking nonce
  const { data: stakingNonce, isLoading: isLoadingStakingNonce } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getStakingNonce',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  });

  // Get EVVM nonce
  const { data: evvmNonce, isLoading: isLoadingEvvmNonce } = useReadContract({
    address: EVVM_ADDRESS,
    abi: EVVM_ABI,
    functionName: 'getNextCurrentSyncNonce',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  });

  // Get staked amount
  const { data: stakedAmount, isLoading: isLoadingStakedAmount, refetch: refetchStakedAmount } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getAmountStaked',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  });

  // Get staker status from EVVM
  const { data: isStaker, isLoading: isLoadingStakerStatus, refetch: refetchStakerStatus } = useReadContract({
    address: EVVM_ADDRESS,
    abi: EVVM_ABI,
    functionName: 'isAddressStaker',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  });

  // Get MATE balance
  const { data: mateBalance, isLoading: isLoadingMateBalance, refetch: refetchMateBalance } = useReadContract({
    address: EVVM_ADDRESS,
    abi: EVVM_ABI,
    functionName: 'getBalance',
    args: address ? [address, MATE_TOKEN] : undefined,
    query: {
      enabled: !!address,
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  });

  // Check if public staking is allowed
  const { data: publicStakingAllowed } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'allowPublicStaking',
  });

  // Step 1: Sign the staking message
  const {
    signMessage,
    data: signature,
    isPending: isSigning,
    error: signError,
    reset: resetSign,
  } = useSignMessage();

  // Step 2: Execute the staking transaction
  const {
    writeContract,
    data: hash,
    isPending: isExecuting,
    error: executeError,
    reset: resetExecute,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  /**
   * Initiate staking: construct message and sign
   */
  const initiateStaking = async (amount: string, isStaking: boolean = true) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (typeof stakingNonce !== 'bigint') {
      throw new Error('Staking nonce not loaded. Please wait a moment and try again.');
    }

    if (!evvmId) {
      throw new Error('EVVM ID not loaded. Please wait a moment and try again.');
    }

    if (!publicStakingAllowed) {
      throw new Error('Public staking is not currently enabled');
    }

    // Store staking data for later execution
    setStakingData({ amount, isStaking });

    try {
      // Convert amount to wei (MATE has 18 decimals)
      const amountWei = parseUnits(amount, 18).toString();
      const nonceStr = stakingNonce.toString();

      // Construct staking message
      const message = constructStakingMessage(
        evvmId,
        isStaking,
        amountWei,
        nonceStr
      );

      console.log('Staking message:', message);

      // Sign message (EIP-191)
      signMessage({ message });
    } catch (err) {
      console.error('Staking initiation error:', err);
      throw err;
    }
  };

  /**
   * Execute staking after signature is obtained
   */
  const executeStaking = () => {
    if (!signature || !stakingData || !address || typeof stakingNonce !== 'bigint' || typeof evvmNonce !== 'bigint') {
      console.error('Missing signature or staking data');
      return;
    }

    try {
      const amountWei = parseUnits(stakingData.amount, 18);

      writeContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'publicStaking',
        args: [
          address, // user
          stakingData.isStaking, // isStaking
          amountWei, // amountOfStaking
          stakingNonce, // nonce
          signature, // signature
          0n, // priorityFee_EVVM (0 for now)
          evvmNonce, // nonce_EVVM
          false, // priorityFlag_EVVM (synchronous)
          '0x', // signature_EVVM (empty for staking)
        ],
      });
    } catch (err) {
      console.error('Staking execution error:', err);
    }
  };

  // Auto-execute after signature is obtained
  useEffect(() => {
    if (signature && !hash && !isExecuting) {
      executeStaking();
    }
  }, [signature]);

  // Refetch data after successful staking
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        refetchStakedAmount();
        refetchStakerStatus();
        refetchMateBalance();
      }, 500);

      const resetTimer = setTimeout(() => {
        reset();
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [isSuccess]);

  /**
   * Reset state for new staking operation
   */
  const reset = () => {
    setStakingData(null);
    resetSign();
    resetExecute();
  };

  return {
    // State
    signature,
    hash,
    stakingNonce,
    evvmNonce,
    stakedAmount: stakedAmount || 0n,
    isStaker: isStaker || false,
    mateBalance: mateBalance || 0n,
    publicStakingAllowed: publicStakingAllowed || false,

    // Formatted values
    stakedFormatted: stakedAmount ? (Number(stakedAmount) / 1e18).toFixed(4) : '0',
    mateBalanceFormatted: mateBalance ? (Number(mateBalance) / 1e18).toFixed(4) : '0',

    // Status
    isSigning,
    isExecuting,
    isConfirming,
    isSuccess,
    isLoadingEvvmId,
    isLoadingStakingNonce,
    isLoadingEvvmNonce,
    isLoadingStakedAmount,
    isLoadingStakerStatus,
    isLoadingMateBalance,

    // Errors
    signError,
    executeError,

    // Actions
    initiateStaking,
    executeStaking,
    reset,
    refetchStakedAmount,
    refetchStakerStatus,
    refetchMateBalance,
  };
}
