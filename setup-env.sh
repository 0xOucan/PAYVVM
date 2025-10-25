#!/bin/bash

# ====================================
# PAYVVM Environment Setup Script
# ====================================
#
# This script helps you set up your environment variables
# for local development.
#
# Usage: ./setup-env.sh

set -e

echo "🔧 PAYVVM Environment Setup"
echo "============================"
echo ""

# Check if .env.example exists
if [ ! -f ".env.example" ]; then
    echo "❌ Error: .env.example not found!"
    echo "   Make sure you're in the envioftpayvvm directory."
    exit 1
fi

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  Warning: .env file already exists!"
    echo ""
    read -p "   Do you want to overwrite it? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Cancelled. Your existing .env file was not modified."
        exit 0
    fi
fi

# Copy .env.example to .env
echo "📋 Copying .env.example to .env..."
cp .env.example .env

echo "✅ Created .env file!"
echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Edit the .env file and fill in your values:"
echo "   nano .env"
echo "   # or"
echo "   code .env"
echo ""
echo "2. REQUIRED: Add your WalletConnect Project ID"
echo "   Get it from: https://cloud.reown.com/"
echo "   Look for: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID"
echo ""
echo "3. OPTIONAL: Add your Alchemy or Infura API key"
echo "   For better RPC performance (recommended for production)"
echo ""
echo "4. Test your setup:"
echo "   yarn install"
echo "   yarn start"
echo ""
echo "🔒 Security Reminder:"
echo "   - NEVER commit the .env file (it's in .gitignore)"
echo "   - NEVER share your private keys or API keys"
echo "   - Use Foundry keystores for private keys: cast wallet import"
echo ""
echo "✨ Happy coding!"
