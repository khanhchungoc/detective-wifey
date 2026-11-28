import React from 'react';
import type { HusbandMaster, LockChallenge, Suspect } from './case-schema';
import type { EvidenceSource } from './evidence';
export type { EvidenceSource } from './evidence';

/**
 * Standard App Identifiers across the virtual mobile phone ecosystem.
 */
export type AppId =
  | 'internet-messaging'
  | 'banking'
  | 'ecommerce'
  | 'ride-hailing'
  | 'web-browser'
  | 'personal-notes'
  | 'email'
  | 'professional-network'
  | 'team-collaboration'
  | 'photos'
  | 'comms'
  | 'phone'
  | 'messages';

/**
 * Standard Props for all Pluggable Micro-Apps.
 */
/** Public narrative context. App payloads are unknown until their local adapter parses them. */
export interface AppCaseContext {
  caseId: string;
  /** Phone owner identity. Apps read names from here, never hard-code them. */
  husband: HusbandMaster;
  levelNumber: 1 | 2 | 3;
  suspectPool: Suspect[];
  lockChallenges: Array<Omit<LockChallenge, 'expectedAnswer'>>;
  appsData: Record<string, unknown>;
}

export interface VirtualAppProps {
  caseData: AppCaseContext;
  onTagSuspect: (suspectName: string, sourceApp: AppId, evidence?: EvidenceSource) => void;
  onReturnHome: () => void;
  onRequestUnlock?: (challengeId: string) => void;
  unlockedChallenges: ReadonlySet<string>;
  initialThreadId?: string;
  onOpenMessages?: (threadId: string) => boolean;
}

/**
 * Standard Contract for Pluggable App Registration.
 */
export interface AppDefinition {
  appId: AppId;
  /** Payload keys accepted by this app, in the existing fallback order. */
  dataKeys?: readonly string[];
  displayName: string;
  icon: React.ComponentType<{ className?: string }>;
  iconAsset?: string;
  themeGradient: string;
  themeColor: string;
  /** Surface adjoining the shell home gesture area (independent of the header). */
  bottomBarColor?: string;
  isLocked: boolean;
  lockChallengeId?: string;
  component: React.ComponentType<VirtualAppProps>;
}

