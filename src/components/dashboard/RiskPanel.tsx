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

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades }),
      });
      const data = await res.json();
      setReport(data);
    } catch (error) {
      console.error("Evaluation failed", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleCommit = async () => {
    if (!report) return;
    setIsUploading(true);
    try {
      const result = await commitReportTo0G(report);
      setHashData(result);
      
      // Append the successfully uploaded metadata into the global context
      addCommittedLog({
        rootHash: result.rootHash,
        txHash: result.txHash,
        date: new Date().toISOString().split('T')[0],
        passed: report.passedMetrics,
        report: report
      });
    } catch (error) {
      alert("Failed to anchor to 0G. Verify that MetaMask is active and configured to the Galileo Testnet RPC.");
    } finally {
      setIsUploading(false);
    }
  };

  if (!report) {
    return (
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl h-full flex flex-col items-center justify-center space-y-6">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center">
          <Activity className="w-8 h-8 text-emerald-500" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white">AI Risk Agent Standby</h3>
          <p className="text-sm text-slate-400 mt-2 max-w-xs">Ready to analyze daily execution data against prop-firm parameters.</p>
        </div>
        <button 
          onClick={handleEvaluate}
          disabled={isEvaluating}
          className="w-full bg-slate-100 hover:bg-white text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
        >
          {isEvaluating ? "Analyzing Logs..." : "Run Daily Evaluation"}
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          {report.passedMetrics ? <ShieldCheck className="text-emerald-500 w-6 h-6" /> : <AlertTriangle className="text-rose-500 w-6 h-6" />}
          AI Risk Report
        </h2>
        <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase ${report.passedMetrics ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
          {report.passedMetrics ? 'Passed' : 'Failed'}
        </span>
      </div>
      
      <p className="text-slate-300 text-sm leading-relaxed bg-slate-950 p-4 rounded-lg border border-slate-800">
        {report.aiBehavioralSummary}
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Max Drawdown</span>
          <span className="text-white font-mono text-xl">{report.metrics.maxDrawdownPct}%</span>
        </div>
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
          <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1">Violations</span>
          <span className={`font-mono text-xl ${report.violations.length > 0 ? 'text-rose-400' : 'text-white'}`}>
            {report.violations.length}
          </span>
        </div>
      </div>

      <div className="mt-auto pt-6 border-t border-slate-800">
        {hashData ? (
          <div className="bg-emerald-950/30 border border-emerald-500/30 p-4 rounded-lg break-all space-y-3">
            <div>
              <span className="flex items-center gap-2 text-emerald-500 text-xs uppercase tracking-wider mb-1 font-semibold">
                <Fingerprint className="w-4 h-4" /> 0G Root Hash
              </span>
              <span className="text-emerald-400 font-mono text-xs">{hashData.rootHash}</span>
            </div>
            <div>
              <span className="block text-slate-500 text-xs uppercase tracking-wider mb-1 font-semibold">Transaction</span>
              <span className="text-slate-400 font-mono text-xs">{hashData.txHash}</span>
            </div>
          </div>
        ) : (
          <button 
            onClick={handleCommit}
            disabled={isUploading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-4 px-4 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Activity className="w-5 h-5" />
            {isUploading ? "Anchoring to 0G..." : "Commit Verifiable Log to 0G"}
          </button>
        )}
      </div>
    </div>
  );
}