import { useContractLoader } from "../hooks/useContractLoader";
import ContractInfo from "./ContractInfo";

interface ContractLoaderProps {
    slug: string;
}

export default function ContractLoader({ slug }: ContractLoaderProps) {
    const { data, error, isLoading } = useContractLoader(slug);

    if (error) return <div>Failed to load: {error}</div>;
    if (isLoading || !data) return <div>Loading contract...</div>;

    return <ContractInfo metadata={data.metadata} />;
}
