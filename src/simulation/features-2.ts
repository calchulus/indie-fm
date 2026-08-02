// Press conferences (#43), scouting knowledge (#44), international call-ups (#46),
// TV revenue (#47), club legends (#48), fan satisfaction (#49), modding API (#50)

import { Team, Player } from '../types';

// --- #43: Press Conference System ---

export interface PressQuestion {
  id: string;
  question: string;
  context: 'pre_match' | 'post_match' | 'transfer' | 'board';
  answers: Array<{ text: string; moraleEffect: number; boardEffect: number; mediaEffect: number }>;
}

export function generatePressQuestions(context: PressQuestion['context'], matchResult?: string): PressQuestion[] {
  const questions: PressQuestion[] = [];

  if (context === 'pre_match') {
    questions.push({
      id: 'pre_expectations',
      question: 'What are your expectations for tomorrow\'s match?',
      context,
      answers: [
        { text: 'We\'re going for the win.', moraleEffect: 1, boardEffect: 0, mediaEffect: 1 },
        { text: 'It\'ll be a tough game, but we\'re prepared.', moraleEffect: 0, boardEffect: 1, mediaEffect: 0 },
        { text: 'We just need to stay focused.', moraleEffect: 0, boardEffect: 0, mediaEffect: -1 },
      ],
    });
    questions.push({
      id: 'pre_squad',
      question: 'Any injury concerns for the squad?',
      context,
      answers: [
        { text: 'Everyone is fit and ready.', moraleEffect: 1, boardEffect: 0, mediaEffect: 0 },
        { text: 'We have a few doubts, but the squad is deep enough.', moraleEffect: 0, boardEffect: 1, mediaEffect: 0 },
        { text: 'No comment on team selection.', moraleEffect: -1, boardEffect: 0, mediaEffect: -1 },
      ],
    });
  } else if (context === 'post_match') {
    const won = matchResult === 'win';
    questions.push({
      id: 'post_performance',
      question: won ? 'Great result today. Your thoughts?' : 'Disappointing result. What went wrong?',
      context,
      answers: [
        { text: won ? 'The lads were fantastic.' : 'We\'ll bounce back.', moraleEffect: 2, boardEffect: 1, mediaEffect: 1 },
        { text: won ? 'Three points is all that matters.' : 'We need to do better.', moraleEffect: 0, boardEffect: 0, mediaEffect: 0 },
        { text: 'I\'d rather not discuss it.', moraleEffect: -1, boardEffect: -1, mediaEffect: -2 },
      ],
    });
  } else if (context === 'transfer') {
    questions.push({
      id: 'transfer_rumour',
      question: 'Can you comment on the transfer rumours linking your player?',
      context,
      answers: [
        { text: 'He\'s happy here and committed to the club.', moraleEffect: 1, boardEffect: 1, mediaEffect: 0 },
        { text: 'I don\'t comment on speculation.', moraleEffect: 0, boardEffect: 0, mediaEffect: -1 },
        { text: 'If the right offer comes in, we\'ll consider it.', moraleEffect: -2, boardEffect: 0, mediaEffect: 2 },
      ],
    });
  }

  return questions;
}

// --- #44: Scouting Knowledge Levels ---

export interface ScoutingKnowledge {
  playerId: string;
  level: number; // 0-3 (0 = unscouted, 3 = full report)
  revealedAttributes: string[];
  confidence: number; // 0-1, how accurate the assessment is
}

const ATTR_GROUPS = [
  ['pace', 'acceleration', 'stamina'],           // Level 1: physical
  ['passing', 'dribbling', 'crossing', 'technique'], // Level 2: technical
  ['vision', 'decisions', 'composure', 'flair'],  // Level 3: mental
];

export function getScoutingKnowledge(playerId: string, scoutRating: number, reportsFiled: number): ScoutingKnowledge {
  const level = Math.min(3, reportsFiled);
  const revealedAttributes: string[] = [];

  for (let i = 0; i < level && i < ATTR_GROUPS.length; i++) {
    revealedAttributes.push(...ATTR_GROUPS[i]);
  }

  // Confidence scales with scout quality and reports filed
  const confidence = Math.min(1, (scoutRating / 20) * 0.5 + reportsFiled * 0.2);

  return { playerId, level, revealedAttributes, confidence };
}

export function getAttributeEstimate(actual: number, confidence: number): number {
  // Lower confidence = more noise in the estimate
  const noise = (1 - confidence) * 6;
  return Math.round(actual + (Math.random() - 0.5) * noise);
}

// --- #46: International Call-Up Simulation ---

export interface InternationalCallUp {
  playerId: string;
  playerName: string;
  country: string;
  roundsMissed: number;
  fatigueOnReturn: number; // extra fatigue when they come back
  injuryRisk: number; // chance of returning injured
}

export function simulateInternationalCallUps(team: Team, isBreak: boolean): InternationalCallUp[] {
  if (!isBreak) return [];

  const callUps: InternationalCallUp[] = [];
  for (const player of team.players.slice(0, 11)) {
    // High-overall players get called up
    if (player.overall >= 70 && Math.random() < 0.4) {
      callUps.push({
        playerId: player.id,
        playerName: player.name,
        country: player.nationality,
        roundsMissed: 1 + (Math.random() < 0.3 ? 1 : 0),
        fatigueOnReturn: 15 + Math.floor(Math.random() * 15),
        injuryRisk: 0.08,
      });
    }
  }

  return callUps;
}

// --- #47: TV Revenue Distribution ---

export interface TVRevenue {
  teamId: string;
  position: number;
  meritPayment: number;
  facilityFee: number;
  total: number;
}

export function computeTVRevenue(teams: Team[], totalPool: number): TVRevenue[] {
  const n = teams.length;
  // Merit: 1st gets n shares, 2nd gets n-1, etc.
  const totalShares = (n * (n + 1)) / 2;
  const meritPerShare = totalPool * 0.6 / totalShares;
  const facilityPerTeam = totalPool * 0.4 / n;

  return teams.map((team, idx) => {
    const position = idx + 1;
    const shares = n - idx;
    const meritPayment = Math.round(meritPerShare * shares);
    const facilityFee = Math.round(facilityPerTeam);
    return {
      teamId: team.id,
      position,
      meritPayment,
      facilityFee,
      total: meritPayment + facilityFee,
    };
  });
}

// --- #48: Club Legends System ---

export interface ClubLegend {
  playerId: string;
  playerName: string;
  appearances: number;
  goals: number;
  status: 'active' | 'retired' | 'transferred';
  legacy: string;
}

export function checkLegendStatus(player: Player): ClubLegend | null {
  const isLegend = player.appearances >= 200 || player.goals >= 100;
  if (!isLegend) return null;

  let legacy: string;
  if (player.goals >= 100 && player.appearances >= 200) {
    legacy = `${player.goals} goals in ${player.appearances} appearances. A true icon.`;
  } else if (player.goals >= 100) {
    legacy = `${player.goals} goals. One of the greatest finishers to wear the shirt.`;
  } else {
    legacy = `${player.appearances} appearances. A model of consistency and loyalty.`;
  }

  return {
    playerId: player.id,
    playerName: player.name,
    appearances: player.appearances,
    goals: player.goals,
    status: 'active',
    legacy,
  };
}

// --- #49: Fan Satisfaction Meter ---

export interface FanSatisfaction {
  overall: number; // 0-100
  results: number;
  transfers: number;
  playingStyle: number;
  youthDevelopment: number;
  label: string;
}

export function computeFanSatisfaction(
  recentResults: Array<'W' | 'D' | 'L'>,
  position: number,
  totalTeams: number,
  netSpend: number,
  avgPossession: number,
  youthApps: number,
): FanSatisfaction {
  // Results: last 5 form
  const points = recentResults.reduce((s, r) => s + (r === 'W' ? 3 : r === 'D' ? 1 : 0), 0);
  const maxPoints = recentResults.length * 3;
  const results = Math.round((points / Math.max(1, maxPoints)) * 100);

  // Position relative to expectations
  const posScore = Math.round((1 - (position - 1) / (totalTeams - 1)) * 100);

  // Transfers: positive net spend = happy fans
  const transfers = netSpend > 0 ? Math.min(100, 50 + netSpend / 1_000_000) : Math.max(0, 50 + netSpend / 2_000_000);

  // Playing style: possession-based football is attractive
  const playingStyle = Math.round(avgPossession * 1.5);

  // Youth: fans love seeing academy grads
  const youthDevelopment = Math.min(100, youthApps * 10);

  const overall = Math.round(results * 0.35 + posScore * 0.25 + transfers * 0.15 + playingStyle * 0.15 + youthDevelopment * 0.10);

  const label = overall >= 80 ? 'Ecstatic' : overall >= 60 ? 'Happy' : overall >= 40 ? 'Neutral' : overall >= 20 ? 'Unhappy' : 'Furious';

  return { overall, results, transfers: Math.round(transfers), playingStyle, youthDevelopment, label };
}

// --- #50: Modding Plugin Interface ---

export interface ModPlugin {
  id: string;
  name: string;
  version: string;
  author: string;
  hooks: Partial<ModHooks>;
}

export interface ModHooks {
  onLeagueGenerate: (config: { teamCount: number; quality: number }) => Team[] | null;
  onPlayerGenerate: (position: string, quality: number) => Player | null;
  onMatchSimulate: (homeId: string, awayId: string, minute: number) => void;
  onSeasonEnd: (standings: Array<{ teamId: string; position: number }>) => void;
  registerPanel: () => { id: string; label: string; render: () => unknown };
}

export class ModRegistry {
  private plugins: Map<string, ModPlugin> = new Map();

  register(plugin: ModPlugin): void {
    this.plugins.set(plugin.id, plugin);
  }

  unregister(id: string): void {
    this.plugins.delete(id);
  }

  getPlugins(): ModPlugin[] {
    return [...this.plugins.values()];
  }

  invokeHook<K extends keyof ModHooks>(hook: K, ...args: unknown[]): unknown[] {
    const results: unknown[] = [];
    for (const plugin of this.plugins.values()) {
      const fn = plugin.hooks[hook];
      if (fn) {
        try {
          results.push((fn as (...a: unknown[]) => unknown)(...args));
        } catch (e) {
          console.error(`Mod "${plugin.name}" error in ${hook}:`, e);
        }
      }
    }
    return results;
  }
}

export const modRegistry = new ModRegistry();
