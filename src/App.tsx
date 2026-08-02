import { useEffect, useState, lazy, Suspense } from 'react';
import { useGameStore } from './store/gameStore';
import { MatchControls } from './ui/MatchControls';
import { ToastContainer } from './ui/ToastContainer';
import { InMatchPanel } from './ui/InMatchPanel';
import { PostMatchSummary } from './ui/PostMatchSummary';
import { MatchHighlights } from './ui/MatchHighlights';
import { ErrorBoundary } from './ui/ErrorBoundary';
import { MomentumBar } from './ui/MomentumBar';
import { SquadSelection } from './ui/SquadSelection';
import { OppositionReport } from './ui/OppositionReport';
import { MatchPreviewPanel } from './ui/MatchPreviewPanel';
import { PreMatchTalk } from './ui/PreMatchTalk';
import { HighlightsReel } from './ui/HighlightsReel';
import { CareerSetup } from './ui/CareerSetup';
import { HelpGuide, FirstTimeGuide } from './ui/HelpGuide';
import { useKeyboardNav, KeyboardShortcutsModal } from './ui/KeyboardNav';
import { LANGUAGES, getLanguage, setLanguage, Language } from './i18n/translations';
import { SECTION_ICONS } from './ui/Icons';

const MatchView = lazy(() => import('./ui/MatchView').then((m) => ({ default: m.MatchView })));
const FixtureList = lazy(() => import('./ui/FixtureList').then((m) => ({ default: m.FixtureList })));
const TacticsEditor = lazy(() => import('./ui/TacticsEditor').then((m) => ({ default: m.TacticsEditor })));
const TacticsAdvanced = lazy(() => import('./ui/TacticsAdvanced').then((m) => ({ default: m.TacticsAdvanced })));
const TeamSheet = lazy(() => import('./ui/TeamSheet').then((m) => ({ default: m.TeamSheet })));
const TransferCenter = lazy(() => import('./ui/TransferCenter').then((m) => ({ default: m.TransferCenter })));
const ScoutingScreen = lazy(() => import('./ui/ScoutingScreen').then((m) => ({ default: m.ScoutingScreen })));
const StaffTraining = lazy(() => import('./ui/StaffTraining').then((m) => ({ default: m.StaffTraining })));
const LeagueTable = lazy(() => import('./ui/LeagueTable').then((m) => ({ default: m.LeagueTable })));
const Competitions = lazy(() => import('./ui/Competitions').then((m) => ({ default: m.Competitions })));
const DataHub = lazy(() => import('./ui/DataHub').then((m) => ({ default: m.DataHub })));
const BoardFinances = lazy(() => import('./ui/BoardFinances').then((m) => ({ default: m.BoardFinances })));
const MediaCenter = lazy(() => import('./ui/MediaCenter').then((m) => ({ default: m.MediaCenter })));
const GameModes = lazy(() => import('./ui/GameModes').then((m) => ({ default: m.GameModes })));
const ModManager = lazy(() => import('./ui/ModManager').then((m) => ({ default: m.ModManager })));
const SaveLoadPanel = lazy(() => import('./ui/SaveLoadPanel').then((m) => ({ default: m.SaveLoadPanel })));
const EventFeed = lazy(() => import('./ui/EventFeed').then((m) => ({ default: m.EventFeed })));
const PlayerComparison = lazy(() => import('./ui/PlayerComparison').then((m) => ({ default: m.PlayerComparison })));
const SeasonHistory = lazy(() => import('./ui/SeasonHistory').then((m) => ({ default: m.SeasonHistory })));
const SeasonAwardsScreen = lazy(() => import('./ui/SeasonAwardsScreen').then((m) => ({ default: m.SeasonAwardsScreen })));
const InternationalManagement = lazy(() => import('./ui/InternationalManagement').then((m) => ({ default: m.InternationalManagement })));
const ContinentalCup = lazy(() => import('./ui/ContinentalCup').then((m) => ({ default: m.ContinentalCup })));
const DevelopmentPanel = lazy(() => import('./ui/DevelopmentPanel').then((m) => ({ default: m.DevelopmentPanel })));
const PlayerSearch = lazy(() => import('./ui/PlayerSearch').then((m) => ({ default: m.PlayerSearch })));
const TacticPresets = lazy(() => import('./ui/TacticPresets').then((m) => ({ default: m.TacticPresets })));
const NotificationInbox = lazy(() => import('./ui/NotificationInbox').then((m) => ({ default: m.NotificationInbox })));
const MatchReplay = lazy(() => import('./ui/MatchReplay').then((m) => ({ default: m.MatchReplay })));
const DataExport = lazy(() => import('./ui/DataExport').then((m) => ({ default: m.DataExport })));
const BoardMeeting = lazy(() => import('./ui/BoardMeeting').then((m) => ({ default: m.BoardMeeting })));
const ContractsPanel = lazy(() => import('./ui/ContractsPanel').then((m) => ({ default: m.ContractsPanel })));
const TacticalAnalysis = lazy(() => import('./ui/TacticalAnalysis').then((m) => ({ default: m.TacticalAnalysis })));
const SeasonPreview = lazy(() => import('./ui/SeasonPreview').then((m) => ({ default: m.SeasonPreview })));
const DeadlineDay = lazy(() => import('./ui/DeadlineDay').then((m) => ({ default: m.DeadlineDay })));
const TeamOfTheWeekPanel = lazy(() => import('./ui/TeamOfTheWeekPanel').then((m) => ({ default: m.TeamOfTheWeekPanel })));
const ManagerProfile = lazy(() => import('./ui/ManagerProfile').then((m) => ({ default: m.ManagerProfile })));
const MoralePanel = lazy(() => import('./ui/MoralePanel').then((m) => ({ default: m.MoralePanel })));
const TransferRumours = lazy(() => import('./ui/TransferRumours').then((m) => ({ default: m.TransferRumours })));
const TrainingReport = lazy(() => import('./ui/TrainingReport').then((m) => ({ default: m.TrainingReport })));
const LeagueStats = lazy(() => import('./ui/LeagueStats').then((m) => ({ default: m.LeagueStats })));
const TransferHistory = lazy(() => import('./ui/TransferHistory').then((m) => ({ default: m.TransferHistory })));
const FinancialReport = lazy(() => import('./ui/FinancialReport').then((m) => ({ default: m.FinancialReport })));
const ScoutingReportDetail = lazy(() => import('./ui/ScoutingReportDetail').then((m) => ({ default: m.ScoutingReportDetail })));
const SquadPlanner = lazy(() => import('./ui/SquadPlanner').then((m) => ({ default: m.SquadPlanner })));
const ClubVision = lazy(() => import('./ui/ClubVision').then((m) => ({ default: m.ClubVision })));
const TransferNegotiation = lazy(() => import('./ui/TransferNegotiation').then((m) => ({ default: m.TransferNegotiation })));
const FormationDesigner = lazy(() => import('./ui/FormationDesigner').then((m) => ({ default: m.FormationDesigner })));
const SeasonReviewScreen = lazy(() => import('./ui/SeasonReviewScreen').then((m) => ({ default: m.SeasonReviewScreen })));
const GuidedMatchday = lazy(() => import('./ui/GuidedMatchday').then((m) => ({ default: m.GuidedMatchday })));
const ScoutAssignments = lazy(() => import('./ui/ScoutAssignments').then((m) => ({ default: m.ScoutAssignments })));
const StaffHiring = lazy(() => import('./ui/StaffHiring').then((m) => ({ default: m.StaffHiring })));
const YouthScouting = lazy(() => import('./ui/YouthScouting').then((m) => ({ default: m.YouthScouting })));
const LoanSystem = lazy(() => import('./ui/LoanSystem').then((m) => ({ default: m.LoanSystem })));
const FreeAgentPool = lazy(() => import('./ui/FreeAgentPool').then((m) => ({ default: m.FreeAgentPool })));
const TrialSystem = lazy(() => import('./ui/TrialSystem').then((m) => ({ default: m.TrialSystem })));
const UndoRedo = lazy(() => import('./ui/UndoRedo').then((m) => ({ default: m.UndoRedo })));
const MatchInsights = lazy(() => import('./ui/GamePanels').then((m) => ({ default: m.MatchInsights })));
const SquadDepthChart = lazy(() => import('./ui/GamePanels').then((m) => ({ default: m.SquadDepthChart })));
const AchievementsPanel = lazy(() => import('./ui/GamePanels').then((m) => ({ default: m.AchievementsPanel })));

// --- Section-based navigation (10 sections, sub-tabs within each) ---

type Section = 'match' | 'league' | 'tactics' | 'squad' | 'transfers' | 'club' | 'media' | 'compete' | 'profile' | 'system';

interface SubTab { id: string; label: string; }

const SECTIONS: Array<{ id: Section; label: string; icon: string; tabs: SubTab[] }> = [
  { id: 'match', label: 'Match', icon: '⚽', tabs: [
    { id: 'match', label: 'Live' }, { id: 'matchday', label: 'Matchday' }, { id: 'replay', label: 'Replay' }, { id: 'analysis', label: 'Analysis' }, { id: 'insights', label: 'Insights' },
  ]},
  { id: 'league', label: 'League', icon: '📊', tabs: [
    { id: 'fixtures', label: 'Fixtures' }, { id: 'table', label: 'Table' }, { id: 'stats', label: 'Stats' }, { id: 'totw', label: 'TOTW' }, { id: 'preview', label: 'Preview' },
  ]},
  { id: 'tactics', label: 'Tactics', icon: '📋', tabs: [
    { id: 'tactics', label: 'Formation' }, { id: 'presets', label: 'Presets' }, { id: 'designer', label: 'Designer' }, { id: 'advanced', label: 'Set Pieces' }, { id: 'undoredo', label: 'Undo/Redo' },
  ]},
  { id: 'squad', label: 'Squad', icon: '👥', tabs: [
    { id: 'squad', label: 'Players' }, { id: 'planner', label: 'Planner' }, { id: 'contracts', label: 'Contracts' }, { id: 'development', label: 'Growth' }, { id: 'morale', label: 'Morale' }, { id: 'depth', label: 'Depth' },
  ]},
  { id: 'transfers', label: 'Transfers', icon: '💰', tabs: [
    { id: 'transfers', label: 'Market' }, { id: 'negotiate', label: 'Negotiate' }, { id: 'transferhistory', label: 'History' }, { id: 'deadline', label: 'Deadline' }, { id: 'rumours', label: 'Rumours' }, { id: 'scouting', label: 'Scouting' }, { id: 'scouts', label: 'Scouts' }, { id: 'report', label: 'Report' }, { id: 'search', label: 'Search' }, { id: 'youth', label: 'Youth' }, { id: 'loans', label: 'Loans' }, { id: 'freeagents', label: 'Free Agents' }, { id: 'trials', label: 'Trials' },
  ]},
  { id: 'club', label: 'Club', icon: '🏢', tabs: [
    { id: 'staff', label: 'Staff' }, { id: 'hiring', label: 'Hiring' }, { id: 'training', label: 'Training' }, { id: 'finances', label: 'Finances' }, { id: 'board', label: 'Board' }, { id: 'meeting', label: 'Meeting' }, { id: 'vision', label: 'Vision' },
  ]},
  { id: 'media', label: 'Media', icon: '📰', tabs: [
    { id: 'media', label: 'Press' }, { id: 'inbox', label: 'Inbox' },
  ]},
  { id: 'compete', label: 'Compete', icon: '🏆', tabs: [
    { id: 'cups', label: 'Cups' }, { id: 'continental', label: 'Continental' }, { id: 'international', label: 'International' },
  ]},
  { id: 'profile', label: 'Profile', icon: '👤', tabs: [
    { id: 'profile', label: 'Manager' }, { id: 'history', label: 'History' }, { id: 'review', label: 'Review' }, { id: 'compare', label: 'Compare' }, { id: 'data', label: 'Data Hub' }, { id: 'export', label: 'Export' }, { id: 'achievements', label: 'Awards' },
  ]},
  { id: 'system', label: 'System', icon: '⚙️', tabs: [
    { id: 'modes', label: 'Modes' }, { id: 'mods', label: 'Mods' }, { id: 'save', label: 'Save' },
  ]},
];

function TabFallback() {
  return <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>Loading...</div>;
}

export default function App() {
  const { league, initGame, resumeFromAutosave, matchState, isSimulating, setSimulating, setSimSpeed, careerStarted, sacked, resetCareer } = useGameStore();
  const [section, setSection] = useState<Section>('match');
  const [subTab, setSubTab] = useState('match');
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    if (!league) {
      resumeFromAutosave().then((resumed) => {
        if (!resumed) initGame();
      });
    }
  }, [league, initGame, resumeFromAutosave]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      switch (e.key) {
        case ' ': e.preventDefault(); setSimulating(!isSimulating); break;
        case '1': setSimSpeed(1); break;
        case '2': setSimSpeed(2); break;
        case '3': setSimSpeed(4); break;
        case '4': setSimSpeed(8); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isSimulating, setSimulating, setSimSpeed]);

  const activeSection = SECTIONS.find((s) => s.id === section) ?? SECTIONS[0];

  useKeyboardNav({
    onPrevTab: () => {
      const tabs = activeSection.tabs;
      const idx = tabs.findIndex((t) => t.id === subTab);
      const prev = idx <= 0 ? tabs.length - 1 : idx - 1;
      setSubTab(tabs[prev].id);
    },
    onNextTab: () => {
      const tabs = activeSection.tabs;
      const idx = tabs.findIndex((t) => t.id === subTab);
      const next = idx >= tabs.length - 1 ? 0 : idx + 1;
      setSubTab(tabs[next].id);
    },
    onEscape: () => setShowShortcuts(false),
  });

  if (!league) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;

  // Career setup: show team selection before game starts
  if (!careerStarted) return <CareerSetup />;

  // Sacking: game over screen
  if (sacked) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#1a1a2e', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 48 }}>🚪</div>
      <h1 style={{ fontSize: 22, color: '#f87171', margin: 0 }}>You've Been Sacked</h1>
      <p style={{ fontSize: 14, color: '#888', textAlign: 'center', maxWidth: 400 }}>
        The board has lost all confidence in your ability to manage this club. Your contract has been terminated with immediate effect.
      </p>
      <button onClick={resetCareer} style={{ padding: '12px 24px', borderRadius: 6, border: 'none', cursor: 'pointer', background: 'rgba(74,222,128,0.3)', color: '#4ade80', fontSize: 14, fontWeight: 600 }}>
        Start New Career
      </button>
    </div>
  );

  const selectSection = (s: Section) => {
    setSection(s);
    const sec = SECTIONS.find((x) => x.id === s);
    if (sec) setSubTab(sec.tabs[0].id);
    // Preload Three.js chunk when entering Match section
    if (s === 'match') import('./ui/MatchView');
  };

  const renderSubTab = () => {
    switch (subTab) {
      case 'match':
        return (
          <>
            <div style={{ flex: 1, position: 'relative' }}>
              {matchState ? (
                matchState.status === 'pre_match' ? (
                  <div style={{ display: 'flex', height: '100%' }}>
                    <div style={{ flex: 1, overflow: 'auto' }}><SquadSelection /></div>
                    <div style={{ width: 320, borderLeft: '1px solid rgba(255,255,255,0.1)', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                      <PreMatchTalk />
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}><OppositionReport /></div>
                      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}><MatchPreviewPanel /></div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Suspense fallback={<TabFallback />}><MatchView /></Suspense>
                    <InMatchPanel />
                    {matchState.status === 'full_time' && <PostMatchSummary />}
                    <HighlightsReel />
                  </>
                )
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666', fontSize: 15 }}>
                  Click "Quick Match" or go to League → Fixtures to play
                </div>
              )}
            </div>
            <div style={{ width: 300, borderLeft: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
              <Suspense fallback={<TabFallback />}><EventFeed /></Suspense>
              {matchState && <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', flex: 1, overflow: 'hidden' }}><MatchHighlights /></div>}
            </div>
          </>
        );
      case 'replay': return <MatchReplay />;
      case 'matchday': return <GuidedMatchday />;
      case 'analysis': return <TacticalAnalysis />;
      case 'insights': return <MatchInsights />;
      case 'fixtures': return <Suspense fallback={<TabFallback />}><FixtureList /></Suspense>;
      case 'table': return <Suspense fallback={<TabFallback />}><LeagueTable /></Suspense>;
      case 'stats': return <LeagueStats />;
      case 'totw': return <TeamOfTheWeekPanel />;
      case 'preview': return <SeasonPreview />;
      case 'tactics': return <Suspense fallback={<TabFallback />}><TacticsEditor /></Suspense>;
      case 'presets': return <TacticPresets />;
      case 'designer': return <FormationDesigner />;
      case 'advanced': return <Suspense fallback={<TabFallback />}><TacticsAdvanced /></Suspense>;
      case 'undoredo': return <UndoRedo />;
      case 'squad': return <Suspense fallback={<TabFallback />}><TeamSheet /></Suspense>;
      case 'planner': return <SquadPlanner />;
      case 'contracts': return <ContractsPanel />;
      case 'development': return <DevelopmentPanel />;
      case 'morale': return <MoralePanel />;
      case 'depth': return <SquadDepthChart />;
      case 'transfers': return <Suspense fallback={<TabFallback />}><TransferCenter /></Suspense>;
      case 'negotiate': return <TransferNegotiation />;
      case 'transferhistory': return <TransferHistory />;
      case 'deadline': return <DeadlineDay />;
      case 'rumours': return <TransferRumours />;
      case 'scouting': return <Suspense fallback={<TabFallback />}><ScoutingScreen /></Suspense>;
      case 'scouts': return <ScoutAssignments />;
      case 'report': return <ScoutingReportDetail />;
      case 'search': return <PlayerSearch />;
      case 'youth': return <YouthScouting />;
      case 'loans': return <LoanSystem />;
      case 'freeagents': return <FreeAgentPool />;
      case 'trials': return <TrialSystem />;
      case 'staff': return <Suspense fallback={<TabFallback />}><StaffTraining /></Suspense>;
      case 'hiring': return <StaffHiring />;
      case 'training': return <TrainingReport />;
      case 'finances': return <FinancialReport />;
      case 'board': return <Suspense fallback={<TabFallback />}><BoardFinances /></Suspense>;
      case 'meeting': return <BoardMeeting />;
      case 'vision': return <ClubVision />;
      case 'media': return <Suspense fallback={<TabFallback />}><MediaCenter /></Suspense>;
      case 'inbox': return <NotificationInbox />;
      case 'cups': return <Suspense fallback={<TabFallback />}><Competitions /></Suspense>;
      case 'continental': return <ContinentalCup />;
      case 'international': return <InternationalManagement />;
      case 'profile': return <ManagerProfile />;
      case 'history': return <div style={{ display: 'flex', height: '100%' }}><div style={{ flex: 1, overflow: 'auto' }}><SeasonHistory /></div><div style={{ flex: 1, overflow: 'auto', borderLeft: '1px solid rgba(255,255,255,0.1)' }}><SeasonAwardsScreen /></div></div>;
      case 'review': return <SeasonReviewScreen />;
      case 'compare': return <PlayerComparison />;
      case 'data': return <Suspense fallback={<TabFallback />}><DataHub /></Suspense>;
      case 'export': return <DataExport />;
      case 'achievements': return <AchievementsPanel />;
      case 'modes': return <Suspense fallback={<TabFallback />}><GameModes /></Suspense>;
      case 'mods': return <Suspense fallback={<TabFallback />}><ModManager /></Suspense>;
      case 'save': return <Suspense fallback={<TabFallback />}><SaveLoadPanel /></Suspense>;
      default: return <TabFallback />;
    }
  };

  return (
    <ErrorBoundary>
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Top nav: 10 sections */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '6px 12px', borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.3)' }}>
        <h1 style={{ fontSize: 14, fontWeight: 700, margin: 0, color: '#4ade80', marginRight: 16 }}>⚽ Indie FM</h1>
        <nav style={{ display: 'flex', gap: 2, flex: 1 }} role="tablist" aria-label="Game sections">
          {SECTIONS.map((s) => {
            const Icon = SECTION_ICONS[s.id];
            return (
              <button
                key={s.id}
                role="tab"
                aria-selected={section === s.id}
                onClick={() => selectSection(s.id)}
                style={{
                  padding: '5px 10px', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 12,
                  background: section === s.id ? 'rgba(96,165,250,0.15)' : 'transparent',
                  color: section === s.id ? '#60a5fa' : '#888',
                  fontWeight: section === s.id ? 600 : 400,
                  display: 'flex', alignItems: 'center', gap: 4,
                }}
              >
                {Icon ? <Icon size={14} /> : s.icon} <span className="section-label">{s.label}</span>
              </button>
            );
          })}
        </nav>
        <select
          value={lang}
          onChange={(e) => { const l = e.target.value as Language; setLang(l); setLanguage(l); }}
          aria-label="Language selector"
          style={{ padding: '3px 6px', fontSize: 11, borderRadius: 4, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#aaa', marginLeft: 8 }}
        >
          {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
        </select>
      </header>

      {/* Sub-nav: tabs within active section */}
      <div data-subnav role="tablist" aria-label={`${activeSection.label} sub-tabs`} style={{ display: 'flex', gap: 2, padding: '4px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)', alignItems: 'center' }}>
        {activeSection.tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={subTab === t.id}
            aria-label={`${t.label} tab`}
            onClick={() => setSubTab(t.id)}
            style={{
              padding: '4px 10px', border: 'none', cursor: 'pointer', fontSize: 11, borderRadius: 3,
              background: subTab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: subTab === t.id ? '#e0e0e0' : '#666',
              fontWeight: subTab === t.id ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={() => setShowShortcuts(true)}
            aria-label="Show keyboard shortcuts"
            style={{ padding: '3px 8px', fontSize: 11, background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 4, color: '#888', cursor: 'pointer' }}
          >
            ⌨️
          </button>
          <HelpGuide activeSection={section} />
        </div>
      </div>

      <MatchControls />
      {matchState && matchState.status !== 'pre_match' && matchState.status !== 'full_time' && <MomentumBar />}

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }} role="tabpanel" aria-label={`${activeSection.label} content`}>
        <ErrorBoundary>
          <Suspense fallback={<TabFallback />}>
            {renderSubTab()}
          </Suspense>
        </ErrorBoundary>
      </div>

      <ToastContainer />
      <FirstTimeGuide />
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </div>
    </ErrorBoundary>
  );
}
