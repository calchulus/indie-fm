import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generateMatchPreview, getMedicalReport, generateCupBracket, generatePostMatchPress, DEFAULT_SCHEDULE, TrainingDay } from '../simulation/medium-features';

// --- Match Preview ---
export function MatchPreviewPanel2() {
  const { league, userTeamId, lastRoundResults } = useGameStore();
  if (!league || !userTeamId) return null;

  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  // Find next opponent from fixtures
  const nextFixture = league.fixtures.find((f) => !f.played && (f.homeTeamId === userTeamId || f.awayTeamId === userTeamId));
  if (!nextFixture) return <div style={{ padding: 16, color: '#888', fontSize: 13 }}>No upcoming fixture.</div>;

  const opponentId = nextFixture.homeTeamId === userTeamId ? nextFixture.awayTeamId : nextFixture.homeTeamId;
  const opponent = league.teams.find((t) => t.id === opponentId);
  if (!opponent) return null;

  const isHome = nextFixture.homeTeamId === userTeamId;
  const preview = generateMatchPreview(
    isHome ? userTeam : opponent,
    isHome ? opponent : userTeam,
    league.standings,
    lastRoundResults,
  );

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📋 Match Preview</h3>
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{preview.homeName} vs {preview.awayName}</div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          {preview.homePosition}th vs {preview.awayPosition}th
        </div>
      </div>

      {/* Form */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, fontSize: 13 }}>
        <div>
          <div style={{ color: '#888', marginBottom: 4 }}>Home Form</div>
          <div>{preview.homeForm.map((f, i) => <span key={i} style={{ color: f === 'W' ? '#4ade80' : f === 'D' ? '#facc15' : '#f87171', marginRight: 4 }}>{f}</span>)}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#888', marginBottom: 4 }}>Away Form</div>
          <div>{preview.awayForm.map((f, i) => <span key={i} style={{ color: f === 'W' ? '#4ade80' : f === 'D' ? '#facc15' : '#f87171', marginRight: 4 }}>{f}</span>)}</div>
        </div>
      </div>

      {/* H2H */}
      <div style={{ padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: 8, marginBottom: 16, fontSize: 12, textAlign: 'center' }}>
        <div style={{ color: '#888', marginBottom: 4 }}>Head to Head</div>
        <div>{preview.headToHead.homeWins}W - {preview.headToHead.draws}D - {preview.headToHead.awayWins}W</div>
      </div>

      {/* Odds */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 13 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888' }}>Home</div>
          <div style={{ fontWeight: 600 }}>{preview.odds.home}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888' }}>Draw</div>
          <div style={{ fontWeight: 600 }}>{preview.odds.draw}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#888' }}>Away</div>
          <div style={{ fontWeight: 600 }}>{preview.odds.away}</div>
        </div>
      </div>

      {/* Predicted XI */}
      <div style={{ marginTop: 16, fontSize: 11, color: '#aaa' }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>Predicted XI ({preview.homeName}):</div>
        <div>{preview.predictedHomeXI.join(', ')}</div>
      </div>
    </div>
  );
}

// --- Medical Center ---
export function MedicalCenter() {
  const { league, userTeamId, injuries } = useGameStore();
  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const report = getMedicalReport(team, league.currentRound, (injuries ?? []) as any[]);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🏥 Medical Center</h3>
      {report.length === 0 && <div style={{ fontSize: 13, color: '#4ade80' }}>✅ No injuries — full squad available.</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {report.map((inj) => (
          <div key={inj.playerId} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 10px', background: 'rgba(248,113,113,0.08)', borderRadius: 6, border: '1px solid rgba(248,113,113,0.2)', fontSize: 12 }}>
            <div>
              <div style={{ fontWeight: 500 }}>{inj.playerName}</div>
              <div style={{ color: '#f87171' }}>{inj.type}</div>
            </div>
            <div style={{ textAlign: 'right', color: '#888' }}>
              <div>{inj.roundsRemaining} round{inj.roundsRemaining !== 1 ? 's' : ''} left</div>
              <div>Return: R{inj.returnRound}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Cup Bracket ---
export function CupBracket() {
  const { league } = useGameStore();
  const [bracket] = useState(() => league ? generateCupBracket(league.teams.slice(0, 16)) : []);

  if (!league) return null;
  const teamName = (id: string) => league.teams.find((t) => t.id === id)?.shortName ?? '?';

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🏆 Cup Competition</h3>
      <div style={{ display: 'flex', gap: 24, overflowX: 'auto' }}>
        {bracket.map((round) => (
          <div key={round.name} style={{ minWidth: 160 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa', marginBottom: 8 }}>{round.name}</div>
            {round.matches.map((m, i) => (
              <div key={i} style={{ padding: '6px 8px', marginBottom: 4, background: 'rgba(255,255,255,0.03)', borderRadius: 4, fontSize: 11, border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>{teamName(m.homeId)}</div>
                <div style={{ color: '#666' }}>vs</div>
                <div>{teamName(m.awayId)}</div>
                {m.winner && <div style={{ color: '#4ade80', marginTop: 2 }}>→ {teamName(m.winner)}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Press Conference Modal ---
export function PressConferenceModal({ onClose }: { onClose: () => void }) {
  const { matchState, matchHome, matchAway, userTeamId, addToast } = useGameStore();
  const [answered, setAnswered] = useState<Set<string>>(new Set());

  if (!matchState || !matchHome || !matchAway || !userTeamId) return null;
  const isUserHome = matchHome.id === userTeamId;
  const questions = generatePostMatchPress(matchState.homeScore, matchState.awayScore, isUserHome);

  const handleAnswer = (qId: string, answerIdx: number) => {
    const q = questions.find((qq) => qq.id === qId);
    if (!q || answered.has(qId)) return;
    const answer = q.answers[answerIdx];
    setAnswered((prev) => new Set([...prev, qId]));
    if (answer.moraleEffect > 0) addToast(`📰 Press: "${answer.text}" — squad morale boosted.`, 'success');
    else if (answer.moraleEffect < 0) addToast(`📰 Press: "${answer.text}" — squad unsettled.`, 'warning');
    else addToast(`📰 Press: "${answer.text}"`, 'info');
  };

  return (
    <div role="dialog" aria-label="Press conference" aria-modal="true" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: '#1e1e2e', borderRadius: 12, padding: 24, maxWidth: 500, width: '90%', border: '1px solid rgba(255,255,255,0.1)' }} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>🎙️ Post-Match Press Conference</h3>
        {questions.map((q) => (
          <div key={q.id} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 8 }}>{q.question}</div>
            {q.answers.map((a, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(q.id, i)}
                disabled={answered.has(q.id)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left', padding: '6px 10px', marginBottom: 4,
                  fontSize: 12, borderRadius: 4, cursor: answered.has(q.id) ? 'default' : 'pointer',
                  background: answered.has(q.id) ? 'rgba(255,255,255,0.03)' : 'rgba(96,165,250,0.1)',
                  border: '1px solid rgba(255,255,255,0.08)', color: answered.has(q.id) ? '#666' : '#e0e0e0',
                }}
              >
                "{a.text}"
              </button>
            ))}
          </div>
        ))}
        <button onClick={onClose} style={{ width: '100%', padding: '8px', fontSize: 12, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#e0e0e0', cursor: 'pointer' }}>
          End Press Conference
        </button>
      </div>
    </div>
  );
}

// --- Training Schedule ---
export function TrainingSchedule() {
  const [schedule, setSchedule] = useState<TrainingDay[]>(DEFAULT_SCHEDULE);
  const focuses: TrainingDay['focus'][] = ['fitness', 'technical', 'tactical', 'mental', 'recovery', 'rest'];
  const intensities: TrainingDay['intensity'][] = ['low', 'medium', 'high'];

  const updateDay = (idx: number, field: 'focus' | 'intensity', value: string) => {
    setSchedule((prev) => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📅 Weekly Training Schedule</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {schedule.map((day, i) => (
          <div key={day.day} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
            <div style={{ width: 32, fontWeight: 600, color: '#60a5fa' }}>{day.day}</div>
            <select value={day.focus} onChange={(e) => updateDay(i, 'focus', e.target.value)} aria-label={`${day.day} focus`} style={{ padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0' }}>
              {focuses.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <select value={day.intensity} onChange={(e) => updateDay(i, 'intensity', e.target.value)} aria-label={`${day.day} intensity`} style={{ padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e0e0e0' }}>
              {intensities.map((int) => <option key={int} value={int}>{int}</option>)}
            </select>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 12, fontSize: 11, color: '#666' }}>
        High intensity improves attributes faster but increases injury risk and fatigue.
        Recovery days restore fitness. Rest days prevent burnout.
      </div>
    </div>
  );
}
