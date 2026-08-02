import { useGameStore } from '../store/gameStore';
import { getFamiliarityLabel } from '../simulation/training';

export function TrainingReport() {
  const { training, league, userTeamId } = useGameStore();

  if (!training || !league || !userTeamId) return null;
  const userTeam = league.teams.find((t) => t.id === userTeamId);
  if (!userTeam) return null;

  const familiarityLabel = getFamiliarityLabel(training.familiarity);
  const avgFitness = Math.round(userTeam.players.reduce((s, p) => s + p.fitness, 0) / userTeam.players.length);
  const lowFitness = userTeam.players.filter((p) => p.fitness < 60);
  const highForm = userTeam.players.filter((p) => p.form >= 8);

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🏋️ Training Report</h3>

      {/* Key metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: training.familiarity >= 70 ? '#4ade80' : '#fbbf24' }}>{Math.round(training.familiarity)}%</div>
          <div style={{ fontSize: 10, color: '#888' }}>Familiarity ({familiarityLabel})</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: avgFitness >= 80 ? '#4ade80' : avgFitness >= 60 ? '#fbbf24' : '#f87171' }}>{avgFitness}%</div>
          <div style={{ fontSize: 10, color: '#888' }}>Avg Fitness</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0' }}>{training.weeklyRating}/10</div>
          <div style={{ fontSize: 10, color: '#888' }}>Weekly Rating</div>
        </div>
        <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e0e0e0', textTransform: 'capitalize' }}>{training.intensity}</div>
          <div style={{ fontSize: 10, color: '#888' }}>Intensity</div>
        </div>
      </div>

      {/* Weekly schedule */}
      <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>This Week's Schedule</h4>
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ color: '#888', textAlign: 'left' }}>
            <th style={{ padding: '4px 8px' }}>Day</th>
            <th style={{ padding: '4px 8px' }}>Morning</th>
            <th style={{ padding: '4px 8px' }}>Afternoon</th>
          </tr>
        </thead>
        <tbody>
          {training.schedule.map((day) => (
            <tr key={day.day} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <td style={{ padding: '4px 8px', fontWeight: 600 }}>{day.day}</td>
              <td style={{ padding: '4px 8px', color: day.morning === 'rest' ? '#666' : '#e0e0e0', textTransform: 'capitalize' }}>{day.morning}</td>
              <td style={{ padding: '4px 8px', color: day.afternoon === 'rest' ? '#666' : '#e0e0e0', textTransform: 'capitalize' }}>{day.afternoon}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Fitness concerns */}
      {lowFitness.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ fontSize: 12, color: '#f87171', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>⚠️ Fitness Concerns</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {lowFitness.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(248,113,113,0.05)', borderRadius: 4, fontSize: 12 }}>
                <span style={{ color: '#60a5fa', width: 28 }}>{p.position}</span>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ color: '#f87171' }}>{p.fitness}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In-form players */}
      {highForm.length > 0 && (
        <div>
          <h4 style={{ fontSize: 12, color: '#4ade80', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>🔥 In Great Form</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {highForm.map((p) => (
              <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: 'rgba(74,222,128,0.05)', borderRadius: 4, fontSize: 12 }}>
                <span style={{ color: '#60a5fa', width: 28 }}>{p.position}</span>
                <span style={{ flex: 1 }}>{p.name}</span>
                <span style={{ color: '#4ade80' }}>Form: {p.form}/10</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
