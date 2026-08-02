import { Player, Team } from '../types';

// --- Item 3: Injury enforcement ---

export function getAvailablePlayers(team: Team, injuries: Array<{ playerId: string; weeksOut: number; startedRound: number }>, currentRound: number): Player[] {
  const injuredIds = new Set(
    injuries
      .filter((inj) => currentRound - inj.startedRound < inj.weeksOut)
      .map((inj) => inj.playerId)
  );
  return team.players.filter((p) => !injuredIds.has(p.id));
}

export function isInjured(playerId: string, injuries: Array<{ playerId: string; weeksOut: number; startedRound: number }>, currentRound: number): boolean {
  return injuries.some((inj) => inj.playerId === playerId && currentRound - inj.startedRound < inj.weeksOut);
}

export function getInjuryInfo(playerId: string, injuries: Array<{ playerId: string; type?: string; weeksOut: number; startedRound: number }>, currentRound: number): { type: string; weeksRemaining: number } | null {
  const inj = injuries.find((i) => i.playerId === playerId && currentRound - i.startedRound < i.weeksOut);
  if (!inj) return null;
  return { type: inj.type ?? 'Unknown', weeksRemaining: inj.weeksOut - (currentRound - inj.startedRound) };
}

// --- Item 8: Form-based auto-XI suggestion ---

export function suggestBestXI(team: Team, formation: string, injuries: Array<{ playerId: string; weeksOut: number; startedRound: number }>, currentRound: number): Player[] {
  const available = getAvailablePlayers(team, injuries, currentRound);

  // Score each player: overall * 0.6 + form * 3 + fitness * 0.2
  const scored = available.map((p) => ({
    player: p,
    score: p.overall * 0.6 + p.form * 3 + p.fitness * 0.2,
  }));

  // Formation position requirements
  const formationSlots: Record<string, string[]> = {
    '4-4-2': ['GK', 'LB', 'CB', 'CB', 'RB', 'LW', 'CM', 'CM', 'RW', 'ST', 'ST'],
    '4-3-3': ['GK', 'LB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CAM', 'LW', 'RW', 'ST'],
    '3-5-2': ['GK', 'CB', 'CB', 'CB', 'LB', 'CM', 'CDM', 'CM', 'RB', 'ST', 'ST'],
    '4-2-3-1': ['GK', 'LB', 'CB', 'CB', 'RB', 'CDM', 'CDM', 'LW', 'CAM', 'RW', 'ST'],
    '5-3-2': ['GK', 'LB', 'CB', 'CB', 'CB', 'RB', 'CM', 'CM', 'CAM', 'ST', 'ST'],
  };

  const slots = formationSlots[formation] ?? formationSlots['4-4-2'];
  const selected: Player[] = [];
  const usedIds = new Set<string>();

  for (const pos of slots) {
    // Find best available player for this position
    const candidates = scored
      .filter((s) => !usedIds.has(s.player.id))
      .sort((a, b) => {
        // Prefer natural position, then by score
        const aNatural = a.player.position === pos ? 100 : 0;
        const bNatural = b.player.position === pos ? 100 : 0;
        return (b.score + bNatural) - (a.score + aNatural);
      });

    if (candidates.length > 0) {
      selected.push(candidates[0].player);
      usedIds.add(candidates[0].player.id);
    }
  }

  return selected;
}

// --- Item 9: Market value fluctuation ---

export function updateMarketValues(team: Team): Team {
  const updatedPlayers = team.players.map((p) => {
    let multiplier = 1.0;

    // Form affects value
    if (p.form >= 8) multiplier += 0.1;
    else if (p.form <= 3) multiplier -= 0.1;

    // Age affects value
    if (p.age <= 23) multiplier += 0.05; // Young players appreciate
    else if (p.age >= 32) multiplier -= 0.1; // Older players depreciate

    // Contract situation
    const yearsLeft = p.contractExpiry - 2026;
    if (yearsLeft <= 1) multiplier -= 0.15; // Expiring contract drops value
    else if (yearsLeft >= 3) multiplier += 0.05; // Long contract adds security

    // Fitness
    if (p.fitness < 60) multiplier -= 0.1;

    const newValue = Math.max(100000, Math.round(p.value * multiplier));
    return { ...p, value: newValue };
  });

  return { ...team, players: updatedPlayers };
}

// --- Item 5: Development milestone detection ---

export interface Milestone {
  playerId: string;
  playerName: string;
  type: 'overall_up' | 'wonderkid_breakout' | 'peak_reached' | 'century';
  message: string;
}

export function detectMilestones(beforePlayers: Player[], afterPlayers: Player[]): Milestone[] {
  const milestones: Milestone[] = [];

  for (const after of afterPlayers) {
    const before = beforePlayers.find((p) => p.id === after.id);
    if (!before) continue;

    // Overall increased by 3+
    if (after.overall - before.overall >= 3) {
      milestones.push({
        playerId: after.id,
        playerName: after.name,
        type: 'overall_up',
        message: `📈 ${after.name} has improved significantly! OVR ${before.overall} → ${after.overall}`,
      });
    }

    // Wonderkid breakout (young player jumped 5+ OVR)
    if (after.age <= 21 && after.overall - before.overall >= 5) {
      milestones.push({
        playerId: after.id,
        playerName: after.name,
        type: 'wonderkid_breakout',
        message: `🌟 Wonderkid breakout! ${after.name} (${after.age}y) jumped to ${after.overall} OVR!`,
      });
    }

    // Century (100 appearances)
    if (before.appearances < 100 && after.appearances >= 100) {
      milestones.push({
        playerId: after.id,
        playerName: after.name,
        type: 'century',
        message: `🎉 ${after.name} made their 100th appearance for the club!`,
      });
    }
  }

  return milestones;
}
