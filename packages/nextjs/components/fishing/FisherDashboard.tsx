"use client";

import { useFisherStats } from '~~/hooks/fishing/useFisherStats';
import { useAccount } from 'wagmi';

export const FisherDashboard = () => {
  const { address, isConnected } = useAccount();
  const { stats, recentExecutions, successRate, isProfitable, isLoading, clearStats } = useFisherStats();

  if (!isConnected) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Fisher Dashboard</h2>
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
            <span>Connect your wallet to view fisher statistics</span>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl">Fisher Dashboard</h2>
          <div className="flex justify-center p-8">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <div className="flex justify-between items-center mb-4">
          <h2 className="card-title text-2xl">📊 Fisher Dashboard</h2>
          {stats.totalExecutions > 0 && (
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                if (confirm('Are you sure you want to clear all statistics?')) {
                  clearStats();
                }
              }}
            >
              Clear Stats
            </button>
          )}
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Executions */}
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="stat-title">Total Executions</div>
            <div className="stat-value text-primary">{stats.totalExecutions}</div>
            <div className="stat-desc">
              {stats.successfulExecutions} successful, {stats.failedExecutions} failed
            </div>
          </div>

          {/* Success Rate */}
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-success">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-title">Success Rate</div>
            <div className="stat-value text-success">{successRate}%</div>
            <div className="stat-desc">
              {stats.totalExecutions > 0 ? 'Execution accuracy' : 'No data yet'}
            </div>
          </div>

          {/* Total MATE Earned */}
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-figure text-warning">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="stat-title">MATE Earned</div>
            <div className="stat-value text-warning">
              {parseFloat(stats.totalMateEarned).toFixed(4)}
            </div>
            <div className="stat-desc">Priority fees + rewards</div>
          </div>

          {/* Profitability */}
          <div className="stat bg-base-200 rounded-lg">
            <div className={`stat-figure ${isProfitable ? 'text-success' : 'text-error'}`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={
                    isProfitable
                      ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                      : 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6'
                  }
                />
              </svg>
            </div>
            <div className="stat-title">Profit/Loss</div>
            <div className={`stat-value ${isProfitable ? 'text-success' : 'text-error'}`}>
              {isProfitable ? '+' : ''}
              {parseFloat(stats.totalProfit).toFixed(4)}
            </div>
            <div className="stat-desc">
              Gas: {parseFloat(stats.totalGasSpent).toFixed(6)} ETH
            </div>
          </div>
        </div>

        {/* Info Alert */}
        {stats.totalExecutions === 0 && (
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
              <p className="font-bold mb-2">How to start fishing:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Stake MATE tokens above to become a fisher</li>
                <li>Set up fisher bot with your private key (backend)</li>
                <li>Run the fisher bot to start monitoring mempool</li>
                <li>Bot will execute payments and earn rewards automatically</li>
              </ol>
            </div>
          </div>
        )}

        {/* Recent Executions */}
        {recentExecutions.length > 0 && (
          <>
            <div className="divider">Recent Executions</div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Amount</th>
                    <th>Fee Earned</th>
                    <th>Gas Cost</th>
                    <th>Profit</th>
                    <th>Status</th>
                    <th>Tx</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExecutions.map((exec, index) => (
                    <tr key={index}>
                      <td className="text-xs">
                        {new Date(exec.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="text-xs font-mono">
                        {exec.from.slice(0, 6)}...{exec.from.slice(-4)}
                      </td>
                      <td className="text-xs font-mono">
                        {exec.to.slice(0, 6)}...{exec.to.slice(-4)}
                      </td>
                      <td className="text-xs">{parseFloat(exec.amount).toFixed(2)} MATE</td>
                      <td className="text-xs text-success">
                        +{parseFloat(exec.priorityFee).toFixed(4)} MATE
                      </td>
                      <td className="text-xs text-error">
                        -{parseFloat(exec.gasUsed).toFixed(6)} ETH
                      </td>
                      <td
                        className={`text-xs ${
                          parseFloat(exec.profit) > 0 ? 'text-success' : 'text-error'
                        }`}
                      >
                        {parseFloat(exec.profit) > 0 ? '+' : ''}
                        {parseFloat(exec.profit).toFixed(4)}
                      </td>
                      <td>
                        {exec.success ? (
                          <span className="badge badge-success badge-sm">Success</span>
                        ) : (
                          <span className="badge badge-error badge-sm">Failed</span>
                        )}
                      </td>
                      <td>
                        <a
                          href={`https://sepolia.etherscan.io/tx/${exec.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link link-primary text-xs"
                        >
                          View →
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Fisher Bot Instructions */}
        <div className="divider">Fisher Bot Setup</div>
        <div className="alert">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-info shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div className="text-sm">
            <p className="font-bold mb-2">To run the fisher bot:</p>
            <div className="mockup-code text-xs mt-2">
              <pre data-prefix="$">
                <code>cd packages/nextjs</code>
              </pre>
              <pre data-prefix="$">
                <code>cp .env.example .env</code>
              </pre>
              <pre data-prefix="$">
                <code># Add FISHER_PRIVATE_KEY to .env</code>
              </pre>
              <pre data-prefix="$">
                <code>yarn fisher:start</code>
              </pre>
            </div>
            <p className="mt-2 text-xs opacity-70">
              Note: Fisher bot runs as a backend service. Make sure you have staked MATE and your
              wallet is funded with Sepolia ETH for gas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
