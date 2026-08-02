import { Team, Player, Position } from '../types';
import { generatePlayer } from '../data/generators';

export interface TransferListing {
  player: Player;
  fromTeamId: string;
  askingPrice: number;
  type: 'transfer' | 'loan' | 'free';
}

export interface TransferBid {
  playerId: string;
  fromTeamId: string;
  toTeamId: string;
  amount: number;
  type: 'transfer' | 'loan';
  status: 'pending' | 'accepted' | 'rejected';
}

export function getTransferMarket(teams: Team[], userTeamId: string): TransferListing[] {
  const listings: TransferListing[] = [];

  for (const team of teams) {
    if (team.id === userTeamId) continue;
    const squad = team.players;
    const bench = squad.slice(11);
    for (const player of bench) {
      const askingPrice = Math.round(player.value * (0.8 + Math.random() * 0.6));
      listings.push({
        player,
        fromTeamId: team.id,
        askingPrice,
        type: player.age > 32 ? 'free' : 'transfer',
      });
    }
  }

  return listings.sort((a, b) => b.player.overall - a.player.overall);
}

export function evaluateBid(bid: TransferBid, sellingTeam: Team): boolean {
  const player = sellingTeam.players.find((p) => p.id === bid.playerId);
  if (!player) return false;

  if (bid.type === 'loan') {
    return Math.random() < 0.7;
  }

  const fairValue = player.value;
  const ratio = bid.amount / fairValue;

  if (ratio >= 1.3) return true;
  if (ratio >= 1.0) return Math.random() < 0.7;
  if (ratio >= 0.8) return Math.random() < 0.3;
  return Math.random() < 0.05;
}

export function executeTransfer(
  player: Player,
  fromTeam: Team,
  toTeam: Team,
  fee: number,
): { fromTeam: Team; toTeam: Team } {
  const updatedFrom = {
    ...fromTeam,
    players: fromTeam.players.filter((p) => p.id !== player.id),
    budget: fromTeam.budget + fee,
  };

  const updatedTo = {
    ...toTeam,
    players: [...toTeam.players, player],
    budget: toTeam.budget - fee,
  };

  return { fromTeam: updatedFrom, toTeam: updatedTo };
}

export function executeLoan(
  player: Player,
  fromTeam: Team,
  toTeam: Team,
): { fromTeam: Team; toTeam: Team } {
  const updatedFrom = {
    ...fromTeam,
    players: fromTeam.players.filter((p) => p.id !== player.id),
  };

  const updatedTo = {
    ...toTeam,
    players: [...toTeam.players, { ...player }],
  };

  return { fromTeam: updatedFrom, toTeam: updatedTo };
}

export function generateYouthIntake(_team: Team, count: number = 3): Player[] {
  const positions: Position[] = ['CB', 'CM', 'LW', 'ST', 'RB', 'CDM'];
  const youth: Player[] = [];
  for (let i = 0; i < count; i++) {
    const pos = positions[Math.floor(Math.random() * positions.length)];
    const potential = 45 + Math.floor(Math.random() * 30);
    const player = generatePlayer(pos, potential);
    player.age = 16 + Math.floor(Math.random() * 3);
    player.value = Math.round(player.overall * player.overall * 200);
    player.wage = Math.round(player.overall * 50);
    youth.push(player);
  }
  return youth;
}

export function aiTransferWindow(teams: Team[], userTeamId: string): Team[] {
  const updated = teams.map((t) => ({ ...t, players: [...t.players] }));

  for (const team of updated) {
    if (team.id === userTeamId) continue;
    if (Math.random() > 0.3) continue;

    const squad = team.players;
    if (squad.length <= 14) continue;

    const weakest = [...squad].sort((a, b) => a.overall - b.overall)[0];
    const idx = squad.findIndex((p) => p.id === weakest.id);
    if (idx >= 0 && idx >= 11) {
      squad.splice(idx, 1);
    }

    if (Math.random() < 0.5 && team.budget > 5_000_000) {
      const pos = weakest.position;
      const quality = 50 + Math.floor(Math.random() * 25);
      const newPlayer = generatePlayer(pos, quality);
      const cost = newPlayer.value;
      if (cost < team.budget) {
        squad.push(newPlayer);
        team.budget -= cost;
      }
    }
  }

  return updated;
}
