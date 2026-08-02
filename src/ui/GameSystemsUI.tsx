// UI: Momentum sparkline (#19), quick-match card (#24), squad depth chart (#25), achievements (#28)
import { MatchState, Team } from '../types';

// --- #19: Momentum Sparkline Data ---
export function computeMomentumSparkline(events: MatchState['events'], homeTeamId: string, buckets: number = 18): number[] {
  // Divide 90 minutes into buckets, compute home momentum per bucket
  const ticksPerBucket = Math.ceil((90 * 60) / buckets);
  const data: number[] = [];

  for (let b = 0; b < buckets; b++) {
    const startTick = b * ticksPerBucket;
    const endTick = (b + 1) * ticksPerBucket;
    const bucketEvents = events.filter((e) => e.tick >= startTick && e.tick < endTick);

    let homeWeight = 0;
    let awayWeight = 0;
    for (const evt of bucketEvents) {
      const weight = evt.type === 'goal' ? 5 : evt.type === 'shot' ? 2 : evt.type === 'corner' ? 1.5 : 0.5;
      if (evt.teamId === homeTeamId) homeWeight += weight;
      else awayWeight += weight;
    }

    const total = homeWeight + awayWeight;
    data.push(total === 0 ? 50 : Math.round((homeWeight / total) * 100));
  }

  return data;
}

export function MomentumSparkline({ data, width = 200, height = 40 }: { data: number[]; width?: number; height?: number }) {
  if (data.length === 0) return null;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (v / 100) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-label="Momentum chart" style={{ display: 'block' }}>
      <line x1={0} y1={height / 2} x2={width} y2={height / 2} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />
      <polyline points={points} fill="none" stroke="#4ade80" strokeWidth={1.5} />
    </svg>
  );
}

// --- #24: Quick-Match Summary Card ---
export interface QuickMatchSummary {
  homeName: string;
  awayName: string;
  homeScore: number;
  awayScore: number;
  scorers: string[];
  motm: string;
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  nextFixture: string;
}

export function buildQuickMatchSummary(state: MatchState, home: Team, away: Team, nextOpponent?: string): QuickMatchSummary {
  const goalEvents = state.events.filter((e) => e.type === 'goal' && e.outcome === 'success');
  const scorers = goalEvents.map((e) => {
    const team = e.teamId === home.id ? home : away;
    const player = team.players.find((p) => p.id === e.playerId);
    return `${player?.name ?? 'Unknown'} (${e.minute}')`;
  });

  // MOTM: player with most goal involvements
  const involvements = new Map<string, number>();
  for (const e of goalEvents) {
    if (e.playerId) involvements.set(e.playerId, (involvements.get(e.playerId) ?? 0) + 1);
  }
  let motm = 'N/A';
  let maxInv = 0;
  for (const [pid, count] of involvements) {
    if (count > maxInv) {
      maxInv = count;
      const allPlayers = [...home.players, ...away.players];
      motm = allPlayers.find((p) => p.id === pid)?.name ?? 'Unknown';
    }
  }

  return {
    homeName: home.name,
    awayName: away.name,
    homeScore: state.homeScore,
    awayScore: state.awayScore,
    scorers,
    motm,
    possession: state.possession,
    shots: state.shots,
    nextFixture: nextOpponent ? `Next: vs ${nextOpponent}` : '',
  };
}

// --- #25: Squad Depth Chart ---
export interface DepthEntry {
  position: string;
  players: Array<{ name: string; overall: number; fitness: number }>;
}

export function computeSquadDepth(team: Team): DepthEntry[] {
  const posOrder = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
  const depth: DepthEntry[] = [];

  for (const pos of posOrder) {
    const players = team.players
      .filter((p) => p.position === pos)
      .sort((a, b) => b.overall - a.overall)
      .map((p) => ({ name: p.name, overall: p.overall, fitness: p.fitness }));
    if (players.length > 0) {
      depth.push({ position: pos, players });
    }
  }

  return depth;
}

// --- #28: Achievement / Milestone System ---
export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  icon: string;
}

export function computeAchievements(stats: {
  wins: number;
  goals: number;
  cleanSheets: number;
  unbeatenStreak: number;
  seasonsPlayed: number;
  trophies: number;
  promotions: number;
}): Achievement[] {
  return [
    { id: 'first_win', name: 'First Blood', description: 'Win your first match', unlocked: stats.wins >= 1, icon: '🏆' },
    { id: 'ten_wins', name: 'Momentum', description: 'Win 10 matches', unlocked: stats.wins >= 10, icon: '🔥' },
    { id: 'fifty_goals', name: 'Goal Machine', description: 'Score 50 goals', unlocked: stats.goals >= 50, icon: '⚽' },
    { id: 'hundred_goals', name: 'Century', description: 'Score 100 goals', unlocked: stats.goals >= 100, icon: '💯' },
    { id: 'clean_sheet_5', name: 'Wall', description: '5 clean sheets', unlocked: stats.cleanSheets >= 5, icon: '🧱' },
    { id: 'unbeaten_5', name: 'Unstoppable', description: 'Unbeaten in 5 matches', unlocked: stats.unbeatenStreak >= 5, icon: '🛡️' },
    { id: 'unbeaten_10', name: 'Invincible', description: 'Unbeaten in 10 matches', unlocked: stats.unbeatenStreak >= 10, icon: '👑' },
    { id: 'first_trophy', name: 'Silverware', description: 'Win your first trophy', unlocked: stats.trophies >= 1, icon: '🥇' },
    { id: 'promotion', name: 'Moving Up', description: 'Earn promotion', unlocked: stats.promotions >= 1, icon: '📈' },
    { id: 'veteran', name: 'One Club Man', description: 'Play 3 seasons', unlocked: stats.seasonsPlayed >= 3, icon: '🎖️' },
  ];
}
