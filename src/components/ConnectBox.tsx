import { CustomConnectButton } from "./CustomConnectButton";

export default function ConnectBox() {
    return (
        <div className=" h-screen text-center space-y-4 -m-16 flex flex-col justify-center items-center">
            <div>
                <h2 className="text-2xl font-semibold">Connect Wallet</h2>
                <p className="text-sm text-fg-muted">Connect your wallet to continue</p>
            </div>
            <div className="flex justify-center">
                <CustomConnectButton />
            </div>
        </div>
    );
}
