import type { ActiveSessionState, PlayerProgress, GameStateRepository } from './types';

const SCHEMA_VERSION = 1;
const DEFAULT_GAME_ID = 'jealous_wife';

const STORAGE_KEYS = {
  session: (gameId: string) => `detective:v${SCHEMA_VERSION}:${gameId}:session`,
  progress: `detective:v${SCHEMA_VERSION}:${DEFAULT_GAME_ID}:progress`,
  corkboard: (caseId: string) => `detective:v${SCHEMA_VERSION}:${caseId || 'case_hoang_01'}:corkboard_state`,
};

/**
 * Client-Side LocalStorage Adapter for GameStateRepository (Phase 1 MVP).
 * Fully decoupled and Promise-based for seamless Phase 2 Cloud BaaS swap.
 */
export class LocalStorageAdapter implements GameStateRepository {
  async getActiveSession(gameId: string = DEFAULT_GAME_ID): Promise<ActiveSessionState | null> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session(gameId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as ActiveSessionState;
      if (!parsed || parsed.schemaVersion !== SCHEMA_VERSION || !parsed.caseId) {
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  async saveActiveSession(session: ActiveSessionState): Promise<void> {
    try {
      const payload: ActiveSessionState = {
        ...session,
        schemaVersion: SCHEMA_VERSION,
        lastSavedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEYS.session(session.gameId || DEFAULT_GAME_ID), JSON.stringify(payload));
    } catch (e) {
      console.warn('[LocalStorageAdapter] Failed to save session:', e);
    }
  }

  async clearActiveSession(gameId: string = DEFAULT_GAME_ID, caseId?: string): Promise<void> {
    try {
      const existing = caseId ? null : await this.getActiveSession(gameId);
      const resolvedCaseId = caseId || existing?.caseId;
      localStorage.removeItem(STORAGE_KEYS.session(gameId));
      if (resolvedCaseId) {
        localStorage.removeItem(STORAGE_KEYS.corkboard(resolvedCaseId));
      }
    } catch (e) {
      console.warn('[LocalStorageAdapter] Failed to clear session:', e);
    }
  }

  async getPlayerProgress(): Promise<PlayerProgress> {
    const defaultProgress: PlayerProgress = {
      schemaVersion: SCHEMA_VERSION,
      unlockedHusbandId: 'husband_hoang',
      unlockedLevel: 1,
      bestStarRatings: {},
      earnedWifeTitles: [],
      audioMutePreference: false,
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEYS.progress);
      if (!raw) return defaultProgress;
      const parsed = JSON.parse(raw) as PlayerProgress;
      return { ...defaultProgress, ...parsed };
    } catch {
      return defaultProgress;
    }
  }

  async savePlayerProgress(progress: Partial<PlayerProgress>): Promise<void> {
    try {
      const current = await this.getPlayerProgress();
      const updated: PlayerProgress = {
        ...current,
        ...progress,
        schemaVersion: SCHEMA_VERSION,
      };
      localStorage.setItem(STORAGE_KEYS.progress, JSON.stringify(updated));
    } catch (e) {
      console.warn('[LocalStorageAdapter] Failed to save progress:', e);
    }
  }

  async exportSaveCode(gameId: string = DEFAULT_GAME_ID): Promise<string> {
    const session = await this.getActiveSession(gameId);
    const progress = await this.getPlayerProgress();
    const data = { session, progress };
    return btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  }

  async importSaveCode(saveCode: string): Promise<boolean> {
    try {
      const decoded = decodeURIComponent(escape(atob(saveCode)));
      const parsed = JSON.parse(decoded);
      if (parsed.session) {
        await this.saveActiveSession(parsed.session);
      }
      if (parsed.progress) {
        await this.savePlayerProgress(parsed.progress);
      }
      return true;
    } catch {
      return false;
    }
  }
}


