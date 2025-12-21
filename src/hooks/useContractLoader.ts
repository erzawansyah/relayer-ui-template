import { useEffect, useState } from "react";
import type { Abi } from "viem";
import type { ContractMetadataType } from "../types/metadata";
import { useChainId } from "wagmi";

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
  const chainId = useChainId();
  const [data, setData] = useState<UseContractLoaderState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let timeoutId: number | undefined;
    setData(null);
    setError(null);
    setIsLoading(true);

    (async () => {
      try {
        const [abiRes, metadataRes] = await Promise.all([
          fetch(`/contracts/${slug}/abi.json`),
          fetch(`/contracts/${slug}/metadata.json`),
        ]);

        if (!abiRes.ok || !metadataRes.ok) {
          throw new Error("Failed to fetch contract assets from /contracts");
        }

        const abiJson = (await abiRes.json()) as {
          abi: Abi;
        };
        const metadataJson = (await metadataRes.json()) as ContractMetadataType;

        const usedAddress = metadataJson.contract_address
          ? metadataJson.contract_address[chainId] || null
          : null;

        if (cancelled) return;

        console.log("Contract loaded (public):", {
          abi: abiJson,
          metadata: metadataJson,
        });

        timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          setData({
            address: usedAddress,
            abi: abiJson.abi,
            metadata: metadataJson,
          });
          setIsLoading(false);
        }, 300);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load contract files"
        );
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [slug, chainId]);

  return { data, error, isLoading };
}
