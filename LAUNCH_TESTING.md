# 🚀 Launch Testing - State-Based Indexing

## ✅ What We've Confirmed

**PAYVVM uses state-based architecture!** We can index by:
1. ✅ Tracking transactions to contracts (know WHEN state changed)
2. ✅ Reading contract state via view functions (know WHAT changed)
3. ✅ Storing snapshots in database (query FAST)

## 🎯 Perfect! Let's Launch Testing

### Step 1: Test State Reading (5 minutes)

First, verify we can read contract state:

```bash
cd /home/oucan/PayVVM/envioftpayvvm

# Install viem for testing
npm install viem dotenv

# Make sure you have .env set up
cd packages/envio
echo "ALCHEMY_API_KEY=your_key_here" > .env

# Go back to root
cd ../..

# Run the test
node test-state-reading.js
```

**Expected Output:**
```
🧪 PAYVVM State Reading Test
============================

✅ Connected to Ethereum Sepolia

📊 Test 1: Reading EVVM Metadata
─────────────────────────────────
✅ EVVM Metadata:
   Principal Token: 0x0000000000000000000000000000000000000001
   Reward Amount: 5000000000000000000
   Total Supply: 2033333333000000000000000000
   ...

📊 Test 2: Reading Account States
─────────────────────────────────
👤 Address: 0x9c77c...
   ✅ MATE Balance: 1000000000000000000 (1.0 MATE)
   ✅ Is Staker: Yes 🌟
   ✅ Sync Nonce: 5
...
```

### Step 2: Try Envio Codegen (2 minutes)

```bash
cd packages/envio

# Make sure .env exists with ALCHEMY_API_KEY
pnpm codegen
```

**Two possible outcomes:**

#### ✅ If Successful:
```
✓ Generated TypeScript types
✓ Created handler templates
✓ Database schema ready
```
→ **Continue to Step 3**

#### ❌ If Failed:
```
Error: Function-based indexing not supported
```
→ **This is OK!** We have alternatives:
- Option A: Use The Graph protocol
- Option B: Build custom indexer (we have the pattern ready)
- Option C: Use frontend with direct RPC (works great!)

### Step 3: Implement State-Reading Handlers (If Codegen Worked)

Edit `packages/envio/src/EventHandlers.ts`:

```typescript
import {
  Evvm,
  Account,
  Transaction,
  TokenBalance
} from "generated";

// Handler for payment transactions
Evvm.pay.handler(async ({ event, context }) => {
  const from = event.params.from;
  const to = event.params.to;
  const token = event.params.token;
  const amount = event.params.amount;

  // Read current state from blockchain
  const fromBalance = await context.Evvm.read.getBalance([from, token]);
  const fromIsStaker = await context.Evvm.read.isAddressStaker([from]);
  const fromNonce = await context.Evvm.read.getNextCurrentSyncNonce([from]);

  // Update sender account
  await context.Account.set({
    id: from.toLowerCase(),
    address: from,
    isStaker: fromIsStaker,
    lastSeenBlock: event.block.number,
    // ... other fields
  });

  // Update token balance
  await context.TokenBalance.set({
    id: `${from}-${token}`,
    accountId: from,
    token: token,
    balance: fromBalance,
    lastUpdated: event.block.timestamp,
  });

  // Do same for recipient (to)
  const toBalance = await context.Evvm.read.getBalance([to, token]);
  const toIsStaker = await context.Evvm.read.isAddressStaker([to]);

  await context.Account.set({
    id: to.toLowerCase(),
    address: to,
    isStaker: toIsStaker,
    lastSeenBlock: event.block.number,
  });

  await context.TokenBalance.set({
    id: `${to}-${token}`,
    accountId: to,
    token: token,
    balance: toBalance,
    lastUpdated: event.block.timestamp,
  });

  // Create transaction record
  await context.Transaction.set({
    id: event.transaction.hash,
    from,
    to,
    token,
    amount,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionType: "pay",
    status: "success",
  });
});
```

### Step 4: Start the Indexer

```bash
cd packages/envio
pnpm dev
```

Watch for:
```
🚀 Starting Envio indexer...
📡 Connected to Sepolia RPC
📊 Syncing from block 7340000
✅ Processing transactions...
✅ Reading contract state...
✅ Updating database...
```

### Step 5: Query Your Data

Open browser: `http://localhost:8080/graphql`

Try these queries:

```graphql
# Get account state
query GetAccount {
  account(id: "0x9c77c6fafc1eb0821f1de12972ef0199c97c6e45") {
    address
    isStaker
    lastSeenBlock
    tokenBalances {
      token
      balance
    }
  }
}

# Get all stakers
query GetStakers {
  accounts(where: { isStaker: true }) {
    address
    tokenBalances {
      balance
    }
  }
}

# Get recent transactions
query GetTransactions {
  transactions(orderBy: timestamp, orderDirection: desc, limit: 10) {
    id
    from
    to
    amount
    timestamp
  }
}
```

### Step 6: Start the Frontend

In another terminal:

```bash
cd /home/oucan/PayVVM/envioftpayvvm
yarn start
```

Visit: `http://localhost:3000`

## 📊 What You Can Build

With state indexing working, you can create:

### 1. Account Dashboard
```typescript
// components/payvvm/AccountDashboard.tsx
export const AccountDashboard = ({ address }) => {
  const { data } = useQuery(gql`
    query GetAccount($address: String!) {
      account(id: $address) {
        address
        isStaker
        tokenBalances {
          token
          balance
        }
      }
    }
  `, { variables: { address } });

  return (
    <div>
      <h2>Account: {address}</h2>
      <p>Staker: {data?.account?.isStaker ? 'Yes' : 'No'}</p>
      {data?.account?.tokenBalances.map(tb => (
        <div key={tb.token}>
          Token: {tb.token}
          Balance: {formatEther(tb.balance)}
        </div>
      ))}
    </div>
  );
};
```

### 2. Transaction List
```typescript
export const TransactionList = () => {
  const { data } = useQuery(gql`
    query RecentTransactions {
      transactions(orderBy: timestamp, orderDirection: desc) {
        id
        from
        to
        amount
        timestamp
      }
    }
  `);

  return (
    <table>
      {data?.transactions.map(tx => (
        <tr key={tx.id}>
          <td>{tx.from}</td>
          <td>→</td>
          <td>{tx.to}</td>
          <td>{formatEther(tx.amount)} MATE</td>
          <td>{new Date(tx.timestamp * 1000).toLocaleString()}</td>
        </tr>
      ))}
    </table>
  );
};
```

### 3. Staker Leaderboard
```typescript
export const StakerLeaderboard = () => {
  const { data } = useQuery(gql`
    query TopStakers {
      accounts(
        where: { isStaker: true }
        orderBy: lastSeenBlock
        orderDirection: desc
      ) {
        address
        isStaker
        tokenBalances {
          balance
        }
      }
    }
  `);

  return (
    <div>
      <h2>Top Stakers</h2>
      {data?.accounts.map(account => (
        <div key={account.address}>
          {account.address}: {account.tokenBalances[0]?.balance} MATE
        </div>
      ))}
    </div>
  );
};
```

## 🎯 Success Criteria

You'll know it's working when:

✅ Test script shows contract state (Step 1)
✅ Codegen completes successfully (Step 2)
✅ Indexer starts without errors (Step 4)
✅ GraphQL playground returns data (Step 5)
✅ Frontend displays indexed data (Step 6)

## ⚡ Quick Troubleshooting

### "Cannot read contract"
- Check ALCHEMY_API_KEY is correct
- Verify contract addresses in config.yaml
- Ensure RPC endpoint is working

### "Codegen fails"
- Envio may not support function indexing
- Try alternative: The Graph or custom indexer
- Or just use frontend with direct RPC (also works!)

### "No data in GraphQL"
- Check start_block in config (should be 7340000 or earlier)
- Verify transactions exist on Etherscan
- Check indexer logs for errors

### "Too slow"
- Reduce start_block (index less history)
- Batch state reads in handlers
- Use caching for frequently accessed data

## 🎉 Ready!

You now have:
- ✅ Configuration for state-based indexing
- ✅ Test script to verify state reading
- ✅ Documentation on the approach
- ✅ Example handlers for implementation
- ✅ Ready-to-use GraphQL schema

**Just run the test script and see if it works!** 🚀

```bash
cd /home/oucan/PayVVM/envioftpayvvm
node test-state-reading.js
```

If the test passes, you're ready to implement the full indexer! If not, we can debug together. Either way, the frontend can work with direct RPC calls as a fallback.
