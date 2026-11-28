import { describe, expect, it } from 'vitest';
import level01 from './index';

const EXPECTED_APP_IDS = [
  'internet-messaging',
  'ecommerce',
  'messages',
  'banking',
  'phone',
  'web-browser',
  'email',
  'ride-hailing',
  'photos',
  'team-collaboration',
  'personal-notes',
  'professional-network',
] as const;

describe('husband_01 level_01 modular CaseConfig assembly', () => {
  it('assembles core case metadata, groundTruth, suspectPool, and confrontationScript', () => {
    expect(level01.caseId).toBe('case_01');
    expect(level01.groundTruth).toBeDefined();
    expect(level01.groundTruth.culpritSuspectId).toBeTruthy();
    expect(Array.isArray(level01.suspectPool)).toBe(true);
    expect(level01.suspectPool.length).toBeGreaterThan(0);
    expect(level01.confrontationScript).toBeDefined();
    expect(Array.isArray(level01.confrontationScript?.opening)).toBe(true);
  });

  it('includes all 12 expected appsData keys with defined payloads', () => {
    const actualKeys = Object.keys(level01.appsData).sort();
    expect(actualKeys).toEqual([...EXPECTED_APP_IDS].sort());
    for (const appId of EXPECTED_APP_IDS) {
      expect(level01.appsData[appId]).toBeDefined();
    }
  });
});
