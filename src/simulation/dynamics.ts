import { Player, Team } from '../types';

export type SocialGroupType = 'senior' | 'youth' | 'foreign' | 'local' | 'clique';

export interface SocialGroup {
  id: string;
  name: string;
  type: SocialGroupType;
  memberIds: string[];
  influence: number;
  leaderId: string;
}

export interface MentoringGroup {
  id: string;
  mentorIds: string[];
  menteeIds: string[];
  focus: 'professionalism' | 'determination' | 'ambition' | 'general';
}

export interface SquadDynamics {
  socialGroups: SocialGroup[];
  mentoringGroups: MentoringGroup[];
  cohesion: number;
  hierarchy: string[];
  disputes: Array<{ playerA: string; playerB: string; severity: number }>;
}

export function computeSocialGroups(team: Team): SocialGroup[] {
  const players = team.players;
  const groups: SocialGroup[] = [];

  const seniors = players.filter((p) => p.age >= 30);
  if (seniors.length >= 2) {
    groups.push({
      id: 'grp_senior',
      name: 'Senior Players',
      type: 'senior',
      memberIds: seniors.map((p) => p.id),
      influence: 70 + seniors.length * 3,
      leaderId: seniors.sort((a, b) => b.attributes.leadership - a.attributes.leadership)[0].id,
    });
  }

  const youth = players.filter((p) => p.age <= 21);
  if (youth.length >= 2) {
    groups.push({
      id: 'grp_youth',
      name: 'Young Guns',
      type: 'youth',
      memberIds: youth.map((p) => p.id),
      influence: 30 + youth.length * 2,
      leaderId: youth.sort((a, b) => b.attributes.determination - a.attributes.determination)[0].id,
    });
  }

  const nationalities = new Map<string, Player[]>();
  for (const p of players) {
    const existing = nationalities.get(p.nationality) ?? [];
    existing.push(p);
    nationalities.set(p.nationality, existing);
  }
  for (const [nat, members] of nationalities) {
    if (members.length >= 3) {
      groups.push({
        id: `grp_${nat}`,
        name: `${nat} Contingent`,
        type: 'foreign',
        memberIds: members.map((p) => p.id),
        influence: 40 + members.length * 5,
        leaderId: members.sort((a, b) => b.reputation - a.reputation)[0].id,
      });
    }
  }

  return groups;
}

export function createMentoringGroups(team: Team): MentoringGroup[] {
  const players = team.players;
  const mentors = players.filter((p) => p.age >= 28 && p.attributes.determination >= 13 && p.hidden.professionalism >= 13);
  const mentees = players.filter((p) => p.age <= 22);

  const groups: MentoringGroup[] = [];
  const menteesPerGroup = Math.ceil(mentees.length / Math.max(1, mentors.length));

  mentors.forEach((mentor, i) => {
    const groupMentees = mentees.slice(i * menteesPerGroup, (i + 1) * menteesPerGroup);
    if (groupMentees.length > 0) {
      groups.push({
        id: `mentor_${i}`,
        mentorIds: [mentor.id],
        menteeIds: groupMentees.map((p) => p.id),
        focus: mentor.hidden.ambition >= 14 ? 'ambition' : 'professionalism',
      });
    }
  });

  return groups;
}

export function processMentoring(players: Player[], groups: MentoringGroup[]): Player[] {
  return players.map((player) => {
    const group = groups.find((g) => g.menteeIds.includes(player.id));
    if (!group) return player;
    if (player.age > 23) return player;

    const updated = { ...player, hidden: { ...player.hidden }, attributes: { ...player.attributes } };
    const growthChance = 0.1;

    if (Math.random() < growthChance) {
      if (group.focus === 'professionalism') updated.hidden.professionalism = Math.min(20, updated.hidden.professionalism + 1);
      else if (group.focus === 'ambition') updated.hidden.ambition = Math.min(20, updated.hidden.ambition + 1);
      else if (group.focus === 'determination') updated.attributes.determination = Math.min(20, updated.attributes.determination + 1);
      else {
        const hiddenAttrs = ['professionalism', 'ambition'] as const;
        const attr = hiddenAttrs[Math.floor(Math.random() * hiddenAttrs.length)];
        updated.hidden[attr] = Math.min(20, updated.hidden[attr] + 1);
      }
    }

    return updated;
  });
}

export function computeCohesion(groups: SocialGroup[], results: Array<'W' | 'D' | 'L'>): number {
  let cohesion = 50;
  const recentForm = results.slice(-5);
  for (const r of recentForm) {
    if (r === 'W') cohesion += 3;
    else if (r === 'L') cohesion -= 4;
  }
  if (groups.length > 4) cohesion -= 5;
  return Math.max(10, Math.min(100, cohesion));
}

export function computeHierarchy(team: Team): string[] {
  return [...team.players]
    .sort((a, b) => {
      const scoreA = a.attributes.leadership * 2 + a.reputation + a.appearances * 2 + (a.age > 28 ? 10 : 0);
      const scoreB = b.attributes.leadership * 2 + b.reputation + b.appearances * 2 + (b.age > 28 ? 10 : 0);
      return scoreB - scoreA;
    })
    .map((p) => p.id);
}

export function rollDisputes(players: Player[]): Array<{ playerA: string; playerB: string; severity: number }> {
  const disputes: Array<{ playerA: string; playerB: string; severity: number }> = [];
  if (Math.random() < 0.1 && players.length > 5) {
    const a = players[Math.floor(Math.random() * players.length)];
    const b = players[Math.floor(Math.random() * players.length)];
    if (a.id !== b.id) {
      disputes.push({ playerA: a.id, playerB: b.id, severity: Math.floor(Math.random() * 5) + 1 });
    }
  }
  return disputes;
}
