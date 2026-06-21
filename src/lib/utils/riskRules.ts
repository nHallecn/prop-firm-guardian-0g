import { AiRiskReport } from '@/types/0g';
import { ComplianceThresholds, TradeRecord } from '@/types/trading';

export const DEFAULT_THRESHOLDS: ComplianceThresholds = {
  maxDailyDrawdownPct: 5,
  maxLeverageLimit: 50,
  revengeStreakLimit: 3,
  startingBalance: 100000,
};

export function buildEquityCurve(trades: TradeRecord[], startingBalance = DEFAULT_THRESHOLDS.startingBalance) {
  const chronologicalTrades = [...trades].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  let equity = startingBalance;
  return [
    { time: 'Start', equity },
    ...chronologicalTrades.map((trade) => {
      equity += trade.realizedPnL;
      return {
        time: new Date(trade.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        equity,
      };
    }),
  ];
}

export function calculateRiskReport(
  trades: TradeRecord[],
  thresholds: ComplianceThresholds = DEFAULT_THRESHOLDS
): AiRiskReport {
  const highestLeverage = trades.length > 0 ? Math.max(...trades.map((trade) => trade.leverage)) : 0;
  const totalPnL = trades.reduce((acc, trade) => acc + trade.realizedPnL, 0);
  const equityCurve = buildEquityCurve(trades, thresholds.startingBalance);
  const lowestEquity = Math.min(...equityCurve.map((point) => point.equity));
  const maxDrawdownPct = Number((((thresholds.startingBalance - lowestEquity) / thresholds.startingBalance) * 100).toFixed(2));
  const maxConsecutiveLosses = calculateMaxConsecutiveLosses(trades);

  const violations: string[] = [];
  if (highestLeverage > thresholds.maxLeverageLimit) {
    violations.push(`Leverage breach: ${highestLeverage}x exceeded the ${thresholds.maxLeverageLimit}x prop-firm limit.`);
  }
  if (maxDrawdownPct > thresholds.maxDailyDrawdownPct) {
    violations.push(`Daily drawdown breach: ${maxDrawdownPct}% exceeded the ${thresholds.maxDailyDrawdownPct}% hard limit.`);
  }
  if (maxConsecutiveLosses >= thresholds.revengeStreakLimit) {
    violations.push(`Behavioral risk breach: ${maxConsecutiveLosses} consecutive losses triggered the revenge-trading rule.`);
  }

  const passedMetrics = violations.length === 0;
  return {
    evaluationDate: new Date().toISOString(),
    passedMetrics,
    metrics: {
      maxDrawdownPct,
      highestLeverage,
      totalTrades: trades.length,
    },
    violations,
    aiBehavioralSummary: passedMetrics
      ? `Compliant session. ${trades.length} executions produced ${formatCurrency(totalPnL)} net PnL while staying inside leverage, drawdown, and loss-streak controls.`
      : `Non-compliant session. ${violations.length} rule ${violations.length === 1 ? 'breach was' : 'breaches were'} detected across the submitted execution log and the session should be escalated before funding approval.`,
  };
}

function calculateMaxConsecutiveLosses(trades: TradeRecord[]) {
  let maxConsecutiveLosses = 0;
  let currentLossStreak = 0;

  [...trades]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .forEach((trade) => {
      if (trade.realizedPnL < 0) {
        currentLossStreak += 1;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
      } else {
        currentLossStreak = 0;
      }
    });

  return maxConsecutiveLosses;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}
