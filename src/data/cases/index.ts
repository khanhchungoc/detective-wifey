import hoangLevel01 from './hoang/level_01';
import { CaseConfig } from '../../shared/contracts/case-schema';

export const case01 = hoangLevel01;

/** Levels 2 and 3 are listed as "coming soon" in LEVEL_CATALOG and have no bundled data yet. */
export const ALL_CASES: Record<string, CaseConfig> = {
  case_01: case01,
};
