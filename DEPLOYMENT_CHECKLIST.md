# PAYVVM Deployment Checklist

## ✅ Pre-Deployment Security Check

### 1. Environment Variables
- [ ] All `.env` files are listed in `.gitignore`
- [ ] No `.env` files are tracked by git (`git ls-files | grep .env` returns nothing except `.env.example`)
- [ ] All `.env.example` files contain only placeholder text (no real API keys)
- [ ] Private keys are stored in Foundry keystores, not in `.env` files
- [ ] No hardcoded private keys or API keys in source code

### 2. Sensitive Files
- [ ] No `*.pem`, `*.key`, `*.p12`, or `*.pfx` files are committed
- [ ] `.foundry/keystores/` directory is gitignored
- [ ] `broadcast/` directories are properly ignored (except for production deployment artifacts)
- [ ] No wallet seed phrases in code or documentation

### 3. Git Repository
Run these commands to verify:
```bash
# Check for tracked sensitive files
git ls-files | grep -E "\.env$|\.key$|\.pem$|keystore"

# Should return nothing (or only .env.example files)

# Check for API keys in committed files
git grep -i "api.*key.*=" | grep -v "example\|YOUR_"

# Should return nothing (or only placeholders)

# Check for private keys
git grep -i "private.*key\|0x[a-fA-F0-9]{64}"

# Should return nothing
```

## 📦 Vercel Deployment Steps

### 1. Prepare Repository

```bash
cd /home/oucan/PayVVM/envioftpayvvm

# Verify structure
ls -la
# Should show: PAYVVM/, packages/, vercel.json, README.md, .gitignore

# Check git status
git status

# Stage changes
git add .gitignore vercel.json README.md DEPLOYMENT_CHECKLIST.md

# Commit
git commit -m "chore: prepare for Vercel deployment"

# Push to GitHub
git push origin main
```

### 2. Vercel Dashboard Setup

1. **Import Project**
   - Go to https://vercel.com/dashboard
   - Click "Add New Project"
   - Import from GitHub
   - Select your `envioftpayvvm` repository

2. **Configure Build Settings**

   Vercel should auto-detect Next.js, but verify:

   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (or leave blank)
   - **Build Command**: `cd packages/nextjs && yarn build`
   - **Output Directory**: `packages/nextjs/.next`
   - **Install Command**: `yarn install`

3. **Environment Variables**

   Add these in Vercel dashboard:

   **Required:**
   ```
   NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<your_reown_project_id>
   ```

   **Optional (with good defaults):**
   ```
   NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org
   NEXT_PUBLIC_CHAIN_ID=11155111
   NEXT_PUBLIC_NETWORK_NAME=sepolia
   ```

   **Contract Addresses (already in code, but can override):**
   ```
   NEXT_PUBLIC_EVVM_ADDRESS=0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e
   NEXT_PUBLIC_NAMESERVICE_ADDRESS=0xa4ba4e9270bde8fbbf4328925959287a72ba0a55
   NEXT_PUBLIC_STAKING_ADDRESS=0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816
   NEXT_PUBLIC_TREASURY_ADDRESS=0x3d6cb29a1f97a2cff7a48af96f7ed3a02f6aa38e
   NEXT_PUBLIC_ESTIMATOR_ADDRESS=0x5db7cdb7601f9abcfc5089d66b1a3525471bf2ab
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployment URL

### 3. Post-Deployment Verification

After deployment, test:

- [ ] Homepage loads correctly
- [ ] Wallet connection works (MetaMask, WalletConnect, etc.)
- [ ] Network is set to Sepolia
- [ ] Contract addresses are correct
- [ ] No console errors related to environment variables
- [ ] RPC calls work (check browser DevTools Network tab)

## 🔄 Continuous Deployment

Vercel will automatically deploy on every push to `main` branch.

To deploy manually:
```bash
# Install Vercel CLI
npm i -g vercel

# Link project (first time only)
vercel link

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## 🚨 Security Best Practices

### What to NEVER Commit

❌ `.env` files with real values
❌ Private keys in any form
❌ Wallet seed phrases
❌ API keys with spending limits
❌ Database credentials
❌ JWT secrets
❌ OAuth client secrets

### What is SAFE to Commit

✅ `.env.example` with placeholder text
✅ Public contract addresses
✅ Contract ABIs
✅ Public RPC URLs (without API keys)
✅ Chain IDs
✅ Public configuration

### Emergency: If You Accidentally Commit Secrets

1. **Rotate immediately**: Generate new API keys/private keys
2. **Remove from history**: Use `git filter-branch` or BFG Repo-Cleaner
3. **Force push**: `git push origin --force --all`
4. **Update Vercel**: Update environment variables with new secrets

```bash
# Remove file from git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/secret/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push
git push origin --force --all
git push origin --force --tags
```

## 📝 Environment Variables Reference

### Local Development (Root .env)

```bash
# Quick setup with script
./setup-env.sh

# Or manually
cp .env.example .env

# Edit the .env file with your values
# Minimum required: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID
```

**Note**: All packages (nextjs, envio, foundry) now use the centralized `.env` file at the root for easier management.

### Vercel Production

Set in Vercel Dashboard → Settings → Environment Variables

Mark variables starting with `NEXT_PUBLIC_` as available to the browser.

## 🎯 Deployment Domains

After deployment, you'll have:

- **Production**: `your-project.vercel.app`
- **Preview**: Auto-generated for each PR/branch
- **Custom Domain**: Configure in Vercel settings

## 🔗 Helpful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Vercel Docs**: https://vercel.com/docs
- **WalletConnect/Reown**: https://cloud.reown.com/
- **Sepolia Faucet**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Your EVVM**: https://www.evvm.info/evvms/1000

## ✅ Final Checklist Before Going Live

- [ ] All security checks passed
- [ ] Environment variables configured in Vercel
- [ ] Test deployment successful
- [ ] Wallet connection works
- [ ] Contract interactions work
- [ ] No console errors
- [ ] Mobile responsive
- [ ] SEO tags configured (optional)
- [ ] Analytics configured (optional)
- [ ] Custom domain configured (optional)

---

**Ready to deploy!** 🚀

Follow the steps above and your PAYVVM Explorer will be live on Vercel.
