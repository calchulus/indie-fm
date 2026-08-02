import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { getDefaultTicketPricing, calculateMatchdayRevenue, TicketPricing } from '../simulation/systems-2';

export function TicketPricingUI() {
  const { league, userTeamId } = useGameStore();
  const [pricing, setPricing] = useState<TicketPricing | null>(null);

  if (!league || !userTeamId) return null;
  const team = league.teams.find((t) => t.id === userTeamId);
  if (!team) return null;

  const currentPricing = pricing ?? getDefaultTicketPricing(team.reputation);
  const attendance = Math.round(team.capacity * 0.8);
  const revenue = calculateMatchdayRevenue(currentPricing, attendance, team.capacity);

  const updatePricing = (field: keyof TicketPricing, value: number) => {
    setPricing({ ...currentPricing, [field]: value });
  };

  return (
    <div style={{ padding: '12px 16px', overflowY: 'auto', height: '100%' }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15 }}>🎫 Ticket Pricing</h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Stadium Capacity</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{team.capacity.toLocaleString()}</div>
        </div>
        <div style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
          <div style={{ fontSize: 12, color: '#888', marginBottom: 4 }}>Est. Matchday Revenue</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#4ade80' }}>£{(revenue / 1_000_000).toFixed(2)}M</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <PricingSlider label="Standard Ticket" value={currentPricing.standard} min={10} max={100} onChange={(v) => updatePricing('standard', v)} />
        <PricingSlider label="Premium Ticket" value={currentPricing.premium} min={20} max={200} onChange={(v) => updatePricing('premium', v)} />
        <PricingSlider label="VIP Ticket" value={currentPricing.vip} min={50} max={500} onChange={(v) => updatePricing('vip', v)} />
        <PricingSlider label="Season Ticket" value={currentPricing.seasonTicket} min={200} max={2000} onChange={(v) => updatePricing('seasonTicket', v)} />
      </div>
    </div>
  );
}

function PricingSlider({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600 }}>£{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={5}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%' }}
      />
    </div>
  );
}
