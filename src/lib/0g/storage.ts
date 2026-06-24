// src/lib/0g/storage.ts
import { Blob as ZgBlob, Indexer } from '@0gfoundation/0g-storage-ts-sdk/browser';
import { ethers } from 'ethers';
import { AiRiskReport } from '@/types/0g';
import { DataValidator } from '@/lib/utils/validation';

const EVM_RPC_URL = process.env.NEXT_PUBLIC_ZEROG_RPC_URL ?? "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC_URL = process.env.NEXT_PUBLIC_ZEROG_INDEXER_URL ?? "https://indexer-storage-testnet-turbo.0g.ai";
type StorageFile = Parameters<Indexer['upload']>[0];

export async function commitReportTo0G(report: AiRiskReport): Promise<{ rootHash: string, txHash: string }> {
  try {
    // 1. Stringify the AI evaluation payload
    const jsonString = JSON.stringify(report, null, 2);
    const fileBuffer = new TextEncoder().encode(jsonString);
    const reportBlob = new globalThis.Blob([fileBuffer], { type: "application/json" });
    
    // 2. Initialize 0G File and compute Merkle Tree
    const zgFile = new ZgBlob(reportBlob) as unknown as StorageFile;
    const [tree, treeError] = await zgFile.merkleTree();
    if (treeError || !tree) {
      throw treeError ?? new Error("Unable to compute 0G Merkle tree.");
    }
    const rootHash = tree.rootHash();
    if (!rootHash) {
      throw new Error("0G Merkle tree did not return a root hash.");
    }

    // 3. Connect Web3 Provider (MetaMask)
    if (!window.ethereum) {
      throw new Error("No Web3 wallet detected. Please install MetaMask.");
    }
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // 4. Initialize Indexer and Upload to 0G Storage Node
    const indexer = new Indexer(INDEXER_RPC_URL);
    const [uploadResult, uploadError] = await indexer.upload(zgFile, EVM_RPC_URL, signer);
    if (uploadError || !uploadResult || !('txHash' in uploadResult)) {
      throw uploadError ?? new Error("0G upload did not return a single transaction hash.");
    }
    if (!uploadResult.txHash) {
      throw new Error("0G upload returned an empty transaction hash.");
    }
    
    return { rootHash, txHash: uploadResult.txHash };
  } catch (error) {
    console.error("0G Upload Error:", error);
    throw error;
  }
}

export async function fetchReportFrom0G(rootHash: string): Promise<AiRiskReport> {
  const indexer = new Indexer(INDEXER_RPC_URL);
  const [blob, downloadError] = await indexer.downloadToBlob(rootHash);
  if (downloadError) {
    throw downloadError;
  }

  const text = await blob.text();
  const parsedPayload = JSON.parse(text);
  const reportCheck = DataValidator.validateAiReportSchema(parsedPayload);
  if (!reportCheck.isValid) {
    throw new Error(reportCheck.error);
  }

  return reportCheck.sanitizedReport;
}
