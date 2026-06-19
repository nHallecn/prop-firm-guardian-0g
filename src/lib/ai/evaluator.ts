// src/lib/ai/evaluator.ts
import { TradeRecord } from '@/types/trading';
import { AiRiskReport } from '@/types/0g';

/**
 * Technical service to format and validate payloads before sending them to the 
 * internal Next.js API evaluation engine or external LLM endpoints.
 */
export class RiskEvaluatorService {
  /**
   * Dispatches a collection of transaction logs to the application processing engine.
   */
  static async executeEvaluation(trades: TradeRecord[]): Promise<AiRiskReport> {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ trades }),
      });

      if (!response.ok) {
        throw new Error(`API evaluation service responded with status: ${response.status}`);
      }

      const report: AiRiskReport = await response.json();
      return report;
    } catch (error) {
      console.error("Critical failure inside RiskEvaluatorService handler:", error);
      throw error;
    }
  }

  /**
   * Helper method to parse local trade structures into a raw prompt format 
   * if the client decides to substitute the API route with an edge-side LLM call.
   */
  static generateRawTextPrompt(trades: TradeRecord[]): string {
    return `Analyze the following system executions:\n${JSON.stringify(trades, null, 2)}`;
  }
}