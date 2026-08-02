import { League } from '../types';

export interface AITransferActivity {
  round: number;
  transfers: Array<{
    playerId: string;
    playerName: string;
    fromClubId: string;
    fromClubName: string;
    toClubId: string;
    toClubName: string;
    fee: number;
  }>;
}

export function simulateAITransferWindow(league: League, userTeamId: string, round: number): { league: League; activity: AITransferActivity } {
  const transfers: AITransferActivity['transfers'] = [];
  const teams = league.teams.map((t) => ({ ...t, players: [...t.players] }));

  // Each AI club has a chance to make 0-2 transfers per window
  for (const team of teams) {
    if (team.id === userTeamId) continue;
    if (Math.random() > 0.4) continue; // 40% chance of activity

    const numTransfers = Math.random() < 0.3 ? 2 : 1;

    for (let i = 0; i < numTransfers; i++) {
      // Find a player to sell (bench players, low overall)
      const bench = team.players.slice(11).sort((a, b) => a.overall - b.overall);
      if (bench.length === 0) continue;
      const seller = bench[0];

      // Find a buyer (club that needs that position)
      const buyers = teams.filter((t) => t.id !== team.id && t.id !== userTeamId && t.budget > seller.value);
      if (buyers.length === 0) continue;
      const buyer = buyers[Math.floor(Math.random() * buyers.length)];

      // Execute transfer
      const fee = Math.round(seller.value * (0.8 + Math.random() * 0.4));

      const sellerIdx = team.players.findIndex((p) => p.id === seller.id);
      if (sellerIdx >= 0) {
        team.players.splice(sellerIdx, 1);
        team.budget += fee;
      }

      buyer.players.push({ ...seller });
      buyer.budget -= fee;

      transfers.push({
        playerId: seller.id,
        playerName: seller.name,
        fromClubId: team.id,
        fromClubName: team.name,
        toClubId: buyer.id,
        toClubName: buyer.name,
        fee,
      });
    }
  }

  return { league: { ...league, teams }, activity: { round, transfers } };
}

export function isTransferWindow(round: number, totalRounds: number): boolean {
  // Windows at rounds 1-3 (pre-season) and mid-season (round totalRounds/2 ± 1)
  const midSeason = Math.floor(totalRounds / 2);
  return round <= 3 || (round >= midSeason - 1 && round <= midSeason + 1);
}
