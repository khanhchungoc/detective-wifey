import type { ConfrontationMood } from './case-schema';

/**
 * Shared contracts for the Game App entry flow (US-035 to US-038).
 * Owned by src/shared/contracts so features, shell, and bootstrap stay decoupled.
 */

export type GameFlowStage =
  | 'startup'
  | 'level-selector'
  | 'level-context'
  | 'phone-lockscreen'
  | 'phone-home';

export type Level0Status = 'not_started' | 'skipped' | 'completed';

export interface WifeProfile {
  displayName: string;
  age: number;
  occupation: string;
  portraitUrl: string;
  anchors: string[];
}

export interface HusbandProfile {
  husbandId: string;
  caseCode?: string;
  displayName: string;
  fullName?: string;
  age: number;
  occupation: string;
  teaserQuote: string;
  personaTraits?: string[];
  wifeAnchor?: string;
  wifeProfile?: WifeProfile;
  portraitUrl: string;
  comingSoon?: boolean;
}

export interface LevelCardItem {
  caseId: string;
  husbandId: string;
  levelNumber: number;
  levelTitle: string;
  summary: string;
  activeAppCount: number;
  allowedStrikes: number;
  isPractice?: boolean;
  unlocked: boolean;
  bestStars?: number;
  lockHint?: string;
  level0Status?: Level0Status;
  recommended?: boolean;
}

export interface IntroDialogueBeat {
  beatId: string;
  speaker: string;
  locationTime: string;
  mood: ConfrontationMood;
  line: string;
}

export interface CaseBriefingData {
  caseId: string;
  levelNumber: number;
  levelTitle: string;
  husbandId: string;
  husbandName: string;
  husbandFullName?: string;
  husbandAge?: number;
  husbandOccupation: string;
  husbandPortraitUrl: string;
  personaTraits?: string[];
  wifeAnchor?: string;
  wifeProfile?: WifeProfile;
  statedAlibi: string;
  suspicionHook: string;
  activeAppCount: number;
  allowedStrikes: number;
  lockModeLabel: string;
  introBeats: IntroDialogueBeat[];
}

export interface LockscreenNotificationItem {
  id: string;
  appId: string;
  appName: string;
  /** Real parody app icon asset URL from APP_REGISTRY. */
  iconAsset?: string;
  themeGradient?: string;
  /** Strictly privacy-masked non-spoiler text without parenthetical filler. */
  maskedBody: string;
  timeLabel: string;
}

export interface PhoneLockscreenConfig {
  narrativeDate: string;
  narrativeTime: string;
  batteryPercent: string;
  wallpaperUrl?: string;
  notifications: LockscreenNotificationItem[];
  /** Optional 4-digit phone passcode for Level 2-3; omitted on Level 0-1 (FaceID/swipe unlock). */
  passcode?: string;
  passcodeHint?: string;
}
