// src/app/history/page.tsx
"use client";

import { useState } from 'react';
import { Search, Shield, Calendar, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import { useTrading } from '@/context/TradingContext';
import { fetchReportFrom0G } from '@/lib/0g/storage';
import { isValidHexHash } from '@/lib/utils/helpers';

export default function HistoryPage() {
  const { committedLogs } = useTrading();
  const [searchHash, setSearchHash] = useState('');
  const [selectedReport, setSelectedReport] = useState<typeof committedLogs[0] | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedHash = searchHash.trim();
    setVerificationStatus(null);
    setIsVerifying(true);

    if (!isValidHexHash(normalizedHash)) {
      setVerificationStatus("Enter a valid 64-character 0G root hash before verification.");
      setIsVerifying(false);
      return;
    }

    const found = committedLogs.find(
      item => item.rootHash.toLowerCase() === normalizedHash.toLowerCase()
    );
    if (found) {
      setSelectedReport(found);
      setVerificationStatus("Matched against locally committed session cache.");
      setIsVerifying(false);
      return;
    }

    try {
      const remoteReport = await fetchReportFrom0G(normalizedHash);
      setSelectedReport({
        rootHash: normalizedHash,
        txHash: "",
        date: remoteReport.evaluationDate.split('T')[0],
        passed: remoteReport.passedMetrics,
        report: remoteReport,
      });
      setVerificationStatus("Downloaded report payload from 0G and validated its schema.");
    } catch (error) {
      console.error("0G verification lookup failed", error);
      setVerificationStatus("No local match and 0G download failed. Check the root hash, indexer endpoint, or network availability.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Audit & Verification Vault</h1>
        <p className="text-sm text-slate-400 mt-1">Verify immutable prop-firm compliance logs cryptographic integrity directly from 0G Storage Nodes.</p>
      </div>

      <form onSubmit={handleSearch} className="w-full flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by 0G Storage Root Hash (0x...)" 
            value={searchHash}
            onChange={(e) => setSearchHash(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <button type="submit" disabled={isVerifying} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
          {isVerifying && <Loader2 className="w-4 h-4 animate-spin" />}
          {isVerifying ? "Verifying" : "Verify"}
        </button>
      </form>
      {verificationStatus && (
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-300">
          {verificationStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider font-mono">Archived Sessions</h3>
          <div className="space-y-3">
            {committedLogs.map((item) => (
              <div 
                key={item.rootHash}
                onClick={() => setSelectedReport(item)}
                className={`p-4 rounded-xl border transition-all cursor-pointer bg-slate-900/50 ${selectedReport?.rootHash === item.rootHash ? 'border-blue-500 bg-slate-900' : 'border-slate-800 hover:border-slate-700'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {item.date}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {item.passed ? 'PASSED' : 'VIOLATION'}
                  </span>
                </div>
                <span className="block font-mono text-xs text-slate-500 truncate">{item.rootHash}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2">
          {selectedReport ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-xl">
              <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-500" />
                    Data Availability Integrity Verified
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-1 break-all">Root Hash: {selectedReport.rootHash}</p>
                </div>
                {selectedReport.txHash ? (
                  <a 
                    href={`https://scan.testnet.0g.ai/tx/${selectedReport.txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-blue-400 hover:underline bg-blue-950/40 border border-blue-900/50 px-2.5 py-1 rounded"
                  >
                    0GScan <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-slate-500 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded">
                    Remote payload verified
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 tracking-wider">Compliance Agent Statement</h4>
                  <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedReport.report.aiBehavioralSummary}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Max Drawdown</span>
                    <span className={`font-mono text-lg font-semibold ${selectedReport.report.metrics.maxDrawdownPct > 5 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {selectedReport.report.metrics.maxDrawdownPct}%
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Peak Leverage</span>
                    <span className={`font-mono text-lg font-semibold ${selectedReport.report.metrics.highestLeverage > 50 ? 'text-rose-400' : 'text-slate-200'}`}>
                      {selectedReport.report.metrics.highestLeverage}x
                    </span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <span className="block text-xs text-slate-500 uppercase tracking-wider mb-1">Total Executions</span>
                    <span className="font-mono text-lg font-semibold text-slate-200">{selectedReport.report.metrics.totalTrades}</span>
                  </div>
                </div>

                {selectedReport.report.violations.length > 0 && (
                  <div className="border border-rose-500/20 bg-rose-950/10 rounded-lg p-4 space-y-2">
                    <h4 className="text-xs font-semibold uppercase text-rose-400 tracking-wider flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> Triggered Rules Violations
                    </h4>
                    <ul className="list-disc pl-5 text-sm text-rose-300/90 space-y-1">
                      {selectedReport.report.violations.map((violation, i) => (
                        <li key={i}>{violation}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-500">
              Select an archived session or paste a 0G root hash to verify a stored compliance report.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
