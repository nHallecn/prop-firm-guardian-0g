// src/context/TradingContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { TradeRecord } from '@/types/trading';
import { AiRiskReport } from '@/types/0g';

interface CommittedLog {
  rootHash: string;
  txHash: string;
  date: string;
  passed: boolean;
  report: AiRiskReport;
}

interface TradingContextType {
  trades: TradeRecord[];
  committedLogs: CommittedLog[];
  addTrade: (trade: Omit<TradeRecord, 'id' | 'timestamp'>) => void;
  replaceTrades: (trades: TradeRecord[]) => void;
  addCommittedLog: (log: CommittedLog) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);
const TRADES_STORAGE_KEY = 'prop-firm-guardian-trades';
const LOGS_STORAGE_KEY = 'prop-firm-guardian-logs';

const initialTrades: TradeRecord[] = [
  { id: '1', timestamp: '2026-06-19T12:05:11Z', asset: 'XAU/USD', direction: 'LONG', entryPrice: 2341.50, exitPrice: 2345.00, leverage: 15, realizedPnL: 2500.00 },
  { id: '2', timestamp: '2026-06-19T11:15:42Z', asset: 'XAU/USD', direction: 'SHORT', entryPrice: 2338.20, exitPrice: 2340.00, leverage: 20, realizedPnL: -300.00 },
  { id: '3', timestamp: '2026-06-19T09:45:10Z', asset: 'XAU/USD', direction: 'LONG', entryPrice: 2335.00, exitPrice: 2337.50, leverage: 10, realizedPnL: 1200.00 },
];

const initialLogs: CommittedLog[] = [
  {
    rootHash: "0x7f8c9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f",
    txHash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    date: "2026-06-18",
    passed: true,
    report: {
      evaluationDate: "2026-06-18T17:00:00Z",
      passedMetrics: true,
      metrics: { maxDrawdownPct: 0.8, highestLeverage: 10, totalTrades: 5 },
      violations: [],
      aiBehavioralSummary: "Exceptional discipline displayed. Position sizing was calculated systematically with no emotional over-leveraging observed during key London session volatility spikes."
    }
  }
];

export function TradingProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<TradeRecord[]>(initialTrades);
  const [committedLogs, setCommittedLogs] = useState<CommittedLog[]>(initialLogs);
  const hasLoadedStoredState = useRef(false);

  useEffect(() => {
    queueMicrotask(() => {
      setTrades(readStoredValue(TRADES_STORAGE_KEY, initialTrades));
      setCommittedLogs(readStoredValue(LOGS_STORAGE_KEY, initialLogs));
      hasLoadedStoredState.current = true;
    });
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && hasLoadedStoredState.current) {
      window.localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(trades));
    }
  }, [trades]);

  useEffect(() => {
    if (typeof window !== 'undefined' && hasLoadedStoredState.current) {
      window.localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(committedLogs));
    }
  }, [committedLogs]);

  const addTrade = (tradeData: Omit<TradeRecord, 'id' | 'timestamp'>) => {
    const newTrade: TradeRecord = {
      ...tradeData,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setTrades((prev) => [newTrade, ...prev]);
  };

  const replaceTrades = (nextTrades: TradeRecord[]) => {
    setTrades(nextTrades);
  };

  const addCommittedLog = (log: CommittedLog) => {
    setCommittedLogs((prev) => [log, ...prev]);
  };

  return (
    <TradingContext.Provider value={{ trades, committedLogs, addTrade, replaceTrades, addCommittedLog }}>
      {children}
    </TradingContext.Provider>
  );
}

export function useTrading() {
  const context = useContext(TradingContext);
  if (!context) throw new Error('useTrading must be used within a TradingProvider');
  return context;
}

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') {
    return fallback;
  }

  try {
    const storedValue = window.localStorage.getItem(key);
    return storedValue ? (JSON.parse(storedValue) as T) : fallback;
  } catch {
    return fallback;
  }
}
