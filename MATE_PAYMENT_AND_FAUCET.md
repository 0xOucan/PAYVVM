# MATE Payment and Faucet Features

## Overview

Added comprehensive MATE token payment and faucet functionality to the PAYVVM Explorer. Users can now claim MATE tokens from the faucet and send gasless MATE payments within the EVVM ecosystem.

---

## What's New

### 1. MATE Token Faucet 🎰

**Purpose**: Claim free MATE tokens on Sepolia testnet for testing and development.

**How it Works**:
- Calls the `recalculateReward()` function on the EVVM contract
- Reward formula: **2.5 MATE × random(1-5083)**
- Expected reward: **2.5 to 12,707.5 MATE tokens** per claim
- More than enough for username registration (500 MATE required)
- Testnet only - claim as many times as needed!

**Features**:
- ✅ One-click token claiming
- ✅ Real-time balance updates after claim
- ✅ Automatic UI refresh (500ms delay for blockchain state propagation)
- ✅ Transaction status tracking with Etherscan links
- ✅ Helpful info about MATE token usage

### 2. MATE Token Payments 💸

**Purpose**: Send gasless MATE token payments within EVVM.

**How it Works**:
- Uses EIP-191 signature-based payment system
- Sign message with your wallet (no gas required)
- Fisher nodes execute transactions on-chain
- Recipients receive MATE instantly within EVVM

**Features**:
- ✅ Gasless payments (no transaction fees for sender)
- ✅ Real-time MATE balance display
- ✅ Priority fee options for faster execution
- ✅ Nonce management with automatic increments
- ✅ Form validation and error handling
- ✅ Auto-execute after signature
- ✅ Automatic UI refresh after successful payment
- ✅ Transaction tracking with Etherscan links

---

## Technical Implementation

### File Structure

```
packages/nextjs/
├── hooks/payvvm/
│   ├── useMatePayment.ts        # MATE payment hook
│   └── useMateFaucet.ts         # Faucet claiming hook
│
├── components/payvvm/
│   ├── MatePayment.tsx          # Payment UI component
│   └── MateFaucet.tsx           # Faucet UI component
│
└── app/payvvm/
    └── page.tsx                 # Updated dashboard
```

---

## Hook Documentation

### `useMatePayment()`

**Purpose**: Handle MATE token payment lifecycle with EIP-191 signatures.

**Returns**:
```typescript
{
  // State
  signature: string | undefined;
  hash: string | undefined;
  currentNonce: bigint | undefined;
  evvmId: bigint | undefined;

  // Status
  isSigning: boolean;
  isExecuting: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isLoadingMetadata: boolean;
  isLoadingNonce: boolean;

  // Errors
  signError: Error | null;
  executeError: Error | null;

  // Actions
  initiatePayment: (to: string, amount: string, priorityFee?: string) => Promise<void>;
  executePayment: () => void;
  reset: () => void;
}
```

**Message Format**:
```
{evvmID},pay,{recipient},{token},{amount},{priorityFee},{nonce},{priorityFlag},{executor}
```

**Example**:
```
1000,pay,0xrecipient...,0x0000...0001,1000000000000000000,0,42,false,0x0...0
```

**Key Features**:
- MATE token address: `0x0000000000000000000000000000000000000001`
- MATE decimals: 18 (like ETH)
- Synchronous execution (priorityFlag = false)
- Anyone can execute (executor = zero address)

---

### `useMateBalance()`

**Purpose**: Get MATE token balance in EVVM.

**Returns**:
```typescript
{
  balance: bigint;          // Raw balance in wei
  formatted: string;        // Formatted with 4 decimals
  isLoading: boolean;
  refetch: () => void;
}
```

**Configuration**:
```typescript
query: {
  enabled: !!address,
  refetchOnWindowFocus: true,  // Refresh on tab return
  staleTime: 0,                // Always fetch fresh data
}
```

---

### `useMateFaucet()`

**Purpose**: Claim MATE tokens from the faucet.

**Returns**:
```typescript
{
  // Actions
  claimTokens: () => void;
  reset: () => void;

  // State
  hash: string | undefined;

  // Status
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;

  // Errors
  error: Error | null;
}
```

**Contract Function**:
```solidity
function recalculateReward() external;
```

---

## Component Documentation

### `<MatePayment />`

**Usage**:
```tsx
import { MatePayment } from "~~/components/payvvm/MatePayment";

<MatePayment />
```

**Features**:
1. **Balance Display**: Shows current MATE balance in EVVM
2. **Recipient Input**: Address validation with error messages
3. **Amount Input**: With MAX button for convenience
4. **Advanced Options**: Priority fee settings (collapsible)
5. **Status Indicators**: EVVM ID, nonce, validation states
6. **Auto-Execute**: Payment executes automatically after signing
7. **Auto-Refresh**: Balance updates 500ms after confirmation

**User Flow**:
```
1. Enter recipient address
2. Enter amount
3. Click "Send Payment"
4. Sign message in wallet (MetaMask popup)
5. Transaction auto-executes
6. Wait for confirmation (~5-10 seconds)
7. Balance updates automatically
8. Form resets
```

---

### `<MateFaucet />`

**Usage**:
```tsx
import { MateFaucet } from "~~/components/payvvm/MateFaucet";

<MateFaucet />
```

**Features**:
1. **Balance Display**: Shows current MATE balance
2. **Faucet Info**: Explains reward mechanism
3. **Claim Button**: One-click token claiming
4. **Status Tracking**: Pending/confirming states
5. **Success Message**: With Etherscan link
6. **Auto-Refresh**: Balance updates 500ms after claim
7. **Usage Guide**: Explains what MATE tokens are for

**User Flow**:
```
1. Click "Claim MATE Tokens"
2. Confirm transaction in wallet
3. Wait for blockchain confirmation
4. Balance updates automatically
5. Success message with transaction link
6. Ready to send payments!
```

---

## Payment Message Construction

### Function: `constructMatePaymentMessage()`

**Parameters**:
```typescript
evvmId: bigint           // EVVM ID (e.g., 1000)
recipient: string        // Recipient address
amount: string           // Amount in wei
priorityFee: string      // Priority fee in wei
nonce: string            // User's current nonce
priorityFlag: boolean    // false = synchronous
executor: string         // zero address = anyone
```

**Returns**: Formatted message string

**Example**:
```typescript
const message = constructMatePaymentMessage(
  1000n,
  "0xAlice...",
  "1000000000000000000",  // 1 MATE
  "0",
  "42",
  false,
  "0x0000000000000000000000000000000000000000"
);

// Result:
// "1000,pay,0xalice...,0x0000000000000000000000000000000000000001,1000000000000000000,0,42,false,0x0000000000000000000000000000000000000000"
```

---

## Auto-Refresh Implementation

### Payment Auto-Refresh

```typescript
useEffect(() => {
  if (payment.isSuccess) {
    // Add 500ms delay for blockchain state propagation
    const refetchTimer = setTimeout(() => {
      mateBalance.refetch();
    }, 500);

    // Reset form
    setRecipient('');
    setAmount('');
    setPriorityFee('0');

    // Auto-reset after 3 seconds
    const resetTimer = setTimeout(() => {
      payment.reset();
    }, 3000);

    return () => {
      clearTimeout(refetchTimer);
      clearTimeout(resetTimer);
    };
  }
}, [payment.isSuccess, payment, mateBalance]);
```

### Faucet Auto-Refresh

```typescript
useEffect(() => {
  if (faucet.isSuccess) {
    // Add 500ms delay for blockchain state propagation
    const timer = setTimeout(() => {
      balance.refetch();
    }, 500);

    // Auto-reset after 5 seconds
    const resetTimer = setTimeout(() => {
      faucet.reset();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(resetTimer);
    };
  }
}, [faucet.isSuccess, faucet, balance]);
```

**Why 500ms delay?**
- RPC nodes need time to update state after transaction confirmation
- Ensures fresh data when refetching
- Reliable without race conditions

---

## Contract Information

### EVVM Contract
- **Address**: `0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e`
- **Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)
- **Etherscan**: [View Contract](https://sepolia.etherscan.io/address/0x9486f6C9d28ECdd95aba5bfa6188Bbc104d89C3e)

### MATE Token
- **Address**: `0x0000000000000000000000000000000000000001` (Protocol Constant)
- **Decimals**: 18
- **Type**: Native EVVM token
- **Usage**:
  - Username registration (500 MATE)
  - Gasless payments within EVVM
  - Priority fees for transaction execution
  - EVVM service payments

---

## Testing Guide

### Test Faucet Claiming

1. **Connect Wallet**:
   - Navigate to http://localhost:3000/payvvm
   - Connect MetaMask to Sepolia

2. **Claim Tokens**:
   - Scroll to "MATE Token Faucet" section
   - Click "Claim MATE Tokens"
   - Confirm transaction in MetaMask
   - Wait ~5-10 seconds

3. **Verify**:
   - ✅ Balance updates automatically (no F5 needed)
   - ✅ Success message appears
   - ✅ Etherscan link works
   - ✅ Can claim multiple times

---

### Test MATE Payment

1. **Ensure MATE Balance**:
   - Use faucet to claim MATE tokens first
   - Verify balance shows in "Send MATE Payment" section

2. **Send Payment**:
   - Enter recipient address (e.g., another wallet you control)
   - Enter amount (e.g., 0.5 MATE)
   - Click "Send Payment"
   - Sign message in MetaMask (NOT a transaction, just signature!)
   - Wait for auto-execution
   - Wait for confirmation

3. **Verify**:
   - ✅ Balance updates automatically
   - ✅ Form resets
   - ✅ Success message with Etherscan link
   - ✅ Nonce increments
   - ✅ Recipient receives MATE (check with AccountViewer)

---

## Common Use Cases

### 1. First-Time Setup
```
1. Connect wallet
2. Claim MATE tokens from faucet
3. Wait for balance to update
4. Ready to send payments!
```

### 2. Username Registration
```
1. Claim MATE tokens (need 500 MATE)
2. Wait for balance update
3. Navigate to Name Service (when implemented)
4. Register username
```

### 3. Sending Payments
```
1. Enter recipient address
2. Enter amount
3. Optional: Set priority fee for faster execution
4. Sign and send
5. Balance updates automatically
```

---

## Troubleshooting

### Issue: "User nonce not loaded"

**Solution**:
- Wait a few seconds for data to load
- Refresh the page if needed
- Check you're connected to Sepolia

---

### Issue: "Insufficient MATE balance"

**Solution**:
- Use the faucet to claim MATE tokens
- Each claim gives 2.5 to 12,707.5 MATE
- Can claim multiple times on testnet

---

### Issue: Balance doesn't update after transaction

**Solution**:
- Wait ~1 second (auto-refresh has 500ms delay)
- If still not updated, click refresh icon
- Check transaction on Etherscan to confirm success

---

## Security Considerations

### Signature Safety
- Users sign messages, NOT transactions
- Signatures are for payment authorization only
- Cannot be used to drain wallets
- Nonce-based replay protection

### Testnet Only Faucet
- `recalculateReward()` should only exist on testnet
- Production deployments should remove/disable this function
- Random rewards are for testing convenience only

---

## Performance

### Network Efficiency
- **Faucet**: 1 transaction per claim
- **Payment**: 1 signature + 1 transaction (auto-executed)
- **Balance Updates**: Single RPC call with 500ms delay
- **No Polling**: Only refetch on user action or tab focus

### User Experience
- **Instant Feedback**: Loading states during all operations
- **Auto-Refresh**: No manual F5 required
- **Clear Status**: Visual indicators for each step
- **Error Handling**: User-friendly error messages

---

## Future Enhancements

### Possible Improvements

**1. Batch Payments**
- Send to multiple recipients in one transaction
- CSV import for bulk payments
- Split payments with custom ratios

**2. Payment Templates**
- Save frequent recipients
- Quick-send with saved amounts
- Payment history and favorites

**3. Faucet Cooldown**
- Limit claims per address per time period
- Display time until next claim available
- Prevent abuse on public testnets

**4. Advanced Payment Options**
- Scheduled payments
- Recurring payments
- Conditional payments based on events

---

## References

### Documentation
- **EVVM Docs**: https://www.evvm.info/docs
- **Frontend Tooling**: https://www.evvm.info/docs/EVVMFrontendTooling
- **Payment Structure**: https://www.evvm.info/docs/SignatureStructures/EVVM/SinglePaymentSignatureStructure
- **EIP-191**: https://eips.ethereum.org/EIPS/eip-191

### Code Examples
- **Signature Constructor**: https://github.com/EVVM-org/EVVM-Signature-Constructor-Front
- **PAYVVM Contracts**: Local `/PAYVVM` directory

---

## Branch Information

**Branch**: `matesend`
**Status**: Ready for testing
**Merge Target**: `main`

**Test Command**:
```bash
cd /home/oucan/PayVVM/envioftpayvvm
git checkout matesend
yarn start
# Test faucet and payment flows
```

---

## Files Created

| File | Lines | Purpose |
|------|-------|---------|
| `hooks/payvvm/useMatePayment.ts` | ~250 | MATE payment hook with balance |
| `hooks/payvvm/useMateFaucet.ts` | ~60 | Faucet claiming hook |
| `components/payvvm/MatePayment.tsx` | ~450 | Payment UI component |
| `components/payvvm/MateFaucet.tsx` | ~230 | Faucet UI component |
| `app/payvvm/page.tsx` | Updated | Added components to dashboard |
| `MATE_PAYMENT_AND_FAUCET.md` | ~600 | This documentation |

**Total**: 6 files, ~1,600 lines added

---

## Conclusion

The MATE payment and faucet features complete the PAYVVM Explorer's core functionality:

✅ **Faucet**: Easy token acquisition for testing
✅ **Payments**: Gasless MATE transfers within EVVM
✅ **Auto-Refresh**: Seamless UX with automatic UI updates
✅ **Professional UI**: Clear status indicators and error handling
✅ **Well-Documented**: Comprehensive guides and code examples

**Ready for production use on Sepolia testnet!**
