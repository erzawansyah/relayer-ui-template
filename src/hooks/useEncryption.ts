import { useFhevmContext } from "@/lib/fhevm/useFhevmContext";
import { isEncryptedInputType } from "@/lib/typeValidator";
import type { EncryptedInputTypes } from "@/types/functions";
import type { AbiFunction } from "node_modules/abitype/dist/types/abi";
import { bytesToHex } from "viem";
import { useAccount } from "wagmi";

export type UseEncryptResult = {
  handles: `0x${string}`[];
  proof: `0x${string}`;
};

export const useEncryption = () => {
  const { instance } = useFhevmContext();
  const { address: accountAddress } = useAccount();

  function getEncryptedIndexes(func: AbiFunction) {
    const inputs = func.inputs ?? [];
    const encryptedIdx: number[] = [];
    let proofIndex = -1;

    inputs.forEach((inp, i) => {
      if (inp.name === "inputProof") proofIndex = i;
      if (inp.internalType && isEncryptedInputType(inp.internalType)) {
        encryptedIdx.push(i);
      }
    });

    return { encryptedIdx, proofIndex };
  }

  async function encrypt(
    values: {
      type: EncryptedInputTypes;
      value: unknown;
    }[],
    contractAddress: `0x${string}`
  ): Promise<UseEncryptResult> {
    if (!instance) {
      throw new Error("FHEVM instance is not initialized");
    }
    if (!accountAddress) {
      throw new Error("User address is not available");
    }

    const buffer = instance.createEncryptedInput(
      contractAddress,
      accountAddress
    );
    values.forEach((val) => {
      if (val.type === "externalEuint8" || val.type === "externalEint8") {
        buffer.add8(BigInt(val.value as number));
      } else if (
        val.type === "externalEuint16" ||
        val.type === "externalEint16"
      ) {
        buffer.add16(BigInt(val.value as number));
      } else if (
        val.type === "externalEuint32" ||
        val.type === "externalEint32"
      ) {
        buffer.add32(BigInt(val.value as number));
      } else if (
        val.type === "externalEuint64" ||
        val.type === "externalEint64"
      ) {
        buffer.add64(BigInt(val.value as number));
      } else if (
        val.type === "externalEuint128" ||
        val.type === "externalEint128"
      ) {
        buffer.add128(BigInt(val.value as number));
      } else if (
        val.type === "externalEuint256" ||
        val.type === "externalEint256"
      ) {
        buffer.add256(BigInt(val.value as number));
      } else if (val.type === "externalEbool") {
        buffer.addBool(Boolean(val.value));
      } else if (val.type === "externalEaddress") {
        buffer.addAddress(val.value as `0x${string}`);
      } else {
        throw new Error(`Unsupported encrypted input type: ${val.type}`);
      }
    });

    const ciphertext = await buffer.encrypt();

    return {
      handles: ciphertext.handles.map((h) => bytesToHex(h) as `0x${string}`),
      proof: bytesToHex(ciphertext.inputProof) as `0x${string}`,
    };
  }
  return { encrypt, getEncryptedIndexes };
};
