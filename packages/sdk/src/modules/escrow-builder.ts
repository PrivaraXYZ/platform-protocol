import { ethers } from "ethers";
import { ValidationError } from "../errors/index.js";
import type { EscrowInstance } from "./escrow-instance.js";

export interface EscrowBuildConfig {
  amount?: bigint;
  owner?: string;
  resolver?: string;
  resolverData?: string;
}

export class EscrowBuilder {
  private config: EscrowBuildConfig = {};
  private readonly createFn: (config: EscrowBuildConfig) => Promise<EscrowInstance>;

  constructor(createFn: (config: EscrowBuildConfig) => Promise<EscrowInstance>) {
    this.createFn = createFn;
  }

  amount(value: bigint): this {
    if (value <= 0n) throw new ValidationError("Amount must be greater than 0");
    this.config.amount = value;
    return this;
  }

  owner(address: string): this {
    if (!ethers.isAddress(address)) throw new ValidationError(`Invalid owner address: ${address}`);
    this.config.owner = address;
    return this;
  }

  condition(resolver: string, resolverData?: string): this {
    if (!ethers.isAddress(resolver))
      throw new ValidationError(`Invalid resolver address: ${resolver}`);
    this.config.resolver = resolver;
    this.config.resolverData = resolverData ?? "0x";
    return this;
  }

  async create(): Promise<EscrowInstance> {
    this.validate();
    const result = await this.createFn(this.config);
    // Reset for reuse
    this.config = {};
    return result;
  }

  private validate(): void {
    if (this.config.amount === undefined)
      throw new ValidationError("Amount is required. Call .amount() before .create()");
    if (!this.config.owner)
      throw new ValidationError("Owner is required. Call .owner() before .create()");
  }

  /** @internal — for testing */
  getConfig(): Readonly<EscrowBuildConfig> {
    return { ...this.config };
  }
}
