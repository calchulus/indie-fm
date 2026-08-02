import { League } from '../types';
import { PlayerDevelopmentState } from './development';

export interface SaveSlot {
  id: string;
  name: string;
  timestamp: number;
  seasonRound: number;
  userTeamName: string;
  leagueName: string;
}

export interface SaveData {
  version: number;
  savedAt: number;
  league: League;
  userTeamId: string;
  development: PlayerDevelopmentState;
}

const DB_NAME = 'indie-fm-saves';
const STORE_NAME = 'saves';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function listSaves(): Promise<SaveSlot[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => {
      const saves = (request.result as SaveData[]).map((s) => ({
        id: `save_${s.savedAt}`,
        name: `${s.league.name} — Round ${s.league.currentRound}`,
        timestamp: s.savedAt,
        seasonRound: s.league.currentRound,
        userTeamName: s.league.teams.find((t) => t.id === s.userTeamId)?.name ?? '?',
        leagueName: s.league.name,
      }));
      saves.sort((a, b) => b.timestamp - a.timestamp);
      resolve(saves);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveGame(league: League, userTeamId: string, development: PlayerDevelopmentState): Promise<void> {
  const db = await openDB();
  const data: SaveData & { id: string } = {
    id: `save_${Date.now()}`,
    version: 1,
    savedAt: Date.now(),
    league,
    userTeamId,
    development,
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadGame(saveId: string): Promise<SaveData | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(saveId);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteSave(saveId: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(saveId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export function exportSaveToFile(league: League, userTeamId: string, development: PlayerDevelopmentState): string {
  const data: SaveData = {
    version: 1,
    savedAt: Date.now(),
    league,
    userTeamId,
    development,
  };
  return JSON.stringify(data, null, 2);
}

export function importSaveFromFile(json: string): { success: boolean; data?: SaveData; error?: string } {
  try {
    const parsed = JSON.parse(json) as SaveData;
    if (!parsed.league || !parsed.userTeamId) {
      return { success: false, error: 'Invalid save file: missing league or userTeamId' };
    }
    return { success: true, data: parsed };
  } catch (e) {
    return { success: false, error: `Parse error: ${(e as Error).message}` };
  }
}

// --- Autosave (fixed key, overwrites each round) ---

const AUTOSAVE_KEY = 'autosave_latest';

export interface AutosaveData {
  version: number;
  savedAt: number;
  league: League;
  userTeamId: string;
  seasonNumber: number;
  board: unknown;
  finances: unknown;
  fanSentiment: unknown;
  training: unknown;
  injuries: unknown[];
  seasonHistory: unknown[];
  clubRecords: unknown;
  news: unknown[];
}

export async function autosave(data: AutosaveData): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put({ ...data, id: AUTOSAVE_KEY });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadAutosave(): Promise<AutosaveData | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(AUTOSAVE_KEY);
    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function hasAutosave(): Promise<boolean> {
  const data = await loadAutosave();
  return data !== null;
}
