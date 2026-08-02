import { useGameStore } from '../store/gameStore';

export function NotificationInbox() {
  const { news, toasts } = useGameStore();

  const allItems = [
    ...news.map((n) => ({ id: n.id, text: n.headline, sub: n.body, type: n.category as string, round: n.round })),
    ...toasts.map((t) => ({ id: t.id, text: t.message, sub: '', type: t.type, round: 0 })),
  ];

  const iconFor = (type: string) => {
    switch (type) {
      case 'transfer': return '💰';
      case 'match': return '⚽';
      case 'club': return '🏢';
      case 'league': return '📊';
      case 'international': return '🌍';
      case 'media': return '📰';
      case 'fan': return '👥';
      case 'goal': return '⚽';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>📬 Inbox ({allItems.length})</h3>

      {allItems.length === 0 && (
        <div style={{ color: '#666', fontSize: 13, textAlign: 'center', padding: 40 }}>
          No notifications yet. Play matches and advance rounds to generate news.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {allItems.map((item) => (
          <div key={item.id} style={{
            display: 'flex', gap: 10, padding: '8px 12px',
            background: 'rgba(255,255,255,0.03)', borderRadius: 6,
            borderLeft: `3px solid ${item.type === 'goal' || item.type === 'success' ? '#4ade80' : item.type === 'error' ? '#f87171' : 'rgba(255,255,255,0.1)'}`,
          }}>
            <span style={{ fontSize: 16 }}>{iconFor(item.type)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{item.text}</div>
              {item.sub && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.sub}</div>}
            </div>
            {item.round > 0 && <span style={{ fontSize: 10, color: '#666', alignSelf: 'center' }}>R{item.round}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
