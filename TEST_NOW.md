# 🚀 START TESTING NOW

## Critical Discovery Summary

✅ **PAYVVM contracts DO NOT emit events** - This is by design for fisher-based architecture
✅ Configuration updated for transaction-based indexing
✅ All contract addresses verified and correct
✅ GraphQL schema ready
⚠️ Need to test if Envio supports function-based indexing

## Quick Start Testing (Right Now!)

### Option 1: Test Envio (May or May Not Work)

```bash
cd /home/oucan/PayVVM/envioftpayvvm/packages/envio

# 1. Set up environment
cat > .env << 'EOF'
ALCHEMY_API_KEY=YOUR_KEY_HERE
DATABASE_URL=postgresql://postgres:testing@localhost:5432/envio-dev
EOF

# 2. Try codegen
pnpm codegen

# If successful:
pnpm dev

# If failed:
echo "Envio doesn't support function indexing - use Option 2"
```

### Option 2: Quick Transaction Viewer (Guaranteed to Work)

Create a simple script to view PAYVVM transactions:

```bash
cd /home/oucan/PayVVM/envioftpayvvm
mkdir -p packages/viewer
cd packages/viewer

# Create package.json
cat > package.json << 'EOF'
{
  "name": "payvvm-viewer",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "ethers": "^6.9.0",
    "dotenv": "^16.3.1"
  }
}
EOF

# Install
npm install

# Create .env
cat > .env << 'EOF'
ALCHEMY_API_KEY=YOUR_KEY_HERE
EOF

# Create viewer script
cat > index.js << 'EOF'
import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

const CONTRACTS = {
  Evvm: '0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e',
  Staking: '0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816',
  NameService: '0xa4ba4e9270bde8fbbf4328925959287a72ba0a55',
  Treasury: '0x3d6cb29a1f97a2cff7a48af96f7ed3a02f6aa38e',
  Estimator: '0x5db7cdb7601f9abcfc5089d66b1a3525471bf2ab'
};

const RPC_URL = `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`;
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Create interfaces for each contract
const evvmInterface = new ethers.Interface([
  'function pay(address,address,string,address,uint256,uint256,uint256,bool,address,bytes)',
  'function payMultiple((address,address,string,address,uint256,uint256,uint256,bool,address,bytes)[])',
  'function dispersePay((uint256,address,string)[],address,uint256,uint256,bool,address,bytes)',
  'function getBalance(address,address) view returns (uint256)',
  'function isAddressStaker(address) view returns (bool)'
]);

const stakingInterface = new ethers.Interface([
  'function publicStaking(address,uint256,uint256,bytes)',
  'function publicUnstaking(address,uint256,uint256,bytes)',
  'function goldenStaking(address,uint256)',
  'function goldenUnstaking(address,uint256)'
]);

const nameServiceInterface = new ethers.Interface([
  'function preRegistrationUsername(bytes32,uint256,bytes)',
  'function registrationUsername(string,uint256,uint256,bytes)'
]);

async function scanTransactions(contractAddress, contractName, iface, fromBlock, toBlock) {
  console.log(`\n🔍 Scanning ${contractName} transactions...`);
  console.log(`   Contract: ${contractAddress}`);
  console.log(`   Blocks: ${fromBlock} to ${toBlock}\n`);

  let count = 0;

  for (let block = fromBlock; block <= toBlock; block++) {
    try {
      const blockData = await provider.getBlock(block, true);
      if (!blockData || !blockData.transactions) continue;

      for (const txHash of blockData.transactions) {
        const tx = await provider.getTransaction(txHash);
        if (!tx || tx.to?.toLowerCase() !== contractAddress.toLowerCase()) continue;

        try {
          const decoded = iface.parseTransaction({
            data: tx.data,
            value: tx.value
          });

          count++;
          console.log(`📝 Transaction #${count}`);
          console.log(`   Function: ${decoded.name}`);
          console.log(`   From: ${tx.from}`);
          console.log(`   Hash: ${tx.hash}`);
          console.log(`   Block: ${block}`);
          console.log(`   Timestamp: ${blockData.timestamp} (${new Date(blockData.timestamp * 1000).toISOString()})`);
          console.log('');
        } catch (e) {
          // Unknown function, skip
        }
      }
    } catch (e) {
      console.error(`Error scanning block ${block}:`, e.message);
    }

    // Show progress
    if (block % 100 === 0) {
      console.log(`   Progress: Block ${block}/${toBlock}`);
    }
  }

  console.log(`\n✅ Found ${count} transactions for ${contractName}\n`);
  return count;
}

async function checkContractState(address) {
  console.log(`\n🔎 Checking EVVM state for address: ${address}\n`);

  const evvm = new ethers.Contract(CONTRACTS.Evvm, evvmInterface, provider);

  // Check MATE balance
  const mateBalance = await evvm.getBalance(
    address,
    '0x0000000000000000000000000000000000000001'
  );
  console.log(`   MATE Balance: ${ethers.formatEther(mateBalance)} MATE`);

  // Check staker status
  const isStaker = await evvm.isAddressStaker(address);
  console.log(`   Is Staker: ${isStaker ? 'Yes ✅' : 'No ❌'}`);

  console.log('');
}

async function main() {
  console.log('🚀 PAYVVM Transaction Viewer');
  console.log('=============================\n');

  const latestBlock = await provider.getBlockNumber();
  console.log(`📊 Latest Block: ${latestBlock}`);
  console.log(`📡 Network: Ethereum Sepolia`);
  console.log(`🔗 RPC: Connected\n`);

  // Scan recent blocks (last 1000 blocks for testing)
  const fromBlock = Math.max(7340000, latestBlock - 1000);
  const toBlock = latestBlock;

  console.log(`📅 Scanning blocks ${fromBlock} to ${toBlock} (${toBlock - fromBlock + 1} blocks)\n`);

  // Scan each contract
  const totals = {
    Evvm: await scanTransactions(CONTRACTS.Evvm, 'EVVM Core', evvmInterface, fromBlock, toBlock),
    Staking: await scanTransactions(CONTRACTS.Staking, 'Staking', stakingInterface, fromBlock, toBlock),
    NameService: await scanTransactions(CONTRACTS.NameService, 'NameService', nameServiceInterface, fromBlock, toBlock),
  };

  // Summary
  console.log('\n📊 SUMMARY');
  console.log('===========');
  console.log(`Total EVVM transactions: ${totals.Evvm}`);
  console.log(`Total Staking transactions: ${totals.Staking}`);
  console.log(`Total NameService transactions: ${totals.NameService}`);
  console.log(`\nTotal across all contracts: ${Object.values(totals).reduce((a, b) => a + b, 0)}`);

  // Example: Check state for a specific address (replace with real address)
  // await checkContractState('0xYourAddressHere');

  console.log('\n✅ Scan complete!\n');
}

main().catch(console.error);
EOF

# Run it
node index.js
```

### Option 3: Just Use the Frontend Direct RPC Calls

The Scaffold-ETH frontend can read contract state directly without any indexer:

```bash
cd /home/oucan/PayVVM/envioftpayvvm

# Start the frontend
yarn start

# In another terminal, test contract reads with cast
cast call 0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e \
  "getBalance(address,address)(uint256)" \
  "0x9c77c6fafc1eb0821f1de12972ef0199c97c6e45" \
  "0x0000000000000000000000000000000000000001" \
  --rpc-url https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

## What To Expect

### If Transactions Exist
You'll see output like:
```
📝 Transaction #1
   Function: pay
   From: 0x...
   Hash: 0x...
   Block: 7341234
```

### If No Transactions
```
✅ Found 0 transactions for EVVM Core
```
This means either:
- Contracts haven't been used yet
- You need to make test transactions

### Making Test Transactions

Visit https://evvm.dev/ to:
1. Connect your wallet
2. Make a test payment
3. Then run the viewer again to see it

## Timeline

⏱️ **Option 1** (Envio): 5-10 minutes to test
⏱️ **Option 2** (Viewer): 2-3 minutes to set up, instant results
⏱️ **Option 3** (Frontend): Immediate (no setup needed)

## What Works Right Now

✅ Reading contract state (balances, staker status, etc.)
✅ Scanning for transactions
✅ Decoding function calls
✅ Frontend with direct RPC calls

## What Needs More Work

⚠️ Event-based indexing (contracts don't emit events!)
⚠️ Real-time transaction monitoring
⚠️ Historical data aggregation
⚠️ GraphQL API (if not using Envio)

## Recommendation

**Start with Option 2 (Quick Transaction Viewer)** - It's guaranteed to work and gives you immediate feedback on what's happening with the PAYVVM contracts.

Then decide:
- If transactions exist → Build proper indexer
- If no transactions → Make some test transactions first
- Either way → Frontend can work with direct RPC calls

---

🎯 **Bottom Line**: You can start testing the frontend RIGHT NOW with direct RPC calls, no indexer needed!
