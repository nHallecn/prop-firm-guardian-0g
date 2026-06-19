// src/types/trading.ts
// EXPANSION: Adding extended analytics interfaces for compliance validation checks

export type TradeDirection = "LONG" | "SHORT";
export type AssetPair = "XAU/USD" | "BTC/USD" | "EUR/USD";

export interface TradeRecord {
  id: string;
  timestamp: string;      // ISO 8601 string format
  asset: AssetPair;
  direction: TradeDirection;
  entryPrice: number;
  exitPrice: number;
  leverage: number;       // Integer sizing (e.g., 20, 50, 100)
  realizedPnL: number;    // Absolute dollar value (positive or negative)
}

export interface DailyEquityState {
  time: string;
  equity: number;
}

export interface ComplianceThresholds {
  maxDailyDrawdownPct: number;  // Default: 5.0
  maxLeverageLimit: number;     // Default: 50
  revengeStreakLimit: number;   // Default: 3
  startingBalance: number;      // Default: 100000
}