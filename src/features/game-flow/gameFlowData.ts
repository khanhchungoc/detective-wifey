import type { CaseConfig, LevelMetadata } from '../../shared/contracts/case-schema';
import type {
  CaseBriefingData,
  HusbandProfile,
  LevelCardItem,
  LockscreenNotificationItem,
  PhoneLockscreenConfig,
  WifeProfile,
} from '../../shared/contracts/game-flow';
import wifeMinhThuUrl from './assets/wife-minh-thu.webp';
// 3:4 head-and-shoulders dossier portrait (not the phone wallpaper).
import hoangPortraitUrl from './assets/hoang-dossier-portrait.webp';

const WIFE_MINH_THU: WifeProfile = {
  displayName: 'Trần Minh Thư',
  age: 28,
  occupation: 'Kế toán · Vợ hợp pháp',
  portraitUrl: wifeMinhThuUrl,
  anchors: [
    'Áo/váy size M · Giày size 37',
    'Chung cư An Bình, 18 ngõ 68 Trung Kính',
    'Nhận 90% lương chồng ngày 10 hàng tháng',
  ],
};

// Story calendar: 15/10 is the night of Level 1 (a Thursday in 2026).
const NARRATIVE_DATE_ISO = '2026-10-15';

/** Short lockscreen date label, e.g. "Th 5, 15 thg 10". */
export function formatNarrativeShortDate(date: Date): string {
  const weekday = date.getDay() === 0 ? 'CN' : `Th ${date.getDay() + 1}`;
  return `${weekday}, ${date.getDate()} thg ${date.getMonth() + 1}`;
}

export function buildHusbandProfiles(): HusbandProfile[] {
  return [
    {
      husbandId: 'husband_hoang',
      caseCode: 'HỒ SƠ #01',
      displayName: 'Thịnh Doom',
      fullName: 'Nguyễn Huy Thịnh',
      age: 31,
      occupation: 'Tech Lead · Technosoft (Hà Nội)',
      teaserQuote: '"Sợ vợ số 1, lương nộp 90%, nhưng hay úp màn hình và kêu OT fix bug."',
      personaTraits: [
        'Tự nhận sợ vợ số 1, nộp 90% lương',
        'Hay úp màn hình, mang máy vào nhà tắm',
        'Cửa miệng: "OT fix bug cho kịp sprint"',
      ],
      wifeProfile: WIFE_MINH_THU,
      portraitUrl: hoangPortraitUrl,
    },
    {
      husbandId: 'husband_minh',
      caseCode: 'HỒ SƠ #02',
      displayName: 'Trần Quang Minh',
      fullName: 'Trần Quang Minh',
      age: 34,
      occupation: 'Giám đốc Kinh doanh',
      teaserQuote: '"Hồ sơ đang được thu thập."',
      portraitUrl: hoangPortraitUrl,
      comingSoon: true,
    },
  ];
}

export const GUIDE_CARD_TEASER = 'Lần đầu soi điện thoại chồng? Học nghề ở đây trước.';

export function buildLevelCards(
  availableLevels: LevelMetadata[],
  unlockedMaxLevel: number,
  starRatings: Record<string, number>,
): LevelCardItem[] {
  // Màn 0 is the in-phone guide. Its content is built later, so the file is visible but not playable.
  const guideCard: LevelCardItem = {
    caseId: 'case_00_guide',
    husbandId: 'husband_hoang',
    levelNumber: 0,
    levelTitle: 'Hướng dẫn điều tra',
    summary: GUIDE_CARD_TEASER,
    activeAppCount: 0,
    allowedStrikes: 0,
    isGuide: true,
    comingSoon: true,
    unlocked: true,
  };

  const normalCards: LevelCardItem[] = availableLevels.map((lvl) => {
    const unlocked = lvl.levelNumber <= Math.max(1, unlockedMaxLevel);
    const activeAppCount = lvl.levelNumber === 1 ? 4 : lvl.levelNumber === 2 ? 6 : 8;
    const cleanTitle = lvl.levelTitle.replace(/^MÀN\s+\d+:\s*/i, '').trim();
    return {
      caseId: lvl.caseId,
      husbandId: lvl.husbandId,
      levelNumber: lvl.levelNumber,
      levelTitle: cleanTitle || lvl.levelTitle,
      // The selector file shows story only; difficulty and rule text stay out of it.
      summary: lvl.storySnippet.replace(/^Độ khó:[^)]*\)\.\s*/, ''),
      activeAppCount,
      allowedStrikes: lvl.allowedStrikes,
      unlocked,
      bestStars: starRatings[lvl.caseId] ?? 0,
      comingSoon: lvl.comingSoon,
      lockHint: unlocked || lvl.comingSoon ? undefined : `Hoàn thành Màn ${lvl.levelNumber - 1}`,
    };
  });

  return [guideCard, ...normalCards];
}

export const BRIEFING_HOOK_QUESTION = 'Bạn có đủ tỉnh táo để tìm ra bằng chứng?';

export function buildCaseBriefing(
  caseConfig: CaseConfig,
  levelTitle: string,
  husband: HusbandProfile,
): CaseBriefingData {
  return {
    caseId: caseConfig.caseId,
    levelNumber: caseConfig.levelNumber,
    levelTitle,
    husbandId: caseConfig.husbandId,
    husbandName: `Chồng ${caseConfig.husbandName}`,
    husbandFullName: husband.fullName ?? husband.displayName,
    husbandAge: husband.age,
    husbandOccupation: husband.occupation,
    husbandPortraitUrl: husband.portraitUrl,
    personaTraits: husband.personaTraits,
    wifeProfile: husband.wifeProfile,
    hookQuestion: BRIEFING_HOOK_QUESTION,
    statedAlibi: 'Họp phòng dự án công ty fix bug giỏ hàng tới tối muộn.',
    suspicionHook:
      '23:45 đêm. Chồng vừa ngủ say nhưng màn hình điện thoại liên tục sáng lên với loạt thông báo bị ẩn nội dung.',
    introBeats: [
      {
        beatId: 'intro_1',
        speaker: `Chồng ${caseConfig.husbandName}`,
        speakerRole: 'husband',
        locationTime: '23:40 - Phòng ngủ',
        mood: 'confident',
        line: '"Vợ ơi, tối nay anh họp fix bug ở công ty mệt quá, anh đi ngủ trước đây. Điện thoại anh để trên bàn sạc nha."',
      },
      {
        beatId: 'intro_2',
        speaker: `Vợ (${husband.wifeProfile?.displayName.split(' ').slice(-2).join(' ') ?? 'Minh Thư'})`,
        speakerRole: 'wife',
        locationTime: '23:44 - Phòng ngủ',
        mood: 'nervous',
        line: '"Ngủ nhanh thế? Mà sao điện thoại anh vừa sáng màn hình liên tục, lại còn ẩn hết nội dung thông báo..."',
      },
    ],
  };
}

export interface LockscreenAppIconMeta {
  appName?: string;
  iconAsset?: string;
  themeGradient?: string;
}

export function buildLockscreenConfig(
  caseConfig: CaseConfig,
  wallpaperUrl?: string,
  resolveAppIcon?: (appId: string) => LockscreenAppIconMeta | undefined,
): PhoneLockscreenConfig {
  const isHarderLevel = caseConfig.levelNumber >= 2;
  // Lock screen mirrors the case's own notification hooks, privacy-masked (no sender, no body).
  const notifications: LockscreenNotificationItem[] = (caseConfig.notifications ?? []).map((toast) => {
    const meta = resolveAppIcon?.(toast.sourceAppId);
    const time = toast.senderTitle.match(/\b\d{1,2}:\d{2}\b/)?.[0];
    const isMessage = toast.sourceAppId === 'internet-messaging' || toast.sourceAppId === 'messages';
    return {
      id: `lock_${toast.toastId}`,
      appId: toast.sourceAppId,
      appName: meta?.appName ?? toast.sourceAppId,
      iconAsset: meta?.iconAsset,
      themeGradient: meta?.themeGradient,
      maskedBody: isMessage ? 'Bạn có 1 tin nhắn mới' : 'Có 1 thông báo mới',
      timeLabel: time ?? 'Vừa xong',
    };
  });

  const narrativeTime = caseConfig.deviceMetadata.narrativeTime || '23:45';
  const narrativeStartIso = `${NARRATIVE_DATE_ISO}T${narrativeTime}:00`;
  return {
    narrativeStartIso,
    narrativeDate: formatNarrativeShortDate(new Date(narrativeStartIso)),
    narrativeTime,
    batteryPercent: caseConfig.deviceMetadata.batteryPercent || '42%',
    wallpaperUrl,
    notifications,
    ...(isHarderLevel
      ? {
          passcode: caseConfig.lockChallenges[0]?.expectedAnswer || '1510',
          passcodeHint: 'Gợi ý: Ngày kỷ niệm hoặc ngày đặc biệt trong hồ sơ.',
        }
      : {}),
  };
}
