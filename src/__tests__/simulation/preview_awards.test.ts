import { describe, it, expect } from 'vitest';
import { generateMatchPreview, getWeatherDescription } from '../../simulation/preview';
import { computeSeasonAwards } from '../../simulation/awards';
import { generateTeam, generateLeague } from '../../data/generators';
import { simulateSeason } from '../../simulation/season';

describe('Match Preview', () => {
  const home = generateTeam(0, 65);
  const away = generateTeam(1, 60);

  it('generates a complete preview', () => {
    const preview = generateMatchPreview(home, away);
    expect(preview.weather).toBeDefined();
    expect(preview.referee).toBeDefined();
    expect(preview.homeTeamNews).toBeDefined();
    expect(preview.awayTeamNews).toBeDefined();
    expect(preview.headToHead).toBeDefined();
  });

  it('generates valid weather', () => {
    const preview = generateMatchPreview(home, away);
    expect(['clear', 'cloudy', 'rain', 'heavy_rain', 'snow', 'wind']).toContain(preview.weather.condition);
    expect(preview.weather.temperature).toBeGreaterThanOrEqual(0);
    expect(preview.weather.temperature).toBeLessThanOrEqual(40);
  });

  it('generates a referee with valid attributes', () => {
    const preview = generateMatchPreview(home, away);
    expect(preview.referee.name.length).toBeGreaterThan(2);
    expect(preview.referee.strictness).toBeGreaterThanOrEqual(1);
    expect(preview.referee.strictness).toBeLessThanOrEqual(10);
  });

  it('generates head-to-head record', () => {
    const preview = generateMatchPreview(home, away);
    expect(preview.headToHead.meetings).toBeGreaterThan(0);
    expect(preview.headToHead.homeWins + preview.headToHead.draws + preview.headToHead.awayWins).toBeLessThanOrEqual(preview.headToHead.meetings);
  });

  it('produces weather description strings', () => {
    const preview = generateMatchPreview(home, away);
    const desc = getWeatherDescription(preview.weather);
    expect(desc.length).toBeGreaterThan(5);
    expect(desc).toContain('°C');
  });
});

describe('Season Awards', () => {
  it('computes awards after a full season', () => {
    const league = generateLeague(20);
    const { league: final } = simulateSeason(league);
    // Manually set appearances so awards can be computed
    const withStats = {
      ...final,
      teams: final.teams.map((t) => ({
        ...t,
        players: t.players.map((p, i) => ({
          ...p,
          appearances: i < 11 ? 30 : 5,
          goals: i === 9 ? 15 : i === 10 ? 10 : Math.floor(Math.random() * 5),
          assists: i === 7 ? 12 : Math.floor(Math.random() * 4),
        })),
      })),
    };
    const awards = computeSeasonAwards(withStats);

    expect(awards.teamOfTheSeason.length).toBeGreaterThan(0);
    expect(awards.teamOfTheSeason.length).toBeLessThanOrEqual(10);
    expect(awards.goldenBoot).not.toBeNull();
    expect(awards.playerOfTheSeason).not.toBeNull();
  }, 30000);

  it('returns null golden boot if no goals scored', () => {
    const league = generateLeague(20);
    // Don't simulate — no goals
    const awards = computeSeasonAwards(league);
    expect(awards.goldenBoot).toBeNull();
  });

  it('team of the season has valid positions', () => {
    const league = generateLeague(20);
    const { league: final } = simulateSeason(league);
    const awards = computeSeasonAwards(final);
    const validPositions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
    for (const p of awards.teamOfTheSeason) {
      expect(validPositions).toContain(p.position);
    }
  }, 30000);
});
