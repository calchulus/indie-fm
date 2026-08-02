import { useState } from 'react';
import { generatePressQuestions, PressQuestion } from '../simulation/ui-systems';

export function PressConference({ context, result, onClose }: { context: 'pre_match' | 'post_match'; result?: { homeScore: number; awayScore: number }; onClose: () => void }) {
  const [questions] = useState<PressQuestion[]>(() => generatePressQuestions(context, result));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswer = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const allAnswered = questions.every((q) => answers[q.id]);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#1e1e2e', borderRadius: 12, padding: '24px', width: 500, maxHeight: '80vh', overflow: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16 }}>🎤 Press Conference</h3>

        {!submitted ? (
          <>
            {questions.map((q) => (
              <div key={q.id} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 14, marginBottom: 8, fontWeight: 500 }}>{q.question}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {q.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleAnswer(q.id, opt.id)}
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        borderRadius: 6,
                        border: answers[q.id] === opt.id ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                        background: answers[q.id] === opt.id ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
                        color: opt.tone === 'positive' ? '#4ade80' : opt.tone === 'negative' ? '#f87171' : '#e0e0e0',
                        cursor: 'pointer',
                        fontSize: 13,
                      }}
                    >
                      {opt.text}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleSubmit}
                disabled={!allAnswered}
                style={{ padding: '8px 16px', background: allAnswered ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 6, color: allAnswered ? '#4ade80' : '#666', cursor: allAnswered ? 'pointer' : 'default', fontSize: 13 }}
              >
                Submit Answers
              </button>
              <button onClick={onClose} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#888', cursor: 'pointer', fontSize: 13 }}>
                Skip
              </button>
            </div>
          </>
        ) : (
          <div>
            <div style={{ fontSize: 14, marginBottom: 12 }}>✅ Press conference completed. Your answers have been recorded.</div>
            <button onClick={onClose} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', border: 'none', borderRadius: 6, color: '#e0e0e0', cursor: 'pointer', fontSize: 13 }}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
