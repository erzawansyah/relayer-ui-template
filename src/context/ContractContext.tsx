import { createContext, useEffect, useState, type ReactNode } from "react";
import { useContractLoader, type UseContractLoaderReturn } from "../hooks/useContractLoader";

interface ContractContextType {
    contracts: string[];
    active: string;
    setActive: (contract: string) => void;
    data: UseContractLoaderReturn["data"];
    error: string | null;
    isLoading: boolean;
}

const ContractContext = createContext<ContractContextType | undefined>(undefined);

// Get available contracts. Prefer module glob in dev, fall back to public manifest in production.
const getAvailableContracts = async (): Promise<string[]> => {
    try {
        // vite dev: metadata.ts modules may exist inside src
        const contractModules = import.meta.glob('/src/contracts/*/metadata.ts', { eager: true }) as Record<string, unknown>;
        const names = Object.keys(contractModules)
            .map((path) => {
                const match = path.match(/\/src\/contracts\/(.+?)\/metadata\.ts/);
                return match ? match[1] : null;
            })
            .filter(Boolean) as string[];

        if (names.length > 0) return names;
    } catch (e) {
        console.error("Module glob import failed:", e);
        // ignore — fallback to manifest
    }

    try {
        const res = await fetch('/contracts/index.json');
        if (!res.ok) throw new Error('Failed to fetch contracts manifest');
        const list = (await res.json()) as string[];
        return list;
    } catch (e) {
        console.error("Failed to load contracts manifest:", e);
        return [];
    }
};

export function ContractProvider({ children }: { children: ReactNode }) {
    const [contracts, setContracts] = useState<string[]>([]);
    const [active, setActive] = useState<string>("");
    const { data, error, isLoading } = useContractLoader(active);

    useEffect(() => {
        const loadContracts = async () => {
            const availableContracts = await getAvailableContracts();
            setContracts(availableContracts);

            if (availableContracts.length > 0 && !active) {
                setActive(availableContracts[0]);
            }
        };
        void loadContracts();
    }, [active]);

    const value = { contracts, active, setActive, data, error, isLoading };

    return (
        <ContractContext.Provider value={value}>
            {children}
        </ContractContext.Provider>
    );
}

// Export hook in separate file to avoid Fast Refresh warning
export { ContractContext };
