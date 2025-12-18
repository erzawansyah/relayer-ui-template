/**
 * UI Types Declarations
 */

export type NativeSolidityType =
  | "uint8"
  | "uint16"
  | "uint32"
  | "uint64"
  | "uint128"
  | "uint256"
  | "int8"
  | "int16"
  | "int32"
  | "int64"
  | "int128"
  | "int256"
  | "bool"
  | "address"
  | "bytes"
  | "bytes32"
  | "string";

export type FheSolidityType =
  | "euint8"
  | "euint16"
  | "euint32"
  | "euint64"
  | "euint128"
  | "euint256"
  | "eint8"
  | "eint16"
  | "eint32"
  | "eint64"
  | "eint128"
  | "eint256"
  | "ebool"
  | "eaddress";

export type ExternalFheSolidityType =
  | "externalEuint8"
  | "externalEuint16"
  | "externalEuint32"
  | "externalEuint64"
  | "externalEuint128"
  | "externalEuint160" // alias: eaddress
  | "externalEuint256"
  | "externalEint8"
  | "externalEint16"
  | "externalEint32"
  | "externalEint64"
  | "externalEint128"
  | "externalEint256"
  | "externalEbool"
  | "externalEaddress";

export type FunctionInputType = NativeSolidityType | ExternalFheSolidityType;

export type FunctionOutputType = NativeSolidityType | FheSolidityType;

export interface ContractSummaryType {
  file: string;
  name: string;
  slug: string;
  label: string;
  description: string;
  details: string | string[];
}

export interface ContractStateVariableType {
  name: string;
  type: FunctionOutputType;
}

export interface ContractUiConfigType {
  proofParam?: string;
}

export interface ContractFunctionType {
  name: string;
  type: "read" | "write";
  description: string;
  inputs: {
    name: string;
    type: FunctionInputType;
    helper?: string;
  }[];
  outputs: {
    name: string;
    type: FunctionOutputType;
  }[];
  config?: ContractUiConfigType;
}

export interface ContractUIType {
  summary: ContractSummaryType;
  states: ContractStateVariableType[];
  functions: ContractFunctionType[];
}
