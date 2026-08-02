import { useState } from 'react';

const STEPS = [
  {
    title: '⚽ Welcome to Indie FM',
    body: 'You\'re the manager. Make tactical decisions, develop players, win trophies. Let\'s get you started.',
  },
  {
    title: '📋 Your Squad',
    body: 'Check the Squad tab to see your players. Each has 45 attributes across technical, mental, and physical categories. Use the Compare tab to evaluate players side-by-side.',
  },
  {
    title: '🎯 Match Day',
    body: 'Go to Fixtures → Play Match to start a game. Before kickoff, pick your XI and review the opposition report. During the match, use shouts and subs. Space bar pauses/plays.',
  },
  {
    title: '📈 Season Progression',
    body: 'Advance rounds to simulate the season. Training improves players, the board watches your results, and fans react to performance. Sim to End plays the whole season instantly.',
  },
  {
    title: '🔧 Make It Yours',
    body: 'Try Create-a-Club in Modes, pick a Challenge, change the theme, or export your league as a mod. Everything is moddable via JSON.',
  },
];

export function OnboardingOverlay() {
  const [step, setStep] = useState(0);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('indie-fm-onboarded') === 'true');

  if (dismissed) return null;

  const finish = () => {
    localStorage.setItem('indie-fm-onboarded', 'true');
    setDismissed(true);
  };

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 10000,
      background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#1e1e2e', borderRadius: 12, padding: '32px 40px', maxWidth: 480,
        border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
      }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>
          Step {step + 1} of {STEPS.length}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#e0e0e0', margin: '0 0 12px' }}>
          {current.title}
        </h2>
        <p style={{ fontSize: 14, color: '#aaa', lineHeight: 1.6, margin: '0 0 24px' }}>
          {current.body}
        </p>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: '50%',
              background: i === step ? '#4ade80' : i < step ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)',
            }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={finish} style={{
            padding: '8px 16px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: 'transparent', color: '#888', fontSize: 13,
          }}>
            Skip
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep((s) => s - 1)} style={{
                padding: '8px 16px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', background: 'transparent', color: '#e0e0e0', fontSize: 13,
              }}>
                Back
              </button>
            )}
            <button onClick={() => isLast ? finish() : setStep((s) => s + 1)} style={{
              padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer',
              background: 'rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 13, fontWeight: 600,
            }}>
              {isLast ? 'Start Managing →' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
