# Contract Manifest Examples

Folder ini berisi contoh-contoh manifest untuk menguji berbagai jenis smart contract.

## File-file Manifest:

### 1. `manifest-counter.json`

Contract counter sederhana dengan fungsi:

- **Read**: `count()` - Membaca nilai counter saat ini
- **Write**: `increment()`, `decrement()`, `setCount(uint256)`, `addToCount(uint256)`

### 2. `manifest-erc20.json`

Standard ERC20 token dengan fungsi-fungsi:

- **Read**: `name()`, `symbol()`, `decimals()`, `totalSupply()`, `balanceOf(address)`, `allowance(address,address)`
- **Write**: `transfer(address,uint256)`, `approve(address,uint256)`, `transferFrom(address,address,uint256)`, `mint(address,uint256)`

### 3. `manifest-storage.json`

Contract storage untuk berbagai tipe data:

- **Read**: `storedNumber()`, `storedString()`, `storedAddress()`, `storedBool()`, `getItem(string)`
- **Write**: `storeNumber(uint256)`, `storeString(string)`, `storeAddress(address)`, `storeBool(bool)`, `setItem(string,string)`

## Cara Menggunakan:

1. Copy isi dari salah satu file JSON
2. Paste di aplikasi pada bagian "Load Contract Manifest"
3. Klik "Load Contract"
4. Ganti `address` dengan address contract yang sebenarnya
5. Ganti `chainId` sesuai network yang digunakan (1 = Mainnet, 11155111 = Sepolia, 31337 = Hardhat)

## Format Manifest:

```json
{
  "name": "Nama Contract",
  "address": "0x...",
  "chainId": 11155111,
  "description": "Deskripsi contract (opsional)",
  "abi": [
    {
      "name": "functionName",
      "type": "function",
      "stateMutability": "view|pure|nonpayable|payable",
      "inputs": [
        {
          "name": "paramName",
          "type": "uint256|address|string|bool|..."
        }
      ],
      "outputs": [
        {
          "name": "",
          "type": "uint256|address|string|bool|..."
        }
      ]
    }
  ]
}
```

## Tipe Data yang Didukung:

- `uint256`, `uint128`, `uint8`, dll
- `int256`, `int128`, `int8`, dll
- `address`
- `string`
- `bool`
- `bytes`, `bytes32`, dll
- Array types: `uint256[]`, `address[]`, dll
