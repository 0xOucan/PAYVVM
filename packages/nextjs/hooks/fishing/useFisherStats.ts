/**
 * Custom hook for tracking fisher statistics and earnings
 * Monitors fisher bot performance and profitability
 */

import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';

export interface FisherExecution {
  txHash: string;
  timestamp: number;
  from: string;
  to: string;
  amount: string;
  priorityFee: string;
  gasUsed: string;
  gasPrice: string;
  profit: string;
  success: boolean;
}

export interface FisherStats {
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  totalMateEarned: string;
  totalGasSpent: string;
  totalProfit: string;
  averageExecutionTime: number;
  uptime: number;
  lastExecution: number | null;
}

/**
 * Hook for fisher statistics
 * In production, this would connect to a backend API or database
 * For now, we'll use localStorage for demo purposes
 */
export function useFisherStats() {
  const { address } = useAccount();
  const [stats, setStats] = useState<FisherStats>({
    totalExecutions: 0,
    successfulExecutions: 0,
    failedExecutions: 0,
    totalMateEarned: '0',
    totalGasSpent: '0',
    totalProfit: '0',
    averageExecutionTime: 0,
    uptime: 0,
    lastExecution: null,
  });

  const [recentExecutions, setRecentExecutions] = useState<FisherExecution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load stats from localStorage on mount
  useEffect(() => {
    if (!address) {
      setIsLoading(false);
      return;
    }

    try {
      const savedStats = localStorage.getItem(`fisher_stats_${address}`);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }

      const savedExecutions = localStorage.getItem(`fisher_executions_${address}`);
      if (savedExecutions) {
        setRecentExecutions(JSON.parse(savedExecutions));
      }
    } catch (error) {
      console.error('Error loading fisher stats:', error);
    }

    setIsLoading(false);
  }, [address]);

  // Save stats to localStorage whenever they change
  useEffect(() => {
    if (!address) return;

    try {
      localStorage.setItem(`fisher_stats_${address}`, JSON.stringify(stats));
      localStorage.setItem(`fisher_executions_${address}`, JSON.stringify(recentExecutions));
    } catch (error) {
      console.error('Error saving fisher stats:', error);
    }
  }, [stats, recentExecutions, address]);

  /**
   * Add a new execution to stats
   */
  const addExecution = (execution: FisherExecution) => {
    setRecentExecutions(prev => [execution, ...prev].slice(0, 10)); // Keep last 10

    setStats(prev => {
      const totalExecutions = prev.totalExecutions + 1;
      const successfulExecutions = execution.success
        ? prev.successfulExecutions + 1
        : prev.successfulExecutions;
      const failedExecutions = execution.success
        ? prev.failedExecutions
        : prev.failedExecutions + 1;

      const mateEarned = parseFloat(prev.totalMateEarned) + parseFloat(execution.priorityFee);
      const gasSpent = parseFloat(prev.totalGasSpent) + parseFloat(execution.gasUsed);
      const profit = parseFloat(prev.totalProfit) + parseFloat(execution.profit);

      return {
        totalExecutions,
        successfulExecutions,
        failedExecutions,
        totalMateEarned: mateEarned.toString(),
        totalGasSpent: gasSpent.toString(),
        totalProfit: profit.toString(),
        averageExecutionTime: prev.averageExecutionTime, // TODO: Calculate
        uptime: prev.uptime, // TODO: Calculate
        lastExecution: execution.timestamp,
      };
    });
  };

  /**
   * Clear all stats (reset)
   */
  const clearStats = () => {
    setStats({
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalMateEarned: '0',
      totalGasSpent: '0',
      totalProfit: '0',
      averageExecutionTime: 0,
      uptime: 0,
      lastExecution: null,
    });
    setRecentExecutions([]);

    if (address) {
      localStorage.removeItem(`fisher_stats_${address}`);
      localStorage.removeItem(`fisher_executions_${address}`);
    }
  };

  /**
   * Calculate success rate
   */
  const successRate =
    stats.totalExecutions > 0
      ? ((stats.successfulExecutions / stats.totalExecutions) * 100).toFixed(2)
      : '0';

  /**
   * Check if fisher is profitable
   */
  const isProfitable = parseFloat(stats.totalProfit) > 0;

  return {
    // Stats
    stats,
    recentExecutions,
    successRate,
    isProfitable,

    // Status
    isLoading,

    // Actions
    addExecution,
    clearStats,
  };
}
