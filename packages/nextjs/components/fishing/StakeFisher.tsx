"use client";

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { useStakeFisher } from '~~/hooks/fishing/useStakeFisher';

const STAKING_ADDRESS = '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816';
const MATE_PER_STAKING_TOKEN = 5083;

export const StakeFisher = () => {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const fisher = useStakeFisher();

  // Auto-execute after signature
  useEffect(() => {
    if (fisher.signature && !fisher.hash && !fisher.isExecuting) {
      fisher.executeStaking();
    }
  }, [fisher.signature]);

  // Reset form after success
  useEffect(() => {
    if (fisher.isSuccess) {
      setAmount('');
    }
  }, [fisher.isSuccess]);

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(amount);
    const balanceNum = parseFloat(fisher.mateBalanceFormatted);

    if (amountNum > balanceNum) {
      alert('Insufficient MATE balance');
      return;
    }

    try {
      await fisher.initiateStaking(amount, true);
    } catch (error) {
      console.error('Staking error:', error);
    }
  };

  const handleUnstake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const amountNum = parseFloat(amount);
    const stakedNum = parseFloat(fisher.stakedFormatted);

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
      await fisher.initiateStaking(amount, false);
    } catch (error) {
      console.error('Unstaking error:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Become a Fisher</h2>
          <div className="alert alert-warning">
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
            <span>Please connect your wallet to stake MATE tokens</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-4">
          🎣 Become a Fisher
        </h2>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* MATE Balance */}
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">MATE Balance</div>
            <div className="stat-value text-2xl">
              {fisher.isLoadingMateBalance ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                parseFloat(fisher.mateBalanceFormatted).toFixed(2)
              )}
            </div>
            <div className="stat-desc">Available to stake</div>
          </div>

          {/* Staked Amount */}
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Staked MATE</div>
            <div className="stat-value text-2xl">
              {fisher.isLoadingStakedAmount ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                parseFloat(fisher.stakedFormatted).toFixed(2)
              )}
            </div>
            <div className="stat-desc">
              ≈ {(parseFloat(fisher.stakedFormatted) / MATE_PER_STAKING_TOKEN).toFixed(4)} staking tokens
            </div>
          </div>

          {/* Fisher Status */}
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Fisher Status</div>
            <div className="stat-value text-2xl">
              {fisher.isLoadingStakerStatus ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : fisher.isStaker ? (
                <span className="text-success">✓ Active</span>
              ) : (
                <span className="text-error">✗ Inactive</span>
              )}
            </div>
            <div className="stat-desc">
              {fisher.isStaker ? 'You can run fisher bot' : 'Stake MATE to activate'}
            </div>
          </div>
        </div>

        {/* Public Staking Status */}
        {!fisher.publicStakingAllowed && (
          <div className="alert alert-error mb-4">
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
            <span>Public staking is currently disabled. Please wait for it to be enabled.</span>
          </div>
        )}

        {/* Info Alert */}
        <div className="alert alert-info mb-4">
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
          <div className="text-sm">
            <p className="font-bold mb-2">Fisher Requirements:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Stake MATE tokens to become a fisher</li>
              <li>1 staking token = <strong>{MATE_PER_STAKING_TOKEN} MATE</strong></li>
              <li>Fishers earn MATE rewards + priority fees</li>
              <li>Unstaking has a <strong>21-day cooldown</strong></li>
            </ul>
          </div>
        </div>

        {/* Staking Form */}
        <div className="space-y-4">
          {/* Amount Input */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Amount (MATE)</span>
              <span className="label-text-alt">
                Balance: {parseFloat(fisher.mateBalanceFormatted).toFixed(4)}
              </span>
            </label>
            <div className="join">
              <input
                type="number"
                placeholder="0.00"
                className="input input-bordered join-item flex-1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                step="0.01"
                min="0"
              />
              <button
                className="btn join-item"
                onClick={() => setAmount(fisher.mateBalanceFormatted)}
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

          {/* Advanced Options */}
          <div className="collapse collapse-arrow bg-base-200">
            <input
              type="checkbox"
              checked={showAdvanced}
              onChange={(e) => setShowAdvanced(e.target.checked)}
            />
            <div className="collapse-title font-medium">Advanced Options</div>
            <div className="collapse-content">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-bold">Staking Nonce:</span>{' '}
                  {fisher.stakingNonce?.toString() || 'Loading...'}
                </div>
                <div>
                  <span className="font-bold">EVVM Nonce:</span>{' '}
                  {fisher.evvmNonce?.toString() || 'Loading...'}
                </div>
                <div>
                  <span className="font-bold">Signature:</span>{' '}
                  {fisher.signature ? `${fisher.signature.slice(0, 10)}...` : 'Not signed'}
                </div>
              </div>
            </div>
          </div>

          {/* Stake Button */}
          <button
            className="btn btn-primary w-full"
            onClick={handleStake}
            disabled={
              !amount ||
              parseFloat(amount) <= 0 ||
              fisher.isSigning ||
              fisher.isExecuting ||
              fisher.isConfirming ||
              !fisher.publicStakingAllowed ||
              fisher.isLoadingStakingNonce ||
              fisher.isLoadingEvvmNonce
            }
          >
            {fisher.isSigning ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Signing...
              </>
            ) : fisher.isExecuting || fisher.isConfirming ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                {fisher.isExecuting ? 'Staking...' : 'Confirming...'}
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
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Stake MATE
              </>
            )}
          </button>

          {/* Unstake Button */}
          {parseFloat(fisher.stakedFormatted) > 0 && (
            <button
              className="btn btn-outline btn-error w-full"
              onClick={handleUnstake}
              disabled={
                !amount ||
                parseFloat(amount) <= 0 ||
                fisher.isSigning ||
                fisher.isExecuting ||
                fisher.isConfirming
              }
            >
              Unstake MATE (21-day cooldown)
            </button>
          )}
        </div>

        {/* Success Message */}
        {fisher.isSuccess && (
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
              <span className="font-bold">Staking successful!</span>
              {fisher.hash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${fisher.hash}`}
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

        {/* Error Message */}
        {(fisher.signError || fisher.executeError) && (
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
              <span className="text-xs">
                {fisher.signError?.message || fisher.executeError?.message}
              </span>
            </div>
          </div>
        )}

        {/* Contract Info */}
        <div className="divider">Contract Info</div>
        <div className="grid grid-cols-1 gap-2 text-xs">
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
            <span className="font-bold">Network:</span>{' '}
            <span>Ethereum Sepolia Testnet</span>
          </div>
        </div>
      </div>
    </div>
  );
};
