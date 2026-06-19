// src/lib/0g/storage.ts
import { Indexer, ZgFile } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';
import { AiRiskReport } from '@/types/0g';

const RPC_URL = "https://rpc.testnet.0g.ai";

export async function commitReportTo0G(report: AiRiskReport): Promise<{ rootHash: string, txHash: string }> {
  try {
    // 1. Stringify the AI evaluation payload
    const jsonString = JSON.stringify(report, null, 2);
    const fileBuffer = Buffer.from(jsonString, 'utf-8');
    
    // 2. Initialize 0G File and compute Merkle Tree
    const zgFile = new ZgFile(fileBuffer);
    await zgFile.merkleTree();
    const rootHash = zgFile.rootHash();

    // 3. Connect Web3 Provider (MetaMask)
    if (!window.ethereum) {
      throw new Error("No Web3 wallet detected. Please install MetaMask.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // 4. Initialize Indexer and Upload to 0G Storage Node
    const indexer = new Indexer(RPC_URL);
    const { txHash } = await indexer.upload(zgFile, RPC_URL, signer);
    
    return { rootHash, txHash };
  } catch (error) {
    console.error("0G Upload Error:", error);
    throw error;
  }
}