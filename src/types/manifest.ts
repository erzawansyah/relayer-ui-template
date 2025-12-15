export interface ContractManifest {
  name: string
  address: `0x${string}`
  abi: unknown[]
  chainId?: number
  description?: string
}

export interface FunctionInput {
  name: string
  type: string
  internalType?: string
}

export interface ContractFunction {
  name: string
  type: 'function'
  stateMutability: 'view' | 'pure' | 'nonpayable' | 'payable'
  inputs: FunctionInput[]
  outputs: FunctionInput[]
}
