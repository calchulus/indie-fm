// Schedule balancing, expansion draft, player relatives, real roster CSV import

import { Team, Player } from '../types';

// --- Schedule Balancing ---
// Ensures no team has 3+ consecutive home or away games.

export interface Fixture {
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  played: boolean;
}

export function generateBalancedSchedule(teamIds: string[], totalRounds: number): Fixture[] {
  const n = teamIds.length;
  const fixtures: Fixture[] = [];

  // Round-robin: each team plays every other team twice (home + away)
  const rounds = n - 1; // single round-robin rounds
  const matchesPerRound = n / 2;

  // Circle method for round-robin
  const teams = [...teamIds];
  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (n - 1);
      const away = (n - 1 - match + round) % (n - 1);
      const homeIdx = match === 0 ? n - 1 : home;
      const awayIdx = away;

      // First half: teams[homeIdx] hosts teams[awayIdx]
      fixtures.push({ round: round + 1, homeTeamId: teams[homeIdx], awayTeamId: teams[awayIdx], played: false });
      // Second half (reverse fixture): swap home/away
      fixtures.push({ round: round + 1 + rounds, homeTeamId: teams[awayIdx], awayTeamId: teams[homeIdx], played: false });
    }
    // Rotate teams (keep first fixed)
    const last = teams.pop()!;
    teams.splice(1, 0, last);
  }

  // Balance check: fix 3+ consecutive home/away
  return balanceSchedule(fixtures, teamIds, totalRounds);
}

function balanceSchedule(fixtures: Fixture[], teamIds: string[], _totalRounds: number): Fixture[] {
  // Check each team for 3+ consecutive home or away
  for (const teamId of teamIds) {
    const teamFixtures = fixtures
      .filter((f) => f.homeTeamId === teamId || f.awayTeamId === teamId)
      .sort((a, b) => a.round - b.round);

    let consecutive = 1;
    let lastWasHome: boolean | null = null;

    for (let i = 0; i < teamFixtures.length; i++) {
      const isHome = teamFixtures[i].homeTeamId === teamId;
      if (isHome === lastWasHome) {
        consecutive++;
        if (consecutive >= 3) {
          // Swap this fixture's home/away with another team's fixture in the same round
          const round = teamFixtures[i].round;
          const swapCandidate = fixtures.find((f) =>
            f.round === round && f !== teamFixtures[i] &&
            f.homeTeamId !== teamId && f.awayTeamId !== teamId
          );
          if (swapCandidate) {
            // Swap home/away of the problematic fixture
            const temp = teamFixtures[i].homeTeamId;
            teamFixtures[i].homeTeamId = teamFixtures[i].awayTeamId;
            teamFixtures[i].awayTeamId = temp;
            consecutive = 1;
          }
        }
      } else {
        consecutive = 1;
      }
      lastWasHome = isHome;
    }
  }

  return fixtures;
}

export function validateSchedule(fixtures: Fixture[], teamIds: string[]): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const teamId of teamIds) {
    const teamFixtures = fixtures
      .filter((f) => f.homeTeamId === teamId || f.awayTeamId === teamId)
      .sort((a, b) => a.round - b.round);

    let consecutive = 1;
    let lastWasHome: boolean | null = null;

    for (const f of teamFixtures) {
      const isHome = f.homeTeamId === teamId;
      if (isHome === lastWasHome) {
        consecutive++;
        if (consecutive >= 3) {
          issues.push(`Team ${teamId}: ${consecutive} consecutive ${isHome ? 'home' : 'away'} at round ${f.round}`);
        }
      } else {
        consecutive = 1;
      }
      lastWasHome = isHome;
    }
  }

  return { valid: issues.length === 0, issues };
}

// --- Expansion Draft ---
// A new team joins the league and picks players from existing squads.

export interface ExpansionPick {
  round: number;
  fromTeamId: string;
  playerId: string;
  playerName: string;
}

export function runExpansionDraft(
  _newTeamId: string,
  existingTeams: Team[],
  picksPerTeam: number = 2,
  maxPicksFromOneTeam: number = 1,
): { picks: ExpansionPick[]; updatedTeams: Team[]; newTeamPlayers: Player[] } {
  const picks: ExpansionPick[] = [];
  const newTeamPlayers: Player[] = [];
  const picksFromTeam = new Map<string, number>();
  let updatedTeams = existingTeams.map((t) => ({ ...t, players: [...t.players] }));

  // Expansion team gets worst players from each squad (protected players stay)
  const totalPicks = existingTeams.length * picksPerTeam;

  for (let pick = 0; pick < totalPicks; pick++) {
    // Find team with fewest picks taken that still has available players
    const availableTeams = updatedTeams.filter((t) => {
      const taken = picksFromTeam.get(t.id) ?? 0;
      return taken < maxPicksFromOneTeam && t.players.length > 14; // Keep min 14
    });

    if (availableTeams.length === 0) break;

    // Pick from the team with the most players (deepest squad loses one)
    const sourceTeam = availableTeams.sort((a, b) => b.players.length - a.players.length)[0];

    // Take their worst unprotected player (not in top 11)
    const sorted = [...sourceTeam.players].sort((a, b) => a.overall - b.overall);
    const playerToTake = sorted.find((p) => !sourceTeam.players.slice(0, 11).includes(p)) ?? sorted[0];

    if (playerToTake) {
      picks.push({ round: pick + 1, fromTeamId: sourceTeam.id, playerId: playerToTake.id, playerName: playerToTake.name });
      newTeamPlayers.push(playerToTake);
      picksFromTeam.set(sourceTeam.id, (picksFromTeam.get(sourceTeam.id) ?? 0) + 1);
      updatedTeams = updatedTeams.map((t) =>
        t.id === sourceTeam.id ? { ...t, players: t.players.filter((p) => p.id !== playerToTake.id) } : t
      );
    }
  }

  return { picks, updatedTeams, newTeamPlayers };
}

// --- Player Relatives ---
// Generate father-son pairs and brothers in the league.

export interface RelativeLink {
  playerId: string;
  relativeId: string;
  relationship: 'father' | 'son' | 'brother';
}

export function generateRelatives(players: Player[]): { links: RelativeLink[]; modifiedPlayers: Player[] } {
  const links: RelativeLink[] = [];
  const modified = [...players];

  // 5% chance per player to have a relative in the league
  const candidates = players.filter((p) => p.age >= 20 && Math.random() < 0.05);

  for (const player of candidates) {
    // Generate a son (young player, same nationality, similar position)
    const sonAge = Math.max(16, player.age - 22 + Math.floor(Math.random() * 4));
    if (sonAge < 16 || sonAge > 25) continue;

    const son: Player = {
      ...player,
      id: `${player.id}_son`,
      name: `${player.name.split(' ')[0]} Jr.`,
      age: sonAge,
      overall: Math.max(35, player.overall - 20 + Math.floor(Math.random() * 10)),
      potentialAbility: Math.min(95, player.overall + Math.floor(Math.random() * 15)),
      currentAbility: Math.max(35, player.overall - 20),
      value: Math.max(100_000, player.value * 0.1),
      wage: Math.max(500, Math.round(player.wage * 0.1)),
      appearances: 0,
      goals: 0,
      assists: 0,
    };

    modified.push(son);
    links.push({ playerId: player.id, relativeId: son.id, relationship: 'son' });
    links.push({ playerId: son.id, relativeId: player.id, relationship: 'father' });
  }

  // Brothers: pick pairs of similar-age players with same nationality
  const byNationality = new Map<string, Player[]>();
  for (const p of players) {
    const group = byNationality.get(p.nationality) ?? [];
    group.push(p);
    byNationality.set(p.nationality, group);
  }

  for (const [, group] of byNationality) {
    if (group.length < 2) continue;
    if (Math.random() > 0.1) continue; // 10% chance per nationality group

    const sorted = group.sort((a, b) => a.age - b.age);
    for (let i = 0; i < sorted.length - 1; i++) {
      if (Math.abs(sorted[i].age - sorted[i + 1].age) <= 3 && Math.random() < 0.3) {
        links.push({ playerId: sorted[i].id, relativeId: sorted[i + 1].id, relationship: 'brother' });
        links.push({ playerId: sorted[i + 1].id, relativeId: sorted[i].id, relationship: 'brother' });
        break; // One brother pair per nationality
      }
    }
  }

  return { links, modifiedPlayers: modified };
}

// --- Real Roster CSV Import ---
// Format: name,age,nationality,position,pace,passing,dribbling,finishing,tackling,overall

export interface CSVImportResult {
  players: Player[];
  errors: string[];
  imported: number;
  skipped: number;
}

export function parseRosterCSV(csv: string): CSVImportResult {
  const lines = csv.trim().split('\n');
  const players: Player[] = [];
  const errors: string[] = [];
  let skipped = 0;

  // Skip header row if it looks like one
  const startIdx = lines[0]?.toLowerCase().includes('name') ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    if (cols.length < 6) {
      errors.push(`Line ${i + 1}: too few columns (${cols.length})`);
      skipped++;
      continue;
    }

    const [name, ageStr, nationality, position, ...ratings] = cols;
    const age = parseInt(ageStr);
    if (!name || isNaN(age) || age < 15 || age > 45) {
      errors.push(`Line ${i + 1}: invalid name or age`);
      skipped++;
      continue;
    }

    const validPositions = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];
    const pos = validPositions.includes(position.toUpperCase()) ? position.toUpperCase() : 'CM';

    // Parse ratings (default to 10 if missing)
    const parseRating = (val: string | undefined) => Math.max(1, Math.min(20, parseInt(val ?? '10') || 10));
    const pace = parseRating(ratings[0]);
    const passing = parseRating(ratings[1]);
    const dribbling = parseRating(ratings[2]);
    const finishing = parseRating(ratings[3]);
    const tackling = parseRating(ratings[4]);
    const overall = ratings[5] ? parseInt(ratings[5]) || 50 : Math.round((pace + passing + dribbling + finishing + tackling) / 5 * 2.5);

    const player: Player = {
      id: `csv_${i}_${Date.now()}`,
      name,
      age,
      nationality: nationality || 'Unknown',
      position: pos as Player['position'],
      role: 'central_midfielder',
      duty: 'support',
      attributes: {
        pace, acceleration: pace, stamina: 12, strength: 10, agility: 10,
        jumpingReach: 10, passing, crossing: passing, dribbling, technique: dribbling,
        finishing, longShots: finishing, heading: 10, vision: passing,
        composure: 12, decisions: 12, concentration: 10, workRate: 10,
        offTheBall: 10, positioning: tackling, tackling, marking: tackling,
        aggression: 10, bravery: 10, flair: 10, firstTouch: dribbling,
        anticipation: 12, reflexes: pos === 'GK' ? 14 : 5, handling: pos === 'GK' ? 12 : 3,
        oneOnOnes: pos === 'GK' ? 12 : 3, aerialReach: pos === 'GK' ? 12 : 5,
        commandOfArea: pos === 'GK' ? 10 : 3, communication: 8, rushingOut: pos === 'GK' ? 10 : 3,
        penaltyTaking: 10, freeKickTaking: 10,
      } as any,
      hidden: { loyalty: 10, consistency: 10, versatility: 10, adaptability: 10, ambition: 12, pressure: 10, professionalism: 10, sportsmanship: 10, temperament: 10, injuryProneness: 10, bigGames: 10 },
      personality: 'professional',
      footedness: 'right',
      height: 175 + Math.floor(Math.random() * 15),
      weight: 70 + Math.floor(Math.random() * 10),
      overall: Math.min(95, Math.max(30, overall)),
      potentialAbility: Math.min(95, overall + (age < 24 ? 15 : 5)),
      currentAbility: Math.min(95, Math.max(30, overall)),
      value: overall * overall * 10_000,
      wage: overall * overall * 2,
      contractExpiry: 2028,
      form: 5,
      fitness: 100,
      morale: 7,
      reputation: Math.min(100, overall),
      goals: 0,
      assists: 0,
      appearances: 0,
      yellowCards: 0,
      redCards: 0,
      traits: [],
    };

    players.push(player);
  }

  return { players, errors, imported: players.length, skipped };
}

export function generateCSVTemplate(): string {
  return `name,age,nationality,position,pace,passing,dribbling,finishing,tackling,overall
Lionel Messi,38,Argentina,RW,14,18,19,16,4,88
Cristiano Ronaldo,41,Portugal,ST,12,14,15,18,6,85
Kylian Mbappe,27,France,ST,19,16,18,17,5,91
Erling Haaland,25,Norway,ST,17,12,14,19,4,90
Jude Bellingham,22,England,CM,16,17,16,15,14,89`;
}
