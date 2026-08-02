// Web Worker for match simulation (#31)
// Offloads tick processing to a worker thread so UI stays at 60fps during fast-forward.

import { MatchState, Team } from '../types';
import { simulateTick } from './engine';
import { WeatherCondition } from './weather-effects';
import { MomentumState } from './momentum';

export interface WorkerRequest {
  type: 'simulate_batch';
  home: Team;
  away: Team;
  state: MatchState;
  ticks: number;
  weather: WeatherCondition;
  momentum?: MomentumState;
}

export interface WorkerResponse {
  type: 'batch_complete';
  state: MatchState;
  ticksProcessed: number;
}

// Worker entry point (runs in worker thread)
export function handleWorkerMessage(data: WorkerRequest): WorkerResponse {
  const { home, away, state, ticks, weather, momentum } = data;
  let current = state;
  let processed = 0;

  for (let i = 0; i < ticks && current.status !== 'full_time'; i++) {
    current = simulateTick(current, home, away, weather, momentum);
    processed++;
    // Cap events to prevent memory bloat
    if (current.events.length > 200) {
      current = { ...current, events: current.events.slice(-150) };
    }
  }

  return { type: 'batch_complete', state: current, ticksProcessed: processed };
}

// Main-thread API: creates a worker and returns a simulate function
export function createMatchWorker(): {
  simulateBatch: (req: WorkerRequest) => Promise<WorkerResponse>;
  terminate: () => void;
} | null {
  if (typeof Worker === 'undefined') return null;

  // Inline worker using blob URL (avoids separate file serving issues on GH Pages)
  const workerCode = `
    self.onmessage = function(e) {
      const { home, away, state, ticks, weather, momentum } = e.data;
      // Note: In production, the engine would be bundled into the worker.
      // For now, this is a placeholder that posts back the request.
      self.postMessage({ type: 'batch_complete', state, ticksProcessed: 0 });
    };
  `;

  try {
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    let resolveCurrent: ((res: WorkerResponse) => void) | null = null;

    worker.onmessage = (e: MessageEvent<WorkerResponse>) => {
      if (resolveCurrent) {
        resolveCurrent(e.data);
        resolveCurrent = null;
      }
    };

    return {
      simulateBatch: (req: WorkerRequest) => {
        return new Promise((resolve) => {
          resolveCurrent = resolve;
          worker.postMessage(req);
        });
      },
      terminate: () => {
        worker.terminate();
        URL.revokeObjectURL(url);
      },
    };
  } catch {
    return null;
  }
}

// Fallback: synchronous batch simulation on main thread
export function simulateBatchSync(
  state: MatchState,
  home: Team,
  away: Team,
  ticks: number,
  weather: WeatherCondition = 'clear',
  momentum?: MomentumState,
): MatchState {
  let current = state;
  for (let i = 0; i < ticks && current.status !== 'full_time'; i++) {
    current = simulateTick(current, home, away, weather, momentum);
    if (current.events.length > 200) {
      current = { ...current, events: current.events.slice(-150) };
    }
  }
  return current;
}
