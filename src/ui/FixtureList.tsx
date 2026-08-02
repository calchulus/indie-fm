import { useGameStore } from '../store/gameStore';
import { getFormGuide } from '../simulation/season';

export function FixtureList() {
  const { league, userTeamId, advanceRound, simToEnd, playUserMatch, seasonComplete, lastRoundResults, startNewSeason } = useGameStore();

  if (!league) return null;

  const maxRound = Math.max(...league.fixtures.map((f) => f.round));
  const currentRound = league.currentRound;
  const roundFixtures = league.fixtures.filter((f) => f.round === currentRound);
  const userFixture = roundFixtures.find(
    (f) => f.homeTeamId === userTeamId || f.awayTeamId === userTeamId
  );

  const teamName = (id: string) => league.teams.find((t) => t.id === id)?.shortName ?? '?';
  const teamFullName = (id: string) => league.teams.find((t) => t.id === id)?.name ?? '?';

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 4,
    background: 'rgba(255,255,255,0.08)',
    color: '#e0e0e0',
    cursor: 'pointer',
    fontSize: 13,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 15, color: '#e0e0e0' }}>
          Round {currentRound} / {maxRound}
        </h3>
        {!seasonComplete && (
          <>
            <button style={{ ...btnStyle, background: 'rgba(74,222,128,0.2)' }} onClick={advanceRound}>
              ▶ Advance Round
            </button>
            <button style={btnStyle} onClick={simToEnd}>
              ⏩ Sim to End
            </button>
          </>
        )}
        {seasonComplete && (
          <>
            <span style={{ color: '#4ade80', fontWeight: 600 }}>Season Complete 🏆</span>
            <button style={{ ...btnStyle, background: 'rgba(96,165,250,0.3)' }} onClick={startNewSeason}>
              📅 Start New Season
            </button>
          </>
        )}
      </div>

      {userFixture && !userFixture.played && (
        <div style={{
          padding: '10px 14px',
          marginBottom: 16,
          background: 'rgba(96,165,250,0.1)',
          border: '1px solid rgba(96,165,250,0.3)',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <span style={{ fontSize: 13 }}>
            Your match: <strong>{teamFullName(userFixture.homeTeamId)}</strong> vs <strong>{teamFullName(userFixture.awayTeamId)}</strong>
          </span>
          <button
            style={{ ...btnStyle, background: 'rgba(96,165,250,0.3)' }}
            onClick={() => playUserMatch(userFixture.id)}
          >
            🎮 Play Match
          </button>
        </div>
      )}

      {lastRoundResults.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Last Round Results
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 6 }}>
            {lastRoundResults.slice(0, 10).map((r) => (
              <div key={r.fixtureId} style={{
                fontSize: 12,
                padding: '4px 8px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: 4,
              }}>
                {teamName(r.homeTeamId)} <strong>{r.homeGoals} - {r.awayGoals}</strong> {teamName(r.awayTeamId)}
              </div>
            ))}
          </div>
        </div>
      )}

      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
        This Round's Fixtures
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {roundFixtures.map((f) => {
          const isUser = f.homeTeamId === userTeamId || f.awayTeamId === userTeamId;
          return (
            <div key={f.id} style={{
              display: 'flex',
              alignItems: 'center',
              padding: '6px 10px',
              fontSize: 13,
              background: isUser ? 'rgba(96,165,250,0.08)' : 'rgba(255,255,255,0.02)',
              borderRadius: 4,
              border: isUser ? '1px solid rgba(96,165,250,0.2)' : '1px solid transparent',
            }}>
              <span style={{ flex: 1, textAlign: 'right' }}>{teamFullName(f.homeTeamId)}</span>
              <span style={{ width: 60, textAlign: 'center', fontWeight: 600 }}>
                {f.played ? `${f.homeGoals} - ${f.awayGoals}` : 'vs'}
              </span>
              <span style={{ flex: 1 }}>{teamFullName(f.awayTeamId)}</span>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
          Form Guide (last 5)
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {league.teams.slice(0, 10).map((t) => {
            const form = getFormGuide(league, t.id, 5);
            return (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <span style={{ width: 140, color: t.id === userTeamId ? '#60a5fa' : '#ccc' }}>{t.name}</span>
                <div style={{ display: 'flex', gap: 3 }}>
                  {form.map((result, i) => (
                    <span key={i} style={{
                      width: 18,
                      height: 18,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 700,
                      background: result === 'W' ? 'rgba(74,222,128,0.3)' : result === 'D' ? 'rgba(251,191,36,0.3)' : 'rgba(248,113,113,0.3)',
                      color: result === 'W' ? '#4ade80' : result === 'D' ? '#fbbf24' : '#f87171',
                    }}>
                      {result}
                    </span>
                  ))}
                  {form.length === 0 && <span style={{ color: '#666' }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
