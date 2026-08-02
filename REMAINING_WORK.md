# Indie FM — Remaining 20 UI Items to Build

All simulation modules exist and are wired into the store. The remaining work is building UI components that expose these store actions to the player.

## Status: 10 of 20 complete

| # | Item | Status |
|---|------|--------|
| 1 | Contract negotiation UI (modal with wage slider, accept/reject/counter) | ✅ Done |
| 2 | Radar chart in Compare tab (SVG radar using getPlayerRadarData) | ✅ Done |
| 3 | Press conference UI (triggered after matches, choose responses) | ✅ Done |
| 4 | Scouting network UI (assign scouts to regions, view knowledge) | ✅ Done |
| 5 | Deadline day drama UI (countdown timer, rapid-fire deals) | ✅ Done |
| 6 | Sacking screen (game over screen with career stats) | ✅ Done |
| 7 | Job offers UI (modal with accept/reject) | ✅ Done |
| 8 | Sponsorship negotiation UI (choose sponsor, negotiate terms) | ✅ Done |
| 9 | Ticket pricing UI (sliders for standard/premium/VIP) | ✅ Done |
| 10 | Stadium expansion UI (propose expansion, view construction) | ✅ Done |
| 11 | Staff hiring UI (browse candidates, hire) | ⬜ Not started |
| 12 | Youth scouting UI (view prospects, sign) | ⬜ Not started |
| 13 | Loan system UI (offer/accept loans) | ⬜ Not started |
| 14 | Free agent pool UI (browse and sign free agents) | ⬜ Not started |
| 15 | Trial system UI (offer trials, evaluate performance) | ⬜ Not started |
| 16 | Undo/redo for tactical changes (history stack) | ⬜ Not started |
| 17 | Error boundaries (wrap each tab) | ⬜ Not started |
| 18 | ARIA labels (accessibility labels on interactive elements) | ⬜ Not started |
| 19 | Keyboard navigation (arrow keys for tab switching) | ⬜ Not started |
| 20 | i18n (translate UI strings) | ⬜ Not started |

---

## Detailed Specs for Remaining Items

### 11. Staff Hiring UI
- Browse generated staff candidates (coaches, scouts, physios)
- Filter by role, rating, wage
- Hire button calls `hireStaff(role)` store action
- Show current staff list with ratings and wages
- Fire staff option

### 12. Youth Scouting UI
- View generated youth prospects (name, age, position, potential stars, nationality, cost)
- Sign button adds player to squad
- Filter by position, potential rating
- Show youth academy level and its effect on prospect quality

### 13. Loan System UI
- Offer loans to other clubs (select player, duration, wage contribution)
- Accept incoming loan offers
- Show active loans (in/out)
- Option-to-buy toggle with buy price

### 14. Free Agent Pool UI
- Browse generated free agents (name, age, position, overall, wage demand)
- Sign button calls `signFreeAgent(playerId)` store action
- Filter by position, overall rating
- Show squad size warning if at MAX_SQUAD_SIZE

### 15. Trial System UI
- Offer trial to a player (select duration)
- Evaluate trial performance after duration
- Offer contract if performance >= 6.5
- Show trial status (pending, in progress, completed)

### 16. Undo/Redo for Tactical Changes
- History stack for formation/tactics changes
- Undo button reverts to previous tactics
- Redo button re-applies undone change
- Show history depth indicator
- Uses `createHistory`, `pushHistory`, `undo`, `redo` from code-quality.ts

### 17. Error Boundaries
- Wrap each tab content in an ErrorBoundary component
- Show friendly error message with retry button
- Log errors to console
- Prevent one tab's crash from taking down the whole app

### 18. ARIA Labels
- Add `aria-label` to all buttons, inputs, selects
- Add `role="tablist"`, `role="tab"`, `role="tabpanel"` to navigation
- Add `aria-selected` to active tab
- Add `aria-live="polite"` to toast notifications
- Add `aria-label` to SVG icons

### 19. Keyboard Navigation
- Arrow Left/Right: switch between tabs
- Space: play/pause match
- 1-4: change simulation speed
- Escape: close modals
- Show keyboard shortcuts in a help modal

### 20. i18n (Internationalization)
- Extract all UI strings into translation keys
- Support en, es, fr, de
- Language selector in settings
- Uses `translate(key, lang)` from code-quality.ts
- Fallback to English if translation missing

---

## Files Already Created (UI components)

```
src/ui/ContractNegotiation.tsx   — Item 1
src/ui/RadarChart.tsx            — Item 2
src/ui/PressConference.tsx       — Item 3
src/ui/ScoutingNetwork.tsx       — Item 4
src/ui/DeadlineDay.tsx           — Item 5
src/ui/SackingScreen.tsx         — Item 6
src/ui/JobOffers.tsx             — Item 7
src/ui/SponsorshipUI.tsx         — Item 8
src/ui/TicketPricingUI.tsx       — Item 9
src/ui/StadiumExpansionUI.tsx    — Item 10
```

## Files Still Needed

```
src/ui/StaffHiring.tsx           — Item 11
src/ui/YouthScouting.tsx         — Item 12
src/ui/LoanSystem.tsx            — Item 13
src/ui/FreeAgentPool.tsx         — Item 14
src/ui/TrialSystem.tsx           — Item 15
src/ui/UndoRedo.tsx              — Item 16
src/ui/ErrorBoundary.tsx         — Item 17 (exists but needs wrapping)
src/ui/KeyboardNav.tsx           — Item 19
src/i18n/translations.ts         — Item 20
```

---

## CI Status

```
Type errors:    0
Tests:          159 passing (23 files)
Build:          792ms
```
