# SOFTWARE REQUIREMENTS SPECIFICATION (SRS) & SYSTEM ARCHITECTURE
# Project: Prop-Firm Guardian AI
# Target Deployment: 0G Labs Vibe Coding Tournament (July 19)

## 1. INTRODUCTION & PURPOSE
The Prop-Firm Guardian AI is a decentralized, AI-native risk management application. It evaluates a trader's real-time execution data (focusing on XAU/USD) against strict proprietary trading firm risk parameters and anchors the evaluation cryptographically to the 0G Network to ensure immutability and verifiable data availability.

## 2. FUNCTIONAL REQUIREMENTS (FR)
* **FR-1 [Data Ingestion]:** The system must accept chronological trading execution logs, including entry/exit prices, timestamps, leverage utilized, and realized PnL.
* **FR-2 [AI Evaluation]:** The system must pass the trading log to an AI agent instructed to identify psychological deviations (e.g., revenge trading) and hard risk limit breaches (e.g., >5% daily drawdown, >50x leverage).
* **FR-3 [Cryptographic Hashing]:** The system must compile the AI's JSON evaluation report into a file buffer and compute a Merkle Tree root hash using the `@0gfoundation/0g-storage-ts-sdk`.
* **FR-4 [Decentralized Storage]:** The system must allow the user to sign a Web3 transaction (via ethers.js/MetaMask) to upload the file buffer to the 0G Galileo Testnet.
* **FR-5 [Audit Trail]:** The system must display the immutable `rootHash` and `txHash` to the user upon successful upload.

## 3. NON-FUNCTIONAL REQUIREMENTS (NFR)
* **NFR-1 [Immutability]:** Once the risk evaluation is anchored to 0G, it cannot be altered or backdated.
* **NFR-2 [Performance]:** UI state must update optimistically while waiting for the 0G Network indexing confirmation.
* **NFR-3 [Usability]:** The interface must utilize a dark-mode, high-contrast financial terminal aesthetic (Tailwind CSS) suitable for professional day traders.

## 4. SYSTEM ARCHITECTURE

```mermaid
graph TD
    %% Frontend Components
    subgraph "Client Tier (Next.js / React)"
        UI[Dashboard UI]
        Chart[Recharts Equity Curve]
        RiskPanel[AI Risk Panel]
        Wallet[Web3 Wallet / MetaMask]
    end

    %% Application Logic Tier
    subgraph "Application Tier (Next.js API)"
        AI_Route[API: /api/evaluate]
        Prompt[System Prompts]
        LLM[LLM Provider]
    end

    %% Decentralized Storage Tier
    subgraph "Data Availability Tier (0G Network)"
        SDK[@0gfoundation SDK]
        RPC[0G Galileo Testnet RPC]
        Storage[0G Storage Nodes]
    end

    %% Interactions
    UI --> Chart
    UI --> RiskPanel
    RiskPanel -- "1. Sends Trade Log" --> AI_Route
    AI_Route -- "2. Injects Context" --> Prompt
    Prompt -- "3. Requests Analysis" --> LLM
    LLM -- "4. Returns JSON Report" --> RiskPanel
    
    RiskPanel -- "5. Triggers Upload" --> SDK
    Wallet -- "6. Signs Transaction" --> SDK
    SDK -- "7. Uploads Merkle Tree" --> RPC
    RPC -- "8. Anchors Data" --> Storage
    Storage -- "9. Returns Root Hash" --> RiskPanel