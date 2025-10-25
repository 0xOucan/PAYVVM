"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useGoldenStaking } from '~~/hooks/fishing/useGoldenStaking';

const STAKING_ADDRESS = '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816';
const MATE_PER_STAKING_TOKEN = 5083;

export const GoldenStaking = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [mounted, setMounted] = useState(false);

  const golden = useGoldenStaking();

  // Handle client-side mounting (avoid SSR issues)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debug logging - MOVED TO TOP LEVEL FOR VISIBILITY
  useEffect(() => {
    if (mounted) {
      const debugInfo = {
        '🎣 COMPONENT': 'GoldenStaking Debug',
        '1. Wallet': {
          address,
          isGoldenFisher: golden.isGoldenFisher,
          goldenFisherAddress: golden.goldenFisherAddress,
          isLoadingGoldenFisher: golden.isLoadingGoldenFisher,
        },
        '2. Contract Data': {
          evvmId: golden.evvmId?.toString(),
          evvmIdType: typeof golden.evvmId,
          evvmIdRaw: golden.evvmId,
          isLoadingEvvmId: golden.isLoadingEvvmId,
          isEvvmIdError: golden.isEvvmIdError,
          paymentNonce: golden.paymentNonce?.toString(),
          paymentNonceType: typeof golden.paymentNonce,
          isLoadingPaymentNonce: golden.isLoadingPaymentNonce,
          isPaymentNonceError: golden.isPaymentNonceError,
        },
        '3. Button State': {
          amount,
          hasAmount: !!amount && parseFloat(amount) > 0,
          isExecuting: golden.isExecuting,
          isConfirming: golden.isConfirming,
          evvmIdCheck: !!golden.evvmId,
          paymentNonceCheck: !!golden.paymentNonce,
          DISABLED_REASON: !amount ? 'No amount' :
            parseFloat(amount) <= 0 ? 'Amount <= 0' :
            golden.isExecuting ? 'Executing' :
            golden.isConfirming ? 'Confirming' :
            golden.isLoadingEvvmId ? 'Loading EVVM ID' :
            golden.isLoadingPaymentNonce ? 'Loading Nonce' :
            golden.evvmId === undefined || golden.evvmId === null ? 'No EVVM ID' :
            golden.paymentNonce === undefined || golden.paymentNonce === null ? 'No Payment Nonce' :
            '✅ ENABLED!',
        },
      };
      console.log(debugInfo);
      console.table(debugInfo['2. Contract Data']);
      console.table(debugInfo['3. Button State']);
    }
  }, [mounted, address, golden, amount]);

  // Reset form after success
  useEffect(() => {
    if (golden.isSuccess) {
      setAmount('');
    }
  }, [golden.isSuccess]);

  // Don't render anything until mounted (prevent SSR issues)
  if (!mounted) {
    return null;
  }

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(golden.mateBalanceFormatted);

    if (amountNum > balanceNum) {
      alert('Insufficient MATE balance');
      return;
    }

    try {
      await golden.initiateGoldenStaking(amount, true);
    } catch (error) {
      console.error('Golden staking error:', error);
    }
  };

  const handleUnstake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(amount);
    const stakedNum = parseFloat(golden.stakedFormatted);

    if (amountNum > stakedNum) {
      alert('Cannot unstake more than staked amount');
      return;
    }

    const confirmed = confirm(
      'Warning: Unstaking has a 21-day cooldown period. Are you sure you want to unstake?'
    );

    if (!confirmed) {
      return;
    }

    try {
      await golden.initiateGoldenStaking(amount, false);
    } catch (error) {
      console.error('Golden unstaking error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="card bg-gradient-to-r from-warning to-amber-500 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl text-white">👑 Golden Fisher</h2>
          <div className="alert alert-warning bg-white/90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>Please connect your wallet</span>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while checking golden fisher
  if (golden.isLoadingGoldenFisher) {
    return (
      <div className="card bg-gradient-to-r from-warning to-amber-500 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl text-white">👑 Golden Fisher</h2>
          <div className="alert bg-white/90">
            <span className="loading loading-spinner loading-md"></span>
            <span>Checking golden fisher status...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!golden.isGoldenFisher) {
    return (
      <div className="card bg-gradient-to-r from-warning to-amber-500 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl text-white">👑 Golden Fisher</h2>
          <div className="alert alert-info bg-white/90">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="stroke-current shrink-0 w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <div>
              <div className="font-bold">Connected wallet is not the Golden Fisher</div>
              <div className="text-xs mt-2">
                <div>Golden Fisher:</div>
                <div className="font-mono text-[10px]">{golden.goldenFisherAddress}</div>
              </div>
              <div className="text-xs mt-1">
                <div>Your address:</div>
                <div className="font-mono text-[10px]">{address}</div>
              </div>
              <div className="text-xs mt-2 opacity-60">
                Check browser console for debug information
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-r from-warning to-amber-500 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4 text-white">
          👑 Golden Fisher - VIP Staking
        </h2>

        {/* VIP Badge */}
        <div className="alert bg-white/90 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-warning shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
          </svg>
          <div className="text-sm">
            <p className="font-bold text-warning">Golden Fisher Privileges:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>✨ NO signature required (instant staking)</li>
              <li>✨ NO nonce verification (bypass authentication)</li>
              <li>✨ Priority transaction processing</li>
              <li>✨ Exclusive golden fisher rewards</li>
            </ul>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* MATE Balance */}
          <div className="stat bg-white/90 rounded-lg">
            <div className="stat-title">MATE Balance</div>
            <div className="stat-value text-2xl text-warning">
              {golden.isLoadingMateBalance ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                parseFloat(golden.mateBalanceFormatted).toFixed(2)
              )}
            </div>
            <div className="stat-desc">Available to stake</div>
          </div>

          {/* Staked Amount */}
          <div className="stat bg-white/90 rounded-lg">
            <div className="stat-title">Staked MATE</div>
            <div className="stat-value text-2xl text-warning">
              {golden.isLoadingStakedAmount ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                parseFloat(golden.stakedFormatted).toFixed(2)
              )}
            </div>
            <div className="stat-desc">
              ≈ {(parseFloat(golden.stakedFormatted) / MATE_PER_STAKING_TOKEN).toFixed(4)} staking tokens
            </div>
          </div>

          {/* Contract Data Status */}
          <div className="stat bg-white/90 rounded-lg">
            <div className="stat-title">Contract Data</div>
            <div className="stat-value text-sm">
              {golden.isLoadingEvvmId || golden.isLoadingPaymentNonce ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <span className="text-success">✓ Ready</span>
              )}
            </div>
            <div className="stat-desc text-xs">
              {golden.evvmId !== undefined && golden.evvmId !== null ? `EVVM ID: ${golden.evvmId.toString()}` : 'Loading...'}
              <br />
              {golden.paymentNonce !== undefined && golden.paymentNonce !== null ? `Nonce: ${golden.paymentNonce.toString()}` : 'Loading...'}
            </div>
          </div>

          {/* Fisher Status */}
          <div className="stat bg-white/90 rounded-lg">
            <div className="stat-title">Golden Status</div>
            <div className="stat-value text-2xl">
              {golden.isLoadingStakerStatus ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : golden.isStaker ? (
                <span className="text-success">👑 Active</span>
              ) : (
                <span className="text-error">✗ Inactive</span>
              )}
            </div>
            <div className="stat-desc">
              {golden.isStaker ? 'Golden fisher bot ready' : 'Stake to activate'}
            </div>
          </div>
        </div>

        {/* Debug Info Alert */}
        <div className="alert alert-info">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-current shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div className="text-xs">
            <p className="font-bold">Debug Info (Check browser console F12 for details):</p>
            <div className="grid grid-cols-2 gap-1 mt-1">
              <div>EVVM ID: {golden.evvmId !== undefined && golden.evvmId !== null ? golden.evvmId.toString() : '❌ Loading...'}</div>
              <div>Nonce: {golden.paymentNonce !== undefined && golden.paymentNonce !== null ? golden.paymentNonce.toString() : '❌ Loading...'}</div>
              <div>Loading ID: {golden.isLoadingEvvmId ? '⏳ Yes' : '✓ No'}</div>
              <div>Loading Nonce: {golden.isLoadingPaymentNonce ? '⏳ Yes' : '✓ No'}</div>
              <div>Error ID: {golden.isEvvmIdError ? '❌ Yes' : '✓ No'}</div>
              <div>Error Nonce: {golden.isPaymentNonceError ? '❌ Yes' : '✓ No'}</div>
            </div>
          </div>
        </div>

        {/* Staking Form */}
        <div className="space-y-4 bg-white/90 p-4 rounded-lg">
          {/* Amount Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-bold">Amount (MATE)</span>
              <span className="label-text-alt">
                Balance: {parseFloat(golden.mateBalanceFormatted).toFixed(4)}
              </span>
            </label>
            <div className="join">
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered join-item flex-1 input-warning"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
              <button
                className="btn join-item btn-warning"
                onClick={() => setAmount(golden.mateBalanceFormatted)}
              >
                MAX
              </button>
            </div>
            <label className="label">
              <span className="label-text-alt">
                {amount ? `≈ ${(parseFloat(amount) / MATE_PER_STAKING_TOKEN).toFixed(4)} staking tokens` : ' '}
              </span>
            </label>
          </div>

          {/* Stake Button */}
          <button
            className="btn btn-warning w-full text-white"
            onClick={handleStake}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              golden.isExecuting ||
              golden.isConfirming ||
              golden.isLoadingEvvmId ||
              golden.isLoadingPaymentNonce ||
              golden.evvmId === undefined ||
              golden.evvmId === null ||
              golden.paymentNonce === undefined ||
              golden.paymentNonce === null
            }
          >
            {golden.isLoadingEvvmId || golden.isLoadingPaymentNonce ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Loading contract data...
              </>
            ) : golden.isExecuting || golden.isConfirming ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {golden.isExecuting ? 'Staking...' : 'Confirming...'}
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
                ✨ Golden Stake (Instant)
              </>
            )}
          </button>

          {/* Unstake Button */}
          {parseFloat(golden.stakedFormatted) > 0 && (
            <button
              className="btn btn-outline btn-error w-full"
              onClick={handleUnstake}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                golden.isExecuting ||
                golden.isConfirming
              }
            >
              Unstake MATE (21-day cooldown)
            </button>
          )}
        </div>

        {/* Success Message */}
        {golden.isSuccess && (
          <div className="alert alert-success">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex flex-col">
              <span className="font-bold">Golden staking successful!</span>
              {golden.hash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${golden.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link link-primary text-xs mt-1"
                >
                  View on Etherscan →
                </a>
              )}
            </div>
          </div>
        )}

        {/* Error Messages */}
        {golden.executeError && (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex flex-col">
              <span className="font-bold">Transaction failed</span>
              <span className="text-xs">{golden.executeError.message}</span>
            </div>
          </div>
        )}

        {/* Contract Data Loading Errors */}
        {(golden.isEvvmIdError || golden.isPaymentNonceError) && (
          <div className="alert alert-error">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="flex flex-col">
              <span className="font-bold">Contract data loading error</span>
              {golden.isEvvmIdError && (
                <span className="text-xs">EVVM ID: {golden.evvmIdError?.message || 'Unknown error'}</span>
              )}
              {golden.isPaymentNonceError && (
                <span className="text-xs">Payment Nonce: {golden.paymentNonceError?.message || 'Unknown error'}</span>
              )}
            </div>
          </div>
        )}

        {/* Contract Info */}
        <div className="divider">Contract Info</div>
        <div className="grid grid-cols-1 gap-2 text-xs text-white">
          <div>
            <span className="font-bold">Staking Contract:</span>{' '}
            <a
              href={`https://sepolia.etherscan.io/address/${STAKING_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link link-primary font-mono"
            >
              {STAKING_ADDRESS.slice(0, 6)}...{STAKING_ADDRESS.slice(-4)}
            </a>
          </div>
          <div>
            <span className="font-bold">Golden Fisher:</span>{' '}
            <span className="font-mono">{address?.slice(0, 10)}...{address?.slice(-8)}</span>
          </div>
          <div>
            <span className="font-bold">Network:</span>{' '}
            <span>Ethereum Sepolia Testnet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
