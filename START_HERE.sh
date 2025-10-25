#!/bin/bash

# PAYVVM Explorer - Start Testing Script
# Run this to start local development

set -e

echo "🚀 PAYVVM Explorer - Starting Local Development"
echo "==============================================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js >= 20.18.3"
    exit 1
fi
echo "✅ Node.js $(node --version)"

# Check Yarn
if ! command -v yarn &> /dev/null; then
    echo "❌ Yarn not found. Installing..."
    npm install -g yarn
fi
echo "✅ Yarn $(yarn --version)"

# Check dependencies
if [ ! -d "node_modules" ]; then
    echo ""
    echo "📦 Installing dependencies (this may take a few minutes)..."
    yarn install
else
    echo "✅ Dependencies already installed"
fi

echo ""
echo "📋 What would you like to test?"
echo ""
echo "1️⃣  Start Frontend (Recommended - Direct RPC calls)"
echo "2️⃣  Create Transaction Viewer"
echo "3️⃣  Try Envio Indexer (Experimental)"
echo "4️⃣  Just show me the commands"
echo ""
read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🎨 Starting Frontend..."
        echo "Visit http://localhost:3000 when ready"
        echo ""
        yarn start
        ;;
    2)
        echo ""
        echo "📊 Creating Transaction Viewer..."
        mkdir -p packages/viewer
        cd packages/viewer
        
        # Create package.json
        if [ ! -f "package.json" ]; then
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
        fi
        
        echo "Installing viewer dependencies..."
        npm install
        
        echo ""
        echo "⚠️  Before running:"
        echo "1. Create packages/viewer/.env"
        echo "2. Add: ALCHEMY_API_KEY=your_key_here"
        echo "3. Copy the viewer code from TEST_NOW.md to packages/viewer/index.js"
        echo "4. Run: cd packages/viewer && npm start"
        echo ""
        ;;
    3)
        echo ""
        echo "🔬 Testing Envio Indexer..."
        cd packages/envio
        
        if [ ! -f ".env" ]; then
            echo "Creating .env file..."
            echo "ALCHEMY_API_KEY=your_key_here" > .env
            echo ""
            echo "⚠️  Please edit packages/envio/.env and add your Alchemy API key"
            echo ""
            read -p "Press Enter when ready..."
        fi
        
        echo "Running codegen..."
        if pnpm codegen; then
            echo ""
            echo "✅ Codegen successful! Starting indexer..."
            pnpm dev
        else
            echo ""
            echo "❌ Codegen failed - Envio may not support function-based indexing"
            echo "💡 Try Option 1 (Frontend with direct RPC) instead"
        fi
        ;;
    4)
        echo ""
        echo "📝 Quick Commands:"
        echo ""
        echo "Start Frontend:"
        echo "  cd /home/oucan/PayVVM/envioftpayvvm"
        echo "  yarn start"
        echo ""
        echo "Test Contract State:"
        echo "  cast call 0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e \\"
        echo "    'getBalance(address,address)(uint256)' \\"
        echo "    YOUR_ADDRESS \\"
        echo "    '0x0000000000000000000000000000000000000001' \\"
        echo "    --rpc-url https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
        echo ""
        echo "Read Documentation:"
        echo "  cat FINAL_SETUP_SUMMARY.md"
        echo "  cat TEST_NOW.md"
        echo ""
        ;;
    *)
        echo "Invalid option"
        exit 1
        ;;
esac

