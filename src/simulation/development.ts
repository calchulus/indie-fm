import { Player, League } from '../types';

export interface InjuryRecord {
  playerId: string;
  type: string;
  weeksOut: number;
  startedRound: number;
}

export interface SuspensionRecord {
  playerId: string;
  matchesBanned: number;
  yellowCards: number;
}

export interface PlayerDevelopmentState {
  injuries: InjuryRecord[];
  suspensions: SuspensionRecord[];
}

const INJURY_TYPES = [
  { type: 'Hamstring strain', minWeeks: 2, maxWeeks: 6 },
  { type: 'Ankle sprain', minWeeks: 1, maxWeeks: 4 },
  { type: 'Knee ligament', minWeeks: 4, maxWeeks: 12 },
  { type: 'Groin pull', minWeeks: 1, maxWeeks: 3 },
  { type: 'Calf tear', minWeeks: 2, maxWeeks: 5 },
  { type: 'Concussion', minWeeks: 1, maxWeeks: 2 },
  { type: 'Back spasm', minWeeks: 1, maxWeeks: 3 },
  { type: 'Thigh bruise', minWeeks: 1, maxWeeks: 2 },
];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function processAging(players: Player[]): Player[] {
  return players.map((p) => {
    const updated = { ...p, attributes: { ...p.attributes } };
    updated.age += 1;

    if (updated.age <= 24) {
      const growth = rand(1, 3);
      updated.attributes.pace = Math.min(20, updated.attributes.pace + growth);
      updated.attributes.finishing = Math.min(20, updated.attributes.finishing + rand(0, 2));
      updated.attributes.passing = Math.min(20, updated.attributes.passing + rand(1, 3));
      updated.attributes.strength = Math.min(20, updated.attributes.strength + rand(0, 2));
    } else if (updated.age <= 29) {
      updated.attributes.passing = Math.min(20, updated.attributes.passing + rand(0, 1));
      updated.attributes.vision = Math.min(20, updated.attributes.vision + rand(0, 1));
      updated.attributes.composure = Math.min(20, updated.attributes.composure + rand(0, 1));
    } else {
      const decline = rand(1, 3);
      updated.attributes.pace = Math.max(1, updated.attributes.pace - decline);
      updated.attributes.strength = Math.max(1, updated.attributes.strength - rand(1, 2));
      updated.attributes.stamina = Math.max(1, updated.attributes.stamina - rand(1, 2));
      updated.attributes.acceleration = Math.max(1, updated.attributes.acceleration - rand(1, 2));
    }

    updated.overall = recomputeOverall(updated);
    updated.value = Math.round(updated.overall * updated.overall * rand(800, 1500) * (updated.age > 30 ? 0.5 : 1));
    return updated;
  });
}

function recomputeOverall(p: Player): number {
  const a = p.attributes;
  const vals = [a.pace, a.finishing, a.passing, a.dribbling, a.marking, a.tackling, a.strength, a.stamina, a.vision, a.composure];
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length);
}

export function processForm(players: Player[]): Player[] {
  return players.map((p) => {
    const swing = rand(-2, 2);
    const newForm = Math.max(1, Math.min(10, p.form + swing));
    return { ...p, form: newForm };
  });
}

export function processFitness(players: Player[], playedThisRound: Set<string>): Player[] {
  return players.map((p) => {
    if (playedThisRound.has(p.id)) {
      const drain = rand(8, 18);
      return { ...p, fitness: Math.max(40, p.fitness - drain) };
    } else {
      const recovery = rand(10, 20);
      return { ...p, fitness: Math.min(100, p.fitness + recovery) };
    }
  });
}

export function rollInjuries(players: Player[], currentRound: number): { players: Player[]; newInjuries: InjuryRecord[] } {
  const newInjuries: InjuryRecord[] = [];
  const updated = players.map((p) => {
    const injuryChance = p.fitness < 60 ? 0.08 : p.fitness < 80 ? 0.03 : 0.01;
    if (Math.random() < injuryChance) {
      const injuryType = INJURY_TYPES[rand(0, INJURY_TYPES.length - 1)];
      const weeks = rand(injuryType.minWeeks, injuryType.maxWeeks);
      newInjuries.push({
        playerId: p.id,
        type: injuryType.type,
        weeksOut: weeks,
        startedRound: currentRound,
      });
      return { ...p, fitness: Math.max(20, p.fitness - 30) };
    }
    return p;
  });
  return { players: updated, newInjuries };
}

export function updateInjuries(injuries: InjuryRecord[], currentRound: number): InjuryRecord[] {
  return injuries.filter((inj) => {
    const elapsed = currentRound - inj.startedRound;
    return elapsed < inj.weeksOut;
  });
}

export function isInjured(playerId: string, injuries: InjuryRecord[]): boolean {
  return injuries.some((inj) => inj.playerId === playerId);
}

export function isSuspended(playerId: string, suspensions: SuspensionRecord[]): boolean {
  return suspensions.some((s) => s.playerId === playerId && s.matchesBanned > 0);
}

export function processSuspensions(suspensions: SuspensionRecord[]): SuspensionRecord[] {
  return suspensions
    .map((s) => ({ ...s, matchesBanned: s.matchesBanned - 1 }))
    .filter((s) => s.matchesBanned > 0);
}

export function addYellowCard(suspensions: SuspensionRecord[], playerId: string): SuspensionRecord[] {
  const existing = suspensions.find((s) => s.playerId === playerId);
  if (existing) {
    const updated = { ...existing, yellowCards: existing.yellowCards + 1 };
    if (updated.yellowCards >= 5) {
      updated.matchesBanned = 1;
      updated.yellowCards = 0;
    }
    return suspensions.map((s) => s.playerId === playerId ? updated : s);
  }
  return [...suspensions, { playerId, matchesBanned: 0, yellowCards: 1 }];
}

export function addRedCard(suspensions: SuspensionRecord[], playerId: string): SuspensionRecord[] {
  const existing = suspensions.find((s) => s.playerId === playerId);
  if (existing) {
    return suspensions.map((s) => s.playerId === playerId ? { ...s, matchesBanned: 3 } : s);
  }
  return [...suspensions, { playerId, matchesBanned: 3, yellowCards: 0 }];
}

export function processMorale(players: Player[], won: boolean, playedIds: Set<string>): Player[] {
  return players.map((p) => {
    let moraleShift = 0;
    if (won) moraleShift += 1;
    else moraleShift -= 1;
    if (playedIds.has(p.id)) moraleShift += 0;
    else moraleShift -= 1;
    const newMorale = Math.max(1, Math.min(10, p.morale + moraleShift));
    return { ...p, morale: newMorale };
  });
}

export function endOfSeasonDevelopment(league: League): League {
  const updatedTeams = league.teams.map((team) => ({
    ...team,
    players: processAging(processForm(team.players)),
  }));
  return { ...league, teams: updatedTeams };
}
