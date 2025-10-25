#!/usr/bin/env tsx

/**
 * EVVM Fisher Bot
 * Monitors mempool for payment signatures and executes them
 */

import { createPublicClient, createWalletClient, http, webSocket, parseAbiItem, decodeAbiParameters } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';
import { validatePaymentSignature } from './signature-validator';
import { isNonceValid } from './nonce-manager';
import type { PaymentData, FisherStats, ExecutionResult } from './types';

// Load environment variables
dotenv.config();

// Contract addresses
const EVVM_ADDRESS = '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e' as const;
const STAKING_ADDRESS = '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816' as const;
const MATE_TOKEN = '0x0000000000000000000000000000000000000001' as const;

// EVVM ABI
const EVVM_ABI = [
  {
    name: 'pay',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'from', type: 'address' },
      { name: 'to_address', type: 'address' },
      { name: 'to_identity', type: 'string' },
      { name: 'token', type: 'address' },
      { name: 'amount', type: 'uint256' },
      { name: 'priorityFee', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'priorityFlag', type: 'bool' },
      { name: 'executor', type: 'address' },
      { name: 'signature', type: 'bytes' },
    ],
    outputs: [],
  },
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

// Staking contract ABI
const STAKING_ABI = [
  {
    name: 'getGoldenFisher',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }],
  },
] as const;

// Fisher bot class
class FisherBot {
  private account: ReturnType<typeof privateKeyToAccount>;
  private publicClient: ReturnType<typeof createPublicClient>;
  private walletClient: ReturnType<typeof createWalletClient>;
  private stats: FisherStats;
  private minPriorityFee: bigint;
  private gasLimit: number;
  private rpcUrl: string;
  private wsUrl: string;
  private processingTxs: Set<string> = new Set();

  constructor() {
    // Validate environment
    const privateKey = process.env.FISHER_PRIVATE_KEY;
    if (!privateKey || !privateKey.startsWith('0x')) {
      throw new Error('FISHER_PRIVATE_KEY not configured in .env');
    }

    this.rpcUrl = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org';
    this.wsUrl =
      process.env.FISHER_WS_URL ||
      this.rpcUrl.replace('https://', 'wss://').replace('http://', 'ws://');

    this.account = privateKeyToAccount(privateKey as `0x${string}`);
    this.minPriorityFee = BigInt(process.env.FISHER_MIN_PRIORITY_FEE || '0');
    this.gasLimit = Number(process.env.FISHER_GAS_LIMIT || 500000);

    // Create clients
    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(this.rpcUrl),
    });

    this.walletClient = createWalletClient({
      account: this.account,
      chain: sepolia,
      transport: http(this.rpcUrl),
    });

    // Initialize stats
    this.stats = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalMateEarned: 0n,
      totalGasSpent: 0n,
      startTime: Date.now(),
      lastExecution: null,
    };
  }

  /**
   * Start the fisher bot
   */
  async start() {
    console.log('🎣 Fisher Bot Starting...');
    console.log('===============================================');
    console.log('Fisher address:', this.account.address);
    console.log('Network:', 'Ethereum Sepolia Testnet');
    console.log('EVVM contract:', EVVM_ADDRESS);
    console.log('Staking contract:', STAKING_ADDRESS);
    console.log('Min priority fee:', this.minPriorityFee.toString(), 'wei');
    console.log('Gas limit:', this.gasLimit);
    console.log('===============================================\n');

    // Check if fisher is the golden fisher
    const isGoldenFisher = await this.checkGoldenFisher();

    if (isGoldenFisher) {
      console.log('👑 GOLDEN FISHER MODE ACTIVATED');
      console.log('✨ VIP privileges:');
      console.log('   - Instant staking (no signatures required)');
      console.log('   - No nonce verification');
      console.log('   - Priority transaction processing');
      console.log('   - Exclusive golden fisher rewards\n');
    }

    // Check if fisher is a staker (required even for golden fisher)
    const isStaker = await this.checkStakerStatus();
    if (!isStaker && !isGoldenFisher) {
      console.error('❌ ERROR: Fisher wallet is not a staker!');
      console.error('Please stake MATE tokens first at /fishing');
      process.exit(1);
    }

    if (isStaker) {
      console.log('✓ Staker status: Active');
    } else if (isGoldenFisher) {
      console.log('⚠️  Note: Golden fisher not yet staked');
      console.log('   Visit /fishing to stake using golden privileges\n');
    }

    console.log('✓ Fisher bot ready\n');

    // Start monitoring mempool
    await this.monitorMempool();
  }

  /**
   * Check if fisher wallet is the golden fisher
   */
  async checkGoldenFisher(): Promise<boolean> {
    try {
      const goldenFisherAddress = await this.publicClient.readContract({
        address: STAKING_ADDRESS,
        abi: STAKING_ABI,
        functionName: 'getGoldenFisher',
      });

      return (goldenFisherAddress as string).toLowerCase() === this.account.address.toLowerCase();
    } catch (error) {
      console.error('Error checking golden fisher status:', error);
      return false;
    }
  }

  /**
   * Check if fisher wallet is a staker
   */
  async checkStakerStatus(): Promise<boolean> {
    try {
      const isStaker = await this.publicClient.readContract({
        address: EVVM_ADDRESS,
        abi: EVVM_ABI,
        functionName: 'isAddressStaker',
        args: [this.account.address],
      });

      return isStaker as boolean;
    } catch (error) {
      console.error('Error checking staker status:', error);
      return false;
    }
  }

  /**
   * Monitor mempool for pending EVVM pay() transactions
   */
  async monitorMempool() {
    console.log('👀 Monitoring mempool for payment signatures...\n');

    try {
      // Use WebSocket for real-time mempool monitoring
      const wsClient = createPublicClient({
        chain: sepolia,
        transport: webSocket(this.wsUrl),
      });

      // Watch for pending transactions
      const unwatch = wsClient.watchPendingTransactions({
        onTransactions: async (hashes) => {
          for (const hash of hashes) {
            await this.handlePendingTransaction(hash);
          }
        },
      });

      // Keep bot running
      console.log('✓ Mempool monitoring active\n');

      // Handle graceful shutdown
      process.on('SIGINT', () => {
        console.log('\n\n🛑 Shutting down fisher bot...');
        unwatch();
        this.printStats();
        process.exit(0);
      });
    } catch (error) {
      console.error('❌ WebSocket connection failed:', error);
      console.log('\n⚠️  Falling back to HTTP polling...\n');

      // Fallback: poll for new blocks and check transactions
      await this.pollForTransactions();
    }
  }

  /**
   * Fallback: Poll for new transactions (less efficient)
   */
  async pollForTransactions() {
    let lastBlock = await this.publicClient.getBlockNumber();

    setInterval(async () => {
      try {
        const currentBlock = await this.publicClient.getBlockNumber();

        if (currentBlock > lastBlock) {
          // Check all transactions in new blocks
          for (let i = lastBlock + 1n; i <= currentBlock; i++) {
            const block = await this.publicClient.getBlock({ blockNumber: i, includeTransactions: true });

            for (const tx of block.transactions) {
              if (typeof tx === 'object' && 'hash' in tx) {
                await this.handlePendingTransaction(tx.hash);
              }
            }
          }

          lastBlock = currentBlock;
        }
      } catch (error) {
        console.error('Error polling transactions:', error);
      }
    }, 2000); // Poll every 2 seconds
  }

  /**
   * Handle a pending transaction
   */
  async handlePendingTransaction(txHash: `0x${string}`) {
    // Skip if already processing
    if (this.processingTxs.has(txHash)) {
      return;
    }

    this.processingTxs.add(txHash);

    try {
      // Get transaction details
      const tx = await this.publicClient.getTransaction({ hash: txHash });

      if (!tx) {
        return;
      }

      // Filter for EVVM contract
      if (tx.to?.toLowerCase() !== EVVM_ADDRESS.toLowerCase()) {
        return;
      }

      // Check if it's a pay() function call (selector: 0x8925c62c)
      if (!tx.input || !tx.input.startsWith('0x8925c62c')) {
        return;
      }

      console.log('📨 Detected payment transaction:', txHash);

      // Decode transaction data
      const paymentData = await this.decodePaymentData(tx.input);

      if (!paymentData) {
        console.log('⚠️  Failed to decode payment data\n');
        return;
      }

      // Validate and execute
      await this.validateAndExecute(paymentData);
    } catch (error) {
      console.error('Error handling pending transaction:', error);
    } finally {
      this.processingTxs.delete(txHash);
    }
  }

  /**
   * Decode pay() function data
   */
  async decodePaymentData(input: `0x${string}`): Promise<PaymentData | null> {
    try {
      // Remove function selector (first 4 bytes)
      const params = `0x${input.slice(10)}` as `0x${string}`;

      // Decode parameters
      const decoded = decodeAbiParameters(
        [
          { name: 'from', type: 'address' },
          { name: 'to_address', type: 'address' },
          { name: 'to_identity', type: 'string' },
          { name: 'token', type: 'address' },
          { name: 'amount', type: 'uint256' },
          { name: 'priorityFee', type: 'uint256' },
          { name: 'nonce', type: 'uint256' },
          { name: 'priorityFlag', type: 'bool' },
          { name: 'executor', type: 'address' },
          { name: 'signature', type: 'bytes' },
        ],
        params
      );

      return {
        from: decoded[0],
        to_address: decoded[1],
        to_identity: decoded[2],
        token: decoded[3],
        amount: decoded[4],
        priorityFee: decoded[5],
        nonce: decoded[6],
        priorityFlag: decoded[7],
        executor: decoded[8],
        signature: decoded[9] as `0x${string}`,
      };
    } catch (error) {
      console.error('Error decoding payment data:', error);
      return null;
    }
  }

  /**
   * Validate payment and execute if valid
   */
  async validateAndExecute(payment: PaymentData) {
    console.log('🔍 Validating payment...');
    console.log('  From:', payment.from);
    console.log('  To:', payment.to_address);
    console.log('  Amount:', (Number(payment.amount) / 1e18).toFixed(4), 'tokens');
    console.log('  Priority Fee:', (Number(payment.priorityFee) / 1e18).toFixed(4), 'MATE');

    // 1. Check priority fee meets minimum
    if (payment.priorityFee < this.minPriorityFee) {
      console.log('⚠️  Priority fee too low, skipping\n');
      return;
    }

    // 2. Validate signature
    const signatureValid = await validatePaymentSignature(payment);
    if (!signatureValid) {
      console.log('❌ Invalid signature, skipping\n');
      return;
    }

    // 3. Check nonce
    const nonceValid = await isNonceValid(
      payment.from,
      payment.nonce,
      payment.priorityFlag,
      this.rpcUrl
    );
    if (!nonceValid) {
      console.log('❌ Invalid nonce (already used or out of sequence), skipping\n');
      return;
    }

    // 4. Check sender has sufficient balance
    const balance = await this.publicClient.readContract({
      address: EVVM_ADDRESS,
      abi: EVVM_ABI,
      functionName: 'getBalance',
      args: [payment.from as `0x${string}`, payment.token as `0x${string}`],
    });

    if (balance < payment.amount + payment.priorityFee) {
      console.log('❌ Insufficient sender balance, skipping\n');
      return;
    }

    console.log('✓ All validations passed');

    // Execute!
    await this.executePayment(payment);
  }

  /**
   * Execute payment on-chain
   */
  async executePayment(payment: PaymentData): Promise<ExecutionResult> {
    console.log('🎣 Executing payment...');

    try {
      // Estimate gas first
      const gasEstimate = await this.publicClient.estimateContractGas({
        address: EVVM_ADDRESS,
        abi: EVVM_ABI,
        functionName: 'pay',
        args: [
          payment.from as `0x${string}`,
          payment.to_address as `0x${string}`,
          payment.to_identity,
          payment.token as `0x${string}`,
          payment.amount,
          payment.priorityFee,
          payment.nonce,
          payment.priorityFlag,
          payment.executor as `0x${string}`,
          payment.signature as `0x${string}`,
        ],
        account: this.account,
      });

      console.log('  Estimated gas:', gasEstimate.toString());

      // Send transaction
      const hash = await this.walletClient.writeContract({
        address: EVVM_ADDRESS,
        abi: EVVM_ABI,
        functionName: 'pay',
        args: [
          payment.from as `0x${string}`,
          payment.to_address as `0x${string}`,
          payment.to_identity,
          payment.token as `0x${string}`,
          payment.amount,
          payment.priorityFee,
          payment.nonce,
          payment.priorityFlag,
          payment.executor as `0x${string}`,
          payment.signature as `0x${string}`,
        ],
        gas: BigInt(this.gasLimit),
      });

      console.log('  Transaction sent:', hash);
      console.log('  Waiting for confirmation...');

      // Wait for confirmation
      const receipt = await this.publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        const gasUsed = receipt.gasUsed * receipt.effectiveGasPrice;

        console.log('✅ Payment executed successfully!');
        console.log('  Gas used:', (Number(gasUsed) / 1e18).toFixed(6), 'ETH');
        console.log('  Priority fee earned:', (Number(payment.priorityFee) / 1e18).toFixed(4), 'MATE');
        console.log('  View on Etherscan: https://sepolia.etherscan.io/tx/' + hash);
        console.log('');

        // Update stats
        this.stats.totalExecutions++;
        this.stats.successfulExecutions++;
        this.stats.totalMateEarned += payment.priorityFee;
        this.stats.totalGasSpent += gasUsed;
        this.stats.lastExecution = Date.now();

        return {
          success: true,
          txHash: hash,
          gasUsed,
          priorityFeeEarned: payment.priorityFee,
        };
      } else {
        console.log('❌ Transaction reverted\n');
        this.stats.totalExecutions++;
        this.stats.failedExecutions++;

        return {
          success: false,
          error: 'Transaction reverted',
        };
      }
    } catch (error: any) {
      console.error('❌ Execution failed:', error.message);
      console.log('');

      this.stats.totalExecutions++;
      this.stats.failedExecutions++;

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Print fisher statistics
   */
  printStats() {
    const uptime = Math.floor((Date.now() - this.stats.startTime) / 1000);
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;

    console.log('\n📊 Fisher Statistics');
    console.log('===============================================');
    console.log('Total Executions:', this.stats.totalExecutions);
    console.log('Successful:', this.stats.successfulExecutions);
    console.log('Failed:', this.stats.failedExecutions);
    console.log('Success Rate:', this.stats.totalExecutions > 0 ? ((this.stats.successfulExecutions / this.stats.totalExecutions) * 100).toFixed(2) + '%' : '0%');
    console.log('MATE Earned:', (Number(this.stats.totalMateEarned) / 1e18).toFixed(4), 'MATE');
    console.log('Gas Spent:', (Number(this.stats.totalGasSpent) / 1e18).toFixed(6), 'ETH');
    console.log('Uptime:', `${hours}h ${minutes}m ${seconds}s`);
    console.log('===============================================\n');
  }
}

// Main entry point
async function main() {
  // Check if enabled
  if (process.env.FISHER_ENABLED !== 'true') {
    console.log('⚠️  Fisher bot is disabled. Set FISHER_ENABLED=true in .env to enable.');
    process.exit(0);
  }

  try {
    const fisher = new FisherBot();
    await fisher.start();
  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { FisherBot };
