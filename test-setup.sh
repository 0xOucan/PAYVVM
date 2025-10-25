#!/bin/bash

# PAYVVM Setup Testing Script
# Tests that your environment is configured correctly

echo ""
echo "🧪 PAYVVM Configuration Test"
echo "=============================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track issues
ISSUES=0

# Test 1: Check .env exists
echo "📋 Test 1: Checking .env file..."
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ .env file exists${NC}"
else
    echo -e "${RED}❌ .env file not found!${NC}"
    echo "   Fix: Run ./setup-env.sh or cp .env.example .env"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Test 2: Check WalletConnect ID
echo "🔐 Test 2: Checking WalletConnect Project ID..."
if [ -f ".env" ]; then
    if grep -q "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=" .env && ! grep -q "your_reown_project_id_here" .env; then
        PROJECT_ID=$(grep "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=" .env | cut -d'=' -f2 | tr -d ' ')
        if [ -n "$PROJECT_ID" ]; then
            echo -e "${GREEN}✅ WalletConnect Project ID configured${NC}"
            echo "   ID: ${PROJECT_ID:0:20}..."
        else
            echo -e "${YELLOW}⚠️  WalletConnect Project ID is empty${NC}"
            echo "   Get one from: https://cloud.reown.com/"
            ISSUES=$((ISSUES + 1))
        fi
    else
        echo -e "${YELLOW}⚠️  WalletConnect Project ID not configured${NC}"
        echo "   Get one from: https://cloud.reown.com/"
        echo "   Add to .env: NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id"
        ISSUES=$((ISSUES + 1))
    fi
fi
echo ""

# Test 3: Check RPC URL
echo "🌐 Test 3: Checking RPC URL..."
if [ -f ".env" ]; then
    if grep -q "NEXT_PUBLIC_RPC_URL=" .env; then
        RPC_URL=$(grep "NEXT_PUBLIC_RPC_URL=" .env | cut -d'=' -f2 | tr -d ' ')
        if [ -n "$RPC_URL" ]; then
            echo -e "${GREEN}✅ RPC URL configured: $RPC_URL${NC}"
        else
            echo -e "${YELLOW}⚠️  RPC URL is empty (will use default)${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  RPC URL not set (will use default)${NC}"
    fi
fi
echo ""

# Test 4: Check Envio Start Block
echo "🎯 Test 4: Checking Envio Start Block..."
if [ -f ".env" ]; then
    if grep -q "ENVIO_START_BLOCK=9455841" .env; then
        echo -e "${GREEN}✅ Start block configured correctly (9455841)${NC}"
    else
        if grep -q "ENVIO_START_BLOCK=" .env; then
            BLOCK=$(grep "ENVIO_START_BLOCK=" .env | cut -d'=' -f2 | tr -d ' ')
            echo -e "${YELLOW}⚠️  Start block is set to: $BLOCK${NC}"
            echo "   Recommended: 9455841 (your contract deployment block)"
        else
            echo -e "${YELLOW}⚠️  Start block not configured${NC}"
            echo "   Add to .env: ENVIO_START_BLOCK=9455841"
        fi
    fi
fi
echo ""

# Test 5: Check Contract Addresses
echo "📜 Test 5: Checking Contract Addresses..."
if [ -f ".env" ]; then
    EVVM_ADDR=$(grep "NEXT_PUBLIC_EVVM_ADDRESS=" .env | cut -d'=' -f2 | tr -d ' ')
    NS_ADDR=$(grep "NEXT_PUBLIC_NAMESERVICE_ADDRESS=" .env | cut -d'=' -f2 | tr -d ' ')

    if [ "$EVVM_ADDR" == "0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e" ]; then
        echo -e "${GREEN}✅ EVVM address correct${NC}"
    else
        echo -e "${YELLOW}⚠️  EVVM address may be incorrect${NC}"
        echo "   Expected: 0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e"
        echo "   Got: $EVVM_ADDR"
    fi

    if [ "$NS_ADDR" == "0xa4ba4e9270bDE8FbBF4328925959287a72BA0a55" ]; then
        echo -e "${GREEN}✅ NameService address correct${NC}"
    else
        echo -e "${YELLOW}⚠️  NameService address may be incorrect${NC}"
        echo "   Expected: 0xa4ba4e9270bDE8FbBF4328925959287a72BA0a55"
        echo "   Got: $NS_ADDR"
    fi
fi
echo ""

# Test 6: Check Dependencies
echo "📦 Test 6: Checking Dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ Dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠️  Dependencies not installed${NC}"
    echo "   Run: yarn install"
    ISSUES=$((ISSUES + 1))
fi
echo ""

# Test 7: Check if services are running
echo "🚀 Test 7: Checking Running Services..."

# Check frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Frontend is running on http://localhost:3000${NC}"
else
    echo -e "${YELLOW}ℹ️  Frontend is not running${NC}"
    echo "   Start with: yarn start"
fi

# Check indexer
if curl -s http://localhost:8080/graphql > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Indexer is running on http://localhost:8080${NC}"
else
    echo -e "${YELLOW}ℹ️  Indexer is not running (optional)${NC}"
    echo "   Start with: cd packages/envio && pnpm dev"
fi
echo ""

# Summary
echo "=============================="
echo "📊 Test Summary"
echo "=============================="
echo ""

if [ $ISSUES -eq 0 ]; then
    echo -e "${GREEN}✨ All checks passed! Your setup looks good!${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Start frontend: yarn start"
    echo "  2. Open: http://localhost:3000"
    echo "  3. Connect your wallet and test!"
else
    echo -e "${YELLOW}⚠️  Found $ISSUES issue(s) that need attention${NC}"
    echo ""
    echo "Fix the issues above, then run this script again."
fi

echo ""
echo "📚 Documentation:"
echo "  - Quick Test Guide: QUICK_LOCAL_TEST.md"
echo "  - Full Guide: LOCAL_TESTING_GUIDE.md"
echo "  - Env Setup: ENV_SETUP_GUIDE.md"
echo ""
