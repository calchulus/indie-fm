import { useState, useCallback } from 'react';
import { Position } from '../types';
import { FormationSlot, validateFormation, createCustomFormation } from '../simulation/formations';

const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

const DEFAULT_SLOTS: FormationSlot[] = [
  { position: 'GK', x: 50, y: 5, role: 'goalkeeper' },
  { position: 'LB', x: 18, y: 22, role: 'full_back' },
  { position: 'CB', x: 38, y: 18, role: 'central_defender' },
  { position: 'CB', x: 62, y: 18, role: 'central_defender' },
  { position: 'RB', x: 82, y: 22, role: 'full_back' },
  { position: 'CM', x: 35, y: 45, role: 'central_midfielder' },
  { position: 'CM', x: 65, y: 45, role: 'central_midfielder' },
  { position: 'LW', x: 18, y: 68, role: 'winger' },
  { position: 'CAM', x: 50, y: 62, role: 'attacking_midfielder' },
  { position: 'RW', x: 82, y: 68, role: 'winger' },
  { position: 'ST', x: 50, y: 82, role: 'striker' },
];

export function FormationDesigner({ onSave }: { onSave?: (name: string, slots: FormationSlot[]) => void }) {
  const [slots, setSlots] = useState<FormationSlot[]>(DEFAULT_SLOTS);
  const [dragging, setDragging] = useState<number | null>(null);
  const [name, setName] = useState('My Formation');
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const validation = validateFormation(slots);

  const handlePitchClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (dragging === null) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSlots((prev) => prev.map((s, i) => i === dragging ? { ...s, x: Math.round(x), y: Math.round(y) } : s));
    setDragging(null);
  }, [dragging]);

  const handleSlotClick = (idx: number) => {
    setSelectedSlot(idx);
    setDragging(idx);
  };

  const changePosition = (idx: number, pos: Position) => {
    setSlots((prev) => prev.map((s, i) => i === idx ? { ...s, position: pos } : s));
  };

  const handleSave = () => {
    if (!validation.valid) return;
    const custom = createCustomFormation(name, slots);
    onSave?.(custom.name, custom.slots);
  };

  const posColor = (pos: string) => {
    if (pos === 'GK') return '#f4c542';
    if (['CB', 'LB', 'RB'].includes(pos)) return '#4a90d9';
    if (['CDM', 'CM', 'CAM'].includes(pos)) return '#3aa655';
    return '#e05a5a';
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🎨 Formation Designer</h3>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Formation name"
          style={{ padding: '6px 10px', background: '#2a2a3e', color: '#e0e0e0', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 4, fontSize: 13, flex: 1 }}
        />
        <button
          onClick={handleSave}
          disabled={!validation.valid}
          style={{ padding: '6px 14px', borderRadius: 4, border: 'none', cursor: validation.valid ? 'pointer' : 'default', background: validation.valid ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.05)', color: validation.valid ? '#4ade80' : '#666', fontSize: 13, fontWeight: 600 }}
        >
          Save Formation
        </button>
      </div>

      {/* Validation errors */}
      {!validation.valid && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(248,113,113,0.1)', borderRadius: 6, fontSize: 12, color: '#fca5a5' }}>
          {validation.errors.map((e, i) => <div key={i}>⚠️ {e}</div>)}
        </div>
      )}

      {/* Pitch */}
      <div
        onClick={handlePitchClick}
        style={{
          position: 'relative', width: 300, height: 420, background: '#2d8a4e', borderRadius: 8,
          margin: '0 auto 16px', border: '2px solid rgba(255,255,255,0.3)', cursor: dragging !== null ? 'crosshair' : 'default',
        }}
      >
        {/* Markings */}
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.3)' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 60, height: 60, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.3)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 50, border: '1px solid rgba(255,255,255,0.3)', borderBottom: 'none' }} />
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 120, height: 50, border: '1px solid rgba(255,255,255,0.3)', borderTop: 'none' }} />

        {slots.map((slot, i) => (
          <div
            key={i}
            onClick={(e) => { e.stopPropagation(); handleSlotClick(i); }}
            style={{
              position: 'absolute', left: `${slot.x}%`, top: `${slot.y}%`, transform: 'translate(-50%,-50%)',
              cursor: 'grab', textAlign: 'center', userSelect: 'none',
            }}
          >
            <div style={{
              width: 26, height: 26, borderRadius: '50%', background: posColor(slot.position),
              border: selectedSlot === i ? '3px solid #fff' : '2px solid rgba(255,255,255,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 800, color: '#fff', margin: '0 auto',
            }}>
              {slot.position}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: '#888', textAlign: 'center', marginBottom: 12 }}>
        Click a player dot, then click the pitch to reposition. Click a dot again to change position.
      </div>

      {/* Position selector for selected slot */}
      {selectedSlot !== null && (
        <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 6 }}>
          <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Change position for slot {selectedSlot + 1}:</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => changePosition(selectedSlot, pos)}
                style={{
                  padding: '3px 8px', fontSize: 11, borderRadius: 3, cursor: 'pointer',
                  border: slots[selectedSlot].position === pos ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.15)',
                  background: slots[selectedSlot].position === pos ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.05)',
                  color: posColor(pos), fontWeight: 700,
                }}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
