import { League, Team, Player } from '../types';

export interface ModManifest {
  name: string;
  version: string;
  author: string;
  description: string;
  type: 'league' | 'teams' | 'players' | 'tactics' | 'full';
}

export interface ModPackage {
  manifest: ModManifest;
  data: Partial<{
    league: Omit<League, 'teams'> & { teams: SerializedTeam[] };
    teams: SerializedTeam[];
    players: SerializedPlayer[];
  }>;
}

export interface SerializedTeam {
  id: string;
  name: string;
  shortName: string;
  city: string;
  stadium: string;
  capacity: number;
  budget: number;
  reputation: number;
  colors: { primary: string; secondary: string };
  tactics: {
    formation: string;
    mentality: string;
    pressing: string;
    tempo: string;
    width: string;
    defensiveLine: number;
  };
  players: SerializedPlayer[];
}

export interface SerializedPlayer {
  id: string;
  name: string;
  age: number;
  nationality: string;
  position: string;
  attributes: Record<string, number>;
}

export function serializeLeague(league: League): string {
  const mod: ModPackage = {
    manifest: {
      name: league.name,
      version: '1.0.0',
      author: 'Indie FM Export',
      description: `Exported league: ${league.name} (${league.teams.length} teams)`,
      type: 'full',
    },
    data: {
      league: {
        id: league.id,
        name: league.name,
        country: league.country,
        currentRound: league.currentRound,
        fixtures: league.fixtures,
        standings: league.standings,
        teams: league.teams.map(serializeTeam),
      },
    },
  };
  return JSON.stringify(mod, null, 2);
}

export function serializeTeam(team: Team): SerializedTeam {
  return {
    id: team.id,
    name: team.name,
    shortName: team.shortName,
    city: team.city,
    stadium: team.stadium,
    capacity: team.capacity,
    budget: team.budget,
    reputation: team.reputation,
    colors: team.colors,
    tactics: { ...team.tactics },
    players: team.players.map(serializePlayer),
  };
}

export function serializePlayer(player: Player): SerializedPlayer {
  return {
    id: player.id,
    name: player.name,
    age: player.age,
    nationality: player.nationality,
    position: player.position,
    attributes: { ...player.attributes },
  };
}

export function deserializeMod(json: string): { success: boolean; error?: string; mod?: ModPackage } {
  try {
    const parsed = JSON.parse(json) as ModPackage;
    if (!parsed.manifest || !parsed.manifest.name || !parsed.manifest.type) {
      return { success: false, error: 'Invalid mod: missing manifest fields' };
    }
    if (!parsed.data) {
      return { success: false, error: 'Invalid mod: missing data section' };
    }
    return { success: true, mod: parsed };
  } catch (e) {
    return { success: false, error: `JSON parse error: ${(e as Error).message}` };
  }
}

export function validateMod(mod: ModPackage): string[] {
  const errors: string[] = [];

  if (mod.data.teams) {
    for (const team of mod.data.teams) {
      if (!team.name) errors.push(`Team missing name (id: ${team.id})`);
      if (!team.players || team.players.length < 11) {
        errors.push(`Team "${team.name}" has fewer than 11 players`);
      }
      for (const player of team.players ?? []) {
        if (!player.name) errors.push(`Player missing name in team "${team.name}"`);
        if (!player.position) errors.push(`Player "${player.name}" missing position`);
        const attrs = player.attributes;
        if (!attrs) {
          errors.push(`Player "${player.name}" missing attributes`);
        } else {
          for (const [key, val] of Object.entries(attrs)) {
            if (typeof val !== 'number' || val < 1 || val > 99) {
              errors.push(`Player "${player.name}" has invalid ${key}: ${val}`);
            }
          }
        }
      }
    }
  }

  return errors;
}

export type ModHook = 'onMatchStart' | 'onMatchEnd' | 'onGoal' | 'onTransfer' | 'onSeasonEnd';

export interface ScriptHook {
  event: ModHook;
  code: string;
}

export function executeHook(hook: ScriptHook, context: Record<string, unknown>): unknown {
  try {
    const fn = new Function('ctx', `"use strict"; ${hook.code}`);
    return fn(context);
  } catch (e) {
    console.warn(`Mod hook error (${hook.event}):`, e);
    return null;
  }
}

export const MOD_SCHEMA_EXAMPLE = `{
  "manifest": {
    "name": "My Custom League",
    "version": "1.0.0",
    "author": "Your Name",
    "description": "A custom 12-team league",
    "type": "full"
  },
  "data": {
    "teams": [
      {
        "id": "team_1",
        "name": "Example FC",
        "shortName": "EXA",
        "city": "Exampleton",
        "stadium": "Example Park",
        "capacity": 30000,
        "budget": 20000000,
        "reputation": 65,
        "colors": { "primary": "#e63946", "secondary": "#ffffff" },
        "tactics": {
          "formation": "4-4-2",
          "mentality": "balanced",
          "pressing": "medium",
          "tempo": "normal",
          "width": "normal",
          "defensiveLine": 50
        },
        "players": [
          {
            "id": "p1",
            "name": "John Smith",
            "age": 25,
            "nationality": "England",
            "position": "GK",
            "attributes": {
              "pace": 50, "shooting": 20, "passing": 60,
              "dribbling": 30, "defending": 80, "physical": 75,
              "stamina": 70, "aggression": 40, "vision": 55, "composure": 78
            }
          }
        ]
      }
    ]
  }
}`;
