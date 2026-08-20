export { ReineiraSDK } from "./sdk.js";

// Modules
export { EscrowModule } from "./modules/escrow.js";
export { EscrowInstance } from "./modules/escrow-instance.js";
export { EscrowBuilder } from "./modules/escrow-builder.js";
export { BridgeModule, type CoordinatorHealth } from "./modules/bridge.js";

// Plain (non-FHE) modules — mainnet launch path
export { PlainEscrowModule } from "./modules/escrow-plain.js";
export { PlainEscrowInstance, type PlainFundOptions } from "./modules/escrow-plain-instance.js";
export { EventsModule, type Unsubscribe, type EscrowEventName } from "./modules/events.js";

// Crypto
export { FHEClient, injectCofhe } from "./crypto/fhe.js";

// Types
export type {
  SDKConfig,
  SDKConfigWithKey,
  SDKConfigWithSigner,
  Network,
  CreateEscrowParams,
  FundOptions,
  FundResult,
  CrossChainConfig,
  SettlementResult,
  BridgeBurnResult,
  PollOptions,
  EscrowInfo,
  ApprovalOptions,
  NetworkAddresses,
  TransactionResult,
  TokenBalances,
  CreatePlainEscrowParams,
} from "./types/index.js";

// Errors
export {
  ReineiraError,
  FHEInitError,
  EncryptionError,
  EscrowNotFoundError,
  InsufficientFundsError,
  TransactionFailedError,
  ConditionNotMetError,
  ValidationError,
  TimeoutError,
  ApprovalRequiredError,
} from "./errors/index.js";

// Constants
export { getAddresses, TESTNET_ADDRESSES } from "./constants/addresses.js";

// Utils
export { encodeHookData, padAddress, encodeResolverData } from "./utils/encoding.js";
export { pollUntil } from "./utils/polling.js";
export { usdc, formatUsdc } from "./utils/amounts.js";
export { walletClientToSigner, publicClientToProvider } from "./utils/viem.js";
