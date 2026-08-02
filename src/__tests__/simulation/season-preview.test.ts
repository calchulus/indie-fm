import { describe, it, expect } from 'vitest';
import { generateLeague } from '../../data/generators';
import { Team } from '../../types';

// Test the prediction logic used in SeasonPreview
function computePredictions(teams: Team[]) {
  const strengths = teams.map((t) => {
    const starters = t.players.slice(0, 11);
    const avg = starters.reduce((s, p) => s + p.overall, 0) / starters.length;
    return { team: t, strength: Math.round(avg * 10) / 10 };
  }).sort((a, b) => b.strength - a.strength);

  const totalStrength = strengths.reduce((s, t) => s + t.strength, 0);

  return strengths.map((s, i) => {
    const share = s.strength / totalStrength;
    const titleOdds = Math.min(85, Math.round(share * teams.length * 100 / 3));
    const top4Chance = Math.min(95, Math.round((1 - i / teams.length) * 80 + share * 200));
    const relegationChance = Math.max(0, Math.round((i / teams.length - 0.6) * 200));
    return {
      teamId: s.team.id,
      name: s.team.name,
      strength: s.strength,
      predictedPosition: i + 1,
      titleOdds: Math.max(0, titleOdds),
      top4Chance: Math.max(0, top4Chance),
      relegationChance: Math.max(0, relegationChance),
    };
  });
}

describe('Season Preview Predictions', () => {
  const league = generateLeague(20);

  it('produces predictions for all teams', () => {
    const predictions = computePredictions(league.teams);
    expect(predictions).toHaveLength(20);
  });

  it('assigns unique predicted positions', () => {
    const predictions = computePredictions(league.teams);
    const positions = predictions.map((p) => p.predictedPosition);
    const unique = new Set(positions);
    expect(unique.size).toBe(20);
  });

  it('strongest team is predicted first', () => {
    const predictions = computePredictions(league.teams);
    const first = predictions.find((p) => p.predictedPosition === 1);
    const maxStrength = Math.max(...predictions.map((p) => p.strength));
    expect(first?.strength).toBe(maxStrength);
  });

  it('title odds are highest for top teams', () => {
    const predictions = computePredictions(league.teams);
    const sorted = [...predictions].sort((a, b) => a.predictedPosition - b.predictedPosition);
    expect(sorted[0].titleOdds).toBeGreaterThanOrEqual(sorted[10].titleOdds);
  });

  it('relegation chance is highest for bottom teams', () => {
    const predictions = computePredictions(league.teams);
    const sorted = [...predictions].sort((a, b) => b.predictedPosition - a.predictedPosition);
    expect(sorted[0].relegationChance).toBeGreaterThanOrEqual(sorted[10].relegationChance);
  });

  it('all percentages are within valid range', () => {
    const predictions = computePredictions(league.teams);
    for (const p of predictions) {
      expect(p.titleOdds).toBeGreaterThanOrEqual(0);
      expect(p.titleOdds).toBeLessThanOrEqual(100);
      expect(p.top4Chance).toBeGreaterThanOrEqual(0);
      expect(p.top4Chance).toBeLessThanOrEqual(100);
      expect(p.relegationChance).toBeGreaterThanOrEqual(0);
      expect(p.relegationChance).toBeLessThanOrEqual(100);
    }
  });
});
