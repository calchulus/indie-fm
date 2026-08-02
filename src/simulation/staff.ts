export type StaffRole =
  | 'assistant_manager'
  | 'coach_attacking'
  | 'coach_defending'
  | 'coach_fitness'
  | 'coach_goalkeeping'
  | 'coach_technical'
  | 'coach_tactical'
  | 'coach_set_pieces'
  | 'chief_scout'
  | 'scout'
  | 'physio'
  | 'sports_scientist'
  | 'data_analyst'
  | 'director_of_football'
  | 'head_of_youth';

export interface StaffAttributes {
  attacking: number;
  defending: number;
  fitness: number;
  goalkeeping: number;
  tactical: number;
  technical: number;
  mental: number;
  workingWithYoungsters: number;
  judgingAbility: number;
  judgingPotential: number;
  physiotherapy: number;
  sportsScience: number;
  dataAnalysis: number;
  manManagement: number;
  discipline: number;
  determination: number;
}

export interface StaffMember {
  id: string;
  name: string;
  nationality: string;
  age: number;
  role: StaffRole;
  attributes: StaffAttributes;
  wage: number;
  contractExpiry: number;
  reputation: number;
}

export interface StaffJob {
  role: StaffRole;
  filled: boolean;
  staffId?: string;
}

const ROLE_LABELS: Record<StaffRole, string> = {
  assistant_manager: 'Assistant Manager',
  coach_attacking: 'Attacking Coach',
  coach_defending: 'Defending Coach',
  coach_fitness: 'Fitness Coach',
  coach_goalkeeping: 'Goalkeeping Coach',
  coach_technical: 'Technical Coach',
  coach_tactical: 'Tactical Coach',
  coach_set_pieces: 'Set Piece Coach',
  chief_scout: 'Chief Scout',
  scout: 'Scout',
  physio: 'Physiotherapist',
  sports_scientist: 'Sports Scientist',
  data_analyst: 'Data Analyst',
  director_of_football: 'Director of Football',
  head_of_youth: 'Head of Youth Development',
};

export function getRoleLabel(role: StaffRole): string {
  return ROLE_LABELS[role];
}

export function generateStaff(role: StaffRole): StaffMember {
  const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
  const names = ['Alan Bridges', 'Roberto Silva', 'Klaus Fischer', 'Jean-Paul Moreau', 'Giuseppe Conti', 'Sven Andersson', 'Piotr Nowak', 'David O\'Leary'];

  const attrs: StaffAttributes = {
    attacking: rand(5, 16), defending: rand(5, 16), fitness: rand(5, 16),
    goalkeeping: rand(5, 16), tactical: rand(5, 16), technical: rand(5, 16),
    mental: rand(5, 16), workingWithYoungsters: rand(5, 16),
    judgingAbility: rand(5, 16), judgingPotential: rand(5, 16),
    physiotherapy: rand(5, 16), sportsScience: rand(5, 16),
    dataAnalysis: rand(5, 16), manManagement: rand(5, 16),
    discipline: rand(5, 16), determination: rand(5, 16),
  };

  if (role.startsWith('coach')) {
    const specialty = role.replace('coach_', '') as keyof StaffAttributes;
    if (specialty in attrs) attrs[specialty] = rand(12, 20);
    attrs.tactical = rand(10, 18);
  } else if (role === 'scout' || role === 'chief_scout') {
    attrs.judgingAbility = rand(12, 20);
    attrs.judgingPotential = rand(12, 20);
  } else if (role === 'physio') {
    attrs.physiotherapy = rand(12, 20);
  } else if (role === 'sports_scientist') {
    attrs.sportsScience = rand(12, 20);
  } else if (role === 'data_analyst') {
    attrs.dataAnalysis = rand(12, 20);
  }

  return {
    id: `staff_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: names[Math.floor(Math.random() * names.length)],
    nationality: 'England',
    age: rand(35, 62),
    role,
    attributes: attrs,
    wage: rand(3000, 15000),
    contractExpiry: 2026 + rand(1, 3),
    reputation: rand(30, 80),
  };
}

export function getCoachingQuality(staff: StaffMember[], category: 'attacking' | 'defending' | 'fitness' | 'tactical' | 'technical'): number {
  const relevant = staff.filter((s) => s.role === `coach_${category}`);
  if (relevant.length === 0) return 5;
  const best = relevant.reduce((b, s) => s.attributes[category] > b.attributes[category] ? s : b);
  return best.attributes[category];
}

export function getScoutingQuality(staff: StaffMember[]): number {
  const scouts = staff.filter((s) => s.role === 'scout' || s.role === 'chief_scout');
  if (scouts.length === 0) return 5;
  return Math.round(scouts.reduce((s, sc) => s + (sc.attributes.judgingAbility + sc.attributes.judgingPotential) / 2, 0) / scouts.length);
}

export function getMedicalQuality(staff: StaffMember[]): number {
  const medics = staff.filter((s) => s.role === 'physio' || s.role === 'sports_scientist');
  if (medics.length === 0) return 5;
  return Math.round(medics.reduce((s, m) => s + (m.attributes.physiotherapy + m.attributes.sportsScience) / 2, 0) / medics.length);
}

export function generateDefaultBackroom(): StaffMember[] {
  const roles: StaffRole[] = [
    'assistant_manager', 'coach_attacking', 'coach_defending', 'coach_fitness',
    'coach_goalkeeping', 'chief_scout', 'scout', 'scout', 'physio', 'head_of_youth',
  ];
  return roles.map((role) => generateStaff(role));
}
