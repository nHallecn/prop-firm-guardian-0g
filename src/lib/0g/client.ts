// src/lib/0g/client.ts
// REVISION: Adding type safety and custom network configurations for the 0G Galileo Testnet
import { Indexer } from '@0gfoundation/0g-storage-ts-sdk';

export interface ZeroGNetworkConfig {
  rpcUrl: string;
  kvAddress?: string;
  storageNodeUrl?: string;
}

export const GALILEO_TESTNET_CONFIG: ZeroGNetworkConfig = {
  rpcUrl: "https://rpc.testnet.0g.ai",
  // Standard development nodes; update if the Zero Cup organizers issue custom team endpoint parameters
  kvAddress: "0x0000000000000000000000000000000000000000", 
  storageNodeUrl: "https://rpc.testnet.0g.ai"
};

/**
 * Singleton factory provider for the 0G Storage Indexer.
 * Guarantees a single persistent connection across Next.js client component updates.
 */
let indexerInstance: Indexer | null = null;

export function getZeroGClient(config: ZeroGNetworkConfig = GALILEO_TESTNET_CONFIG): Indexer {
  if (typeof window === 'undefined') {
    return new Indexer(config.rpcUrl);
  }
  
  if (!indexerInstance) {
    indexerInstance = new Indexer(config.rpcUrl);
  }
  return indexerInstance;
}