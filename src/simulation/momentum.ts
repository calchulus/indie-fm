// Momentum / pressure system
// Consecutive attacks build momentum, boosting the next attack chance.
// Conceding a goal or losing possession resets momentum.

export interface MomentumState {
  home: number;   // 0-100, how much pressure home is applying
  away: number;
  homeStreak: number;  // consecutive attacking ticks
  awayStreak: number;
  lastEventTeam: string | null;
}

export function createMomentum(): MomentumState {
  return { home: 50, away: 50, homeStreak: 0, awayStreak: 0, lastEventTeam: null };
}

// Update momentum after each tick based on who had the event
export function updateMomentum(state: MomentumState, eventTeamId: string | null, homeTeamId: string): MomentumState {
  const next = { ...state };

  if (eventTeamId === null) {
    // Neutral tick — momentum drifts toward 50
    next.home += (50 - next.home) * 0.02;
    next.away += (50 - next.away) * 0.02;
    next.homeStreak = Math.max(0, next.homeStreak - 1);
    next.awayStreak = Math.max(0, next.awayStreak - 1);
    return next;
  }

  const isHome = eventTeamId === homeTeamId;

  if (isHome) {
    next.homeStreak++;
    next.awayStreak = 0;
    // Each consecutive attack builds +3 momentum, capped at 90
    next.home = Math.min(90, next.home + 3);
    next.away = Math.max(10, next.away - 2);
  } else {
    next.awayStreak++;
    next.homeStreak = 0;
    next.away = Math.min(90, next.away + 3);
    next.home = Math.max(10, next.home - 2);
  }

  next.lastEventTeam = eventTeamId;
  return next;
}

// Conceding a goal resets the conceding team's momentum and boosts the scorer
export function applyGoalMomentum(_state: MomentumState, scoringTeamId: string, homeTeamId: string): MomentumState {
  const isHome = scoringTeamId === homeTeamId;
  return {
    home: isHome ? 75 : 25,
    away: isHome ? 25 : 75,
    homeStreak: isHome ? 3 : 0,
    awayStreak: isHome ? 0 : 3,
    lastEventTeam: scoringTeamId,
  };
}

// Get the momentum multiplier for the attacking team
// High momentum = up to +15% attack chance
export function getMomentumMultiplier(momentum: MomentumState, attackingTeamId: string, homeTeamId: string): number {
  const isHome = attackingTeamId === homeTeamId;
  const value = isHome ? momentum.home : momentum.away;
  // 50 = neutral (1.0), 90 = max boost (1.15), 10 = min (0.90)
  return 0.90 + (value / 100) * 0.25;
}

// Get a human-readable momentum label
export function getMomentumLabel(momentum: MomentumState, _homeTeamId: string): { label: string; color: string } {
  const diff = momentum.home - momentum.away;
  if (diff > 20) return { label: 'Home dominating', color: '#4ade80' };
  if (diff > 8) return { label: 'Home building pressure', color: '#86efac' };
  if (diff > -8) return { label: 'Evenly contested', color: '#e0e0e0' };
  if (diff > -20) return { label: 'Away building pressure', color: '#fca5a5' };
  return { label: 'Away dominating', color: '#f87171' };
}

// Compute momentum from a list of recent events (used by tests and UI)
export function computeMomentum(
  events: Array<{ type: string; teamId: string; tick: number; outcome: string }>,
  homeTeamId: string,
  currentTick: number,
): { home: number; away: number; dominant: string } {
  const window = 300; // 5-minute window in ticks
  const recent = events.filter((e) => currentTick - e.tick <= window);

  if (recent.length === 0) {
    return { home: 50, away: 50, dominant: 'even' };
  }

  let homeScore = 0;
  let awayScore = 0;

  for (const evt of recent) {
    const weight = evt.type === 'goal' ? 5 : evt.type === 'shot' ? 2 : evt.type === 'corner' ? 1 : 0.5;
    if (evt.teamId === homeTeamId) homeScore += weight;
    else awayScore += weight;
  }

  const total = homeScore + awayScore;
  const home = Math.round((homeScore / total) * 100);
  const away = 100 - home;
  const diff = home - away;
  const dominant = diff > 10 ? 'home' : diff < -10 ? 'away' : 'even';

  return { home, away, dominant };
}
