/**
 * Custom hook for Golden Fisher staking
 * Golden Fisher has special privileges and bypasses signature verification
 */

import { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useReadContract, useSignMessage } from 'wagmi';
import { parseUnits, getAddress, hashMessage } from 'viem';

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

// EVVM ABI for balance and nonce
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
  {
    name: 'getNextCurrentSyncNonce',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const;

/**
 * Hook for Golden Fisher staking
 */
export function useGoldenStaking() {
  const { address } = useAccount();
  const [pendingAmount, setPendingAmount] = useState<string | null>(null);
  const [pendingMode, setPendingMode] = useState<boolean>(true);

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

  // Get EVVM ID
  const { data: evvmId, isLoading: isLoadingEvvmId } = useReadContract({
    address: EVVM_ADDRESS,
    abi: [
      {
        name: 'id',
        type: 'function',
        stateMutability: 'view',
        inputs: [],
        outputs: [{ type: 'uint256' }],
      },
    ] as const,
    functionName: 'id',
    query: {
      refetchOnWindowFocus: true,
      staleTime: 0,
    },
  });

  // Get current sync nonce for payment signature
  const { data: paymentNonce, isLoading: isLoadingPaymentNonce } = useReadContract({
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

  // Sign payment message
  const { signMessage, data: paymentSignature, reset: resetSignature } = useSignMessage();

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
        evvmId: evvmId?.toString(),
        paymentNonce: paymentNonce?.toString(),
        isLoadingEvvmId,
        isLoadingPaymentNonce,
      });
    }
  }, [address, goldenFisherAddress, isGoldenFisher, evvmId, paymentNonce, isLoadingEvvmId, isLoadingPaymentNonce]);

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
   * Initiate golden staking by requesting payment signature
   * Golden Fisher bypasses staking nonce verification
   * But still needs signature for the internal EVVM payment
   */
  const initiateGoldenStaking = async (amount: string, isStakingMode: boolean = true) => {
    if (!address || !paymentNonce || evvmId === undefined) {
      throw new Error('Wallet not connected or contract data not loaded');
    }

    if (!isGoldenFisher) {
      throw new Error('Connected wallet is not the Golden Fisher');
    }

    try {
      const amountWei = parseUnits(amount, 18);

      // Construct payment message for signature
      // Format: evvmID,from,to,token,amount,priorityFee,nonce,priorityFlag
      const message = `${evvmId},${address},${STAKING_ADDRESS},${MATE_TOKEN},${amountWei},0,${paymentNonce},false`;

      console.log('📝 Requesting payment signature for golden staking:', {
        evvmId: evvmId.toString(),
        from: address,
        to: STAKING_ADDRESS,
        token: MATE_TOKEN,
        amount: amountWei.toString(),
        nonce: paymentNonce.toString(),
        message,
      });

      // Store pending operation
      setPendingAmount(amount);
      setPendingMode(isStakingMode);

      // Request signature from user
      signMessage({ message });
    } catch (err) {
      console.error('Golden staking initiation error:', err);
      throw err;
    }
  };

  /**
   * Execute golden staking after signature is obtained
   */
  const executeGoldenStaking = () => {
    if (!address || !paymentSignature || !pendingAmount) {
      return;
    }

    try {
      const amountWei = parseUnits(pendingAmount, 18);

      console.log('🎣 Executing golden staking with signature');

      writeContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'goldenStaking',
        args: [
          pendingMode, // isStaking
          amountWei, // amountOfStaking
          paymentSignature, // signature_EVVM (signed payment)
        ],
      });

      // Reset pending state
      setPendingAmount(null);
      resetSignature();
    } catch (err) {
      console.error('Golden staking execution error:', err);
      throw err;
    }
  };

  // Auto-execute after signature
  useEffect(() => {
    if (paymentSignature && pendingAmount && !hash && !isExecuting) {
      executeGoldenStaking();
    }
  }, [paymentSignature]);

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
    paymentSignature,
    evvmId,
    paymentNonce,

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
    isLoadingEvvmId,
    isLoadingPaymentNonce,

    // Errors
    executeError,

    // Actions
    initiateGoldenStaking,
    executeGoldenStaking,
    reset: resetExecute,
    refetchStakedAmount,
    refetchStakerStatus,
    refetchMateBalance,
  };
}
