import { MatchState, Team } from '../types';
import { simulateMinutes } from '../simulation/engine';

export interface SimRequest {
  type: 'simMinutes';
  state: MatchState;
  home: Team;
  away: Team;
  minutes: number;
}

export interface SimResponse {
  type: 'result';
  state: MatchState;
}

export function createSimWorker(): Worker {
  const workerCode = `
    import { simulateMinutes } from './simulation/engine';
    self.onmessage = (e) => {
      const { state, home, away, minutes } = e.data;
      const result = simulateMinutes(state, home, away, minutes);
      self.postMessage({ type: 'result', state: result });
    };
  `;
  const blob = new Blob([workerCode], { type: 'application/javascript' });
  return new Worker(URL.createObjectURL(blob), { type: 'module' });
}

export function simInWorker(
  state: MatchState,
  home: Team,
  away: Team,
  minutes: number,
): Promise<MatchState> {
  return new Promise((resolve) => {
    const worker = createSimWorker();
    worker.onmessage = (e: MessageEvent<SimResponse>) => {
      resolve(e.data.state);
      worker.terminate();
    };
    worker.postMessage({ type: 'simMinutes', state, home, away, minutes });
  });
}

export function simSync(state: MatchState, home: Team, away: Team, minutes: number): MatchState {
  return simulateMinutes(state, home, away, minutes);
}
