// src/components/dashboard/TradingChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useTrading } from '@/context/TradingContext';
import { buildEquityCurve, DEFAULT_THRESHOLDS } from '@/lib/utils/riskRules';

export default function TradingChart() {
  const { trades } = useTrading();
  const equityData = buildEquityCurve(trades);
  const currentEquity = equityData[equityData.length - 1]?.equity ?? DEFAULT_THRESHOLDS.startingBalance;
  const sessionPnL = currentEquity - DEFAULT_THRESHOLDS.startingBalance;
  const drawdownLimit = DEFAULT_THRESHOLDS.startingBalance * (1 - DEFAULT_THRESHOLDS.maxDailyDrawdownPct / 100);

  return (
    <div className="h-[450px] w-full rounded-md border border-slate-800 bg-[#080d19] p-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="flex items-center gap-2 font-semibold tracking-tight text-white">
            <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.7)]"></span>
            Live Prop-Firm Equity Curve
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-mono">Starting Balance: ${DEFAULT_THRESHOLDS.startingBalance.toLocaleString()}.00</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Current Equity</p>
            <p className="font-mono text-slate-100">${currentEquity.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">Session PnL</p>
            <p className={`font-mono ${sessionPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {sessionPnL >= 0 ? '+' : ''}${sessionPnL.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>
      
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={equityData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              tickMargin={10}
              axisLine={false}
            />
            <YAxis 
              domain={['dataMin - 1000', 'dataMax + 1000']} 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 12 }} 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#080d19', borderColor: 'rgba(255,255,255,0.12)', color: '#f8fafc', borderRadius: '8px' }} 
              itemStyle={{ color: '#67e8f9', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              formatter={(value) => {
                const numericValue = typeof value === 'number' ? value : Number(value ?? 0);
                return [`$${numericValue.toLocaleString()}`, 'Equity'];
              }}
            />
            <ReferenceLine 
              y={drawdownLimit} 
              stroke="#e11d48" 
              strokeDasharray="4 4" 
              label={{ position: 'insideBottomRight', value: `${DEFAULT_THRESHOLDS.maxDailyDrawdownPct}% Hard Drawdown Limit`, fill: '#e11d48', fontSize: 12 }} 
            />
            <Line 
              type="monotone" 
              dataKey="equity" 
              stroke="#22d3ee" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#22d3ee', strokeWidth: 0 }} 
              activeDot={{ r: 6, stroke: '#0891b2', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
