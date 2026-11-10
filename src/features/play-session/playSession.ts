import type { AppDefinition, AppId } from '../../shared/contracts/app-contracts';
import type { CaseConfig, LevelMetadata, LockChallenge } from '../../shared/contracts/case-schema';
import type { EvidenceSource } from '../../shared/contracts/evidence';
import { tagSuspect, normalizeTaggedSuspects, removePinnedMessage, removePinnedCard, restorePinnedEvidence, type TaggedSuspect, type PinnedMessageItem } from '../investigation';
import { findAppChallenge } from '../locks';
import { applyStrike } from '../suspicion';
import { SessionWriter, type ActiveSessionState, type GameStateRepository, type PlayerProgress } from '../session';

export interface PlaySessionDependencies {
  repository: GameStateRepository;
  loadCaseByLevel: (level: number, husbandId?: string) => CaseConfig;
  getAvailableLevels: (husbandId: string) => LevelMetadata[];
  getAppDefinition: (appId: AppId) => AppDefinition | undefined;
  now: () => number;
  schedule: (callback: () => void, delay: number) => () => void;
  onCaught: () => void;
}

export interface PendingChallenge {
  challenge: LockChallenge;
  ownerApp: AppId;
  appName: string;
}

export interface PlaySessionState {
  appSessionId: number;
  caseConfig: CaseConfig;
  activeAppId: AppId | 'home';
  unlockedChallenges: Set<string>;
  strikes: number;
  taggedSuspects: ActiveSessionState['taggedSuspects'];
  playerProgress: PlayerProgress;
  pendingChallenge: PendingChallenge | null;
  resumableSession: ActiveSessionState | null;
  systemAlertToast: string | null;
}

/** Coordinates existing gameplay rules independently of React, shell, and concrete storage. */
export class PlaySession {
  private state: PlaySessionState;
  private listeners = new Set<() => void>();
  private writer: SessionWriter;
  private revision = 0;
  private initialization = 0;
  private cancelToast?: () => void;
  private cancelFailure?: () => void;

  constructor(private dependencies: PlaySessionDependencies, initialCase?: CaseConfig) {
    const caseConfig = initialCase ?? dependencies.loadCaseByLevel(1);
    this.writer = new SessionWriter(dependencies.repository, 'jealous_wife');
    this.state = {
      appSessionId: 0, caseConfig, activeAppId: 'home', unlockedChallenges: new Set(),
      strikes: caseConfig.allowedStrikes, taggedSuspects: [], pendingChallenge: null,
      resumableSession: null, systemAlertToast: null,
      playerProgress: {
        schemaVersion: 1, unlockedHusbandId: 'husband_hoang', unlockedLevel: 1,
        bestStarRatings: { case_01: 3, case_02: 2 }, earnedWifeTitles: [], audioMutePreference: false,
      },
    };
  }

  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  async initialize(): Promise<void> {
    const initialization = ++this.initialization;
    const revision = this.revision;
    try {
      const [playerProgress, session] = await Promise.all([
        this.dependencies.repository.getPlayerProgress(),
        this.dependencies.repository.getActiveSession('jealous_wife'),
      ]);
      if (initialization !== this.initialization || revision !== this.revision) return;
      const normalizedSession = session ? {
        ...session,
        taggedSuspects: normalizeTaggedSuspects(session.taggedSuspects || []),
      } : null;
      this.update({ playerProgress, resumableSession:
        normalizedSession?.caseId === this.state.caseConfig.caseId && normalizedSession.taggedSuspects.length > 0 ? normalizedSession : null });
    } catch {
      if (initialization === this.initialization && revision === this.revision) this.notify('Không thể tải phiên điều tra. Vui lòng thử lại!');
    }
  }

  stop = () => {
    this.initialization++;
    this.cancelToast?.();
    this.cancelFailure?.();
  };

  availableLevels = () => this.dependencies.getAvailableLevels(this.state.caseConfig.husbandId);

  notify = (message: string, durationMs = 3000) => {
    this.cancelToast?.();
    this.update({ systemAlertToast: message });
    this.cancelToast = this.dependencies.schedule(() => this.update({ systemAlertToast: null }), durationMs);
  };

  returnHome = () => { this.revision++; this.update({ activeAppId: 'home' }); };
  cancelChallenge = () => this.update({ pendingChallenge: null });

  resume = () => {
    const session = this.state.resumableSession;
    if (!session) return;
    this.revision++;
    const normalizedTags = normalizeTaggedSuspects(session.taggedSuspects || []);
    this.update({ strikes: session.suspicionStrikes, taggedSuspects: normalizedTags,
      unlockedChallenges: new Set(session.unlockedChallenges), activeAppId: session.activeApp,
      resumableSession: null });
    this.save();
    this.notify('Đã khôi phục phiên điều tra dở dang!');
  };

  restart = async () => {
    const caseId = this.state.caseConfig.caseId;
    this.reset(this.state.caseConfig);
    const revision = this.revision;
    const level = this.state.caseConfig.levelNumber;
    await this.clearSavedSession(caseId);
    if (revision === this.revision) this.notify(`Đã chơi lại Màn ${level}!`);
  };

  selectLevel = (level: number): boolean => {
    try {
      const next = this.dependencies.loadCaseByLevel(level, this.state.caseConfig.husbandId);
      this.reset(next);
      void this.clearSavedSession(next.caseId);
      this.notify(`Đã nạp ${next.husbandName} - Màn ${level}!`);
      return true;
    } catch (error: unknown) {
      this.notify(error instanceof Error ? error.message : 'Không tìm thấy màn chơi yêu cầu.');
      return false;
    }
  };

  tag = (name: string, appId: AppId, evidence?: EvidenceSource) => {
    const result = tagSuspect(this.state.taggedSuspects, name, appId, this.dependencies.now(), evidence);
    if (result.added) {
      this.revision++;
      this.update({ taggedSuspects: result.suspects });
      this.save();
    }
    this.notify(
      result.added ? `Đã ghim "${name}" vào Sổ tay của vợ!` : `"${name}" đã có trong Sổ tay của vợ.`,
      2000,
    );
  };

  applyConfrontationPenalty = () => {
    this.revision++;
    const strikes = applyStrike(this.state.strikes);
    this.update({ strikes });
    this.save();
    if (strikes === 0) {
      this.cancelFailure?.();
      this.cancelFailure = this.dependencies.schedule(() => {
        this.dependencies.onCaught();
        void this.restart();
      }, 500);
    }
  };

  recordConfrontationVerdict = (stars: 1 | 2 | 3, wifeTitle?: string) => {
    this.revision++;
    const caseId = this.state.caseConfig.caseId;
    const progress = this.state.playerProgress;
    const currentBest = progress.bestStarRatings[caseId] ?? 0;
    const nextBest = Math.max(currentBest, stars) as 1 | 2 | 3;
    const currentLevel = this.state.caseConfig.levelNumber;
    const nextUnlockedLevel = Math.max(
      progress.unlockedLevel,
      Math.min(3, currentLevel + 1),
    ) as 1 | 2 | 3;

    const titles = [...progress.earnedWifeTitles];
    if (wifeTitle && !titles.includes(wifeTitle)) {
      titles.push(wifeTitle);
    }

    const updatedProgress: PlayerProgress = {
      ...progress,
      unlockedLevel: nextUnlockedLevel,
      bestStarRatings: {
        ...progress.bestStarRatings,
        [caseId]: nextBest,
      },
      earnedWifeTitles: titles,
    };

    this.update({ playerProgress: updatedProgress });
    void this.dependencies.repository.savePlayerProgress(updatedProgress).catch(() => {
      this.notify('Không thể lưu tiến trình chơi.');
    });
  };

  forgiveAndAdvanceLevel = () => {
    const nextLevel = Math.min(3, this.state.caseConfig.levelNumber + 1);
    this.selectLevel(nextLevel);
  };

  removeEvidence = (targetId: string, messageRecordId?: string) => {
    let result: { suspects: TaggedSuspect[]; removedMessage?: PinnedMessageItem; removedCard?: TaggedSuspect };
    if (messageRecordId) {
      result = removePinnedMessage(this.state.taggedSuspects, targetId, messageRecordId);
    } else {
      result = removePinnedCard(this.state.taggedSuspects, targetId);
    }
    this.revision++;
    this.update({ taggedSuspects: result.suspects });
    this.save();
    return result;
  };

  restoreEvidence = (restored: { card?: TaggedSuspect; message?: PinnedMessageItem; targetSuspectId?: string }) => {
    const updated = restorePinnedEvidence(this.state.taggedSuspects, restored);
    this.revision++;
    this.update({ taggedSuspects: updated });
    this.save();
  };

  updateTaggedSuspects = (suspects: TaggedSuspect[]) => {
    this.revision++;
    const normalized = normalizeTaggedSuspects(suspects);
    this.update({ taggedSuspects: normalized });
    this.save();
  };

  launch = (appId: AppId) => {
    const definition = this.dependencies.getAppDefinition(appId);
    if (!definition) {
      this.notify('Ứng dụng tạm thời không phản hồi. Vui lòng thử lại!');
      return;
    }
    const challenge = findAppChallenge(this.state.caseConfig.lockChallenges, appId);
    if (challenge && !this.state.unlockedChallenges.has(challenge.challengeId)) {
      this.update({ pendingChallenge: { challenge, ownerApp: appId, appName: definition.displayName } });
      return;
    }
    this.revision++;
    this.update({ activeAppId: appId });
    this.save();
  };

  requestUnlock = (challengeId: string) => {
    const ownerApp = this.state.activeAppId;
    if (ownerApp === 'home') return;
    const challenge = this.state.caseConfig.lockChallenges.find(item => item.challengeId === challengeId);
    if (!challenge) return;
    this.update({ pendingChallenge: { challenge, ownerApp,
      appName: this.dependencies.getAppDefinition(ownerApp)?.displayName || 'Thư mục' } });
  };

  solveChallenge = (challengeId: string) => {
    const pending = this.state.pendingChallenge;
    if (!pending || pending.challenge.challengeId !== challengeId) return;
    const unlocked = new Set(this.state.unlockedChallenges).add(challengeId);
    this.revision++;
    this.update({ unlockedChallenges: unlocked, pendingChallenge: null, activeAppId: pending.ownerApp });
    this.save();
    this.notify('Mở khóa thành công!');
  };

  failChallenge = () => {
    this.revision++;
    const strikes = applyStrike(this.state.strikes);
    this.update({ strikes });
    this.save();
    if (strikes === 0) {
      this.cancelFailure?.();
      this.cancelFailure = this.dependencies.schedule(() => {
        this.dependencies.onCaught();
        void this.restart();
      }, 500);
    }
  };

  private reset(caseConfig: CaseConfig) {
    this.revision++;
    this.initialization++;
    this.cancelFailure?.();
    this.cancelToast?.();
    this.update({ appSessionId: this.state.appSessionId + 1, caseConfig, activeAppId: 'home', strikes: caseConfig.allowedStrikes,
      taggedSuspects: [], unlockedChallenges: new Set(), pendingChallenge: null,
      resumableSession: null, systemAlertToast: null });
  }

  private save() {
    const state = this.state;
    const snapshot: ActiveSessionState = {
      schemaVersion: 1, gameId: 'jealous_wife', caseId: state.caseConfig.caseId,
      levelNumber: state.caseConfig.levelNumber, activeApp: state.activeAppId,
      suspicionStrikes: state.strikes, taggedSuspects: state.taggedSuspects,
      unlockedChallenges: [...state.unlockedChallenges], elapsedSeconds: 0,
      lastSavedAt: this.dependencies.now(),
    };
    void this.writer.save(snapshot).catch(() => this.notify('Không thể lưu phiên điều tra.'));
  }

  private clearSavedSession(caseId?: string) {
    return this.writer.clear(caseId).catch(() => this.notify('Không thể xóa phiên điều tra đã lưu.'));
  }

  private update(patch: Partial<PlaySessionState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener());
  }
}
