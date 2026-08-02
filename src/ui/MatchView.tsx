import { useEffect, useRef } from 'react';
import { PitchScene } from '../visualization/PitchScene';
import { useGameStore } from '../store/gameStore';
import { startCrowdAmbience, setCrowdIntensity, playGoalRoar, playWhistle, stopCrowdAmbience, computeTension } from '../audio/crowd';
import { MatchOverlay } from './MatchOverlay';

export function MatchView() {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<PitchScene | null>(null);
  const matchState = useGameStore((s) => s.matchState);
  const matchHome = useGameStore((s) => s.matchHome);
  const matchAway = useGameStore((s) => s.matchAway);
  const prevScoreRef = useRef({ home: 0, away: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const scene = new PitchScene(containerRef.current);
    scene.start();
    sceneRef.current = scene;
    return () => {
      scene.dispose();
      sceneRef.current = null;
      stopCrowdAmbience();
    };
  }, []);

  // Start crowd ambience when match begins
  useEffect(() => {
    if (matchState && matchState.status === 'first_half') {
      startCrowdAmbience(0.3);
    }
    if (matchState && matchState.status === 'full_time') {
      stopCrowdAmbience();
    }
  }, [matchState?.status]);

  // Update crowd intensity based on tension + play goal roar on goals
  useEffect(() => {
    if (!matchState) return;
    const scoreDiff = matchState.homeScore - matchState.awayScore;
    const isClose = Math.abs(scoreDiff) <= 1;
    const tension = computeTension(matchState.minute, scoreDiff, isClose);
    setCrowdIntensity(tension);

    // Goal roar
    if (matchState.homeScore > prevScoreRef.current.home || matchState.awayScore > prevScoreRef.current.away) {
      playGoalRoar();
    }
    prevScoreRef.current = { home: matchState.homeScore, away: matchState.awayScore };

    // Whistle on kickoff and full time
    const lastEvent = matchState.events[matchState.events.length - 1];
    if (lastEvent?.type === 'kickoff') playWhistle(false);
    if (lastEvent?.type === 'full_time') playWhistle(true);
  }, [matchState]);

  useEffect(() => {
    if (sceneRef.current && matchState && matchHome && matchAway) {
      sceneRef.current.update(matchState, matchHome.colors.primary, matchAway.colors.primary);
    }
  }, [matchState, matchHome, matchAway]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {matchState && (
        <div style={{
          position: 'absolute',
          top: 12,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.8)',
          padding: '8px 20px',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          fontSize: 18,
          fontWeight: 700,
        }}>
          <span style={{ color: matchHome?.colors.primary }}>{matchHome?.shortName}</span>
          <span>{matchState.homeScore} - {matchState.awayScore}</span>
          <span style={{ color: matchAway?.colors.primary }}>{matchAway?.shortName}</span>
          <span style={{ fontSize: 13, color: '#aaa', marginLeft: 8 }}>{matchState.minute}'</span>
        </div>
      )}
      <MatchOverlay />
    </div>
  );
}
