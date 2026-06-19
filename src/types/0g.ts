// src/types/0g.ts

export interface AiRiskReport {
  evaluationDate: string; // ISO 8601 format
  passedMetrics: boolean; 
  metrics: {
    maxDrawdownPct: number;
    highestLeverage: number;
    totalTrades: number;
  };
  violations: string[];   // Array of breached prop-firm rules
  aiBehavioralSummary: string;
}

export interface ZeroGStorageResponse {
  rootHash: string;
  txHash: string;
  timestamp: string;
}