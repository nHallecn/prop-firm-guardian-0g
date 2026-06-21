import { TradeRecord } from '@/types/trading';

export const compliantScenario: TradeRecord[] = [
  { id: 'demo-pass-1', timestamp: '2026-06-21T09:30:00Z', asset: 'EUR/USD', direction: 'LONG', entryPrice: 1.082, exitPrice: 1.087, leverage: 10, realizedPnL: 450 },
  { id: 'demo-pass-2', timestamp: '2026-06-21T10:15:00Z', asset: 'XAU/USD', direction: 'SHORT', entryPrice: 2346, exitPrice: 2341, leverage: 20, realizedPnL: 900 },
  { id: 'demo-pass-3', timestamp: '2026-06-21T11:00:00Z', asset: 'BTC/USD', direction: 'LONG', entryPrice: 66400, exitPrice: 66850, leverage: 10, realizedPnL: 1100 },
  { id: 'demo-pass-4', timestamp: '2026-06-21T12:20:00Z', asset: 'XAU/USD', direction: 'LONG', entryPrice: 2338, exitPrice: 2335, leverage: 15, realizedPnL: -350 },
  { id: 'demo-pass-5', timestamp: '2026-06-21T13:05:00Z', asset: 'EUR/USD', direction: 'SHORT', entryPrice: 1.088, exitPrice: 1.084, leverage: 20, realizedPnL: 700 },
];

export const violationScenario: TradeRecord[] = [
  { id: 'demo-fail-1', timestamp: '2026-06-21T09:30:00Z', asset: 'BTC/USD', direction: 'LONG', entryPrice: 66400, exitPrice: 65800, leverage: 100, realizedPnL: -2200 },
  { id: 'demo-fail-2', timestamp: '2026-06-21T10:05:00Z', asset: 'XAU/USD', direction: 'LONG', entryPrice: 2344, exitPrice: 2331, leverage: 50, realizedPnL: -1800 },
  { id: 'demo-fail-3', timestamp: '2026-06-21T10:40:00Z', asset: 'BTC/USD', direction: 'LONG', entryPrice: 65800, exitPrice: 65100, leverage: 75, realizedPnL: -2600 },
  { id: 'demo-fail-4', timestamp: '2026-06-21T11:10:00Z', asset: 'XAU/USD', direction: 'SHORT', entryPrice: 2331, exitPrice: 2339, leverage: 50, realizedPnL: -1600 },
  { id: 'demo-fail-5', timestamp: '2026-06-21T11:45:00Z', asset: 'EUR/USD', direction: 'SHORT', entryPrice: 1.081, exitPrice: 1.079, leverage: 20, realizedPnL: 500 },
];
