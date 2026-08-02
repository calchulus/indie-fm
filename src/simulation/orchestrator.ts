import { League } from '../types';
import { MatchResult } from './season';
import { processForm, processFitness, rollInjuries, processMorale, updateInjuries, processSuspensions, InjuryRecord, SuspensionRecord } from './development';
import { processWeeklyTraining, TrainingState } from './training';
import { updateBoardConfidence, processRoundFinances, BoardState, ClubFinances } from './board';
import { updateFanSentiment, generateMatchNews, FanSentiment, NewsItem } from './media';
import { processMentoring, MentoringGroup } from './dynamics';
import { StaffMember } from './staff';
import { createDevelopmentArc, processDevelopment } from './development-arcs';
import { getUnhappyPlayers, getPlayersNeedingRenewal } from './happiness';
import { conductMidSeasonReview, checkRetirementDecisions, getRetirementFarewellText } from './season-systems-2';
import { detectGrowth, detectTrainingImprovements } from './progression';

export interface RoundProcessingResult {
  league: League;
  news: NewsItem[];
  injuries: InjuryRecord[];
  board: BoardState;
  finances: ClubFinances;
  fanSentiment: FanSentiment;
  training: TrainingState;
  userMatchResult?: MatchResult;
}

/**
 * Processes all game systems after a round's matches have been simulated.
 * Accepts pre-simulated results — does NOT re-run match simulation.
 */
export function processRound(
  league: League,
  userTeamId: string,
  results: MatchResult[],
  board: BoardState,
  finances: ClubFinances,
  fanSentiment: FanSentiment,
  training: TrainingState,
  staff: StaffMember[],
  injuries: InjuryRecord[],
  suspensions: SuspensionRecord[],
  mentoringGroups: MentoringGroup[],
): RoundProcessingResult {
  // 1. Find user's match result
  const userMatchResult = results.find(
    (r) => r.homeTeamId === userTeamId || r.awayTeamId === userTeamId
  );

  // 2. Determine if user won
  let userWon = false;
  if (userMatchResult) {
    const isHome = userMatchResult.homeTeamId === userTeamId;
    const gf = isHome ? userMatchResult.homeGoals : userMatchResult.awayGoals;
    const ga = isHome ? userMatchResult.awayGoals : userMatchResult.homeGoals;
    userWon = gf > ga;
  }

  // 3. Update player appearances and attribute goals/assists
  const playedPlayerIds = new Set<string>();
  const updatedTeams = league.teams.map((team) => {
    const teamResult = results.find(
      (r) => r.homeTeamId === team.id || r.awayTeamId === team.id
    );
    if (!teamResult) return team;

    const isHome = teamResult.homeTeamId === team.id;
    const goalsScored = isHome ? teamResult.homeGoals : teamResult.awayGoals;

    // Attribute goals to attacking players probabilistically
    const attackers = team.players.slice(0, 11).filter((p) => ['ST', 'LW', 'RW', 'CAM'].includes(p.position));
    const mids = team.players.slice(0, 11).filter((p) => ['CM', 'CDM'].includes(p.position));

    let goalsRemaining = goalsScored;
    const goalScorers: string[] = [];
    const assistProviders: string[] = [];

    while (goalsRemaining > 0) {
      // 70% chance attacker scores, 20% mid, 10% defender
      const roll = Math.random();
      let scorerPool: typeof attackers;
      if (roll < 0.7 && attackers.length > 0) scorerPool = attackers;
      else if (roll < 0.9 && mids.length > 0) scorerPool = mids;
      else scorerPool = team.players.slice(0, 11);

      const scorer = scorerPool[Math.floor(Math.random() * scorerPool.length)];
      goalScorers.push(scorer.id);

      // 60% chance of an assist
      if (Math.random() < 0.6) {
        const assistPool = team.players.slice(0, 11).filter((p) => p.id !== scorer.id && ['CM', 'CAM', 'LW', 'RW', 'CDM'].includes(p.position));
        if (assistPool.length > 0) {
          assistProviders.push(assistPool[Math.floor(Math.random() * assistPool.length)].id);
        }
      }
      goalsRemaining--;
    }

    const players = team.players.map((p, i) => {
      if (i < 11) playedPlayerIds.add(p.id);
      const goals = goalScorers.filter((id) => id === p.id).length;
      const assists = assistProviders.filter((id) => id === p.id).length;
      if (i < 11 || goals > 0 || assists > 0) {
        return { ...p, appearances: i < 11 ? p.appearances + 1 : p.appearances, goals: p.goals + goals, assists: p.assists + assists };
      }
      return p;
    });
    return { ...team, players };
  });

  // 4. Process fitness
  const fitnessUpdatedTeams = updatedTeams.map((team) => ({
    ...team,
    players: processFitness(team.players, playedPlayerIds),
  }));

  // 5. Roll injuries
  let allInjuries = [...injuries];
  const injuryUpdatedTeams = fitnessUpdatedTeams.map((team) => {
    const { players, newInjuries } = rollInjuries(team.players, league.currentRound);
    allInjuries = [...allInjuries, ...newInjuries];
    return { ...team, players };
  });

  // 6. Update existing injuries
  allInjuries = updateInjuries(allInjuries, league.currentRound);

  // 7. Process suspensions
  processSuspensions(suspensions);

  // 8. Process form
  const formUpdatedTeams = injuryUpdatedTeams.map((team) => ({
    ...team,
    players: processForm(team.players),
  }));

  // 9. Process morale
  const moraleUpdatedTeams = formUpdatedTeams.map((team) => {
    const teamResult = results.find(
      (r) => r.homeTeamId === team.id || r.awayTeamId === team.id
    );
    if (!teamResult) return team;
    const isHome = teamResult.homeTeamId === team.id;
    const won = isHome ? teamResult.homeGoals > teamResult.awayGoals : teamResult.awayGoals > teamResult.homeGoals;
    const teamPlayedIds = new Set(team.players.slice(0, 11).map((p) => p.id));
    return { ...team, players: processMorale(team.players, won, teamPlayedIds) };
  });

  // 10. Process mentoring (user team only)
  const mentoredTeams = moraleUpdatedTeams.map((team) => {
    if (team.id !== userTeamId) return team;
    return { ...team, players: processMentoring(team.players, mentoringGroups) };
  });

  // 10b. Process development arcs (all teams — wonderkids grow, veterans decline)
  const developedTeams = mentoredTeams.map((team) => ({
    ...team,
    players: team.players.map((p) => {
      const arc = createDevelopmentArc(p);
      const { player: developed } = processDevelopment(p, arc);
      return developed;
    }),
  }));

  // 11. Process training (user team only)
  const userTeam = developedTeams.find((t) => t.id === userTeamId);
  let updatedTraining = training;
  let finalTeams = developedTeams;
  if (userTeam) {
    const { players: trainedPlayers, training: newTraining } = processWeeklyTraining(userTeam, training, staff);
    updatedTraining = newTraining;
    finalTeams = developedTeams.map((t) => t.id === userTeamId ? { ...t, players: trainedPlayers } : t);
  }

  // 12. Update board confidence
  const sortedStandings = [...league.standings].sort((a, b) => b.points - a.points);
  const userPosition = sortedStandings.findIndex((s) => s.teamId === userTeamId) + 1;
  const updatedBoard = updateBoardConfidence(board, userWon, userPosition, league.teams.length);

  // 13. Process finances
  const wasHome = userMatchResult?.homeTeamId === userTeamId;
  const updatedFinances = processRoundFinances(finances, userTeam ?? league.teams[0], league.currentRound, wasHome);

  // 14. Update fan sentiment
  const updatedFanSentiment = updateFanSentiment(fanSentiment, userWon, league.currentRound);

  // 15. Generate news
  const news: NewsItem[] = [];
  if (userMatchResult) {
    const homeTeam = league.teams.find((t) => t.id === userMatchResult.homeTeamId);
    const awayTeam = league.teams.find((t) => t.id === userMatchResult.awayTeamId);
    if (homeTeam && awayTeam) {
      news.push(...generateMatchNews(league.currentRound, homeTeam, awayTeam, userMatchResult.homeGoals, userMatchResult.awayGoals));
    }
  }

  // 15b. Player happiness warnings (unhappy players may request transfer)
  const TOTAL_ROUNDS = 38;
  if (userTeam) {
    const unhappy = getUnhappyPlayers(userTeam, TOTAL_ROUNDS);
    for (const u of unhappy.slice(0, 2)) {
      const player = userTeam.players.find((p) => p.id === u.playerId);
      if (player && u.riskLevel === 'high') {
        news.push({ id: `unhappy_${player.id}_${league.currentRound}`, round: league.currentRound, category: 'transfer', headline: `${player.name} unhappy at the club`, body: `${player.name} (happiness: ${u.overall}/100) may request a transfer if conditions don't improve.`, importance: 'high', read: false });
      }
    }
  }

  // 15c. Mid-season board review (at the halfway point)
  const midPoint = Math.floor(TOTAL_ROUNDS / 2);
  if (league.currentRound === midPoint) {
    const review = conductMidSeasonReview(userPosition, league.teams.length, 10, league.currentRound, TOTAL_ROUNDS, board.confidence);
    news.push({ id: `midseason_${league.currentRound}`, round: league.currentRound, category: 'club', headline: 'Mid-Season Board Review', body: review.message, importance: review.onTrack ? 'low' : 'high', read: false });
  }

  // 15d. Contract expiry warnings (players with 1 year left)
  if (userTeam) {
    const expiring = getPlayersNeedingRenewal(userTeam, 2026);
    for (const p of expiring.slice(0, 3)) {
      news.push({ id: `contract_${p.id}_${league.currentRound}`, round: league.currentRound, category: 'transfer', headline: `${p.name}'s contract expiring`, body: `${p.name}'s contract expires in ${p.contractExpiry}. Consider offering a renewal.`, importance: 'medium', read: false });
    }
  }

  // 15e. Retirement announcements (end of season only)
  const isSeasonEnd = league.currentRound >= TOTAL_ROUNDS;
  if (isSeasonEnd && userTeam) {
    const retirements = checkRetirementDecisions(userTeam, true);
    for (const r of retirements) {
      news.push({ id: `retire_${r.player.id}_${league.currentRound}`, round: league.currentRound, category: 'transfer', headline: `${r.player.name} retires`, body: getRetirementFarewellText(r.player), importance: 'medium', read: false });
    }
  }

  // 15f. Player growth notifications (compare before/after development)
  if (userTeam) {
    const originalUserTeam = league.teams.find((t) => t.id === userTeamId);
    const developedUserTeam = finalTeams.find((t) => t.id === userTeamId);
    if (originalUserTeam && developedUserTeam) {
      const growth = detectGrowth(originalUserTeam.players, developedUserTeam.players);
      for (const g of growth.slice(0, 3)) {
        news.push({ id: `growth_${g.playerId}_${league.currentRound}`, round: league.currentRound, category: 'club', headline: g.message, body: `${g.playerName}: OVR ${g.oldOverall} → ${g.newOverall}`, importance: g.change > 0 ? 'medium' : 'low', read: false });
      }
      // Training improvements
      const trainingResults = detectTrainingImprovements(originalUserTeam.players, developedUserTeam.players);
      for (const t of trainingResults.slice(0, 2)) {
        news.push({ id: `training_${t.playerId}_${league.currentRound}`, round: league.currentRound, category: 'club', headline: `${t.playerName} improved in training`, body: `${t.improvedAttr}: ${t.oldValue} → ${t.newValue}`, importance: 'low', read: false });
      }
    }
  }

  return {
    league: { ...league, teams: finalTeams },
    news,
    injuries: allInjuries,
    board: updatedBoard,
    finances: updatedFinances,
    fanSentiment: updatedFanSentiment,
    training: updatedTraining,
    userMatchResult,
  };
}
