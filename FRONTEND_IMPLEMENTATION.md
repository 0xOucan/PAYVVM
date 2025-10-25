# Frontend Implementation - PAYVVM Explorer Without Envio

## ✅ Good News!

State reading works perfectly! The test proves we can:
- ✅ Read EVVM metadata (reward, supply, admin)
- ✅ Read user balances (you have 26,533.125 MATE!)
- ✅ Check staker status
- ✅ Track nonces
- ✅ Query any contract state

## 🎯 The Strategy: Direct Contract Calls

Since PAYVVM contracts don't emit events, we'll skip Envio and query contracts directly from the frontend using React hooks. This is actually a very common pattern and works great!

## 🏗️ Architecture

```
Frontend (Next.js + React)
    ↓
wagmi/viem hooks
    ↓
RPC Provider (publicnode.com)
    ↓
EVVM Contracts (Sepolia)
```

## 📦 Step 1: Create Contract Hooks

Create `/packages/nextjs/hooks/payvvm/useEvvmState.ts`:

```typescript
import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';

// EVVM ABI - Add only the view functions we need
const EVVM_ABI = [
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
    name: 'getCurrentAdmin',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'address' }]
  },
  {
    name: 'getRewardAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }]
  }
] as const;

const EVVM_ADDRESS = '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e';
const MATE_TOKEN = '0x0000000000000000000000000000000000000001';

// Hook to get EVVM metadata
export function useEvvmMetadata() {
  return useReadContract({
    address: EVVM_ADDRESS,
    abi: EVVM_ABI,
    functionName: 'getEvvmMetadata',
  });
}

// Hook to get user account state
export function useUserAccount(address?: `0x${string}`) {
  return useReadContracts({
    contracts: [
      {
        address: EVVM_ADDRESS,
        abi: EVVM_ABI,
        functionName: 'getBalance',
        args: address ? [address, MATE_TOKEN] : undefined,
      },
      {
        address: EVVM_ADDRESS,
        abi: EVVM_ABI,
        functionName: 'isAddressStaker',
        args: address ? [address] : undefined,
      },
      {
        address: EVVM_ADDRESS,
        abi: EVVM_ABI,
        functionName: 'getNextCurrentSyncNonce',
        args: address ? [address] : undefined,
      }
    ],
    query: {
      enabled: !!address,
    }
  });
}

// Hook to get current reward
export function useCurrentReward() {
  return useReadContract({
    address: EVVM_ADDRESS,
    abi: EVVM_ABI,
    functionName: 'getRewardAmount',
  });
}

// Hook to get admin address
export function useEvvmAdmin() {
  return useReadContract({
    address: EVVM_ADDRESS,
    abi: EVVM_ABI,
    functionName: 'getCurrentAdmin',
  });
}
```

## 📊 Step 2: Create Dashboard Components

Create `/packages/nextjs/components/payvvm/EvvmDashboard.tsx`:

```typescript
import { useEvvmMetadata, useCurrentReward, useEvvmAdmin } from '~~/hooks/payvvm/useEvvmState';
import { formatEther } from 'viem';

export const EvvmDashboard = () => {
  const { data: metadata, isLoading: metadataLoading } = useEvvmMetadata();
  const { data: reward } = useCurrentReward();
  const { data: admin } = useEvvmAdmin();

  if (metadataLoading) {
    return <div className="animate-pulse">Loading EVVM state...</div>;
  }

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">EVVM System Status</h2>

        <div className="stats stats-vertical lg:stats-horizontal shadow">
          <div className="stat">
            <div className="stat-title">Total Supply</div>
            <div className="stat-value text-primary">{metadata?.totalSupply.toString()}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Era Tokens</div>
            <div className="stat-value text-secondary">{metadata?.eraTokens.toString()}</div>
          </div>

          <div className="stat">
            <div className="stat-title">Current Reward</div>
            <div className="stat-value text-accent">
              {reward ? formatEther(reward) : '0'} MATE
            </div>
          </div>
        </div>

        <div className="divider"></div>

        <div className="space-y-2">
          <p><strong>Principal Token:</strong> {metadata?.principalTokenAddress}</p>
          <p><strong>Admin:</strong> {admin}</p>
        </div>
      </div>
    </div>
  );
};
```

Create `/packages/nextjs/components/payvvm/AccountViewer.tsx`:

```typescript
import { useAccount } from 'wagmi';
import { useUserAccount } from '~~/hooks/payvvm/useEvvmState';
import { formatEther } from 'viem';

export const AccountViewer = ({ address }: { address?: `0x${string}` }) => {
  const { address: connectedAddress } = useAccount();
  const targetAddress = address || connectedAddress;

  const { data, isLoading, refetch } = useUserAccount(targetAddress);

  if (!targetAddress) {
    return (
      <div className="alert alert-info">
        <span>Connect your wallet to view account state</span>
      </div>
    );
  }

  if (isLoading) {
    return <div className="animate-pulse">Loading account state...</div>;
  }

  const [balance, isStaker, nonce] = data || [];

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Account State</h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm opacity-70">Address</p>
            <p className="font-mono">{targetAddress}</p>
          </div>

          <div>
            <p className="text-sm opacity-70">MATE Balance</p>
            <p className="text-2xl font-bold">
              {balance?.result ? formatEther(balance.result) : '0'} MATE
            </p>
          </div>

          <div className="flex gap-4">
            <div>
              <p className="text-sm opacity-70">Staker Status</p>
              <div className={`badge ${isStaker?.result ? 'badge-success' : 'badge-ghost'}`}>
                {isStaker?.result ? '✓ Staker' : '✗ Not Staker'}
              </div>
            </div>

            <div>
              <p className="text-sm opacity-70">Sync Nonce</p>
              <p className="font-mono">{nonce?.result?.toString() || '0'}</p>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => refetch()}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};
```

## 🎨 Step 3: Create Explorer Page

Create `/packages/nextjs/app/payvvm/page.tsx`:

```typescript
"use client";

import { EvvmDashboard } from "~~/components/payvvm/EvvmDashboard";
import { AccountViewer } from "~~/components/payvvm/AccountViewer";
import { useState } from "react";

export default function PayvvmExplorerPage() {
  const [searchAddress, setSearchAddress] = useState<`0x${string}` | undefined>();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">PAYVVM Explorer</h1>

      {/* EVVM System Dashboard */}
      <div className="mb-8">
        <EvvmDashboard />
      </div>

      {/* Account Search */}
      <div className="mb-8">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Search Account</span>
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="0x..."
              className="input input-bordered flex-1"
              onChange={(e) => {
                const value = e.target.value;
                if (value.startsWith('0x') && value.length === 42) {
                  setSearchAddress(value as `0x${string}`);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Account Viewer */}
      <div>
        <AccountViewer address={searchAddress} />
      </div>
    </div>
  );
}
```

## 🚀 Step 4: Start the Frontend

```bash
cd /home/oucan/PayVVM/envioftpayvvm

# Make sure .env.local is set up
cp packages/nextjs/.env.example packages/nextjs/.env.local
# Edit .env.local and add your WalletConnect project ID

# Start the development server
yarn start
```

Visit: http://localhost:3000/payvvm

## 📈 What You Get

✅ **Real-time data** - Always shows current contract state
✅ **No indexer needed** - Direct RPC calls
✅ **Wallet integration** - See your own account automatically
✅ **Account search** - Look up any address
✅ **Fast development** - No Envio configuration issues

## 🔄 Adding Transaction History (Optional)

For transaction history, you have options:

### Option A: Use Etherscan API
```typescript
// Free API, 5 calls/second
const txs = await fetch(
  `https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${EVVM_ADDRESS}`
);
```

### Option B: Use Block Scanning
```typescript
// Scan recent blocks for EVVM transactions
const latestBlock = await publicClient.getBlockNumber();
const blocks = await Promise.all(
  Array.from({ length: 100 }, (_, i) =>
    publicClient.getBlock({ blockNumber: latestBlock - BigInt(i) })
  )
);
const evvmTxs = blocks.flatMap(block =>
  block.transactions.filter(tx => tx.to === EVVM_ADDRESS)
);
```

### Option C: Custom Indexer
Build a simple Node.js service that:
1. Watches for new blocks
2. Scans transactions to EVVM contracts
3. Reads state after each transaction
4. Stores in PostgreSQL
5. Exposes GraphQL API

(We can build this if needed - I have the pattern ready!)

## 🎯 Next Steps

1. ✅ RPC working (publicnode.com)
2. ✅ State reading tested and working
3. 📝 Create the hooks and components above
4. 🚀 Start the frontend
5. 🎨 Build the UI components

This approach is simpler, works immediately, and is perfect for PAYVVM's event-less architecture!

## 💡 Why This Works

Traditional explorers:
```
Event Emitted → Indexer Captures → Database → GraphQL → Frontend
```

PAYVVM Explorer:
```
Frontend → RPC → Contract State → Display
```

Both work! PAYVVM's approach is actually more direct - we read the **actual current state** rather than reconstructing it from historical events.
