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
  levelNumber: 1 | 2 | 3;
  levelTitle: string;
  storySnippet: string;
  thumbnailAsset?: string;
  allowedStrikes: number;
  unlockRequirementLevel: number;
  /** Listed in the selector but has no bundled data yet; cannot be started. */
  comingSoon?: boolean;
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
  /** Author-set outcome; choice IDs are generic, so the UI cannot infer it from the ID. */
  outcome: 'divorce' | 'forgive';
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


/* ---------- Master data (per husband universe, shared by all levels) ---------- */

/** Phone owner identity. The only place the husband's names live. */
export interface HusbandMaster {
  husbandId: string;
  caseCode: string;
  /** Story calendar year; ages are derived as storyYear - birthYear. */
  storyYear: number;
  shortName: string;
  nickname: string;
  fullName: string;
  /** Uppercase without diacritics, as printed by banks. */
  fullNameAscii: string;
  handle: string;
  initials: string;
  birthYear: number;
  occupation: string;
  phone: string;
  homeAddress: string;
  wifePersonId: string;
  teaserQuote: string;
  personaTraits: string[];
}

/** Author-only classification. Never projected to apps (would spoil the answer). */
export type PersonRole = 'wife' | 'family' | 'friend' | 'colleague' | 'suspect' | 'service' | 'other';

export interface Person {
  personId: string;
  legalName: string;
  shortName?: string;
  gender: 'male' | 'female';
  birthYear?: number;
  role: PersonRole;
  orgId?: string;
  occupation?: string;
  phones?: string[];
  /** Dossier anchor lines (used for the wife profile). */
  anchors?: string[];
  /** Index in the shared contact avatar sprite sheet. */
  avatarIndex?: number;
}

export interface Org {
  orgId: string;
  name: string;
  kind: 'company' | 'shop' | 'venue' | 'bank' | 'service' | 'other';
  address?: string;
}

/** How the husband saved a person or org in his phone in ONE level (the disguise layer). */
export interface LevelContact {
  contactId: string;
  personId?: string;
  orgId?: string;
  savedName: string;
  phone?: string;
  /** Overrides the person's avatar, e.g. a disguised contact with a landscape photo. */
  avatarIndex?: number;
}

export interface CaseMaster {
  husband: HusbandMaster;
  people: Person[];
  orgs: Org[];
}

export interface CaseConfig {
  caseId: string;
  husbandId: string;
  /** Phone owner identity, resolved from master data. The only source of the husband's names. */
  husband: HusbandMaster;
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

