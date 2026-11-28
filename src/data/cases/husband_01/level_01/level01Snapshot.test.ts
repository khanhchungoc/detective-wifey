import { describe, expect, it } from 'vitest';
import { loadCase } from '../../../../features/case-runtime';

// Parity guard: later data-normalization phases must keep this snapshot identical
// except for intentional, reviewed changes.
describe('Level 1 assembled case snapshot', () => {
  it('matches the runtime-loaded case with defaults merged', () => {
    expect(loadCase('case_01')).toMatchSnapshot();
  });
});
