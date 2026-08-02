import { League, Team } from '../types';

// --- Item 13: Derby/Rivalry matches ---

export interface Rivalry {
  teamAId: string;
  teamBId: string;
  intensity: number; // 1-10
  reason: string;
}

export function generateRivalries(league: League): Rivalry[] {
  const teams = league.teams;
  const rivalries: Rivalry[] = [];

  // Geographic derbies: teams from same city
  const cityGroups: Record<string, Team[]> = {};
  for (const t of teams) {
    if (!cityGroups[t.city]) cityGroups[t.city] = [];
    cityGroups[t.city].push(t);
  }
  for (const [, cityTeams] of Object.entries(cityGroups)) {
    if (cityTeams.length >= 2) {
      for (let i = 0; i < cityTeams.length - 1; i++) {
        rivalries.push({
          teamAId: cityTeams[i].id,
          teamBId: cityTeams[i + 1].id,
          intensity: 8 + Math.floor(Math.random() * 3),
          reason: `${cityTeams[i].city} Derby`,
        });
      }
    }
  }

  // Reputation-based rivalries: top teams rival each other
  const sorted = [...teams].sort((a, b) => b.reputation - a.reputation);
  if (sorted.length >= 4) {
    rivalries.push({ teamAId: sorted[0].id, teamBId: sorted[1].id, intensity: 9, reason: 'Title Rivals' });
    rivalries.push({ teamAId: sorted[2].id, teamBId: sorted[3].id, intensity: 7, reason: 'Top 4 Rivals' });
  }

  return rivalries;
}

export function isDerby(homeId: string, awayId: string, rivalries: Rivalry[]): Rivalry | null {
  return rivalries.find((r) =>
    (r.teamAId === homeId && r.teamBId === awayId) ||
    (r.teamAId === awayId && r.teamBId === homeId)
  ) ?? null;
}

export function getDerbyEffects(rivalry: Rivalry): { atmosphereBoost: number; aggressionBoost: number; cardChance: number } {
  return {
    atmosphereBoost: rivalry.intensity * 0.1,
    aggressionBoost: rivalry.intensity * 0.05,
    cardChance: 0.02 * rivalry.intensity,
  };
}

// --- Item 14: Scout knowledge accumulation ---

export interface ScoutAssignment {
  scoutId: string;
  targetPlayerId: string;
  roundsAssigned: number;
  knowledge: number; // 0-100
}

export function advanceScoutKnowledge(assignment: ScoutAssignment): ScoutAssignment {
  const knowledgeGain = Math.min(25, 10 + assignment.roundsAssigned * 3);
  return {
    ...assignment,
    roundsAssigned: assignment.roundsAssigned + 1,
    knowledge: Math.min(100, assignment.knowledge + knowledgeGain),
  };
}

export function getKnowledgeLabel(knowledge: number): string {
  if (knowledge >= 90) return 'Expert';
  if (knowledge >= 70) return 'Detailed';
  if (knowledge >= 50) return 'Good';
  if (knowledge >= 30) return 'Basic';
  return 'Minimal';
}

// --- Item 15: Board meeting consequences ---

export interface BoardDecision {
  type: 'budget_increase' | 'facility_upgrade' | 'transfer_policy' | 'contract_extension';
  approved: boolean;
  impact: string;
  confidenceCost: number;
}

export function requestBudgetIncrease(confidence: number, currentBudget: number, amount: number): BoardDecision {
  const ratio = amount / currentBudget;
  const approvalChance = confidence / 100 - ratio * 0.5;
  const approved = Math.random() < approvalChance;

  return {
    type: 'budget_increase',
    approved,
    impact: approved
      ? `Board approved £${(amount / 1_000_000).toFixed(1)}M budget increase.`
      : `Board rejected £${(amount / 1_000_000).toFixed(1)}M request. Try again when confidence is higher.`,
    confidenceCost: approved ? 5 : 2,
  };
}

export function requestFacilityUpgrade(confidence: number, facilityLevel: number, facility: string): BoardDecision {
  const cost = facilityLevel * 10_000_000;
  const approvalChance = (confidence / 100) * (1 - facilityLevel * 0.15);
  const approved = Math.random() < approvalChance && facilityLevel < 5;

  return {
    type: 'facility_upgrade',
    approved,
    impact: approved
      ? `Board approved ${facility} upgrade to level ${facilityLevel + 1}. Cost: £${(cost / 1_000_000).toFixed(0)}M.`
      : `Board rejected ${facility} upgrade. ${facilityLevel >= 5 ? 'Already at maximum level.' : 'Insufficient confidence.'}`,
    confidenceCost: approved ? 3 : 1,
  };
}

// --- Item 7: Job offers from other clubs ---

export interface JobOffer {
  clubId: string;
  clubName: string;
  reputation: number;
  budget: number;
  reason: string;
}

export function generateJobOffers(league: League, userTeamId: string, userPosition: number, seasonNumber: number): JobOffer[] {
  const offers: JobOffer[] = [];
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return offers;

  // Good performance attracts bigger clubs
  if (userPosition <= 4 && seasonNumber >= 2) {
    const biggerClubs = league.teams
      .filter((t) => t.id !== userTeamId && t.reputation > userTeam.reputation)
      .sort((a, b) => b.reputation - a.reputation)
      .slice(0, 2);

    for (const club of biggerClubs) {
      if (Math.random() < 0.3) {
        offers.push({
          clubId: club.id,
          clubName: club.name,
          reputation: club.reputation,
          budget: club.budget,
          reason: `Impressed by your ${userPosition === 1 ? 'title-winning' : 'top-4'} record`,
        });
      }
    }
  }

  // Mid-table consistency attracts similar clubs
  if (userPosition >= 5 && userPosition <= 10 && seasonNumber >= 3) {
    const similarClubs = league.teams
      .filter((t) => t.id !== userTeamId && Math.abs(t.reputation - userTeam.reputation) < 15)
      .slice(0, 1);

    for (const club of similarClubs) {
      if (Math.random() < 0.2) {
        offers.push({
          clubId: club.id,
          clubName: club.name,
          reputation: club.reputation,
          budget: club.budget,
          reason: 'Looking for a stable, consistent manager',
        });
      }
    }
  }

  return offers;
}

// --- Item 10: End-of-season review ---

export interface SeasonReview {
  season: number;
  finalPosition: number;
  points: number;
  record: { w: number; d: number; l: number };
  goalsScored: number;
  goalsConceded: number;
  topScorer: { name: string; goals: number } | null;
  topAssister: { name: string; assists: number } | null;
  bestWin: string | null;
  worstLoss: string | null;
  longestUnbeaten: number;
  promoted: string[];
  relegated: string[];
  champion: string;
}

export function generateSeasonReview(league: League, userTeamId: string, season: number): SeasonReview {
  const sorted = [...league.standings].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  const userStanding = sorted.find((s) => s.teamId === userTeamId);
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  const position = sorted.findIndex((s) => s.teamId === userTeamId) + 1;

  // Top scorer/assister from user's team
  let topScorer: SeasonReview['topScorer'] = null;
  let topAssister: SeasonReview['topAssister'] = null;
  if (userTeam) {
    const scorers = [...userTeam.players].sort((a, b) => b.goals - a.goals);
    const assisters = [...userTeam.players].sort((a, b) => b.assists - a.assists);
    if (scorers[0]?.goals > 0) topScorer = { name: scorers[0].name, goals: scorers[0].goals };
    if (assisters[0]?.assists > 0) topAssister = { name: assisters[0].name, assists: assisters[0].assists };
  }

  // Best win / worst loss from fixtures
  const userFixtures = league.fixtures.filter((f) => f.played && (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId));
  let bestWin: string | null = null;
  let worstLoss: string | null = null;
  let bestMargin = 0;
  let worstMargin = 0;

  for (const f of userFixtures) {
    const isHome = f.homeTeamId === userTeamId;
    const gf = isHome ? f.homeGoals! : f.awayGoals!;
    const ga = isHome ? f.awayGoals! : f.homeGoals!;
    const margin = gf - ga;
    const opponent = league.teams.find((t) => t.id === (isHome ? f.awayTeamId : f.homeTeamId));
    if (margin > bestMargin) { bestMargin = margin; bestWin = `${gf}-${ga} vs ${opponent?.name}`; }
    if (margin < worstMargin) { worstMargin = margin; worstLoss = `${gf}-${ga} vs ${opponent?.name}`; }
  }

  const champion = league.teams.find((t) => t.id === sorted[0]?.teamId)?.name ?? 'Unknown';

  return {
    season,
    finalPosition: position,
    points: userStanding?.points ?? 0,
    record: { w: userStanding?.won ?? 0, d: userStanding?.drawn ?? 0, l: userStanding?.lost ?? 0 },
    goalsScored: userStanding?.goalsFor ?? 0,
    goalsConceded: userStanding?.goalsAgainst ?? 0,
    topScorer,
    topAssister,
    bestWin,
    worstLoss,
    longestUnbeaten: 0, // Would need match-by-match tracking
    promoted: [],
    relegated: sorted.slice(-3).map((s) => league.teams.find((t) => t.id === s.teamId)?.name ?? 'Unknown'),
    champion,
  };
}
