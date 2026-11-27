import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IoArrowForwardOutline } from 'react-icons/io5';
import startupHeroUrl from './assets/startup-hero.jpg';

export interface GameStartupScreenProps {
  onStart: () => void;
  preloadAssets?: string[];
  versionLabel?: string;
}

export interface PreloadImageLike {
  onload: (() => void) | null;
  onerror: (() => void) | null;
  src: string;
}

export interface PreloadOptions {
  createImage?: () => PreloadImageLike;
  defaultDurationMs?: number;
}

interface AudioContextLike {
  state?: string;
  resume?: () => Promise<void> | void;
}

interface WindowWithAudio {
  AudioContext?: new () => AudioContextLike;
  webkitAudioContext?: new () => AudioContextLike;
}

const DEFAULT_PRELOAD_DURATION_MS = 300;
const DEFAULT_PRELOAD_STEPS = 5;
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function unlockWebAudio(targetWindow?: WindowWithAudio): boolean {
  const win = targetWindow ?? (typeof window !== 'undefined' ? (window as unknown as WindowWithAudio) : undefined);
  if (!win) return false;

  const AudioContextCtor = win.AudioContext ?? win.webkitAudioContext;
  if (!AudioContextCtor) return false;

  try {
    const context = new AudioContextCtor();
    if (context.state === 'suspended' && typeof context.resume === 'function') {
      void Promise.resolve(context.resume()).catch(() => {});
    }
    return true;
  } catch {
    return false;
  }
}

export function createStartGuard(
  onStart: () => void,
  unlockAudio: () => boolean = () => unlockWebAudio(),
): () => boolean {
  let started = false;
  return () => {
    if (started) return false;
    started = true;
    try {
      unlockAudio();
    } catch {
      // Audio unlock failure must never block entering the game.
    }
    onStart();
    return true;
  };
}

export function preloadImageAssets(
  assets: readonly string[],
  onProgress: (percent: number) => void,
  onComplete: () => void,
  options?: PreloadOptions,
): () => void {
  let cancelled = false;

  if (assets.length === 0) {
    const durationMs = options?.defaultDurationMs ?? DEFAULT_PRELOAD_DURATION_MS;
    const stepMs = Math.max(16, Math.round(durationMs / DEFAULT_PRELOAD_STEPS));
    let step = 0;

    const timerId = setInterval(() => {
      if (cancelled) return;
      step += 1;
      const nextPercent = Math.min(100, Math.round((step / DEFAULT_PRELOAD_STEPS) * 100));
      onProgress(nextPercent);
      if (nextPercent >= 100) {
        clearInterval(timerId);
        onComplete();
      }
    }, stepMs);

    return () => {
      cancelled = true;
      clearInterval(timerId);
    };
  }

  const createImage: (() => PreloadImageLike) | undefined =
    options?.createImage ??
    (typeof Image !== 'undefined' ? () => new Image() as unknown as PreloadImageLike : undefined);

  if (!createImage) {
    onProgress(100);
    onComplete();
    return () => {
      cancelled = true;
    };
  }

  const total = assets.length;
  let settled = 0;
  const images: PreloadImageLike[] = [];

  const handleSettle = (doneRef: { settled: boolean }) => {
    if (doneRef.settled || cancelled) return;
    doneRef.settled = true;
    settled += 1;
    const nextPercent = Math.min(100, Math.round((settled / total) * 100));
    onProgress(nextPercent);
    if (settled >= total) {
      onComplete();
    }
  };

  for (const src of assets) {
    const doneRef = { settled: false };
    try {
      const img = createImage();
      images.push(img);
      img.onload = () => handleSettle(doneRef);
      img.onerror = () => handleSettle(doneRef);
      img.src = src;
    } catch {
      handleSettle(doneRef);
    }
  }

  return () => {
    cancelled = true;
    for (const img of images) {
      img.onload = null;
      img.onerror = null;
    }
  };
}

export interface StartupActionAreaProps {
  progress: number;
  isReady: boolean;
  isStarting: boolean;
  onStartClick: () => void;
}

export const StartupActionArea: React.FC<StartupActionAreaProps> = ({
  progress,
  isReady,
  isStarting,
  onStartClick,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="w-full min-h-[68px] flex flex-col justify-end items-center md:items-start">
      <AnimatePresence mode="wait" initial={false}>
        {!isReady ? (
          <motion.div
            key="startup-preloader"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2, ease: EASE_OUT }}
            className="w-full max-w-[260px] space-y-2.5"
            aria-live="polite"
          >
            <div className="flex items-center justify-between text-ios-footnote text-white/75">
              <span>Đang tải</span>
              <span className="tabular-nums text-white/90">{clampedProgress}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Tiến độ tải trò chơi"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clampedProgress}
              className="h-1 w-full overflow-hidden rounded-full bg-white/15"
            >
              <motion.div
                className="h-full w-full origin-left rounded-full bg-game-crimson"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: clampedProgress / 100 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: EASE_OUT }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="startup-ready"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.26, ease: EASE_OUT }}
            className="w-full flex justify-center md:justify-start"
          >
            <motion.button
              type="button"
              disabled={isStarting}
              onClick={onStartClick}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.97 }}
              transition={{ duration: 0.08 }}
              className="group touch-target-min w-auto min-w-[240px] min-h-[52px] px-8 py-3 inline-flex items-center justify-center gap-3 rounded-sm bg-black/55 backdrop-blur-md border border-white/25 border-l-4 border-l-game-crimson text-ios-headline font-semibold tracking-wide text-white shadow-[0_12px_32px_rgba(0,0,0,0.45)] transition-colors duration-200 hover:bg-game-paper hover:text-game-ink hover:border-game-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-game-paper disabled:opacity-75"
            >
              <span>Chạm để bắt đầu</span>
              <IoArrowForwardOutline
                aria-hidden="true"
                className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transform-none"
              />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const GameStartupScreen: React.FC<GameStartupScreenProps> = ({
  onStart,
  preloadAssets,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;

  const startGuardRef = useRef<(() => boolean) | null>(null);
  if (!startGuardRef.current) {
    startGuardRef.current = createStartGuard(() => {
      onStartRef.current();
    });
  }

  useEffect(() => {
    const assets = preloadAssets ?? [];
    setProgress(0);
    setIsReady(false);

    return preloadImageAssets(
      assets,
      (nextProgress) => setProgress(nextProgress),
      () => {
        setProgress(100);
        setIsReady(true);
      },
    );
  }, [preloadAssets]);

  const handleStartClick = useCallback(() => {
    if (!isReady) return;
    const triggered = startGuardRef.current?.() ?? false;
    if (triggered) {
      setIsStarting(true);
    }
  }, [isReady]);

  return (
    <main
      aria-label="Màn hình khởi động Bắt được Tiểu tam"
      className="w-full h-[100dvh] bg-game-backdrop text-white font-sans relative overflow-hidden select-none"
    >
      {/* Full-bleed midnight bedroom comic-noir hero artwork */}
      <motion.img
        src={startupHeroUrl}
        alt=""
        aria-hidden="true"
        initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0.85, scale: 1.06 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 1.1, ease: EASE_OUT }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center md:object-[68%_center]"
      />

      {/* Mobile top & bottom legibility scrims preserving the lit middle scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-game-backdrop/85 via-game-backdrop/15 to-game-backdrop/95 md:hidden"
      />

      {/* Desktop asymmetric noir vignette: calm dark left-third, dramatic lit right scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-game-backdrop/95 via-game-backdrop/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-t from-game-backdrop/80 via-transparent to-game-backdrop/45"
      />

      {/* Subtle analog film-grain noise texture */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.04]"
      >
        <filter id="startup-film-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#startup-film-grain)" />
      </svg>

      {/* Responsive editorial column: mobile top/bottom split, desktop left-third */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between items-center text-center px-6 pt-12 pb-24 md:max-w-xl md:items-start md:text-left md:justify-center md:px-16 md:py-0">
        {/* Stylized noir casefile title lockup */}
        <motion.header
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.36, delay: prefersReducedMotion ? 0 : 0.08, ease: EASE_OUT }}
          className="flex flex-col items-center md:items-start"
        >
          <div className="inline-flex items-center gap-2.5 text-ios-caption-1 font-semibold uppercase tracking-[0.2em] text-game-paper/80">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-game-crimson" />
            <span aria-hidden="true" className="h-px w-5 bg-game-crimson/80" />
            <span>HỒ SƠ ĐÊM KHUYA · 23:45</span>
          </div>

          <h1 className="mt-4 flex flex-col items-center md:items-start leading-none">
            <span className="text-3xl md:text-5xl font-light tracking-wide text-white/90 drop-shadow-[0_2px_12px_rgba(0,0,0,0.75)]">
              Bắt được
            </span>
            <span className="mt-1.5 inline-flex flex-col items-center md:items-start">
              <span className="font-handwriting text-6xl md:text-7xl leading-none text-game-paper drop-shadow-[0_6px_24px_rgba(0,0,0,0.85)]">
                Tiểu tam
              </span>
              <span
                aria-hidden="true"
                className="mt-2 h-1.5 w-44 md:w-56 -rotate-1 rounded-sm bg-game-crimson shadow-[0_2px_14px_rgba(225,29,72,0.5)]"
              />
            </span>
          </h1>

          <p className="mt-5 max-w-sm md:max-w-md text-ios-callout md:text-ios-title-3 font-normal text-white/75 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Chồng vừa ngủ say, cuộc điều tra bắt đầu...
          </p>
        </motion.header>

        {/* Preloader / restrained editorial noir CTA */}
        <motion.footer
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.32, delay: prefersReducedMotion ? 0 : 0.16, ease: EASE_OUT }}
          className="w-full md:mt-10"
        >
          <StartupActionArea
            progress={progress}
            isReady={isReady}
            isStarting={isStarting}
            onStartClick={handleStartClick}
          />
        </motion.footer>
      </div>
    </main>
  );
};

export default GameStartupScreen;
