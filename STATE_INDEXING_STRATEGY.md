# State-Based Indexing Strategy for PAYVVM

## 💡 The Insight

Even though PAYVVM contracts **don't emit events**, we can still build a complete indexer by **tracking state changes**!

## 🎯 What We Can Index

### 1. User Account State

For any user address, we can read:

```solidity
// EVVM Contract
getBalance(address user, address token) -> uint256
isAddressStaker(address user) -> bool
getNextCurrentSyncNonce(address user) -> uint256
getIfUsedAsyncNonce(address user, uint256 nonce) -> bool
getNextFisherDepositNonce(address user) -> uint256
```

### 2. EVVM Metadata

Global state about the EVVM instance:

```solidity
getEvvmMetadata() -> EvvmMetadata struct {
    address principalTokenAddress;
    uint256 reward;
    uint256 totalSupply;
    uint256 eraTokens;
}

getNameServiceAddress() -> address
getStakingContractAddress() -> address
getCurrentAdmin() -> address
getEraPrincipalToken() -> uint256
getRewardAmount() -> uint256
```

### 3. Staking Information

For stakers:

```solidity
// Staking Contract
getStakingInfo(address user) -> StakingInfo struct {
    uint256 stakedAmount;
    uint256 stakingStartTime;
    uint256 lastRewardClaim;
    bool isActive;
}

getStakersList() -> address[]
getTotalStaked() -> uint256
```

### 4. Name Service Identities

For usernames:

```solidity
// NameService Contract
verifyIfIdentityExist(string identity) -> bool
getOwnerOfIdentity(string identity) -> address
getIdentityExpiry(string identity) -> uint256
getIdentityMetadata(string identity, string key) -> string
```

## 🔄 Indexing Flow

### Step 1: Track Transactions

When we see a transaction to a PAYVVM contract:
```
Transaction Hash: 0xabc...
To: 0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e (EVVM)
Function: pay(...)
From: 0x123... (User A)
```

### Step 2: Extract Affected Addresses

From the transaction parameters:
- `from` address (sender)
- `to` address (recipient)
- Any other addresses in the function params

### Step 3: Read Current State

For each affected address, call view functions:

```typescript
// After a payment transaction
const userABalance = await evvm.getBalance(
  userA,
  mateToken
);

const userANonce = await evvm.getNextCurrentSyncNonce(userA);
const userAIsStaker = await evvm.isAddressStaker(userA);

// Store in database
await db.accounts.upsert({
  address: userA,
  mateBalance: userABalance,
  syncNonce: userANonce,
  isStaker: userAIsStaker,
  lastUpdated: block.timestamp
});
```

### Step 4: Update Database

Store the state snapshot in our database entities.

## 📊 Envio Implementation

### Handler Structure

```typescript
// src/EventHandlers.ts

import { EvvmContract, Account, Transaction } from "generated";

// Handler for payment transactions
Evvm.pay.handler(async ({ transaction, context }) => {
  // 1. Extract addresses from transaction
  const from = transaction.params.from;
  const to = transaction.params.to;
  const token = transaction.params.token;
  const amount = transaction.params.amount;

  // 2. Read current state for sender
  const senderBalance = await context.Evvm.getBalance(from, token);
  const senderNonce = await context.Evvm.getNextCurrentSyncNonce(from);
  const senderIsStaker = await context.Evvm.isAddressStaker(from);

  // 3. Update/create sender account
  await context.Account.set({
    id: from.toLowerCase(),
    address: from,
    mateBalance: senderBalance,
    syncNonce: senderNonce,
    isStaker: senderIsStaker,
    lastUpdated: transaction.blockTimestamp,
  });

  // 4. Read current state for recipient
  const recipientBalance = await context.Evvm.getBalance(to, token);

  // 5. Update/create recipient account
  await context.Account.set({
    id: to.toLowerCase(),
    address: to,
    mateBalance: recipientBalance,
    syncNonce: await context.Evvm.getNextCurrentSyncNonce(to),
    isStaker: await context.Evvm.isAddressStaker(to),
    lastUpdated: transaction.blockTimestamp,
  });

  // 6. Create transaction record
  await context.Transaction.set({
    id: transaction.hash,
    from: from,
    to: to,
    token: token,
    amount: amount,
    timestamp: transaction.blockTimestamp,
    blockNumber: transaction.blockNumber,
    status: "success",
  });
});
```

## 🎨 GraphQL Queries You Can Make

With this state indexing, you can query:

### Get User Account State
```graphql
query GetAccount($address: String!) {
  account(id: $address) {
    address
    mateBalance
    syncNonce
    isStaker
    lastUpdated
  }
}
```

### Get All Stakers
```graphql
query GetStakers {
  accounts(where: { isStaker: true }) {
    address
    mateBalance
    isStaker
  }
}
```

### Get Top Holders
```graphql
query GetTopHolders {
  accounts(
    orderBy: mateBalance
    orderDirection: desc
    limit: 10
  ) {
    address
    mateBalance
  }
}
```

### Get Recent Transactions
```graphql
query GetRecentTransactions {
  transactions(
    orderBy: timestamp
    orderDirection: desc
    limit: 20
  ) {
    id
    from
    to
    amount
    timestamp
  }
}
```

## ⚡ Performance Optimizations

### 1. Batch State Reads

Instead of reading state for each transaction individually:

```typescript
// Good: Batch multiple reads
const [balance, nonce, isStaker] = await Promise.all([
  context.Evvm.getBalance(address, token),
  context.Evvm.getNextCurrentSyncNonce(address),
  context.Evvm.isAddressStaker(address)
]);
```

### 2. Cache Frequently Accessed State

Some state rarely changes:
- EVVM metadata (reward amount, era tokens)
- NameService address
- Staking contract address

Cache these and only update when admin functions are called.

### 3. Incremental Updates

Only update accounts that were affected by transactions, not all accounts every block.

### 4. Block-Based Snapshots

Optionally, create periodic snapshots:
- Every 100 blocks, snapshot all account states
- Useful for historical analysis

## 🔧 Implementation Steps

### Step 1: Update Schema (Already Done ✅)

Our GraphQL schema in `schema.graphql` already supports this!

### Step 2: Configure Envio (Already Done ✅)

Updated `config.yaml` tracks transactions to contracts.

### Step 3: Implement Handlers

Create event handlers that:
1. Decode transaction parameters
2. Call contract view functions
3. Store state in database entities

### Step 4: Test Locally

```bash
cd packages/envio
pnpm codegen
pnpm dev
```

### Step 5: Query Data

Visit http://localhost:8080/graphql and run queries!

## 🎯 Advantages of This Approach

✅ **Complete state tracking** - Know exact current state
✅ **Historical data** - Track state changes over time
✅ **Fast queries** - All data in database, not RPC calls
✅ **No events needed** - Works perfectly with PAYVVM
✅ **Scalable** - Only update affected accounts
✅ **Real-time** - Updates on every new transaction

## ⚠️ Considerations

⚠️ **RPC calls** - Need to make contract calls for each transaction
⚠️ **Rate limits** - May hit RPC rate limits with many transactions
⚠️ **Initial sync** - First sync slower (reading lots of state)
⚠️ **State size** - Database grows with number of unique users

## 💡 Solutions

### For RPC Limits
- Use archive node for reliable state access
- Batch multiple state reads together
- Cache frequently accessed data

### For Initial Sync
- Start from recent block (not genesis)
- Parallelize state reads where possible
- Show progress to users

### For Database Size
- Archive old snapshots
- Keep only recent state by default
- Offer "full history" as optional feature

## 🚀 Ready to Implement

The beauty of this approach is:
1. ✅ Config already updated
2. ✅ Schema already defined
3. ✅ Contract addresses verified
4. 🔨 Just need to implement the handlers!

Let's test it now! 🎉

## Example: Complete Handler

Here's a full example handler for the `pay` function:

```typescript
import {
  Evvm_pay_handler,
  Evvm_pay_handlerContext,
  Account,
  Transaction,
  TokenBalance
} from "generated";

Evvm_pay_handler(async ({ event, context }) => {
  const { from, to, token, amount, priorityFee } = event.params;
  const { blockNumber, timestamp, transactionHash } = event;

  // Helper to update account state
  async function updateAccountState(address: string) {
    // Read current state from contract
    const [balance, nonce, isStaker] = await Promise.all([
      context.contracts.Evvm.getBalance(address, token),
      context.contracts.Evvm.getNextCurrentSyncNonce(address),
      context.contracts.Evvm.isAddressStaker(address)
    ]);

    // Update or create account
    const existingAccount = await context.Account.get(address);

    await context.Account.set({
      id: address,
      address: address,
      totalTransactionsSent: existingAccount
        ? existingAccount.totalTransactionsSent + (address === from ? 1 : 0)
        : (address === from ? 1 : 0),
      totalTransactionsReceived: existingAccount
        ? existingAccount.totalTransactionsReceived + (address === to ? 1 : 0)
        : (address === to ? 1 : 0),
      isStaker: isStaker,
      lastSeenBlock: blockNumber,
      firstSeenBlock: existingAccount?.firstSeenBlock ?? blockNumber,
    });

    // Update token balance
    await context.TokenBalance.set({
      id: `${address}-${token}`,
      accountId: address,
      token: token,
      balance: balance,
      lastUpdated: timestamp,
    });
  }

  // Update both sender and recipient
  await Promise.all([
    updateAccountState(from),
    updateAccountState(to)
  ]);

  // Create transaction record
  await context.Transaction.set({
    id: transactionHash,
    from: from,
    to: to,
    token: token,
    amount: amount,
    priorityFee: priorityFee,
    timestamp: timestamp,
    blockNumber: blockNumber,
    transactionType: "pay",
    status: "success",
  });
});
```

This handler:
- ✅ Reads current contract state
- ✅ Updates account information
- ✅ Tracks token balances
- ✅ Records transaction details
- ✅ Works without any events!
