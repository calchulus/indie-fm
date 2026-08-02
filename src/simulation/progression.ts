// Medium-gap fixes: player growth notifications, scouting progression,
// board consequences, fan satisfaction, training visibility, financial P&L

import { Player } from '../types';

// --- Player Growth Notifications ---
export interface GrowthNotification {
  playerId: string;
  playerName: string;
  oldOverall: number;
  newOverall: number;
  change: number;
  message: string;
}

export function detectGrowth(before: Player[], after: Player[]): GrowthNotification[] {
  const notifications: GrowthNotification[] = [];
  for (const afterP of after) {
    const beforeP = before.find((p) => p.id === afterP.id);
    if (!beforeP) continue;
    const change = afterP.overall - beforeP.overall;
    if (Math.abs(change) >= 1) {
      notifications.push({
        playerId: afterP.id,
        playerName: afterP.name,
        oldOverall: beforeP.overall,
        newOverall: afterP.overall,
        change,
        message: change > 0
          ? `📈 ${afterP.name} improved! OVR ${beforeP.overall} → ${afterP.overall} (+${change})`
          : `📉 ${afterP.name} declined. OVR ${beforeP.overall} → ${afterP.overall} (${change})`,
      });
    }
  }
  return notifications;
}

// --- Scouting Progression ---
export interface ScoutingProgress {
  playerId: string;
  reportsFiled: number;
  revealedAttrs: string[];
  confidence: number;
}

const ATTR_TIERS = [
  ['pace', 'acceleration', 'stamina', 'strength'],
  ['passing', 'dribbling', 'crossing', 'technique', 'finishing'],
  ['vision', 'decisions', 'composure', 'offTheBall', 'positioning'],
  ['tackling', 'marking', 'heading', 'reflexes', 'handling'],
];

export function advanceScoutingReport(progress: ScoutingProgress | undefined, playerId: string): ScoutingProgress {
  const current = progress ?? { playerId, reportsFiled: 0, revealedAttrs: [], confidence: 0 };
  const reportsFiled = current.reportsFiled + 1;
  const tier = Math.min(reportsFiled - 1, ATTR_TIERS.length - 1);
  const revealedAttrs = [...new Set([...current.revealedAttrs, ...ATTR_TIERS[tier]])];
  const confidence = Math.min(1, reportsFiled * 0.25);
  return { playerId, reportsFiled, revealedAttrs, confidence };
}

export function getScoutedValue(actual: number, confidence: number): string {
  if (confidence >= 1) return `${actual}`;
  const noise = Math.round((1 - confidence) * 4);
  const low = Math.max(1, actual - noise);
  const high = Math.min(20, actual + noise);
  return `${low}-${high}`;
}

// --- Board Consequences ---
export interface BoardConsequence {
  confidenceChange: number;
  budgetChange: number;
  message: string;
}

export function evaluateBoardExpectations(
  position: number,
  totalTeams: number,
  targetPosition: number,
  _round: number,
  _totalRounds: number,
): BoardConsequence {
  if (position <= targetPosition) {
    return { confidenceChange: 3, budgetChange: 500_000, message: 'Board pleased — exceeding expectations. Extra transfer funds released.' };
  } else if (position <= targetPosition + 3) {
    return { confidenceChange: 0, budgetChange: 0, message: 'Board satisfied — on track for target.' };
  } else if (position <= totalTeams - 3) {
    return { confidenceChange: -5, budgetChange: -250_000, message: 'Board concerned — below target. Budget reduced.' };
  } else {
    return { confidenceChange: -15, budgetChange: -1_000_000, message: 'Board furious — relegation zone. Emergency meeting called.' };
  }
}

// --- Training Effect Visibility ---
export interface TrainingResult {
  playerId: string;
  playerName: string;
  improvedAttr: string;
  oldValue: number;
  newValue: number;
}

export function detectTrainingImprovements(before: Player[], after: Player[]): TrainingResult[] {
  const results: TrainingResult[] = [];
  const attrKeys = ['pace', 'passing', 'dribbling', 'finishing', 'tackling', 'positioning', 'stamina', 'composure'] as const;

  for (const afterP of after) {
    const beforeP = before.find((p) => p.id === afterP.id);
    if (!beforeP) continue;
    for (const attr of attrKeys) {
      const diff = (afterP.attributes as any)[attr] - (beforeP.attributes as any)[attr];
      if (diff > 0) {
        results.push({
          playerId: afterP.id,
          playerName: afterP.name,
          improvedAttr: attr,
          oldValue: (beforeP.attributes as any)[attr],
          newValue: (afterP.attributes as any)[attr],
        });
        break; // one improvement per player per round
      }
    }
  }
  return results;
}

// --- Financial P&L ---
export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  wageToTurnover: number;
  topExpense: string;
  rounds: number;
}

export function computeFinancialSummary(
  records: Array<{ round: number; income: number; expenses: number; wages: number }>,
): FinancialSummary {
  const totalIncome = records.reduce((s, r) => s + r.income, 0);
  const totalExpenses = records.reduce((s, r) => s + r.expenses, 0);
  const totalWages = records.reduce((s, r) => s + r.wages, 0);
  const wageToTurnover = totalIncome > 0 ? totalWages / totalIncome : 0;

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    wageToTurnover: Math.round(wageToTurnover * 100),
    topExpense: totalWages > totalExpenses - totalWages ? 'Wages' : 'Transfers',
    rounds: records.length,
  };
}
