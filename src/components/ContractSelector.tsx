import { useContractContext } from "@/hooks/useContractContext"

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default function ContractSelector() {
    const { contracts: ls, active, setActive } = useContractContext();


    return (
        <Select value={active} onValueChange={(value) => setActive(value)}>
            <SelectTrigger className="w-48">
                <SelectValue placeholder="Select a contract" />
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectLabel>Contracts</SelectLabel>
                    {(ls || []).map((contract, id) => (
                        <SelectItem key={id} value={contract}>
                            {contract}
                        </SelectItem>
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}
