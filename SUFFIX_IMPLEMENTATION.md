# PAYVVM Suffix Implementation Guide

## How .payvvm Suffix Works

### Smart Contract (Already Deployed)

Your NameService contract at `0xa4ba4e9270bDE8FbBF4328925959287a72BA0a55` stores just the username:

```solidity
// NameService.sol (already deployed)
mapping(string => UsernameMetadata) private usernameMetadata;

// Stores: "0xoucan" => { owner: 0x123..., expiration: ... }
// NOT:    "0xoucan.payvvm"
```

### Frontend Display

The frontend adds the suffix based on your EVVM name:

```typescript
// packages/nextjs/utils/nameservice.ts

export const EVVM_NAME = "PAYVVM";
export const EVVM_SUFFIX = "payvvm"; // lowercase

export function formatUsername(username: string): string {
  // Input: "0xoucan"
  // Output: "$0xoucan.payvvm"
  return `$${username}.${EVVM_SUFFIX}`;
}

export function parseUsername(displayName: string): string {
  // Input: "$0xoucan.payvvm"
  // Output: "0xoucan"
  return displayName
    .replace(/^\$/, '')           // Remove $
    .replace(/\.payvvm$/, '');    // Remove .payvvm
}

export function validateUsername(username: string): boolean {
  // Validate the base username (without $ or .payvvm)
  const baseUsername = parseUsername(username);

  // Rules:
  // - 3-20 characters
  // - Lowercase letters, numbers, underscore
  // - No special characters
  const regex = /^[a-z0-9_]{3,20}$/;

  return regex.test(baseUsername);
}
```

### Example Flow

```typescript
// Registration Flow
const userInput = "$0xoucan.payvvm";  // User enters this

// 1. Parse to get base username
const baseUsername = parseUsername(userInput);  // "0xoucan"

// 2. Validate
if (!validateUsername(baseUsername)) {
  throw new Error("Invalid username");
}

// 3. Register in contract (just the base)
await nameService.registrationUsername(
  userAddress,
  baseUsername,  // Just "0xoucan", not the full display name
  secret,
  nonce,
  signature,
  // ... other params
);

// 4. Display to user
const displayName = formatUsername(baseUsername);  // "$0xoucan.payvvm"
```

### Lookup Flow

```typescript
// User searches for a username
async function lookupUsername(input: string) {
  // Parse input (handles both "0xoucan" and "$0xoucan.payvvm")
  const baseUsername = parseUsername(input);

  // Query contract with base username
  const owner = await nameService.verifyStrictAndGetOwnerOfIdentity(baseUsername);

  // Return formatted for display
  return {
    displayName: formatUsername(baseUsername),  // "$0xoucan.payvvm"
    owner: owner,
    baseUsername: baseUsername  // "0xoucan"
  };
}
```

## Frontend Components

### 1. Username Input Component

```typescript
// packages/nextjs/components/nameservice/UsernameInput.tsx

import { useState } from "react";
import { validateUsername, formatUsername } from "~~/utils/nameservice";

export const UsernameInput = ({ onChange }) => {
  const [value, setValue] = useState("");
  const [isValid, setIsValid] = useState(true);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setValue(input);

    const isValid = validateUsername(input);
    setIsValid(isValid);
    onChange(input, isValid);
  };

  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-3 text-gray-500">$</span>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="0xoucan"
          className={`pl-8 ${!isValid ? 'border-red-500' : ''}`}
        />
        <span className="absolute right-3 top-3 text-gray-500">.payvvm</span>
      </div>

      {!isValid && (
        <p className="text-red-500 text-sm mt-1">
          Username must be 3-20 characters (lowercase, numbers, underscore only)
        </p>
      )}

      <p className="text-gray-500 text-sm mt-1">
        Preview: {formatUsername(value || "yourname")}
      </p>
    </div>
  );
};
```

### 2. Display Component

```typescript
// packages/nextjs/components/nameservice/UsernameDisplay.tsx

import { formatUsername } from "~~/utils/nameservice";

export const UsernameDisplay = ({ username, showCopy = true }) => {
  const displayName = formatUsername(username);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(displayName);
    // Show toast notification
  };

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-lg">{displayName}</span>
      {showCopy && (
        <button onClick={copyToClipboard} className="btn btn-sm">
          📋 Copy
        </button>
      )}
    </div>
  );
};
```

## When You MIGHT Want a Separate Service

### Use Case: Multiple Suffixes

If you want to support **multiple suffixes** for the same EVVM:

```
$0xoucan.payvvm   ← Main service
$0xoucan.pay      ← Short version
$0xoucan.pvvm     ← Alternative
```

Then you'd need:

```solidity
// New contract: SuffixResolver.sol
contract SuffixResolver {
    address public nameService;

    // Map suffixes to whether they're valid
    mapping(string => bool) public validSuffixes;

    constructor(address _nameService) {
        nameService = _nameService;
        validSuffixes["payvvm"] = true;
        validSuffixes["pay"] = true;  // Short version
    }

    function resolveUsername(string calldata fullUsername)
        external view returns (address)
    {
        // Parse: "$0xoucan.pay"
        (string memory base, string memory suffix) = parseFullUsername(fullUsername);

        // Check suffix is valid
        require(validSuffixes[suffix], "Invalid suffix");

        // Query NameService with base username
        return INameService(nameService).verifyStrictAndGetOwnerOfIdentity(base);
    }
}
```

But **you probably don't need this** unless you want multiple suffixes.

## Recommendation

**Stick with the current approach:**

1. ✅ NameService contract stores: `"0xoucan"`
2. ✅ Frontend displays: `"$0xoucan.payvvm"`
3. ✅ The `.payvvm` comes from your EVVM name
4. ✅ No additional contract needed

This is:
- ✅ Standard EVVM pattern
- ✅ Already deployed
- ✅ Simple and efficient
- ✅ Ready to use

## Next Steps

1. Run `./setup-payvvm-nameservice.sh` (if not done)
2. Create the frontend utility functions above
3. Build the UI components
4. Test with your deployed NameService contract
5. Register `$0xoucan.payvvm`!

The `.payvvm` suffix is **just a display convention**, not a separate service. Keep it simple! 🚀
