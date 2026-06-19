// src/components/dashboard/NewTradeForm.tsx
// REVISION: Enhancing component functionality to include input boundary constraints 
// and dynamic feedback elements before updating context state.
"use client";

import { useState } from 'react';
import { PlusCircle, DollarSign, AlertCircle } from 'lucide-react';
import { useTrading } from '@/context/TradingContext';
import { AssetPair, TradeDirection } from '@/types/trading';

export default function NewTradeForm() {
  const { addTrade } = useTrading();
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
      asset: "XAU/USD" as AssetPair,
      direction,
      leverage,
      entryPrice: 2340.00,
      exitPrice: direction === "LONG" ? 2340.00 + (numericPnL / 100) : 2340.00 - (numericPnL / 100),
      realizedPnL: numericPnL,
    });

    setPnl("");
  };

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
      <h3 className="text-lg font-semibold mb-4 text-white tracking-wide flex items-center gap-2">
        <PlusCircle className="w-5 h-5 text-blue-500" />
        Simulate Order Execution
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Direction</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDirection("LONG")}
              className={`py-2 rounded-lg text-sm font-semibold transition-all border ${direction === "LONG" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/40" : "bg-slate-950 text-slate-400 border-slate-800"}`}
            >
              LONG (Buy)
            </button>
            <button
              type="button"
              onClick={() => setDirection("SHORT")}
              className={`py-2 rounded-lg text-sm font-semibold transition-all border ${direction === "SHORT" ? "bg-rose-500/10 text-rose-400 border-rose-500/40" : "bg-slate-950 text-slate-400 border-slate-800"}`}
            >
              SHORT (Sell)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 tracking-wider mb-2">Leverage</label>
            <select
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
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
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold py-2.5 rounded-lg text-sm transition-all shadow"
        >
          Inject Trade Into Feed
        </button>
      </form>
    </div>
  );
}