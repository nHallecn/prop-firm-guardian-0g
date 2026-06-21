# README.md
# Prop-Firm Guardian AI

An AI-native decentralized risk management terminal built for the 0G Labs Vibe Coding Tournament (Zero Cup 2026). This terminal monitors trading performance metrics, runs automated compliance checks using structured AI models, and cryptographically uploads immutable audit records directly onto the **0G Distributed Storage Network**.

## Live Architecture Specs
- **Frontend Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS, Recharts
- **Decentralized Layer:** `@0gfoundation/0g-storage-ts-sdk`, `ethers.js`
- **Network Pipeline:** 0G Galileo Testnet (`https://rpc.testnet.0g.ai`)

## Local Setup Instructions

1. **Clone and Install Dependencies:**
   ```bash
   npm install

2. **How to Test the Core 0G Pipeline Flow:**
* Open your browser wallet extension (e.g., MetaMask) and connect to the page.
* Use the **Simulate Order Execution** panel to inject various trading data records into the stream.
* To trigger a compliance check failure, select **100x Leverage** or inject consecutive negative outcomes to trigger a revenge trading alarm.
* Click **Run Daily Evaluation** to compile the data using our structured evaluation handler.
* Click **Commit Verifiable Log to 0G** to generate a local Merkle tree asset, verify transaction parameters via MetaMask, and anchor the resulting data blocks to the 0G Storage Nodes.
* Copy the generated **0G Root Hash** string, navigate to the **Verification Vault** in the sidebar, and search for your transaction hash to verify its cryptographic proof structure.



```

```