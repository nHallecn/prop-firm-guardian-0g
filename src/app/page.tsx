"use client";

import dynamic from 'next/dynamic';
import RiskPanel from '@/components/dashboard/RiskPanel';
import NewTradeForm from '@/components/dashboard/NewTradeForm';
import { useTrading } from '@/context/TradingContext';

const TradingChart = dynamic(() => import('@/components/dashboard/TradingChart'), {
  ssr: false,
  loading: () => <div className="h-[450px] w-full rounded-xl border border-slate-800 bg-slate-900" />,
});

export default function DashboardPage() {
  const { trades } = useTrading();

  return (
    <main className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
          <TradingChart />
          
          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
            <h3 className="text-lg font-semibold mb-6 text-white tracking-wide">Live Execution Feed</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-slate-800 text-slate-500 uppercase tracking-wider text-xs">
                  <tr>
                    <th className="pb-4 font-medium pl-4">Time (UTC)</th>
                    <th className="pb-4 font-medium">Asset</th>
                    <th className="pb-4 font-medium">Direction</th>
                    <th className="pb-4 font-medium">Leverage</th>
                    <th className="pb-4 text-right font-medium pr-4">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {trades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                        No trade execution logs found for current trading window.
                      </td>
                    </tr>
                  ) : (
                    trades.map((trade) => (
                      <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 font-mono pl-4">
                          {new Date(trade.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                        </td>
                        <td className="py-4 font-medium text-white">{trade.asset}</td>
                        <td className={`py-4 font-semibold ${trade.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.direction}
                        </td>
                        <td className="py-4 text-slate-400">{trade.leverage}x</td>
                        <td className={`py-4 text-right font-mono font-medium pr-4 ${trade.realizedPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.realizedPnL >= 0 ? '+' : ''}${trade.realizedPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-8">
          <NewTradeForm />
          <RiskPanel trades={trades} />
        </div>

      </div>
    </main>
  );
}
