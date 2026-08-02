import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { suggestBestXI, getAvailablePlayers } from '../simulation/gameplay-systems';

type MatchdayPhase = 'lineup' | 'pre_match' | 'in_match' | 'post_match' | 'done';

export function GuidedMatchday() {
  const { league, userTeamId, matchState, startMatch, simMinutes, advanceRound, injuries } = useGameStore();
  const [phase, setPhase] = useState<MatchdayPhase>('lineup');

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  // Find user's next fixture
  const nextFixture = league.fixtures.find(
    (f) => !f.played && (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId)
  );

  if (!nextFixture) {
    return <div style={{ padding: 20, color: '#888', textAlign: 'center' }}>No upcoming fixtures. Advance the season or sim to end.</div>;
  }

  const isHome = nextFixture.homeTeamId === userTeamId;
  const opponentId = isHome ? nextFixture.awayTeamId : nextFixture.homeTeamId;
  const opponent = league.teams.find((t) => t.id === opponentId);
  if (!opponent) return null;

  const currentRound = league.currentRound;
  const available = getAvailablePlayers(userTeam, injuries, currentRound);
  const suggestedXI = suggestBestXI(userTeam, userTeam.tactics.formation, injuries, currentRound);

  const handleStartMatch = () => {
    // Actually set the starting XI by reordering the team's players array
    if (suggestedXI.length === 11) {
      const bench = userTeam.players.filter((p) => !suggestedXI.some((xi) => xi.id === p.id));
      const reorderedPlayers = [...suggestedXI, ...bench];
      const updatedTeams = league.teams.map((t) =>
        t.id === userTeamId ? { ...t, players: reorderedPlayers } : t
      );
      useGameStore.setState({ league: { ...league, teams: updatedTeams } });
    }
    startMatch(nextFixture.homeTeamId, nextFixture.awayTeamId);
    setPhase('in_match');
  };

  const handleSimMatch = () => {
    if (!matchState) return;
    simMinutes(90);
    setPhase('post_match');
  };

  const handleNextRound = () => {
    advanceRound();
    setPhase('lineup');
  };

  const btnStyle: React.CSSProperties = {
    padding: '10px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
    fontSize: 13, fontWeight: 600,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📅 Matchday — Round {currentRound}</h3>

      {/* Fixture header */}
      <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>
          <span style={{ color: isHome ? userTeam.colors.primary : opponent.colors.primary }}>{isHome ? userTeam.name : opponent.name}</span>
          <span style={{ color: '#888', margin: '0 12px' }}>vs</span>
          <span style={{ color: isHome ? opponent.colors.primary : userTeam.colors.primary }}>{isHome ? opponent.name : userTeam.name}</span>
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          {isHome ? `Home at ${userTeam.stadium}` : `Away at ${opponent.stadium}`} • {opponent.city === userTeam.city ? '🔥 DERBY' : 'League Match'}
        </div>
      </div>

      {/* Phase: Lineup */}
      {phase === 'lineup' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Step 1: Confirm Lineup</h4>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
            Suggested XI based on form, fitness, and position ({userTeam.tactics.formation}):
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
            {suggestedXI.map((p, i) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, fontSize: 12 }}>
                <span style={{ color: '#888', width: 16 }}>{i + 1}</span>
                <span style={{ color: '#60a5fa', width: 30 }}>{p.position}</span>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ color: '#888' }}>OVR {p.overall}</span>
                <span style={{ color: p.fitness >= 80 ? '#4ade80' : p.fitness >= 60 ? '#fbbf24' : '#f87171' }}>{p.fitness}%</span>
                <span style={{ color: '#fbbf24' }}>Form {p.form}/10</span>
              </div>
            ))}
          </div>
          {available.length < 11 && (
            <div style={{ fontSize: 12, color: '#f87171', marginBottom: 12 }}>⚠️ Only {available.length} players available (injuries).</div>
          )}
          <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.25)', color: '#4ade80' }} onClick={() => setPhase('pre_match')}>
            Confirm Lineup →
          </button>
        </div>
      )}

      {/* Phase: Pre-match */}
      {phase === 'pre_match' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Step 2: Pre-Match Prep</h4>
          <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16 }}>
            <div style={{ fontSize: 13, marginBottom: 8 }}>Opponent: <strong style={{ color: opponent.colors.primary }}>{opponent.name}</strong></div>
            <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6 }}>
              Formation: {opponent.tactics.formation} • Mentality: {opponent.tactics.mentality}<br />
              Avg OVR: {Math.round(opponent.players.slice(0, 11).reduce((s, p) => s + p.overall, 0) / 11)}<br />
              {opponent.city === userTeam.city ? '🔥 Derby match — expect heightened aggression and cards.' : ''}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.25)', color: '#4ade80' }} onClick={handleStartMatch}>
              ⚽ Kick Off →
            </button>
            <button style={{ ...btnStyle, background: 'rgba(255,255,255,0.08)', color: '#888' }} onClick={() => setPhase('lineup')}>
              ← Back
            </button>
          </div>
        </div>
      )}

      {/* Phase: In-match */}
      {phase === 'in_match' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#60a5fa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Step 3: Match In Progress</h4>
          {matchState && (
            <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 700 }}>{matchState.homeScore} - {matchState.awayScore}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{matchState.minute}' — {matchState.status.replace(/_/g, ' ')}</div>
            </div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...btnStyle, background: 'rgba(96,165,250,0.25)', color: '#60a5fa' }} onClick={handleSimMatch}>
              ⏩ Sim to Full Time
            </button>
            <div style={{ fontSize: 11, color: '#888', alignSelf: 'center' }}>
              (Or use Match → Live tab for interactive play with shouts/subs)
            </div>
          </div>
        </div>
      )}

      {/* Phase: Post-match */}
      {phase === 'post_match' && matchState && (
        <div>
          <h4 style={{ fontSize: 12, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Step 4: Full Time</h4>
          <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{matchState.homeScore} - {matchState.awayScore}</div>
            <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
              {matchState.homeScore > matchState.awayScore ? (isHome ? '🎉 Home Win!' : '😞 Away Loss') :
               matchState.homeScore < matchState.awayScore ? (isHome ? '😞 Home Loss' : '🎉 Away Win!') : '🤝 Draw'}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
              Shots: {matchState.shots.home}-{matchState.shots.away} • Corners: {matchState.corners.home}-{matchState.corners.away}
            </div>
          </div>
          <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.25)', color: '#4ade80' }} onClick={handleNextRound}>
            Continue to Next Round →
          </button>
        </div>
      )}
    </div>
  );
}
