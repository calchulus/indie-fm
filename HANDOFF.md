# Indie FM — Project Handoff Document

## Project Location
`/Users/calvinchu/indie-fm/`

## Quick Start
```bash
cd ~/indie-fm
npm install
npm run dev    # Dev server at localhost:3000
npm test       # 159 tests, 23 files
npm run build  # Production build, ~800ms
```

## Current State
- **CI:** 0 type errors, 159 tests passing (23 files), build 792ms
- **Stack:** Vite + React 18 + TypeScript + Three.js + Zustand
- **UI:** 10 sections, ~42 sub-tabs
- **PWA:** Offline-capable, installable (SVG icons)
- **Audio:** Procedural crowd noise (Web Audio API)

## Architecture

```
src/
├── types/              — Player (45 attrs), Team, League, Match types
├── data/               — Generators (players, teams, leagues, names)
├── simulation/         — All game logic modules
│   ├── engine.ts       — Tick-based match engine (weather, momentum, red cards, offside, throw-ins, free kicks, GK saves, set pieces, ET/pens)
│   ├── tactics.ts      — 18 formations with slot positions
│   ├── formations.ts   — Full formation definitions + custom designer
│   ├── fastmatch.ts    — Fast AI-vs-AI resolver (45-attr weighted)
│   ├── season.ts       — Season simulation, standings
│   ├── orchestrator.ts — Round orchestrator (fires all systems per round)
│   ├── enforcement.ts  — Transfer window, contract expiry, retirement, wage budget, squad limit, position familiarity, captain
│   ├── competition.ts  — Knockout sim, promotion/relegation, cup fixtures, fixture congestion, awards
│   ├── player-systems.ts — Loyalty, contract negotiation, radar chart, trait learning, international call-ups, injury history, form persistence, morale reasons
│   ├── trait-effects.ts — 34 traits with mechanical multipliers (shot/pass/tackle/dribble)
│   ├── weather-effects.ts — Weather modifiers on pass/shot/dribble
│   ├── momentum.ts     — Momentum tracking + multiplier
│   ├── fatigue.ts      — Per-player fatigue tracking
│   ├── formation-change.ts — Mid-match formation recalculation
│   ├── continental-calendar.ts — Continental group stage + knockout
│   ├── knockout.ts     — Two-legged knockout ties
│   ├── systems.ts      — Scouting network, scout reports, deadline day, sacking, job offers, rivalry, fan happiness, media, FFP
│   ├── systems-2.ts    — Sponsorship, ticket pricing, stadium expansion, staff hiring, board expectations, pre-season, international breaks, winter window, loans
│   ├── systems-3.ts    — Youth scouting, sell-on clauses, release clauses, contract termination, wage negotiation, agent fees, installments, swap deals, free agents, trials
│   ├── ui-systems.ts   — Match preview, press conference, inbox notifications, tooltips, keyboard shortcuts, settings, responsive, loading states, error recovery
│   ├── ui-systems-2.ts — Theme toggle, speed indicator, formation visual, drag-drop, highlights replay, crowd toggle, commentary feed, player avatar, stadium info, attendance
│   └── code-quality.ts — State persistence, undo/redo, speed persistence, error handling, input validation, virtualization, ARIA, keyboard nav, i18n, analytics
├── visualization/      — Three.js rendering
│   ├── PitchScene.ts   — 3D pitch with stadium geometry, instanced players
│   ├── CameraController.ts — Orbit camera
│   ├── PlayerAnimator.ts — 8 procedural animation states
│   └── stadium.ts      — Stadium geometry generator
├── audio/
│   └── crowd.ts        — Procedural crowd audio (Web Audio API)
├── store/
│   └── gameStore.ts    — Zustand store (all game state + actions)
├── ui/                 — React components (~30 files)
│   ├── MatchView.tsx, MatchOverlay.tsx, MatchControls.tsx
│   ├── EventFeed.tsx, MatchHighlights.tsx, MatchReplay.tsx
│   ├── TacticsEditor.tsx, TacticsAdvanced.tsx, TacticPresets.tsx
│   ├── FormationDesigner.tsx
│   ├── TeamSheet.tsx, SquadPlanner.tsx, SquadSelection.tsx
│   ├── TransferCenter.tsx, TransferNegotiation.tsx, TransferHistory.tsx
│   ├── TransferRumours.tsx, DeadlineDay.tsx
│   ├── ScoutingScreen.tsx, ScoutingNetwork.tsx, ScoutAssignments.tsx
│   ├── ScoutingReportDetail.tsx
│   ├── LeagueTable.tsx, LeagueStats.tsx, SeasonPreview.tsx
│   ├── SeasonReviewScreen.tsx, SeasonHistory.tsx
│   ├── ContinentalCup.tsx, InternationalManagement.tsx
│   ├── BoardMeeting.tsx, BoardFinances.tsx, FinancialReport.tsx
│   ├── ClubVision.tsx, ManagerProfile.tsx
│   ├── MediaCenter.tsx, PressConference.tsx
│   ├── ContractNegotiation.tsx, ContractPanel.tsx
│   ├── RadarChart.tsx, PlayerComparison.tsx
│   ├── SackingScreen.tsx, JobOffers.tsx
│   ├── SponsorshipUI.tsx, TicketPricingUI.tsx, StadiumExpansionUI.tsx
│   ├── StaffTraining.tsx, TrainingReport.tsx
│   ├── GuidedMatchday.tsx, OppositionReport.tsx
│   ├── MoralePanel.tsx, DevelopmentPanel.tsx
│   ├── GameModes.tsx, ModManager.tsx, SaveLoadPanel.tsx
│   ├── HelpGuide.tsx, ToastContainer.tsx
│   ├── Icons.tsx, ClubCrest.tsx
│   └── ErrorBoundary.tsx
└── __tests__/          — 23 test files, 159 tests
    ├── simulation/     — engine, tactics, generators, season, cups, momentum, fatigue, newseason, planner-vision, youth-totw, commentary, morale-rumours
    ├── integration/    — game-loop (full lifecycle test)
    └── ui/             — App.test.tsx
```

## Key Design Decisions
1. **Sim/presentation separation** — Match engine produces events, UI just renders them
2. **45-attribute player model** — All attributes influence match outcomes via weighted calculations
3. **34 traits with mechanical effects** — Multipliers on shot/pass/tackle/dribble
4. **18 formations** — All wired into engine with slot positions
5. **Fast resolver** — AI-vs-AI matches use statistical model (not tick-by-tick)
6. **Zustand store** — Single source of truth, all game state + actions
7. **PWA** — Service worker, SVG icons, offline-capable
8. **Procedural audio** — Web Audio API crowd noise, no external files

## Remaining Work (10 items)
See `REMAINING_WORK.md` for detailed specs.

| # | Item | Status |
|---|------|--------|
| 11 | Staff hiring UI | ⬜ |
| 12 | Youth scouting UI | ⬜ |
| 13 | Loan system UI | ⬜ |
| 14 | Free agent pool UI | ⬜ |
| 15 | Trial system UI | ⬜ |
| 16 | Undo/redo for tactical changes | ⬜ |
| 17 | Error boundaries (wrap each tab) | ⬜ |
| 18 | ARIA labels | ⬜ |
| 19 | Keyboard navigation | ⬜ |
| 20 | i18n | ⬜ |

## How to Continue
1. Read this file for full context
2. Read `REMAINING_WORK.md` for detailed specs of remaining items
3. Run `npm run dev` to start the dev server
4. Continue building items 11-20

## Files to Read First (for context)
1. `HANDOFF.md` (this file)
2. `REMAINING_WORK.md` (remaining work specs)
3. `src/store/gameStore.ts` (all game state + actions)
4. `src/types/player.ts` (player model with 45 attrs)
5. `src/simulation/engine.ts` (match engine)
