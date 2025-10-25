# PAYVVM Explorer - Etherscan for EVVM

This directory contains a complete Etherscan-like blockchain explorer for PAYVVM (Pay with EVVM), built with Scaffold-ETH 2 + Envio HyperIndex.

## 🎯 What This Project Does

Create a full-featured blockchain explorer for EVVM that allows you to:

- 📊 **View all EVVM transactions** - Track payments, batch operations, and dispersals
- 👤 **Explore accounts** - See balances, transaction history, and staking status
- 🏆 **Monitor staking** - View stakers, rewards, and fisher network activity
- 🏷️ **Browse identities** - See all registered usernames in the NameService
- 💰 **Track treasury** - Monitor deposits, withdrawals, and cross-chain operations
- 📈 **View statistics** - Daily stats, total volume, active users, and more

## 🏗️ Architecture

```
┌──────────────────────────────────────────┐
│   Ethereum Sepolia Blockchain           │
│   EVVM Contracts                         │
│   - Core Payment Processing              │
│   - Staking & Rewards                    │
│   - Name Service                         │
│   - Treasury & Bridge                    │
└─────────────┬────────────────────────────┘
              │ Events
              ▼
┌─────────────────────────────────────────┐
│   Envio HyperIndex                      │
│   - Real-time event indexing            │
│   - GraphQL API                         │
│   - PostgreSQL storage                  │
└─────────────┬───────────────────────────┘
              │ GraphQL Queries
              ▼
┌─────────────────────────────────────────┐
│   Next.js Frontend                      │
│   - Transaction Explorer                │
│   - Account Dashboard                   │
│   - Staking Interface                   │
│   - Identity Registry                   │
│   - Analytics & Charts                  │
└─────────────────────────────────────────┘
```

## 📦 Package Structure

```
envioftpayvvm/
├── packages/
│   ├── foundry/           # Smart contracts & deployment
│   │   ├── contracts/     # Add new PAYVVM services here
│   │   ├── script/        # Deployment scripts
│   │   └── test/          # Contract tests
│   │
│   ├── envio/             # Blockchain indexer
│   │   ├── config.yaml    # ✨ Contract & event configuration
│   │   ├── schema.graphql # ✨ Data model definitions
│   │   ├── src/
│   │   │   └── EventHandlers.ts # ✨ Event processing logic
│   │   └── .env           # API keys (Alchemy, etc.)
│   │
│   └── nextjs/            # Frontend dashboard
│       ├── app/           # Next.js 14 App Router pages
│       ├── components/    # React components
│       │   └── payvvm/    # Custom EVVM explorer components
│       ├── hooks/         # Custom React hooks
│       └── services/      # API integration services
│
├── QUICK_START.md         # 🚀 Start here!
├── PAYVVM_SETUP_GUIDE.md  # Detailed setup guide
└── setup-payvvm-explorer.sh # Automated setup script
```

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

```bash
cd envioftpayvvm
./setup-payvvm-explorer.sh
```

This script will:
- Check and install dependencies
- Set up environment variables
- Guide you through configuration
- Help with code generation

### Option 2: Manual Setup

```bash
# 1. Install dependencies
yarn install

# 2. Set up Envio
cd packages/envio
cp .env.example .env
# Add your ALCHEMY_API_KEY to .env

# 3. Update config with real events
nano config.yaml  # See QUICK_START.md for details

# 4. Generate types
pnpm codegen

# 5. Start indexer (terminal 1)
pnpm dev

# 6. Start frontend (terminal 2, from root)
yarn start
```

## 📝 Key Configuration Files

### 1. `packages/envio/config.yaml`

Defines which contracts and events to index:

```yaml
contracts:
  - name: Evvm
    address: "0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e"
    events:
      - event: "PaymentProcessed(...)"
      # Add more events
```

⚠️ **Important**: Currently has placeholder events. You must update with real events from your deployed contracts!

### 2. `packages/envio/schema.graphql`

Defines the data model:

```graphql
type Transaction @entity {
  id: ID!
  from: String!
  to: String!
  amount: BigInt!
  # ... more fields
}
```

✅ **Status**: Complete and ready to use

### 3. `packages/envio/src/EventHandlers.ts`

Processes blockchain events:

```typescript
Evvm_PaymentProcessed.handler(async ({ event, context }) => {
  // Store transaction data
  await context.Transaction.set({
    id: event.transactionHash,
    from: event.params.from,
    // ... more fields
  });
});
```

📝 **Status**: Needs implementation after codegen

## 🔧 Development Workflow

### Adding a New Contract

1. **Deploy contract** using `packages/foundry/`
2. **Add to config.yaml**:
   ```yaml
   contracts:
     - name: MyNewContract
       address: "0x..."
       events:
         - event: "MyEvent(...)"
   ```
3. **Update schema.graphql** with new entities
4. **Run codegen**: `cd packages/envio && pnpm codegen`
5. **Implement handlers** in `EventHandlers.ts`
6. **Restart indexer**: `pnpm dev`

### Building Frontend Components

Example transaction explorer component:

```typescript
// packages/nextjs/components/payvvm/TransactionList.tsx
import { useQuery } from "@apollo/client";

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
    <div>
      {data?.transactions.map(tx => (
        <TransactionRow key={tx.id} transaction={tx} />
      ))}
    </div>
  );
};
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Step-by-step setup guide
- **[PAYVVM_SETUP_GUIDE.md](./PAYVVM_SETUP_GUIDE.md)** - Detailed architecture overview
- **[Envio Docs](https://docs.envio.dev/)** - Indexer documentation
- **[EVVM Docs](https://www.evvm.info/docs/intro)** - EVVM protocol docs
- **[Scaffold-ETH 2](https://docs.scaffoldeth.io/)** - Frontend framework docs

## 🛠️ Common Commands

```bash
# Envio Indexer
cd packages/envio
pnpm codegen       # Generate TypeScript types
pnpm dev           # Start indexer (development)
pnpm start         # Start indexer (production)
pnpm test          # Run indexer tests

# Frontend
cd packages/nextjs
yarn dev           # Start Next.js dev server
yarn build         # Build for production
yarn lint          # Run linter

# Foundry
cd packages/foundry
forge compile      # Compile contracts
forge test         # Run tests
forge script       # Deploy contracts
```

## 🎨 Frontend Pages to Build

Suggested pages for your EVVM explorer:

1. **Home** (`/`) - Overview statistics and recent activity
2. **Transactions** (`/txs`) - All transactions with filters
3. **Accounts** (`/accounts`) - All accounts/addresses
4. **Account Detail** (`/address/[address]`) - Single account view
5. **Transaction Detail** (`/tx/[hash]`) - Single transaction view
6. **Staking** (`/staking`) - Staking dashboard
7. **Identities** (`/identities`) - NameService registry
8. **Treasury** (`/treasury`) - Treasury operations
9. **Fishers** (`/fishers`) - Fisher network activity
10. **Stats** (`/stats`) - Analytics and charts

## 🔍 GraphQL Query Examples

```graphql
# Get recent transactions
query RecentTransactions {
  transactions(limit: 10, orderBy: timestamp, orderDirection: desc) {
    id
    from
    to
    amount
    timestamp
  }
}

# Get account details
query AccountDetails($address: String!) {
  account(id: $address) {
    totalTransactionsSent
    totalTransactionsReceived
    isStaker
    identities {
      identity
      expiryDate
    }
  }
}

# Get staking info
query StakingStats {
  stakings(where: { isActive: true }) {
    accountId
    stakedAmount
    totalRewardsClaimed
  }
}

# Get daily stats
query DailyStats {
  dailyStats(orderBy: date, orderDirection: desc, limit: 30) {
    date
    totalTransactions
    totalVolume
    uniqueUsers
  }
}
```

## 🐛 Troubleshooting

### Indexer won't start
- Check `.env` has valid `ALCHEMY_API_KEY`
- Verify `config.yaml` has correct contract addresses
- Ensure events match actual contract events on-chain

### Codegen fails
- Check `schema.graphql` syntax
- Ensure all entity relationships are valid
- Run `pnpm clean` then try again

### No data appearing
- Check `start_block` in config.yaml (should be deployment block)
- Verify contracts have emitted events on-chain
- Check indexer logs for errors

### Frontend can't query data
- Ensure indexer is running (`pnpm dev` in packages/envio)
- Check GraphQL endpoint: http://localhost:8080/graphql
- Verify your queries match the schema

## 🌐 Deployed Contracts

### Ethereum Sepolia Testnet

| Contract | Address | Etherscan |
|----------|---------|-----------|
| EVVM | `0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e` | [View](https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e) |
| Staking | `0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816` | [View](https://sepolia.etherscan.io/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816) |
| NameService | `0xa4ba4e9270bde8fbbf4328925959287a72ba0a55` | [View](https://sepolia.etherscan.io/address/0xa4ba4e9270bde8fbbf4328925959287a72ba0a55) |
| Treasury | `0x3d6cb29a1f97a2cff7a48af96f7ed3a02f6aa38e` | [View](https://sepolia.etherscan.io/address/0x3d6cb29a1f97a2cff7a48af96f7ed3a02f6aa38e) |
| Estimator | `0x5db7cdb7601f9abcfc5089d66b1a3525471bf2ab` | [View](https://sepolia.etherscan.io/address/0x5db7cdb7601f9abcfc5089d66b1a3525471bf2ab) |

## 🤝 Contributing

This is a monorepo workspace. To contribute:

1. Create a feature branch
2. Make your changes in the appropriate package
3. Test locally
4. Submit a pull request

## 📄 License

This project is part of the PAYVVM/EVVM ecosystem. See main repository for license details.

## 🆘 Getting Help

- **Envio Discord**: https://discord.gg/envio
- **EVVM Docs**: https://www.evvm.info/docs
- **Scaffold-ETH Discord**: https://discord.gg/scaffoldeth
- **GitHub Issues**: https://github.com/your-repo/issues

---

**Ready to build?** Start with `./setup-payvvm-explorer.sh` or read [QUICK_START.md](./QUICK_START.md)!

🚀 **Happy coding!**
