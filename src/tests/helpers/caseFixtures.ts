import { afterEach, beforeEach } from 'vitest';
import { ALL_CASES, case01 } from '../../data/cases';
import type { CaseConfig } from '../../shared/contracts/case-schema';

/**
 * Test-only stand-ins for Level 2 and Level 3, which ship as "coming soon" with no bundled data.
 * Derived from case01 so apps, suspects and ground truth stay valid. They use the catalog ids
 * `case_02` / `case_03` so level lookups work; the catalog entries stay comingSoon.
 */
export const case02Fixture: CaseConfig = {
  ...case01,
  caseId: 'case_02',
  levelNumber: 2,
  allowedStrikes: 4,
  confrontationScript: undefined,
  activeAppIds: ['ecommerce', 'ride-hailing', 'web-browser', 'internet-messaging', 'banking', 'comms'],
  lockChallenges: [
    {
      challengeId: 'lock_banking',
      targetType: 'app',
      targetId: 'banking',
      lockType: 'numeric_pin',
      expectedAnswer: '1310',
      clueSourceApp: 'internet-messaging',
      promptQuestion: 'Nhập mã PIN 4 số bảo mật của Techcornbank',
    },
  ],
};

export const case03Fixture: CaseConfig = {
  ...case01,
  caseId: 'case_03',
  levelNumber: 3,
  allowedStrikes: 3,
  confrontationScript: undefined,
  activeAppIds: case01.activeAppIds.slice(0, 11),
  lockChallenges: [],
};

export function registerCaseFixtures(): void {
  ALL_CASES.case_02 = case02Fixture;
  ALL_CASES.case_03 = case03Fixture;
}

export function unregisterCaseFixtures(): void {
  delete ALL_CASES.case_02;
  delete ALL_CASES.case_03;
}

/** Registers the fixtures for every test in the calling suite and restores the registry after each. */
export function useCaseFixtures(): void {
  beforeEach(registerCaseFixtures);
  afterEach(unregisterCaseFixtures);
}
