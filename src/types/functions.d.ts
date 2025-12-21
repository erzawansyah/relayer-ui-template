export const ARRAY_DEPTH_LIMIT = 1 as const;

export const SUPPORTED_TYPES_SINGLE = {
  regular: [
    "uint8",
    "uint16",
    "uint32",
    "uint64",
    "uint128",
    "uint160",
    "uint256",
    "int8",
    "int16",
    "int32",
    "int64",
    "int128",
    "int160",
    "int256",
    "address",
    "bool",
    "string",
    "bytes",
    "bytes32",
  ],
  encryptedInput: [
    "externalEuint8",
    "externalEuint16",
    "externalEuint32",
    "externalEuint64",
    "externalEuint128",
    "externalEuint160",
    "externalEuint256",
    "externalEint8",
    "externalEint16",
    "externalEint32",
    "externalEint64",
    "externalEint128",
    "externalEint160",
    "externalEint256",
    "externalEbytes32",
    "externalEbytes",
    "externalEaddress",
    "externalEbool",
  ],
  encryptedOutput: [
    "Euint8",
    "Euint16",
    "Euint32",
    "Euint64",
    "Euint128",
    "Euint160",
    "Euint256",
    "Eint8",
    "Eint16",
    "Eint32",
    "Eint64",
    "Eint128",
    "Eint160",
    "Eint256",
    "Ebytes32",
    "Ebytes",
    "Eaddress",
    "Ebool",
  ],
} as const;

export type RegularType = (typeof SUPPORTED_TYPES_SINGLE.regular)[number];
export type EncryptedInputTypes =
  (typeof SUPPORTED_TYPES_SINGLE.encryptedInput)[number];
export type EncryptedOutputTypes =
  (typeof SUPPORTED_TYPES_SINGLE.encryptedOutput)[number];

type ArrayDepth = "" | "[]";
type WithArrayDepth<TBase extends string> = `${TBase}${ArrayDepth}`;

export type SupportedInputInternalType =
  | WithArrayDepth<RegularType>
  | WithArrayDepth<EncryptedInputTypes>;

export type SupportedInputType = WithArrayDepth<RegularType>;

export type SupportedOutputInternalType =
  | WithArrayDepth<RegularType>
  | WithArrayDepth<EncryptedOutputTypes>;

export type SupportedOutputType = SupportedOutputInternalType;
