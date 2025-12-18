# FHE Counter

## Overview

**Example ID**: `fhe-counter`  
**Level**: `applied`

**Summary**

An encrypted counter that supports increment and decrement operations using Fully Homomorphic Encryption (FHE). This example demonstrates how to perform arithmetic operations on encrypted data without ever decrypting it.

### What you will learn

- How to work with encrypted integers (euint32) in FHEVM
- How to perform encrypted arithmetic operations (addition/subtraction)
- How to manage encrypted state variables
- How to grant decrypt permissions to users
- How to handle encrypted inputs with zero-knowledge proofs

---

## Contract Details

**Contract Name**: `FHECounter`  
**Main State**: `_count` (euint32) - An encrypted 32-bit unsigned integer

---

## Public API

### `getCount()`

**What it does**

Returns the current encrypted counter value. Only the caller who has been granted permission can decrypt this value.

**FHE details**

- **Operations**: Read encrypted state
- **Visibility**: Requires decrypt permission
- **Returns**: `euint32` - The encrypted counter value

**How it works**

1. Retrieves the encrypted `_count` value
2. Grants temporary decrypt permission to the caller
3. Returns the encrypted value (decryption happens on client side)

---

### `increment(euint32 inputEuint32, bytes inputProof)`

**What it does**

Increments the encrypted counter by a specified encrypted value.

**FHE details**

- **Operations**: `fromExternal`, `add`, `allowTransient`
- **Visibility**: Encrypted operation, result granted to caller

**Parameters**

- `inputEuint32` - External encrypted input handle (the value to add)
- `inputProof` - Zero-knowledge proof verifying the ciphertext validity

**How it works**

1. Validates the encrypted input using the provided proof
2. Converts external encrypted input to internal format
3. Performs encrypted addition: `_count = _count + input`
4. Grants decrypt permission to the caller for the new count

**Example use case**

Increment the counter by 5 (encrypted):

```solidity
// Client side: encrypt 5
const encryptedValue = await encrypt(5);
// Call contract
await contract.increment(encryptedValue.handle, encryptedValue.proof);
```

---

### `decrement(euint32 inputEuint32, bytes inputProof)`

**What it does**

Decrements the encrypted counter by a specified encrypted value.

**FHE details**

- **Operations**: `fromExternal`, `sub`, `allowTransient`
- **Visibility**: Encrypted operation, result granted to caller

**Parameters**

- `inputEuint32` - External encrypted input handle (the value to subtract)
- `inputProof` - Zero-knowledge proof verifying the ciphertext validity

**How it works**

1. Validates the encrypted input using the provided proof
2. Converts external encrypted input to internal format
3. Performs encrypted subtraction: `_count = _count - input`
4. Grants decrypt permission to the caller for the new count

**Example use case**

Decrement the counter by 3 (encrypted):

```solidity
// Client side: encrypt 3
const encryptedValue = await encrypt(3);
// Call contract
await contract.decrement(encryptedValue.handle, encryptedValue.proof);
```

---

## Key Concepts

### Encrypted State Management

The counter value is stored as `euint32`, which means it's always encrypted on-chain. No one, including the contract owner or validators, can see the actual counter value without proper decryption permissions.

### Zero-Knowledge Proofs

Every encrypted input must be accompanied by a proof that validates:

- The ciphertext is properly formatted
- The sender knows the plaintext value
- The encryption was done correctly

This prevents malicious actors from submitting invalid encrypted data.

### Decrypt Permissions

The contract uses `TFHE.allowTransient()` to grant temporary decrypt permissions to the transaction sender. This means:

- Only the user who performs the operation can decrypt the result
- Permissions are valid only for the current transaction
- No one else can decrypt the counter value

---

## Security Considerations

1. **Privacy**: The counter value remains encrypted at all times on-chain
2. **Access Control**: Only users with granted permissions can decrypt values
3. **Proof Validation**: All inputs are validated with ZK proofs before processing
4. **Atomicity**: Operations are atomic - either complete successfully or revert entirely

---

## Use Cases

- **Private Voting**: Track vote counts without revealing results until the end
- **Confidential Inventory**: Manage stock levels privately
- **Private Gaming**: Track player scores or resources without exposing to others
- **Financial Privacy**: Manage account balances or transaction counts privately

---

## Testing

The contract includes comprehensive tests covering:

- Initialization with encrypted values
- Increment operations with various inputs
- Decrement operations with various inputs
- Permission management
- Edge cases and error conditions
