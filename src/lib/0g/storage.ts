// src/lib/0g/storage.ts
import { Indexer, MemData } from '@0gfoundation/0g-storage-ts-sdk/browser';
import { ethers } from 'ethers';
import { AiRiskReport } from '@/types/0g';
import { DataValidator } from '@/lib/utils/validation';

const EVM_RPC_URL = process.env.NEXT_PUBLIC_ZEROG_RPC_URL ?? "https://evmrpc-testnet.0g.ai";
const INDEXER_RPC_URLS = (process.env.NEXT_PUBLIC_ZEROG_INDEXER_URLS ?? process.env.NEXT_PUBLIC_ZEROG_INDEXER_URL ?? "https://indexer-storage-testnet-turbo.0g.ai,https://indexer-storage-testnet-standard.0g.ai")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);
type StorageFile = Parameters<Indexer['upload']>[0];

export async function commitReportTo0G(report: AiRiskReport): Promise<{ rootHash: string, txHash: string }> {
  try {
    // 1. Stringify the AI evaluation payload
    const jsonString = JSON.stringify(report, null, 2);
    const fileBuffer = new TextEncoder().encode(jsonString);
    
    // 2. Initialize 0G File and compute Merkle Tree
    const zgFile = new MemData(fileBuffer) as unknown as StorageFile;
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

    const uploadResult = await uploadWithAvailableIndexer(zgFile, signer).catch((error) => {
      throw new Error(`Local Merkle root computed (${rootHash}), but 0G upload failed because the configured storage indexers are unreachable. ${getErrorMessage(error)}`);
    });
    
    return { rootHash, txHash: uploadResult.txHash };
  } catch (error) {
    console.error("0G Upload Error:", error);
    throw error;
  }
}

export async function fetchReportFrom0G(rootHash: string): Promise<AiRiskReport> {
  const indexer = new Indexer(INDEXER_RPC_URLS[0]);
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

async function uploadWithAvailableIndexer(file: StorageFile, signer: ethers.Signer) {
  const failures: string[] = [];

  for (const indexerUrl of INDEXER_RPC_URLS) {
    try {
      const indexer = new Indexer(indexerUrl);
      const [uploadResult, uploadError] = await indexer.upload(file, EVM_RPC_URL, signer);

      if (uploadError || !uploadResult || !('txHash' in uploadResult)) {
        throw uploadError ?? new Error("0G upload did not return a single transaction hash.");
      }

      if (!uploadResult.txHash) {
        throw new Error("0G upload returned an empty transaction hash.");
      }

      return uploadResult;
    } catch (error) {
      failures.push(`${indexerUrl}: ${getErrorMessage(error)}`);
    }
  }

  throw new Error(`All configured 0G indexers failed. ${failures.join(" | ")}`);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return String(error);
}
