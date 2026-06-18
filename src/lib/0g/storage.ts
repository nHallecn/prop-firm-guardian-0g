// src/lib/0g/storage.ts
import { Indexer, ZgFile } from '@0gfoundation/0g-storage-ts-sdk';
import { ethers } from 'ethers';

export async function commitJournalTo0G(tradingData: object): Promise<string> {
  try {
    // 1. Prepare the AI evaluation data as a buffer
    const jsonString = JSON.stringify(tradingData);
    const fileBuffer = Buffer.from(jsonString, 'utf-8');
    
    // 2. Initialize 0G File instance
    const zgFile = new ZgFile(fileBuffer);
    await zgFile.merkleTree(); // Generate the tree for integrity
    const rootHash = zgFile.rootHash();

    // 3. Connect to Web3 Provider
    if (!window.ethereum) throw new Error("Wallet not found. Please install MetaMask.");
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();

    // 4. Initialize the Indexer and Upload
    // Using the Galileo Testnet RPC
    const indexer = new Indexer("https://rpc.testnet.0g.ai");
    
    // Submit the transaction and upload data
    const { txHash } = await indexer.upload(zgFile, "https://rpc.testnet.0g.ai", signer);
    
    console.log(`Successfully logged to 0G. \nRoot Hash: ${rootHash}\nTx Hash: ${txHash}`);
    return rootHash;

  } catch (error) {
    console.error("0G Integration Error:", error);
    throw error;
  }
}