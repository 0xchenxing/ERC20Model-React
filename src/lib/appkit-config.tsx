import { createAppKit } from "@reown/appkit/react";
import { EthersAdapter } from "@reown/appkit-adapter-ethers";
import { mainnet, bsc, polygon, arbitrum, sepolia } from "@reown/appkit/networks";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "48b421d3f87823e891b023048be7041e";

const metadata = {
  name: "BASE Token",
  description: "BASE Token DApp - Vesting, Staking & Airdrop Platform",
  url: typeof window !== "undefined" ? window.location.origin : "",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
};

// Initialize AppKit
export const ethersAdapter = new EthersAdapter();

createAppKit({
  adapters: [ethersAdapter],
  networks: [mainnet, bsc, polygon, arbitrum, sepolia],
  defaultNetwork: mainnet,
  metadata,
  projectId,
  features: {
    analytics: false,
  },
});
