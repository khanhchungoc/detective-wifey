import { CaseConfig, CaseMaster, LevelMetadata } from '../../shared/contracts/case-schema';
import { ALL_CASES } from '../../data/cases';
import { DEFAULT_APPS_DATA } from '../../data/defaults';
import { husband01Master } from '../../data/cases/husband_01/master';

/**
 * Static Level Catalog Manifest for Level Selector (US-001 Business Rule).
 */
export const LEVEL_CATALOG: LevelMetadata[] = [
  {
    caseId: 'case_00',
    husbandId: 'husband_01',
    levelNumber: 0,
    levelTitle: 'MÀN 0 (HƯỚNG DẪN): Bữa cà phê tăng ca',
    storySnippet: 'Độ khó: Hướng dẫn (An toàn • 0 khóa PIN). 22:15, chồng vừa về nhà sau khi báo ngồi công ty fix lỗi. Màn hình sáng lên tin nhắn lạ từ "Tùng Gara"...',
    allowedStrikes: 5,
    unlockRequirementLevel: 0,
  },
  {
    caseId: 'case_01',
    husbandId: 'husband_01',
    levelNumber: 1,
    levelTitle: 'MÀN 1: Điện thoại ngoài phòng tắm',
    storySnippet: 'Độ khó: Dễ (5 lượt nghi ngờ • 0 khóa PIN). 23:45, chồng đang tắm, điện thoại 8% pin cắm sạc ngoài phòng. Màn hình sáng lên hai lần...',
    allowedStrikes: 5,
    unlockRequirementLevel: 1,
  },
  {
    caseId: 'case_02',
    husbandId: 'husband_01',
    levelNumber: 2,
    levelTitle: 'MÀN 2: Hồ sơ đang thu thập',
    storySnippet: 'Màn chơi đang được thiết kế.',
    allowedStrikes: 4,
    unlockRequirementLevel: 2,
    comingSoon: true,
  },
  {
    caseId: 'case_03',
    husbandId: 'husband_01',
    levelNumber: 3,
    levelTitle: 'MÀN 3: Hồ sơ đang thu thập',
    storySnippet: 'Màn chơi đang được thiết kế.',
    allowedStrikes: 3,
    unlockRequirementLevel: 3,
    comingSoon: true,
  },
];

/** Master data (husband identity, people) of every bundled husband universe. */
export function getCaseMasters(): CaseMaster[] {
  return [husband01Master];
}

/**
 * In-memory dataset registry of bundled cases.
 */
const BUNDLED_CASES: Record<string, CaseConfig> = ALL_CASES;

/**
 * Validates a CaseConfig dataset against structural and business constraints.
 */
export function validateCaseConfig(config: CaseConfig): { isValid: boolean; error?: string } {
  if (!config) {
    return { isValid: false, error: 'Không thể tải dữ liệu vụ án. Vui lòng thử lại!' };
  }

  if (!config.caseId || typeof config.caseId !== 'string' || config.caseId.trim() === '') {
    return { isValid: false, error: 'Không thể tải dữ liệu vụ án. Vui lòng thử lại!' };
  }

  if (!config.husbandId || typeof config.husbandId !== 'string') {
    return { isValid: false, error: 'Dữ liệu màn chơi không hợp lệ. Vui lòng tải lại trang!' };
  }

  if (config.levelNumber < 0 || config.levelNumber > 3) {
    return { isValid: false, error: 'Dữ liệu màn chơi không hợp lệ. Vui lòng tải lại trang!' };
  }

  // Enforce strike boundaries per level
  const expectedStrikes = config.levelNumber <= 1 ? 5 : config.levelNumber === 2 ? 4 : 3;
  if (config.allowedStrikes !== expectedStrikes) {
    return {
      isValid: false,
      error: `Số lượt thử allowedStrikes (${config.allowedStrikes}) không khớp với quy định Màn ${config.levelNumber} (${expectedStrikes}).`,
    };
  }

  if (!Array.isArray(config.suspectPool) || config.suspectPool.length === 0) {
    return { isValid: false, error: 'Dữ liệu màn chơi không hợp lệ. Vui lòng tải lại trang!' };
  }

  if (!config.groundTruth) {
    return { isValid: false, error: 'Dữ liệu màn chơi không hợp lệ. Vui lòng tải lại trang!' };
  }

  const validVerdicts = ['innocent', 'cheating', 'sugar_relationship'];
  if (!validVerdicts.includes(config.groundTruth.verdict)) {
    return { isValid: false, error: 'Dữ liệu màn chơi không hợp lệ. Vui lòng tải lại trang!' };
  }

  const culpritExists = config.suspectPool.some(
    (s) => s.suspectId === config.groundTruth.culpritSuspectId
  );
  if (!culpritExists) {
    return {
      isValid: false,
      error: `Thủ phạm ${config.groundTruth.culpritSuspectId} không tồn tại trong danh sách nghi phạm.`,
    };
  }

  if (
    !config.deviceMetadata ||
    !config.deviceMetadata.narrativeTime ||
    !config.deviceMetadata.batteryPercent ||
    !config.deviceMetadata.carrierTag
  ) {
    return { isValid: false, error: 'Dữ liệu màn chơi không hợp lệ. Vui lòng tải lại trang!' };
  }

  return { isValid: true };
}

/**
 * Returns available levels for active husband (AC 5).
 */
export function getAvailableLevels(husbandId: string = 'husband_01'): LevelMetadata[] {
  return LEVEL_CATALOG.filter((lvl) => lvl.husbandId === husbandId).sort(
    (a, b) => a.levelNumber - b.levelNumber
  );
}

/**
 * Deep merges case-specific apps data with default dummy/parody apps data.
 * Inactive apps receive realistic benign filler content to prevent process-of-elimination spoilers.
 */
export function mergeWithDefaultAppsData(caseAppsData: Record<string, unknown> = {}): Record<string, unknown> {
  const merged: Record<string, unknown> = {};

  // First copy all default apps
  for (const [appId, defaultData] of Object.entries(DEFAULT_APPS_DATA)) {
    // Ecommerce investigations must expose only the active case's supplied records.
    if (appId === 'ecommerce') continue;
    merged[appId] = defaultData && typeof defaultData === 'object' && !Array.isArray(defaultData) ? { ...defaultData } : defaultData;
  }

  // Then overlay case-specific app data
  for (const [appId, caseData] of Object.entries(caseAppsData)) {
    if (appId === 'ecommerce') {
      merged[appId] = caseData;
      continue;
    }
    if (caseData && typeof caseData === 'object' && !Array.isArray(caseData)) {
      merged[appId] = {
        ...(merged[appId] && typeof merged[appId] === 'object' ? merged[appId] : {}),
        ...caseData,
      };
    } else {
      merged[appId] = caseData;
    }
  }

  return merged;
}

/**
 * Loads a case configuration by its caseId (AC 1, AC 4).
 */
export function loadCase(caseId: string): CaseConfig {
  const config = BUNDLED_CASES[caseId];
  if (!config) {
    throw new Error('Không thể tải dữ liệu vụ án. Vui lòng thử lại!');
  }

  const validation = validateCaseConfig(config);
  if (!validation.isValid) {
    throw new Error(validation.error || 'Dữ liệu màn chơi không hợp lệ. Vui lòng tải lại trang!');
  }

  return {
    ...config,
    appsData: mergeWithDefaultAppsData(config.appsData),
  };
}

/**
 * Loads a case configuration by level number (0..3).
 */
export function loadCaseByLevel(levelNumber: number, husbandId: string = 'husband_01'): CaseConfig {
  if (levelNumber < 0 || levelNumber > 3) {
    throw new Error('Không tìm thấy màn chơi yêu cầu.');
  }

  const levelMeta = LEVEL_CATALOG.find(
    (lvl) => lvl.husbandId === husbandId && lvl.levelNumber === levelNumber
  );

  if (!levelMeta) {
    throw new Error('Không tìm thấy màn chơi yêu cầu.');
  }

  return loadCase(levelMeta.caseId);
}

