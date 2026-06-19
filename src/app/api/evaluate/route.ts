// src/app/api/evaluate/route.ts
// UPDATE: Enhance the evaluation endpoint with robust deterministic fallback metrics 
// and structure validation to mimic true production LLM JSON parsing guarantees.
import { NextResponse } from 'next/server';
import { TradeRecord } from '@/types/trading';
import { AiRiskReport } from '@/types/0g';

export async function POST(req: Request) {
  try {
    const { trades }: { trades: TradeRecord[] } = await req.json();

    if (!trades || trades.length === 0) {
      return NextResponse.json({ error: "Empty or invalid trade logs provided." }, { status: 400 });
    }

    // Simulate cryptographic compilation overhead and network processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Structural Analytics Parsers
    const highLeverage = Math.max(...trades.map((t) => t.leverage));
    const totalPnL = trades.reduce((acc, t) => acc + t.realizedPnL, 0);
    
    // Deterministic simulation tracking maximum consecutive losses (Revenge Trading detection)
    let maxConsecutiveLosses = 0;
    let currentLossStreak = 0;
    
    trades.forEach((trade) => {
      if (trade.realizedPnL < 0) {
        currentLossStreak++;
        if (currentLossStreak > maxConsecutiveLosses) {
          maxConsecutiveLosses = currentLossStreak;
        }
      } else {
        currentLossStreak = 0;
      }
    });

    const violations: string[] = [];
    if (highLeverage > 50) {
      violations.push(`Exceeded Maximum Leverage Limit: Found ${highLeverage}x position sizing.`);
    }
    if (maxConsecutiveLosses >= 3) {
      violations.push(`Psychological Behavioral Rule Breach: Revenge trading detected via ${maxConsecutiveLosses} consecutive execution losses.`);
    }

    const passedMetrics = violations.length === 0;

    const evaluationPayload: AiRiskReport = {
      evaluationDate: new Date().toISOString(),
      passedMetrics,
      metrics: {
        maxDrawdownPct: totalPnL < 0 ? Math.abs(Number(((totalPnL / 100000) * 10).toFixed(2))) : 0.4,
        highestLeverage: highLeverage,
        totalTrades: trades.length,
      },
      violations,
      aiBehavioralSummary: passedMetrics
        ? "Evaluation completed with optimal standings. Risk distribution parameters match rigid compliance standards. Risk-reward models reflect a steady mindset with balanced exposure thresholds across liquid trading sessions."
        : `Anomalous execution profiles identified. Execution data demonstrates compounding exposure risk. System flags severe over-leveraging accompanied by clear indications of emotional tilt and unstructured positions scaling. Log rejected for standard prop funding validation accounts.`,
    };

    return NextResponse.json(evaluationPayload);
  } catch (error) {
    return NextResponse.json({ error: "Internal processing engine error during parsing." }, { status: 500 });
  }
}