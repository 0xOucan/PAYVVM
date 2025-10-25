# PAYVVM Explorer Quick Start Guide

## What We've Set Up

✅ **Envio Indexer Configuration** (`packages/envio/config.yaml`)
- Configured all 5 EVVM contracts (Evvm, Staking, NameService, Treasury, Estimator)
- Set up Ethereum Sepolia network (chain ID: 11155111)
- Defined event listeners for all major EVVM operations

✅ **GraphQL Schema** (`packages/envio/schema.graphql`)
- Complete data model for EVVM explorer
- Entities: Transactions, Accounts, Staking, Identities, Treasury operations
- Ready for codegen

## Next Steps to Get Running

### 1. Set Up Environment Variables

Create `.env` file in `packages/envio/`:

```bash
cd packages/envio
cp .env.example .env
```

Add your Alchemy API key:
```
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

Get a free Alchemy API key: https://www.alchemy.com/

### 2. Important: Fix Config with Actual Events

⚠️ **CRITICAL**: The `config.yaml` currently has placeholder event signatures. You need to:

1. Check which events are actually emitted by the contracts on-chain
2. Get the exact event signatures from the deployed contracts
3. Update `config.yaml` with real events

**Option A - Quick Fix (Use Etherscan)**:
```bash
# Visit each contract on Sepolia Etherscan and check "Events" tab
# Evvm: https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e#events
# Staking: https://sepolia.etherscan.io/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816#events
# etc...
```

**Option B - Use Contract ABIs**:
```bash
cd /home/oucan/PayVVM/PAYVVM
# Check the ABI files in out/ directory
cat out/Evvm.sol/Evvm.json | grep -A 10 '"type":"event"'
```

### 3. Generate TypeScript Types

Once config is ready:

```bash
cd packages/envio
pnpm codegen
```

This will:
- Generate TypeScript types from your schema
- Create event handler templates
- Set up database entities

### 4. Implement Event Handlers

Edit `packages/envio/src/EventHandlers.ts` to process events:

```typescript
// Example handler structure:
import {
  Evvm_PaymentProcessed,
  Transaction,
  Account,
} from "generated";

Evvm_PaymentProcessed.handler(async ({ event, context }) => {
  // Create or update transaction entity
  const transaction: Transaction = {
    id: event.transactionHash,
    from: event.params.from,
    to: event.params.to,
    token: event.params.token,
    amount: event.params.amount,
    priorityFee: event.params.priorityFee,
    isStaker: event.params.isStaker,
    timestamp: event.block.timestamp,
    blockNumber: event.block.number,
    transactionType: "pay",
    status: "success",
  };

  await context.Transaction.set(transaction);

  // Update account statistics
  // ... more logic
});
```

### 5. Start the Indexer

Development mode (with hot reload):
```bash
cd packages/envio
pnpm dev
```

Production mode:
```bash
pnpm start
```

### 6. Query Your Data

Once indexing starts, you can query via GraphQL:

```bash
# GraphQL endpoint will be available at:
# http://localhost:8080/graphql
```

Example queries:
```graphql
query RecentTransactions {
  transactions(orderBy: timestamp, orderDirection: desc, limit: 10) {
    id
    from
    to
    amount
    timestamp
  }
}

query AccountInfo {
  account(id: "0x...") {
    totalTransactionsSent
    totalTransactionsReceived
    isStaker
  }
}
```

### 7. Build Frontend Dashboard

The Next.js app (`packages/nextjs/`) will query the indexed data:

```bash
# In root directory
yarn start
```

Components to build:
- Transaction list with filters
- Account/address viewer
- Staking dashboard
- Identity registry browser
- Treasury operations tracker

## Key Files to Work With

```
packages/envio/
├── config.yaml           # ← Update with real events first!
├── schema.graphql        # ✅ Ready
├── src/
│   └── EventHandlers.ts  # ← Implement after codegen
└── .env                  # ← Add your API key

packages/nextjs/
├── app/
│   └── page.tsx          # Main dashboard
├── components/
│   └── payvvm/           # Create EVVM explorer components
└── scaffold.config.ts    # Configure app settings
```

## Troubleshooting

### "No events found"
- Check start_block in config.yaml (set to actual deployment block)
- Verify contract addresses are correct
- Ensure RPC URL is working

### "Event signature mismatch"
- Update config.yaml with actual event signatures from contracts
- Check ABI files in PAYVVM/out/

### "Codegen fails"
- Ensure schema.graphql has valid GraphQL syntax
- Check that all entity references are defined
- Run `pnpm clean` then `pnpm codegen`

## Resources

- [Envio Docs](https://docs.envio.dev/)
- [EVVM Docs](https://www.evvm.info/docs/intro)
- [Scaffold-ETH 2](https://docs.scaffoldeth.io/)
- Your deployed contracts: https://sepolia.etherscan.io/

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│  Ethereum Sepolia Blockchain                    │
│  ┌─────────┐ ┌─────────┐ ┌──────────────┐     │
│  │  EVVM   │ │ Staking │ │ NameService  │     │
│  └─────────┘ └─────────┘ └──────────────┘     │
└────────────┬────────────────────────────────────┘
             │ Events
             ▼
┌────────────────────────────┐
│  Envio HyperIndex          │
│  - Listens to events       │
│  - Processes via handlers  │
│  - Stores in PostgreSQL    │
└──────────┬─────────────────┘
           │ GraphQL
           ▼
┌────────────────────────────┐
│  Next.js Frontend          │
│  - Transaction explorer    │
│  - Account viewer          │
│  - Staking dashboard       │
│  - Identity registry       │
└────────────────────────────┘
```

## Getting Help

1. Check Envio Discord: https://discord.gg/envio
2. Review EVVM docs: https://www.evvm.info/docs
3. Inspect contracts on Etherscan to verify events
4. Test queries in GraphQL playground

---

**Next immediate action**: Update `config.yaml` with real event signatures from your deployed contracts!
