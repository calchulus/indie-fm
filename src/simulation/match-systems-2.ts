// Match ratings (#7), adaptive AI (#8), rivalry detection (#9), AI sackings (#10)

import { MatchState, Team } from '../types';

// --- #7: Match Rating Calculation ---

export interface PlayerMatchRating {
  playerId: string;
  playerName: string;
  rating: number; // 1-10
  goals: number;
  assists: number;
  keyPasses: number;
  tackles: number;
  saves: number;
  errors: number;
}

export function computeMatchRatings(state: MatchState, home: Team, away: Team): PlayerMatchRating[] {
  const allPlayers = [...home.players.slice(0, 11), ...away.players.slice(0, 11)];
  const ratings: PlayerMatchRating[] = [];

  for (const player of allPlayers) {
    const events = state.events.filter((e) => e.playerId === player.id);
    const goals = events.filter((e) => e.type === 'goal' && e.outcome === 'success').length;
    const saves = events.filter((e) => e.type === 'save' && e.outcome === 'success').length;
    const tackles = events.filter((e) => e.type === 'tackle' && e.outcome === 'success').length;
    const passesCompleted = events.filter((e) => e.type === 'pass' && e.outcome === 'success').length;
    const passesFailed = events.filter((e) => e.type === 'pass' && e.outcome === 'failure').length;
    const dribblesWon = events.filter((e) => e.type === 'dribble' && e.outcome === 'success').length;
    const errors = passesFailed + events.filter((e) => e.type === 'foul' && e.outcome === 'failure').length;

    // Base rating starts at 6.0
    let rating = 6.0;
    rating += goals * 1.5;
    rating += saves * 0.8;
    rating += tackles * 0.3;
    rating += passesCompleted * 0.05;
    rating += dribblesWon * 0.2;
    rating -= errors * 0.3;

    // Bonus for team winning
    const playerTeamId = home.players.some((p) => p.id === player.id) ? home.id : away.id;
    const won = (playerTeamId === state.homeTeamId && state.homeScore > state.awayScore) ||
      (playerTeamId === state.awayTeamId && state.awayScore > state.homeScore);
    if (won) rating += 0.5;

    rating = Math.max(3, Math.min(10, Math.round(rating * 10) / 10));

    ratings.push({
      playerId: player.id,
      playerName: player.name,
      rating,
      goals,
      assists: 0, // TODO: track assist events
      keyPasses: passesCompleted,
      tackles,
      saves,
      errors,
    });
  }

  return ratings.sort((a, b) => b.rating - a.rating);
}

export function getManOfTheMatch(state: MatchState, home: Team, away: Team): PlayerMatchRating | null {
  const ratings = computeMatchRatings(state, home, away);
  return ratings[0] ?? null;
}

// --- #8: Adaptive AI Difficulty ---
// AI teams adjust mentality/pressing mid-match based on score.

export interface AIAdaptation {
  mentalityShift: string;
  pressingShift: string;
  reason: string;
}

export function computeAIAdaptation(
  aiTeam: Team,
  scoreDiff: number, // positive = AI winning
  minute: number,
): AIAdaptation | null {
  if (minute < 30) return null; // Don't adapt too early

  const currentMentality = aiTeam.tactics.mentality;

  if (scoreDiff <= -2 && minute > 60) {
    // Losing by 2+ late: go all-out attack
    if (currentMentality !== 'attacking') {
      return { mentalityShift: 'attacking', pressingShift: 'high', reason: 'Desperate — throwing everything forward' };
    }
  } else if (scoreDiff === -1 && minute > 50) {
    // Losing by 1: push for equalizer
    if (currentMentality === 'defensive' || currentMentality === 'balanced') {
      return { mentalityShift: 'attacking', pressingShift: 'high', reason: 'Pushing for an equalizer' };
    }
  } else if (scoreDiff >= 2 && minute > 70) {
    // Winning by 2+ late: sit deep and protect
    if (currentMentality !== 'defensive') {
      return { mentalityShift: 'defensive', pressingShift: 'low', reason: 'Protecting the lead' };
    }
  } else if (scoreDiff === 1 && minute > 75) {
    // Winning by 1 very late: tighten up
    if (currentMentality === 'attacking') {
      return { mentalityShift: 'balanced', pressingShift: 'medium', reason: 'Seeing out the game' };
    }
  }

  return null;
}

// --- #9: Rivalry / Derby Detection ---

export interface RivalryInfo {
  isDerby: boolean;
  isRivalry: boolean;
  intensity: number; // 1-3
  cardChanceMod: number;
  atmosphereMod: number;
  description: string;
}

export function detectRivalry(home: Team, away: Team): RivalryInfo {
  const sameCity = home.city === away.city;
  // Historical rivals: top-6 teams playing each other
  const bothTop = home.reputation >= 70 && away.reputation >= 70;

  if (sameCity) {
    return {
      isDerby: true,
      isRivalry: true,
      intensity: 3,
      cardChanceMod: 1.5,
      atmosphereMod: 1.3,
      description: `Local derby: ${home.name} vs ${away.name}`,
    };
  }

  if (bothTop) {
    return {
      isDerby: false,
      isRivalry: true,
      intensity: 2,
      cardChanceMod: 1.25,
      atmosphereMod: 1.2,
      description: `Top-of-the-table clash: ${home.name} vs ${away.name}`,
    };
  }

  return {
    isDerby: false,
    isRivalry: false,
    intensity: 1,
    cardChanceMod: 1.0,
    atmosphereMod: 1.0,
    description: '',
  };
}

// --- #10: AI Manager Sackings ---

export interface SackingDecision {
  teamId: string;
  managerName: string;
  reason: string;
  round: number;
}

export function shouldSackAIManager(
  team: Team,
  position: number,
  totalTeams: number,
  round: number,
  totalRounds: number,
  boardConfidence: number,
): SackingDecision | null {
  // Only sack after round 10 (give managers time)
  if (round < 10) return null;

  // Sack if in relegation zone with low confidence
  const inRelegation = position > totalTeams - 3;
  const midSeason = Math.floor(totalRounds / 2);

  if (inRelegation && boardConfidence < 20 && round > midSeason) {
    return {
      teamId: team.id,
      managerName: `${team.name} Manager`,
      reason: `Sacked with team in ${position}th place and board confidence at ${boardConfidence}%`,
      round,
    };
  }

  // Sack if confidence hits zero at any point after round 15
  if (boardConfidence <= 5 && round > 15) {
    return {
      teamId: team.id,
      managerName: `${team.name} Manager`,
      reason: `Sacked after board confidence collapsed to ${boardConfidence}%`,
      round,
    };
  }

  return null;
}
