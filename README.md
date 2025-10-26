# PAYVVM Explorer

> **A next-generation blockchain explorer and payment platform for the EVVM ecosystem**

PAYVVM Explorer is a production-ready decentralized application that enables **gasless PYUSD and MATE token payments**, real-time blockchain state monitoring, and comprehensive transaction tracking through innovative hybrid data architecture. Built on Scaffold-ETH 2 with advanced Web3 integrations.

[![Live on Sepolia](https://img.shields.io/badge/Live-Sepolia%20Testnet-blue)](https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e)
[![EVVM ID](https://img.shields.io/badge/EVVM%20ID-1000-purple)](https://www.evvm.info/evvms/1000)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<h4 align="center">
  <a href="https://www.evvm.info/docs">EVVM Docs</a> |
  <a href="https://www.evvm.info/evvms/1000">EVVM #1000</a> |
  <a href="https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e">EVVM Contract</a>
</h4>

---

## 🎯 Key Features

### 🚰 EVVM Faucet Services (NEW!)
Get free testnet tokens through gasless faucet services! No gas fees required - just sign and claim.

**PYUSD Faucet** - `0x74F7A28aF1241cfBeC7c6DBf5e585Afc18832a9a`
- ✅ Claim 1 PYUSD every 24 hours
- ✅ Gasless claiming via EIP-191 signatures
- ✅ Fisher network executes claims for you
- ✅ Perfect for testing PYUSD payments
- ✅ [Verified on Etherscan](https://sepolia.etherscan.io/address/0x74F7A28aF1241cfBeC7c6DBf5e585Afc18832a9a)

**MATE Faucet** - `0x068E9091e430786133439258C4BeeD696939405e`
- ✅ Claim 510 MATE tokens every 24 hours
- ✅ Gasless claiming via EIP-191 signatures
- ✅ Enough for username registration + priority fees
- ✅ Fisher network executes claims for you
- ✅ [Verified on Etherscan](https://sepolia.etherscan.io/address/0x068E9091e430786133439258C4BeeD696939405e)

**How Faucets Work:**
1. Sign claim message with your wallet (no gas required)
2. Signature auto-submits to fishing pool API
3. Fisher bot polls API and executes your claim
4. Receive tokens directly to your EVVM balance
5. 24-hour cooldown between claims

### 💸 Gasless PYUSD Payments
Send PYUSD tokens within the EVVM ecosystem **without paying gas fees**. Users sign payment messages (EIP-191), and network participants (fishers) execute them on-chain, earning optional priority fees.

**How it works:**
- Sign a payment message with your wallet (no gas required)
- Message auto-submits to fishing pool API
- Fisher bot polls API and executes transaction
- Complete abstraction of blockchain complexity from users
- Fisher pays gas, earns optional priority fees

### 🎰 MATE Token Faucet & Payments
Claim and send MATE tokens (EVVM's native protocol token) for username registration, priority fees, and network services.

**Faucet Features:**
- One-click token claiming on Sepolia testnet
- Reward formula: **2.5 MATE × random(1-5083)**
- Get 2.5 to 12,707.5 MATE tokens per claim
- More than enough for username registration (500 MATE required)
- Unlimited claims on testnet for development

**Gasless Payment Features:**
- ✨ **NEW**: Fishing pool integration for MATE payments
- Gasless MATE payments using EIP-191 signatures
- Auto-submit to fishing pool after signing
- Send MATE to any address without ETH for gas
- Real-time balance display (18 decimal precision)
- Priority fee options for faster execution
- Perfect for username registration (500 MATE)
- Fisher network executes transactions on your behalf
- Auto-refresh after successful transactions

### 🚀 HyperSync-Powered Transaction History
Query transaction history **2000x faster** than traditional RPC using [Envio HyperSync](https://docs.envio.dev/docs/HyperSync). No event logs required - works directly with transaction data.

**Benefits:**
- Instant transaction queries (~100ms vs 5s+)
- Last 10,000 blocks searchable
- Works with contracts that don't emit events
- Server-side processing for security

### 🔄 Hybrid Data Architecture
Best-of-all-worlds approach combining three data sources:

| Data Source | Use Case | Speed | Reliability |
|-------------|----------|-------|-------------|
| **Direct RPC** | Real-time state (balances, nonces) | Instant | High |
| **HyperSync** | Transaction history | 2000x faster | High |
| **Envio Indexer** | Event aggregation (optional) | Fast | Medium |

**Result**: Fast, reliable, and fault-tolerant data layer with no single point of failure.

### 💰 Treasury Management
Seamless PYUSD token deposits and withdrawals with intuitive two-step approval flow:

1. **Deposit**: Approve → Transfer PYUSD to EVVM
2. **Withdraw**: One-click withdrawal from EVVM to wallet

Includes real-time balance tracking and automatic allowance detection.

### 🎣 Fisher Network System
Become a network participant and earn MATE rewards by executing gasless payments:

**What is a Fisher?**
- Fishers monitor the mempool for signed payment messages
- Execute transactions on behalf of users (who pay no gas)
- Earn MATE token rewards + optional priority fees
- Requires staking MATE tokens to participate (5083 MATE per staking token)

**Staking Types:**
1. **Public Staking** - Standard staking with dual signature requirement (staking signature + payment signature)
2. **Golden Fisher** - VIP staking for privileged operators:
   - ✨ NO staking signature required (instant staking)
   - ✨ NO staking nonce verification (bypass authentication)
   - ✨ Payment signature still required (EVVM internal security)
   - ✨ Priority transaction processing
   - ✨ Exclusive for authorized operators

**Fisher Dashboard:**
- Real-time execution tracking (successful/failed)
- Earnings analytics (MATE earned, gas spent, profit/loss)
- Success rate monitoring
- Recent executions history with transaction details
- Profitability indicators

**Fishing Pool System:**
- Users sign payment messages locally (EIP-191 signatures)
- Supports both PYUSD (6 decimals) and MATE (18 decimals) tokens
- Signed messages submitted to fishing pool API
- Fisher bot polls API for pending signed messages
- Fisher executes transactions on-chain (pays gas)
- Complete gasless experience for end users
- Automatic token detection and processing

**Backend Fisher Bot:**
- Automated fishing pool monitoring
- Transaction execution with optimized gas pricing
- Signature verification and nonce management
- Error handling and automatic retry logic
- Performance tracking and logging
- Golden Fisher mode for privileged operators

### 📊 Real-Time State Monitoring
Live EVVM system metrics without indexer dependency:
- Total Supply tracking
- Era Tokens per period
- Current Reward amounts
- Admin address monitoring
- User account states (balance, staker status, nonce)

### 🔍 Multi-Contract Integration
Comprehensive integration with the entire EVVM ecosystem:

| Contract | Address | Purpose |
|----------|---------|---------|
| **EVVM Core** | `0x9486...9C3e` | Virtual machine & payment execution |
| **NameService** | `0xa4ba...0a55` | Decentralized username registry |
| **Staking** | `0x64A4...6816` | Token staking & rewards |
| **Treasury** | `0x3D6c...A38E` | Asset management & custody |
| **Estimator** | `0x5dB7...2aB` | Reward calculations |
| **PYUSD Token** | `0xCaC5...3bB9` | ERC-20 payment token (6 decimals) |
| **MATE Token** | `0x0000...0001` | EVVM native protocol token (18 decimals) |

---

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    PAYVVM Explorer                          │
│                   (Next.js Frontend)                        │
└────┬──────────┬──────────┬──────────┬──────────────────────┘
     │          │          │          │
     ▼          ▼          ▼          ▼
┌─────────┐ ┌──────┐ ┌─────────┐ ┌──────────────┐
│ Wagmi/  │ │ RPC  │ │HyperSync│ │Envio Indexer │
│RainbowKit│ │ Read │ │  API    │ │  (Optional)  │
└────┬────┘ └──┬───┘ └────┬────┘ └──────┬───────┘
     │         │          │             │
     └─────────┴──────────┴─────────────┘
                      │
                      ▼
     ┌────────────────────────────────────┐
     │   Ethereum Sepolia Testnet         │
     │   Chain ID: 11155111               │
     │                                    │
     │   • EVVM Contracts                 │
     │   • PYUSD Token                    │
     │   • User Wallets                   │
     └────────────────────────────────────┘
```

### Payment Flow Architecture (Fishing Pool)

```
User Action: Send 10 PYUSD to Alice
         │
         ▼
┌────────────────────────────────┐
│  1. Construct Message          │
│     "1000,pay,0xAlice,...,     │
│      10000000,0,42,false,0x0"  │
└────────┬───────────────────────┘
         ▼
┌────────────────────────────────┐
│  2. Sign with Wallet (EIP-191) │
│     MetaMask/WalletConnect     │
│     No gas required!           │
└────────┬───────────────────────┘
         ▼
┌────────────────────────────────┐
│  3. Submit to Fishing Pool API │
│     POST /api/fishing/submit   │
│     { from, to, amount, sig,   │
│       executor, priorityFlag } │
└────────┬───────────────────────┘
         ▼
┌────────────────────────────────┐
│  4. Fisher Bot Polls API       │
│     GET /api/fishing/submit    │
│     ?pending=true              │
└────────┬───────────────────────┘
         ▼
┌────────────────────────────────┐
│  5. Fisher Executes On-Chain   │
│     pay(from, to, token,       │
│         amount, fee, nonce,    │
│         flag, executor, sig)   │
│     Fisher pays gas fees       │
└────────┬───────────────────────┘
         ▼
┌────────────────────────────────┐
│  6. Contract Verification      │
│     • Recover signer from sig  │
│     • Verify nonce             │
│     • Check balance            │
│     • Execute transfer         │
└────────┬───────────────────────┘
         ▼
┌────────────────────────────────┐
│  7. Payment Complete!          │
│     Alice receives 10 PYUSD    │
│     Fisher earns priority fee  │
│     Transaction confirmed      │
└────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18+ and **Yarn**
- **Git**
- **MetaMask** or WalletConnect-compatible wallet
- **PYUSD tokens** on Sepolia (get from [faucet](https://www.evvm.info))

### Installation

```bash
# Clone the repository
git clone git@github.com:0xOucan/PAYVVM.git
cd PAYVVM/envioftpayvvm

# Install dependencies
yarn install

# Set up environment variables
cp .env.example .env
```

### Configuration

Edit `.env` with your settings:

```bash
# REQUIRED: Get from https://cloud.reown.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id_here

# RECOMMENDED: For better performance
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Contract addresses (already configured for Sepolia)
NEXT_PUBLIC_EVVM_ADDRESS=0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e
NEXT_PUBLIC_TREASURY_ADDRESS=0x3D6cB29a1F97a2CFf7a48af96F7ED3A02F6aA38E

# Envio configuration
ENVIO_START_BLOCK=9455841  # PAYVVM deployment block
ENVIO_RPC_URL=https://rpc.sepolia.org
```

### Run the Application

```bash
# Start the frontend
yarn start

# Open in browser
# http://localhost:3000
```

### Run Fisher Bot (Optional)

To participate in the Fisher Network and execute gasless payments:

```bash
# Configure fisher bot
cd packages/nextjs
cp .env.example .env

# Add your fisher private key
# FISHER_PRIVATE_KEY=0x_your_private_key_here
# FISHER_ENABLED=true

# Start the fisher bot (in a separate terminal)
yarn fisher:start
```

**Fisher Bot Requirements:**
- Staked MATE tokens (5083 MATE per staking token)
- ETH on Sepolia for gas fees
- Golden Fisher status (for VIP privileges) or public staking

**What the bot does:**
- Monitors fishing pool API for signed payment messages
- Executes transactions on behalf of users
- Earns MATE rewards + optional priority fees
- Automatic retry on failure
- Performance tracking and logging

### Optional: Run Envio Indexer

```bash
# In a separate terminal
cd packages/envio

# Generate types
pnpm codegen

# Start indexer
pnpm dev

# GraphQL playground available at:
# http://localhost:8080/graphql
```

---

## 🎨 User Interface

### Main Dashboard (`/payvvm`)
The PAYVVM Explorer page combines all features in a unified interface:

**1. EVVM System Dashboard**
- Total Supply: Current MATE tokens in circulation
- Era Tokens: Tokens distributed per era
- Current Reward: MATE reward per transaction
- Admin Address: System administrator

**2. Treasury Management**
- **Deposit Tab**: Transfer PYUSD from wallet to EVVM
- **Withdraw Tab**: Transfer PYUSD from EVVM to wallet
- Automatic approval flow
- Allowance tracking

**3. PYUSD Payment Center**
- Send gasless PYUSD payments with signature
- Real-time balance display (6 decimal precision)
- Priority fee options for faster execution
- Transaction status tracking with Etherscan links
- Auto-refresh after successful payment

**4. MATE Token Faucet**
- One-click token claiming via `recalculateReward()` function
- Get 2.5 to 12,707.5 MATE tokens per claim
- Real-time balance updates
- Transaction tracking with Etherscan links
- Testnet-only feature for development
- Info about MATE token usage (username registration, priority fees, etc.)

**5. MATE Payment Center**
- Send gasless MATE payments using EIP-191 signatures
- Real-time balance display (18 decimal precision)
- Recipient address validation
- Amount input with MAX button
- Advanced options: Priority fee settings
- Debug status indicators (EVVM ID, nonce, validation)
- Auto-execute after signature
- Auto-refresh with 500ms delay after transaction
- Success/error alerts with Etherscan links

**6. Account Viewer**
- MATE balance display
- Staker status indicator
- Current nonce (transaction counter)
- Direct Etherscan link

### Fishing Dashboard (`/fishing`)
The Fisher Network interface for staking and monitoring:

**1. Become a Fisher (Public Staking)**
- Stake MATE tokens to become a network fisher
- Real-time MATE balance display
- Staked amount tracking with staking token conversion
- Fisher status indicator (Active/Inactive)
- Dual signature flow (staking + payment signatures)
- Advanced options showing nonces and signature details
- 21-day cooldown for unstaking
- Automatic state refresh after transactions

**2. Golden Fisher VIP Staking**
- Exclusive interface for privileged golden fisher operators
- Instant staking with single payment signature
- Bypass staking nonce verification
- Real-time privilege detection and validation
- VIP badge with exclusive feature list
- Contract data status monitoring (EVVM ID, nonce)
- Debug information panel

**3. Fisher Dashboard**
- **Performance Stats**: Total executions, success rate, MATE earned, profit/loss
- **Recent Executions Table**: From/To addresses, amounts, fees earned, gas costs, profit per TX
- **Fisher Bot Setup Instructions**: Step-by-step guide with code examples
- **Statistics Reset**: Clear historical data option
- Real-time profitability indicators
- Transaction-level breakdown with Etherscan links

**7. Transaction History**
- Last 10,000 blocks of transactions
- HyperSync-powered instant queries
- Filter by contract (EVVM, Staking, NameService, Treasury)
- Timestamps and Etherscan links

### Additional Pages

- **Envio Indexer Dashboard** (`/envio`) - Monitor indexer status, view GraphQL schema
- **Block Explorer** (`/blockexplorer`) - Local chain explorer with address and transaction views
- **Debug Contracts** (`/debug`) - Scaffold-ETH contract interaction interface

---

## 🛠 Technical Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 15.2.3 | React framework with App Router |
| **React** | 19 | UI library |
| **TypeScript** | 5.8.2 | Type safety |
| **Tailwind CSS** | 4.1.3 | Styling framework |
| **DaisyUI** | 5.0.9 | Component library |

### Web3 Infrastructure
| Technology | Version | Purpose |
|------------|---------|---------|
| **Wagmi** | 2.16.4 | React hooks for Ethereum |
| **Viem** | 2.34.0 | TypeScript Ethereum library |
| **RainbowKit** | 2.2.8 | Wallet connection UI |
| **TanStack Query** | 5.59.15 | Data fetching & caching |

### Data Layer
| Technology | Purpose |
|------------|---------|
| **Envio HyperSync** | 2000x faster transaction queries |
| **Envio Indexer** | Event-based indexing (optional) |
| **Direct RPC** | Real-time state reading |

---

## 📁 Project Structure

```
envioftpayvvm/
├── PAYVVM/                        # Foundry contracts module
│   ├── src/contracts/             # EVVM core contracts
│   ├── script/                    # Deployment scripts
│   └── Documentation files        # Implementation guides
│
├── packages/
│   ├── nextjs/                    # Next.js frontend
│   │   ├── app/                   # App Router pages
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── payvvm/            # Main PAYVVM Explorer ⭐
│   │   │   ├── envio/             # Indexer dashboard
│   │   │   ├── blockexplorer/     # Block explorer
│   │   │   └── api/               # API routes
│   │   │       ├── transactions/  # HyperSync queries
│   │   │       └── fishing/       # Fishing pool API ⭐
│   │   │           └── submit/    # Submit & poll signed messages
│   │   │
│   │   ├── components/
│   │   │   ├── payvvm/            # PAYVVM components ⭐
│   │   │   │   ├── EvvmDashboard.tsx
│   │   │   │   ├── PyusdPayment.tsx
│   │   │   │   ├── PyusdTreasury.tsx
│   │   │   │   ├── MatePayment.tsx       # MATE payment UI
│   │   │   │   ├── MateFaucet.tsx        # MATE faucet UI
│   │   │   │   ├── AccountViewer.tsx
│   │   │   │   └── TransactionHistory.tsx
│   │   │   │
│   │   │   ├── fishing/           # Fisher Network UI ⭐
│   │   │   │   ├── StakeFisher.tsx       # Public staking interface
│   │   │   │   ├── GoldenStaking.tsx     # Golden fisher VIP staking
│   │   │   │   └── FisherDashboard.tsx   # Analytics & monitoring
│   │   │   │
│   │   │   └── scaffold-eth/     # Scaffold-ETH components
│   │   │
│   │   ├── hooks/
│   │   │   ├── payvvm/            # PAYVVM custom hooks ⭐
│   │   │   │   ├── useEvvmState.ts        # State reading
│   │   │   │   ├── useEvvmPayment.ts      # PYUSD payment logic
│   │   │   │   ├── usePyusdTreasury.ts    # Treasury operations
│   │   │   │   ├── useMatePayment.ts      # MATE payment & balance
│   │   │   │   └── useMateFaucet.ts       # MATE faucet claiming
│   │   │   │
│   │   │   ├── fishing/           # Fisher Network hooks ⭐
│   │   │   │   ├── useStakeFisher.ts      # Public staking logic
│   │   │   │   ├── useGoldenStaking.ts    # Golden fisher staking
│   │   │   │   └── useFisherStats.ts      # Analytics & performance
│   │   │   │
│   │   │   └── scaffold-eth/     # Scaffold-ETH hooks
│   │   │
│   │   ├── fishing/                # Backend fisher bot ⭐
│   │   │   ├── fisher-bot.ts       # Main bot implementation
│   │   │   └── nonce-manager.ts    # Nonce synchronization
│   │   │
│   │   ├── utils/
│   │   │   ├── hypersync.ts       # HyperSync client ⭐
│   │   │   └── graphql.ts         # Envio GraphQL queries
│   │   │
│   │   └── contracts/
│   │       └── externalContracts.ts   # Sepolia addresses
│   │
│   ├── foundry/                   # Smart contract package
│   │
│   └── envio/                     # Indexer package
│       ├── config.yaml            # Indexer configuration
│       ├── schema.graphql         # GraphQL schema
│       └── src/                   # Event handlers
│
├── .env.example                   # Environment template
├── setup-env.sh                   # Quick setup script
├── test-setup.sh                  # Configuration tester ⭐
├── vercel.json                    # Vercel deployment config
└── README.md                      # This file
```

---

## 🔑 Core Innovations

### 1. Gasless Payment System

**Signature Format**:
```
{EvvmID},pay,{recipient},{token},{amount},{priorityFee},{nonce},{priorityFlag},{executor}
```

**Example Messages**:
```
# PYUSD Payment (6 decimals)
1000,pay,0xalice...,0xCaC524...,2000000,0,42,false,0x0...0

# MATE Payment (18 decimals)
1000,pay,0xalice...,0x0000...0001,500000000000000000000,0,42,false,0x0...0
```

**Supported Tokens**:
- ✅ PYUSD (6 decimals) - Stablecoin payments
- ✅ MATE (18 decimals) - Native protocol token

**Benefits**:
- No gas fees for users
- Fast execution by network participants
- Optional priority fees for urgent transactions
- Replay protection via nonces
- Automatic token detection and handling

### 2. HyperSync Transaction History

Traditional RPC queries: ~5-10 seconds per query
HyperSync queries: **~100ms** (2000x faster)

**Why HyperSync?**
- Optimized for block ranges
- Works without event logs
- Query 10,000 blocks instantly
- Public & free (no API key for Sepolia)

### 3. Real-Time State Reading

Uses Wagmi's `useReadContract` and multicall for instant state:

```typescript
// Batch read - Single RPC call for all data
const { data } = useReadContracts({
  contracts: [
    { functionName: 'getBalance', args: [address, token] },
    { functionName: 'isAddressStaker', args: [address] },
    { functionName: 'getNextCurrentSyncNonce', args: [address] }
  ]
});
```

### 4. Hybrid Data Strategy

```
Real-time State (RPC)  +  Historical Data (HyperSync)  +  Indexed Events (Envio)
      = Fast & Reliable Data Layer
```

---

## 📦 Deployed Contracts (Ethereum Sepolia)

| Contract | Address | Etherscan |
|----------|---------|-----------|
| **EVVM** | `0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e` | [View →](https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e) |
| **NameService** | `0xa4ba4e9270bDE8FbBF4328925959287a72BA0a55` | [View →](https://sepolia.etherscan.io/address/0xa4ba4e9270bDE8FbBF4328925959287a72BA0a55) |
| **Staking** | `0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816` | [View →](https://sepolia.etherscan.io/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816) |
| **Estimator** | `0x5dB7cDb7601f9ABCfc5089D66b1A3525471bf2aB` | [View →](https://sepolia.etherscan.io/address/0x5dB7cDb7601f9ABCfc5089D66b1A3525471bf2aB) |
| **Treasury** | `0x3D6cB29a1F97a2CFf7a48af96F7ED3A02F6aA38E` | [View →](https://sepolia.etherscan.io/address/0x3D6cB29a1F97a2CFf7a48af96F7ED3A02F6aA38E) |
| **PYUSD Token** | `0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9` | [View →](https://sepolia.etherscan.io/token/0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9) |
| **MATE Token** | `0x0000000000000000000000000000000000000001` | Protocol Constant (Native EVVM Token) |
| **PYUSD Faucet** 🚰 | `0x74F7A28aF1241cfBeC7c6DBf5e585Afc18832a9a` | [View →](https://sepolia.etherscan.io/address/0x74F7A28aF1241cfBeC7c6DBf5e585Afc18832a9a) |
| **MATE Faucet** 🚰 | `0x068E9091e430786133439258C4BeeD696939405e` | [View →](https://sepolia.etherscan.io/address/0x068E9091e430786133439258C4BeeD696939405e) |

**EVVM Registry**: ID #1000 (First Public EVVM Instance!)
View at: https://www.evvm.info/evvms/1000

---

## 🌐 Deployment

### Vercel Deployment (Recommended)

1. **Push to GitHub**:
```bash
git push origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import repository: `github.com/0xOucan/PAYVVM`
   - Select `envioftpayvvm` directory

3. **Set Environment Variables** in Vercel dashboard:

**Required**:
```
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

**Recommended**:
```
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key
```

4. **Deploy**: Vercel auto-deploys on every push to `main`

---

## 🧪 Testing

### Run Configuration Tests

```bash
# Check environment setup
./test-setup.sh
```

**Validates**:
- ✅ .env file exists
- ✅ WalletConnect Project ID configured
- ✅ RPC URL set
- ✅ Contract addresses correct
- ✅ Dependencies installed
- ✅ Start block configured (9455841)

### Manual Testing Flow

**MATE Faucet Flow**:
1. Connect wallet to Sepolia
2. Navigate to `/payvvm`
3. Scroll to "MATE Token Faucet" section
4. Click "Claim MATE Tokens"
5. Confirm transaction in wallet
6. Wait ~5-10 seconds for confirmation
7. Verify balance updates automatically
8. Check success message with Etherscan link

**MATE Payment Flow**:
1. Ensure MATE balance (use faucet if needed)
2. Navigate to "Send MATE Payment" section
3. Enter recipient address
4. Enter amount (or click MAX)
5. Click "Send Payment"
6. Sign message in wallet (NOT a transaction, just signature)
7. Wait for auto-execution
8. Wait for confirmation
9. Verify balance updates automatically
10. Verify recipient received MATE

**PYUSD Payment Flow**:
1. Connect wallet to Sepolia
2. Navigate to `/payvvm`
3. Check EVVM PYUSD balance shows correctly
4. Enter recipient address and amount
5. Click "Send Payment"
6. Sign message in wallet
7. Wait for transaction confirmation
8. Verify balance updated

**Treasury Flow**:
1. Check PYUSD wallet balance
2. Enter deposit amount
3. Approve Treasury (if needed)
4. Deposit PYUSD
5. Verify EVVM balance increased
6. Withdraw PYUSD
7. Verify wallet balance increased

**Fisher Staking Flow** (Public):
1. Navigate to `/fishing`
2. Ensure sufficient MATE balance (use faucet if needed)
3. Enter amount of MATE to stake (e.g., 5083 for 1 staking token)
4. Click "Stake MATE"
5. Sign staking message in wallet (nonce verification signature)
6. Wait for payment signature prompt
7. Sign payment message (MATE transfer signature)
8. Wait for transaction confirmation
9. Verify "Fisher Status" shows "✓ Active"
10. Check staked amount updated

**Golden Fisher Staking Flow** (VIP):
1. Connect with golden fisher wallet address
2. Navigate to `/fishing`
3. Verify "Golden Fisher VIP Staking" card appears
4. Check Contract Data shows EVVM ID and Nonce loaded
5. Enter MATE amount (automatically converts to staking tokens)
6. Click "✨ Golden Stake (Instant)"
7. Sign payment message ONLY (no staking signature needed!)
8. Wait for transaction confirmation
9. Verify staking successful with transaction link

**Fisher Bot Setup** (Backend):
1. Ensure you're a staker (stake MATE first)
2. Add private key to `.env`: `FISHER_PRIVATE_KEY=0x...`
3. Run: `cd packages/nextjs && yarn fisher:start`
4. Bot monitors mempool for signed payment messages
5. Executes transactions and earns MATE rewards
6. View performance in Fisher Dashboard

---

## 📚 Documentation

### Project Documentation
- **ENV_SETUP_GUIDE.md** - Complete environment configuration guide
- **QUICK_LOCAL_TEST.md** - Quick testing walkthrough
- **NONCE_ERROR_SOLUTION_PLAN.md** - Technical deep-dive on payment nonce handling
- **DEPLOYMENT_CHECKLIST.md** - Step-by-step deployment instructions
- **MATE_PAYMENT_AND_FAUCET.md** - Comprehensive MATE token feature documentation

### External Documentation
- **EVVM Documentation**: [evvm.info/docs](https://www.evvm.info/docs)
- **Payment Signature Structure**: [EVVM Signature Docs](https://www.evvm.info/docs/SignatureStructures/EVVM/SinglePaymentSignatureStructure)
- **Envio HyperSync**: [docs.envio.dev/docs/HyperSync](https://docs.envio.dev/docs/HyperSync)
- **Scaffold-ETH 2**: [docs.scaffoldeth.io](https://docs.scaffoldeth.io)

---

## 🐛 Troubleshooting

### Common Issues

**"WalletConnect Project ID is required"**
```bash
# Solution: Add to .env
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_actual_project_id
# Restart dev server
```

**"Insufficient PYUSD balance"**
```bash
# Solution: Get PYUSD from EVVM faucet
# Visit: https://www.evvm.info
# Or deposit from Sepolia wallet via Treasury
```

**HyperSync queries failing**
```bash
# Solution: Check internet connection
# HyperSync endpoint: https://sepolia.hypersync.xyz
# No API key required
```

---

## 🎯 Feature Highlights

### ✅ Completed Features

- [x] **Gasless PYUSD payment system** with EIP-191 signatures
- [x] **MATE token faucet** (2.5 to 12,707.5 MATE per claim)
- [x] **Gasless MATE payment system** with EIP-191 signatures
- [x] **HyperSync transaction history** (2000x faster than RPC)
- [x] **Real-time state monitoring** via direct RPC
- [x] **Treasury deposit/withdraw** with approval flow
- [x] **Multi-contract integration** (7 contracts)
- [x] **Professional UI/UX** with loading states and error handling
- [x] **Auto-refresh after transactions** (500ms delay for state propagation)
- [x] **Comprehensive documentation** (including MATE features)
- [x] **Production-ready deployment** config

### 🎣 Fisher System (NEW!)

- [x] **Fisher Staking Interface** - Stake MATE tokens to become a network fisher
- [x] **Golden Fisher VIP Staking** - Instant staking with no signature required for privileged operators
- [x] **Fisher Dashboard** - Track executions, rewards, profitability, and performance
- [x] **Backend Fisher Bot** - Automated mempool monitoring and transaction execution
- [x] **Earnings Analytics** - Real-time profit/loss tracking with gas cost analysis

### 🚧 In Progress

- [ ] NameService UI (username registration)
- [ ] GraphQL query interface for Envio
- [ ] Advanced transaction filtering

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

Built with ❤️ by **0xOucan**

- GitHub: [@0xOucan](https://github.com/0xOucan)
- EVVM Registry: [EVVM #1000](https://www.evvm.info/evvms/1000)

**Co-Developed with**:
- Claude (Anthropic) - AI pair programming assistant

---

## 🙏 Acknowledgments

- **EVVM Team** - For the innovative virtual machine architecture
- **Scaffold-ETH** - For the excellent dApp development framework
- **Envio** - For HyperSync and indexing infrastructure
- **Wagmi Team** - For best-in-class React hooks for Ethereum
- **Viem Team** - For type-safe Ethereum interactions
- **RainbowKit** - For beautiful wallet connection UX

---

## 🔗 Links

| Resource | URL |
|----------|-----|
| **GitHub** | https://github.com/0xOucan/PAYVVM |
| **EVVM Registry** | https://www.evvm.info/evvms/1000 |
| **EVVM Contract** | https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e |
| **Treasury Contract** | https://sepolia.etherscan.io/address/0x3D6cB29a1F97a2CFf7a48af96F7ED3A02F6aA38E |
| **PYUSD Token** | https://sepolia.etherscan.io/token/0xCaC524BcA292aaade2DF8A05cC58F0a65B1B3bB9 |

---

<div align="center">

**Built for the future of gasless, user-friendly Web3 payments**

[![Ethereum](https://img.shields.io/badge/Ethereum-Sepolia-blue)](https://sepolia.etherscan.io)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org)
[![Wagmi](https://img.shields.io/badge/Wagmi-2.16-purple)](https://wagmi.sh)

</div>
