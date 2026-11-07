import assert from 'node:assert/strict';
import { describe, it } from 'vitest';
import {
  loadCase,
  loadCaseByLevel,
  getAvailableLevels,
  validateCaseConfig,
} from '../features/case-runtime';
import { case01 } from '../data/cases';
import { APP_REGISTRY, DOCK_APP_IDS, UPPER_GRID_APP_IDS, ALL_LAUNCHER_APP_IDS } from '../bootstrap/appRegistry';
import { LocalStorageAdapter } from '../features/session';
import { CaseConfig } from '../shared/contracts/case-schema';
import { readAppData as readRides } from '../apps/ride-hailing/data';
import { readAppData as readBrowser } from '../apps/web-browser/data';
import { readPhotosData } from '../apps/photos/data';

describe('US-001 & US-002 acceptance suite', () => {
  it('runs declarative schema, shell, and persistence gates', async () => {

// -------------------------------------------------------------
// US-001: Declarative Case & Content Schema Engine
// -------------------------------------------------------------

console.log('[US-001 - AC 1] Level 1 Case Schema Ingestion and Initialization');
const c1 = loadCase('case_01');
assert.equal(c1.caseId, 'case_01');
assert.equal(c1.husbandId, 'husband_hoang');
assert.equal(c1.levelNumber, 1);
assert.equal(c1.allowedStrikes, 5, 'Level 1 must allow exactly 5 strikes');
assert.ok(c1.suspectPool.length >= 1, 'Must have at least 1 initial suspect');
assert.equal(c1.deviceMetadata.narrativeTime, '23:45');
assert.equal(c1.deviceMetadata.batteryPercent, '42%');
assert.equal(c1.deviceMetadata.carrierTag, '5G');
assert.equal(c1.deviceMetadata.pwaThemeColor, '#0f172a');
console.log('  -> PASS: Level 1 case initialized with correct strikes and telemetry.\n');

console.log('[US-001 - AC 2] Suspicion Strike Boundary Enforcement Across Levels');
const c2 = loadCase('case_02');
assert.equal(c2.levelNumber, 2);
assert.equal(c2.allowedStrikes, 4, 'Level 2 must enforce allowed strike boundary of 4');

const c3 = loadCase('case_03');
assert.equal(c3.levelNumber, 3);
assert.equal(c3.allowedStrikes, 3, 'Level 3 must enforce allowed strike boundary of 3');

// Tamper strike check
const invalidStrikeCase: CaseConfig = {
  ...case01,
  allowedStrikes: 3, // invalid for level 1 (must be 5)
};
const strikeValidation = validateCaseConfig(invalidStrikeCase);
assert.equal(strikeValidation.isValid, false);
console.log('  -> PASS: Strike boundaries strictly enforced (L1: 5, L2: 4, L3: 3).\n');

console.log('[US-001 - AC 3] Ground Truth Integrity and Suspect Culprit Mapping');
assert.equal(c1.groundTruth.verdict, 'cheating');
assert.ok(c1.suspectPool.some((s) => s.suspectId === c1.groundTruth.culpritSuspectId));
assert.ok(c1.groundTruth.narrativeRoast.length > 0);

// Invalid culprit check
const invalidCulpritCase: CaseConfig = {
  ...case01,
  groundTruth: {
    ...case01.groundTruth,
    culpritSuspectId: 'non_existent_suspect_id',
  },
};
const culpritValidation = validateCaseConfig(invalidCulpritCase);
assert.equal(culpritValidation.isValid, false);
console.log('  -> PASS: Ground truth verified against suspect pool.\n');

console.log('[US-001 - AC 4] Exception Handling for Corrupt or Missing Case Configuration');
assert.throws(
  () => loadCase('non_existent_case_999'),
  /Không thể tải dữ liệu vụ án/
);
assert.throws(
  () => loadCaseByLevel(5),
  /Không tìm thấy màn chơi yêu cầu/
);
console.log('  -> PASS: Missing or corrupt case triggers expected fallback errors.\n');

console.log('[US-001 - AC 5] Level Catalog Manifest Exposure for Level Selector');
const levels = getAvailableLevels('husband_hoang');
assert.equal(levels.length, 3, 'Catalog must return 3 levels');
assert.equal(levels[0].levelNumber, 1);
assert.equal(levels[0].allowedStrikes, 5);
assert.equal(levels[1].levelNumber, 2);
assert.equal(levels[1].allowedStrikes, 4);
assert.equal(levels[2].levelNumber, 3);
assert.equal(levels[2].allowedStrikes, 3);
console.log('  -> PASS: Catalog manifest returns ordered level metadata list.\n');

console.log('[US-001 - AC 6] Ordinary Daily Activity in Supplied Apps');
assert.ok(readRides(c1.appsData['ride-hailing']).trips.length >= 20, 'Ride-hailing retains extended ordinary activity');
assert.ok(readBrowser(c1.appsData['web-browser']).history.length >= 25, 'Web browser retains extended reading history');
assert.ok(readPhotosData(c1.appsData.photos).albums.flatMap(album => album.photos).length >= 16, 'Photos retains extended ordinary photos');
console.log('  -> PASS: Case-supplied ordinary activity survives runtime loading.\n');

// -------------------------------------------------------------
// US-002: Virtual Phone Shell Container & Level-Based App Grid
// -------------------------------------------------------------

console.log('[US-002 - AC 1 & AC 3] Level-Based App Mounting');
assert.deepEqual(c1.activeAppIds, ['internet-messaging', 'banking', 'ecommerce', 'phone', 'messages', 'ride-hailing', 'web-browser', 'photos', 'personal-notes', 'email', 'professional-network', 'team-collaboration']);
assert.ok(c1.activeAppIds.every(app => APP_REGISTRY[app as keyof typeof APP_REGISTRY]), 'Every supplied app has a registered implementation');

assert.equal(c2.activeAppIds.length, 6, 'Level 2 must configure 5 to 6 active apps');
assert.equal(c3.activeAppIds.length, 11, 'Level 3 mounts all 11 registered apps');
console.log('  -> PASS: Level-based active apps dynamically partitioned.\n');

console.log('[US-002 - AC 2] Micro-App Registry & Dock Fast Access Mapping');
assert.ok(APP_REGISTRY['internet-messaging'], 'Internet Messaging must be registered in APP_REGISTRY');
assert.ok(APP_REGISTRY['banking'], 'Banking must be registered in APP_REGISTRY');
assert.ok(APP_REGISTRY['ecommerce'], 'Ecommerce must be registered in APP_REGISTRY');
assert.ok(APP_REGISTRY.comms, 'Comms must be registered in APP_REGISTRY');
assert.deepEqual(DOCK_APP_IDS, ['phone', 'internet-messaging', 'banking', 'messages'], 'Dock apps match canonical 4-app frosted dock tray');
assert.equal(UPPER_GRID_APP_IDS.length, 8, 'SpringBoard upper grid displays 8 apps');
assert.equal(ALL_LAUNCHER_APP_IDS.length, 12, 'SpringBoard displays 12 apps total (8 upper grid + 4 dock)');
console.log('  -> PASS: All micro-apps correctly registered with components and icons.\n');

console.log('[US-002 - AC 7] Shared PIN Lockpad Puzzle Target Resolution');
assert.equal(c2.lockChallenges.length, 1, 'Level 2 has 1 lock challenge');
const pinChallenge = c2.lockChallenges[0];
assert.equal(pinChallenge.expectedAnswer, '1310');
assert.equal(pinChallenge.targetId, 'banking');
console.log('  -> PASS: Shared PIN lock target and challenge verified.\n');

console.log('[US-002 Persistence Gate] GameStateRepository & LocalStorageAdapter Contract');
// Mock localStorage in Node
const mockStorage: Record<string, string> = {};
globalThis.localStorage = {
  getItem: (k: string) => mockStorage[k] || null,
  setItem: (k: string, v: string) => { mockStorage[k] = v; },
  removeItem: (k: string) => { delete mockStorage[k]; },
  clear: () => { for (const k in mockStorage) delete mockStorage[k]; },
  length: 0,
  key: () => null,
};

const store = new LocalStorageAdapter();
await store.saveActiveSession({
  schemaVersion: 1,
  gameId: 'jealous_wife',
  caseId: 'case_01',
  levelNumber: 1,
  activeApp: 'internet-messaging',
  suspicionStrikes: 4,
  taggedSuspects: [
    { suspectId: 's1', displayName: 'Hương Đồng Nghiệp', sourceApp: 'internet-messaging', timestamp: Date.now() },
  ],
  unlockedChallenges: [],
  elapsedSeconds: 45,
  lastSavedAt: Date.now(),
});

const restored = await store.getActiveSession('jealous_wife');
assert.ok(restored !== null);
assert.equal(restored?.caseId, 'case_01');
assert.equal(restored?.activeApp, 'internet-messaging');
assert.equal(restored?.suspicionStrikes, 4);
assert.equal(restored?.taggedSuspects.length, 1);
console.log('  -> PASS: Session persistence and restoration verified.\n');

console.log('=== ALL US-001 & US-002 TESTS PASSED PERFECTLY ===\n');
  });
});
