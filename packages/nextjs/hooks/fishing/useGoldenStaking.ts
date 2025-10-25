/**
 * Custom hook for Golden Fisher staking
 * Golden Fisher has special privileges and bypasses signature verification
 */

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { parseUnits, getAddress } from 'viem';

// Contract addresses
const STAKING_ADDRESS = '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816' as const;
const EVVM_ADDRESS = '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e' as const;
const MATE_TOKEN = '0x0000000000000000000000000000000000000001' as const;

// Staking contract ABI
const STAKING_ABI = [
  {
    name: 'goldenStaking',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'isStaking', type: 'bool' },
      { name: 'amountOfStaking', type: 'uint256' },
      { name: 'signature_EVVM', type: 'bytes' },
    ],
    outputs: [],
  },
  {
    name: 'getAmountStaked',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'getGoldenFisher',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const;

// EVVM ABI for balance
const EVVM_ABI = [
  {
    name: 'isAddressStaker',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool' }],
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
 * Hook for Golden Fisher staking
 */
export function useGoldenStaking() {
  const { address } = useAccount();

  // Get golden fisher address from staking contract
  const { data: goldenFisherAddress, isLoading: isLoadingGoldenFisher } = useReadContract({
    address: STAKING_ADDRESS,
    abi: STAKING_ABI,
    functionName: 'getGoldenFisher',
    query: {
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  });

  // Check if connected address is golden fisher
  // Normalize both addresses using getAddress and compare
  const isGoldenFisher = (() => {
    try {
      if (!address || !goldenFisherAddress) return false;

      // Normalize both addresses to checksummed format
      const normalizedConnected = getAddress(address);
      const normalizedGolden = getAddress(goldenFisherAddress as string);

      return normalizedConnected === normalizedGolden;
    } catch (error) {
      console.error('Error comparing addresses:', error);
      return false;
    }
  })();

  // Debug logging (only on client side)
  useEffect(() => {
    if (address && goldenFisherAddress) {
      console.log('🔍 Golden Fisher Check:', {
        connectedAddress: address,
        goldenFisherAddress: goldenFisherAddress,
        normalizedConnected: getAddress(address),
        normalizedGolden: getAddress(goldenFisherAddress as string),
        addressesMatch: getAddress(address) === getAddress(goldenFisherAddress as string),
        isGoldenFisher,
      });
    }
  }, [address, goldenFisherAddress, isGoldenFisher]);

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

  // Execute golden staking
  const {
    writeContract,
    data: hash,
    isPending: isExecuting,
    error: executeError,
    reset: resetExecute,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  /**
   * Execute golden staking
   * No signature required - Golden Fisher privilege!
   */
  const executeGoldenStaking = async (amount: string, isStakingMode: boolean = true) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (!isGoldenFisher) {
      throw new Error('Connected wallet is not the Golden Fisher');
    }

    try {
      const amountWei = parseUnits(amount, 18);

      writeContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'goldenStaking',
        args: [
          isStakingMode, // isStaking
          amountWei, // amountOfStaking
          '0x', // signature_EVVM (empty - not needed for golden fisher!)
        ],
      });
    } catch (err) {
      console.error('Golden staking execution error:', err);
      throw err;
    }
  };

  // Refetch data after successful staking
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        refetchStakedAmount();
        refetchStakerStatus();
        refetchMateBalance();
      }, 500);

      const resetTimer = setTimeout(() => {
        resetExecute();
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearTimeout(resetTimer);
      };
    }
  }, [isSuccess]);

  return {
    // Golden Fisher Status
    isGoldenFisher: Boolean(isGoldenFisher),
    goldenFisherAddress,
    isLoadingGoldenFisher,

    // State
    hash,
    stakedAmount: stakedAmount || 0n,
    isStaker: isStaker || false,
    mateBalance: mateBalance || 0n,

    // Formatted values
    stakedFormatted: stakedAmount ? (Number(stakedAmount) / 1e18).toFixed(4) : '0',
    mateBalanceFormatted: mateBalance ? (Number(mateBalance) / 1e18).toFixed(4) : '0',

    // Status
    isExecuting,
    isConfirming,
    isSuccess,
    isLoadingStakedAmount,
    isLoadingStakerStatus,
    isLoadingMateBalance,

    // Errors
    executeError,

    // Actions
    executeGoldenStaking,
    reset: resetExecute,
    refetchStakedAmount,
    refetchStakerStatus,
    refetchMateBalance,
  };
}
