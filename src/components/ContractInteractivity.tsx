import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { useContractContext } from "@/hooks/useContractContext";
import type { AbiFunction } from "viem";
import { DocumentationTab } from "./TabDocumentation";
import { FunctionsTab } from "./TabFunctions";


const tabs = ["docs", "read", "write"] as const;

export default function ContractInteractivity() {
    // available tabs: "docs", "read", "write"
    const [activeTab, setActiveTab] = useState<typeof tabs[number]>("docs");
    const handleTabChange = (tab: typeof tabs[number]) => {
        setActiveTab(tab);
    };
    const { data } = useContractContext();
    // read functions. Read using abi
    const readFunctions = useMemo(() => {
        if (!data || !data.abi) return [];

        return data.abi.filter((item) => item.type === "function" && (item.stateMutability === "view" || item.stateMutability === "pure")) as AbiFunction[];

    }, [data]);

    const writeFunctions = useMemo(() => {
        if (!data || !data.abi) return [];
        return data.abi.filter((item) => item.type === "function" && (item.stateMutability === "nonpayable" || item.stateMutability === "payable")) as AbiFunction[];
    }, [data]);

    return (
        <div>
            {/* Selection Tabs */}
            <div className="mb-4">
                {
                    tabs.map((tab) => (
                        <Button
                            key={tab}
                            variant={activeTab === tab ? "default" : "outline"}
                            className={tab !== "write" ? "mr-2" : ""}
                            onClick={() => handleTabChange(tab)}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </Button>
                    ))
                }
            </div>

            {/* Tab Content */}
            <div>
                {activeTab === "docs" && <DocumentationTab />}
                {activeTab === "read" && <FunctionsTab functions={readFunctions || []} type="read" />}
                {activeTab === "write" && <FunctionsTab functions={writeFunctions || []} type="write" />}
            </div>
        </div>
    );
}
