import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  IoFolderOpenOutline,
  IoPlay,
  IoStar,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
} from 'react-icons/io5';
import startupHeroUrl from './assets/startup-hero.jpg';
import gameLogoUrl from './assets/game-logo.png';

export interface GameStartupScreenProps {
  onStart: () => void;
  onContinue?: () => void;
  hasOngoingGame?: boolean;
  ongoingLevelNumber?: number;
  isMuted?: boolean;
  onToggleMute?: () => void;
  earnedStars?: number;
  maxStars?: number;
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
  hasOngoingGame?: boolean;
  ongoingLevelNumber?: number;
  onStartClick: () => void;
  onContinueClick?: () => void;
}

export const StartupActionArea: React.FC<StartupActionAreaProps> = ({
  progress,
  isReady,
  isStarting,
  hasOngoingGame = false,
  ongoingLevelNumber,
  onStartClick,
  onContinueClick,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const clampedProgress = Math.max(0, Math.min(100, Math.round(progress)));
  const showContinue = Boolean(hasOngoingGame && onContinueClick);

  return (
    <div className="w-full min-h-[116px] flex flex-col justify-end items-center md:items-start">
      <AnimatePresence mode="wait" initial={false}>
        {!isReady ? (
          <motion.div
            key="startup-preloader"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -4 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2, ease: EASE_OUT }}
            className="w-full max-w-[264px] space-y-2"
          >
            <div className="flex items-center justify-between text-ios-footnote text-game-text-secondary">
              <span>Đang tải</span>
              <span className="tabular-nums font-medium text-game-text">{clampedProgress}%</span>
            </div>
            <div
              role="progressbar"
              aria-label="Tiến độ tải trò chơi"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={clampedProgress}
              className="h-1.5 w-full overflow-hidden rounded-full bg-white/10"
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
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.24, ease: EASE_OUT }}
            className="w-full max-w-[272px] flex flex-col items-center md:items-start gap-3"
          >
            {showContinue && (
              <motion.button
                type="button"
                disabled={isStarting}
                onClick={onContinueClick}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98, y: 1 }}
                transition={{ duration: 0.12 }}
                className="game-btn-primary touch-target-min w-full min-h-[52px] px-6 py-3 inline-flex items-center justify-center gap-2.5 rounded-xl text-ios-callout font-semibold text-white transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-game-paper disabled:opacity-75"
              >
                <IoPlay aria-hidden="true" className="w-[18px] h-[18px] shrink-0" />
                <span>
                  {ongoingLevelNumber ? `Tiếp tục · Màn ${ongoingLevelNumber}` : 'Tiếp tục'}
                </span>
              </motion.button>
            )}

            <motion.button
              type="button"
              disabled={isStarting}
              onClick={onStartClick}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.98, y: 1 }}
              transition={{ duration: 0.12 }}
              className={
                showContinue
                  ? 'game-btn-secondary touch-target-min w-full min-h-[48px] px-6 py-3 inline-flex items-center justify-center gap-2.5 rounded-xl text-ios-subheadline font-medium text-game-paper transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-game-paper disabled:opacity-75'
                  : 'game-btn-primary touch-target-min w-full min-h-[52px] px-6 py-3 inline-flex items-center justify-center gap-2.5 rounded-xl text-ios-callout font-semibold text-white transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-game-paper disabled:opacity-75'
              }
            >
              {showContinue ? (
                <IoFolderOpenOutline aria-hidden="true" className="w-[18px] h-[18px] shrink-0 text-game-text-secondary" />
              ) : (
                <IoPlay aria-hidden="true" className="w-[18px] h-[18px] shrink-0" />
              )}
              <span>Bắt đầu</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const GameStartupScreen: React.FC<GameStartupScreenProps> = ({
  onStart,
  onContinue,
  hasOngoingGame = false,
  ongoingLevelNumber,
  isMuted = false,
  onToggleMute,
  earnedStars = 0,
  maxStars = 9,
  preloadAssets,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const onStartRef = useRef(onStart);
  onStartRef.current = onStart;

  const onContinueRef = useRef(onContinue);
  onContinueRef.current = onContinue;

  const pendingActionRef = useRef<'start' | 'continue'>('start');

  const startGuardRef = useRef<(() => boolean) | null>(null);
  if (!startGuardRef.current) {
    startGuardRef.current = createStartGuard(() => {
      if (pendingActionRef.current === 'continue' && onContinueRef.current) {
        onContinueRef.current();
      } else {
        onStartRef.current();
      }
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
    pendingActionRef.current = 'start';
    const triggered = startGuardRef.current?.() ?? false;
    if (triggered) {
      setIsStarting(true);
    }
  }, [isReady]);

  const handleContinueClick = useCallback(() => {
    if (!isReady || !onContinueRef.current) return;
    pendingActionRef.current = 'continue';
    const triggered = startGuardRef.current?.() ?? false;
    if (triggered) {
      setIsStarting(true);
    }
  }, [isReady]);

  return (
    <main
      aria-label="Màn hình khởi động Bắt được Tiểu tam"
      className="w-full h-[100dvh] bg-game-backdrop text-game-text font-sans relative overflow-hidden select-none"
    >
      {/* Full-bleed midnight bedroom scene */}
      <motion.img
        src={startupHeroUrl}
        alt=""
        aria-hidden="true"
        initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0.9, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.7, ease: EASE_OUT }}
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center md:object-[68%_center]"
      />

      {/* Mobile top & bottom legibility scrims preserving the middle scene */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-game-backdrop/85 via-game-backdrop/10 to-game-backdrop/95 md:hidden"
      />

      {/* Desktop asymmetric scrim: calm dark left-third, lit bedroom scene on right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-r from-game-backdrop/95 via-game-backdrop/65 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden md:block bg-gradient-to-t from-game-backdrop/75 via-transparent to-game-backdrop/40"
      />

      {/* Top-right quiet utility bar */}
      {(onToggleMute || earnedStars > 0) && (
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {earnedStars > 0 && (
            <div
              aria-label={`Đã đạt ${earnedStars} trên ${maxStars} sao`}
              className="min-h-[44px] px-3 rounded-xl bg-game-dossier/85 border border-white/10 inline-flex items-center gap-1.5 text-ios-footnote font-medium text-game-text tabular-nums"
            >
              <IoStar aria-hidden="true" className="w-4 h-4 text-game-amber shrink-0" />
              <span>
                {earnedStars}/{maxStars}
              </span>
            </div>
          )}

          {onToggleMute && (
            <button
              type="button"
              onClick={onToggleMute}
              aria-label="Tắt âm thanh"
              aria-pressed={isMuted}
              className="touch-target-min w-11 h-11 rounded-xl bg-game-dossier/85 border border-white/10 inline-flex items-center justify-center text-game-text-secondary hover:bg-game-elevated hover:text-game-text transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-game-paper"
            >
              {isMuted ? (
                <IoVolumeMuteOutline aria-hidden="true" className="w-5 h-5" />
              ) : (
                <IoVolumeHighOutline aria-hidden="true" className="w-5 h-5 text-game-text" />
              )}
            </button>
          )}
        </div>
      )}

      {/* Responsive layout: mobile top/bottom split, desktop left-third */}
      <div className="relative z-10 flex h-full w-full flex-col justify-between items-center text-center px-6 pt-16 pb-16 md:max-w-xl md:items-start md:text-left md:justify-center md:px-16 md:py-0">
        {/* Illustrated comic-noir game title logo */}
        <motion.header
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.34, delay: prefersReducedMotion ? 0 : 0.06, ease: EASE_OUT }}
          className="flex flex-col items-center md:items-start"
        >
          <h1 className="m-0">
            <img
              src={gameLogoUrl}
              alt="Bắt được Tiểu tam"
              width={960}
              height={539}
              fetchPriority="high"
              draggable={false}
              className="w-[272px] sm:w-[308px] md:w-[360px] h-auto select-none drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
            />
          </h1>

        </motion.header>

        {/* Preloader / Tactile Game CTA Stack */}
        <motion.footer
          initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.3, delay: prefersReducedMotion ? 0 : 0.14, ease: EASE_OUT }}
          className="flex w-full flex-col items-center gap-5 md:mt-10 md:items-start"
        >
          {/* Tagline sits in the dark band above the CTA so it never crosses the hero art */}
          <p className="max-w-xs text-ios-subheadline font-medium text-game-text [text-shadow:0_1px_8px_rgba(0,0,0,0.9)] md:max-w-sm md:text-ios-callout">
            Chồng vừa ngủ say, cuộc điều tra bắt đầu
          </p>
          <StartupActionArea
            progress={progress}
            isReady={isReady}
            isStarting={isStarting}
            hasOngoingGame={hasOngoingGame}
            ongoingLevelNumber={ongoingLevelNumber}
            onStartClick={handleStartClick}
            onContinueClick={onContinue ? handleContinueClick : undefined}
          />
        </motion.footer>
      </div>
    </main>
  );
};

export default GameStartupScreen;


