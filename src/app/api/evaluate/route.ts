// src/app/api/evaluate/route.ts
import { NextResponse } from 'next/server';
import { DataValidator } from '@/lib/utils/validation';
import { calculateRiskReport } from '@/lib/utils/riskRules';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    
    // Perform defensive assertion check against payload inputs
    const tradeCheck = DataValidator.validateTradesPayload(rawBody);
    if (!tradeCheck.isValid) {
      return NextResponse.json({ error: tradeCheck.error }, { status: 400 });
    }

    const trades = tradeCheck.sanitizedData;

    // Simulate cryptographic compilation overhead and network processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const evaluationPayload = calculateRiskReport(trades);

    // Confirm generated state aligns with 0G Storage Schema Contracts before serialization
    const reportCheck = DataValidator.validateAiReportSchema(evaluationPayload);
    if (!reportCheck.isValid) {
      return NextResponse.json({ error: "Downstream AI generator output failed contract requirements criteria." }, { status: 500 });
    }

    return NextResponse.json(reportCheck.sanitizedReport);
  } catch {
    return NextResponse.json({ error: "Internal processing engine error during parsing." }, { status: 500 });
  }
}
