import { useGameStore } from '../store/gameStore';

export function ToastContainer() {
  const toasts = useGameStore((s) => s.toasts);
  const removeToast = useGameStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  const colors: Record<string, string> = {
    goal: 'rgba(251,191,36,0.95)',
    success: 'rgba(74,222,128,0.95)',
    info: 'rgba(96,165,250,0.95)',
    warning: 'rgba(251,146,60,0.95)',
    error: 'rgba(248,113,113,0.95)',
  };

  return (
    <div aria-live="polite" role="status" style={{
      position: 'fixed',
      top: 60,
      right: 16,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          onClick={() => removeToast(toast.id)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            background: colors[toast.type] ?? colors.info,
            color: '#111',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            cursor: 'pointer',
            pointerEvents: 'auto',
            animation: 'slideIn 0.2s ease-out',
            maxWidth: 300,
          }}
        >
          {toast.message}
        </div>
      ))}
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
