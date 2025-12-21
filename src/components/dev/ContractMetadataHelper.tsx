import { useContractContext } from "@/hooks/useContractContext";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { HelpCircleIcon } from "lucide-react";

export default function ContractMetadataHelper() {
    const [open, setOpen] = useState(false);
    const { data } = useContractContext();

    // when click esc key, close the modal
    // when ctrl + ` is pressed, toggle the modal
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                event.preventDefault();
                setOpen(false);
            }
            if (event.key === "`" && event.ctrlKey) {
                // prevent default browser behavior
                event.preventDefault();
                setOpen((prev) => !prev);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        }
    }, []);

    if (!open) {
        return (
            <Button
                onClick={() => setOpen(true)}
                size={"icon-lg"}
            >
                <HelpCircleIcon className="h-4 w-4" />
            </Button>
        )
    };



    return (
        <div className="w-screen h-screen fixed top-0 left-0 bg-black/80 bg-opacity-50 flex justify-center items-center p-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-3/4 max-w-2xl h-full overflow-y-auto">
                <h3>Address</h3>
                <p className="mb-2">{data?.address || "No contract selected"}</p>

                <h3 className="text-lg font-semibold mt-4 mb-2">Metadata</h3>
                <pre>{JSON.stringify(data?.metadata, null, 2)}</pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">ABI</h3>
                <pre>{JSON.stringify(data?.abi, null, 2)}</pre>

                <h3 className="text-lg font-semibold mt-4 mb-2">UI</h3>
                <pre>{JSON.stringify(data?.ui, null, 2)}</pre>
            </div>
            <Button
                className="absolute top-4 right-4"
                variant="destructive"
                onClick={() => setOpen(false)}
            >
                Close
            </Button>
        </div>
    )
};
