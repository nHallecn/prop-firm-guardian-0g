"use client";

import dynamic from 'next/dynamic';
import RiskPanel from '@/components/dashboard/RiskPanel';
import NewTradeForm from '@/components/dashboard/NewTradeForm';
import { useTrading } from '@/context/TradingContext';
import { buildEquityCurve, calculateRiskReport, DEFAULT_THRESHOLDS } from '@/lib/utils/riskRules';

const TradingChart = dynamic(() => import('@/components/dashboard/TradingChart'), {
  ssr: false,
  loading: () => <div className="h-[450px] w-full rounded-md border border-slate-800 bg-[#080d19]" />,
});

export default function DashboardPage() {
  const { trades } = useTrading();
  const reportPreview = calculateRiskReport(trades);
  const equityCurve = buildEquityCurve(trades);
  const currentEquity = equityCurve[equityCurve.length - 1]?.equity ?? DEFAULT_THRESHOLDS.startingBalance;
  const sessionPnL = currentEquity - DEFAULT_THRESHOLDS.startingBalance;

  return (
    <main className="w-full space-y-5 p-4 md:p-5 xl:p-6">
      <section className="rounded-md border border-slate-800 bg-[#080d19] p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-300">0G Compliance Terminal</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Trading session audit</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              Score prop-firm rule breaches, produce a verifiable report, then anchor the payload to 0G Storage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <MetricCard label="Current Equity" value={`$${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} />
            <MetricCard
              label="Session PnL"
              value={`${sessionPnL >= 0 ? '+' : ''}$${sessionPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
              tone={sessionPnL >= 0 ? 'good' : 'bad'}
            />
            <MetricCard label="Executions" value={String(trades.length)} />
            <MetricCard
              label="Risk Status"
              value={reportPreview.passedMetrics ? 'Clear' : 'Breach'}
              tone={reportPreview.passedMetrics ? 'good' : 'bad'}
            />
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
        
        <div className="min-w-0 space-y-5">
          <TradingChart />
          
          <div className="rounded-md border border-slate-800 bg-[#080d19] p-5">
            <h3 className="mb-5 text-base font-semibold tracking-tight text-white">Live Execution Feed</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="pb-4 font-medium pl-4">Time (UTC)</th>
                    <th className="pb-4 font-medium">Asset</th>
                    <th className="pb-4 font-medium">Direction</th>
                    <th className="pb-4 font-medium">Leverage</th>
                    <th className="pb-4 text-right font-medium pr-4">PnL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {trades.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-500 font-mono text-xs">
                        No trade execution logs found for current trading window.
                      </td>
                    </tr>
                  ) : (
                    trades.map((trade) => (
                      <tr key={trade.id} className="transition hover:bg-white/[0.03]">
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
        
        <div className="flex min-w-0 flex-col gap-5">
          <NewTradeForm />
          <RiskPanel trades={trades} />
        </div>

      </div>
    </main>
  );
}

function MetricCard({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'neutral' | 'good' | 'bad';
}) {
  const toneClass = {
    neutral: 'text-white',
    good: 'text-emerald-300',
    bad: 'text-rose-300',
  }[tone];

  return (
    <div className="min-w-0 rounded-md border border-slate-800 bg-[#0b1220] px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className={`mt-2 truncate font-mono text-sm font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}
