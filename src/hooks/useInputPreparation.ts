import { useEffect, useMemo, useState } from "react";
import type { AbiFunction, AbiParameter } from "viem";
import { useEncryption } from "./useEncryption";
import {
  isEncryptedInputType,
  isSupportedInputInternalType,
  isSupportedInputType,
} from "@/lib/typeValidator";
import type { EncryptedInputTypes } from "@/types/functions";

interface UseInputationParams {
  contractAddress: `0x${string}`;
  function: AbiFunction;
}

interface UseInputationReturn {
  // Define return types for the hook if needed
  inputsLen: number;
  errors: string | null;
  isPrepared: boolean;
  isReady: boolean;
  hasEncryptedInput: boolean;
  rawArgs: unknown[];
  args: unknown[];
  handleRawArgChange: (index: number, rawValue: unknown) => void;
  handleArgsChange: (index: number, value: unknown) => void;
  prepareFinalArgs: () => Promise<unknown[]>;
}

const isAutoGenerateInput = (input: AbiParameter): boolean => {
  // Cek apakah nama input adalah "inputProof"
  if (input.name === "inputProof") {
    return true;
  }
  // TODO: Tambahkan logika lain jika ada input lain yang perlu di-autogenerate, misal decryptionInput
  return false;
};

export const useInputPreparation: (
  params: UseInputationParams
) => UseInputationReturn = (params) => {
  const { function: func, contractAddress } = params;
  const { inputs } = func;
  const inputsLen = inputs.length;

  const [rawArgs, setRawArgs] = useState<unknown[]>(
    Array(inputsLen).fill(null)
  );
  const [args, setArgs] = useState<unknown[]>(Array(inputsLen).fill(null));

  // another hooks
  const { encrypt, getEncryptedIndexes } = useEncryption();

  // Reset state ketika ABI/inputs fungsi berubah (mis. saat user memilih fungsi lain)
  // Defer setState into a microtask to avoid synchronous setState inside effect
  // which triggers the `react-hooks/set-state-in-effect` ESLint rule.
  useEffect(() => {
    Promise.resolve().then(() => {
      setRawArgs(Array(inputsLen).fill(null));
      setArgs(Array(inputsLen).fill(null));
    });
  }, [inputsLen, func]);

  // Validasi input types. Jika ada error, maka field `validationError` tidak jadi dirender
  const errors = useMemo(() => {
    if (!inputs || inputs.length === 0) return null;

    // Setiap input harus memiliki internalType yang valid
    const missingInternalType: string[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!input.internalType) {
        missingInternalType.push(input.name || `arg${i}`);
      }
    }
    if (missingInternalType.length > 0) {
      return `Missing internalType for inputs: ${missingInternalType.join(
        ", "
      )}`;
    }

    // Semua input harus memiliki internalType yang didukung (ref: /types/functions.d.ts)
    // e.g. eaddress, euint256, euint8, ebool, etc.
    const unsupportedInternalTypes: string[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!isSupportedInputInternalType(input.internalType!)) {
        unsupportedInternalTypes.push(input.internalType!);
      }
    }
    if (unsupportedInternalTypes.length > 0) {
      return `Unsupported input types: ${unsupportedInternalTypes.join(", ")}`;
    }

    // Semua input harus memiliki type yang didukung (ref: /types/functions.d.ts)
    // e.g. address, uint256, string, bytes, bool, dll.
    const unsupportedTypes: string[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      if (!isSupportedInputType(input.type)) {
        unsupportedTypes.push(input.type);
      }
    }
    if (unsupportedTypes.length > 0) {
      return `Unsupported input types: ${unsupportedTypes.join(", ")}`;
    }

    return null;
  }, [inputs]);

  // Jika `args` masih kosong, maka belum siap untuk dieksekusi
  const isPrepared = useMemo(() => {
    // Jika tidak ada input, maka langsung siap
    if (!inputs || inputs.length === 0) return true;

    // Cek setiap argumen (kecuali yang autogenerate), apakah sudah diisi semua.
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      // Input yang autogenerate tidak perlu dicek
      if (isAutoGenerateInput(input)) continue;

      if (rawArgs[i] === null || rawArgs[i] === undefined) {
        return false;
      }
    }

    // Jika semua argumen (kecuali yang autogenerate) sudah diisi, maka siap
    return true;
  }, [rawArgs, inputs]);

  // Jika sudah siap di eksekusi
  const isReady = useMemo(() => {
    return args.every((arg) => arg !== null && arg !== undefined);
  }, [args]);

  // Cek apakah ada input terenkripsi
  const hasEncryptedInput = useMemo(() => {
    // Kalau tidak ada input, pasti tidak ada encrypted input
    if (!inputs || inputs.length === 0) return false;
    // Filter hanya input yang bukan auto-generate
    const filteredInputs = inputs.filter(
      (input) => !isAutoGenerateInput(input)
    );
    // Cek apakah ada yang terenkripsi
    return filteredInputs.some((input) =>
      isEncryptedInputType(input.internalType!)
    );
  }, [inputs]);

  // Fungsi untuk menghandle perubahan pada rawArgs
  const handleRawArgChange = (index: number, rawValue: unknown) => {
    setRawArgs((prev) => {
      const newRawArgs = [...prev];
      newRawArgs[index] = rawValue;
      return newRawArgs;
    });
  };

  const prepareFinalArgs = async (): Promise<unknown[]> => {
    // Jika tidak pakai input (jumlah input = 0), langsung return array kosong
    if (inputsLen === 0) {
      return [];
    }

    // Jika tidak ada input terenkripsi, langsung return rawArgs
    if (!hasEncryptedInput) {
      return rawArgs;
    }
    const { encryptedIdx, proofIndex } = getEncryptedIndexes(func);
    // Default: copy rawArgs (create a shallow clone so we don't modify state directly)
    if (encryptedIdx.length === 0) {
      return [...rawArgs];
    }

    // 1. Ambil nilai raw yang perlu dienkripsi (berdasarkan ABI order)
    const valuesToEncrypt = encryptedIdx.map((i) => {
      return {
        type: inputs[i].internalType as EncryptedInputTypes,
        value: rawArgs[i],
      };
    });

    // 2. encrypt using relayer
    const encryptResult = await encrypt(valuesToEncrypt, contractAddress);

    // 3. Scatter ciphertext ke posisi ABI yang benar and fill proof without mutating state
    const handleMap = new Map<number, unknown>();
    encryptedIdx.forEach((abiIndex, j) => {
      handleMap.set(abiIndex, encryptResult.handles[j]);
    });

    const finalArgs = rawArgs.map((val, idx) => {
      if (handleMap.has(idx)) return handleMap.get(idx);
      if (idx === proofIndex) return encryptResult.proof;
      return val;
    });

    return finalArgs;
  };

  const handleArgsChange = async (index: number, value: unknown) => {
    setArgs((prev) => {
      const newArgs = [...prev];
      newArgs[index] = value;
      return newArgs;
    });
  };

  return {
    inputsLen, // Jumlah input pada fungsi
    errors, // Error validasi input types. Digunakan untuk menampilkan validationError
    isPrepared, // Apakah input (rawArgs) sudah siap untuk diprepare ke final args (array args yang akan dieksekusi)
    isReady, // Apakah args sudah siap untuk dieksekusi
    hasEncryptedInput, // Apakah ada input terenkripsi
    rawArgs, // Array of raw input values
    args, // Array of final input values (setelah prepareFinalArgs dipanggil)
    handleRawArgChange, // Fungsi untuk menghandle perubahan pada rawArgs
    handleArgsChange, // Fungsi untuk menghandle perubahan pada args
    prepareFinalArgs, // Fungsi untuk mempersiapkan final args (dengan enkripsi jika perlu)
  };
};
