import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { createContinentalCompetition, simulateGroupStage, advanceToKnockout, ContinentalCompetition } from '../simulation/international';
import { generateKnockoutBracket, simulateKnockoutRound, isKnockoutComplete, KnockoutBracket } from '../simulation/knockout';
import { getGroupStageQualifiers } from '../simulation/continental-calendar';

export function ContinentalCup() {
  const { league } = useGameStore();
  const [competition, setCompetition] = useState<ContinentalCompetition | null>(null);
  const [bracket, setBracket] = useState<KnockoutBracket | null>(null);

  if (!league) return null;

  const teamName = (id: string) => league.teams.find((t) => t.id === id)?.shortName ?? id.slice(0, 3).toUpperCase();

  const handleCreate = () => {
    const topTeams = [...league.standings]
      .sort((a, b) => b.points - a.points)
      .slice(0, 16)
      .map((s) => s.teamId);
    setCompetition(createContinentalCompetition('Indie Champions League', topTeams));
    setBracket(null);
  };

  const handleSimGroups = () => {
    if (!competition) return;
    setCompetition(simulateGroupStage(competition, league.teams));
  };

  const handleAdvance = () => {
    if (!competition) return;
    const updated = advanceToKnockout(competition);
    setCompetition(updated);
    // Generate knockout bracket from group stage qualifiers
    const qualifiers = getGroupStageQualifiers(updated.groupStage.flatMap((g) => g.standings) as any);
    setBracket(generateKnockoutBracket(qualifiers));
  };

  const handleSimKnockout = () => {
    if (!bracket) return;
    setBracket(simulateKnockoutRound(bracket, league.teams));
  };

  const btnStyle: React.CSSProperties = {
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: 'rgba(74,222,128,0.2)', color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🏆 Continental Competition</h3>

      {!competition && (
        <button style={btnStyle} onClick={handleCreate}>Create Champions League (Top 16)</button>
      )}

      {competition && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {competition.currentPhase === 'group' && (
              <>
                <button style={btnStyle} onClick={handleSimGroups}>▶ Simulate Group Stage</button>
                <button style={{ ...btnStyle, background: 'rgba(96,165,250,0.2)' }} onClick={handleAdvance}>→ Advance to Knockout</button>
              </>
            )}
            {competition.currentPhase === 'knockout' && (
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>Knockout Phase</span>
            )}
          </div>

          {/* Group Stage */}
          {competition.currentPhase === 'group' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
              {competition.groupStage.map((group) => (
                <div key={group.name} style={{ padding: '10px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', marginBottom: 6 }}>{group.name}</div>
                  <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ color: '#888' }}>
                        <th style={{ padding: '2px 4px', textAlign: 'left' }}>Team</th>
                        <th style={{ padding: '2px 4px' }}>P</th>
                        <th style={{ padding: '2px 4px' }}>Pts</th>
                        <th style={{ padding: '2px 4px' }}>GD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.standings.map((s, i) => (
                        <tr key={s.teamId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', color: i < 2 ? '#4ade80' : '#e0e0e0' }}>
                          <td style={{ padding: '2px 4px' }}>{teamName(s.teamId)}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{s.played}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center', fontWeight: 600 }}>{s.points}</td>
                          <td style={{ padding: '2px 4px', textAlign: 'center' }}>{s.gf - s.ga}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}

          {/* Knockout */}
          {competition.currentPhase === 'knockout' && bracket && (
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                {!isKnockoutComplete(bracket) && (
                  <button style={btnStyle} onClick={handleSimKnockout}>▶ Simulate Next Round</button>
                )}
                {bracket.champion && (
                  <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: 14 }}>🏆 Champion: {teamName(bracket.champion)}</span>
                )}
              </div>

              {/* R16 */}
              {bracket.r16.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Round of 16</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                    {bracket.r16.map((tie) => (
                      <div key={tie.id} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, fontSize: 12 }}>
                        {teamName(tie.homeTeamId)} <strong>{tie.aggregateHome}-{tie.aggregateAway}</strong> {teamName(tie.awayTeamId)}
                        {tie.penalties && <span style={{ color: '#fbbf24' }}> (pen {tie.penalties.home}-{tie.penalties.away})</span>}
                        {tie.winnerId && <span style={{ color: '#4ade80' }}> ✓ {teamName(tie.winnerId)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* QF */}
              {bracket.qf.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Quarter-Finals</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                    {bracket.qf.map((tie) => (
                      <div key={tie.id} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, fontSize: 12 }}>
                        {teamName(tie.homeTeamId)} <strong>{tie.aggregateHome}-{tie.aggregateAway}</strong> {teamName(tie.awayTeamId)}
                        {tie.penalties && <span style={{ color: '#fbbf24' }}> (pen {tie.penalties.home}-{tie.penalties.away})</span>}
                        {tie.winnerId && <span style={{ color: '#4ade80' }}> ✓ {teamName(tie.winnerId)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SF */}
              {bracket.sf.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', marginBottom: 6 }}>Semi-Finals</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                    {bracket.sf.map((tie) => (
                      <div key={tie.id} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: 4, fontSize: 12 }}>
                        {teamName(tie.homeTeamId)} <strong>{tie.aggregateHome}-{tie.aggregateAway}</strong> {teamName(tie.awayTeamId)}
                        {tie.penalties && <span style={{ color: '#fbbf24' }}> (pen {tie.penalties.home}-{tie.penalties.away})</span>}
                        {tie.winnerId && <span style={{ color: '#4ade80' }}> ✓ {teamName(tie.winnerId)}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final */}
              {bracket.final && (
                <div style={{ marginBottom: 16 }}>
                  <h4 style={{ fontSize: 12, color: '#fbbf24', textTransform: 'uppercase', marginBottom: 6 }}>Final</h4>
                  <div style={{ padding: '10px 14px', background: 'rgba(251,191,36,0.08)', borderRadius: 6, fontSize: 13, border: '1px solid rgba(251,191,36,0.2)' }}>
                    {teamName(bracket.final.homeTeamId)} <strong>{bracket.final.aggregateHome}-{bracket.final.aggregateAway}</strong> {teamName(bracket.final.awayTeamId)}
                    {bracket.final.penalties && <span style={{ color: '#fbbf24' }}> (pen {bracket.final.penalties.home}-{bracket.final.penalties.away})</span>}
                    {bracket.final.winnerId && <span style={{ color: '#4ade80', fontWeight: 700 }}> 🏆 {teamName(bracket.final.winnerId)}</span>}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
