import { Player } from '../types';
import { getPlayerRadarData } from '../simulation/player-systems';

export function RadarChart({ player, size = 200, color = '#4ade80' }: { player: Player; size?: number; color?: string }) {
  const data = getPlayerRadarData(player);
  const { labels, values } = data;
  const center = size / 2;
  const radius = size * 0.38;
  const maxVal = 20;

  const points = values.map((val, i) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    const r = (val / maxVal) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  });

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(' ');

  // Grid rings
  const rings = [0.25, 0.5, 0.75, 1.0].map((scale) => {
    const ringPoints = labels.map((_, i) => {
      const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
      const r = scale * radius;
      return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
    }).join(' ');
    return ringPoints;
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Radar chart for ${player.name}`}>
      {/* Grid rings */}
      {rings.map((ring, i) => (
        <polygon key={i} points={ring} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      ))}

      {/* Axis lines */}
      {labels.map((_, i) => {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        return (
          <line
            key={i}
            x1={center}
            y1={center}
            x2={center + radius * Math.cos(angle)}
            y2={center + radius * Math.sin(angle)}
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />
        );
      })}

      {/* Data polygon */}
      <polygon points={polygonPoints} fill={`${color}33`} stroke={color} strokeWidth="2" />

      {/* Data points */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} />
      ))}

      {/* Labels */}
      {labels.map((label, i) => {
        const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
        const labelRadius = radius + 15;
        const x = center + labelRadius * Math.cos(angle);
        const y = center + labelRadius * Math.sin(angle);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#888" fontSize="10" fontWeight="600">
            {label}
          </text>
        );
      })}
    </svg>
  );
}

export function CompareRadarCharts({ playerA, playerB, size = 200 }: { playerA: Player; playerB: Player; size?: number }) {
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <RadarChart player={playerA} size={size} color="#4ade80" />
        <div style={{ fontSize: 12, color: '#4ade80', marginTop: 4 }}>{playerA.name}</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <RadarChart player={playerB} size={size} color="#60a5fa" />
        <div style={{ fontSize: 12, color: '#60a5fa', marginTop: 4 }}>{playerB.name}</div>
      </div>
    </div>
  );
}
