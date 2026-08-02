import { useMemo } from 'react';

// Procedural club crest generator — every team gets a unique badge
// built from its colors, with varied shield shapes and field patterns.

export type ShieldShape = 'classic' | 'rounded' | 'pointed' | 'kite' | 'square';
export type CrestPattern = 'stripes' | 'hoops' | 'sash' | 'chevron' | 'solid' | 'halves' | 'cross' | 'bend';

const SHIELD_PATHS: Record<ShieldShape, string> = {
  classic: 'M50 4 L92 14 L92 52 C92 76 74 92 50 98 C26 92 8 76 8 52 L8 14 Z',
  rounded: 'M50 4 C74 4 92 10 92 10 L92 56 C92 80 72 94 50 98 C28 94 8 80 8 56 L8 10 C8 10 26 4 50 4 Z',
  pointed: 'M50 2 L94 12 L94 50 L50 98 L6 50 L6 12 Z',
  kite: 'M50 2 L90 26 L74 92 L50 98 L26 92 L10 26 Z',
  square: 'M10 6 L90 6 L90 78 C90 90 70 98 50 98 C30 98 10 90 10 78 Z',
};

const SHIELD_SHAPES: ShieldShape[] = ['classic', 'rounded', 'pointed', 'kite', 'square'];
const CREST_PATTERNS: CrestPattern[] = ['stripes', 'hoops', 'sash', 'chevron', 'solid', 'halves', 'cross', 'bend'];

export interface CrestConfig {
  shape: ShieldShape;
  pattern: CrestPattern;
  primary: string;
  secondary: string;
  accent: string;
  initials: string;
}

// Deterministic config from a team id + colors, so crests are stable
export function getCrestConfig(teamId: string, primary: string, secondary: string, teamName: string): CrestConfig {
  let hash = 0;
  for (let i = 0; i < teamId.length; i++) {
    hash = (hash * 31 + teamId.charCodeAt(i)) >>> 0;
  }
  const shape = SHIELD_SHAPES[hash % SHIELD_SHAPES.length];
  const pattern = CREST_PATTERNS[(hash >> 3) % CREST_PATTERNS.length];

  const initials = teamName
    .split(' ')
    .filter((w) => w.length > 2 || /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return { shape, pattern, primary, secondary, accent: '#f4c542', initials };
}

function PatternField({ pattern, primary, secondary }: { pattern: CrestPattern; primary: string; secondary: string }) {
  switch (pattern) {
    case 'stripes':
      return (
        <>
          <rect x="8" y="2" width="84" height="96" fill={primary} />
          <rect x="22" y="2" width="13" height="96" fill={secondary} />
          <rect x="48" y="2" width="13" height="96" fill={secondary} />
          <rect x="74" y="2" width="13" height="96" fill={secondary} />
        </>
      );
    case 'hoops':
      return (
        <>
          <rect x="8" y="2" width="84" height="96" fill={primary} />
          <rect x="8" y="16" width="84" height="12" fill={secondary} />
          <rect x="8" y="42" width="84" height="12" fill={secondary} />
          <rect x="8" y="68" width="84" height="12" fill={secondary} />
        </>
      );
    case 'sash':
      return (
        <>
          <rect x="8" y="2" width="84" height="96" fill={primary} />
          <polygon points="8,2 34,2 92,80 92,98 66,98 8,20" fill={secondary} />
        </>
      );
    case 'chevron':
      return (
        <>
          <rect x="8" y="2" width="84" height="96" fill={primary} />
          <polygon points="8,2 50,44 92,2 92,22 50,64 8,22" fill={secondary} />
        </>
      );
    case 'halves':
      return (
        <>
          <rect x="8" y="2" width="42" height="96" fill={primary} />
          <rect x="50" y="2" width="42" height="96" fill={secondary} />
        </>
      );
    case 'cross':
      return (
        <>
          <rect x="8" y="2" width="84" height="96" fill={primary} />
          <rect x="42" y="2" width="16" height="96" fill={secondary} />
          <rect x="8" y="38" width="84" height="16" fill={secondary} />
        </>
      );
    case 'bend':
      return (
        <>
          <rect x="8" y="2" width="84" height="96" fill={primary} />
          <polygon points="8,2 40,2 92,74 92,98 60,98 8,26" fill={secondary} />
        </>
      );
    case 'solid':
    default:
      return <rect x="8" y="2" width="84" height="96" fill={primary} />;
  }
}

export function ClubCrest({ teamId, primary, secondary, teamName, size = 40 }: {
  teamId: string; primary: string; secondary: string; teamName: string; size?: number;
}) {
  const cfg = useMemo(() => getCrestConfig(teamId, primary, secondary, teamName), [teamId, primary, secondary, teamName]);
  const clipId = `crest-clip-${cfg.shape}`;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-label={`${teamName} crest`} role="img">
      <defs>
        <clipPath id={clipId}>
          <path d={SHIELD_PATHS[cfg.shape]} />
        </clipPath>
      </defs>
      {/* Field pattern, clipped to shield */}
      <g clipPath={`url(#${clipId})`}>
        <PatternField pattern={cfg.pattern} primary={cfg.primary} secondary={cfg.secondary} />
        {/* subtle top sheen */}
        <path d={SHIELD_PATHS[cfg.shape]} fill="url(#none)" opacity="0" />
        <rect x="8" y="2" width="84" height="30" fill="#ffffff" opacity="0.08" />
      </g>
      {/* Shield outline */}
      <path d={SHIELD_PATHS[cfg.shape]} fill="none" stroke={cfg.accent} strokeWidth="3.5" strokeLinejoin="round" />
      <path d={SHIELD_PATHS[cfg.shape]} fill="none" stroke="#0d0d14" strokeWidth="1" opacity="0.5" />
      {/* Initials on a roundel */}
      <circle cx="50" cy="50" r="21" fill="#0d0d14" opacity="0.85" />
      <circle cx="50" cy="50" r="21" fill="none" stroke={cfg.accent} strokeWidth="2" />
      <text x="50" y="57" textAnchor="middle" fontSize="20" fontWeight="800" fill="#ffffff"
        fontFamily="'Arial Black', 'Segoe UI', sans-serif" letterSpacing="0.5">
        {cfg.initials}
      </text>
    </svg>
  );
}

// Small inline ball icon used across the UI
export function BallIcon({ size = 16, color = '#ffffff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={color} stroke="#0d0d14" strokeWidth="1.2" />
      <path d="M12 7 L16 10 L14.5 15 L9.5 15 L8 10 Z" fill="#0d0d14" opacity="0.85" />
      <path d="M12 7 L12 2.5 M16 10 L20.5 8.5 M14.5 15 L17 19.5 M9.5 15 L7 19.5 M8 10 L3.5 8.5" stroke="#0d0d14" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
