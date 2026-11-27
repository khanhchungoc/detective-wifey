import type { CaseConfig, LevelMetadata } from '../../shared/contracts/case-schema';
import type {
  CaseBriefingData,
  HusbandProfile,
  Level0Status,
  LevelCardItem,
  LockscreenNotificationItem,
  PhoneLockscreenConfig,
  WifeProfile,
} from '../../shared/contracts/game-flow';
import wifeMinhThuUrl from './assets/wife-minh-thu.jpg';

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

const LEVEL_0_STATUS_KEY = 'detective:v1:level0_status';

export function getLevel0Status(): Level0Status {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(LEVEL_0_STATUS_KEY) : null;
    if (raw === 'skipped' || raw === 'completed' || raw === 'not_started') return raw;
  } catch {
    // storage unavailable
  }
  return 'not_started';
}

export function setLevel0Status(status: Level0Status): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LEVEL_0_STATUS_KEY, status);
    }
  } catch {
    // storage unavailable
  }
}

export function buildHusbandProfiles(hoangPortraitUrl: string): HusbandProfile[] {
  return [
    {
      husbandId: 'husband_hoang',
      caseCode: 'HỒ SƠ #01',
      displayName: 'Nguyễn Huy Hoàng',
      fullName: 'Nguyễn Huy Hoàng',
      age: 29,
      occupation: 'Tech Lead · Technosoft (Hà Nội)',
      teaserQuote: '"Sợ vợ số 1, lương nộp 90%, nhưng hay úp màn hình và kêu OT fix bug."',
      personaTraits: [
        'Tự nhận sợ vợ số 1, nộp 90% lương',
        'Hay úp màn hình, mang máy vào nhà tắm',
        'Cửa miệng: "OT fix bug cho kịp sprint"',
      ],
      wifeAnchor: 'Vợ Minh Thư (28t): Áo/váy size M · Giày 37 · CT2 An Bình',
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
      personaTraits: ['Đang cập nhật hồ sơ điều tra'],
      portraitUrl: hoangPortraitUrl,
      comingSoon: true,
    },
  ];
}

export function buildLevelCards(
  availableLevels: LevelMetadata[],
  unlockedMaxLevel: number,
  starRatings: Record<string, number>,
  level0Status: Level0Status,
): LevelCardItem[] {
  const practiceCard: LevelCardItem = {
    caseId: 'case_00_practice',
    husbandId: 'husband_hoang',
    levelNumber: 0,
    levelTitle: 'Tập điều tra',
    summary: 'Làm quen thao tác soi manh mối và đối chất.',
    activeAppCount: 3,
    allowedStrikes: 5,
    isPractice: true,
    unlocked: true,
    level0Status,
    recommended: level0Status === 'not_started',
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
      summary: lvl.storySnippet,
      activeAppCount,
      allowedStrikes: lvl.allowedStrikes,
      unlocked,
      bestStars: starRatings[lvl.caseId] ?? 0,
      lockHint: unlocked ? undefined : `Hoàn thành Màn ${lvl.levelNumber - 1}`,
    };
  });

  return [practiceCard, ...normalCards];
}

export function buildCaseBriefing(
  caseConfig: CaseConfig,
  levelTitle: string,
  husbandPortraitUrl: string,
): CaseBriefingData {
  const activeAppCount = Math.max(1, caseConfig.activeAppIds?.length ?? 4);
  const hasLockscreenPin = caseConfig.levelNumber >= 2;

  return {
    caseId: caseConfig.caseId,
    levelNumber: caseConfig.levelNumber,
    levelTitle,
    husbandId: caseConfig.husbandId,
    husbandName: `Chồng ${caseConfig.husbandName}`,
    husbandFullName: 'Nguyễn Huy Hoàng',
    husbandAge: 29,
    husbandOccupation: 'Tech Lead · Technosoft (Hà Nội)',
    husbandPortraitUrl,
    personaTraits: [
      'Tự nhận sợ vợ số 1, nộp 90% lương tháng',
      'Hay úp màn hình điện thoại xuống bàn',
      'Cửa miệng: "Anh đang OT fix bug giỏ hàng"',
    ],
    wifeAnchor: 'Vợ Minh Thư: size M · giày 37 · chung cư An Bình',
    wifeProfile: WIFE_MINH_THU,
    statedAlibi: 'Họp phòng dự án công ty fix bug giỏ hàng tới tối muộn.',
    suspicionHook:
      '23:45 đêm. Chồng vừa ngủ say nhưng màn hình điện thoại liên tục sáng lên với loạt thông báo bị ẩn nội dung.',
    activeAppCount,
    allowedStrikes: caseConfig.allowedStrikes,
    lockModeLabel: hasLockscreenPin ? 'Mật khẩu 4 số' : 'FaceID / Vuốt mở',
    introBeats: [
      {
        beatId: 'intro_1',
        speaker: `Chồng ${caseConfig.husbandName}`,
        locationTime: '23:40 - Phòng ngủ',
        mood: 'confident',
        line: '"Vợ ơi, tối nay anh họp fix bug ở công ty mệt quá, anh đi ngủ trước đây. Điện thoại anh để trên bàn sạc nha."',
      },
      {
        beatId: 'intro_2',
        speaker: 'Vợ (Minh Thư)',
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

  return {
    narrativeDate: 'Th 5, 15 thg 10',
    narrativeTime: caseConfig.deviceMetadata.narrativeTime || '23:45',
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
