// src/components/dashboard/TradingChart.tsx
"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { DailyEquityState } from '@/types/trading';

const mockEquityData: DailyEquityState[] = [
  { time: '09:30', equity: 100000 },
  { time: '10:00', equity: 100500 },
  { time: '10:30', equity: 101200 },
  { time: '11:00', equity: 99800 },
  { time: '11:30', equity: 99500 },
  { time: '12:00', equity: 102000 },
  { time: '12:30', equity: 101800 },
  { time: '13:00', equity: 102500 },
];

const STARTING_BALANCE = 100000;
const MAX_DRAWDOWN_LIMIT = STARTING_BALANCE * 0.95; // 5% Drawdown limit

export default function TradingChart() {
  return (
    <div className="h-[450px] w-full bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-emerald-400 font-semibold tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            XAU/USD Live Equity Curve
          </h2>
          <p className="text-slate-400 text-sm mt-1 font-mono">Starting Balance: $100,000.00</p>
        </div>
      </div>
      
      <div className="h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockEquityData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
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
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '8px' }} 
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
              labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Equity']}
            />
            <ReferenceLine 
              y={MAX_DRAWDOWN_LIMIT} 
              stroke="#e11d48" 
              strokeDasharray="4 4" 
              label={{ position: 'insideBottomRight', value: '5% Hard Drawdown Limit', fill: '#e11d48', fontSize: 12 }} 
            />
            <Line 
              type="monotone" 
              dataKey="equity" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} 
              activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}