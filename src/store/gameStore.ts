import { create } from 'zustand';
import { League, MatchState, Team } from '../types';
import { generateLeague } from '../data/generators';
import { initMatchState, simulateTick, simulateMinutes } from '../simulation/engine';
import { MatchResult } from '../simulation/season';
import { simulateRoundFast, simulateFastMatch } from '../simulation/fastmatch';
import { processRound } from '../simulation/orchestrator';
import { createBoardState, BoardState, ClubFinances, createFinances } from '../simulation/board';
import { createFanSentiment, FanSentiment, NewsItem } from '../simulation/media';
import { createTrainingState, TrainingState } from '../simulation/training';
import { generateDefaultBackroom, StaffMember } from '../simulation/staff';
import { InjuryRecord, SuspensionRecord } from '../simulation/development';
import { MentoringGroup, createMentoringGroups } from '../simulation/dynamics';
import { SoundEffects } from '../audio/sound';
import { adaptTactics, shouldAdapt } from '../simulation/aiadaptation';
import { computeSeasonRecord, createClubRecords, updateClubRecords, SeasonRecord, ClubRecords } from '../simulation/history';
import { startNewSeason } from '../simulation/newseason';
import { computeSeasonAwards } from '../simulation/awards';
import { autosave, loadAutosave } from '../simulation/saveload';
import { simulateAITransferWindow, isTransferWindow } from '../simulation/ai-transfers';
import { detectMilestones, updateMarketValues } from '../simulation/gameplay-systems';
import { advanceScoutKnowledge, ScoutAssignment, requestBudgetIncrease, requestFacilityUpgrade } from '../simulation/season-systems';
import { getContinentalMatchesForRound, simulateContinentalMatch, updateContinentalStandings, ContinentalState } from '../simulation/continental-calendar';
import { generateMatchWeather, WeatherCondition } from '../simulation/weather-effects';
import { recalculatePositions } from '../simulation/formation-change';
import { checkRetirements, removeExpiredContracts, getTotalWages, MAX_SQUAD_SIZE } from '../simulation/enforcement';
import { shouldRequestTransfer } from '../simulation/player-systems';
import { createInboxMessage } from '../simulation/ui-systems';
import { shouldSackManager } from '../simulation/systems';
import { generateStaffCandidates, StaffCandidate } from '../simulation/systems-2';
import { generateFreeAgents, YouthProspect } from '../simulation/systems-3';
import { saveToLocalStorage, loadFromLocalStorage } from '../simulation/code-quality';
import { generatePressQuestions, computeFanSatisfaction, checkLegendStatus } from '../simulation/features-2';
import { saveGame, loadGame, SaveSlot } from '../simulation/idb-storage';
import { simulateBatchSync } from '../simulation/match-worker';
import { Phase, SeasonState, createSeasonState, getNextPhase, shouldTransitionPhase, computePlayerMatchStats, PlayerMatchStats, generatePlayoffBracket, PlayoffSeries, generateDraftProspects, generateFreeAgentPool, FreeAgentListing, SeasonAwards, computeSeasonAwards as computeAwardsFromStats } from '../simulation/phase-system';
import { developSeason, checkMatchFeats, checkCareerMilestones, ensureMinimumRoster, SeasonStatsRow } from '../simulation/player-lifecycle';
import { simulateAITrades, isTradeDeadlinePassed } from '../simulation/trade-system';

export interface Toast {
  id: string;
  message: string;
  type: 'goal' | 'info' | 'success' | 'warning' | 'error';
  timestamp: number;
}

interface GameState {
  league: League | null;
  userTeamId: string | null;
  matchState: MatchState | null;
  matchHome: Team | null;
  matchAway: Team | null;
  isSimulating: boolean;
  simSpeed: number;
  lastRoundResults: MatchResult[];
  seasonComplete: boolean;
  sacked: boolean;
  careerStarted: boolean;

  // Persistent subsystem state
  board: BoardState | null;
  finances: ClubFinances | null;
  fanSentiment: FanSentiment | null;
  training: TrainingState | null;
  staff: StaffMember[];
  injuries: InjuryRecord[];
  suspensions: SuspensionRecord[];
  mentoringGroups: MentoringGroup[];
  news: NewsItem[];
  toasts: Toast[];
  seasonHistory: SeasonRecord[];
  clubRecords: ClubRecords;
  seasonNumber: number;
  scoutAssignments: ScoutAssignment[];
  continentalState: ContinentalState | null;
  matchWeather: string;
  showFatigueBars: boolean;

  // Phase system (ZenGM-style season loop)
  seasonState: SeasonState;
  allMatchStats: PlayerMatchStats[];
  playoffBracket: PlayoffSeries[];
  freeAgentPool: FreeAgentListing[];
  seasonAwards: SeasonAwards | null;
  playerSeasonHistory: Map<string, SeasonStatsRow[]>;
  jerseyNumbers: Map<string, number>;

  // Actions
  initGame: () => void;
  resumeFromAutosave: () => Promise<boolean>;
  startCareer: (teamId: string) => void;
  resetCareer: () => void;
  selectTeam: (teamId: string) => void;
  startMatch: (homeId: string, awayId: string) => void;
  tickMatch: () => void;
  simMinutes: (minutes: number) => void;
  setSimulating: (val: boolean) => void;
  setSimSpeed: (speed: number) => void;
  applyShout: (shout: string, attackMod: number, defendMod: number, duration: number) => void;
  applySub: (offId: string, onId: string) => void;
  applyFormationChange: (formation: string) => void;
  advanceRound: () => void;
  simToEnd: () => void;
  playUserMatch: (fixtureId: string) => void;
  startNewSeason: () => void;
  requestBudget: (amount: number) => void;
  requestFacility: (facility: string) => void;
  toggleFatigueBars: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  // Wire 3: Player systems
  checkPlayerLoyalty: (playerId: string) => boolean;
  // Wire 4: UI systems
  addInboxNotification: (type: string, title: string, body: string, priority?: 'low' | 'medium' | 'high') => void;
  // Wire 5: Systems
  checkSacking: () => void;
  // Wire 6: Systems-2
  hireStaff: (role: string) => void;
  hireSpecificStaff: (candidate: StaffCandidate) => void;
  fireStaff: (staffId: string) => void;
  // Wire 7: Systems-3
  signFreeAgent: (playerId: string) => void;
  signSpecificFreeAgent: (player: import('../types').Player) => void;
  signYouthProspect: (prospect: YouthProspect) => void;
  // Wire 8: Code quality
  saveGameState: () => void;
  loadGameState: () => void;
}

let toastId = 0;

export const useGameStore = create<GameState>((set, get) => ({
  league: null,
  userTeamId: null,
  matchState: null,
  matchHome: null,
  matchAway: null,
  isSimulating: false,
  simSpeed: 1,
  lastRoundResults: [],
  seasonComplete: false,
  sacked: false,
  careerStarted: false,
  board: null,
  finances: null,
  fanSentiment: null,
  training: null,
  staff: [],
  injuries: [],
  suspensions: [],
  mentoringGroups: [],
  news: [],
  toasts: [],
  seasonHistory: [],
  clubRecords: createClubRecords(),
  seasonNumber: 1,
  scoutAssignments: [],
  continentalState: null,
  matchWeather: 'clear',
  showFatigueBars: true,

  // Phase system initial state
  seasonState: createSeasonState(1, 38),
  allMatchStats: [],
  playoffBracket: [],
  freeAgentPool: [],
  seasonAwards: null,
  playerSeasonHistory: new Map(),
  jerseyNumbers: new Map(),

  initGame: () => {
    const league = generateLeague(20);
    const userTeamId = league.teams[0].id;
    const userTeam = league.teams[0];
    const staff = generateDefaultBackroom();
    const mentoringGroups = createMentoringGroups(userTeam);

    set({
      league,
      userTeamId,
      seasonComplete: false,
      seasonNumber: 1,
      seasonHistory: [],
      clubRecords: createClubRecords(),
      lastRoundResults: [],
      board: createBoardState(userTeam, 10),
      finances: createFinances(userTeam),
      fanSentiment: createFanSentiment(userTeam),
      training: createTrainingState(),
      staff,
      injuries: [],
      suspensions: [],
      mentoringGroups,
      news: [],
      toasts: [],
    });
  },

  resumeFromAutosave: async () => {
    try {
      // Try IndexedDB first (primary), fall back to localStorage
      let data: any = null;
      try {
        const idbSlot = await loadGame('autosave');
        if (idbSlot?.data) data = idbSlot.data;
      } catch { /* IDB unavailable */ }
      if (!data || !data.league) {
        data = await loadAutosave();
      }
      if (!data || !data.league) return false;
      const userTeam = data.league.teams.find((t: any) => t.id === data.userTeamId);
      set({
        league: data.league,
        userTeamId: data.userTeamId,
        seasonComplete: false,
        lastRoundResults: [],
        board: (data.board as BoardState) ?? createBoardState(userTeam ?? data.league.teams[0], 10),
        finances: (data.finances as ClubFinances) ?? createFinances(userTeam ?? data.league.teams[0]),
        fanSentiment: (data.fanSentiment as FanSentiment) ?? createFanSentiment(userTeam ?? data.league.teams[0]),
        training: (data.training as TrainingState) ?? createTrainingState(),
        staff: generateDefaultBackroom(),
        injuries: (data.injuries as InjuryRecord[]) ?? [],
        suspensions: [],
        mentoringGroups: userTeam ? createMentoringGroups(userTeam) : [],
        news: (data.news as NewsItem[]) ?? [],
        seasonHistory: (data.seasonHistory as SeasonRecord[]) ?? [],
        clubRecords: (data.clubRecords as ClubRecords) ?? createClubRecords(),
        seasonNumber: data.seasonNumber ?? 1,
        toasts: [],
      });
      return true;
    } catch {
      return false;
    }
  },

  selectTeam: (teamId: string) => set({ userTeamId: teamId }),

  startCareer: (teamId: string) => {
    const { league } = get();
    if (!league) return;
    const team = league.teams.find((t) => t.id === teamId);
    if (!team) return;
    set({
      userTeamId: teamId,
      careerStarted: true,
      sacked: false,
      board: createBoardState(team, 10),
      finances: createFinances(team),
      fanSentiment: createFanSentiment(team),
      training: createTrainingState(),
      mentoringGroups: createMentoringGroups(team),
    });
    get().addToast(`🎉 Career started at ${team.name}!`, 'success');
  },

  resetCareer: () => {
    set({ sacked: false, careerStarted: false, seasonComplete: false });
    get().initGame();
  },

  startMatch: (homeId: string, awayId: string) => {
    const { league } = get();
    if (!league) return;
    const home = league.teams.find((t) => t.id === homeId);
    const away = league.teams.find((t) => t.id === awayId);
    if (!home || !away) return;
    // Generate weather for this match
    const weather = generateMatchWeather();
    set({ matchState: initMatchState(home, away), matchHome: home, matchAway: away, isSimulating: false, matchWeather: weather });
  },

  tickMatch: () => {
    const { matchState, matchHome, matchAway, matchWeather } = get();
    if (!matchState || !matchHome || !matchAway) return;
    if (matchState.status === 'full_time') {
      set({ isSimulating: false });
      return;
    }
    const prevScore = matchState.homeScore + matchState.awayScore;
    const prevEvents = matchState.events.length;

    // AI tactical adaptation every 10 minutes
    let home = matchHome;
    let away = matchAway;
    if (shouldAdapt(matchState.minute)) {
      const scoreDiffHome = matchState.homeScore - matchState.awayScore;
      home = { ...matchHome, tactics: adaptTactics(matchHome, scoreDiffHome, matchState.minute) };
      away = { ...matchAway, tactics: adaptTactics(matchAway, -scoreDiffHome, matchState.minute) };
    }

    const newState = simulateTick(matchState, home, away, matchWeather as WeatherCondition);
    const newScore = newState.homeScore + newState.awayScore;

    // Sound triggers based on new events
    const newEvents = newState.events.slice(prevEvents);
    for (const evt of newEvents) {
      switch (evt.type) {
        case 'goal': SoundEffects.goal(); break;
        case 'save': SoundEffects.save(); break;
        case 'yellow_card': case 'red_card': SoundEffects.card(); break;
        case 'kickoff': SoundEffects.whistle(); break;
        case 'full_time': SoundEffects.fullTime(); break;
      }
    }

    if (newScore > prevScore) {
      const lastGoal = newState.events[newState.events.length - 1];
      get().addToast(`⚽ GOAL! ${lastGoal?.description ?? 'Goal scored!'}`, 'goal');
    }

    set({ matchState: newState, matchHome: home, matchAway: away });
  },

  simMinutes: (minutes: number) => {
    const { matchState, matchHome, matchAway, matchWeather } = get();
    if (!matchState || !matchHome || !matchAway) return;
    // Use batch sync for large simulations (includes event capping)
    const newState = minutes > 5
      ? simulateBatchSync(matchState, matchHome, matchAway, minutes * 60, (matchWeather as WeatherCondition) ?? 'clear')
      : simulateMinutes(matchState, matchHome, matchAway, minutes, matchWeather as WeatherCondition);
    set({ matchState: newState });
    if (newState.status === 'full_time') set({ isSimulating: false });
  },

  setSimulating: (val: boolean) => set({ isSimulating: val }),
  setSimSpeed: (speed: number) => set({ simSpeed: speed }),

  applyShout: (shout: string, attackMod: number, defendMod: number, duration: number) => {
    const { matchState, matchHome, matchAway, userTeamId } = get();
    if (!matchState || !matchHome || !matchAway || !userTeamId) return;
    const isUserHome = matchHome.id === userTeamId;
    const team = isUserHome ? matchHome : matchAway;
    const updatedTeam: Team = {
      ...team,
      tactics: {
        ...team.tactics,
        mentality: attackMod > 1.05 ? 'attacking' : defendMod > 1.05 ? 'defensive' : team.tactics.mentality,
        pressing: attackMod > 1.05 ? 'high' : team.tactics.pressing,
      },
    };
    set(isUserHome ? { matchHome: updatedTeam } : { matchAway: updatedTeam });
    get().addToast(`📣 "${shout}" applied — tactics adjusted for ${duration} min`, 'info');
  },

  applySub: (offId: string, onId: string) => {
    const { matchState, matchHome, matchAway, userTeamId } = get();
    if (!matchState || !matchHome || !matchAway || !userTeamId) return;
    const isUserHome = matchHome.id === userTeamId;
    const team = isUserHome ? matchHome : matchAway;

    const offIdx = team.players.findIndex((p) => p.id === offId);
    const onIdx = team.players.findIndex((p) => p.id === onId);
    if (offIdx < 0 || onIdx < 0 || offIdx >= 11) return;

    // Swap players in the squad array
    const updatedPlayers = [...team.players];
    const temp = updatedPlayers[offIdx];
    updatedPlayers[offIdx] = updatedPlayers[onIdx];
    updatedPlayers[onIdx] = temp;
    const updatedTeam: Team = { ...team, players: updatedPlayers };

    // Update playerPositions in matchState
    const updatedPositions = matchState.playerPositions.map((pp) =>
      pp.playerId === offId ? { ...pp, playerId: onId } : pp
    );

    set({
      matchState: { ...matchState, playerPositions: updatedPositions },
      ...(isUserHome ? { matchHome: updatedTeam } : { matchAway: updatedTeam }),
    });
    const offName = team.players[offIdx]?.name.split(' ').pop();
    const onName = team.players[onIdx]?.name.split(' ').pop();
    get().addToast(`🔄 Sub: ${offName} OFF → ${onName} ON`, 'success');
  },

  applyFormationChange: (formation: string) => {
    const { matchHome, matchAway, matchState, userTeamId } = get();
    if (!matchHome || !matchAway || !userTeamId) return;
    const isUserHome = matchHome.id === userTeamId;
    const team = isUserHome ? matchHome : matchAway;
    const updatedTeam: Team = { ...team, tactics: { ...team.tactics, formation: formation as Team['tactics']['formation'] } };
    const newHome = isUserHome ? updatedTeam : matchHome;
    const newAway = isUserHome ? matchAway : updatedTeam;
    // Recalculate player positions based on new formation
    let newMatchState = matchState;
    if (matchState) {
      newMatchState = recalculatePositions(matchState, newHome, newAway);
    }
    set({ matchHome: newHome, matchAway: newAway, matchState: newMatchState });
    get().addToast(`📋 Formation changed to ${formation}`, 'info');
  },

  advanceRound: () => {
    const state = get();
    const { league, userTeamId, board, finances, fanSentiment, training, staff, injuries, suspensions, mentoringGroups } = state;
    if (!league || !userTeamId || !board || !finances || !fanSentiment || !training) return;

    // Fast sim for AI matches (skips user's match)
    const { fixtures: fastFixtures, results: fastResults } = simulateRoundFast(
      league.teams, league.fixtures, league.currentRound, userTeamId,
    );

    // Update standings from fast results
    const updatedStandings = league.standings.map((s) => ({ ...s }));
    for (const r of fastResults) {
      const homeS = updatedStandings.find((s) => s.teamId === r.homeTeamId);
      const awayS = updatedStandings.find((s) => s.teamId === r.awayTeamId);
      if (homeS) {
        homeS.played++; homeS.goalsFor += r.homeGoals; homeS.goalsAgainst += r.awayGoals;
        if (r.homeGoals > r.awayGoals) { homeS.won++; homeS.points += 3; }
        else if (r.homeGoals === r.awayGoals) { homeS.drawn++; homeS.points += 1; }
        else homeS.lost++;
      }
      if (awayS) {
        awayS.played++; awayS.goalsFor += r.awayGoals; awayS.goalsAgainst += r.homeGoals;
        if (r.awayGoals > r.homeGoals) { awayS.won++; awayS.points += 3; }
        else if (r.awayGoals === r.homeGoals) { awayS.drawn++; awayS.points += 1; }
        else awayS.lost++;
      }
    }

    // Convert fast results to MatchResult format for orchestrator
    const matchResults: MatchResult[] = fastResults.map((r) => ({
      fixtureId: r.fixtureId,
      homeTeamId: r.homeTeamId,
      awayTeamId: r.awayTeamId,
      homeGoals: r.homeGoals,
      awayGoals: r.awayGoals,
    }));

    // Build updated league with new fixtures and standings
    const updatedLeague: League = {
      ...league,
      fixtures: fastFixtures,
      standings: updatedStandings,
      currentRound: league.currentRound + 1,
    };

    // Run orchestrator for system processing (no re-simulation)
    const result = processRound(
      updatedLeague, userTeamId, matchResults,
      board, finances, fanSentiment, training, staff, injuries, suspensions, mentoringGroups,
    );

    const maxRound = Math.max(...updatedLeague.fixtures.map((f) => f.round));
    const allPlayed = updatedLeague.fixtures.every((f) => f.played);

    set({
      league: result.league,
      lastRoundResults: matchResults,
      seasonComplete: allPlayed || updatedLeague.currentRound > maxRound,
      board: result.board,
      finances: result.finances,
      fanSentiment: result.fanSentiment,
      training: result.training,
      injuries: result.injuries,
      news: [...result.news, ...state.news].slice(0, 50),
    });

    if (result.userMatchResult) {
      const r = result.userMatchResult;
      get().addToast(`FT: ${r.homeGoals}-${r.awayGoals}`, r.homeGoals !== r.awayGoals ? 'success' : 'info');

      // Press conference questions generated after match
      const won = r.homeGoals !== r.awayGoals;
      const pressQs = generatePressQuestions('post_match', won ? 'win' : 'draw');
      if (pressQs.length > 0) {
        const newsItems: NewsItem[] = pressQs.map((q) => ({
          id: `press_${q.id}_${result.league.currentRound}`,
          round: result.league.currentRound,
          category: 'media' as const,
          headline: `Press: "${q.question}"`,
          body: q.answers.map((a) => `• ${a.text}`).join('\n'),
          importance: 'low' as const,
          read: false,
        }));
        set({ news: [...newsItems, ...get().news].slice(0, 50) });
      }
    }

    // Fan satisfaction update based on recent form
    const userTeamForFans = result.league.teams.find((t) => t.id === userTeamId);
    if (userTeamForFans) {
      const sortedForFans = [...result.league.standings].sort((a, b) => b.points - a.points);
      const posForFans = sortedForFans.findIndex((s) => s.teamId === userTeamId) + 1;
      const recentResults = get().lastRoundResults.slice(0, 5).map((r) => {
        const isHome = r.homeTeamId === userTeamId;
        const gf = isHome ? r.homeGoals : r.awayGoals;
        const ga = isHome ? r.awayGoals : r.homeGoals;
        return gf > ga ? 'W' as const : gf === ga ? 'D' as const : 'L' as const;
      });
      const fanSat = computeFanSatisfaction(recentResults, posForFans, result.league.teams.length, 0, 50, 0);
      if (fanSat.overall < 25) {
        get().addToast(`😡 Fans are ${fanSat.label.toLowerCase()} (${fanSat.overall}/100). Results must improve.`, 'warning');
      }
    }

    // Club legend check
    if (userTeamForFans && result.league.currentRound % 5 === 0) {
      for (const p of userTeamForFans.players) {
        const legend = checkLegendStatus(p);
        if (legend) {
          get().addToast(`🏛️ ${legend.playerName} is now a club legend! ${legend.legacy}`, 'goal');
          break; // one legend toast per check
        }
      }
    }

    // Development milestones + market value fluctuation
    const userTeamBefore = league.teams.find((t) => t.id === userTeamId);
    const userTeamAfter = result.league.teams.find((t) => t.id === userTeamId);
    if (userTeamBefore && userTeamAfter) {
      const milestones = detectMilestones(userTeamBefore.players, userTeamAfter.players);
      for (const m of milestones) {
        get().addToast(m.message, m.type === 'wonderkid_breakout' ? 'goal' : 'info');
      }
      // Update market values for all teams
      const teamsWithUpdatedValues = result.league.teams.map((t) => updateMarketValues(t));
      set({ league: { ...result.league, teams: teamsWithUpdatedValues } });
    }

    // Sacking check: board fires you if confidence drops to 5 or below
    if (result.board.confidence <= 5) {
      set({ sacked: true, isSimulating: false });
      get().addToast('🚪 The board has terminated your contract. You have been sacked.', 'error');
    }

    // AI transfer window activity (fires during transfer windows)
    const totalRounds = Math.max(...result.league.fixtures.map((f) => f.round));
    if (isTransferWindow(result.league.currentRound, totalRounds)) {
      const { league: leagueAfterTransfers, activity } = simulateAITransferWindow(result.league, userTeamId, result.league.currentRound);
      if (activity.transfers.length > 0) {
        set({ league: leagueAfterTransfers });
        const topTransfer = activity.transfers[0];
        get().addToast(`💰 Transfer window: ${activity.transfers.length} deals completed. Latest: ${topTransfer.playerName} to ${topTransfer.toClubName}.`, 'info');
      }
    }

    // Contract renewal prompts: warn about players with expiring contracts
    const currentYear = 2026 + get().seasonNumber - 1;
    const userTeamNow = get().league?.teams.find((t) => t.id === userTeamId);
    if (userTeamNow) {
      const expiring = userTeamNow.players.filter((p) => p.contractExpiry <= currentYear + 1 && p.overall >= 55);
      if (expiring.length > 0 && result.league.currentRound % 5 === 0) {
        get().addToast(`📝 ${expiring.length} player(s) entering final contract year: ${expiring.slice(0, 3).map((p) => p.name.split(' ').pop()).join(', ')}${expiring.length > 3 ? '...' : ''}`, 'warning');
      }

      // Item 16: Player retirement check (age 36+)
      const { team: teamAfterRetirement, retired } = checkRetirements(userTeamNow);
      if (retired.length > 0) {
        const updatedTeams = result.league.teams.map((t) => t.id === userTeamId ? teamAfterRetirement : t);
        set({ league: { ...result.league, teams: updatedTeams } });
        get().addToast(`👋 ${retired.map((p) => p.name.split(' ').pop()).join(', ')} retired.`, 'info');
      }

      // Item 15: Contract expiry enforcement (remove expired contracts at season end)
      if (result.league.currentRound % 10 === 0) {
        const { team: teamAfterExpiry, released } = removeExpiredContracts(userTeamNow, currentYear);
        if (released.length > 0) {
          const updatedTeams = get().league!.teams.map((t) => t.id === userTeamId ? teamAfterExpiry : t);
          set({ league: { ...get().league!, teams: updatedTeams } });
          get().addToast(`📋 ${released.map((p) => p.name.split(' ').pop()).join(', ')} left (contract expired).`, 'warning');
        }
      }

      // Item 17: Wage budget warning
      const totalWages = getTotalWages(userTeamNow);
      const wageBudget = get().board?.wageBudget ?? 0;
      if (wageBudget > 0 && totalWages > wageBudget * 0.9 && result.league.currentRound % 5 === 0) {
        get().addToast(`💰 Wage bill at ${Math.round((totalWages / wageBudget) * 100)}% of budget.`, totalWages > wageBudget ? 'warning' : 'info');
      }

      // Item 18: Squad size warning
      if (userTeamNow.players.length >= MAX_SQUAD_SIZE && result.league.currentRound % 5 === 0) {
        get().addToast(`👥 Squad at maximum size (${MAX_SQUAD_SIZE}). Sell players before signing.`, 'warning');
      }
    }

    // Continental competition: simulate matches that fall on this league round
    const contState = get().continentalState;
    if (contState) {
      const contMatches = getContinentalMatchesForRound(contState, result.league.currentRound);
      if (contMatches.length > 0) {
        let updatedStandings = [...contState.standings];
        const updatedFixtures = [...contState.fixtures];
        for (const match of contMatches) {
          const homeTeam = result.league.teams.find((t) => t.id === match.homeTeamId);
          const awayTeam = result.league.teams.find((t) => t.id === match.awayTeamId);
          if (!homeTeam || !awayTeam) continue;
          const homeStr = homeTeam.players.slice(0, 11).reduce((s, p) => s + p.overall, 0) / 11;
          const awayStr = awayTeam.players.slice(0, 11).reduce((s, p) => s + p.overall, 0) / 11;
          const result2 = simulateContinentalMatch(match, homeStr, awayStr);
          updatedStandings = updateContinentalStandings(updatedStandings, match, result2.homeGoals, result2.awayGoals);
          const fIdx = updatedFixtures.findIndex((f) => f.id === match.id);
          if (fIdx >= 0) updatedFixtures[fIdx] = { ...updatedFixtures[fIdx], played: true, homeGoals: result2.homeGoals, awayGoals: result2.awayGoals };
          // Notify if user's team is involved
          if (match.homeTeamId === userTeamId || match.awayTeamId === userTeamId) {
            get().addToast(`🏆 ${homeTeam.name} ${result2.homeGoals}-${result2.awayGoals} ${awayTeam.name} (Continental)`, 'info');
          }
        }
        set({ continentalState: { ...contState, fixtures: updatedFixtures, standings: updatedStandings } });

        // Check if group stage is complete → auto-trigger knockout
        const allGroupPlayed = updatedFixtures.filter((f) => f.stage === 'group').every((f) => f.played);
        if (allGroupPlayed && contState.currentStage === 'group') {
          set({ continentalState: { ...contState, fixtures: updatedFixtures, standings: updatedStandings, currentStage: 'r16' } });
          get().addToast('🏆 Continental group stage complete! Knockout round begins.', 'goal');
        }
      }
    }

    // Scout knowledge accumulation: advance all active scout assignments
    const currentAssignments = get().scoutAssignments;
    if (currentAssignments.length > 0) {
      const updatedAssignments = currentAssignments.map((a) => advanceScoutKnowledge(a));
      set({ scoutAssignments: updatedAssignments });
      const completed = updatedAssignments.filter((a) => a.knowledge >= 100);
      if (completed.length > 0) {
        get().addToast(`🔍 Scout report complete: ${completed.length} player(s) fully scouted.`, 'info');
      }
    }

    // Derby detection: check if user's next fixture is a derby
    const nextFixture = result.league.fixtures.find(
      (f) => !f.played && (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
    );
    if (nextFixture) {
      const opponentId = nextFixture.homeTeamId === userTeamId ? nextFixture.awayTeamId : nextFixture.homeTeamId;
      const opponent = result.league.teams.find((t) => t.id === opponentId);
      const userTeamForDerby = result.league.teams.find((t) => t.id === userTeamId);
      if (opponent && userTeamForDerby && opponent.city === userTeamForDerby.city) {
        get().addToast(`🔥 DERBY MATCH next round vs ${opponent.name}! Expect heightened atmosphere.`, 'goal');
      }
    }

    // === PHASE SYSTEM WIRING (ZenGM-style season loop) ===
    const currentSeasonState = { ...get().seasonState, round: result.league.currentRound };

    // 1. Per-match stats writing
    if (result.userMatchResult && get().matchState) {
      const ms = get().matchState!;
      const userTeam = result.league.teams.find((t) => t.id === userTeamId);
      if (userTeam) {
        const matchStats = userTeam.players.slice(0, 11).map((p) =>
          computePlayerMatchStats(p, userTeamId, ms.id, result.league.currentRound, currentSeasonState.seasonNumber, ms.events, ms.minute)
        );
        // Detect feats
        for (const stat of matchStats) {
          const feats = checkMatchFeats(stat.playerId, stat.playerName, stat);
          for (const feat of feats) {
            get().addToast(feat.message, 'goal');
          }
        }
        set({ allMatchStats: [...get().allMatchStats, ...matchStats].slice(-2000) });
      }
    }

    // 2. AI-to-AI trades (during regular season, before deadline)
    if (currentSeasonState.phase === Phase.REGULAR_SEASON && !isTradeDeadlinePassed(result.league.currentRound, currentSeasonState.totalRounds)) {
      const { teams: tradedTeams, trades } = simulateAITrades(result.league.teams, userTeamId, result.league.currentRound);
      if (trades.length > 0) {
        set({ league: { ...result.league, teams: tradedTeams } });
        get().addToast(`🔄 Transfer: ${trades[0].player} (${trades[0].from} → ${trades[0].to})`, 'info');
      }
    }

    // 3. Trade deadline notification
    if (result.league.currentRound === currentSeasonState.tradeDeadlineRound) {
      get().addToast('🔒 Trade deadline passed — no more transfers until next season.', 'warning');
      set({ seasonState: { ...currentSeasonState, phase: Phase.AFTER_TRADE_DEADLINE } });
    }

    // 4. Phase transitions
    if (shouldTransitionPhase(currentSeasonState)) {
      const nextPhase = getNextPhase(currentSeasonState.phase);

      if (nextPhase === Phase.PLAYOFFS) {
        // Generate playoff bracket
        const bracket = generatePlayoffBracket(result.league.standings);
        set({ playoffBracket: bracket, seasonState: { ...currentSeasonState, phase: Phase.PLAYOFFS, playoffRound: 0 } });
        get().addToast('🏆 Playoffs begin! Top 16 teams compete for the title.', 'goal');
      } else if (nextPhase === Phase.DRAFT) {
        // Generate draft prospects
        const prospects = generateDraftProspects(20);
        set({ seasonState: { ...currentSeasonState, phase: Phase.DRAFT, draftPick: 0 } });
        get().addToast(`📋 Draft: ${prospects.length} prospects available. Your pick is based on final position.`, 'info');
      } else if (nextPhase === Phase.FREE_AGENCY) {
        // Generate free agent pool
        const pool = generateFreeAgentPool(15);
        set({ freeAgentPool: pool, seasonState: { ...currentSeasonState, phase: Phase.FREE_AGENCY, freeAgencyDay: 0 } });
        get().addToast('🆓 Free agency period begins! Unsigned players available.', 'info');
      } else if (nextPhase === Phase.RESIGN_PLAYERS) {
        set({ seasonState: { ...currentSeasonState, phase: Phase.RESIGN_PLAYERS } });
        get().addToast('📝 Re-signing period: negotiate contract extensions with your players.', 'info');
      } else if (nextPhase === Phase.PRESEASON) {
        // === SEASON END: Development + Awards + New Season ===
        // Compute season awards
        const awards = computeAwardsFromStats(get().allMatchStats);
        set({ seasonAwards: awards });
        if (awards.mvp) get().addToast(`🏅 Season MVP: ${awards.mvp.playerName} (${awards.mvp.rating} avg rating)`, 'goal');
        if (awards.topScorer) get().addToast(`⚽ Golden Boot: ${awards.topScorer.playerName} (${awards.topScorer.goals} goals)`, 'goal');

        // Player development (all teams)
        const developedTeams = result.league.teams.map((team) => ({
          ...team,
          players: team.players.map((p) => developSeason(p)),
        }));

        // Career milestones
        const userTeamFinal = developedTeams.find((t) => t.id === userTeamId);
        if (userTeamFinal) {
          for (const p of userTeamFinal.players) {
            const milestones = checkCareerMilestones(p);
            for (const m of milestones) get().addToast(m.message, 'goal');
          }
        }

        // Minimum roster enforcement
        if (userTeamFinal) {
          const { needsPlayers, shortage } = ensureMinimumRoster(userTeamFinal);
          if (needsPlayers) get().addToast(`⚠️ Squad too small! Need ${shortage} more player(s).`, 'warning');
        }

        // New season
        const newSeasonNumber = currentSeasonState.seasonNumber + 1;
        set({
          league: { ...result.league, teams: developedTeams, currentRound: 0 },
          seasonState: createSeasonState(newSeasonNumber, currentSeasonState.totalRounds),
          allMatchStats: [],
          playoffBracket: [],
          freeAgentPool: [],
          seasonComplete: false,
        });
        get().addToast(`🗓️ Season ${newSeasonNumber} begins! Preseason friendlies upcoming.`, 'success');
      }
    } else {
      set({ seasonState: currentSeasonState });
    }

    // Autosave every 5 rounds (#11: debounced) + always at season boundaries
    const finalState = get();
    const shouldSave = finalState.league && finalState.userTeamId &&
      (finalState.league.currentRound % 5 === 0 || get().seasonComplete);
    if (shouldSave && finalState.league && finalState.userTeamId) {
      const saveData = {
        version: 1,
        savedAt: Date.now(),
        league: finalState.league,
        userTeamId: finalState.userTeamId,
        seasonNumber: finalState.seasonNumber,
        board: finalState.board,
        finances: finalState.finances,
        fanSentiment: finalState.fanSentiment,
        training: finalState.training,
        injuries: finalState.injuries,
        seasonHistory: finalState.seasonHistory,
        clubRecords: finalState.clubRecords,
        news: finalState.news,
      };
      // Primary: IndexedDB (async, larger capacity)
      const slot: SaveSlot = {
        id: 'autosave',
        name: `Season ${finalState.seasonNumber} Round ${finalState.league.currentRound}`,
        timestamp: Date.now(),
        seasonNumber: finalState.seasonNumber,
        round: finalState.league.currentRound,
        teamName: finalState.league.teams.find((t) => t.id === finalState.userTeamId)?.name ?? 'Unknown',
        data: saveData,
      };
      saveGame(slot).catch(() => {});
      // Fallback: localStorage (sync, smaller)
      autosave(saveData).catch(() => { /* silent fail — autosave is best-effort */ });
    }
  },

  simToEnd: () => {
    const { league } = get();
    if (!league) return;
    const maxRound = Math.max(...league.fixtures.map((f) => f.round));
    let current = get().league?.currentRound ?? 1;
    while (current <= maxRound) {
      // Auto-resolve user's match too during bulk sim
      const state = get();
      if (!state.league) break;
      const userFixture = state.league.fixtures.find(
        (f) => f.round === state.league!.currentRound && !f.played &&
          (f.homeTeamId === state.userTeamId || f.awayTeamId === state.userTeamId)
      );
      if (userFixture) {
        const home = state.league.teams.find((t) => t.id === userFixture.homeTeamId);
        const away = state.league.teams.find((t) => t.id === userFixture.awayTeamId);
        if (home && away) {
          const result = simulateFastMatch(home, away);
          const updatedFixtures = state.league.fixtures.map((f) =>
            f.id === userFixture.id ? { ...f, played: true, homeGoals: result.homeGoals, awayGoals: result.awayGoals } : f
          );
          const updatedStandings = state.league.standings.map((s) => {
            if (s.teamId === userFixture.homeTeamId) {
              const ns = { ...s, played: s.played + 1, goalsFor: s.goalsFor + result.homeGoals, goalsAgainst: s.goalsAgainst + result.awayGoals };
              if (result.homeGoals > result.awayGoals) { ns.won++; ns.points += 3; }
              else if (result.homeGoals === result.awayGoals) { ns.drawn++; ns.points += 1; }
              else ns.lost++;
              return ns;
            }
            if (s.teamId === userFixture.awayTeamId) {
              const ns = { ...s, played: s.played + 1, goalsFor: s.goalsFor + result.awayGoals, goalsAgainst: s.goalsAgainst + result.homeGoals };
              if (result.awayGoals > result.homeGoals) { ns.won++; ns.points += 3; }
              else if (result.awayGoals === result.homeGoals) { ns.drawn++; ns.points += 1; }
              else ns.lost++;
              return ns;
            }
            return s;
          });
          set({ league: { ...state.league, fixtures: updatedFixtures, standings: updatedStandings } });
        }
      }
      get().advanceRound();
      current = get().league?.currentRound ?? maxRound + 1;
    }

    // Compute season record and update club records
    const finalState = get();
    if (finalState.league && finalState.userTeamId) {
      const record = computeSeasonRecord(finalState.league, finalState.userTeamId, finalState.seasonNumber);
      const updatedClubRecords = updateClubRecords(finalState.clubRecords, record, finalState.league, finalState.userTeamId);
      set({
        seasonComplete: true,
        seasonHistory: [...finalState.seasonHistory, record],
        clubRecords: updatedClubRecords,
      });
      get().addToast(`🏆 Season complete! Champion: ${record.championName}`, 'success');

      // Compute and announce awards
      const awards = computeSeasonAwards(finalState.league);
      if (awards.playerOfTheSeason) {
        get().addToast(`⭐ POTY: ${awards.playerOfTheSeason.name} (${awards.playerOfTheSeason.team})`, 'info');
      }
      if (awards.goldenBoot) {
        get().addToast(`👟 Golden Boot: ${awards.goldenBoot.name} (${awards.goldenBoot.goals} goals)`, 'info');
      }

      // Job offers from other clubs based on performance
      const sorted = [...finalState.league!.standings].sort((a, b) => b.points - a.points);
      const userPosition = sorted.findIndex((s) => s.teamId === finalState.userTeamId) + 1;
      if (userPosition <= 4 && finalState.seasonNumber >= 2) {
        const biggerClubs = finalState.league!.teams
          .filter((t) => t.id !== finalState.userTeamId && t.reputation > (finalState.league!.teams.find((x) => x.id === finalState.userTeamId)?.reputation ?? 0))
          .slice(0, 1);
        if (biggerClubs.length > 0 && Math.random() < 0.4) {
          get().addToast(`📩 Job offer from ${biggerClubs[0].name}! They're impressed by your ${userPosition === 1 ? 'title-winning' : 'top-4'} record.`, 'goal');
        }
      }
    } else {
      set({ seasonComplete: true });
    }
  },

  playUserMatch: (fixtureId: string) => {
    const { league } = get();
    if (!league) return;
    const fixture = league.fixtures.find((f) => f.id === fixtureId);
    if (!fixture) return;
    const home = league.teams.find((t) => t.id === fixture.homeTeamId);
    const away = league.teams.find((t) => t.id === fixture.awayTeamId);
    if (!home || !away) return;
    set({ matchState: initMatchState(home, away), matchHome: home, matchAway: away, isSimulating: false });
  },

  startNewSeason: () => {
    const { league, userTeamId, seasonNumber } = get();
    if (!league || !userTeamId) return;
    const result = startNewSeason(league);
    const userTeam = result.league.teams.find((t) => t.id === userTeamId);
    set({
      league: result.league,
      seasonComplete: false,
      seasonNumber: seasonNumber + 1,
      lastRoundResults: [],
      matchState: null,
      matchHome: null,
      matchAway: null,
      injuries: [],
      suspensions: [],
      training: createTrainingState(),
      mentoringGroups: userTeam ? createMentoringGroups(userTeam) : [],
    });
    get().addToast(`📅 New season started! ${result.youthIntake.length} youth signings, ${result.retiredPlayers.length} retirements.`, 'info');
  },

  requestBudget: (amount: number) => {
    const { board, finances } = get();
    if (!board || !finances) return;
    const decision = requestBudgetIncrease(board.confidence, finances.balance, amount);
    const newConfidence = Math.max(0, board.confidence - decision.confidenceCost);
    set({
      board: { ...board, confidence: newConfidence, transferBudget: decision.approved ? board.transferBudget + amount : board.transferBudget },
    });
    get().addToast(decision.approved ? `✅ ${decision.impact}` : `❌ ${decision.impact}`, decision.approved ? 'success' : 'warning');
  },

  requestFacility: (facility: string) => {
    const { board } = get();
    if (!board) return;
    const currentLevel = facility === 'training' ? board.facilityLevel.training : facility === 'youth' ? board.facilityLevel.youth : board.facilityLevel.stadium;
    const decision = requestFacilityUpgrade(board.confidence, currentLevel, facility);
    const newConfidence = Math.max(0, board.confidence - decision.confidenceCost);
    const newLevels = { ...board.facilityLevel };
    if (decision.approved) {
      if (facility === 'training') newLevels.training++;
      else if (facility === 'youth') newLevels.youth++;
      else newLevels.stadium++;
    }
    set({ board: { ...board, confidence: newConfidence, facilityLevel: newLevels } });
    get().addToast(decision.approved ? `✅ ${decision.impact}` : `❌ ${decision.impact}`, decision.approved ? 'success' : 'warning');
  },

  toggleFatigueBars: () => {
    set((state) => ({ showFatigueBars: !state.showFatigueBars }));
  },

  addToast: (message: string, type: Toast['type']) => {
    const toast: Toast = { id: `toast_${++toastId}`, message, type, timestamp: Date.now() };
    set((state) => ({ toasts: [...state.toasts, toast].slice(-5) }));
    setTimeout(() => get().removeToast(toast.id), 4000);
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

  // Wire 3: Player systems
  checkPlayerLoyalty: (playerId: string) => {
    const { league, userTeamId } = get();
    if (!league || !userTeamId) return false;
    const team = league.teams.find((t) => t.id === userTeamId);
    if (!team) return false;
    const player = team.players.find((p) => p.id === playerId);
    if (!player) return false;
    const isStarter = team.players.slice(0, 11).some((p) => p.id === playerId);
    return shouldRequestTransfer(player, isStarter, player.morale);
  },

  // Wire 4: UI systems
  addInboxNotification: (type: string, title: string, body: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
    const { seasonNumber } = get();
    const msg = createInboxMessage(type as any, title, body, seasonNumber, priority);
    set((state) => ({ news: [msg as unknown as NewsItem, ...state.news].slice(0, 50) }));
  },

  // Wire 5: Systems
  checkSacking: () => {
    const { board, league, userTeamId } = get();
    if (!board || !league || !userTeamId) return;
    const sorted = [...league.standings].sort((a, b) => b.points - a.points);
    const position = sorted.findIndex((s) => s.teamId === userTeamId) + 1;
    if (shouldSackManager(board.confidence, position, league.teams.length)) {
      set({ sacked: true });
      get().addToast('🚪 You have been sacked! The board lost all confidence.', 'error');
    }
  },

  // Wire 6: Systems-2
  hireStaff: (role: string) => {
    const candidates = generateStaffCandidates(role, 3);
    const best = candidates.sort((a, b) => b.rating - a.rating)[0];
    if (best) {
      const newStaff = { id: best.id, name: best.name, role: best.role, nationality: 'England', age: 40, attributes: {} as any, wage: best.wage, contractExpiry: 2028, reputation: best.rating } as unknown as StaffMember;
      set((state) => ({ staff: [...state.staff, newStaff] }));
      get().addToast(`✅ Hired ${best.name} as ${role} (Rating: ${best.rating})`, 'success');
    }
  },

  hireSpecificStaff: (candidate: StaffCandidate) => {
    const newStaff = { id: candidate.id, name: candidate.name, role: candidate.role, nationality: 'England', age: 40, attributes: {} as any, wage: candidate.wage, contractExpiry: 2028, reputation: candidate.rating } as unknown as StaffMember;
    set((state) => ({ staff: [...state.staff, newStaff] }));
    get().addToast(`✅ Hired ${candidate.name} as ${candidate.role} (Rating: ${candidate.rating})`, 'success');
  },

  fireStaff: (staffId: string) => {
    const member = get().staff.find((s) => s.id === staffId);
    set((state) => ({ staff: state.staff.filter((s) => s.id !== staffId) }));
    if (member) get().addToast(`👋 Released ${member.name} from their contract.`, 'info');
  },

  // Wire 7: Systems-3
  signFreeAgent: (playerId: string) => {
    const { league, userTeamId } = get();
    if (!league || !userTeamId) return;
    const team = league.teams.find((t) => t.id === userTeamId);
    if (!team) return;
    if (team.players.length >= MAX_SQUAD_SIZE) {
      get().addToast('❌ Squad is full. Sell players first.', 'warning');
      return;
    }
    const freeAgents = generateFreeAgents(10);
    const agent = freeAgents.find((p) => p.id === playerId);
    if (agent) {
      const updatedTeams = league.teams.map((t) => t.id === userTeamId ? { ...t, players: [...t.players, agent] } : t);
      set({ league: { ...league, teams: updatedTeams } });
      get().addToast(`✅ Signed ${agent.name} on a free transfer!`, 'success');
    }
  },

  signSpecificFreeAgent: (player) => {
    const { league, userTeamId } = get();
    if (!league || !userTeamId) return;
    const team = league.teams.find((t) => t.id === userTeamId);
    if (!team) return;
    if (team.players.length >= MAX_SQUAD_SIZE) {
      get().addToast('❌ Squad is full. Sell players first.', 'warning');
      return;
    }
    const updatedTeams = league.teams.map((t) => t.id === userTeamId ? { ...t, players: [...t.players, player] } : t);
    set({ league: { ...league, teams: updatedTeams } });
    get().addToast(`✅ Signed ${player.name} on a free transfer!`, 'success');
  },

  signYouthProspect: (prospect) => {
    const { league, userTeamId } = get();
    if (!league || !userTeamId) return;
    const team = league.teams.find((t) => t.id === userTeamId);
    if (!team) return;
    if (team.players.length >= MAX_SQUAD_SIZE) {
      get().addToast('❌ Squad is full. Sell players first.', 'warning');
      return;
    }
    const overall = 30 + prospect.potentialRating * 8;
    const newPlayer: import('../types').Player = {
      id: prospect.id,
      name: prospect.name,
      age: prospect.age,
      nationality: prospect.nationality,
      position: prospect.position as import('../types').Player['position'],
      role: 'central_midfielder',
      duty: 'support',
      attributes: {} as any,
      hidden: { loyalty: 10, consistency: 10, versatility: 10, adaptability: 10, ambition: 14, pressure: 10, professionalism: 10, sportsmanship: 10, temperament: 10, injuryProneness: 10, bigGames: 10 },
      personality: 'professional',
      footedness: 'right',
      height: 175,
      weight: 72,
      overall,
      potentialAbility: overall + prospect.potentialRating * 10,
      currentAbility: overall,
      value: prospect.cost,
      wage: Math.round(overall * 50),
      contractExpiry: 2029,
      form: 5,
      fitness: 100,
      morale: 7,
      reputation: 20,
      goals: 0,
      assists: 0,
      appearances: 0,
      yellowCards: 0,
      redCards: 0,
      traits: [],
    };
    const updatedTeams = league.teams.map((t) => t.id === userTeamId ? { ...t, players: [...t.players, newPlayer] } : t);
    set({ league: { ...league, teams: updatedTeams } });
    get().addToast(`✅ Signed youth prospect ${prospect.name} (${prospect.position}, ${prospect.potentialRating}★ potential)`, 'success');
  },

  // Wire 8: Code quality
  saveGameState: () => {
    const state = get();
    saveToLocalStorage('indie-fm-save', {
      league: state.league,
      userTeamId: state.userTeamId,
      seasonNumber: state.seasonNumber,
      board: state.board,
      finances: state.finances,
      fanSentiment: state.fanSentiment,
      training: state.training,
      staff: state.staff,
      injuries: state.injuries,
      suspensions: state.suspensions,
      mentoringGroups: state.mentoringGroups,
      news: state.news,
      seasonHistory: state.seasonHistory,
      clubRecords: state.clubRecords,
      scoutAssignments: state.scoutAssignments,
      continentalState: state.continentalState,
    });
    get().addToast('💾 Game saved.', 'success');
  },

  loadGameState: () => {
    const data = loadFromLocalStorage<any>('indie-fm-save');
    if (data) {
      set({
        league: data.league,
        userTeamId: data.userTeamId,
        seasonNumber: data.seasonNumber,
        board: data.board,
        finances: data.finances,
        fanSentiment: data.fanSentiment,
        training: data.training,
        staff: data.staff ?? [],
        injuries: data.injuries ?? [],
        suspensions: data.suspensions ?? [],
        mentoringGroups: data.mentoringGroups ?? [],
        news: data.news ?? [],
        seasonHistory: data.seasonHistory ?? [],
        clubRecords: data.clubRecords ?? createClubRecords(),
        scoutAssignments: data.scoutAssignments ?? [],
        continentalState: data.continentalState ?? null,
        careerStarted: true,
      });
      get().addToast('📂 Game loaded.', 'success');
    } else {
      get().addToast('❌ No save found.', 'warning');
    }
  },
}));
