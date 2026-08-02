import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { generatePreMatchPress, createFanSentiment, generateSocialPosts, NewsItem, PressConference, FanSentiment, SocialPost } from '../simulation/media';

export function MediaCenter() {
  const { league, userTeamId } = useGameStore();
  const [subTab, setSubTab] = useState<'news' | 'press' | 'fans'>('news');
  const [news] = useState<NewsItem[]>([]);
  const [pressConf] = useState<PressConference>(() => {
    const opponent = league?.teams.find((t) => t.id !== userTeamId);
    return opponent ? generatePreMatchPress(1, opponent, true) : { id: '', round: 1, type: 'pre_match', questions: [], answered: false };
  });
  const [fanSentiment] = useState<FanSentiment>(() => {
    const team = league?.teams.find((t) => t.id === userTeamId);
    return team ? createFanSentiment(team) : { happiness: 50, attendance: 20000, trustInManager: 60, transferWindowApproval: 50, recentMood: [] };
  });
  const [socialPosts] = useState<SocialPost[]>(() => generateSocialPosts(1, 'Indie FC', true));
  const [answers, setAnswers] = useState<Record<string, string>>({});

  if (!league || !userTeamId) return null;

  const tabBtn = (active: boolean): React.CSSProperties => ({
    padding: '6px 14px', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 4,
    background: active ? 'rgba(96,165,250,0.3)' : 'rgba(255,255,255,0.08)',
    color: '#e0e0e0', cursor: 'pointer', fontSize: 13,
  });

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button style={tabBtn(subTab === 'news')} onClick={() => setSubTab('news')}>📰 News</button>
        <button style={tabBtn(subTab === 'press')} onClick={() => setSubTab('press')}>🎤 Press</button>
        <button style={tabBtn(subTab === 'fans')} onClick={() => setSubTab('fans')}>👥 Fans</button>
      </div>

      {subTab === 'news' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Inbox</h4>
          {news.length === 0 && <div style={{ color: '#666', fontSize: 13 }}>No news yet. Play matches and advance rounds to generate news items.</div>}
          {news.map((item) => (
            <div key={item.id} style={{ padding: '8px 12px', marginBottom: 8, background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{item.headline}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{item.body}</div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'press' && (
        <div>
          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Pre-Match Press Conference</h4>
          {pressConf.questions.map((q) => (
            <div key={q.id} style={{ marginBottom: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🎤 {q.question}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {q.options.map((opt) => (
                  <button key={opt.id} onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))} style={{
                    padding: '6px 10px', textAlign: 'left', fontSize: 12, border: '1px solid',
                    borderColor: answers[q.id] === opt.id ? '#60a5fa' : 'rgba(255,255,255,0.1)',
                    borderRadius: 4, cursor: 'pointer',
                    background: answers[q.id] === opt.id ? 'rgba(96,165,250,0.15)' : 'transparent',
                    color: opt.tone === 'positive' ? '#4ade80' : opt.tone === 'negative' ? '#f87171' : opt.tone === 'controversial' ? '#fbbf24' : '#e0e0e0',
                  }}>
                    {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === 'fans' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: fanSentiment.happiness >= 60 ? '#4ade80' : '#fbbf24' }}>{fanSentiment.happiness}%</div>
              <div style={{ fontSize: 11, color: '#888' }}>Fan Happiness</div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#e0e0e0' }}>{fanSentiment.attendance.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#888' }}>Avg Attendance</div>
            </div>
            <div style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 6, textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: fanSentiment.trustInManager >= 50 ? '#4ade80' : '#f87171' }}>{fanSentiment.trustInManager}%</div>
              <div style={{ fontSize: 11, color: '#888' }}>Trust in Manager</div>
            </div>
          </div>

          <h4 style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Social Feed</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {socialPosts.map((post) => (
              <div key={post.id} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#60a5fa' }}>{post.author}</span>
                  <span style={{ fontSize: 11, color: '#888' }}>❤️ {post.likes}</span>
                </div>
                <div style={{ fontSize: 13, color: post.sentiment === 'positive' ? '#e0e0e0' : post.sentiment === 'negative' ? '#fca5a5' : '#e0e0e0' }}>
                  {post.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
