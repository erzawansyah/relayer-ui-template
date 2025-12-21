import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia, hardhat } from "wagmi/chains";

export const config = getDefaultConfig({
  appName: "FHEVM StarterKit",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID!,
  chains: [sepolia, hardhat],
  ssr: false,
});
