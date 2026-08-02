import { Team } from '../types';
import { getMentalityModifier } from './tactics';

export interface FastMatchResult {
  homeGoals: number;
  awayGoals: number;
  homeShots: number;
  awayShots: number;
  homePossession: number;
}

function teamAttackStrength(team: Team): number {
  const starters = team.players.slice(0, 11);
  const attackers = starters.filter((p) => ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
  const mids = starters.filter((p) => ['CM', 'CDM'].includes(p.position));

  const atkAvg = attackers.length > 0
    ? attackers.reduce((s, p) => s + (
        p.attributes.finishing * 3 + p.attributes.longShots * 1.5 + p.attributes.offTheBall * 2 +
        p.attributes.composure * 2 + p.attributes.pace * 1.5 + p.attributes.acceleration * 1.5 +
        p.attributes.dribbling * 1.5 + p.attributes.technique * 1 + p.attributes.flair * 0.5 +
        p.attributes.agility * 1 + p.attributes.crossing * 0.5 + p.attributes.vision * 1
      ) / 17, 0) / attackers.length
    : 8;

  const midAvg = mids.length > 0
    ? mids.reduce((s, p) => s + (
        p.attributes.passing * 3 + p.attributes.vision * 2.5 + p.attributes.technique * 2 +
        p.attributes.firstTouch * 1.5 + p.attributes.decisions * 2 + p.attributes.composure * 1.5 +
        p.attributes.stamina * 1 + p.attributes.workRate * 1 + p.attributes.longShots * 0.5
      ) / 15, 0) / mids.length
    : 8;

  return atkAvg * 0.6 + midAvg * 0.4;
}

function teamDefStrength(team: Team): number {
  const starters = team.players.slice(0, 11);
  const defenders = starters.filter((p) => ['CB', 'LB', 'RB'].includes(p.position));
  const gk = starters.find((p) => p.position === 'GK');
  const dm = starters.filter((p) => p.position === 'CDM');

  const defAvg = defenders.length > 0
    ? defenders.reduce((s, p) => s + (
        p.attributes.marking * 3 + p.attributes.tackling * 3 + p.attributes.positioning * 2.5 +
        p.attributes.concentration * 2 + p.attributes.strength * 1.5 + p.attributes.heading * 1.5 +
        p.attributes.aggression * 1 + p.attributes.bravery * 1 + p.attributes.pace * 1 +
        p.attributes.acceleration * 0.5 + p.attributes.anticipation * 1.5 + p.attributes.jumpingReach * 0.5
      ) / 19, 0) / defenders.length
    : 8;

  const gkStrength = gk ? (
    gk.attributes.reflexes * 3 + gk.attributes.handling * 2.5 + gk.attributes.oneOnOnes * 2 +
    gk.attributes.aerialReach * 1.5 + gk.attributes.commandOfArea * 1.5 + gk.attributes.positioning * 2 +
    gk.attributes.concentration * 1.5 + gk.attributes.communication * 0.5 + gk.attributes.rushingOut * 1
  ) / 15.5 : 8;

  const dmAvg = dm.length > 0
    ? dm.reduce((s, p) => s + (
        p.attributes.tackling * 2.5 + p.attributes.positioning * 2.5 + p.attributes.marking * 2 +
        p.attributes.strength * 1.5 + p.attributes.aggression * 1 + p.attributes.anticipation * 1.5 +
        p.attributes.stamina * 1 + p.attributes.concentration * 1
      ) / 13, 0) / dm.length
    : 8;

  return defAvg * 0.5 + gkStrength * 0.3 + dmAvg * 0.2;
}

function poissonSample(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/**
 * Fast AI-vs-AI match resolution.
 * Instead of 5,400 ticks (90 min × 60 ticks), uses a statistical model
 * to produce a result in O(1). ~60× faster than tick-based simulation.
 */
export function simulateFastMatch(home: Team, away: Team): FastMatchResult {
  const homeAtk = teamAttackStrength(home) * getMentalityModifier(home.tactics).attack;
  const awayAtk = teamAttackStrength(away) * getMentalityModifier(away.tactics).attack;
  const homeDef = teamDefStrength(home) * getMentalityModifier(home.tactics).defend;
  const awayDef = teamDefStrength(away) * getMentalityModifier(away.tactics).defend;

  // Expected goals based on attack vs defense ratio
  const homeXG = 1.4 * (homeAtk / (homeAtk + awayDef)) * 2.2;
  const awayXG = 1.1 * (awayAtk / (awayAtk + homeDef)) * 2.2;

  const homeGoals = poissonSample(homeXG);
  const awayGoals = poissonSample(awayXG);

  // Shots correlate with attack strength
  const homeShots = Math.round(6 + homeAtk * 0.12 + Math.random() * 5);
  const awayShots = Math.round(5 + awayAtk * 0.12 + Math.random() * 5);

  // Possession based on relative attack
  const homePossession = Math.round((homeAtk / (homeAtk + awayAtk)) * 100);

  return { homeGoals, awayGoals, homeShots, awayShots, homePossession };
}

/**
 * Simulate a full round of AI-vs-AI matches using the fast resolver.
 * Only the user's match (if any) uses the full tick-based engine.
 */
export function simulateRoundFast(
  teams: Team[],
  fixtures: Array<{ id: string; round: number; homeTeamId: string; awayTeamId: string; played: boolean; homeGoals?: number; awayGoals?: number }>,
  round: number,
  userTeamId: string,
): {
  fixtures: typeof fixtures;
  results: Array<{ fixtureId: string; homeTeamId: string; awayTeamId: string; homeGoals: number; awayGoals: number }>;
} {
  const roundFixtures = fixtures.filter((f) => f.round === round && !f.played);
  const results: Array<{ fixtureId: string; homeTeamId: string; awayTeamId: string; homeGoals: number; awayGoals: number }> = [];
  const updatedFixtures = [...fixtures];

  for (const fixture of roundFixtures) {
    const home = teams.find((t) => t.id === fixture.homeTeamId);
    const away = teams.find((t) => t.id === fixture.awayTeamId);
    if (!home || !away) continue;

    // Skip user's match — they play it interactively
    if (fixture.homeTeamId === userTeamId || fixture.awayTeamId === userTeamId) continue;

    const result = simulateFastMatch(home, away);
    results.push({
      fixtureId: fixture.id,
      homeTeamId: fixture.homeTeamId,
      awayTeamId: fixture.awayTeamId,
      homeGoals: result.homeGoals,
      awayGoals: result.awayGoals,
    });

    const fIdx = updatedFixtures.findIndex((f) => f.id === fixture.id);
    if (fIdx >= 0) {
      updatedFixtures[fIdx] = {
        ...updatedFixtures[fIdx],
        played: true,
        homeGoals: result.homeGoals,
        awayGoals: result.awayGoals,
      };
    }
  }

  return { fixtures: updatedFixtures, results };
}
