// Comprehensive SVG icon library for Indie FM
// All icons are inline SVG components, sized via the `size` prop.

interface IconProps { size?: number; color?: string; }

const S = ({ size = 18, children, viewBox = '0 0 24 24' }: { size?: number; children: React.ReactNode; viewBox?: string }) => (
  <svg width={size} height={size} viewBox={viewBox} fill="none" aria-hidden="true" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    {children}
  </svg>
);

// ── Position icons ──────────────────────────────────────────────
export const PositionIcon = ({ position, size = 16 }: { position: string; size?: number }) => {
  const colors: Record<string, string> = {
    GK: '#f4c542', CB: '#4a90d9', LB: '#4a90d9', RB: '#4a90d9',
    CDM: '#3aa655', CM: '#3aa655', CAM: '#3aa655',
    LW: '#e05a5a', RW: '#e05a5a', ST: '#e05a5a',
  };
  const color = colors[position] ?? '#888';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size + 8, height: size + 4, borderRadius: 4,
      background: `${color}22`, border: `1px solid ${color}66`,
      fontSize: size * 0.62, fontWeight: 800, color,
      fontFamily: "'Arial Black', sans-serif", letterSpacing: '-0.3px',
    }}>
      {position}
    </span>
  );
};

// ── Match event icons ───────────────────────────────────────────
export const GoalIcon = ({ size = 18 }: IconProps) => (
  <S size={size}>
    <circle cx="12" cy="12" r="9" fill="#fff" stroke="#0d0d14" strokeWidth="1.4" />
    <path d="M12 8 L15 10.2 L13.9 13.8 L10.1 13.8 L9 10.2 Z" fill="#0d0d14" />
    <path d="M12 8 L12 3.5 M15 10.2 L19 9 M13.9 13.8 L16.5 17.5 M10.1 13.8 L7.5 17.5 M9 10.2 L5 9" stroke="#0d0d14" strokeWidth="1" opacity="0.7" />
  </S>
);

export const YellowCardIcon = ({ size = 18 }: IconProps) => (
  <S size={size}>
    <rect x="7" y="3" width="10" height="15" rx="1.5" fill="#f4c542" stroke="#b8901f" strokeWidth="1" />
    <rect x="7" y="3" width="10" height="4" rx="1.5" fill="#fff" opacity="0.25" />
  </S>
);

export const RedCardIcon = ({ size = 18 }: IconProps) => (
  <S size={size}>
    <rect x="7" y="3" width="10" height="15" rx="1.5" fill="#e0393e" stroke="#a01f23" strokeWidth="1" />
    <rect x="7" y="3" width="10" height="4" rx="1.5" fill="#fff" opacity="0.25" />
  </S>
);

export const SubIcon = ({ size = 18 }: IconProps) => (
  <S size={size}>
    <path d="M7 10 L11 6 L11 8.5 L17 8.5 L17 11.5 L11 11.5 L11 14 Z" fill="#3aa655" />
    <path d="M17 14 L13 18 L13 15.5 L7 15.5 L7 12.5 L13 12.5 L13 10 Z" fill="#e05a5a" />
  </S>
);

export const InjuryIcon = ({ size = 18 }: IconProps) => (
  <S size={size}>
    <rect x="9" y="4" width="6" height="16" rx="3" fill="#e05a5a" />
    <rect x="4" y="9" width="16" height="6" rx="3" fill="#e05a5a" />
  </S>
);

export const WhistleIcon = ({ size = 18 }: IconProps) => (
  <S size={size}>
    <circle cx="9" cy="14" r="5.5" fill="#4a90d9" />
    <circle cx="9" cy="14" r="2" fill="#0d0d14" />
    <path d="M13 11 L20 7 L20 10 L14 13 Z" fill="#4a90d9" />
    <circle cx="20" cy="8.5" r="1.4" fill="#0d0d14" />
  </S>
);

// ── Stat icons ──────────────────────────────────────────────────
export const PossessionIcon = ({ size = 18, color = '#4a90d9' }: IconProps) => (
  <S size={size}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2.5" strokeDasharray="42 14" strokeLinecap="round" />
    <circle cx="12" cy="12" r="3" fill={color} />
  </S>
);

export const ShotIcon = ({ size = 18, color = '#e05a5a' }: IconProps) => (
  <S size={size}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="4.5" fill="none" stroke={color} strokeWidth="2" />
    <circle cx="12" cy="12" r="1.5" fill={color} />
  </S>
);

export const PassIcon = ({ size = 18, color = '#3aa655' }: IconProps) => (
  <S size={size}>
    <circle cx="6" cy="12" r="3" fill={color} />
    <circle cx="18" cy="12" r="3" fill="none" stroke={color} strokeWidth="2" />
    <path d="M9 12 L15 12 M13 9.5 L15.5 12 L13 14.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const TackleIcon = ({ size = 18, color = '#f4c542' }: IconProps) => (
  <S size={size}>
    <path d="M5 19 L11 13 M11 13 L9 8 M11 13 L16 11" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="17" cy="7" r="3" fill="none" stroke={color} strokeWidth="2" />
  </S>
);

// ── Morale / condition ──────────────────────────────────────────
export const MoraleIcon = ({ level, size = 18 }: { level: number; size?: number }) => {
  const color = level >= 7 ? '#3aa655' : level >= 4 ? '#f4c542' : '#e05a5a';
  const faces = level >= 7 ? 'M8 14 Q12 18 16 14' : level >= 4 ? 'M8 15 L16 15' : 'M8 16 Q12 12 16 16';
  return (
    <S size={size}>
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="9" cy="10" r="1.3" fill={color} />
      <circle cx="15" cy="10" r="1.3" fill={color} />
      <path d={faces} stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </S>
  );
};

export const FitnessIcon = ({ level, size = 18 }: { level: number; size?: number }) => {
  const color = level >= 80 ? '#3aa655' : level >= 60 ? '#f4c542' : '#e05a5a';
  return (
    <S size={size}>
      <path d="M12 20 C12 20 4 14 4 9 C4 6 6.5 4 9 4 C10.5 4 12 5 12 5 C12 5 13.5 4 15 4 C17.5 4 20 6 20 9 C20 14 12 20 12 20 Z" fill={color} />
    </S>
  );
};

export const FormIcon = ({ form, size = 18 }: { form: number; size?: number }) => {
  const color = form >= 7 ? '#3aa655' : form >= 4 ? '#f4c542' : '#e05a5a';
  const bars = [0.4, 0.6, 0.5, 0.8, 1].map((h) => h * (form / 10));
  return (
    <S size={size}>
      {bars.map((h, i) => (
        <rect key={i} x={4 + i * 3.4} y={20 - h * 14} width="2.4" height={h * 14} rx="1" fill={color} opacity={0.5 + h * 0.5} />
      ))}
    </S>
  );
};

// ── Weather ─────────────────────────────────────────────────────
export const WeatherIcon = ({ condition, size = 20 }: { condition: string; size?: number }) => {
  switch (condition) {
    case 'clear':
      return <S size={size}><circle cx="12" cy="12" r="5" fill="#f4c542" />{[0, 45, 90, 135, 180, 225, 270, 315].map((a) => <line key={a} x1="12" y1="3" x2="12" y2="5.5" stroke="#f4c542" strokeWidth="2" strokeLinecap="round" transform={`rotate(${a} 12 12)`} />)}</S>;
    case 'cloudy':
      return <S size={size}><path d="M7 17 C4.5 17 3 15.3 3 13.3 C3 11.5 4.4 10 6.3 10 C6.6 7.5 8.7 6 11 6 C13.5 6 15.5 7.8 15.9 10.2 C18 10.3 19.5 11.8 19.5 13.8 C19.5 15.8 18 17 16 17 Z" fill="#aab4c2" /></S>;
    case 'rain':
      return <S size={size}><path d="M7 14 C4.5 14 3 12.3 3 10.3 C3 8.5 4.4 7 6.3 7 C6.6 4.5 8.7 3 11 3 C13.5 3 15.5 4.8 15.9 7.2 C18 7.3 19.5 8.8 19.5 10.8 C19.5 12.8 18 14 16 14 Z" fill="#7a8699" /><path d="M7 17 L6 20 M11 17 L10 20 M15 17 L14 20" stroke="#4a90d9" strokeWidth="1.8" strokeLinecap="round" /></S>;
    case 'heavy_rain':
      return <S size={size}><path d="M7 13 C4.5 13 3 11.3 3 9.3 C3 7.5 4.4 6 6.3 6 C6.6 3.5 8.7 2 11 2 C13.5 2 15.5 3.8 15.9 6.2 C18 6.3 19.5 7.8 19.5 9.8 C19.5 11.8 18 13 16 13 Z" fill="#5a6678" /><path d="M6 16 L4.5 20 M10 16 L8.5 20 M14 16 L12.5 20 M18 16 L16.5 20" stroke="#4a90d9" strokeWidth="2" strokeLinecap="round" /></S>;
    case 'snow':
      return <S size={size}><path d="M7 13 C4.5 13 3 11.3 3 9.3 C3 7.5 4.4 6 6.3 6 C6.6 3.5 8.7 2 11 2 C13.5 2 15.5 3.8 15.9 6.2 C18 6.3 19.5 7.8 19.5 9.8 C19.5 11.8 18 13 16 13 Z" fill="#cdd6e0" /><circle cx="7" cy="17" r="1.2" fill="#e8eef5" /><circle cx="12" cy="19" r="1.2" fill="#e8eef5" /><circle cx="16" cy="16.5" r="1.2" fill="#e8eef5" /><circle cx="9.5" cy="20" r="1.2" fill="#e8eef5" /></S>;
    case 'wind':
      return <S size={size}><path d="M3 8 L15 8 C17.5 8 17.5 4.5 15 5 M3 12 L18 12 C21 12 21 8 18 8.5 M3 16 L13 16 C15.5 16 15.5 19.5 13 19" stroke="#aab4c2" strokeWidth="2" strokeLinecap="round" fill="none" /></S>;
    default:
      return <S size={size}><circle cx="12" cy="12" r="5" fill="#f4c542" /></S>;
  }
};

// ── Section / nav icons ─────────────────────────────────────────
export const TrophyIcon = ({ size = 18, color = '#f4c542' }: IconProps) => (
  <S size={size}>
    <path d="M7 4 L17 4 L17 8 C17 11 14.5 13 12 13 C9.5 13 7 11 7 8 Z" fill={color} />
    <path d="M7 5 L4 5 C4 8 5.5 9 7 9 M17 5 L20 5 C20 8 18.5 9 17 9" stroke={color} strokeWidth="1.6" fill="none" />
    <path d="M10 13 L10 16 L14 16 L14 13 M8 19 L16 19 L15 16 L9 16 Z" fill={color} />
  </S>
);

export const TacticsIcon = ({ size = 18, color = '#4a90d9' }: IconProps) => (
  <S size={size}>
    <rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke={color} strokeWidth="1.6" />
    <line x1="3" y1="12" x2="21" y2="12" stroke={color} strokeWidth="1.2" />
    <circle cx="12" cy="12" r="2.5" fill="none" stroke={color} strokeWidth="1.2" />
    <circle cx="7" cy="7" r="1.6" fill={color} /><circle cx="17" cy="7" r="1.6" fill={color} />
    <circle cx="12" cy="16" r="1.6" fill={color} /><circle cx="7" cy="17" r="1.6" fill={color} /><circle cx="17" cy="17" r="1.6" fill={color} />
  </S>
);

export const TransferIcon = ({ size = 18, color = '#3aa655' }: IconProps) => (
  <S size={size}>
    <path d="M4 8 L14 8 M11 5 L14 8 L11 11" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 16 L10 16 M13 13 L10 16 L13 19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </S>
);

export const SquadIcon = ({ size = 18, color = '#e0e0e0' }: IconProps) => (
  <S size={size}>
    <circle cx="9" cy="8" r="3" fill={color} /><path d="M4 19 C4 15 6 13 9 13 C12 13 14 15 14 19" fill={color} />
    <circle cx="16" cy="9" r="2.5" fill={color} opacity="0.6" /><path d="M13 19 C13 16 14.5 14.5 16 14.5 C18.5 14.5 20 16 20 19" fill={color} opacity="0.6" />
  </S>
);

export const ClubIcon = ({ size = 18, color = '#f4c542' }: IconProps) => (
  <S size={size}>
    <path d="M12 3 L20 8 L20 20 L4 20 L4 8 Z" fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    <path d="M4 8 L12 3 L20 8" fill={color} opacity="0.3" />
    <rect x="9" y="13" width="4" height="7" fill={color} />
    <rect x="6" y="10" width="2.5" height="3" fill={color} opacity="0.6" /><rect x="15.5" y="10" width="2.5" height="3" fill={color} opacity="0.6" />
  </S>
);

export const MediaIcon = ({ size = 18, color = '#e0e0e0' }: IconProps) => (
  <S size={size}>
    <rect x="3" y="5" width="18" height="13" rx="2" fill="none" stroke={color} strokeWidth="1.6" />
    <path d="M3 8 L21 8" stroke={color} strokeWidth="1.2" />
    <circle cx="6" cy="6.5" r="0.8" fill={color} /><circle cx="8.5" cy="6.5" r="0.8" fill={color} />
    <path d="M6 12 L11 12 M6 15 L14 15" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
  </S>
);

export const ChartIcon = ({ size = 18, color = '#4a90d9' }: IconProps) => (
  <S size={size}>
    <path d="M4 20 L4 4 M4 20 L20 20" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
    <rect x="7" y="12" width="2.5" height="8" fill={color} /><rect x="11" y="8" width="2.5" height="12" fill={color} /><rect x="15" y="5" width="2.5" height="15" fill={color} />
  </S>
);

export const ProfileIcon = ({ size = 18, color = '#e0e0e0' }: IconProps) => (
  <S size={size}>
    <circle cx="12" cy="8" r="4" fill="none" stroke={color} strokeWidth="1.8" />
    <path d="M4 20 C4 15 7.5 13 12 13 C16.5 13 20 15 20 20" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </S>
);

export const GearIcon = ({ size = 18, color = '#e0e0e0' }: IconProps) => (
  <S size={size}>
    <circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth="1.8" />
    <path d="M12 2 L12 5 M12 19 L12 22 M2 12 L5 12 M19 12 L22 12 M4.9 4.9 L7 7 M17 17 L19.1 19.1 M19.1 4.9 L17 7 M7 17 L4.9 19.1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
  </S>
);

// Map section ids to icons for the nav
const BallIcon = ({ size = 18, color = '#e0e0e0' }: { size?: number; color?: string }) => (
  <S size={size}>
    <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="1.8" />
    <path d="M12 7 L15 9.5 L14 13 L10 13 L9 9.5 Z" fill={color} />
  </S>
);

export const SECTION_ICONS: Record<string, (p: { size?: number }) => React.ReactElement> = {
  match: BallIcon,
  league: ChartIcon,
  tactics: TacticsIcon,
  squad: SquadIcon,
  transfers: TransferIcon,
  club: ClubIcon,
  media: MediaIcon,
  compete: TrophyIcon,
  profile: ProfileIcon,
  system: GearIcon,
};
