# AGENTS.md
# Context Guidance Document for AI Coding Assistants & Vibe Tools

This workspace is a Next.js 14+ application using the App Router, TypeScript, and Tailwind CSS. It integrates with the 0G Storage Network via the official `@0gfoundation/0g-storage-ts-sdk`.

## Architecture Constraints for AI Agents
1. **Routing Tier:** All user-facing views live inside `src/app/`. Use standard Next.js directory groups or folders for new modules.
2. **State Tier:** Global states (trades feed and verified cryptographic logs) are managed exclusively through `src/context/TradingContext.tsx` via the `useTrading()` hook. Do not spin up redundant local state trackers in downstream layouts.
3. **Web3 Dependency Layer:** The application utilizes `ethers` (v6) alongside `@0gfoundation/0g-storage-ts-sdk`.
4. **0G Storage Protocol:**
   - Always convert JSON evaluation payloads into string buffers before file instantiation.
   - Use `new ZgFile(buffer)` to compute Merkle Tree structures.
   - Use `Indexer.upload` pointing towards the Galileo Testnet endpoint (`https://rpc.testnet.0g.ai`) to submit data availability streams.

## Core Component Map
- `src/app/page.tsx` -> Core terminal control interface.
- `src/app/history/page.tsx` -> Decentralized verification page matching cryptographic root hashes to logs.
- `src/components/dashboard/RiskPanel.tsx` -> Component managing AI processing sequences and triggering 0G network uploads.
- `src/lib/0g/storage.ts` -> Pure wrapper containing interaction logic for blockchain consensus nodes.