// src/components/layout/Header.tsx
"use client";

import { useState, useEffect } from "react";
import { Activity, Wallet, AlertCircle, DatabaseZap } from "lucide-react";
import { truncateHash } from "@/lib/utils/helpers";

const EXPECTED_GALILEO_CHAIN_ID = process.env.NEXT_PUBLIC_ZEROG_CHAIN_ID_HEX;
const GALILEO_RPC_URL = process.env.NEXT_PUBLIC_ZEROG_RPC_URL ?? "https://rpc.testnet.0g.ai";

export default function Header() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if wallet is already authorized on mount
    const checkConnection = async () => {
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const accounts = await window.ethereum.request<string[]>({ method: "eth_accounts" });
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          }
          const activeChainId = await window.ethereum.request<string>({ method: "eth_chainId" });
          setChainId(activeChainId);
        } catch (err) {
          console.error("Failed to recover active session authorization parameters:", err);
        }
      }
    };
    checkConnection();

    const handleChainChanged = (nextChainId: unknown) => {
      if (typeof nextChainId === "string") {
        setChainId(nextChainId);
      }
    };

    window.ethereum?.request<string>({ method: "eth_chainId" }).then(setChainId).catch(() => undefined);
    window.ethereum?.on?.("chainChanged", handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  const connectWallet = async () => {
    setError(null);
    setIsConnecting(true);

    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask was not detected in this browser.");
      setIsConnecting(false);
      return;
    }

    try {
      const accounts = await window.ethereum.request<string[]>({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
      const activeChainId = await window.ethereum.request<string>({ method: "eth_chainId" });
      setChainId(activeChainId);
      if (EXPECTED_GALILEO_CHAIN_ID && activeChainId !== EXPECTED_GALILEO_CHAIN_ID) {
        await ensureGalileoNetwork();
        const updatedChainId = await window.ethereum.request<string>({ method: "eth_chainId" });
        setChainId(updatedChainId);
      }
    } catch (err: unknown) {
      if (isProviderError(err) && err.code === 4001) {
        setError("Connection signature request rejected by the user.");
      } else if (isProviderError(err) && err.code === 4902) {
        setError("Galileo Testnet is not available in MetaMask.");
      } else {
        setError(getProviderErrorMessage(err, "Wallet connection failed."));
      }
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#070b14]/90 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-400/25 bg-cyan-400/10 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
            <Activity className="h-5 w-5 text-cyan-300" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-semibold tracking-tight text-white sm:text-lg">Prop-Firm Guardian</h1>
            <p className="flex items-center gap-1.5 text-xs text-slate-400">
              <DatabaseZap className="h-3.5 w-3.5 text-emerald-300" />
              Verifiable risk logs on 0G
            </p>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
          <div className="flex w-full items-center gap-2 sm:w-auto">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-xs font-medium text-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-60"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-300"></span>
              </span>
              {chainId ? `Chain ${Number(chainId).toString()}` : "Wallet Network"}
            </div>

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition sm:flex-none ${
                account
                  ? "border-white/10 bg-white/5 text-slate-100 hover:bg-white/10"
                  : "border-cyan-400/40 bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-950/30 hover:bg-cyan-300"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <Wallet className="h-4 w-4" />
              {account ? truncateHash(account) : isConnecting ? "Connecting..." : "Connect Wallet"}
            </button>
          </div>

          {error && (
            <div className="flex max-w-full items-center gap-1.5 rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs text-rose-200 sm:max-w-md">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="truncate">{error}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

async function ensureGalileoNetwork() {
  if (!window.ethereum || !EXPECTED_GALILEO_CHAIN_ID) return;

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: EXPECTED_GALILEO_CHAIN_ID }],
    });
  } catch (error: unknown) {
    if (!isProviderError(error) || error.code !== 4902) {
      throw error;
    }

    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: EXPECTED_GALILEO_CHAIN_ID,
        chainName: "0G Galileo Testnet",
        nativeCurrency: {
          name: "0G",
          symbol: "0G",
          decimals: 18,
        },
        rpcUrls: [GALILEO_RPC_URL],
        blockExplorerUrls: ["https://scan.testnet.0g.ai"],
      }],
    });
  }
}

function isProviderError(error: unknown): error is { code: number } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

function getProviderErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}
