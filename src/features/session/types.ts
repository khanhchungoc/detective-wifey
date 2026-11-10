import type { AppId } from '../../shared/contracts/app-contracts';
import type { EvidenceSource } from '../../shared/contracts/evidence';

export interface ActiveSessionState {
  schemaVersion: number;
  gameId: string;
  caseId: string;
  levelNumber: 1 | 2 | 3;
  activeApp: AppId | 'home';
  suspicionStrikes: number;
  taggedSuspects: Array<{
    suspectId: string;
    displayName: string;
    sourceApp: AppId;
    timestamp: number;
    evidence?: EvidenceSource;
    conversationId?: string;
    isExplicitConversationPin?: boolean;
    messages?: Array<{
      recordId: string;
      text: string;
      eventTime?: string;
      eventDate?: string;
      rawTimestamp?: string | number;
      clueRefId?: string;
      sender?: string;
    }>;
  }>;
  unlockedChallenges: string[];
  elapsedSeconds: number;
  lastSavedAt: number;
  appSpecificState?: Record<string, unknown>;
}

export interface PlayerProgress {
  schemaVersion: number;
  unlockedHusbandId: string;
  unlockedLevel: 1 | 2 | 3;
  bestStarRatings: Record<string, 1 | 2 | 3>;
  earnedWifeTitles: string[];
  audioMutePreference: boolean;
}

/**
 * Pluggable Persistence Repository Contract.
 * Decouples game logic from storage engine (LocalStorage in Phase 1, BaaS in Phase 2).
 */
export interface GameStateRepository {
  getActiveSession(gameId: string): Promise<ActiveSessionState | null>;
  saveActiveSession(session: ActiveSessionState): Promise<void>;
  clearActiveSession(gameId: string, caseId?: string): Promise<void>;

  getPlayerProgress(): Promise<PlayerProgress>;
  savePlayerProgress(progress: Partial<PlayerProgress>): Promise<void>;

  exportSaveCode?(gameId: string): Promise<string>;
  importSaveCode?(saveCode: string): Promise<boolean>;
}

