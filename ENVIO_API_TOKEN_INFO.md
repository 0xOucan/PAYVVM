# Envio API Token - When Do You Need It?

## ❓ Question
**"Do I need an Envio API token in my `.env` file?"**

## ✅ Answer: It Depends!

### For LOCAL Development (Most Common)

**❌ NOT NEEDED**

When running the indexer on your local machine:

```bash
cd packages/envio
pnpm codegen
pnpm dev
```

- The indexer runs locally on your computer
- It connects directly to your RPC endpoint (ENVIO_RPC_URL)
- No authentication/API token required
- Just need: `ENVIO_RPC_URL=https://rpc.sepolia.org`

**Leave this EMPTY in your `.env`:**
```bash
ENVIO_API_TOKEN=
```

### For HOSTED Deployment (Production)

**✅ REQUIRED**

When deploying the indexer to Envio's cloud infrastructure:

```bash
envio deploy
```

- Indexer runs on Envio's servers (not your machine)
- Managed and hosted by Envio
- Requires authentication
- Must have API token

**Get your token from:**
https://envio.dev/app/api-tokens

**Set in your `.env`:**
```bash
ENVIO_API_TOKEN=your_actual_api_token_here
```

## 📋 Quick Decision Tree

```
┌─────────────────────────────────────┐
│ How are you running the indexer?   │
└──────────────┬──────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   LOCAL            HOSTED
  (on your PC)    (Envio cloud)
       │                │
       ▼                ▼
   No token        Need token
    needed!         required!
```

## 🎯 For Your PAYVVM Project

### Current Setup (Recommended)

**Use LOCAL indexer** during development:

```bash
# Terminal 1: Start local indexer
cd /home/oucan/PayVVM/envioftpayvvm/packages/envio
pnpm codegen
pnpm dev

# Terminal 2: Start frontend
cd /home/oucan/PayVVM/envioftpayvvm
yarn start
```

**Your `.env` needs:**
```bash
ENVIO_RPC_URL=https://rpc.sepolia.org
ENVIO_START_BLOCK=0  # Or your contract deployment block

# NOT NEEDED for local:
# ENVIO_API_TOKEN=
```

### Future Production Setup

**When deploying to production**, you have 2 options:

#### Option A: Keep Local Indexer
- Run indexer on your own server
- No Envio API token needed
- You manage the infrastructure

#### Option B: Use Hosted Indexer
- Deploy to Envio's cloud
- Get API token from Envio
- Envio manages the infrastructure
- Add to Vercel environment variables:
  ```
  ENVIO_API_TOKEN=your_token
  ```

## 📝 What's in Your `.env.example`

The centralized `.env.example` now includes:

```bash
# Envio Indexer RPC (for indexer to connect to blockchain)
ENVIO_RPC_URL=https://rpc.sepolia.org

# Envio API Token (OPTIONAL - only needed for hosted indexer)
# Local development: Leave empty
# Hosted deployment: Required
ENVIO_API_TOKEN=

# Envio Indexer Configuration
ENVIO_START_BLOCK=0
```

## 🔧 Configuration Summary

### Variables You NEED for Local Indexer:

| Variable | Required? | Value |
|----------|-----------|-------|
| `ENVIO_RPC_URL` | ✅ Yes | `https://rpc.sepolia.org` |
| `ENVIO_START_BLOCK` | ⚠️ Optional | `0` or your deployment block |
| `ENVIO_API_TOKEN` | ❌ No | Leave empty |

### Variables You NEED for Hosted Indexer:

| Variable | Required? | Value |
|----------|-----------|-------|
| `ENVIO_RPC_URL` | ✅ Yes | `https://rpc.sepolia.org` |
| `ENVIO_START_BLOCK` | ⚠️ Optional | `0` or your deployment block |
| `ENVIO_API_TOKEN` | ✅ Yes | Get from envio.dev |

## 🎓 More Information

- **Envio Documentation**: https://docs.envio.dev/
- **Get API Token**: https://envio.dev/app/api-tokens
- **Setup Guide**: `ENV_SETUP_GUIDE.md`
- **Main README**: `README.md`

## 🚀 TL;DR

**For now (local development):**
- ✅ Set `ENVIO_RPC_URL=https://rpc.sepolia.org`
- ✅ Leave `ENVIO_API_TOKEN` empty or commented out
- ✅ Run indexer locally with `pnpm dev`

**For later (production):**
- Decide: Self-host OR use Envio cloud
- If Envio cloud: Get token from envio.dev
- Add token to environment variables

---

**You're all set for local development!** The Envio API token is optional and not needed unless you're deploying the indexer to Envio's hosted service.
