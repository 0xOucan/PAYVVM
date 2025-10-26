import { NextRequest, NextResponse } from 'next/server';

/**
 * API endpoint for users to submit signed faucet mateclaim messages
 * Fishers can poll this endpoint to discover pending faucet mateclaims
 */

// In-memory store for pending mateclaims (in production, use Redis/Database)
const pendingMateClaims: Array<{
  id: string;
  timestamp: number;
  mateclaimer: string;
  nonce: string;
  signature: string;
  evvmId?: string;
  executed: boolean;
}> = [];

// Clean up executed mateclaims older than 1 hour
setInterval(() => {
  const oneHourAgo = Date.now() - 60 * 60 * 1000;
  const initialLength = pendingMateClaims.length;

  for (let i = pendingMateClaims.length - 1; i >= 0; i--) {
    if (pendingMateClaims[i].executed && pendingMateClaims[i].timestamp < oneHourAgo) {
      pendingMateClaims.splice(i, 1);
    }
  }

  if (pendingMateClaims.length !== initialLength) {
    console.log(`🧹 Cleaned up ${initialLength - pendingMateClaims.length} old faucet mateclaims`);
  }
}, 5 * 60 * 1000); // Every 5 minutes

/**
 * POST /api/fishing/submit-mateclaim
 * Submit a signed faucet mateclaim message to the fishing pool
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { mateclaimer, nonce, signature, evvmId } = body;

    // Validate required fields
    if (!mateclaimer || !nonce || !signature) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if this mateclaim already exists (by signature)
    const existing = pendingMateClaims.find(mateclaim => mateclaim.signature === signature);
    if (existing) {
      return NextResponse.json(
        { error: 'MateClaim already submitted', id: existing.id },
        { status: 409 }
      );
    }

    // Generate unique ID
    const id = `${mateclaimer}-${nonce}-${Date.now()}`;

    // Add to pending pool
    const mateclaim = {
      id,
      timestamp: Date.now(),
      mateclaimer,
      nonce,
      signature,
      evvmId,
      executed: false,
    };

    pendingMateClaims.push(mateclaim);

    console.log(`📝 New faucet mateclaim submitted to fishing pool: ${id}`);
    console.log(`   MateClaimer: ${mateclaimer}`);
    console.log(`   Nonce: ${nonce}`);
    console.log(`   Pending count: ${pendingMateClaims.filter(c => !c.executed).length}`);

    return NextResponse.json({
      success: true,
      id,
      message: 'Faucet mateclaim submitted to fishing pool',
      pendingCount: pendingMateClaims.filter(c => !c.executed).length,
    });

  } catch (error) {
    console.error('Error submitting faucet mateclaim:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/fishing/submit-mateclaim
 * Get pending faucet mateclaims for fishers to execute
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const onlyPending = searchParams.get('pending') === 'true';

    // Filter and sort mateclaims
    let mateclaims = onlyPending
      ? pendingMateClaims.filter(c => !c.executed)
      : pendingMateClaims;

    // Sort by timestamp (FIFO)
    mateclaims = mateclaims
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, limit);

    return NextResponse.json({
      success: true,
      count: mateclaims.length,
      totalPending: pendingMateClaims.filter(c => !c.executed).length,
      mateclaims,
    });

  } catch (error) {
    console.error('Error fetching faucet mateclaims:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/fishing/submit-mateclaim/:id
 * Mark mateclaim as executed
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, txHash } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'MateClaim ID required' },
        { status: 400 }
      );
    }

    const mateclaim = pendingMateClaims.find(c => c.id === id);
    if (!mateclaim) {
      return NextResponse.json(
        { error: 'MateClaim not found' },
        { status: 404 }
      );
    }

    if (mateclaim.executed) {
      return NextResponse.json(
        { error: 'MateClaim already executed' },
        { status: 409 }
      );
    }

    mateclaim.executed = true;
    console.log(`✅ Faucet mateclaim marked as executed: ${id}`);
    if (txHash) {
      console.log(`   TX Hash: ${txHash}`);
    }

    return NextResponse.json({
      success: true,
      message: 'MateClaim marked as executed',
    });

  } catch (error) {
    console.error('Error updating mateclaim:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
