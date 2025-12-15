import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ConnectBox() {
    return (
        <div className="max-w-md mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Connect Wallet</h2>
                <p className="text-sm text-gray-600">
                    Connect your wallet to continue
                </p>
            </div>

            <div className="flex justify-center">
                <ConnectButton />
            </div>
        </div>
    );
}
