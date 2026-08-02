import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../App';
import { useGameStore } from '../../store/gameStore';

describe('App Component', () => {
  beforeEach(() => {
    localStorage.setItem('indie-fm-onboarded', 'true');
    localStorage.setItem('indie-fm-guide-v2', 'true');
    useGameStore.getState().initGame();
    // Start career so the main game UI renders (not the CareerSetup screen)
    const league = useGameStore.getState().league;
    if (league) {
      useGameStore.getState().startCareer(league.teams[0].id);
    }
  });

  it('renders the app title', () => {
    render(<App />);
    expect(screen.getByText(/Indie FM/)).toBeInTheDocument();
  });

  it('renders all 10 navigation sections', () => {
    render(<App />);
    // Section buttons include emoji icons; some labels match other UI text, so use getAllByText
    const sections = ['Match', 'League', 'Tactics', 'Squad', 'Transfers', 'Club', 'Media', 'Compete', 'Profile', 'System'];
    for (const section of sections) {
      const matches = screen.getAllByText(new RegExp(section));
      expect(matches.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('shows quick match prompt on initial match tab', () => {
    render(<App />);
    const matches = screen.getAllByText(/Quick Match/);
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });

  it('renders match controls', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Quick Match/ })).toBeInTheDocument();
  });
});
