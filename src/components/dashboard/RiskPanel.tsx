// src/components/dashboard/RiskPanel.tsx
"use client";

import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Activity, Fingerprint } from 'lucide-react';
import { useTrading } from '@/context/TradingContext';
import { TradeRecord } from '@/types/trading';
import { AiRiskReport } from '@/types/0g';
import { commitReportTo0G } from '@/lib/0g/storage';

interface RiskPanelProps {
  trades: TradeRecord[];
}

export default function RiskPanel({ trades }: RiskPanelProps) {
  const { addCommittedLog } = useTrading();
  const [report, setReport] = useState<AiRiskReport | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hashData, setHashData] = useState<{ rootHash: string, txHash: string } | null>(null);
  const [evaluatedTradeSignature, setEvaluatedTradeSignature] = useState<string | null>(null);
  const currentTradeSignature = trades.map((trade) => `${trade.id}:${trade.timestamp}:${trade.realizedPnL}:${trade.leverage}`).join('|');
  const activeReport = evaluatedTradeSignature === currentTradeSignature ? report : null;
  const activeHashData = evaluatedTradeSignature === currentTradeSignature ? hashData : null;

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades }),
      });
      if (!res.ok) {
        throw new Error(`Evaluation failed with status ${res.status}`);
      }
      const data = await res.json();
      setReport(data);
      setHashData(null);
      setEvaluatedTradeSignature(currentTradeSignature);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCommit = async () => {
    if (!activeReport) return;
    setIsUploading(true);
    try {
      const result = await commitReportTo0G(activeReport);
      setHashData(result);
      
      // Append the successfully uploaded metadata into the global context
      addCommittedLog({
        rootHash: result.rootHash,
        txHash: result.txHash,
        date: new Date().toISOString().split('T')[0],
        passed: activeReport.passedMetrics,
        report: activeReport
      });
    } catch (error) {
      console.error("0G anchoring failed", error);
      alert(`Failed to anchor to 0G: ${getErrorMessage(error)}`);
    } finally {
      setIsUploading(false);
    }
  };

  if (!activeReport) {
    return (
      <div className="flex h-full flex-col items-center justify-center space-y-6 rounded-lg border border-white/10 bg-[#080d19] p-5 shadow-xl shadow-black/20">
        <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10">
          <Activity className="h-8 w-8 text-cyan-300" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">Compliance Agent Standby</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-xs">Ready to score the execution feed against leverage, drawdown, and loss-streak limits.</p>
        </div>
        <button 
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
        >
          {isEvaluating ? "Analyzing Logs..." : "Run Daily Evaluation"}
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6 rounded-lg border border-white/10 bg-[#080d19] p-5 shadow-xl shadow-black/20">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {activeReport.passedMetrics ? <ShieldCheck className="text-emerald-500 w-6 h-6" /> : <AlertTriangle className="text-rose-500 w-6 h-6" />}
          Compliance Report
        </h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${activeReport.passedMetrics ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {activeReport.passedMetrics ? 'Passed' : 'Failed'}
        </span>
      </div>
      
      <p className="text-slate-300 text-sm leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
        {activeReport.aiBehavioralSummary}
      </p>

      {activeReport.violations.length > 0 && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/10 p-4">
          <span className="block text-xs uppercase tracking-wider text-rose-400 font-semibold mb-2">Triggered Controls</span>
          <ul className="space-y-2 text-sm text-rose-200">
            {activeReport.violations.map((violation) => (
              <li key={violation}>{violation}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Max Drawdown</span>
          <span className="text-white font-mono text-xl">{activeReport.metrics.maxDrawdownPct}%</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Violations</span>
          <span className={`font-mono text-xl ${activeReport.violations.length > 0 ? 'text-rose-400' : 'text-white'}`}>
            {activeReport.violations.length}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800">
        {activeHashData ? (
          <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-lg break-all space-y-3">
            <div>
              <span className="flex items-center gap-2 text-emerald-500 text-xs uppercase tracking-wider mb-1 font-semibold">
                <Fingerprint className="w-4 h-4" /> 0G Root Hash
              </span>
              <span className="text-emerald-400 font-mono text-xs">{activeHashData.rootHash}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Transaction</span>
              <span className="text-slate-400 font-mono text-xs">{activeHashData.txHash}</span>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleCommit}
            disabled={isUploading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-cyan-400 px-4 py-4 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-50"
          >
            <Activity className="w-5 h-5" />
            {isUploading ? "Anchoring to 0G..." : "Commit Verifiable Log to 0G"}
          </button>
        )}
      </div>
    </div>
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return "Verify MetaMask, testnet funds, and the configured 0G RPC/indexer endpoints.";
}
