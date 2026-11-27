/**
 * Canonical Declarative Case & Content Schema Definitions (US-001)
 * Single Source of Truth for game cases, suspect pools, lock puzzles, and device telemetry.
 */

export type VerdictType = 'innocent' | 'cheating' | 'sugar_relationship';

export interface GroundTruth {
  verdict: VerdictType;
  culpritSuspectId: string;
  narrativeRoast: string;
  overJealousRoast?: string;
}

export interface Suspect {
  suspectId: string;
  displayName: string;
  avatarUrl?: string;
  initialDiscoveredApp: string;
}

export interface LockChallenge {
  challengeId: string;
  targetType: 'app' | 'album' | 'chat' | 'vault';
  targetId: string;
  lockType: 'numeric_pin' | 'security_question';
  expectedAnswer: string;
  clueSourceApp: string;
  promptQuestion?: string;
}

export interface DeviceMetadata {
  narrativeTime: string;
  batteryPercent: string;
  carrierTag: string;
  pwaThemeColor: string;
}

export interface NotificationToast {
  toastId: string;
  sourceAppId: string;
  senderTitle: string;
  snippetBody: string;
  triggerDelaySeconds?: number;
  clueRefId?: string;
}

export interface LevelMetadata {
  caseId: string;
  husbandId: string;
  husbandName: string;
  levelNumber: 1 | 2 | 3;
  levelTitle: string;
  storySnippet: string;
  thumbnailAsset?: string;
  allowedStrikes: number;
  unlockRequirementLevel: number;
}

export type ConfrontationMood = 'confident' | 'smug' | 'nervous' | 'broken';
export type ConfrontationSlot = 'up' | 'right' | 'down' | 'left';

export interface ConfrontationReply<M extends ConfrontationMood = ConfrontationMood> {
  husbandLine: string;
  husbandMood: M;
}

export interface ConfrontationOpeningChoice extends ConfrontationReply<'confident'> {
  choiceId: string;
  slot: 'left' | 'right';
  wifeLine: string;
}

interface ConfrontationChoiceBase {
  choiceId: string;
  slot: ConfrontationSlot;
  wifeLine: string;
  onFalse: ConfrontationReply<'smug'>;
}

/** Lead: true only when every requiredEdgeIds is connected on the notebook. Red herring: no requiredEdgeIds, always onFalse. */
export type ConfrontationBeatChoice =
  | (ConfrontationChoiceBase & { requiredEdgeIds: string[]; onTrue: ConfrontationReply<'nervous' | 'broken'> })
  | (ConfrontationChoiceBase & { requiredEdgeIds?: never; onTrue?: never });

export interface ConfrontationBeat {
  beatId: string;
  topic: string;
  choices: ConfrontationBeatChoice[];
}

export interface ConfrontationEndingChoice extends ConfrontationReply {
  choiceId: string;
  slot: ConfrontationSlot;
  wifeLine: string;
}

/** Beat 1 = opening; beats 2..N follow in order; the last lead's onTrue (broken) unlocks the ending. */
export interface ConfrontationScript {
  opening: ConfrontationOpeningChoice[];
  beats: ConfrontationBeat[];
  ending: ConfrontationEndingChoice[];
}

export interface EpilogueNotification {
  sourceAppId: string;
  senderTitle: string;
  snippetBody: string;
}

export interface CaseConfig {
  caseId: string;
  husbandId: string;
  husbandName: string;
  levelNumber: 1 | 2 | 3;
  allowedStrikes: number;
  groundTruth: GroundTruth;
  suspectPool: Suspect[];
  lockChallenges: LockChallenge[];
  deviceMetadata: DeviceMetadata;
  activeAppIds: string[];
  grayedOutAppIds?: string[];
  appsData: Record<string, unknown>;
  notifications?: NotificationToast[];
  /** Notification shown once after the confrontation ending (hook into the next level). */
  epilogueNotification?: EpilogueNotification;
  knowledgeGraph?: import('./knowledge-graph').CaseKnowledgeGraph;
  confrontationScript?: ConfrontationScript;
}

export type {
  GraphNodeType,
  GraphEdgeType,
  CaseGraphNode,
  CaseGraphEdge,
  CaseKnowledgeGraph,
} from './knowledge-graph';

