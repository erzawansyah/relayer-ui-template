import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { mainnet, sepolia, hardhat } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "FHEVM StarterKit",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!,
  chains: [mainnet, sepolia, hardhat],
  ssr: false,
});
