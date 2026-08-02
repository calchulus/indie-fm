import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { isDeadlineDay, generateDeadlineDayDeals } from '../simulation/systems';

export function DeadlineDay() {
  const { league } = useGameStore();
  const [timeLeft, setTimeLeft] = useState(60);
  const [deals, setDeals] = useState<Array<{ playerName: string; fromClub: string; toClub: string; fee: number }>>([]);
  const [isActive, setIsActive] = useState(false);

  const totalRounds = 38;
  const currentRound = league?.currentRound ?? 1;
  const isDeadline = isDeadlineDay(currentRound, totalRounds);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
      // Generate a new deal every 3 seconds
      if (timeLeft % 3 === 0 && league) {
        const newDeals = generateDeadlineDayDeals(league.teams, 1);
        setDeals((prev) => [...newDeals, ...prev].slice(0, 20));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isActive, timeLeft, league]);

  const startDeadlineDay = () => {
    if (!league) return;
    setDeals(generateDeadlineDayDeals(league.teams, 5));
    setTimeLeft(60);
    setIsActive(true);
  };

  if (!isDeadline) {
    return (
      <div style={{ padding: '12px 16px' }}>
        <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>⏰ Deadline Day</h3>
        <div style={{ fontSize: 13, color: '#888' }}>
          Transfer deadline day occurs at rounds 4 and {Math.floor(totalRounds / 2) + 2}. Current round: {currentRound}.
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>⏰ Deadline Day Drama</h3>

      {!isActive ? (
        <button onClick={startDeadlineDay} style={{ padding: '10px 20px', background: 'rgba(248,113,113,0.2)', border: 'none', borderRadius: 6, color: '#f87171', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
          🚨 Start Deadline Day Drama
        </button>
      ) : (
        <>
          {/* Countdown */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: timeLeft <= 10 ? '#f87171' : '#e0e0e0', fontVariantNumeric: 'tabular-nums' }}>
              {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>Time remaining</div>
          </div>

          {/* Deals feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {deals.map((deal, i) => (
              <div key={i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, fontSize: 12, animation: 'fadeIn 0.3s ease-in' }}>
                <span style={{ fontWeight: 600 }}>{deal.playerName}</span>
                <span style={{ color: '#888' }}> — {deal.fromClub} → {deal.toClub}</span>
                <span style={{ color: '#4ade80', marginLeft: 8 }}>£{(deal.fee / 1_000_000).toFixed(1)}M</span>
              </div>
            ))}
          </div>

          {timeLeft <= 0 && (
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#f87171', fontWeight: 600 }}>
              ⏰ Window closed! {deals.length} deals completed.
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
