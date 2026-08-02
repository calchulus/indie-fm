import { useGameStore } from '../store/gameStore';
import { League } from '../types';

export function exportLeagueJSON(league: League): string {
  return JSON.stringify(league, null, 2);
}

export function exportPlayersCSV(league: League): string {
  const headers = ['Name', 'Position', 'Age', 'Nationality', 'Overall', 'PA', 'Value', 'Wage', 'Club', 'Contract Expiry'];
  const rows: string[] = [headers.join(',')];

  for (const team of league.teams) {
    for (const p of team.players) {
      rows.push([
        `"${p.name}"`, p.position, p.age, `"${p.nationality}"`,
        p.overall, Math.round(p.potentialAbility / 10),
        p.value, p.wage, `"${team.name}"`, p.contractExpiry,
      ].join(','));
    }
  }
  return rows.join('\n');
}

export function exportStandingsCSV(league: League): string {
  const headers = ['Position', 'Team', 'Played', 'Won', 'Drawn', 'Lost', 'GF', 'GA', 'GD', 'Points'];
  const sorted = [...league.standings].sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst));
  const rows: string[] = [headers.join(',')];

  sorted.forEach((s, i) => {
    const team = league.teams.find((t) => t.id === s.teamId);
    rows.push([
      i + 1, `"${team?.name ?? '?'}"`, s.played, s.won, s.drawn, s.lost,
      s.goalsFor, s.goalsAgainst, s.goalsFor - s.goalsAgainst, s.points,
    ].join(','));
  });
  return rows.join('\n');
}

export function exportMatchStatsCSV(matchState: { homeScore: number; awayScore: number; shots: { home: number; away: number }; shotsOnTarget: { home: number; away: number }; corners: { home: number; away: number }; fouls: { home: number; away: number }; possession: { home: number; away: number } }, homeName: string, awayName: string): string {
  const headers = ['Stat', homeName, awayName];
  const rows: string[] = [headers.join(',')];
  rows.push(['Score', matchState.homeScore, matchState.awayScore].join(','));
  rows.push(['Shots', matchState.shots.home, matchState.shots.away].join(','));
  rows.push(['On Target', matchState.shotsOnTarget.home, matchState.shotsOnTarget.away].join(','));
  rows.push(['Corners', matchState.corners.home, matchState.corners.away].join(','));
  rows.push(['Fouls', matchState.fouls.home, matchState.fouls.away].join(','));
  rows.push(['Possession %', Math.round(matchState.possession.home), Math.round(matchState.possession.away)].join(','));
  return rows.join('\n');
}

function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function DataExport() {
  const { league, matchState, matchHome, matchAway } = useGameStore();

  if (!league) return null;

  const btnStyle: React.CSSProperties = {
    padding: '8px 16px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 6,
    background: 'rgba(255,255,255,0.08)', color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>📤 Data Export</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>📋 Full League (JSON)</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Complete league data including all teams, players, fixtures, and standings.</div>
          <button style={btnStyle} onClick={() => downloadFile(exportLeagueJSON(league), 'indie-fm-league.json', 'application/json')}>Download JSON</button>
        </div>

        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>👥 All Players (CSV)</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Every player in the league with attributes, value, wage, and contract info.</div>
          <button style={btnStyle} onClick={() => downloadFile(exportPlayersCSV(league), 'indie-fm-players.csv', 'text/csv')}>Download CSV</button>
        </div>

        <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>📊 League Table (CSV)</div>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Current standings with points, goal difference, and form.</div>
          <button style={btnStyle} onClick={() => downloadFile(exportStandingsCSV(league), 'indie-fm-standings.csv', 'text/csv')}>Download CSV</button>
        </div>

        {matchState && matchHome && matchAway && (
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>⚽ Match Stats (CSV)</div>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 10 }}>Current match statistics: score, shots, possession, corners, fouls.</div>
            <button style={btnStyle} onClick={() => downloadFile(exportMatchStatsCSV(matchState, matchHome.name, matchAway.name), 'indie-fm-match-stats.csv', 'text/csv')}>Download CSV</button>
          </div>
        )}
      </div>
    </div>
  );
}
