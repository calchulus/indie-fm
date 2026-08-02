import { createContext, useContext } from 'react';
import { UITheme, UI_THEMES } from './simulation/club';

export const ThemeContext = createContext<UITheme>(UI_THEMES[0]);

export function useTheme(): UITheme {
  return useContext(ThemeContext);
}

export function getThemeColors(theme: UITheme) {
  return theme.colors;
}

export function applyThemeToDocument(theme: UITheme) {
  const root = document.documentElement;
  root.style.setProperty('--bg', theme.colors.background);
  root.style.setProperty('--surface', theme.colors.surface);
  root.style.setProperty('--primary', theme.colors.primary);
  root.style.setProperty('--secondary', theme.colors.secondary);
  root.style.setProperty('--text', theme.colors.text);
  root.style.setProperty('--text-muted', theme.colors.textMuted);
  root.style.setProperty('--accent', theme.colors.accent);
  root.style.setProperty('--success', theme.colors.success);
  root.style.setProperty('--danger', theme.colors.danger);
  document.body.style.background = theme.colors.background;
  document.body.style.color = theme.colors.text;
}
