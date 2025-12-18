# FHE Addition

## Overview

**Example ID**: `fhe-add`  
**Level**: `fundamental`

**Summary**

Demonstrates how to take two encrypted inputs (A and B), store them in encrypted state, compute their encrypted sum, and let a user decrypt the result. This is a foundational example for understanding encrypted arithmetic operations in FHEVM.

### What you will learn

- How to store encrypted values in contract state
- How to perform encrypted addition operations
- How to manage multiple encrypted state variables
- How to grant and control decrypt permissions
- How to work with external encrypted inputs

---

## Contract Details

**Contract Name**: `FHEAdd`  
**State Variables**:

- `_a` (euint8) - First encrypted 8-bit unsigned integer
- `_b` (euint8) - Second encrypted 8-bit unsigned integer
- `_result` (euint8) - The encrypted sum of A and B

---

## Public API

### `setA(euint32 inputA, bytes inputProof)`

**What it does**

Stores an encrypted value into state variable `_a`.

**FHE details**

- **Operations**: `fromExternal`, `asEuint8`, `allowTransient`
- **Visibility**: Per-user, encrypted input

**Parameters**

- `inputA` - External encrypted input handle for value A
- `inputProof` - Zero-knowledge proof verifying the ciphertext validity

**How it works**

1. Validates the encrypted input using the provided proof
2. Converts from euint32 to euint8 (casting)
3. Stores the encrypted value in `_a`
4. Grants decrypt permission to the caller

**Example**

```javascript
// Client side: encrypt value 10
const encryptedA = await encrypt(10);
// Store in contract
await contract.setA(encryptedA.handle, encryptedA.proof);
```

---

### `setB(euint32 inputB, bytes inputProof)`

**What it does**

Stores an encrypted value into state variable `_b`.

**FHE details**

- **Operations**: `fromExternal`, `asEuint8`, `allowTransient`
- **Visibility**: Per-user, encrypted input

**Parameters**

- `inputB` - External encrypted input handle for value B
- `inputProof` - Zero-knowledge proof verifying the ciphertext validity

**How it works**

1. Validates the encrypted input using the provided proof
2. Converts from euint32 to euint8 (casting)
3. Stores the encrypted value in `_b`
4. Grants decrypt permission to the caller

**Example**

```javascript
// Client side: encrypt value 25
const encryptedB = await encrypt(25);
// Store in contract
await contract.setB(encryptedB.handle, encryptedB.proof);
```

---

### `computeAPlusB()`

**What it does**

Computes the encrypted sum of `_a` and `_b`, storing the result in `_result`.

**FHE details**

- **Operations**: `add`, `allowTransient`
- **Visibility**: Result granted to caller for decryption

**How it works**

1. Performs encrypted addition: `_result = _a + _b`
2. Grants decrypt permission to the caller
3. All operations happen on ciphertexts - values never decrypted

**Example**

```javascript
// After setting A=10 and B=25
await contract.computeAPlusB();
// _result now contains encrypted value 35
```

---

### `result()`

**What it does**

Returns the encrypted result of the last `computeAPlusB()` operation.

**FHE details**

- **Operations**: Read encrypted state
- **Visibility**: Requires decrypt permission
- **Returns**: `euint8` - The encrypted sum

**How it works**

- Retrieves the encrypted `_result` value
- Caller must have decrypt permissions (granted by `computeAPlusB()`)
- Decryption happens on the client side

**Example**

```javascript
// Get encrypted result
const encryptedResult = await contract.result();
// Decrypt on client
const plainResult = await decrypt(encryptedResult);
console.log(plainResult); // 35
```

---

## Workflow Example

Complete workflow for adding two numbers privately:

```javascript
// 1. Set first operand (A = 10)
const encA = await encrypt(10);
await contract.setA(encA.handle, encA.proof);

// 2. Set second operand (B = 25)
const encB = await encrypt(25);
await contract.setB(encB.handle, encB.proof);

// 3. Compute sum (encrypted)
await contract.computeAPlusB();

// 4. Get and decrypt result
const encResult = await contract.result();
const plainResult = await decrypt(encResult);
console.log(plainResult); // Output: 35
```

---

## Key Concepts

### Type Casting

The contract demonstrates encrypted type casting:

- Input is `euint32` (32-bit encrypted integer)
- Stored as `euint8` (8-bit encrypted integer)
- Casting happens in encrypted domain using `TFHE.asEuint8()`

### Encrypted Arithmetic

Addition is performed directly on ciphertexts:

- `_result = TFHE.add(_a, _b)`
- Neither `_a` nor `_b` are ever decrypted
- The result remains encrypted until explicitly decrypted by authorized user

### Permission Management

Each operation carefully manages who can decrypt what:

- `setA()` grants permission for `_a` only
- `setB()` grants permission for `_b` only
- `computeAPlusB()` grants permission for `_result`

---

## Security Considerations

1. **Input Validation**: All encrypted inputs validated with ZK proofs
2. **Privacy Preservation**: Values never leave encrypted domain on-chain
3. **Access Control**: Decrypt permissions explicitly granted per operation
4. **Type Safety**: Proper type casting ensures data integrity

---

## Use Cases

- **Private Calculations**: Compute sums without revealing operands
- **Confidential Bidding**: Sum multiple encrypted bids
- **Private Voting**: Aggregate encrypted votes
- **Financial Privacy**: Add confidential amounts
- **Gaming**: Combine secret values from multiple players

---

## Extension Ideas

This basic example can be extended to:

- Support subtraction, multiplication, division
- Handle multiple operands (A + B + C + ...)
- Implement encrypted comparison operations
- Add role-based access control
- Create a full encrypted calculator

---

## Testing

The contract includes tests for:

- Setting encrypted values
- Computing encrypted sums
- Decrypting results with proper permissions
- Handling edge cases (overflow, zero values)
- Permission validation
