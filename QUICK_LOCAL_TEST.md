# Quick Local Testing Guide - PAYVVM

## 🎯 Test Your New Centralized .env Setup

Let's test your PAYVVM project locally with the new centralized environment configuration!

## ⚡ Quick Start (3 Steps)

### Step 1: Verify .env Configuration

```bash
cd /home/oucan/PayVVM/envioftpayvvm

# Check .env file exists
ls -la .env

# Verify key variables are set
cat .env | grep -E "NEXT_PUBLIC_WALLET_CONNECT|NEXT_PUBLIC_RPC|ENVIO_START_BLOCK"
```

**Required variables:**
- ✅ `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` - Get from https://cloud.reown.com/
- ✅ `NEXT_PUBLIC_RPC_URL` - Default: https://rpc.sepolia.org
- ✅ `ENVIO_START_BLOCK` - Should be: 9455841

### Step 2: Install Dependencies

```bash
cd /home/oucan/PayVVM/envioftpayvvm
yarn install
```

Wait for: `✨  Done in XX.XXs`

### Step 3: Start Frontend

```bash
yarn start
```

Should see:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in XXXms
```

**Open**: http://localhost:3000

## ✅ Verification Tests

### Test 1: Environment Variables Loaded

Open browser console (F12) and run:

```javascript
console.log({
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
  evvmAddress: process.env.NEXT_PUBLIC_EVVM_ADDRESS,
  nameServiceAddress: process.env.NEXT_PUBLIC_NAMESERVICE_ADDRESS,
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
  walletConnect: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID ? '✅ Set' : '❌ Not Set'
});
```

**Expected output:**
```javascript
{
  rpcUrl: "https://rpc.sepolia.org",
  evvmAddress: "0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e",
  nameServiceAddress: "0xa4ba4e9270bDE8FbBF4328925959287a72BA0a55",
  chainId: "11155111",
  walletConnect: "✅ Set"
}
```

### Test 2: Wallet Connection

1. Click **"Connect Wallet"** button
2. Should show options: MetaMask, WalletConnect, etc.
3. Connect with MetaMask
4. Should show your address and balance

**If it fails:**
- Check `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` in `.env`
- Restart dev server: Ctrl+C then `yarn start`

### Test 3: RPC Connection

In browser console:

```javascript
fetch('https://rpc.sepolia.org', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    jsonrpc: '2.0',
    method: 'eth_chainId',
    params: [],
    id: 1
  })
})
.then(r => r.json())
.then(data => {
  console.log('Chain ID:', parseInt(data.result, 16));
  // Should show: Chain ID: 11155111 (Sepolia)
});
```

## 🔧 Optional: Test Indexer (Terminal 2)

If you want to test the Envio indexer:

```bash
# Open new terminal
cd /home/oucan/PayVVM/envioftpayvvm/packages/envio

# Generate types
pnpm codegen

# Start indexer
pnpm dev
```

**Expected:**
```
Starting Envio indexer...
Starting from block: 9455841
Connected to HyperSync: https://sepolia.hypersync.xyz
```

**Test GraphQL**: http://localhost:8080/graphql

**Test Query:**
```graphql
query {
  nameServiceRegistrations {
    id
    username
    owner
  }
}
```

## 🎯 Success Checklist

Your setup is working if:

- [ ] Frontend runs at http://localhost:3000
- [ ] Environment variables show in console
- [ ] Wallet connection works
- [ ] No critical errors in browser console
- [ ] Network shows as Sepolia (11155111)
- [ ] (Optional) Indexer runs at http://localhost:8080

## 🐛 Common Issues & Fixes

### Issue: "WalletConnect Project ID is required"

**Fix:**
```bash
# 1. Get Project ID from https://cloud.reown.com/
# 2. Add to .env:
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_actual_project_id_here
# 3. Restart: Ctrl+C then yarn start
```

### Issue: Variables showing as undefined

**Fix:**
```bash
# Make sure you're in the right directory
cd /home/oucan/PayVVM/envioftpayvvm

# Check .env exists at root (not in packages/)
ls -la .env

# Restart dev server
# Ctrl+C
yarn start
```

### Issue: Port 3000 already in use

**Fix:**
```bash
# Kill existing process
killall node

# Or use different port
PORT=3001 yarn start
```

### Issue: Indexer can't connect to RPC

**Fix:**
```bash
# Check ENVIO_RPC_URL in .env
cat .env | grep ENVIO_RPC_URL

# Should be: https://rpc.sepolia.org
# If not set, add it and restart indexer
```

## 📊 Testing Your Configuration

Run this quick test script:

```bash
cd /home/oucan/PayVVM/envioftpayvvm

# Check .env
echo "Checking .env configuration..."
if [ -f ".env" ]; then
    echo "✅ .env file exists"

    if grep -q "your_reown_project_id_here" .env; then
        echo "⚠️  WARNING: WalletConnect Project ID not configured"
        echo "   Get one from: https://cloud.reown.com/"
    else
        echo "✅ WalletConnect Project ID configured"
    fi

    if grep -q "ENVIO_START_BLOCK=9455841" .env; then
        echo "✅ Start block configured correctly"
    else
        echo "⚠️  Start block may not be optimal"
    fi
else
    echo "❌ .env file not found! Run: ./setup-env.sh"
fi

# Check dependencies
if [ -d "node_modules" ]; then
    echo "✅ Dependencies installed"
else
    echo "⚠️  Dependencies not installed. Run: yarn install"
fi

echo ""
echo "Ready to test? Run: yarn start"
```

## 🚀 What to Test

### Basic Functionality

1. **Homepage loads** - http://localhost:3000
2. **Wallet connects** - Click connect wallet
3. **Network correct** - Shows Sepolia
4. **No errors** - Check console (F12)

### Contract Interaction (if components exist)

1. **Read contract data** - View EVVM state
2. **Username search** - Search for names
3. **View profiles** - If implemented

### Advanced (Optional)

1. **Indexer running** - http://localhost:8080/graphql
2. **GraphQL queries work** - Test queries
3. **Data syncing** - Indexer catches up to latest block

## 📝 Test Results Template

```
PAYVVM Local Test Results
========================

Environment:
[ ] .env configured with WalletConnect ID
[ ] All NEXT_PUBLIC_ variables set
[ ] ENVIO_START_BLOCK = 9455841

Frontend:
[ ] Starts without errors
[ ] Loads at http://localhost:3000
[ ] Environment variables loaded
[ ] Wallet connection works
[ ] Network = Sepolia (11155111)

Indexer (optional):
[ ] Starts without errors
[ ] Connects to HyperSync
[ ] Starts from block 9455841
[ ] GraphQL playground works

Issues Found:
-
-

Notes:
-
-
```

## 🎉 Next Steps

After successful local testing:

1. **Explore the UI** - Test all features
2. **Test username registration** - If implemented
3. **Deploy to Vercel** - See `DEPLOYMENT_CHECKLIST.md`
4. **Share your app** - Get feedback!

## 📚 Resources

- **Full Testing Guide**: `LOCAL_TESTING_GUIDE.md`
- **Environment Setup**: `ENV_SETUP_GUIDE.md`
- **Deployment Guide**: `DEPLOYMENT_CHECKLIST.md`
- **Project README**: `README.md`

---

**Ready? Let's go!** 🚀

```bash
cd /home/oucan/PayVVM/envioftpayvvm
yarn start
```

Then open: http://localhost:3000
