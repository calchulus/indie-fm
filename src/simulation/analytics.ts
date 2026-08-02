import { MatchState, PlayerPosition } from '../types';

export interface XGModel {
  homeXG: number;
  awayXG: number;
  shots: Array<{ x: number; y: number; xg: number; teamId: string; minute: number; isGoal: boolean }>;
}

export interface HeatMapData {
  playerId: string;
  grid: number[][];
  maxX: number;
  maxY: number;
}

export interface PassNetworkNode {
  playerId: string;
  avgX: number;
  avgY: number;
  touches: number;
}

export interface PassNetworkLink {
  from: string;
  to: string;
  count: number;
}

export interface PassNetwork {
  nodes: PassNetworkNode[];
  links: PassNetworkLink[];
  teamId: string;
}

export interface PlayerComparison {
  playerId: string;
  name: string;
  metrics: Record<string, number>;
}

export function computeXG(state: MatchState): XGModel {
  const shots: XGModel['shots'] = [];
  let homeXG = 0;
  let awayXG = 0;

  for (const evt of state.events) {
    if (evt.type !== 'shot' && evt.type !== 'goal' && evt.type !== 'save') continue;

    const distToGoal = evt.teamId === state.homeTeamId
      ? Math.sqrt((105 - evt.x) ** 2 + (34 - evt.y) ** 2)
      : Math.sqrt(evt.x ** 2 + (34 - evt.y) ** 2);

    const angle = Math.abs(evt.y - 34) / 34;
    const baseXG = Math.max(0.02, 0.35 - distToGoal * 0.003 - angle * 0.1);
    const xg = evt.type === 'goal' ? Math.max(baseXG, 0.15) : baseXG;

    shots.push({ x: evt.x, y: evt.y, xg: Math.round(xg * 100) / 100, teamId: evt.teamId, minute: evt.minute, isGoal: evt.type === 'goal' });

    if (evt.teamId === state.homeTeamId) homeXG += xg;
    else awayXG += xg;
  }

  return { homeXG: Math.round(homeXG * 100) / 100, awayXG: Math.round(awayXG * 100) / 100, shots };
}

export function computeHeatMap(positions: PlayerPosition[], playerId: string, gridSize: number = 12): HeatMapData {
  const grid: number[][] = Array.from({ length: gridSize }, () => Array(gridSize).fill(0));
  const cellW = 105 / gridSize;
  const cellH = 68 / gridSize;

  const playerPos = positions.filter((p) => p.playerId === playerId);
  for (const pos of playerPos) {
    const gx = Math.min(gridSize - 1, Math.floor(pos.x / cellW));
    const gy = Math.min(gridSize - 1, Math.floor(pos.y / cellH));
    grid[gy][gx]++;
  }

  const maxVal = Math.max(1, ...grid.flat());
  return { playerId, grid: grid.map((row) => row.map((v) => Math.round((v / maxVal) * 100) / 100)), maxX: gridSize, maxY: gridSize };
}

export function computePassNetwork(state: MatchState, teamId: string): PassNetwork {
  const touches = new Map<string, { x: number; y: number; count: number }>();
  const passPairs = new Map<string, number>();

  for (const evt of state.events) {
    if (evt.teamId !== teamId) continue;
    if (!evt.playerId) continue;

    const existing = touches.get(evt.playerId) ?? { x: 0, y: 0, count: 0 };
    existing.x += evt.x;
    existing.y += evt.y;
    existing.count++;
    touches.set(evt.playerId, existing);

    if (evt.type === 'pass' && evt.outcome === 'success') {
      const nextEvt = state.events.find((e) => e.tick > evt.tick && e.teamId === teamId && e.playerId && e.playerId !== evt.playerId);
      if (nextEvt?.playerId) {
        const key = `${evt.playerId}->${nextEvt.playerId}`;
        passPairs.set(key, (passPairs.get(key) ?? 0) + 1);
      }
    }
  }

  const nodes: PassNetworkNode[] = [];
  for (const [playerId, data] of touches) {
    nodes.push({ playerId, avgX: data.x / data.count, avgY: data.y / data.count, touches: data.count });
  }

  const links: PassNetworkLink[] = [];
  for (const [key, count] of passPairs) {
    const [from, to] = key.split('->');
    if (count >= 2) links.push({ from, to, count });
  }

  return { nodes, links: links.sort((a, b) => b.count - a.count).slice(0, 20), teamId };
}

export function computePPDA(state: MatchState, teamId: string): number {
  const opponentId = teamId === state.homeTeamId ? state.awayTeamId : state.homeTeamId;
  const opponentPasses = state.events.filter((e) => e.teamId === opponentId && e.type === 'pass').length;
  const teamTackles = state.events.filter((e) => e.teamId === teamId && (e.type === 'tackle' || e.type === 'interception')).length;
  if (teamTackles === 0) return 99;
  return Math.round((opponentPasses / teamTackles) * 10) / 10;
}

export function comparePlayers(players: Array<{ id: string; name: string; metrics: Record<string, number> }>): PlayerComparison[] {
  return players.map((p) => ({ playerId: p.id, name: p.name, metrics: p.metrics }));
}
