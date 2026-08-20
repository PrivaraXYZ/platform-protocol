import { Contract } from "ethers";
import type { ethers } from "ethers";
import { CONFIDENTIAL_ESCROW_ABI } from "../constants/abis.js";
import type { NetworkAddresses } from "../types/index.js";

export type EscrowEventName =
  | "EscrowCreated"
  | "EscrowFunded"
  | "EscrowRedeemed"
  | "EscrowBatchRedeemed"
  | "FeeStamped"
  | "FeeDistributed"
  | "CoverageManagerSet";

export type Unsubscribe = () => void;

/**
 * Event subscription module. Listens for contract events via ethers event filters.
 *
 * Usage:
 * ```ts
 * const unsub = sdk.events.onEscrowCreated((escrowId) => {
 *   console.log("New escrow:", escrowId);
 * });
 *
 * // Later:
 * unsub();
 * ```
 */
export class EventsModule {
  private readonly escrowContract: Contract;

  constructor(provider: ethers.Provider, addresses: NetworkAddresses) {
    this.escrowContract = new Contract(addresses.escrow, CONFIDENTIAL_ESCROW_ABI, provider);
  }

  /** Listen for new escrow creations. */
  onEscrowCreated(callback: (escrowId: bigint) => void): Unsubscribe {
    const handler = (escrowId: bigint) => callback(escrowId);
    this.escrowContract.on("EscrowCreated", handler);
    return () => {
      this.escrowContract.off("EscrowCreated", handler);
    };
  }

  /** Listen for escrow fund events. */
  onEscrowFunded(
    callback: (escrowId: bigint, payer: string) => void,
    escrowId?: bigint,
  ): Unsubscribe {
    if (escrowId !== undefined) {
      const filter = this.escrowContract.filters.EscrowFunded(escrowId);
      const handler = (escrowId: bigint, payer: string) => callback(escrowId, payer);
      this.escrowContract.on(filter, handler);
      return () => {
        this.escrowContract.off(filter, handler);
      };
    }
    const handler = (escrowId: bigint, payer: string) => callback(escrowId, payer);
    this.escrowContract.on("EscrowFunded", handler);
    return () => {
      this.escrowContract.off("EscrowFunded", handler);
    };
  }

  /** Listen for escrow redemption events. */
  onEscrowRedeemed(callback: (escrowId: bigint) => void, escrowId?: bigint): Unsubscribe {
    if (escrowId !== undefined) {
      const filter = this.escrowContract.filters.EscrowRedeemed(escrowId);
      const handler = (escrowId: bigint) => callback(escrowId);
      this.escrowContract.on(filter, handler);
      return () => {
        this.escrowContract.off(filter, handler);
      };
    }
    const handler = (escrowId: bigint) => callback(escrowId);
    this.escrowContract.on("EscrowRedeemed", handler);
    return () => {
      this.escrowContract.off("EscrowRedeemed", handler);
    };
  }

  /** Query past escrow events. */
  async queryEscrowEvents(
    eventName: EscrowEventName,
    fromBlock?: number,
    toBlock?: number,
  ): Promise<ethers.Log[]> {
    const filter = this.escrowContract.filters[eventName]();
    return this.escrowContract.queryFilter(filter, fromBlock, toBlock) as Promise<ethers.Log[]>;
  }

  /** Remove all event listeners. */
  removeAllListeners(): void {
    this.escrowContract.removeAllListeners();
  }
}
