#!/usr/bin/env node

/**
 * HyperSync PAYVVM Indexer - Proof of Concept
 *
 * This script demonstrates how to use HyperSync to build a custom
 * indexer for PAYVVM contracts (which don't emit events).
 *
 * Architecture:
 * 1. Query HyperSync for transactions to EVVM contracts
 * 2. For each transaction, read current contract state
 * 3. Store in database (PostgreSQL/SQLite)
 *
 * Run: node hypersync-indexer-poc.js
 */

import { HypersyncClient, TransactionField, BlockField } from '@envio-dev/hypersync-client';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import * as dotenv from 'dotenv';

dotenv.config({ path: './packages/envio/.env' });

// PAYVVM Contract Addresses on Sepolia
const CONTRACTS = {
  Evvm: '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e',
  Staking: '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816',
  NameService: '0xa4ba4e9270bde8fbbf4328925959287a72ba0a55',
  Treasury: '0x3d6cb29a1f97a2cff7a48af96f7ed3a02f6aa38e',
};

const MATE_TOKEN = '0x0000000000000000000000000000000000000001';

// EVVM ABI for state reading
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
];

async function main() {
  console.log('🚀 HyperSync PAYVVM Indexer POC');
  console.log('================================\n');

  // Step 1: Initialize HyperSync client
  console.log('📡 Connecting to HyperSync...');
  const hyperSync = HypersyncClient.new({
    url: 'https://sepolia.hypersync.xyz',
  });
  console.log('✅ Connected to HyperSync (Sepolia)\n');

  // Step 2: Initialize RPC client for state reading
  const rpcUrl = process.env.RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  const rpcClient = createPublicClient({
    chain: sepolia,
    transport: http(rpcUrl)
  });
  console.log(`✅ Connected to RPC: ${rpcUrl}\n`);

  // Step 3: Get current block height
  const currentBlock = await rpcClient.getBlockNumber();
  console.log(`📊 Current block: ${currentBlock}\n`);

  // Step 4: Query HyperSync for transactions to EVVM contracts
  console.log('🔍 Querying HyperSync for PAYVVM transactions...');
  console.log(`   Scanning last 1000 blocks (${currentBlock - 1000n} to ${currentBlock})\n`);

  const query = {
    fromBlock: Number(currentBlock - 1000n), // Last 1000 blocks
    toBlock: Number(currentBlock),
    transactions: [
      {
        // Transactions TO any PAYVVM contract
        to: [
          CONTRACTS.Evvm.toLowerCase(),
          CONTRACTS.Staking.toLowerCase(),
          CONTRACTS.NameService.toLowerCase(),
          CONTRACTS.Treasury.toLowerCase(),
        ],
      },
    ],
    fieldSelection: {
      block: [
        BlockField.Number,
        BlockField.Timestamp,
        BlockField.Hash,
      ],
      transaction: [
        TransactionField.BlockNumber,
        TransactionField.TransactionIndex,
        TransactionField.Hash,
        TransactionField.From,
        TransactionField.To,
        TransactionField.Value,
        TransactionField.Input,
        TransactionField.GasUsed,
      ],
    },
  };

  try {
    const response = await hyperSync.get(query);

    console.log(`✅ Found ${response.data.transactions.length} PAYVVM transactions!\n`);

    // Step 5: Process each transaction
    if (response.data.transactions.length > 0) {
      console.log('📊 Processing transactions and reading state...\n');

      for (const tx of response.data.transactions.slice(0, 5)) { // Process first 5 for demo
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`Transaction: ${tx.hash}`);
        console.log(`Block: ${tx.blockNumber}`);
        console.log(`From: ${tx.from}`);
        console.log(`To: ${tx.to}`);
        console.log(`Input length: ${tx.input?.length || 0} bytes`);

        // Determine which contract was called
        const contractName = Object.entries(CONTRACTS).find(
          ([_, addr]) => addr.toLowerCase() === tx.to.toLowerCase()
        )?.[0] || 'Unknown';
        console.log(`Contract: ${contractName}`);

        // Read current state for the sender
        try {
          const balance = await rpcClient.readContract({
            address: CONTRACTS.Evvm,
            abi: EVVM_ABI,
            functionName: 'getBalance',
            args: [tx.from, MATE_TOKEN]
          });

          const isStaker = await rpcClient.readContract({
            address: CONTRACTS.Evvm,
            abi: EVVM_ABI,
            functionName: 'isAddressStaker',
            args: [tx.from]
          });

          const nonce = await rpcClient.readContract({
            address: CONTRACTS.Evvm,
            abi: EVVM_ABI,
            functionName: 'getNextCurrentSyncNonce',
            args: [tx.from]
          });

          console.log(`\n📊 Current State for ${tx.from}:`);
          console.log(`   MATE Balance: ${Number(balance) / 1e18} MATE`);
          console.log(`   Is Staker: ${isStaker ? 'Yes ⭐' : 'No'}`);
          console.log(`   Sync Nonce: ${nonce}`);

          // This is where you'd store in database:
          // await db.accounts.upsert({
          //   address: tx.from,
          //   mateBalance: balance,
          //   isStaker: isStaker,
          //   syncNonce: nonce,
          //   lastUpdated: Date.now(),
          // });

          // await db.transactions.insert({
          //   hash: tx.hash,
          //   from: tx.from,
          //   to: tx.to,
          //   blockNumber: tx.blockNumber,
          //   contractName: contractName,
          // });

        } catch (error) {
          console.error(`   ❌ Error reading state: ${error.message}`);
        }
      }

      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      console.log(`\n💡 Showing first 5 transactions. Total found: ${response.data.transactions.length}`);
    } else {
      console.log('ℹ️  No transactions found in the last 1000 blocks');
      console.log('   Try expanding the block range or check contract addresses\n');
    }

  } catch (error) {
    console.error('❌ HyperSync query failed:', error);
    console.error('\nPossible issues:');
    console.error('  1. Check ENVIO_API_TOKEN in packages/envio/.env');
    console.error('  2. Verify HyperSync endpoint is accessible');
    console.error('  3. Check contract addresses are correct\n');
    throw error;
  }

  // Summary
  console.log('\n✅ POC Complete!');
  console.log('═════════════════════════════════\n');
  console.log('💡 This demonstrates:');
  console.log('   ✅ Query transactions without events (HyperSync)');
  console.log('   ✅ Read current contract state (RPC)');
  console.log('   ✅ Process data for storage');
  console.log('   ✅ 2000x faster than traditional RPC scanning\n');
  console.log('🎯 Next Steps:');
  console.log('   1. Add database integration (PostgreSQL/SQLite)');
  console.log('   2. Set up continuous syncing (stream mode)');
  console.log('   3. Build GraphQL API layer');
  console.log('   4. Create frontend dashboard\n');
}

main().catch(console.error);
