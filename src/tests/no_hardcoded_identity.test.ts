import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { husband01Master } from '../data/cases/husband_01/master';

const SRC = path.resolve(__dirname, '..');
const posix = (file: string) => file.split(path.sep).join('/');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const isTestFile = (rel: string) => /\.test\.tsx?$/.test(rel) || rel.startsWith('tests/');

describe('no hard-coded husband identity outside case data', () => {
  const { shortName, nickname, fullName, fullNameAscii, handle } = husband01Master.husband;
  const needles = [shortName, nickname, fullName, fullNameAscii, handle];

  const files = walk(SRC)
    .map((full) => ({ full, rel: posix(path.relative(SRC, full)) }))
    .filter(({ rel }) => {
      if (rel.startsWith('data/cases/') || isTestFile(rel)) return false;
      if (/\.tsx?$/.test(rel)) return true;
      return rel.startsWith('data/defaults/') && rel.endsWith('.json');
    });

  it('scans a non-trivial set of files', () => {
    expect(files.length).toBeGreaterThan(50);
  });

  it.each(needles)('never contains %s', (needle) => {
    const hits = files.filter(({ full }) => readFileSync(full, 'utf8').includes(needle)).map(({ rel }) => rel);
    expect(hits).toEqual([]);
  });
});
