import { useEffect, useState } from "react";
import type { Abi } from "viem";
import type { ContractMetadataType } from "../types/metadata";

export interface UseContractLoaderState {
  address: `0x${string}` | string | null;
  abi: Abi;
  metadata: ContractMetadataType;
}

export interface UseContractLoaderReturn {
  data: {
    address: `0x${string}` | string | null;
    abi: Abi;
    metadata: ContractMetadataType;
  } | null;
  error: string | null;
  isLoading: boolean;
}

export function useContractLoader(slug: string): UseContractLoaderReturn {
  const [data, setData] = useState<UseContractLoaderState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;

    console.log("Loading contract:", slug);

    setData(null);
    setError(null);
    setIsLoading(true);

    Promise.all([
      import(`../contracts/${slug}/abi.json`).then(
        (m) => m.default as { address: `0x${string}`; abi: Abi }
      ),
      import(`../contracts/${slug}/metadata.ts`).then(
        (m) => m.metadata as ContractMetadataType
      ),
    ])
      .then(([abi, metadata]) => {
        if (cancelled) return;

        console.log("Contract loaded:", { abi, metadata });

        timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          setData({ address: abi.address, abi: abi.abi, metadata });
          setIsLoading(false);
        }, 300);
      })
      .catch((e) => {
        if (cancelled) return;
        setError(
          e instanceof Error ? e.message : "Failed to load contract files"
        );
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [slug]);

  return { data, error, isLoading };
}
