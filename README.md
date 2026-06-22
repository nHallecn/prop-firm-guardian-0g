# Prop-Firm Guardian

Verifiable prop-firm compliance terminal built for the 0G Labs hackathon ecosystem.

Prop-Firm Guardian converts a trader's execution feed into a structured compliance report, computes a Merkle-verifiable payload, and anchors that payload to 0G Storage. The product goal is simple: a prop firm should be able to verify whether a trading session respected funding rules without trusting screenshots, private dashboards, or editable spreadsheets.

## Core Idea

Prop-firm traders are judged by strict rules: maximum leverage, daily drawdown, and behavioral risk such as revenge trading. This app simulates that monitoring workflow and stores the resulting compliance report on 0G so the report can be verified later by root hash.

Pipeline:

```text
Trade feed -> Compliance agent -> JSON report -> Merkle root -> 0G Storage -> Verification Vault
```

## Features

- Full-width trading terminal UI
- One-click compliant and breach demo scenarios
- Live execution feed and equity curve
- Deterministic compliance agent for:
  - maximum leverage
  - daily drawdown
  - consecutive-loss / revenge-trading behavior
- MetaMask wallet connection
- 0G EVM testnet network switching
- 0G Storage upload via `@0gfoundation/0g-storage-ts-sdk`
- Verification Vault for local committed logs and 0G root-hash payload lookup
- Persistent local demo state for smoother walkthroughs

## Tech Stack

- Next.js App Router
- React + TypeScript
- Tailwind CSS v4
- Recharts
- `ethers` v6
- `@0gfoundation/0g-storage-ts-sdk`

## 0G Network Config

The app is configured for the working 0G EVM testnet endpoint:

```text
0G EVM RPC: https://evmrpc-testnet.0g.ai
Chain ID: 16602
Chain ID hex: 0x40da
0G Storage Indexer: https://indexer-storage-testnet-turbo.0g.ai
Explorer: https://scan.testnet.0g.ai
```

Copy `.env.example` to `.env.local` if you need to override endpoints.

## Local Setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Demo Walkthrough

1. Open the dashboard.
2. Click **Load Pass Demo**.
3. Click **Run Daily Evaluation** to show a clean compliance report.
4. Click **Load Breach Demo**.
5. Click **Run Daily Evaluation** again to show leverage, drawdown, and behavioral controls firing.
6. Click **Connect Wallet** and approve MetaMask.
7. Confirm the header shows **Chain 16602**.
8. Click **Commit Verifiable Log to 0G**.
9. Approve the MetaMask transaction.
10. Copy the generated root hash.
11. Open **Verification Vault**.
12. Search the root hash to validate the stored compliance report.

## Commands

```bash
npm run lint
npm run build
```

Both should pass before submission.

## Hackathon Pitch

Prop-Firm Guardian demonstrates how 0G Storage can make AI-assisted financial compliance auditable. Instead of storing a private dashboard result, the app stores the report payload itself as verifiable data availability infrastructure. A funder, evaluator, or trader can later prove that a compliance decision maps to a specific immutable report.

## Current Scope

The compliance engine is intentionally deterministic for demo reliability. The `OPENAI_API_KEY` placeholder is reserved for a future LLM narrative layer, but the current core value is the verifiable compliance pipeline:

```text
execution data -> rules engine -> structured report -> Merkle root -> 0G Storage
```

## Notes

- You need MetaMask installed to commit logs to 0G.
- You need testnet funds on Chain `16602` for transaction fees.
- If MetaMask shows Chain `1`, you are still on Ethereum mainnet and the 0G commit will fail.
- If upload fails, check the browser alert for the specific MetaMask or SDK error.
