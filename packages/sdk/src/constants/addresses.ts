import type { Network, NetworkAddresses } from "../types/index.js";

export const TESTNET_ADDRESSES: NetworkAddresses = {
  // Tokens
  confidentialUSDC: "0x42E47f9bA89712C317f60A72C81A610A2b68c48a",

  // Escrow
  escrow: "0xF50A9CF008a79CFCA39aa9a345aa06e8D12727E2",
  escrowReceiver: "0xe0E6CC9Ee62Fa36b96eC4F50CDc462Fd14aa0fD3",

  // External
  usdc: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
  cctpMessageTransmitter: "0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275",
  trustedForwarder: "0x7ceA357B5AC0639F89F9e378a1f03Aa5005C0a25",

  // Plain (non-FHE) — mainnet launch path. 2026-06-15 Arb Sepolia redeploy
  // (verified on Arbiscan; supersedes the 2026-06-14 plain addresses).
  plainEscrow: "0xAf4e9b2f19a2BF7CF05B7eAae20369FBE3823B8D",
  plainEscrowReceiver: "0x495b4E97C1983B79B926994D8278E06b9BbdC834",
};

const ADDRESSES_BY_NETWORK: Partial<Record<Network, NetworkAddresses>> = {
  testnet: TESTNET_ADDRESSES,
};

export function getAddresses(network: Network): NetworkAddresses {
  const addresses = ADDRESSES_BY_NETWORK[network];
  if (!addresses) {
    throw new Error(
      `Network "${network}" is not supported yet. Available: ${Object.keys(ADDRESSES_BY_NETWORK).join(", ")}`,
    );
  }
  return addresses;
}

// CCTP constants
export const CCTP_ETHEREUM_SEPOLIA = {
  domain: 0,
  usdc: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
  tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", // TokenMessengerV2
};

export const CCTP_BASE_SEPOLIA = {
  domain: 6,
  usdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  tokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA", // TokenMessengerV2
};

export const CCTP_ARBITRUM_SEPOLIA_DOMAIN = 3;

// Chain IDs for coordinator submission
export const CHAIN_ID_ETHEREUM_SEPOLIA = 11155111;
export const CHAIN_ID_BASE_SEPOLIA = 84532;
export const CHAIN_ID_ARBITRUM_SEPOLIA = 421614;
