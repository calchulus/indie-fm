import { MatchEventType } from '../types';

const COMMENTARY: Record<string, string[]> = {
  goal: [
    '⚽ GOAL! {player} finds the back of the net!',
    '⚽ WHAT A FINISH! {player} slots it home!',
    '⚽ {player} makes no mistake — it\'s in!',
    '⚽ Clinical from {player}! The keeper had no chance!',
    '⚽ {player} buries it! The crowd erupts!',
    '⚽ Superb strike from {player}! Top corner!',
  ],
  shot: [
    '{player} lets fly from distance — just wide!',
    '{player} shoots... narrowly off target!',
    'A speculative effort from {player} sails over!',
    '{player} tries his luck — inches past the post!',
    '{player} fires in a shot — deflected away!',
  ],
  save: [
    '🧤 Brilliant save! The keeper denies {player}!',
    '🧤 What a stop! {player} can\'t believe it!',
    '🧤 The goalkeeper gets down well to keep it out!',
    '🧤 Fingertip save! {player} is denied!',
  ],
  tackle: [
    '{player} wins the ball with a crunching tackle!',
    '{player} slides in and takes the ball cleanly!',
    'Good defensive work from {player} to win possession!',
    '{player} reads the game well and intercepts!',
  ],
  foul: [
    '{player} gives away a cheap foul!',
    'The referee blows for a foul on {player}!',
    'Cynical challenge from {player} — free kick!',
    '{player} mistimes the challenge and concedes a free kick!',
  ],
  yellow_card: [
    '🟨 {player} is shown the yellow card!',
    '🟨 The referee reaches for his pocket — yellow for {player}!',
    '🟨 Booking for {player} after a late challenge!',
  ],
  red_card: [
    '🟥 RED CARD! {player} is sent off!',
    '🟥 The referee has no choice — {player} sees red!',
    '🟥 {player} is dismissed! Down to 10 men!',
  ],
  corner: [
    'Corner kick awarded!',
    'The ball goes out for a corner!',
    'Deflected behind — corner!',
  ],
  pass: [
    '{player} picks out a team-mate with a nice pass!',
    '{player} keeps it simple with a short pass!',
    'Good ball from {player} into space!',
  ],
};

export function getCommentary(type: MatchEventType, playerName?: string): string {
  const templates = COMMENTARY[type];
  if (!templates || templates.length === 0) return '';
  const template = templates[Math.floor(Math.random() * templates.length)];
  return template.replace('{player}', playerName ?? 'The player');
}
