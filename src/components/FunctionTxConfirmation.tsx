import { useWaitForTransactionReceipt } from "wagmi";

interface FunctionTxConfirmationProps {
    txHash: `0x${string}`;
}

export default function FunctionTxConfirmation(props: FunctionTxConfirmationProps) {
    const { isSuccess, isError, isLoading } = useWaitForTransactionReceipt({
        hash: props.txHash,
    });
    const { txHash } = props;
    return (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            {
                isLoading ? (
                    <p className="text-sm text-gray-700">Transaction {txHash} is pending...</p>
                ) : isSuccess ? (
                    <div>
                        <p className="text-sm text-green-800">
                            Transaction {txHash} confirmed!
                            View on{" "}
                            <a
                                href={`https://eth-sepolia.blockscout.com/tx/${txHash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline font-medium"
                            >
                                Explorer
                            </a>
                        </p>

                    </div>
                ) : isError ? (
                    <p className="text-sm text-red-800">Transaction {txHash} failed.</p>
                ) : null
            }
        </div>
    );
}
