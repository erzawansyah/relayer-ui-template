import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from './ui/button-group';

export const CustomConnectButton = () => (
    <ConnectButton.Custom>
        {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
        }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
                ready &&
                account &&
                chain &&
                (!authenticationStatus || authenticationStatus === 'authenticated');

            return (
                <div
                    {...(!ready && {
                        'aria-hidden': true,
                        style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
                    })}
                >
                    {!connected ? (
                        <Button onClick={openConnectModal}>
                            Connect Wallet
                        </Button>
                    ) : chain?.unsupported ? (
                        <Button variant="destructive" onClick={openChainModal}>
                            Wrong network
                        </Button>
                    ) : (
                        <div className="flex items-center gap-1.5">
                            <ButtonGroup aria-label='Wallet Account'>
                                <Button
                                    onClick={openChainModal}
                                    type="button"
                                    size='icon'
                                    variant={"outline"}
                                >
                                    {chain?.hasIcon && chain.iconUrl && (
                                        <img alt={chain.name ?? 'Chain icon'} src={chain.iconUrl} className="w-4 h-4" />
                                    )}
                                </Button>

                                {account?.displayBalance && (
                                    <Button variant="outline">
                                        {account.displayBalance}
                                    </Button>
                                )}

                                <Button
                                    onClick={openAccountModal}
                                    type="button"
                                >
                                    {account?.ensAvatar ? (
                                        <img alt={account.displayName} src={account.ensAvatar} className="w-5 h-5 rounded-full" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-linear-to-br from-primary to-secondary flex items-center justify-center text-[9px] font-bold text-white">
                                            {account?.displayName?.slice(0, 2).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-mono ml-1">{account?.displayName}</span>
                                </Button>
                            </ButtonGroup>
                        </div>
                    )}
                </div>
            );
        }}
    </ConnectButton.Custom>
);
