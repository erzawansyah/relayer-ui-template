import {
  ARRAY_DEPTH_LIMIT,
  SUPPORTED_TYPES_SINGLE,
  type EncryptedInputTypes,
  type EncryptedOutputTypes,
  type RegularType,
  type SupportedInputInternalType,
  type SupportedInputType,
  type SupportedOutputInternalType,
  type SupportedOutputType,
} from "../types/functions.d";

function stripArraySuffix(v: string): { base: string; depth: number } {
  let base = v;
  let depth = 0;
  while (base.endsWith("[]")) {
    base = base.slice(0, -2);
    depth++;
  }
  return { base, depth };
}

const REGULAR_SET = new Set(SUPPORTED_TYPES_SINGLE.regular);
const ENC_IN_SET = new Set(SUPPORTED_TYPES_SINGLE.encryptedInput);
const ENC_OUT_SET = new Set(SUPPORTED_TYPES_SINGLE.encryptedOutput);

export function isSupportedInputInternalType(
  v: string
): v is SupportedInputInternalType {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return (
    REGULAR_SET.has(base as RegularType) ||
    ENC_IN_SET.has(base as EncryptedInputTypes)
  );
}

export function isSupportedInputType(v: string): v is SupportedInputType {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return REGULAR_SET.has(base as RegularType);
}

export function isSupportedOutputInternalType(
  v: string
): v is SupportedOutputInternalType {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return (
    REGULAR_SET.has(base as RegularType) ||
    ENC_OUT_SET.has(base as EncryptedOutputTypes)
  );
}

export function isSupportedOutputType(v: string): v is SupportedOutputType {
  return isSupportedOutputInternalType(v);
}

export function isEncryptedInputType(v: string): boolean {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return ENC_IN_SET.has(base as EncryptedInputTypes);
}

export function isNumberType(v: string): boolean {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return base.startsWith("uint") || base.startsWith("int");
}

export function isAddressType(v: string): boolean {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return base === "address";
}

export function isBoolType(v: string): boolean {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return base === "bool";
}

export function isEncryptedNumberType(v: string): boolean {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return (
    ENC_IN_SET.has(base as EncryptedInputTypes) &&
    (base.startsWith("Euint") ||
      base.startsWith("Eint") ||
      base.startsWith("externalEuint") ||
      base.startsWith("externalEint"))
  );
}

export function isEncryptedAddressType(v: string): boolean {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return (
    ENC_IN_SET.has(base as EncryptedInputTypes) &&
    (base === "Eaddress" || base === "externalEaddress")
  );
}

export function isEncryptedBoolType(v: string): boolean {
  const { base, depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) return false;
  return (
    (ENC_IN_SET.has(base as EncryptedInputTypes) && base === "Ebool") ||
    base === "externalEbool"
  );
}

export function identifyInputType(v: string): {
  rawField: "bytes" | "number" | "address" | "bool" | null;
  isEncrypted: boolean;
  arrayDepth: number;
} {
  const { depth } = stripArraySuffix(v);
  if (depth > ARRAY_DEPTH_LIMIT) {
    return { rawField: null, isEncrypted: false, arrayDepth: depth };
  }

  if (isEncryptedNumberType(v)) {
    return { rawField: "number", isEncrypted: true, arrayDepth: depth };
  }
  if (isEncryptedAddressType(v)) {
    return { rawField: "address", isEncrypted: true, arrayDepth: depth };
  }

  if (isEncryptedBoolType(v)) {
    return { rawField: "bool", isEncrypted: true, arrayDepth: depth };
  }

  if (isNumberType(v)) {
    return { rawField: "number", isEncrypted: false, arrayDepth: depth };
  }
  if (isAddressType(v)) {
    return { rawField: "address", isEncrypted: false, arrayDepth: depth };
  }
  if (isBoolType(v)) {
    return { rawField: "bool", isEncrypted: false, arrayDepth: depth };
  }
  return { rawField: "bytes", isEncrypted: false, arrayDepth: depth };
}
