# Environment Variables Setup Guide

## 🎯 Centralized Configuration

All environment variables for the PAYVVM project are now managed from a **single centralized `.env` file** at the root of the `envioftpayvvm/` directory.

This makes it much easier to:
- ✅ Configure variables once for all packages
- ✅ Deploy to Vercel with minimal setup
- ✅ Keep environment variables synchronized
- ✅ Avoid duplicate configuration

## 📂 File Structure

```
envioftpayvvm/
├── .env.example          # ← CENTRALIZED template (commit this)
├── .env                  # ← YOUR secrets (NEVER commit)
├── setup-env.sh          # ← Quick setup script
│
├── packages/
│   ├── nextjs/
│   │   └── .env.example  # Reference only (points to root)
│   ├── envio/
│   │   └── .env.example  # Reference only (points to root)
│   └── foundry/
│       └── .env.example  # Reference only (points to root)
```

## 🚀 Quick Setup

### Option 1: Use the Setup Script (Recommended)

```bash
cd /home/oucan/PayVVM/envioftpayvvm
./setup-env.sh
```

This will:
1. Copy `.env.example` to `.env`
2. Show you what needs to be configured
3. Guide you through the setup

### Option 2: Manual Setup

```bash
cd /home/oucan/PayVVM/envioftpayvvm
cp .env.example .env
nano .env  # or code .env, vim .env, etc.
```

## 📝 Required Configuration

### Minimum Required (Local Development)

Edit `.env` and set:

```bash
# REQUIRED: Get from https://cloud.reown.com/
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_actual_project_id_here
```

### Recommended (For Better Performance)

```bash
# Use Alchemy or Infura for faster, more reliable RPC
NEXT_PUBLIC_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# Or use Alchemy API key directly
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_key_here
```

### Optional (Advanced)

```bash
# For contract deployment
ETHERSCAN_API_KEY=your_etherscan_key
RPC_URL_ETH_SEPOLIA=https://rpc.sepolia.org

# For Envio indexer - Local Development
ENVIO_RPC_URL=https://rpc.sepolia.org
ENVIO_START_BLOCK=0  # Set to your contract deployment block for faster indexing

# For Envio indexer - Hosted Deployment (ONLY if deploying to Envio cloud)
ENVIO_API_TOKEN=your_envio_api_token  # Get from https://envio.dev/app/api-tokens
```

## 🌐 Vercel Deployment

When deploying to Vercel, you don't need to commit any `.env` file. Instead:

### 1. Push Your Code

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Configure in Vercel Dashboard

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables:

#### Required

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | `your_project_id` | Get from https://cloud.reown.com/ |

#### Recommended

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_RPC_URL` | `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY` | For better performance |
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | `your_alchemy_key` | Alternative to RPC_URL |

#### Optional (Have Defaults)

These are already configured in the code, but you can override them:

| Variable | Default Value |
|----------|---------------|
| `NEXT_PUBLIC_EVVM_ADDRESS` | `0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e` |
| `NEXT_PUBLIC_NAMESERVICE_ADDRESS` | `0xa4ba4e9270bDE8FbBF4328925959287a72BA0a55` |
| `NEXT_PUBLIC_CHAIN_ID` | `11155111` |
| `NEXT_PUBLIC_NETWORK_NAME` | `sepolia` |

### 3. Deploy

Vercel will automatically use these environment variables when building and running your app.

## 📦 How Packages Access Variables

### Next.js (Frontend)

Next.js automatically reads from `.env` files in the root directory.

Variables prefixed with `NEXT_PUBLIC_` are available in browser code:

```typescript
// In your React components
const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
const evvmAddress = process.env.NEXT_PUBLIC_EVVM_ADDRESS;
```

### Envio (Indexer)

Envio can read from the root `.env` or its package-specific `.env`:

```yaml
# In packages/envio/config.yaml
networks:
  - id: 11155111
    rpc_config:
      url: ${ENVIO_RPC_URL}  # From root .env
```

### Foundry (Contracts)

Foundry reads from `.env` files using `source .env` or the `--env-file` flag:

```bash
# In PAYVVM/
forge script script/Deploy.s.sol \
  --rpc-url $RPC_URL_ETH_SEPOLIA \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

## 🔒 Security Best Practices

### ❌ NEVER Commit These

```
.env                       # Your actual secrets
.env.local                 # Local overrides
.env.production            # Production secrets
packages/*/.env            # Package-specific secrets
*.pem, *.key               # Private keys
```

### ✅ Safe to Commit

```
.env.example               # Template with placeholders
Contract addresses         # Public blockchain data
Chain IDs                  # Public information
Public RPC URLs            # URLs without API keys
```

### 🔐 Storing Sensitive Data

| Type of Secret | Where to Store | How |
|----------------|----------------|-----|
| Private keys | Foundry keystore | `cast wallet import defaultKey --interactive` |
| API keys (local) | Root `.env` file | Edit `.env` after running `setup-env.sh` |
| API keys (Vercel) | Vercel dashboard | Project Settings → Environment Variables |
| WalletConnect ID | Both `.env` and Vercel | Required for wallet connections |

## 🧪 Testing Your Setup

### 1. Check Environment Variables are Loaded

```bash
cd /home/oucan/PayVVM/envioftpayvvm

# Start the dev server
yarn start

# Open browser console and check
console.log(process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID);
# Should show your actual Project ID, not "your_reown_project_id_here"
```

### 2. Test Wallet Connection

1. Visit `http://localhost:3000`
2. Click "Connect Wallet"
3. Should show wallet options (MetaMask, WalletConnect, etc.)
4. If it fails, check your `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`

### 3. Test RPC Connection

Open browser DevTools → Network tab:
- Should see RPC calls to your configured endpoint
- Check for `eth_chainId`, `eth_blockNumber` requests
- Verify they're successful (status 200)

## 🐛 Troubleshooting

### Issue: "WalletConnect Project ID is required"

**Solution**: Make sure `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` is set in `.env`

```bash
# Check if variable is set
cat .env | grep WALLET_CONNECT

# Should show your actual project ID
```

### Issue: Variables not loading in Next.js

**Solution**: Restart the dev server after changing `.env`

```bash
# Stop the server (Ctrl+C)
# Start again
yarn start
```

### Issue: "Cannot connect to RPC"

**Solutions**:

1. Check RPC URL is correct in `.env`:
   ```bash
   cat .env | grep RPC_URL
   ```

2. Try using a public RPC:
   ```bash
   NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
   ```

3. Check if your API key is valid (if using Alchemy/Infura)

### Issue: Environment variables undefined on Vercel

**Solutions**:

1. Verify variables are set in Vercel dashboard
2. Make sure variable names start with `NEXT_PUBLIC_` for client-side access
3. Redeploy after adding/changing variables

### Issue: "Do I need the Envio API token?"

**Answer**: It depends on your setup!

**For LOCAL development** (indexer running on your machine):
- ❌ **NOT NEEDED** - You can leave `ENVIO_API_TOKEN` empty
- The indexer runs locally and connects directly to your RPC
- No authentication needed

**For HOSTED deployment** (indexer on Envio's cloud):
- ✅ **REQUIRED** - You must set `ENVIO_API_TOKEN`
- Get it from https://envio.dev/app/api-tokens
- Needed to deploy and manage your indexer on Envio's infrastructure

**Quick check**:
```bash
# Running indexer locally?
cd packages/envio
pnpm dev
# → ENVIO_API_TOKEN not needed

# Deploying to Envio cloud?
envio deploy
# → ENVIO_API_TOKEN required
```

**Recommendation for PAYVVM**:
- Start with local indexer (no token needed)
- Use hosted indexer later for production (token needed)

## 📚 Reference: All Available Variables

See `.env.example` for the complete list with documentation for each variable.

### Quick Reference

```bash
# === REQUIRED ===
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...

# === BLOCKCHAIN CONNECTION ===
NEXT_PUBLIC_RPC_URL=...
NEXT_PUBLIC_ALCHEMY_API_KEY=...
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_NETWORK_NAME=sepolia

# === PAYVVM CONTRACTS ===
NEXT_PUBLIC_EVVM_ADDRESS=0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e
NEXT_PUBLIC_NAMESERVICE_ADDRESS=0xa4ba4e9270bDE8FbBF4328925959287a72BA0a55
NEXT_PUBLIC_STAKING_ADDRESS=...
NEXT_PUBLIC_TREASURY_ADDRESS=...
NEXT_PUBLIC_ESTIMATOR_ADDRESS=...

# === INDEXER ===
NEXT_PUBLIC_GRAPHQL_ENDPOINT=http://localhost:8080/graphql
ENVIO_RPC_URL=https://rpc.sepolia.org

# === CONTRACT DEPLOYMENT ===
RPC_URL_ETH_SEPOLIA=...
RPC_URL_ARB_SEPOLIA=...
ETHERSCAN_API_KEY=...
ARBISCAN_API_KEY=...
```

## 🎓 Additional Resources

- **WalletConnect Setup**: https://cloud.reown.com/
- **Alchemy Dashboard**: https://dashboard.alchemy.com/
- **Infura Dashboard**: https://infura.io/dashboard
- **Vercel Env Vars**: https://vercel.com/docs/environment-variables
- **Next.js Env Vars**: https://nextjs.org/docs/basic-features/environment-variables

---

**Need help?** Check the main `README.md` or `DEPLOYMENT_CHECKLIST.md` for more information.
