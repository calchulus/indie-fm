import { useEffect } from 'react';
import { KEYBOARD_NAV } from '../simulation/code-quality';

interface KeyboardNavProps {
  onPrevTab: () => void;
  onNextTab: () => void;
  onEscape: () => void;
}

export function useKeyboardNav({ onPrevTab, onNextTab, onEscape }: KeyboardNavProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const nav = KEYBOARD_NAV[e.key];
      if (!nav) return;
      switch (nav.action) {
        case 'prev_tab': e.preventDefault(); onPrevTab(); break;
        case 'next_tab': e.preventDefault(); onNextTab(); break;
        case 'close_modal': e.preventDefault(); onEscape(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onPrevTab, onNextTab, onEscape]);
}

export function KeyboardShortcutsModal({ onClose }: { onClose: () => void }) {
  const entries = Object.entries(KEYBOARD_NAV);
  return (
    <div
      role="dialog"
      aria-label="Keyboard shortcuts"
      aria-modal="true"
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        style={{ background: '#1e1e2e', borderRadius: 12, padding: 24, minWidth: 320, maxWidth: 420, border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 16px', fontSize: 15 }}>⌨️ Keyboard Shortcuts</h3>
        <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
          <tbody>
            {entries.map(([key, { description }]) => (
              <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '6px 8px', color: '#60a5fa', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  {key === ' ' ? 'Space' : key}
                </td>
                <td style={{ padding: '6px 8px', color: '#ccc' }}>{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={onClose}
          aria-label="Close keyboard shortcuts"
          style={{ marginTop: 16, padding: '6px 16px', fontSize: 12, background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#e0e0e0', cursor: 'pointer', width: '100%' }}
        >
          Close (Esc)
        </button>
      </div>
    </div>
  );
}
