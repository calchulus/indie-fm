import { League } from '../types';

export interface TransferRumour {
  id: string;
  playerName: string;
  playerPosition: string;
  fromClub: string;
  toClub: string;
  fee: string;
  likelihood: 'confirmed' | 'likely' | 'possible' | 'unlikely' | 'speculation';
  source: string;
}

const SOURCES = ['IndieFM News', 'Transfer Insider', 'The Daily Ball', 'Football Whispers', 'Agent Sources', 'Club Sources'];
const LIKELIHOODS: TransferRumour['likelihood'][] = ['confirmed', 'likely', 'possible', 'unlikely', 'speculation'];

export function generateTransferRumours(league: League, _userTeamId: string, count: number = 8): TransferRumour[] {
  const rumours: TransferRumour[] = [];
  const teams = league.teams;

  for (let i = 0; i < count; i++) {
    const fromTeam = teams[Math.floor(Math.random() * teams.length)];
    let toTeam = teams[Math.floor(Math.random() * teams.length)];
    while (toTeam.id === fromTeam.id) {
      toTeam = teams[Math.floor(Math.random() * teams.length)];
    }

    const player = fromTeam.players[Math.floor(Math.random() * fromTeam.players.length)];
    const feeMultiplier = 0.7 + Math.random() * 0.8;
    const fee = Math.round(player.value * feeMultiplier);
    const likelihood = LIKELIHOODS[Math.floor(Math.random() * LIKELIHOODS.length)];

    rumours.push({
      id: `rumour_${i}_${Date.now()}`,
      playerName: player.name,
      playerPosition: player.position,
      fromClub: fromTeam.name,
      toClub: toTeam.name,
      fee: fee > 1_000_000 ? `£${(fee / 1_000_000).toFixed(1)}M` : `£${(fee / 1000).toFixed(0)}k`,
      likelihood,
      source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
    });
  }

  return rumours;
}

export function getLikelihoodColor(likelihood: TransferRumour['likelihood']): string {
  switch (likelihood) {
    case 'confirmed': return '#4ade80';
    case 'likely': return '#a3e635';
    case 'possible': return '#fbbf24';
    case 'unlikely': return '#fb923c';
    case 'speculation': return '#888';
  }
}

export function getLikelihoodLabel(likelihood: TransferRumour['likelihood']): string {
  switch (likelihood) {
    case 'confirmed': return '✅ Done Deal';
    case 'likely': return '🟢 Likely';
    case 'possible': return '🟡 Possible';
    case 'unlikely': return '🟠 Unlikely';
    case 'speculation': return '⚪ Speculation';
  }
}
