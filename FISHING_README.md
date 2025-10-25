# 🎣 Fisher System - Quick Start Guide

Complete EVVM fisher implementation for automated payment execution and rewards.

---

## 📋 What is a Fisher?

Fishers are network participants who:
- **Monitor the mempool** for signed payment messages
- **Validate signatures** using EIP-191 standard
- **Execute transactions** on behalf of users
- **Earn rewards**: MATE base rewards + optional priority fees

**Benefits:**
- Stakers earn **doubled MATE rewards**
- Keep 100% of priority fees
- Fully automated operation

---

## 🚀 Quick Start

### 1. Frontend: Stake MATE Tokens

```bash
# Start the app
yarn start

# Open browser
http://localhost:3000/fishing

# Steps:
1. Connect your wallet
2. Claim MATE tokens from faucet (if needed)
3. Enter staking amount (5,083 MATE = 1 staking token)
4. Click "Stake MATE"
5. Sign the message in MetaMask
6. Wait for confirmation
7. ✓ You're now a staker!
```

### 2. Backend: Run Fisher Bot

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env and add your fisher private key
# FISHER_PRIVATE_KEY=0x...
# FISHER_ENABLED=true

# 3. Start fisher bot
yarn fisher:start

# Or in development mode (auto-restart on changes)
yarn fisher:dev
```

---

## ⚙️ Fisher Wallet Setup

### Create Dedicated Fisher Wallet

```bash
# Option 1: Using cast (Foundry)
cast wallet new

# Option 2: Using any Ethereum wallet
# Create a new wallet in MetaMask, Rabby, etc.
```

### Fund Fisher Wallet

1. **Sepolia ETH** (for gas costs)
   - Get from https://sepoliafaucet.com/
   - Need ~0.1 ETH for testing

2. **MATE Tokens** (for staking)
   - Use MATE faucet at http://localhost:3000/payvvm
   - Minimum: 5,083 MATE (1 staking token)
   - Recommended: 10,000+ MATE

3. **Stake MATE**
   - Go to http://localhost:3000/fishing
   - Stake your MATE tokens
   - Confirm you're a staker

### Extract Private Key

```bash
# From MetaMask
# 1. Click account menu
# 2. Account details
# 3. Export private key

# From cast wallet
cast wallet private-key YOUR_WALLET_NAME
```

**⚠️ SECURITY WARNING:**
- NEVER commit private keys to git
- Use a dedicated wallet for fisher only
- Keep private key in .env (gitignored)

---

## 📁 File Structure

```
packages/nextjs/
├── app/fishing/
│   └── page.tsx                    # Fishing page
│
├── components/fishing/
│   ├── StakeFisher.tsx             # Staking UI
│   └── FisherDashboard.tsx         # Stats dashboard
│
├── hooks/fishing/
│   ├── useStakeFisher.ts           # Staking logic
│   └── useFisherStats.ts           # Statistics tracking
│
└── fishing/
    ├── fisher-bot.ts               # Main fisher service ⭐
    ├── signature-validator.ts      # EIP-191 validation
    ├── nonce-manager.ts            # Nonce tracking
    └── types.ts                    # TypeScript types
```

---

## 🔧 Environment Configuration

### Required Variables

```bash
# .env

# Fisher wallet private key (REQUIRED)
FISHER_PRIVATE_KEY=0x1234567890abcdef...

# Enable fisher bot
FISHER_ENABLED=true

# Minimum priority fee to accept (optional)
FISHER_MIN_PRIORITY_FEE=0

# Gas limit per execution
FISHER_GAS_LIMIT=500000

# WebSocket URL for mempool monitoring
FISHER_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

### RPC Providers

**Option 1: Public RPC** (Free, but slow)
```bash
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
# WebSocket not available
```

**Option 2: Alchemy** (Recommended)
```bash
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
FISHER_WS_URL=wss://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
```

Get API key: https://dashboard.alchemy.com/

---

## 🎮 How to Use

### Frontend (Staking)

1. **Navigate to Fisher Station**
   ```
   http://localhost:3000/fishing
   ```

2. **View Your Status**
   - MATE Balance
   - Staked MATE
   - Fisher Status (Active/Inactive)

3. **Stake MATE**
   - Enter amount
   - Click "Stake MATE"
   - Sign message
   - Wait for confirmation

4. **Monitor Dashboard**
   - Total executions
   - Success rate
   - MATE earned
   - Profit/loss

### Backend (Fisher Bot)

1. **Start Fisher**
   ```bash
   yarn fisher:start
   ```

2. **Monitor Logs**
   ```
   🎣 Fisher Bot Starting...
   ✓ Staker status: Active
   ✓ Fisher bot ready
   👀 Monitoring mempool...
   ```

3. **Watch Executions**
   ```
   📨 Detected payment transaction: 0x123...
   🔍 Validating payment...
   ✓ All validations passed
   🎣 Executing payment...
   ✅ Payment executed successfully!
   ```

4. **View Stats**
   ```
   Press Ctrl+C to see statistics
   ```

---

## 💰 Economics

### Costs

- **Gas per execution**: ~0.001 - 0.003 ETH
- **Sepolia gas is cheap**: Usually < $0.01 per transaction

### Earnings

- **Base MATE reward**: Fixed amount per execution
- **Staker multiplier**: 2x rewards for stakers
- **Priority fees**: User-defined, you keep 100%

### Profitability

**Example:**
- Priority fee: 1 MATE = $0.50 (hypothetical)
- Gas cost: 0.002 ETH = $0.01
- **Profit**: $0.49 per execution

Monitor profitability in dashboard!

---

## 🧪 Testing

### Test Locally

1. **Start app**
   ```bash
   yarn start
   ```

2. **In another terminal, start fisher**
   ```bash
   yarn fisher:dev
   ```

3. **Send test payment**
   - Go to http://localhost:3000/payvvm
   - Use "Send MATE Payment"
   - Add priority fee (e.g., 0.5 MATE)
   - Send payment

4. **Watch fisher execute**
   - Fisher should detect it
   - Validate signature
   - Execute transaction
   - Earn priority fee

### Test on Testnet

1. **Deploy to Sepolia**
   ```bash
   # Set up fisher wallet with Sepolia ETH and MATE
   # Run fisher bot on server
   ```

2. **Send real payments**
   - From different wallet
   - With priority fees
   - Monitor execution

---

## 📊 Dashboard Features

### Real-time Stats

- **Total Executions**: Count of all attempts
- **Success Rate**: Percentage of successful executions
- **MATE Earned**: Total priority fees collected
- **Profit/Loss**: Earnings minus gas costs
- **Gas Spent**: Total ETH used for gas

### Recent Activity

Table showing last 10 executions:
- Timestamp
- From/To addresses
- Amount transferred
- Fee earned
- Gas cost
- Profit
- Status
- Etherscan link

---

## 🔍 Monitoring

### Fisher Bot Logs

```
🎣 Fisher Bot Starting...
===============================================
Fisher address: 0x1234...
Network: Ethereum Sepolia Testnet
EVVM contract: 0x9486...
Min priority fee: 0 wei
Gas limit: 500000
===============================================

✓ Staker status: Active
✓ Fisher bot ready

👀 Monitoring mempool for payment signatures...

📨 Detected payment transaction: 0xabc123...
🔍 Validating payment...
  From: 0x1234...
  To: 0x5678...
  Amount: 10.0000 tokens
  Priority Fee: 0.5000 MATE
✓ Signature valid
✓ Nonce valid
✓ All validations passed
🎣 Executing payment...
  Estimated gas: 250000
  Transaction sent: 0xdef456...
  Waiting for confirmation...
✅ Payment executed successfully!
  Gas used: 0.002500 ETH
  Priority fee earned: 0.5000 MATE
  View on Etherscan: https://sepolia.etherscan.io/tx/0xdef456...
```

### Statistics (Ctrl+C)

```
📊 Fisher Statistics
===============================================
Total Executions: 42
Successful: 40
Failed: 2
Success Rate: 95.24%
MATE Earned: 25.5000 MATE
Gas Spent: 0.085000 ETH
Uptime: 2h 15m 30s
===============================================
```

---

## ⚠️ Troubleshooting

### "Fisher wallet is not a staker"

**Solution:**
1. Go to http://localhost:3000/fishing
2. Stake MATE tokens
3. Wait for confirmation
4. Restart fisher bot

### "WebSocket connection failed"

**Solution:**
- Use Alchemy WebSocket URL
- Or bot will fall back to HTTP polling (slower)
- Check `FISHER_WS_URL` in .env

### "Insufficient funds for gas"

**Solution:**
- Add Sepolia ETH to fisher wallet
- Get from https://sepoliafaucet.com/

### "Priority fee too low"

**Solution:**
- Decrease `FISHER_MIN_PRIORITY_FEE` in .env
- Or wait for payments with higher fees

### No payments detected

**Solutions:**
1. Check fisher is running
2. Check WebSocket connection
3. Send test payment yourself
4. Wait for other users

---

## 🔐 Security Best Practices

### Private Key Management

✅ **DO:**
- Use dedicated wallet for fisher
- Store private key in `.env` (gitignored)
- Use environment variables in production
- Rotate keys periodically

❌ **DON'T:**
- Commit private keys to git
- Share private keys
- Use same wallet for multiple purposes
- Store keys in code

### Operational Security

- **Monitor continuously**: Set up alerts
- **Limit exposure**: Set max gas limits
- **Track profitability**: Stop if unprofitable
- **Regular backups**: Of statistics and logs

---

## 🚀 Production Deployment

### Server Setup

1. **Choose hosting**
   - VPS (DigitalOcean, Linode, etc.)
   - Cloud (AWS, GCP, Azure)
   - Dedicated server

2. **Install dependencies**
   ```bash
   # Node.js v18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs

   # Yarn
   npm install -g yarn
   ```

3. **Clone repository**
   ```bash
   git clone <your-repo>
   cd envioftpayvvm
   yarn install
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env  # Add FISHER_PRIVATE_KEY and other vars
   ```

5. **Run with PM2** (process manager)
   ```bash
   npm install -g pm2
   pm2 start yarn --name "fisher-bot" -- fisher:start
   pm2 save
   pm2 startup
   ```

### Monitoring & Alerts

- **PM2 Monitoring**: `pm2 monit`
- **Logs**: `pm2 logs fisher-bot`
- **Restart**: `pm2 restart fisher-bot`
- **Auto-restart on crash**: PM2 handles this

---

## 📚 Additional Resources

- **EVVM Documentation**: https://www.evvm.info/docs
- **Fisher Process**: https://www.evvm.info/docs/ProcessOfATransaction
- **Staking Guide**: https://www.evvm.info/docs/Staking/Introduction
- **EIP-191 Standard**: https://eips.ethereum.org/EIPS/eip-191
- **Implementation Plan**: See `FISHING_SYSTEM_PLAN.md`

---

## 🎯 Success Checklist

### Frontend
- [ ] Can connect wallet
- [ ] Can view MATE balance
- [ ] Can stake MATE tokens
- [ ] Can view staker status
- [ ] Dashboard shows stats
- [ ] Can unstake (with warning)

### Backend
- [ ] Fisher bot starts without errors
- [ ] Staker status confirmed
- [ ] Mempool monitoring active
- [ ] Can detect payments
- [ ] Validates signatures correctly
- [ ] Executes payments successfully
- [ ] Earns priority fees
- [ ] Tracks statistics

### Integration
- [ ] Staking updates fisher status
- [ ] User payments trigger fisher
- [ ] Dashboard reflects earnings
- [ ] Profitable operation

---

## 🎉 You're Ready!

Your fisher system is complete and ready to:
- ✅ Stake MATE tokens
- ✅ Monitor mempool
- ✅ Execute payments
- ✅ Earn rewards
- ✅ Track profitability

**Happy fishing!** 🎣
