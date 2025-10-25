#!/bin/bash

# PAYVVM Explorer Setup Script
# This script helps you set up the envioftpayvvm project for EVVM blockchain exploration

set -e

echo "🚀 PAYVVM Explorer Setup"
echo "========================"
echo ""

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: Please run this script from the envioftpayvvm root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} In correct directory"

# Step 1: Check dependencies
echo ""
echo "Step 1: Checking dependencies..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js is not installed${NC}"
    echo "Please install Node.js >= 20.18.3 from https://nodejs.org/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Node.js $(node --version) installed"

if ! command -v yarn &> /dev/null; then
    echo -e "${RED}✗ Yarn is not installed${NC}"
    echo "Please install Yarn from https://yarnpkg.com/"
    exit 1
fi
echo -e "${GREEN}✓${NC} Yarn $(yarn --version) installed"

if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠${NC} pnpm not found, installing..."
    npm install -g pnpm
fi
echo -e "${GREEN}✓${NC} pnpm $(pnpm --version) installed"

# Step 2: Install dependencies
echo ""
echo "Step 2: Installing dependencies..."
echo -e "${YELLOW}This may take a few minutes...${NC}"

if [ ! -d "node_modules" ]; then
    yarn install
    echo -e "${GREEN}✓${NC} Root dependencies installed"
else
    echo -e "${GREEN}✓${NC} Root dependencies already installed"
fi

# Install envio package dependencies
cd packages/envio
if [ ! -d "node_modules" ]; then
    pnpm install
    echo -e "${GREEN}✓${NC} Envio dependencies installed"
else
    echo -e "${GREEN}✓${NC} Envio dependencies already installed"
fi
cd ../..

# Step 3: Set up environment variables
echo ""
echo "Step 3: Setting up environment variables..."

if [ ! -f "packages/envio/.env" ]; then
    echo -e "${YELLOW}Creating .env file for Envio indexer...${NC}"
    cp packages/envio/.env.example packages/envio/.env
    echo ""
    echo -e "${YELLOW}⚠ IMPORTANT: Please add your Alchemy API key to packages/envio/.env${NC}"
    echo "   Get a free API key from: https://www.alchemy.com/"
    echo ""
    read -p "Press Enter to continue (after adding your API key)..."
else
    echo -e "${GREEN}✓${NC} Envio .env file exists"
fi

# Step 4: Important warnings
echo ""
echo "Step 4: Important Configuration Notes"
echo "======================================"
echo ""
echo -e "${RED}⚠ CRITICAL: You must update config.yaml with actual event signatures!${NC}"
echo ""
echo "The config.yaml file currently has placeholder events."
echo "You need to:"
echo "  1. Check your deployed contracts on Etherscan"
echo "  2. Find the actual events they emit"
echo "  3. Update packages/envio/config.yaml with real event signatures"
echo ""
echo "Deployed contracts on Sepolia:"
echo "  - EVVM:       https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e#events"
echo "  - Staking:    https://sepolia.etherscan.io/address/0x64A47d84dE05B9Efda4F63Fbca2Fc8cEb96E6816#events"
echo "  - NameService: https://sepolia.etherscan.io/address/0xa4ba4e9270bde8fbbf4328925959287a72ba0a55#events"
echo "  - Treasury:   https://sepolia.etherscan.io/address/0x3d6cb29a1f97a2cff7a48af96f7ed3a02f6aa38e#events"
echo "  - Estimator:  https://sepolia.etherscan.io/address/0x5db7cdb7601f9abcfc5089d66b1a3525471bf2ab#events"
echo ""
read -p "Press Enter once you've noted this down..."

# Step 5: Offer to run codegen
echo ""
echo "Step 5: Generate TypeScript types"
echo "================================="
echo ""
echo "After updating config.yaml with real events, you should run:"
echo "  cd packages/envio && pnpm codegen"
echo ""
echo -e "${YELLOW}Would you like to try running codegen now? (y/N)${NC}"
read -p "> " run_codegen

if [[ $run_codegen =~ ^[Yy]$ ]]; then
    echo "Running codegen..."
    cd packages/envio
    pnpm codegen || {
        echo -e "${RED}Codegen failed. This is likely because:${NC}"
        echo "  1. config.yaml has invalid event signatures"
        echo "  2. Events don't exist in the actual contracts"
        echo ""
        echo "Please:"
        echo "  1. Update config.yaml with real events from Etherscan"
        echo "  2. Run: cd packages/envio && pnpm codegen"
    }
    cd ../..
else
    echo "Skipping codegen for now."
fi

# Final instructions
echo ""
echo "========================================="
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo "========================================="
echo ""
echo "Next Steps:"
echo "----------"
echo ""
echo "1. Update config.yaml with real events:"
echo "   nano packages/envio/config.yaml"
echo ""
echo "2. Generate TypeScript types:"
echo "   cd packages/envio && pnpm codegen"
echo ""
echo "3. Implement event handlers:"
echo "   nano packages/envio/src/EventHandlers.ts"
echo ""
echo "4. Start the indexer:"
echo "   cd packages/envio && pnpm dev"
echo ""
echo "5. Start the frontend (in another terminal):"
echo "   yarn start"
echo ""
echo "Documentation:"
echo "  - Quick Start: envioftpayvvm/QUICK_START.md"
echo "  - Setup Guide: envioftpayvvm/PAYVVM_SETUP_GUIDE.md"
echo ""
echo "Useful Commands:"
echo "  - View indexer logs: cd packages/envio && pnpm dev"
echo "  - Query data: http://localhost:8080/graphql"
echo "  - Frontend: http://localhost:3000"
echo ""
echo -e "${GREEN}Happy building! 🎉${NC}"
