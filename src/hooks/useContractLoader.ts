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

    (async () => {
      try {
        // Prefer project imports during development (bundler can resolve)
        const [abiModule, metadataModule] = await Promise.all([
          import(`../contracts/${slug}/abi.json`).then(
            (m) => m.default as { address: `0x${string}`; abi: Abi }
          ),
          import(`../contracts/${slug}/metadata.ts`).then(
            (m) => m.metadata as ContractMetadataType
          ),
        ]);

        if (cancelled) return;

        console.log("Contract loaded (module):", {
          abi: abiModule,
          metadata: metadataModule,
        });

        timeoutId = window.setTimeout(() => {
          if (cancelled) return;
          setData({
            address: abiModule.address,
            abi: abiModule.abi,
            metadata: metadataModule,
          });
          setIsLoading(false);
        }, 300);

        return;
      } catch (e) {
        console.error("Module import failed, trying public fetch...", e);
        // Fallback for built app where contract files live under `public/contracts`
        try {
          const [abiRes, metadataRes] = await Promise.all([
            fetch(`/contracts/${slug}/abi.json`),
            fetch(`/contracts/${slug}/metadata.json`),
          ]);

          if (!abiRes.ok || !metadataRes.ok) {
            throw new Error("Failed to fetch contract assets from /contracts");
          }

          const abiJson = (await abiRes.json()) as {
            address: `0x${string}`;
            abi: Abi;
          };
          const metadataJson =
            (await metadataRes.json()) as ContractMetadataType;

          if (cancelled) return;

          console.log("Contract loaded (public):", {
            abi: abiJson,
            metadata: metadataJson,
          });

          timeoutId = window.setTimeout(() => {
            if (cancelled) return;
            setData({
              address: abiJson.address,
              abi: abiJson.abi,
              metadata: metadataJson,
            });
            setIsLoading(false);
          }, 300);

          return;
        } catch (err) {
          if (cancelled) return;
          setError(
            err instanceof Error ? err.message : "Failed to load contract files"
          );
          setIsLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [slug]);

  return { data, error, isLoading };
}
