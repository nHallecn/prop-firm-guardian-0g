// src/lib/utils/validation.ts
import { TradeRecord } from '@/types/trading';
import { AiRiskReport } from '@/types/0g';

type UnknownRecord = Record<string, unknown>;

/**
 * Runtime validation for trade inputs and evaluation reports.
 */
export class DataValidator {
  /**
   * Validates structural integrity of inbound trading arrays before processing.
   */
  static validateTradesPayload(data: unknown): tradeValidationResult {
    if (!isRecord(data) || !Array.isArray(data.trades)) {
      return { isValid: false, error: "Root payload must contain an array element mapped to 'trades'." };
    }

    const tradeList = data.trades;
    const sanitizedData: TradeRecord[] = [];

    for (let i = 0; i < tradeList.length; i++) {
      const t = tradeList[i];
      if (!isRecord(t)) return { isValid: false, error: `Trade index [${i}]: trade entry must be an object.` };
      if (!isAssetPair(t.asset)) return { isValid: false, error: `Trade index [${i}]: 'asset' must be XAU/USD, BTC/USD, or EUR/USD.` };
      if (t.direction !== 'LONG' && t.direction !== 'SHORT') return { isValid: false, error: `Trade index [${i}]: 'direction' enum flag must explicitly resolve to LONG or SHORT.` };
      if (typeof t.leverage !== 'number' || t.leverage <= 0) return { isValid: false, error: `Trade index [${i}]: 'leverage' field must resolve to a valid non-zero numerical sequence.` };
      if (typeof t.realizedPnL !== 'number') return { isValid: false, error: `Trade index [${i}]: 'realizedPnL' metrics parsing requires an accurate primitive floating calculation.` };
      if (typeof t.entryPrice !== 'number' || typeof t.exitPrice !== 'number') return { isValid: false, error: `Trade index [${i}]: price fields must resolve to numeric values.` };

      sanitizedData.push({
        id: typeof t.id === 'string' ? t.id : `validated-${i}`,
        timestamp: typeof t.timestamp === 'string' ? t.timestamp : new Date().toISOString(),
        asset: t.asset,
        direction: t.direction,
        entryPrice: t.entryPrice,
        exitPrice: t.exitPrice,
        leverage: t.leverage,
        realizedPnL: t.realizedPnL,
      });
    }

    return { isValid: true, sanitizedData };
  }

  /**
   * Validates downstream AI object schemas before approving execution nodes to compile localized Merkle Trees.
   */
  static validateAiReportSchema(report: unknown): reportValidationResult {
    if (!isRecord(report)) return { isValid: false, error: "Target data report resolves to null reference pointer." };
    if (typeof report.passedMetrics !== 'boolean') return { isValid: false, error: "Validation element 'passedMetrics' requires precise primitive boolean flags." };
    if (!isRecord(report.metrics) || typeof report.metrics.maxDrawdownPct !== 'number' || typeof report.metrics.highestLeverage !== 'number' || typeof report.metrics.totalTrades !== 'number') {
      return { isValid: false, error: "Risk matrix block 'metrics' lacks valid internal float analytics." };
    }
    if (!Array.isArray(report.violations)) return { isValid: false, error: "Compliance element 'violations' must preserve standard string indexing patterns." };
    if (!report.violations.every((violation) => typeof violation === 'string')) return { isValid: false, error: "Compliance violations must be string values." };
    if (typeof report.evaluationDate !== 'string') return { isValid: false, error: "Evaluation date requires an ISO timestamp string." };
    if (typeof report.aiBehavioralSummary !== 'string') return { isValid: false, error: "Behavioral summary node requires structured descriptive strings." };

    return {
      isValid: true,
      sanitizedReport: {
        evaluationDate: report.evaluationDate,
        passedMetrics: report.passedMetrics,
        metrics: {
          maxDrawdownPct: report.metrics.maxDrawdownPct,
          highestLeverage: report.metrics.highestLeverage,
          totalTrades: report.metrics.totalTrades,
        },
        violations: report.violations,
        aiBehavioralSummary: report.aiBehavioralSummary,
      },
    };
  }
}

type tradeValidationResult = { isValid: true; sanitizedData: TradeRecord[] } | { isValid: false; error: string };
type reportValidationResult = { isValid: true; sanitizedReport: AiRiskReport } | { isValid: false; error: string };

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function isAssetPair(value: unknown): value is TradeRecord['asset'] {
  return value === 'XAU/USD' || value === 'BTC/USD' || value === 'EUR/USD';
}
