// src/components/dashboard/NewTradeForm.tsx
"use client";

import { useState } from 'react';
import { PlusCircle, DollarSign, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useTrading } from '@/context/TradingContext';
import { AssetPair, TradeDirection } from '@/types/trading';
import { compliantScenario, violationScenario } from '@/lib/utils/demoScenarios';

export default function NewTradeForm() {
  const { addTrade, replaceTrades } = useTrading();
  const [asset, setAsset] = useState<AssetPair>("XAU/USD");
  const [direction, setDirection] = useState<TradeDirection>("LONG");
  const [leverage, setLeverage] = useState<number>(10);
  const [pnl, setPnl] = useState<string>("");
  const [inputError, setInputError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInputError(null);

    const numericPnL = Number(pnl);
    if (!pnl || isNaN(numericPnL)) {
      setInputError("Please input a valid numeric currency valuation.");
      return;
    }

    if (Math.abs(numericPnL) > 25000) {
      setInputError("Simulated safety check: PnL boundary limits clamped to +/- $25,000 per order.");
      return;
    }

    addTrade({
      asset,
      direction,
      leverage,
      entryPrice: 2340.00,
      exitPrice: direction === "LONG" ? 2340.00 + (numericPnL / 100) : 2340.00 - (numericPnL / 100),
      realizedPnL: numericPnL,
    });

    setPnl("");
  };

  return (
    <div className="rounded-lg border border-white/10 bg-[#080d19] p-5 shadow-xl shadow-black/20">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold tracking-tight text-white">
        <PlusCircle className="h-5 w-5 text-cyan-300" />
        Simulate Order Execution
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-5">
        <button
          type="button"
          onClick={() => replaceTrades(compliantScenario)}
          className="flex items-center justify-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/15"
        >
          <ShieldCheck className="h-4 w-4" />
          Load Pass Demo
        </button>
        <button
          type="button"
          onClick={() => replaceTrades(violationScenario)}
          className="flex items-center justify-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 transition hover:bg-rose-500/15"
        >
          <ShieldAlert className="h-4 w-4" />
          Load Breach Demo
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDirection("LONG")}
              className={`rounded-lg border py-2 text-sm font-semibold transition ${direction === "LONG" ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300" : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200"}`}
            >
              LONG (Buy)
            </button>
            <button
              type="button"
              onClick={() => setDirection("SHORT")}
              className={`rounded-lg border py-2 text-sm font-semibold transition ${direction === "SHORT" ? "border-rose-400/40 bg-rose-500/10 text-rose-300" : "border-white/10 bg-white/[0.03] text-slate-400 hover:text-slate-200"}`}
            >
              SHORT (Sell)
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Asset</label>
          <select
            value={asset}
            onChange={(e) => setAsset(e.target.value as AssetPair)}
            className="w-full rounded-lg border border-white/10 bg-[#050914] p-2.5 font-mono text-sm text-slate-200 outline-none transition focus:border-cyan-400/50"
          >
            <option value="XAU/USD">XAU/USD</option>
            <option value="BTC/USD">BTC/USD</option>
            <option value="EUR/USD">EUR/USD</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-[#050914] p-2.5 font-mono text-sm text-slate-200 outline-none transition focus:border-cyan-400/50"
            >
              <option value={10}>10x</option>
              <option value={20}>20x</option>
              <option value={50}>50x</option>
              <option value={100}>100x (Violation)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Realized PnL ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="e.g. -1250 or 3400"
                value={pnl}
                onChange={(e) => setPnl(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-[#050914] py-2 pl-9 pr-4 font-mono text-sm text-slate-200 outline-none transition focus:border-cyan-400/50"
              />
            </div>
          </div>
        </div>

        {inputError && (
          <div className="flex items-center gap-2 p-3 bg-rose-950/20 border border-rose-900/30 text-rose-400 rounded-lg text-xs font-mono">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{inputError}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-lg border border-white/10 bg-white/10 py-2.5 text-sm font-semibold text-slate-100 shadow transition hover:bg-white/15"
        >
          Inject Trade Into Feed
        </button>
      </form>
    </div>
  );
}
