import husband01Level00 from './husband_01/level_00';
import husband01Level01 from './husband_01/level_01';
import { CaseConfig } from '../../shared/contracts/case-schema';

export const case00 = husband01Level00;
export const case01 = husband01Level01;

/** Levels 2 and 3 are listed as "coming soon" in LEVEL_CATALOG and have no bundled data yet. */
export const ALL_CASES: Record<string, CaseConfig> = {
  case_00: case00,
  case_01: case01,
};
