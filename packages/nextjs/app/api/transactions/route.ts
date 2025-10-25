/**
 * Next.js API Route for HyperSync Queries
 * Runs server-side only (HyperSync client requires Node.js)
 */

import { NextRequest, NextResponse } from 'next/server';

// Dynamic import to ensure HyperSync only loads server-side
async function getHyperSyncUtils() {
  const { fetchRecentTransactions, fetchAddressTransactions } = await import('~~/utils/hypersync');
  return { fetchRecentTransactions, fetchAddressTransactions };
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const fromBlock = searchParams.get('fromBlock');
    const toBlock = searchParams.get('toBlock');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Validate block numbers
    if (!fromBlock || !toBlock) {
      return NextResponse.json(
        { error: 'fromBlock and toBlock are required' },
        { status: 400 }
      );
    }

    const fromBlockNum = parseInt(fromBlock);
    const toBlockNum = parseInt(toBlock);

    if (isNaN(fromBlockNum) || isNaN(toBlockNum)) {
      return NextResponse.json(
        { error: 'Invalid block numbers' },
        { status: 400 }
      );
    }

    // Load HyperSync utilities dynamically (server-side only)
    console.log('Loading HyperSync utilities...');
    const { fetchRecentTransactions, fetchAddressTransactions } = await getHyperSyncUtils();
    console.log('HyperSync utilities loaded successfully');

    // Fetch transactions using HyperSync
    let transactions;
    if (address) {
      console.log(`Fetching transactions for address: ${address}`);
      // Fetch transactions for specific address
      transactions = await fetchAddressTransactions(
        address,
        fromBlockNum,
        toBlockNum,
        limit
      );
    } else {
      console.log('Fetching recent transactions for all PAYVVM contracts');
      // Fetch recent transactions to all PAYVVM contracts
      transactions = await fetchRecentTransactions(
        fromBlockNum,
        toBlockNum,
        limit
      );
    }
    console.log(`Fetched ${transactions.length} transactions`);

    return NextResponse.json({
      success: true,
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch transactions',
        transactions: [],
      },
      { status: 500 }
    );
  }
}
