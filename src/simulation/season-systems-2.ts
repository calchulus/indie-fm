// Transfer window AI (#11), wage structure enforcement (#14),
// mid-season board review (#15), player retirement announcements (#17)

import { Team, Player } from '../types';

// --- #11: Transfer Window AI Activity ---

export interface AITransferAction {
  teamId: string;
  type: 'buy' | 'sell' | 'loan_in' | 'loan_out';
  positionNeed: string;
  budget: number;
  urgency: number; // 1-5
}

export function computeAITransferNeeds(team: Team, position: number, totalTeams: number): AITransferAction[] {
  const actions: AITransferAction[] = [];

  // Count players per position group
  const posCounts: Record<string, number> = {};
  for (const p of team.players) {
    const group = ['GK'].includes(p.position) ? 'GK' :
      ['CB', 'LB', 'RB'].includes(p.position) ? 'DEF' :
      ['CDM', 'CM', 'CAM'].includes(p.position) ? 'MID' : 'ATT';
    posCounts[group] = (posCounts[group] ?? 0) + 1;
  }

  // Identify needs: fewer than 3 in a group = need
  const needs: Array<{ group: string; urgency: number }> = [];
  if ((posCounts['GK'] ?? 0) < 2) needs.push({ group: 'GK', urgency: 4 });
  if ((posCounts['DEF'] ?? 0) < 5) needs.push({ group: 'DEF', urgency: 3 });
  if ((posCounts['MID'] ?? 0) < 5) needs.push({ group: 'MID', urgency: 3 });
  if ((posCounts['ATT'] ?? 0) < 3) needs.push({ group: 'ATT', urgency: 4 });

  // Relegation-threatened teams are more urgent
  const relegationFear = position > totalTeams - 4 ? 2 : 0;

  for (const need of needs) {
    actions.push({
      teamId: team.id,
      type: 'buy',
      positionNeed: need.group,
      budget: Math.round(team.budget * 0.3),
      urgency: Math.min(5, need.urgency + relegationFear),
    });
  }

  // Teams with large squads look to sell/loan out
  if (team.players.length > 22) {
    actions.push({
      teamId: team.id,
      type: 'loan_out',
      positionNeed: 'ANY',
      budget: 0,
      urgency: 2,
    });
  }

  return actions;
}

// --- #14: Wage Structure Enforcement ---

export interface WageStructureCheck {
  canSign: boolean;
  reason: string;
  wageCap: number;
  proposedWage: number;
  topEarner: Player | null;
}

export function checkWageStructure(team: Team, proposedWage: number): WageStructureCheck {
  const sorted = [...team.players].sort((a, b) => b.wage - a.wage);
  const topEarner = sorted[0] ?? null;
  const avgWage = team.players.reduce((s, p) => s + p.wage, 0) / Math.max(1, team.players.length);

  // Wage cap: top earner * 1.2 or avg * 3, whichever is higher
  const wageCap = Math.max(
    topEarner ? topEarner.wage * 1.2 : avgWage * 3,
    avgWage * 3,
  );

  if (proposedWage > wageCap) {
    return {
      canSign: false,
      reason: `Board rejects: £${(proposedWage / 1000).toFixed(0)}k/wk breaks wage structure (cap: £${(wageCap / 1000).toFixed(0)}k/wk)`,
      wageCap,
      proposedWage,
      topEarner,
    };
  }

  // Warning if new signing would become top earner
  if (topEarner && proposedWage > topEarner.wage) {
    return {
      canSign: true,
      reason: `Warning: would become highest earner (above ${topEarner.name} at £${(topEarner.wage / 1000).toFixed(0)}k/wk)`,
      wageCap,
      proposedWage,
      topEarner,
    };
  }

  return { canSign: true, reason: 'Within wage structure', wageCap, proposedWage, topEarner };
}

// --- #15: Mid-Season Board Review ---

export interface MidSeasonReview {
  round: number;
  position: number;
  targetPosition: number;
  onTrack: boolean;
  confidenceChange: number;
  message: string;
}

export function conductMidSeasonReview(
  position: number,
  totalTeams: number,
  targetPosition: number,
  round: number,
  _totalRounds: number,
  _currentConfidence: number,
): MidSeasonReview {
  const onTrack = position <= targetPosition + 2;
  const gap = position - targetPosition;

  let confidenceChange: number;
  let message: string;

  if (position <= targetPosition) {
    confidenceChange = 5;
    message = `Board pleased: ${position}th place exceeds target of ${targetPosition}th.`;
  } else if (gap <= 2) {
    confidenceChange = 0;
    message = `Board satisfied: ${position}th place, close to target of ${targetPosition}th.`;
  } else if (gap <= 5) {
    confidenceChange = -5;
    message = `Board concerned: ${position}th place, ${gap} spots below target.`;
  } else {
    confidenceChange = -15;
    message = `Board furious: ${position}th place, well below ${targetPosition}th target. Results must improve.`;
  }

  // Relegation zone gets extra penalty
  if (position > totalTeams - 3) {
    confidenceChange -= 10;
    message += ' Relegation zone — unacceptable.';
  }

  return {
    round,
    position,
    targetPosition,
    onTrack,
    confidenceChange,
    message,
  };
}

// --- #17: Player Retirement Announcements ---

export interface RetirementDecision {
  player: Player;
  willRetire: boolean;
  reason: string;
}

export function checkRetirementDecisions(team: Team, seasonEnd: boolean): RetirementDecision[] {
  if (!seasonEnd) return [];

  const decisions: RetirementDecision[] = [];

  for (const player of team.players) {
    if (player.age < 34) continue;

    let retireChance: number;
    let reason: string;

    if (player.age >= 40) {
      retireChance = 0.95;
      reason = 'Age — hanging up the boots at 40+';
    } else if (player.age >= 37) {
      retireChance = 0.7;
      reason = 'Age — body can no longer keep up';
    } else if (player.age >= 35) {
      retireChance = 0.4;
      reason = 'Age — considering retirement';
    } else {
      retireChance = 0.15;
      reason = 'Age — thinking about the future';
    }

    // Low overall accelerates retirement
    if (player.overall < 50) retireChance += 0.2;

    // High loyalty players may stay longer
    const loyalty = player.hidden?.loyalty ?? 10;
    if (loyalty > 15) retireChance -= 0.1;

    const willRetire = Math.random() < retireChance;
    if (willRetire) {
      decisions.push({ player, willRetire: true, reason });
    }
  }

  return decisions;
}

export function getRetirementFarewellText(player: Player): string {
  const apps = player.appearances;
  const goals = player.goals;
  return `${player.name} (${player.age}) announces retirement after ${apps} appearances and ${goals} goals. A true servant of the club.`;
}
