import { createElement, Suspense } from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { Writable } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { APP_REGISTRY } from './appRegistry';
import { createAppContext } from './appContext';
import { loadCase } from '../features/case-runtime';
import type { AppId } from '../shared/contracts/app-contracts';

function renderAsync(element: React.ReactElement): Promise<string> {
  return new Promise((resolve, reject) => {
    let html = '';
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        html += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
        callback();
      },
    });
    writable.on('finish', () => resolve(html));
    writable.on('error', reject);
    const { pipe } = renderToPipeableStream(element, {
      onAllReady() { pipe(writable); },
      onError(error) { reject(error); },
    });
  });
}

describe('app host projection', () => {
  it('registers Phone and Messages as distinct applications with legacy communication payload support', () => {
    expect(APP_REGISTRY.messages.component).not.toBe(APP_REGISTRY.phone.component);
    expect(APP_REGISTRY.messages.displayName).toBe('Tin nhắn');
    expect(APP_REGISTRY.phone.displayName).toBe('Điện thoại');
    expect(APP_REGISTRY.messages.dataKeys).toContain('comms');
    expect(APP_REGISTRY.comms.component).toBe(APP_REGISTRY.phone.component);
  });
  it('excludes truth, expected answers, and sibling payloads', () => {
    const source = loadCase('case_02');
    const context = createAppContext(source, 'banking');
    expect(context).not.toHaveProperty('groundTruth');
    expect(context.lockChallenges.every(challenge => !('expectedAnswer' in challenge))).toBe(true);
    expect(Object.keys(context.appsData).every(key => key === 'banking')).toBe(true);
    expect(source.groundTruth).toBeDefined();
    expect(source.lockChallenges.some(challenge => 'expectedAnswer' in challenge)).toBe(true);
  });

  it('renders every registered app for every bundled level using only its public context', async () => {
    for (const caseId of ['case_01', 'case_02', 'case_03']) {
      const config = loadCase(caseId);
      for (const [appId, definition] of Object.entries(APP_REGISTRY)) {
        const html = await renderAsync(createElement(
          Suspense,
          { fallback: null },
          createElement(definition.component, {
            caseData: createAppContext(config, appId as AppId),
            unlockedChallenges: new Set<string>(), onTagSuspect: vi.fn(), onReturnHome: vi.fn(), onRequestUnlock: vi.fn(),
          }),
        ));
        expect(html.length, `${caseId}/${appId}`).toBeGreaterThan(0);
      }
    }
  });
});
