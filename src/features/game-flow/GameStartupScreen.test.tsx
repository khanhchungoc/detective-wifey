import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  GameStartupScreen,
  StartupActionArea,
  createStartGuard,
  preloadImageAssets,
  unlockWebAudio,
  type PreloadImageLike,
} from './GameStartupScreen';

describe('GameStartupScreen (US-035)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('renders full-bleed responsive noir hero, stylized title lockup, and initial loading state', () => {
    const html = renderToStaticMarkup(<GameStartupScreen onStart={vi.fn()} />);

    expect(html).not.toContain('sm:max-w-[480px]');
    expect(html).toContain('w-full h-[100dvh]');
    expect(html).toContain('md:object-[68%_center]');
    expect(html).toContain('startup-film-grain');
    expect(html).toContain('md:max-w-xl');
    expect(html).toContain('pb-24');
    expect(html).toContain('HỒ SƠ ĐÊM KHUYA · 23:45');
    expect(html).toContain('Bắt được');
    expect(html).toContain('Tiểu tam');
    expect(html).toContain('Chồng vừa ngủ say, cuộc điều tra bắt đầu...');
    expect(html).toContain('font-handwriting');
    expect(html).toContain('bg-game-crimson');
    expect(html).toContain('Đang tải');
    expect(html).toContain('0%');
    expect(html).not.toContain('Chạm để bắt đầu');
    expect(html).not.toContain('Hồ sơ 01');
  });

  it('advances default preloader to 100% without auto-starting', () => {
    const onStart = vi.fn();
    const progressValues: number[] = [];
    const onComplete = vi.fn();

    const cleanup = preloadImageAssets(
      [],
      (pct) => progressValues.push(pct),
      onComplete,
      { defaultDurationMs: 250 },
    );

    vi.advanceTimersByTime(300);

    expect(progressValues.length).toBeGreaterThan(0);
    expect(progressValues[progressValues.length - 1]).toBe(100);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onStart).not.toHaveBeenCalled();

    cleanup();
  });

  it('renders restrained editorial noir CTA once ready', () => {
    const html = renderToStaticMarkup(
      <StartupActionArea
        progress={100}
        isReady={true}
        isStarting={false}
        onStartClick={vi.fn()}
      />,
    );

    expect(html).toContain('Chạm để bắt đầu');
    expect(html).toContain('touch-target-min');
    expect(html).toContain('rounded-sm');
    expect(html).toContain('bg-black/55');
    expect(html).toContain('border-l-game-crimson');
    expect(html).toContain('hover:bg-game-paper');
    expect(html).not.toContain('role="progressbar"');
  });

  it('unlocks audio and debounces rapid double-taps so onStart fires strictly once', () => {
    const onStart = vi.fn();
    const resume = vi.fn(() => Promise.resolve());
    const AudioContextMock = vi.fn(function AudioContextCtor(this: { state: string; resume: () => Promise<void> }) {
      this.state = 'suspended';
      this.resume = resume;
    });

    const triggerStart = createStartGuard(
      onStart,
      () => unlockWebAudio({ AudioContext: AudioContextMock as unknown as new () => { state: string; resume: () => Promise<void> } }),
    );

    expect(triggerStart()).toBe(true);
    expect(triggerStart()).toBe(false);
    expect(triggerStart()).toBe(false);

    expect(AudioContextMock).toHaveBeenCalledTimes(1);
    expect(resume).toHaveBeenCalledTimes(1);
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('reaches ready state gracefully even when a preloaded asset fails to load', () => {
    const createdImages: PreloadImageLike[] = [];
    const progressValues: number[] = [];
    const onComplete = vi.fn();

    const cleanup = preloadImageAssets(
      ['/assets/portrait-ok.png', '/assets/portrait-missing.png'],
      (pct) => progressValues.push(pct),
      onComplete,
      {
        createImage: () => {
          const img: PreloadImageLike = { onload: null, onerror: null, src: '' };
          createdImages.push(img);
          return img;
        },
      },
    );

    expect(createdImages).toHaveLength(2);
    createdImages[0].onload?.();
    expect(progressValues).toEqual([50]);
    expect(onComplete).not.toHaveBeenCalled();

    createdImages[1].onerror?.();
    expect(progressValues).toEqual([50, 100]);
    expect(onComplete).toHaveBeenCalledTimes(1);

    cleanup();
  });

  it('never throws when Web Audio is unavailable in the environment', () => {
    expect(unlockWebAudio({})).toBe(false);
  });
});
