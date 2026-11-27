import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LocalStorageAdapter } from './localStorageAdapter';
import { SessionWriter } from './sessionWriter';
import { ResumeSessionModal } from './components/ResumeSessionModal';
import type { ActiveSessionState, GameStateRepository } from './types';

function createMemoryStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, String(value));
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
    get length() {
      return store.size;
    },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    _store: store,
  };
}

const sampleSession: ActiveSessionState = {
  schemaVersion: 1,
  gameId: 'jealous_wife',
  caseId: 'case_01',
  levelNumber: 1,
  activeApp: 'internet-messaging',
  suspicionStrikes: 1,
  taggedSuspects: [
    {
      suspectId: 'tag_1',
      displayName: 'Anh Tuấn Thợ Điện',
      sourceApp: 'internet-messaging',
      timestamp: 1000,
    },
  ],
  unlockedChallenges: ['lock_banking'],
  elapsedSeconds: 42,
  lastSavedAt: 1000,
};

describe('LocalStorageAdapter', () => {
  let storage: ReturnType<typeof createMemoryStorage>;
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    storage = createMemoryStorage();
    vi.stubGlobal('localStorage', storage);
    adapter = new LocalStorageAdapter();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('saves, reads, and clears active session including associated corkboard state', async () => {
    await adapter.saveActiveSession(sampleSession);
    storage.setItem('detective:v1:case_01:corkboard_state', '{"nodes":[]}');

    const loaded = await adapter.getActiveSession();
    expect(loaded?.caseId).toBe('case_01');
    expect(loaded?.taggedSuspects).toHaveLength(1);
    expect(loaded?.schemaVersion).toBe(1);

    await adapter.clearActiveSession();
    expect(await adapter.getActiveSession()).toBeNull();
    expect(storage.getItem('detective:v1:case_01:corkboard_state')).toBeNull();
  });

  it('returns null when stored session JSON is corrupt or schemaVersion mismatches', async () => {
    storage.setItem('detective:v1:jealous_wife:session', '{not-valid-json');
    expect(await adapter.getActiveSession()).toBeNull();

    storage.setItem(
      'detective:v1:jealous_wife:session',
      JSON.stringify({ ...sampleSession, schemaVersion: 99 }),
    );
    expect(await adapter.getActiveSession()).toBeNull();

    storage.setItem(
      'detective:v1:jealous_wife:session',
      JSON.stringify({ schemaVersion: 1, caseId: '' }),
    );
    expect(await adapter.getActiveSession()).toBeNull();
  });

  it('returns default player progress when empty or corrupt and merges partial updates', async () => {
    const initial = await adapter.getPlayerProgress();
    expect(initial.unlockedLevel).toBe(1);
    expect(initial.unlockedHusbandId).toBe('husband_hoang');

    await adapter.savePlayerProgress({ unlockedLevel: 2, bestStarRatings: { case_01: 3 } });
    const updated = await adapter.getPlayerProgress();
    expect(updated.unlockedLevel).toBe(2);
    expect(updated.bestStarRatings.case_01).toBe(3);

    storage.setItem('detective:v1:jealous_wife:progress', '{broken');
    const recovered = await adapter.getPlayerProgress();
    expect(recovered.unlockedLevel).toBe(1);
  });

  it('exports and imports save codes round-trip and rejects invalid codes', async () => {
    await adapter.saveActiveSession(sampleSession);
    await adapter.savePlayerProgress({ unlockedLevel: 3 });

    const code = await adapter.exportSaveCode();
    storage.clear();

    expect(await adapter.importSaveCode(code)).toBe(true);
    expect((await adapter.getActiveSession())?.caseId).toBe('case_01');
    expect((await adapter.getPlayerProgress()).unlockedLevel).toBe(3);

    expect(await adapter.importSaveCode('!!!invalid-base64!!!')).toBe(false);
  });
});

describe('SessionWriter', () => {
  it('invalidates queued saves when clear() is called before an earlier save runs', async () => {
    const calls: string[] = [];
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });

    const repo: GameStateRepository = {
      getActiveSession: async () => null,
      saveActiveSession: async (s) => {
        calls.push(`save:${s.caseId}:${s.elapsedSeconds}`);
        if (s.elapsedSeconds === 1) await firstGate;
      },
      clearActiveSession: async (_gameId, caseId) => {
        calls.push(`clear:${caseId ?? ''}`);
      },
      getPlayerProgress: async () => ({
        schemaVersion: 1,
        unlockedHusbandId: 'husband_hoang',
        unlockedLevel: 1,
        bestStarRatings: {},
        earnedWifeTitles: [],
        audioMutePreference: false,
      }),
      savePlayerProgress: async () => {},
      exportSaveCode: async () => '',
      importSaveCode: async () => true,
    };

    const writer = new SessionWriter(repo, 'jealous_wife');
    const p1 = writer.save({ ...sampleSession, elapsedSeconds: 1 });
    await Promise.resolve(); // let p1 start executing
    const p2 = writer.save({ ...sampleSession, elapsedSeconds: 2 });
    const pClear = writer.clear('case_01');

    releaseFirst();
    await Promise.all([p1, p2, pClear]);

    // p1 was already executing, p2 must be skipped due to generation bump, then clear runs.
    expect(calls).toEqual(['save:case_01:1', 'clear:case_01']);
  });
});

describe('ResumeSessionModal', () => {
  it('renders level number, pinned clue count, strikes, and both action buttons', () => {
    const html = renderToStaticMarkup(
      <ResumeSessionModal session={sampleSession} onResume={() => {}} onRestart={() => {}} />,
    );

    expect(html).toContain('Tiếp Tục Điều Tra?');
    expect(html).toContain('Màn 1');
    expect(html).toContain('1 manh mối đã ghim');
    expect(html).toContain('1 điểm nghi ngờ');
    expect(html).toContain('Tiếp tục điều tra');
    expect(html).toContain('Bắt đầu lại màn này');
  });
});
