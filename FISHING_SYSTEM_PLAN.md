# EVVM Fisher System - Complete Implementation Plan

## 🎯 Mission Overview

Build a complete fisher system for EVVM that enables automated transaction execution:

**Frontend Component**: Staking interface for becoming a fisher
**Backend Service**: Fisher bot that listens for payment signatures and executes them

---

## 📋 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   FISHING SYSTEM ARCHITECTURE                │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┐         ┌──────────────────────┐
│   FRONTEND (React)   │         │  BACKEND (Node.js)   │
│                      │         │                      │
│  StakeFisher.tsx     │         │  fisher-bot.ts       │
│  - Stake MATE        │         │  - Load private key  │
│  - Sign message      │         │  - Monitor mempool   │
│  - Submit to fisher  │         │  - Execute payments  │
│                      │         │  - Earn rewards      │
└──────────┬───────────┘         └──────────┬───────────┘
           │                                │
           │                                │
           ▼                                ▼
    ┌─────────────────────────────────────────────┐
    │      Ethereum Sepolia Testnet               │
    │                                             │
    │  ┌──────────────┐    ┌──────────────┐     │
    │  │ EVVM Contract│    │Staking Contract│    │
    │  │              │◄───┤               │     │
    │  │ - pay()      │    │ - publicStaking()│  │
    │  │ - payments   │    │ - staker status│    │
    │  └──────────────┘    └──────────────┘     │
    │                                             │
    │  ┌──────────────────────────────┐          │
    │  │ Mempool                      │          │
    │  │ - Pending pay() calls        │          │
    │  │ - Signatures waiting for exec│          │
    │  └──────────────────────────────┘          │
    └─────────────────────────────────────────────┘
```

---

## 🔧 Technical Requirements

### Environment Variables (.env)

```bash
# Existing
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...
NEXT_PUBLIC_RPC_URL=...

# NEW - Fisher Configuration
FISHER_PRIVATE_KEY=0x...  # Private key for fisher wallet
FISHER_ENABLED=true        # Enable/disable fisher bot
FISHER_MIN_PRIORITY_FEE=0  # Minimum priority fee to accept (in MATE)
FISHER_GAS_LIMIT=500000    # Max gas per execution
```

### Contract Addresses

```typescript
// Ethereum Sepolia
EVVM_ADDRESS = '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e'
STAKING_ADDRESS = '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816'
MATE_TOKEN = '0x0000000000000000000000000000000000000001'
```

---

## 📦 Implementation Plan

### Phase 1: Frontend - Staking Component

**File Structure:**
```
packages/nextjs/
├── components/fishing/
│   ├── StakeFisher.tsx        # Main staking component
│   └── FisherDashboard.tsx    # Fisher status & earnings
│
├── hooks/fishing/
│   ├── useStakeFisher.ts      # Staking hook
│   └── useFisherStats.ts      # Fisher stats hook
│
└── app/fishing/
    └── page.tsx               # Fishing page
```

#### Component: StakeFisher.tsx

**Features:**
- Display current MATE balance
- Input field for staking amount
- Button to stake MATE tokens (sign message)
- Show staker status (active/inactive)
- Display staked amount
- Unstaking functionality (21-day cooldown)

**User Flow:**
1. Connect wallet
2. Check MATE balance
3. Enter staking amount
4. Click "Stake MATE"
5. Sign staking message (EIP-191)
6. Fisher executes staking transaction
7. User becomes staker
8. Can now run fisher bot

**Staking Message Format:**
```
{evvmID},publicStaking,{isStaking},{amountOfStaking},{nonce}

Example:
1000,publicStaking,true,5083000000000000000000,42
```

**Function Signature:**
```solidity
publicStaking(
  address user,              // User address
  bool isStaking,            // true = stake, false = unstake
  uint256 amountOfStaking,   // Amount in wei (18 decimals)
  uint256 nonce,             // Staking contract nonce
  bytes signature,           // User's signature
  uint256 priorityFee_EVVM,  // Priority fee for execution
  uint256 nonce_EVVM,        // EVVM nonce
  bool priorityFlag_EVVM,    // false = sync
  bytes signature_EVVM       // EVVM signature
)
```

---

### Phase 2: Backend - Fisher Bot

**File Structure:**
```
packages/nextjs/
├── fishing/
│   ├── fisher-bot.ts          # Main fisher service
│   ├── signature-validator.ts # Signature verification
│   ├── nonce-manager.ts       # Nonce tracking
│   └── types.ts               # TypeScript types
│
└── scripts/
    └── run-fisher.ts          # Start fisher bot
```

#### Fisher Bot Workflow

**1. Initialization**
```typescript
// Load fisher private key from .env
const fisherWallet = new Wallet(process.env.FISHER_PRIVATE_KEY, provider);

// Check fisher is staker
const isStaker = await evvmContract.isAddressStaker(fisherWallet.address);
if (!isStaker) {
  throw new Error('Fisher wallet is not a staker. Please stake MATE first.');
}

// Start monitoring
console.log('Fisher bot started...');
console.log('Fisher address:', fisherWallet.address);
console.log('Staker status: ✓');
```

**2. Mempool Monitoring**

**IMPORTANT**: HyperSync CANNOT be used for mempool monitoring!

Use WebSocket provider with pending transaction filter:

```typescript
// Subscribe to pending transactions
provider.on('pending', async (txHash) => {
  try {
    const tx = await provider.getTransaction(txHash);

    // Filter for EVVM contract
    if (tx.to?.toLowerCase() !== EVVM_ADDRESS.toLowerCase()) {
      return;
    }

    // Check if it's a pay() function call
    const functionSelector = tx.data.slice(0, 10);

    // pay() selector: 0x8925c62c
    // caPay() selector: need to look up

    if (functionSelector === '0x8925c62c') {
      await handlePaymentTransaction(tx);
    }
  } catch (error) {
    console.error('Error processing pending tx:', error);
  }
});
```

**3. Transaction Validation**

```typescript
async function handlePaymentTransaction(tx: Transaction) {
  // Decode transaction data
  const decoded = evvmInterface.decodeFunctionData('pay', tx.data);

  const {
    from,
    to_address,
    to_identity,
    token,
    amount,
    priorityFee,
    nonce,
    priorityFlag,
    executor,
    signature
  } = decoded;

  // Validate signature
  const isValid = await validateSignature(
    from,
    to_address,
    token,
    amount,
    priorityFee,
    nonce,
    signature
  );

  if (!isValid) {
    console.log('Invalid signature, skipping');
    return;
  }

  // Check nonce hasn't been used
  const currentNonce = await evvmContract.getNextCurrentSyncNonce(from);
  if (nonce < currentNonce) {
    console.log('Nonce already used, skipping');
    return;
  }

  // Check minimum priority fee
  const minFee = parseUnits(process.env.FISHER_MIN_PRIORITY_FEE || '0', 18);
  if (priorityFee < minFee) {
    console.log('Priority fee too low, skipping');
    return;
  }

  // Execute!
  await executePayment(decoded);
}
```

**4. Transaction Execution**

```typescript
async function executePayment(paymentData: any) {
  try {
    console.log('🎣 Executing payment...');
    console.log('From:', paymentData.from);
    console.log('To:', paymentData.to_address);
    console.log('Amount:', formatUnits(paymentData.amount, 18));
    console.log('Priority Fee:', formatUnits(paymentData.priorityFee, 18));

    const tx = await evvmContract.connect(fisherWallet).pay(
      paymentData.from,
      paymentData.to_address,
      paymentData.to_identity,
      paymentData.token,
      paymentData.amount,
      paymentData.priorityFee,
      paymentData.nonce,
      paymentData.priorityFlag,
      paymentData.executor,
      paymentData.signature,
      {
        gasLimit: process.env.FISHER_GAS_LIMIT || 500000
      }
    );

    console.log('Transaction sent:', tx.hash);

    const receipt = await tx.wait();

    console.log('✓ Payment executed successfully!');
    console.log('Gas used:', receipt.gasUsed.toString());
    console.log('Earned priority fee:', formatUnits(paymentData.priorityFee, 18), 'MATE');

    // Update earnings tracker
    await trackEarnings(paymentData.priorityFee, receipt.gasUsed);

  } catch (error) {
    console.error('❌ Execution failed:', error);
  }
}
```

**5. Signature Validation**

```typescript
function validateSignature(
  from: string,
  to: string,
  token: string,
  amount: bigint,
  priorityFee: bigint,
  nonce: bigint,
  signature: string
): boolean {
  // Construct message
  const evvmId = 1000; // Your EVVM ID
  const message = `${evvmId},pay,${to.toLowerCase()},${token.toLowerCase()},${amount},${priorityFee},${nonce},false,${zeroAddress}`;

  // Hash message (EIP-191)
  const messageHash = hashMessage(message);

  // Recover signer
  const recoveredAddress = recoverAddress(messageHash, signature);

  // Verify signer matches 'from'
  return recoveredAddress.toLowerCase() === from.toLowerCase();
}
```

---

### Phase 3: Integration & Deployment

**1. Frontend Integration**

Add fishing page to main navigation:

```typescript
// packages/nextjs/app/fishing/page.tsx
import { StakeFisher } from '~~/components/fishing/StakeFisher';
import { FisherDashboard } from '~~/components/fishing/FisherDashboard';

export default function FishingPage() {
  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1>Fisher Station</h1>

      {/* Staking Section */}
      <StakeFisher />

      {/* Fisher Stats */}
      <FisherDashboard />
    </div>
  );
}
```

**2. Backend Service**

```bash
# Start fisher bot
yarn fisher:start

# Stop fisher bot
yarn fisher:stop

# View fisher logs
yarn fisher:logs
```

**3. Package.json Scripts**

```json
{
  "scripts": {
    "fisher:start": "tsx packages/nextjs/fishing/fisher-bot.ts",
    "fisher:dev": "tsx watch packages/nextjs/fishing/fisher-bot.ts",
    "fisher:build": "tsc packages/nextjs/fishing/fisher-bot.ts"
  }
}
```

---

## 🔐 Security Considerations

### Private Key Management

**NEVER** commit `FISHER_PRIVATE_KEY` to git:
```bash
# .env (gitignored)
FISHER_PRIVATE_KEY=0x...

# .env.example (committed)
FISHER_PRIVATE_KEY=0x_your_fisher_wallet_private_key_here
```

### Fisher Wallet Setup

1. Create new wallet for fisher
2. Fund with Sepolia ETH (for gas)
3. Transfer MATE tokens (5,083 MATE = 1 staking token)
4. Stake MATE tokens to become staker
5. Start fisher bot

### Rate Limiting

Prevent spam and manage gas costs:
```typescript
const rateLimiter = {
  maxExecutionsPerMinute: 10,
  maxGasPerHour: parseUnits('0.01', 'ether'), // 0.01 ETH/hour
  minTimeBetweenExecutions: 1000, // 1 second
};
```

---

## 📊 Monitoring & Analytics

### Fisher Dashboard Features

**Real-time Stats:**
- Total transactions executed
- Total MATE earned (rewards + priority fees)
- Total gas spent
- Profit/loss tracking
- Success/failure rate

**Recent Activity:**
- Last 10 executed payments
- Timestamp, sender, amount, fee earned
- Etherscan links

**Performance Metrics:**
- Average execution time
- Gas efficiency
- Uptime percentage

---

## 🧪 Testing Strategy

### Local Testing

**1. Test Staking:**
```bash
# Start local chain
yarn chain

# Deploy contracts
yarn deploy

# Test staking component
# - Connect wallet
# - Stake MATE tokens
# - Verify staker status
```

**2. Test Fisher Bot:**
```bash
# Start fisher bot in dev mode
yarn fisher:dev

# In another terminal, send test payment
# - Use MatePayment component
# - Send payment to another address
# - Watch fisher bot logs
# - Verify execution
```

### Testnet Testing

**1. Setup:**
- Create fisher wallet
- Fund with Sepolia ETH
- Claim MATE from faucet
- Stake MATE tokens

**2. Run Fisher:**
```bash
# Set environment variables
export FISHER_PRIVATE_KEY=0x...
export FISHER_ENABLED=true

# Start fisher bot
yarn fisher:start
```

**3. Test Execution:**
- Use another wallet
- Send MATE payment with priority fee
- Watch fisher bot execute
- Verify transaction on Etherscan

---

## 📈 Performance Optimization

### Mempool Monitoring

Use WebSocket provider for real-time updates:
```typescript
const provider = new WebSocketProvider(
  'wss://eth-sepolia.g.alchemy.com/v2/YOUR_KEY'
);
```

### Gas Optimization

Monitor gas prices and adjust:
```typescript
const gasPrice = await provider.getGasPrice();
const maxFeePerGas = gasPrice * 120n / 100n; // 20% buffer

const tx = await contract.pay(...args, {
  maxFeePerGas,
  maxPriorityFeePerGas: gasPrice / 10n,
});
```

### Concurrent Execution

Handle multiple pending transactions:
```typescript
const executionQueue = new PQueue({ concurrency: 3 });

executionQueue.add(() => executePayment(payment1));
executionQueue.add(() => executePayment(payment2));
```

---

## 🚀 Deployment Checklist

### Prerequisites
- [ ] Fisher wallet created and funded
- [ ] MATE tokens claimed from faucet
- [ ] MATE staked (minimum 5,083 MATE)
- [ ] Staker status confirmed
- [ ] `.env` configured with `FISHER_PRIVATE_KEY`

### Frontend Deployment
- [ ] StakeFisher component tested
- [ ] Fisher dashboard displays correctly
- [ ] Staking flow works end-to-end
- [ ] Unstaking flow works (21-day cooldown)

### Backend Deployment
- [ ] Fisher bot starts without errors
- [ ] Mempool monitoring working
- [ ] Signature validation working
- [ ] Transaction execution successful
- [ ] Earnings tracking accurate

### Production
- [ ] Deploy frontend to Vercel
- [ ] Run fisher bot on persistent server (VPS, Railway, etc.)
- [ ] Set up monitoring/alerts
- [ ] Configure logging (Winston, Pino)
- [ ] Set up error notifications (Discord, Telegram)

---

## 🎯 Success Criteria

**Frontend:**
- ✅ Users can stake MATE tokens
- ✅ Users can view staker status
- ✅ Users can track staked amount
- ✅ Users can unstake (with cooldown warning)

**Backend:**
- ✅ Fisher bot detects pending payments
- ✅ Fisher bot validates signatures correctly
- ✅ Fisher bot executes valid payments
- ✅ Fisher earns priority fees
- ✅ Fisher tracks earnings accurately

**Integration:**
- ✅ Frontend staking → Backend fisher status
- ✅ User payment → Fisher execution → State update
- ✅ Real-time dashboard updates
- ✅ Profitable operation (fees > gas costs)

---

## 📚 Key Documentation References

- **EVVM Process**: https://www.evvm.info/docs/ProcessOfATransaction
- **Staking Integration**: https://www.evvm.info/docs/EVVM/StakingIntegration
- **Public Staking Function**: https://www.evvm.info/docs/Staking/StakingContract/StakingFunctions/publicStaking
- **Staking Signature**: https://www.evvm.info/docs/SignatureStructures/Staking/StandardStakingStructure
- **Payment Signature**: https://www.evvm.info/docs/SignatureStructures/EVVM/SinglePaymentSignatureStructure
- **EIP-191**: https://eips.ethereum.org/EIPS/eip-191

---

## 🔄 Next Steps

1. **Create fishing/ directory structure**
2. **Implement StakeFisher component**
3. **Implement useStakeFisher hook**
4. **Build fisher-bot.ts service**
5. **Test staking flow**
6. **Test fisher execution**
7. **Deploy to testnet**
8. **Monitor and optimize**

---

## ⚠️ Important Notes

### HyperSync Limitation
**HyperSync CANNOT be used for mempool monitoring!**
- HyperSync is for historical/confirmed data only
- Must use WebSocket RPC provider for pending transactions
- Subscribe to 'pending' events and filter manually

### Staking Requirements
- **Conversion**: 1 staking token = 5,083 MATE tokens
- **Minimum**: No explicit minimum, but practical minimum is 1 staking token
- **Cooldown**: 21-day waiting period for unstaking
- **Rewards**: Stakers earn doubled rewards

### Gas Costs
- Fisher pays gas on Ethereum Sepolia
- Must ensure priority fees > gas costs
- Monitor profitability continuously
- Set minimum priority fee threshold

---

**This plan provides a complete roadmap for building the EVVM Fisher System!** 🎣
