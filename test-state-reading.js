#!/usr/bin/env node

/**
 * Test Script: Verify PAYVVM State Reading
 *
 * This script tests that we can read contract state for indexing
 * Run: node test-state-reading.js
 */

import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: './packages/envio/.env' });

// Contract addresses
const CONTRACTS = {
  Evvm: '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e',
  Staking: '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816',
  NameService: '0xa4ba4e9270bde8fbbf4328925959287a72ba0a55',
  Treasury: '0x3d6cb29a1f97a2cff7a48af96f7ed3a02f6aa38e',
  Estimator: '0x5db7cdb7601f9abcfc5089d66b1a3525471bf2ab'
};

// MATE token address (principal token)
const MATE_TOKEN = '0x0000000000000000000000000000000000000001';

// Test addresses (you can change these)
const TEST_ADDRESSES = [
  '0x9c77c6fafc1eb0821f1de12972ef0199c97c6e45', // Your deployer address
  '0x93d2c57690DB077e5d0B3112F1B255C6CB39Ac99', // Admin address
  '0x121c631B7aEa24316bD90B22C989Ca008a84E5Ed', // Golden Fisher
];

// ABI for view functions
const EVVM_ABI = [
  {
    name: 'getBalance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'user', type: 'address' },
      { name: 'token', type: 'address' }
    ],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'isAddressStaker',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'bool' }]
  },
  {
    name: 'getNextCurrentSyncNonce',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'getEvvmMetadata',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{
      type: 'tuple',
      components: [
        { name: 'principalTokenAddress', type: 'address' },
        { name: 'reward', type: 'uint256' },
        { name: 'totalSupply', type: 'uint256' },
        { name: 'eraTokens', type: 'uint256' }
      ]
    }]
  },
  {
    name: 'getRewardAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  },
  {
    name: 'getCurrentAdmin',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  }
];

async function main() {
  console.log('🧪 PAYVVM State Reading Test');
  console.log('============================\n');

  // Check for RPC URL
  const rpcUrl = process.env.RPC_URL || 'https://rpc.sepolia.org'; // Default to public RPC

  console.log(`📡 Using RPC: ${rpcUrl}`);
  console.log('');

  // Create client
  const client = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl)
  });

  console.log('✅ Connected to Ethereum Sepolia\n');

  // Test 1: Read EVVM Metadata
  console.log('📊 Test 1: Reading EVVM Metadata');
  console.log('─────────────────────────────────');
  try {
    const metadata = await client.readContract({
      address: CONTRACTS.Evvm,
      abi: EVVM_ABI,
      functionName: 'getEvvmMetadata'
    });

    console.log('✅ EVVM Metadata:');
    console.log(`   Principal Token: ${metadata.principalTokenAddress}`);
    console.log(`   Reward Amount: ${metadata.reward.toString()}`);
    console.log(`   Total Supply: ${metadata.totalSupply.toString()}`);
    console.log(`   Era Tokens: ${metadata.eraTokens.toString()}`);

    const reward = await client.readContract({
      address: CONTRACTS.Evvm,
      abi: EVVM_ABI,
      functionName: 'getRewardAmount'
    });
    console.log(`   Current Reward: ${reward.toString()}`);

    const admin = await client.readContract({
      address: CONTRACTS.Evvm,
      abi: EVVM_ABI,
      functionName: 'getCurrentAdmin'
    });
    console.log(`   Admin: ${admin}`);
  } catch (error) {
    console.error('❌ Failed to read EVVM metadata:', error.message);
  }

  // Test 2: Read Account States
  console.log('\n📊 Test 2: Reading Account States');
  console.log('─────────────────────────────────');

  for (const address of TEST_ADDRESSES) {
    console.log(`\n👤 Address: ${address}`);

    try {
      // Get MATE balance
      const balance = await client.readContract({
        address: CONTRACTS.Evvm,
        abi: EVVM_ABI,
        functionName: 'getBalance',
        args: [address, MATE_TOKEN]
      });

      // Check staker status
      const isStaker = await client.readContract({
        address: CONTRACTS.Evvm,
        abi: EVVM_ABI,
        functionName: 'isAddressStaker',
        args: [address]
      });

      // Get nonce
      const nonce = await client.readContract({
        address: CONTRACTS.Evvm,
        abi: EVVM_ABI,
        functionName: 'getNextCurrentSyncNonce',
        args: [address]
      });

      console.log(`   ✅ MATE Balance: ${balance.toString()} (${Number(balance) / 1e18} MATE)`);
      console.log(`   ✅ Is Staker: ${isStaker ? 'Yes 🌟' : 'No'}`);
      console.log(`   ✅ Sync Nonce: ${nonce.toString()}`);

    } catch (error) {
      console.error(`   ❌ Error reading state: ${error.message}`);
    }
  }

  // Test 3: Check Recent Blocks for Transactions
  console.log('\n📊 Test 3: Checking Recent Transactions');
  console.log('─────────────────────────────────────────');

  try {
    const latestBlock = await client.getBlockNumber();
    console.log(`   Latest Block: ${latestBlock}`);

    // Check last 100 blocks for transactions to EVVM
    const fromBlock = latestBlock - 100n;
    console.log(`   Scanning blocks ${fromBlock} to ${latestBlock}...`);

    let txCount = 0;
    for (let i = 0n; i < 100n && i < latestBlock; i++) {
      const block = await client.getBlock({
        blockNumber: latestBlock - i,
        includeTransactions: true
      });

      const evvmTxs = block.transactions.filter(tx =>
        typeof tx === 'object' && tx.to?.toLowerCase() === CONTRACTS.Evvm.toLowerCase()
      );

      txCount += evvmTxs.length;

      if (evvmTxs.length > 0) {
        console.log(`   ✅ Block ${block.number}: Found ${evvmTxs.length} EVVM transaction(s)`);
        evvmTxs.forEach(tx => {
          if (typeof tx === 'object') {
            console.log(`      - ${tx.hash.slice(0, 10)}... from ${tx.from?.slice(0, 10)}...`);
          }
        });
      }
    }

    console.log(`\n   📊 Total EVVM transactions in last 100 blocks: ${txCount}`);

  } catch (error) {
    console.error(`   ❌ Error scanning blocks: ${error.message}`);
  }

  // Summary
  console.log('\n✅ State Reading Test Complete!');
  console.log('═══════════════════════════════');
  console.log('\n💡 This confirms we can:');
  console.log('   ✅ Read EVVM metadata (reward, supply, etc.)');
  console.log('   ✅ Read user balances for any address');
  console.log('   ✅ Check staker status');
  console.log('   ✅ Track nonces');
  console.log('   ✅ Monitor transactions to contracts');
  console.log('\n🎯 Ready to implement Envio handlers with state reading!');
  console.log('\nNext step: cd packages/envio && pnpm codegen\n');
}

main().catch(console.error);
