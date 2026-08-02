import { useGameStore } from '../store/gameStore';
import { WeatherCondition } from '../simulation/weather-effects';
import { WeatherIcon } from './Icons';

// In-match overlay: fatigue bars (toggleable), momentum bar, weather indicator
export function MatchOverlay() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);
  const matchWeather = useGameStore((s) => s.matchWeather);
  const showFatigueBars = useGameStore((s) => s.showFatigueBars);
  const toggleFatigueBars = useGameStore((s) => s.toggleFatigueBars);

  if (!matchState || !matchHome || !matchAway) return null;
  if (matchState.status === 'pre_match' || matchState.status === 'full_time') return null;

  const weather = matchWeather as WeatherCondition;

  // Compute simple momentum from recent events
  const recentEvents = matchState.events.slice(-20);
  const homeRecent = recentEvents.filter((e) => e.teamId === matchHome.id && e.outcome === 'success').length;
  const awayRecent = recentEvents.filter((e) => e.teamId === matchAway.id && e.outcome === 'success').length;
  const total = homeRecent + awayRecent || 1;
  const homeMomentum = Math.round((homeRecent / total) * 100);
  const awayMomentum = 100 - homeMomentum;
  const momentumDiff = homeMomentum - awayMomentum;
  const mLabel = momentumDiff > 15 ? `${matchHome.shortName} dominating` : momentumDiff > 5 ? `${matchHome.shortName} pressure` : momentumDiff > -5 ? 'Even' : momentumDiff > -15 ? `${matchAway.shortName} pressure` : `${matchAway.shortName} dominating`;
  const mColor = momentumDiff > 5 ? matchHome.colors.primary : momentumDiff < -5 ? matchAway.colors.primary : '#e0e0e0';

  // Fatigue: estimate from minute and position (simplified)
  const fatigueForMinute = Math.min(100, Math.round((matchState.minute / 90) * 70 + 15));

  return (
    <div style={{ position: 'absolute', top: 50, left: 12, right: 12, pointerEvents: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {/* Weather + Momentum bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '3px 8px' }}>
          <WeatherIcon condition={weather} size={16} />
          <span style={{ fontSize: 10, color: '#aaa', textTransform: 'capitalize' }}>{weather.replace('_', ' ')}</span>
        </div>

        {/* Momentum bar */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '3px 8px' }}>
          <span style={{ fontSize: 9, color: matchHome.colors.primary, width: 28 }}>{matchHome.shortName}</span>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.15)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${homeMomentum}%`, background: matchHome.colors.primary, transition: 'width 0.5s' }} />
            <div style={{ width: `${awayMomentum}%`, background: matchAway.colors.primary, transition: 'width 0.5s' }} />
          </div>
          <span style={{ fontSize: 9, color: matchAway.colors.primary, width: 28, textAlign: 'right' }}>{matchAway.shortName}</span>
        </div>
        <span style={{ fontSize: 9, color: mColor, whiteSpace: 'nowrap' }}>{mLabel}</span>

        {/* Fatigue toggle */}
        <button
          onClick={toggleFatigueBars}
          style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, border: '1px solid rgba(255,255,255,0.2)', background: showFatigueBars ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)', color: showFatigueBars ? '#4ade80' : '#888', cursor: 'pointer', pointerEvents: 'auto' }}
        >
          💪 Fatigue
        </button>
      </div>

      {/* Fatigue bars (toggleable) */}
      {showFatigueBars && (
        <div style={{ display: 'flex', gap: 12, pointerEvents: 'none' }}>
          <FatigueColumn label={matchHome.shortName} color={matchHome.colors.primary} fatigue={fatigueForMinute} />
          <FatigueColumn label={matchAway.shortName} color={matchAway.colors.primary} fatigue={fatigueForMinute + Math.round(Math.random() * 5)} />
        </div>
      )}
    </div>
  );
}

function FatigueColumn({ label, color, fatigue }: { label: string; color: string; fatigue: number }) {
  const freshness = 100 - fatigue;
  const barColor = freshness >= 70 ? '#4ade80' : freshness >= 40 ? '#fbbf24' : '#f87171';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.7)', borderRadius: 4, padding: '3px 8px' }}>
      <span style={{ fontSize: 9, color, width: 28 }}>{label}</span>
      <div style={{ width: 50, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.15)', overflow: 'hidden' }}>
        <div style={{ width: `${freshness}%`, height: '100%', background: barColor, borderRadius: 3, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 9, color: barColor }}>{freshness}%</span>
    </div>
  );
}
