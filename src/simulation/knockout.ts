// Continental knockout stage generation and simulation
// Generates R16, QF, SF, Final brackets from group stage qualifiers
// and simulates two-legged ties with aggregate scoring.

import { Team } from '../types';

export interface KnockoutTie {
  id: string;
  round: 'r16' | 'qf' | 'sf' | 'final';
  homeTeamId: string;
  awayTeamId: string;
  leg1Home: number;
  leg1Away: number;
  leg2Home: number;
  leg2Away: number;
  aggregateHome: number;
  aggregateAway: number;
  winnerId: string | null;
  penalties?: { home: number; away: number };
}

export interface KnockoutBracket {
  r16: KnockoutTie[];
  qf: KnockoutTie[];
  sf: KnockoutTie[];
  final: KnockoutTie | null;
  champion: string | null;
}

function teamStrength(team: Team): number {
  return team.players.slice(0, 11).reduce((s, p) => s + p.overall, 0) / 11;
}

function simulateLeg(homeStr: number, awayStr: number): { home: number; away: number } {
  const homeXG = 1.3 * (homeStr / (homeStr + awayStr)) * 2.2;
  const awayXG = 1.0 * (awayStr / (homeStr + awayStr)) * 2.2;
  const poisson = (lambda: number) => {
    const L = Math.exp(-lambda);
    let k = 0, p = 1;
    do { k++; p *= Math.random(); } while (p > L);
    return k - 1;
  };
  return { home: poisson(homeXG), away: poisson(awayXG) };
}

function simulateTie(tie: KnockoutTie, teams: Team[]): KnockoutTie {
  const homeTeam = teams.find((t) => t.id === tie.homeTeamId);
  const awayTeam = teams.find((t) => t.id === tie.awayTeamId);
  if (!homeTeam || !awayTeam) return tie;

  const homeStr = teamStrength(homeTeam);
  const awayStr = teamStrength(awayTeam);

  // Leg 1: away team hosts
  const leg1 = simulateLeg(awayStr, homeStr);
  // Leg 2: home team hosts
  const leg2 = simulateLeg(homeStr, awayStr);

  const aggHome = leg1.away + leg2.home; // home team's goals across both legs
  const aggAway = leg1.home + leg2.away; // away team's goals across both legs

  let winnerId: string | null = null;
  let penalties: { home: number; away: number } | undefined;

  if (aggHome > aggAway) {
    winnerId = tie.homeTeamId;
  } else if (aggAway > aggHome) {
    winnerId = tie.awayTeamId;
  } else {
    // Aggregate tied — penalties
    const penHome = 3 + Math.floor(Math.random() * 3);
    const penAway = 3 + Math.floor(Math.random() * 3);
    penalties = { home: penHome, away: penAway };
    winnerId = penHome > penAway ? tie.homeTeamId : tie.awayTeamId;
  }

  return {
    ...tie,
    leg1Home: leg1.home,
    leg1Away: leg1.away,
    leg2Home: leg2.home,
    leg2Away: leg2.away,
    aggregateHome: aggHome,
    aggregateAway: aggAway,
    winnerId,
    penalties,
  };
}

// Generate R16 bracket from 16 qualifiers (group winners vs runners-up)
export function generateKnockoutBracket(qualifiers: string[]): KnockoutBracket {
  // Pair group winners (1st, 3rd, 5th, 7th...) vs runners-up (2nd, 4th, 6th, 8th...)
  const winners = qualifiers.filter((_, i) => i % 2 === 0);
  const runners = qualifiers.filter((_, i) => i % 2 === 1);

  const r16: KnockoutTie[] = [];
  for (let i = 0; i < Math.min(winners.length, runners.length); i++) {
    r16.push({
      id: `r16_${i}`,
      round: 'r16',
      homeTeamId: winners[i],
      awayTeamId: runners[i],
      leg1Home: 0, leg1Away: 0, leg2Home: 0, leg2Away: 0,
      aggregateHome: 0, aggregateAway: 0,
      winnerId: null,
    });
  }

  return { r16, qf: [], sf: [], final: null, champion: null };
}

// Simulate all ties in a round and generate the next round
export function simulateKnockoutRound(bracket: KnockoutBracket, teams: Team[]): KnockoutBracket {
  const next = { ...bracket };

  if (next.r16.some((t) => !t.winnerId)) {
    next.r16 = next.r16.map((t) => t.winnerId ? t : simulateTie(t, teams));
    // Generate QF from R16 winners
    const r16Winners = next.r16.filter((t) => t.winnerId).map((t) => t.winnerId!);
    next.qf = [];
    for (let i = 0; i < r16Winners.length; i += 2) {
      if (i + 1 < r16Winners.length) {
        next.qf.push({
          id: `qf_${i / 2}`,
          round: 'qf',
          homeTeamId: r16Winners[i],
          awayTeamId: r16Winners[i + 1],
          leg1Home: 0, leg1Away: 0, leg2Home: 0, leg2Away: 0,
          aggregateHome: 0, aggregateAway: 0,
          winnerId: null,
        });
      }
    }
    return next;
  }

  if (next.qf.some((t) => !t.winnerId)) {
    next.qf = next.qf.map((t) => t.winnerId ? t : simulateTie(t, teams));
    const qfWinners = next.qf.filter((t) => t.winnerId).map((t) => t.winnerId!);
    next.sf = [];
    for (let i = 0; i < qfWinners.length; i += 2) {
      if (i + 1 < qfWinners.length) {
        next.sf.push({
          id: `sf_${i / 2}`,
          round: 'sf',
          homeTeamId: qfWinners[i],
          awayTeamId: qfWinners[i + 1],
          leg1Home: 0, leg1Away: 0, leg2Home: 0, leg2Away: 0,
          aggregateHome: 0, aggregateAway: 0,
          winnerId: null,
        });
      }
    }
    return next;
  }

  if (next.sf.some((t) => !t.winnerId)) {
    next.sf = next.sf.map((t) => t.winnerId ? t : simulateTie(t, teams));
    const sfWinners = next.sf.filter((t) => t.winnerId).map((t) => t.winnerId!);
    if (sfWinners.length >= 2) {
      next.final = {
        id: 'final',
        round: 'final',
        homeTeamId: sfWinners[0],
        awayTeamId: sfWinners[1],
        leg1Home: 0, leg1Away: 0, leg2Home: 0, leg2Away: 0,
        aggregateHome: 0, aggregateAway: 0,
        winnerId: null,
      };
    }
    return next;
  }

  if (next.final && !next.final.winnerId) {
    // Final is a single match (not two-legged)
    const homeTeam = teams.find((t) => t.id === next.final!.homeTeamId);
    const awayTeam = teams.find((t) => t.id === next.final!.awayTeamId);
    if (homeTeam && awayTeam) {
      const homeStr = teamStrength(homeTeam);
      const awayStr = teamStrength(awayTeam);
      const result = simulateLeg(homeStr, awayStr);
      let winnerId: string;
      let penalties: { home: number; away: number } | undefined;

      if (result.home > result.away) winnerId = next.final.homeTeamId;
      else if (result.away > result.home) winnerId = next.final.awayTeamId;
      else {
        const penHome = 3 + Math.floor(Math.random() * 3);
        const penAway = 3 + Math.floor(Math.random() * 3);
        penalties = { home: penHome, away: penAway };
        winnerId = penHome > penAway ? next.final.homeTeamId : next.final.awayTeamId;
      }

      next.final = {
        ...next.final,
        leg1Home: result.home,
        leg1Away: result.away,
        leg2Home: 0,
        leg2Away: 0,
        aggregateHome: result.home,
        aggregateAway: result.away,
        winnerId,
        penalties,
      };
      next.champion = winnerId;
    }
    return next;
  }

  return next;
}

// Check if the knockout stage is complete
export function isKnockoutComplete(bracket: KnockoutBracket): boolean {
  return bracket.champion !== null;
}
