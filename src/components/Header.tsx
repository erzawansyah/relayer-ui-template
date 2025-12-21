import { Logo } from "./Logo";
import { CustomConnectButton } from "./CustomConnectButton";
import { Separator } from "./ui/separator";
import ContractSelector from "./ContractSelector";

export default function Header() {
    return (
        <header className="w-full border-b border-border backdrop-blur-sm bg-background">
            <div className="px-4 py-2.5 flex items-center justify-between container">
                <div className="flex justify-start items-center">
                    <Logo />
                    <Separator orientation="vertical" className="h-8 mx-4" />
                    <ContractSelector />
                </div>
                <CustomConnectButton />
            </div>
        </header>
    );
}
