# Prop-Firm Guardian

Verifiable prop-firm compliance terminal for the 0G Labs Vibe Coding Tournament.

Prop-Firm Guardian turns a trader's execution feed into a structured compliance report, computes a Merkle-verifiable payload, and anchors that report to 0G Storage. The goal is simple: a prop firm should be able to verify whether a trading session respected risk rules without trusting a private dashboard screenshot.

## What It Demonstrates

- Live trade feed simulation with pass and breach demo scenarios
- Deterministic compliance agent for leverage, drawdown, and revenge-trading checks
- Dynamic equity curve generated from the current execution feed
- 0G Storage upload flow using `@0gfoundation/0g-storage-ts-sdk` and `ethers`
- Verification Vault that checks local committed logs first, then attempts a 0G root-hash download
- Persistent local demo state for smoother judge walkthroughs

## Stack

- Next.js App Router, React, TypeScript, Tailwind CSS
- Recharts for the equity curve
- `@0gfoundation/0g-storage-ts-sdk`
- `ethers` v6 with browser wallet signing
- 0G Galileo Testnet RPC: `https://rpc.testnet.0g.ai`

## Local Setup

```bash
npm install
npm run dev
```

Create `.env.local` from `.env.example` if you need custom 0G endpoints.

## Judge Demo Path

1. Open the dashboard.
2. Click **Load Pass Demo** and then **Run Daily Evaluation**.
3. Click **Load Breach Demo** and run evaluation again to show leverage and behavioral controls firing.
4. Connect MetaMask on the Galileo Testnet.
5. Click **Commit Verifiable Log to 0G**.
6. Copy the generated root hash.
7. Open **Verification Vault** and search that root hash.
8. The Vault first matches local committed logs; for external root hashes, it attempts to download and validate the report payload from 0G.

## Commands

```bash
npm run lint
npm run build
```

Both commands should pass before submission.

## Current Scope

The compliance engine is intentionally deterministic for demo reliability. The `OPENAI_API_KEY` placeholder exists for a future LLM narrative layer, but the core hackathon value is the verifiable compliance pipeline: trade feed -> risk report -> Merkle root -> 0G Storage -> root-hash verification.
