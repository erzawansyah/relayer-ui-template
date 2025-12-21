import { useAccount } from "wagmi"
import Header from "./components/Header"
import ConnectBox from "./components/ConnectBox"
import ThemeController from "./components/ThemeController"
import FhevmStatus from "./components/FhevmStatus"
import Section from "./components/Section"
import ContractSpecification from "./components/ContractSpecification"
import ContractInteractivity from "./components/ContractInteractivity"

const App = () => {
    const account = useAccount()

    return (
        <div className="min-h-screen flex flex-col bg-background text-foreground">
            <Header />
            <main className="grow">
                {
                    !account.isConnected ? (
                        <ConnectBox />
                    ) : (
                        <div>
                            <Section className="space-y-8">
                                <ContractSpecification />
                                <ContractInteractivity />
                            </Section>
                        </div>
                    )
                }
                {/* Theme controller */}
                <div className="fixed bottom-4 right-4">
                    <ThemeController />
                </div>
                <div className="fixed bottom-4 left-4">
                    <FhevmStatus />
                </div>
            </main>
        </div>
    )
}

export default App;
