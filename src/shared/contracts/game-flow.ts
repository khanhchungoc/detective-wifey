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
  /** SSOT for the husband's persona notes; the case briefing renders these. */
  personaTraits?: string[];
  /** SSOT for the wife's profile; the case briefing renders this. */
  wifeProfile?: WifeProfile;
  /** Ignored when comingSoon: the selector renders a redacted silhouette instead. */
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
  /** Màn 0 guide file. Never starts a case; tutorial content is built later. */
  isGuide?: boolean;
  /** Visible but not playable yet (e.g. the Màn 0 guide before its content ships). */
  comingSoon?: boolean;
  unlocked: boolean;
  bestStars?: number;
  lockHint?: string;
}

export interface IntroDialogueBeat {
  beatId: string;
  speaker: string;
  /** Picks the portrait shown while this beat plays. */
  speakerRole: 'husband' | 'wife';
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
  wifeProfile?: WifeProfile;
  /** Provoking headline shown first on the briefing. Not rules or tutorial text. */
  hookQuestion: string;
  statedAlibi: string;
  suspicionHook: string;
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
  /** Story clock start as local ISO datetime (e.g. 2026-10-15T23:45:00). SSOT for every in-phone clock. */
  narrativeStartIso: string;
  /** Short lockscreen date label derived from narrativeStartIso. */
  narrativeDate: string;
  narrativeTime: string;
  batteryPercent: string;
  wallpaperUrl?: string;
  notifications: LockscreenNotificationItem[];
  /** Optional 4-digit phone passcode for Level 2-3; omitted on Level 0-1 (FaceID/swipe unlock). */
  passcode?: string;
  passcodeHint?: string;
}
