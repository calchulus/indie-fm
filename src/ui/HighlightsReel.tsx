import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { MatchEvent } from '../types';

export function HighlightsReel() {
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const keyEvents: MatchEvent[] = matchState
    ? matchState.events.filter((e) => ['goal', 'save', 'yellow_card', 'red_card'].includes(e.type))
    : [];

  // Sort by importance: goals first, then red cards, then saves, then yellows
  const sorted = [...keyEvents].sort((a, b) => {
    const priority = (e: MatchEvent) => e.type === 'goal' ? 0 : e.type === 'red_card' ? 1 : e.type === 'save' ? 2 : 3;
    return priority(a) - priority(b) || a.minute - b.minute;
  });

  const topMoments = sorted.slice(0, 5);

  const advance = useCallback(() => {
    setCurrentIdx((prev) => {
      if (prev >= topMoments.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [topMoments.length]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(advance, 2500);
    return () => clearInterval(timer);
  }, [isPlaying, advance]);

  // Auto-start when match ends
  useEffect(() => {
    if (matchState?.status === 'full_time' && topMoments.length > 0) {
      setCurrentIdx(0);
      setIsPlaying(true);
    }
  }, [matchState?.status, topMoments.length]);

  if (!matchState || matchState.status !== 'full_time' || !matchHome || !matchAway || topMoments.length === 0) return null;

  const current = topMoments[currentIdx];
  const teamColor = (teamId: string) => teamId === matchState.homeTeamId ? matchHome.colors.primary : matchAway.colors.primary;
  const teamName = (teamId: string) => teamId === matchState.homeTeamId ? matchHome.shortName : matchAway.shortName;

  const eventIcon = (type: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'save': return '🧤';
      case 'yellow_card': return '🟨';
      case 'red_card': return '🟥';
      default: return '•';
    }
  };

  return (
    <div style={{
      position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.9)', borderRadius: 10, padding: '12px 20px',
      border: '1px solid rgba(255,255,255,0.15)', minWidth: 320, textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>
        🎬 Match Highlights ({currentIdx + 1}/{topMoments.length})
      </div>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{eventIcon(current.type)}</div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{current.description}</div>
      <div style={{ fontSize: 12, color: '#888' }}>
        {current.minute}' — <span style={{ color: teamColor(current.teamId) }}>{teamName(current.teamId)}</span>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 8 }}>
        {topMoments.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
            background: i === currentIdx ? '#4ade80' : i < currentIdx ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.2)',
          }} onClick={() => { setCurrentIdx(i); setIsPlaying(false); }} />
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 8 }}>
        <button onClick={() => { setCurrentIdx(0); setIsPlaying(true); }} style={{ padding: '3px 10px', fontSize: 11, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 3, color: '#e0e0e0', cursor: 'pointer' }}>⏮ Replay</button>
        <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '3px 10px', fontSize: 11, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 3, color: '#e0e0e0', cursor: 'pointer' }}>{isPlaying ? '⏸ Pause' : '▶ Play'}</button>
        <button onClick={() => setIsPlaying(false)} style={{ padding: '3px 10px', fontSize: 11, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 3, color: '#e0e0e0', cursor: 'pointer' }}>✕ Close</button>
      </div>
    </div>
  );
}
