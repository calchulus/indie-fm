import { Team } from '../types';

export type NewsCategory = 'transfer' | 'match' | 'club' | 'league' | 'international' | 'media' | 'fan';

export interface NewsItem {
  id: string;
  round: number;
  category: NewsCategory;
  headline: string;
  body: string;
  teamId?: string;
  playerId?: string;
  importance: 'low' | 'medium' | 'high';
  read: boolean;
}

export interface PressConference {
  id: string;
  round: number;
  type: 'pre_match' | 'post_match' | 'transfer' | 'general';
  questions: PressQuestion[];
  answered: boolean;
}

export interface PressQuestion {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; tone: 'positive' | 'neutral' | 'negative' | 'controversial' }>;
  chosenOptionId?: string;
}

export interface FanSentiment {
  happiness: number;
  attendance: number;
  trustInManager: number;
  transferWindowApproval: number;
  recentMood: Array<{ round: number; mood: number }>;
}

export interface SocialPost {
  id: string;
  author: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  likes: number;
  round: number;
}

let newsId = 0;

export function generateMatchNews(
  round: number,
  homeTeam: Team,
  awayTeam: Team,
  homeGoals: number,
  awayGoals: number,
): NewsItem[] {
  const items: NewsItem[] = [];
  const result = homeGoals > awayGoals ? 'win' : homeGoals < awayGoals ? 'loss' : 'draw';

  items.push({
    id: `news_${++newsId}`,
    round,
    category: 'match',
    headline: `${homeTeam.name} ${homeGoals}-${awayGoals} ${awayTeam.name}`,
    body: result === 'win'
      ? `${homeTeam.name} secured a ${homeGoals}-${awayGoals} victory over ${awayTeam.name}.`
      : result === 'loss'
        ? `${awayTeam.name} took all three points with a ${awayGoals}-${homeGoals} win at ${homeTeam.stadium}.`
        : `Honours even as ${homeTeam.name} and ${awayTeam.name} share the spoils.`,
    teamId: homeTeam.id,
    importance: 'medium',
    read: false,
  });

  return items;
}

export function generateTransferNews(round: number, playerName: string, fromTeam: string, toTeam: string, fee: number): NewsItem {
  return {
    id: `news_${++newsId}`,
    round,
    category: 'transfer',
    headline: `${playerName} completes move to ${toTeam}`,
    body: `${toTeam} have signed ${playerName} from ${fromTeam} for a fee of £${(fee / 1_000_000).toFixed(1)}M.`,
    importance: 'high',
    read: false,
  };
}

export function generatePreMatchPress(round: number, opponent: Team, isHome: boolean): PressConference {
  const questions: PressQuestion[] = [
    {
      id: 'q1',
      question: `How do you rate ${opponent.name}'s chances this season?`,
      options: [
        { id: 'a', text: 'They have quality, but we\'re focused on ourselves', tone: 'neutral' },
        { id: 'b', text: 'They\'ll be tough, but I back my players completely', tone: 'positive' },
        { id: 'c', text: 'I don\'t waste time talking about other teams', tone: 'negative' },
      ],
    },
    {
      id: 'q2',
      question: isHome ? 'What can the fans expect this weekend?' : 'How do you prepare for a tough away trip?',
      options: [
        { id: 'a', text: 'We\'ll go out and express ourselves', tone: 'positive' },
        { id: 'b', text: 'It\'s about being disciplined and taking our chances', tone: 'neutral' },
        { id: 'c', text: 'I don\'t make promises, we just work hard', tone: 'neutral' },
      ],
    },
    {
      id: 'q3',
      question: 'Any injury updates ahead of the match?',
      options: [
        { id: 'a', text: 'Everyone is fit and available', tone: 'positive' },
        { id: 'b', text: 'We have a few doubts, we\'ll assess late', tone: 'neutral' },
        { id: 'c', text: 'I\'m not giving the opposition any information', tone: 'controversial' },
      ],
    },
  ];

  return { id: `press_${round}`, round, type: 'pre_match', questions, answered: false };
}

export function generatePostMatchPress(round: number, won: boolean, scoreline: string): PressConference {
  const questions: PressQuestion[] = [
    {
      id: 'q1',
      question: won ? 'How pleased are you with that performance?' : 'What went wrong out there today?',
      options: [
        { id: 'a', text: won ? 'Delighted. The players were outstanding.' : 'We weren\'t good enough. Simple as that.', tone: won ? 'positive' : 'negative' },
        { id: 'b', text: 'Credit to the players, they showed character.', tone: 'positive' },
        { id: 'c', text: 'I\'ll reflect on it and move on.', tone: 'neutral' },
      ],
    },
    {
      id: 'q2',
      question: `The scoreline was ${scoreline}. What\'s your assessment?`,
      options: [
        { id: 'a', text: 'The scoreline reflects the game.', tone: 'neutral' },
        { id: 'b', text: 'We created enough to win comfortably.', tone: 'positive' },
        { id: 'c', text: 'Fine margins decided it.', tone: 'neutral' },
      ],
    },
  ];

  return { id: `press_post_${round}`, round, type: 'post_match', questions, answered: false };
}

export function processPressAnswer(conference: PressConference, questionId: string, optionId: string): { moraleEffect: number; boardEffect: number; fanEffect: number } {
  const question = conference.questions.find((q) => q.id === questionId);
  const option = question?.options.find((o) => o.id === optionId);
  if (!option) return { moraleEffect: 0, boardEffect: 0, fanEffect: 0 };

  switch (option.tone) {
    case 'positive': return { moraleEffect: 1, boardEffect: 1, fanEffect: 2 };
    case 'neutral': return { moraleEffect: 0, boardEffect: 0, fanEffect: 0 };
    case 'negative': return { moraleEffect: -1, boardEffect: -1, fanEffect: -1 };
    case 'controversial': return { moraleEffect: Math.random() > 0.5 ? 2 : -2, boardEffect: -2, fanEffect: Math.random() > 0.5 ? 3 : -3 };
  }
}

export function createFanSentiment(team: Team): FanSentiment {
  return {
    happiness: 50 + Math.round(team.reputation * 0.2),
    attendance: Math.round(team.capacity * 0.8),
    trustInManager: 60,
    transferWindowApproval: 50,
    recentMood: [],
  };
}

export function updateFanSentiment(sentiment: FanSentiment, won: boolean, round: number, signing?: string): FanSentiment {
  let happiness = sentiment.happiness;
  let trust = sentiment.trustInManager;

  if (won) { happiness += 3; trust += 1; }
  else { happiness -= 4; trust -= 2; }

  if (signing) { happiness += 2; }

  happiness = Math.max(0, Math.min(100, happiness));
  trust = Math.max(0, Math.min(100, trust));

  const attendanceShift = won ? 200 : -300;
  const attendance = Math.max(5000, sentiment.attendance + attendanceShift);

  return {
    ...sentiment,
    happiness,
    trustInManager: trust,
    attendance,
    recentMood: [...sentiment.recentMood.slice(-9), { round, mood: happiness }],
  };
}

export function generateSocialPosts(round: number, teamName: string, won: boolean): SocialPost[] {
  const posts: SocialPost[] = [];
  const fanNames = ['@UltraFan99', '@TerraceHero', '@MatchdayMike', '@SeasonTicketSam', '@GoalLineGaz'];

  if (won) {
    posts.push({ id: `social_${round}_1`, author: fanNames[0], content: `COME ON YOU ${teamName.toUpperCase()}! What a result! 🔥⚽`, sentiment: 'positive', likes: Math.floor(Math.random() * 500) + 100, round });
    posts.push({ id: `social_${round}_2`, author: fanNames[1], content: 'The lads showed real character today. Proud of this team.', sentiment: 'positive', likes: Math.floor(Math.random() * 300) + 50, round });
  } else {
    posts.push({ id: `social_${round}_1`, author: fanNames[2], content: 'Not good enough. We need to do better. #disappointed', sentiment: 'negative', likes: Math.floor(Math.random() * 400) + 80, round });
    posts.push({ id: `social_${round}_2`, author: fanNames[3], content: 'Tactics need a rethink. The gaffer has to adapt.', sentiment: 'negative', likes: Math.floor(Math.random() * 200) + 30, round });
  }

  return posts;
}
