import hoangLevel01 from './hoang/level_01';
import hoangLevel02 from './hoang/level_02.json';
import hoangLevel03 from './hoang/level_03.json';
import { CaseConfig } from '../../shared/contracts/case-schema';

export const case01 = hoangLevel01;
export const case02 = hoangLevel02 as unknown as CaseConfig;
export const case03 = hoangLevel03 as unknown as CaseConfig;

export const ALL_CASES: Record<string, CaseConfig> = {
  case_01: case01,
  case_02: case02,
  case_03: case03,
};

