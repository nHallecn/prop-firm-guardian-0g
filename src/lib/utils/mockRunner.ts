// src/lib/utils/mockRunner.ts
// Local E2E Simulation Runner Utility
// Allows full verification of the AI parsing -> validation -> Merkle Tree pipeline locally

import { DataValidator } from './validation';
import { TradeRecord } from '@/types/trading';
import { AiRiskReport } from '@/types/0g';
import { calculateRiskReport } from './riskRules';

export async function runLocalE2EPipeline(mockTrades: TradeRecord[]): Promise<{
  success: boolean;
  report?: AiRiskReport;
  error?: string;
}> {
  console.log("[E2E Pipeline] Initiating local trade ingestion run...");
  
  // 1. Validate inputs
  const inputCheck = DataValidator.validateTradesPayload({ trades: mockTrades });
  if (!inputCheck.isValid) {
    return { success: false, error: `Input Validation Failed: ${inputCheck.error}` };
  }

  // 2. Compute metrics locally using the same rules as the /api/evaluate route.
  const generatedReport: AiRiskReport = calculateRiskReport(inputCheck.sanitizedData);

  // 3. Verify downstream structural format safety
  const finalCheck = DataValidator.validateAiReportSchema(generatedReport);
  if (!finalCheck.isValid) {
    return { success: false, error: `Output Validation Contract Broken: ${finalCheck.error}` };
  }

  console.log("[E2E Pipeline] Log compiled successfully. Ready for 0G client injection.");
  return { success: true, report: finalCheck.sanitizedReport };
}
