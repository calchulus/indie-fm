import { useState } from 'react';

interface HelpEntry {
  section: string;
  title: string;
  steps: string[];
}

const HELP_ENTRIES: HelpEntry[] = [
  {
    section: 'match',
    title: '⚽ Match Day',
    steps: [
      'Start a match from League → Fixtures → "Play Match", or use "Quick Match" in the controls bar.',
      'Before kickoff: pick your XI (Squad Selection), read the Opposition Report, and deliver a Team Talk.',
      'During the match: use Touchline shouts to adjust tactics live (e.g., "push forward" switches to attacking mentality).',
      'Make substitutions by clicking suggested subs — they swap players in the engine immediately.',
      'After full time: view Player Ratings, Highlights Auto-Reel, and the Replay Timeline.',
      'Keyboard shortcuts: Space = play/pause, 1-4 = simulation speed.',
    ],
  },
  {
    section: 'league',
    title: '📊 League & Fixtures',
    steps: [
      'Fixtures: see all upcoming and past matches. Click "Play Match" on your fixture to play it interactively.',
      '"Advance Round" simulates all AI matches and processes training, injuries, form, finances, and board confidence.',
      '"Sim to End" plays the entire remaining season instantly.',
      'Table: live standings sorted by points → goal difference.',
      'Stats: top scorers, assists, appearances, and cards across the league.',
      'TOTW: Team of the Week is generated after each round based on match performances.',
      'Preview: season predictions (title odds, relegation risk) based on squad strength.',
    ],
  },
  {
    section: 'tactics',
    title: '📋 Tactics',
    steps: [
      'Formation: pick from 10 formations. The visual pitch shows player positions.',
      'Adjust mentality (defensive/balanced/attacking), pressing, tempo, width, and defensive line height.',
      'Presets: one-click tactical setups (Tiki-Taka, Gegenpress, Park the Bus, etc.). Save your own custom presets.',
      'Set Pieces: configure corner/free kick routines and opposition-specific instructions.',
      'Tactics affect the match engine: attacking mentality boosts goal chance but weakens defense.',
      'You can change formation MID-MATCH from the Match → Live tab.',
    ],
  },
  {
    section: 'squad',
    title: '👥 Squad Management',
    steps: [
      'Players: full squad list with 45 attributes, form, fitness, morale, goals, assists.',
      'Planner: depth chart showing gaps per position. Red = needs reinforcement.',
      'Contracts: view expiry dates, renew deals (wage negotiation), or release players.',
      'Growth: development arcs — wonderkids grow fast, veterans decline. Shows projected peak.',
      'Morale: click any player to see WHY they\'re happy/unhappy (playing time, results, contract, form).',
      'Injured players are marked and cannot be selected for matches.',
    ],
  },
  {
    section: 'transfers',
    title: '💰 Transfers',
    steps: [
      'Market: browse all players in the league. Filter by position. Click to view details.',
      'Negotiate: full bid → counter → accept/reject flow. Use the slider to set your bid amount.',
      'After fee is agreed, negotiate wages (player has demands — meet them or they walk).',
      'History: squad market values, wage bill, and transfer activity log.',
      'Deadline: 60-second mini-game — make as many deals as possible before the window closes.',
      'Rumours: AI-generated transfer gossip with likelihood ratings.',
      'Scouting: assign scouts, view star-rated reports. Knowledge improves over rounds.',
      'Report: detailed scouting report with strengths, weaknesses, traits, and recommendation.',
      'Search: global player search by name, position, nationality, or club.',
    ],
  },
  {
    section: 'club',
    title: '🏢 Club Operations',
    steps: [
      'Staff: view coaching staff, their quality ratings, and training assignments.',
      'Training: weekly schedule, familiarity %, fitness concerns, in-form players.',
      'Finances: P&L breakdown (matchday, broadcast, commercial vs wages, operations).',
      'Board: confidence meter, expectations, and financial targets.',
      'Meeting: request budget increases or facility upgrades (success depends on confidence).',
      'Vision: long-term club objectives based on reputation. Changes as you progress.',
      'If board confidence drops to 5 or below, you get SACKED. Game over.',
    ],
  },
  {
    section: 'media',
    title: '📰 Media & Communication',
    steps: [
      'Press: pre-match and post-match press conferences. Choose your tone (positive, aggressive, calm).',
      'Inbox: aggregated notifications — transfer news, match results, board messages, development milestones.',
      'Your press answers affect morale and board confidence.',
    ],
  },
  {
    section: 'compete',
    title: '🏆 Competitions',
    steps: [
      'Cups: domestic cup competition (knockout with extra time and penalties).',
      'Continental: Champions League-style group stage + knockout (top teams qualify).',
      'International: manage national teams, view FIFA rankings, generate international fixtures.',
      'At season end: top teams are promoted, bottom teams relegated (3-tier pyramid).',
    ],
  },
  {
    section: 'profile',
    title: '👤 Manager Profile & Data',
    steps: [
      'Manager: career stats, win rate, trophies, season history, biggest win/loss.',
      'History: past season records + end-of-season awards (POTY, Golden Boot, Team of the Season).',
      'Compare: side-by-side player comparison with SVG radar chart.',
      'Data Hub: xG timeline, PPDA, pass network, heat maps.',
      'Export: download league data as JSON, players/standings as CSV.',
    ],
  },
  {
    section: 'system',
    title: '⚙️ System & Settings',
    steps: [
      'Modes: Create-a-Club, Challenge modes (no signings, youth only, unbeaten, etc.).',
      'Mods: export/import league data as JSON. Full modding API.',
      'Save: manual save/load (IndexedDB), file export/import. Game autosaves every round.',
      'The game autosaves after every "Advance Round" — close and reopen to resume.',
    ],
  },
];

export function HelpGuide({ activeSection }: { activeSection: string }) {
  const [open, setOpen] = useState(false);
  const entry = HELP_ENTRIES.find((e) => e.section === activeSection);

  if (!entry) return null;

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: '3px 8px', fontSize: 11, borderRadius: 4, cursor: 'pointer',
          border: '1px solid rgba(255,255,255,0.15)', background: open ? 'rgba(96,165,250,0.2)' : 'rgba(255,255,255,0.05)',
          color: open ? '#60a5fa' : '#888',
        }}
      >
        ? Help
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', right: 0, zIndex: 1000, marginTop: 6,
          width: 360, maxHeight: 400, overflow: 'auto',
          background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
          padding: '14px 16px', boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#e0e0e0' }}>{entry.title}</div>
          <ol style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entry.steps.map((step, i) => (
              <li key={i} style={{ fontSize: 12, color: '#aaa', lineHeight: 1.5 }}>{step}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

export function FirstTimeGuide() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('indie-fm-guide-v2') === 'true');
  const [step, setStep] = useState(0);

  if (dismissed) return null;

  const steps = [
    { title: 'Welcome to Indie FM! ⚽', body: 'You\'re the manager. Your job: pick a team, win matches, develop players, and keep the board happy. Here\'s a 60-second overview.' },
    { title: '1. Pick Your Club', body: 'Choose from 20 teams with different budgets, reputations, and squad quality. Bigger clubs expect trophies; smaller clubs just want survival.' },
    { title: '2. Play Matches', body: 'Go to League → Fixtures → "Play Match". Before kickoff, set your lineup and deliver a team talk. During the match, use shouts and subs to influence the outcome.' },
    { title: '3. Advance the Season', body: 'Click "Advance Round" to simulate all AI matches. This fires training, injuries, form changes, finances, board confidence, and AI transfers. Or "Sim to End" for the whole season.' },
    { title: '4. Manage Your Squad', body: 'Squad → Planner shows position gaps. Squad → Contracts lets you renew/release. Squad → Growth shows wonderkid trajectories. Injured players can\'t play.' },
    { title: '5. Buy & Sell Players', body: 'Transfers → Negotiate: bid on players, haggle the fee, then agree wages. The AI also trades during transfer windows (rounds 1-3 and mid-season).' },
    { title: '6. Keep the Board Happy', body: 'Club → Board shows confidence. If it hits 5, you\'re sacked. Win matches, meet expectations, and request budget/facility upgrades in Club → Meeting.' },
    { title: '7. Use the ? Help Button', body: 'Every section has a "? Help" button in the sub-nav bar. Click it for contextual tips on what you can do in that section.' },
    { title: 'You\'re Ready! 🎉', body: 'The game autosaves every round. Close and reopen to resume. Check System → Mods for JSON export/import. Good luck, Gaffer!' },
  ];

  const current = steps[step];
  const isLast = step === steps.length - 1;

  const dismiss = () => {
    localStorage.setItem('indie-fm-guide-v2', 'true');
    setDismissed(true);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10001, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 480, width: '90%', background: '#1e1e2e', borderRadius: 12, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>Step {step + 1} of {steps.length}</div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#e0e0e0', margin: '0 0 10px' }}>{current.title}</h2>
        <p style={{ fontSize: 13, color: '#aaa', lineHeight: 1.6, margin: '0 0 20px' }}>{current.body}</p>

        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? '#4ade80' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={dismiss} style={{ padding: '8px 14px', fontSize: 12, background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}>
            Skip tutorial
          </button>
          <div style={{ display: 'flex', gap: 8 }}>
            {step > 0 && (
              <button onClick={() => setStep(step - 1)} style={{ padding: '8px 14px', fontSize: 12, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 6, color: '#e0e0e0', cursor: 'pointer' }}>
                Back
              </button>
            )}
            <button onClick={() => isLast ? dismiss() : setStep(step + 1)} style={{ padding: '8px 18px', fontSize: 12, background: 'rgba(74,222,128,0.25)', border: 'none', borderRadius: 6, color: '#4ade80', cursor: 'pointer', fontWeight: 600 }}>
              {isLast ? 'Start Managing →' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
