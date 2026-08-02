import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { createDefaultRoutine, createDefaultDefensiveSetup, generateOppositionInstructions, getSetPieceTaker, evaluateRoutineQuality, SetPieceRoutine, DefensiveSetPiece, OppositionInstruction } from '../simulation/setpieces';
import { computeSocialGroups, createMentoringGroups, computeHierarchy } from '../simulation/dynamics';

export function TacticsAdvanced() {
  const { league, userTeamId } = useGameStore();
  const [subTab, setSubTab] = useState<'setpieces' | 'opposition' | 'dynamics'>('setpieces');
  const [routines] = useState<SetPieceRoutine[]>(() => [
    createDefaultRoutine('corner_left'),
    createDefaultRoutine('corner_right'),
    createDefaultRoutine('free_kick_wide'),
  ]);
  const [defSetup] = useState<DefensiveSetPiece>(() => createDefaultDefensiveSetup('corner'));

  if (!league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const opponent = league.teams.find((t) => t.id !== userTeamId);
  const oppInstructions: OppositionInstruction[] = opponent ? generateOppositionInstructions(opponent) : [];
  const socialGroups = computeSocialGroups(userTeam);
  const mentoringGroups = createMentoringGroups(userTeam);
  const hierarchy = computeHierarchy(userTeam);

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
    color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  });

  const playerName = (id: string) => userTeam.players.find((p) => p.id === id)?.name.split(' ').pop() ?? '?';
  const oppPlayerName = (id: string) => opponent?.players.find((p) => p.id === id)?.name.split(' ').pop() ?? '?';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabBtn(subTab === 'setpieces')} onClick={() => setSubTab('setpieces')}>🎯 Set Pieces</button>
        <button style={tabBtn(subTab === 'opposition')} onClick={() => setSubTab('opposition')}>🛡️ Opposition</button>
        <button style={tabBtn(subTab === 'dynamics')} onClick={() => setSubTab('dynamics')}>👥 Dynamics</button>
      </div>

      {subTab === 'setpieces' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Attacking Routines</h4>
          {routines.map((r) => {
            const taker = getSetPieceTaker(userTeam, 'corner');
            const quality = evaluateRoutineQuality(r, userTeam);
            return (
              <div key={r.id} style={{ padding: '10px 14px', marginBottom: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{r.type.replace(/_/g, ' ')}</span>
                  <span style={{ fontSize: 12, color: quality >= 60 ? '#4ade80' : '#fbbf24' }}>Quality: {quality}%</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                  Taker: {taker?.name.split(' ').pop()} • Delivery: {r.delivery} • Target: {r.targetZone}
                </div>
              </div>
            );
          })}

          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, margin: '16px 0 8px' }}>Defensive Setup</h4>
          <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
            <div style={{ fontSize: 13 }}>Marking: <strong>{defSetup.marking}</strong> • Players on posts: <strong>{defSetup.playersOnPosts}</strong></div>
          </div>
        </div>
      )}

      {subTab === 'opposition' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
            Opposition Instructions {opponent ? `vs ${opponent.name}` : ''}
          </h4>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: '#888', textAlign: 'left' }}>
                <th style={{ padding: '6px 8px' }}>Player</th>
                <th style={{ padding: '6px 8px' }}>Closing Down</th>
                <th style={{ padding: '6px 8px' }}>Tackling</th>
                <th style={{ padding: '6px 8px' }}>Marking</th>
                <th style={{ padding: '6px 8px' }}>Show Onto</th>
              </tr>
            </thead>
            <tbody>
              {oppInstructions.map((inst) => (
                <tr key={inst.opponentPlayerId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '4px 8px' }}>{oppPlayerName(inst.opponentPlayerId)}</td>
                  <td style={{ padding: '4px 8px', color: inst.closingDown === 'always' ? '#f87171' : '#e0e0e0' }}>{inst.closingDown}</td>
                  <td style={{ padding: '4px 8px' }}>{inst.tackling}</td>
                  <td style={{ padding: '4px 8px' }}>{inst.marking}</td>
                  <td style={{ padding: '4px 8px', color: '#60a5fa' }}>{inst.showOntoFoot} foot</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {subTab === 'dynamics' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Social Groups</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {socialGroups.map((g) => (
              <div key={g.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{g.name}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>Influence: {g.influence}</span>
                </div>
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                  Leader: {playerName(g.leaderId)} • {g.memberIds.length} members
                </div>
              </div>
            ))}
          </div>

          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Mentoring Groups</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {mentoringGroups.map((g) => (
              <div key={g.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <div style={{ fontSize: 13 }}>
                  <strong>{playerName(g.mentorIds[0])}</strong> mentoring {g.menteeIds.map((id) => playerName(id)).join(', ')}
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>Focus: {g.focus}</div>
              </div>
            ))}
            {mentoringGroups.length === 0 && <div style={{ color: '#666', fontSize: 13 }}>No eligible mentors (need age 28+, high determination & professionalism).</div>}
          </div>

          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Squad Hierarchy</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {hierarchy.slice(0, 11).map((id, i) => (
              <span key={id} style={{ padding: '4px 10px', fontSize: 12, background: i === 0 ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.05)', borderRadius: 4, border: i === 0 ? '1px solid rgba(251,191,36,0.4)' : '1px solid transparent' }}>
                {i === 0 ? '👑 ' : `${i + 1}. `}{playerName(id)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
