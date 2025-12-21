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

// Dynamically get all contract folders from src/contracts directory
const getAvailableContracts = () => {
    const contractModules = import.meta.glob('/src/contracts/*/metadata.ts', { eager: true });
    const contractNames = Object.keys(contractModules).map(path => {
        const match = path.match(/\/src\/contracts\/(.+?)\/metadata\.ts/);
        return match ? match[1] : null;
    }).filter(Boolean) as string[];

    return contractNames;
};

export function ContractProvider({ children }: { children: ReactNode }) {
    const [contracts, setContracts] = useState<string[]>([]);
    const [active, setActive] = useState<string>("");
    const { data, error, isLoading } = useContractLoader(active);

    useEffect(() => {
        const loadContracts = async () => {
            // Get contracts dynamically from folder structure
            const availableContracts = getAvailableContracts();
            setContracts(availableContracts);

            // Set first contract as active
            if (availableContracts.length > 0 && !active) {
                setActive(availableContracts[0]);
            }
        };
        loadContracts();
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
