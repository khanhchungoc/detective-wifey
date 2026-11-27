import React, { useCallback, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  IoAlertCircleOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoLockClosedOutline,
  IoStar,
  IoStarOutline,
  IoVolumeHighOutline,
  IoVolumeMuteOutline,
} from 'react-icons/io5';
import type {
  HusbandProfile,
  Level0Status,
  LevelCardItem,
} from '../../shared/contracts/game-flow';

export interface LevelSelectorHubProps {
  husbands: HusbandProfile[];
  levels: LevelCardItem[];
  initialHusbandId?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onSelectLevel: (level: LevelCardItem) => void;
}

export const SWIPE_THRESHOLD_PX = 44;
export const SELECT_DEBOUNCE_MS = 400;
export const LOCKED_LEVEL_FEEDBACK =
  'Bạn cần vượt qua màn chơi trước để mở khóa màn này';

const SNAP_SPRING = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 40,
};

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function formatLevel0StatusLabel(status?: Level0Status): string {
  switch (status) {
    case 'completed':
      return 'Đã hoàn thành';
    case 'skipped':
      return 'Đã bỏ qua';
    case 'not_started':
    default:
      return 'Chưa học';
  }
}

export function resolveInitialHusbandIndex(
  husbands: HusbandProfile[],
  initialHusbandId?: string,
): number {
  if (husbands.length === 0) return 0;
  if (!initialHusbandId) return 0;
  const idx = husbands.findIndex((h) => h.husbandId === initialHusbandId);
  return idx >= 0 ? idx : 0;
}

export function stepCarouselIndex(
  currentIndex: number,
  delta: -1 | 1,
  total: number,
): number {
  if (total <= 1) return 0;
  return (currentIndex + delta + total) % total;
}

export function resolveHorizontalSwipeDelta(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  thresholdPx: number = SWIPE_THRESHOLD_PX,
): -1 | 0 | 1 {
  const dx = endX - startX;
  const dy = endY - startY;
  if (Math.abs(dx) < thresholdPx) return 0;
  if (Math.abs(dx) <= Math.abs(dy)) return 0;
  return dx < 0 ? 1 : -1;
}

export function evaluateLevelCardClick(
  level: LevelCardItem,
  husbandComingSoon: boolean,
  lastSelectTimestamp: number,
  now: number,
  debounceMs: number = SELECT_DEBOUNCE_MS,
): { action: 'select' | 'locked' | 'ignore'; feedback: string | null } {
  if (husbandComingSoon) {
    return { action: 'ignore', feedback: null };
  }
  if (!level.unlocked) {
    return { action: 'locked', feedback: LOCKED_LEVEL_FEEDBACK };
  }
  if (now - lastSelectTimestamp < debounceMs) {
    return { action: 'ignore', feedback: null };
  }
  return { action: 'select', feedback: null };
}

const dossierFolderVariants = {
  enter: ({ dir, reduced }: { dir: number; reduced: boolean }) =>
    reduced
      ? { opacity: 0 }
      : {
          x: dir * 64,
          rotate: dir * 1.5,
          opacity: 0,
        },
  center: {
    x: 0,
    rotate: 0,
    opacity: 1,
  },
  exit: ({ dir, reduced }: { dir: number; reduced: boolean }) =>
    reduced
      ? { opacity: 0 }
      : {
          x: dir * -64,
          rotate: dir * -1.5,
          opacity: 0,
        },
};

const MetallicPaperclipSvg: React.FC<{ className?: string }> = ({
  className,
}) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 28 56"
    fill="none"
    className={className}
  >
    <path
      d="M19.5 14.5V39C19.5 44.2467 15.2467 48.5 10 48.5C4.75329 48.5 0.5 44.2467 0.5 39V12.5C0.5 6.42487 5.42487 1.5 11.5 1.5C17.5751 1.5 22.5 6.42487 22.5 12.5V37C22.5 40.5899 19.5899 43.5 16 43.5C12.4101 43.5 9.5 40.5899 9.5 37V15.5"
      transform="translate(2.5 2.5)"
      stroke="#475569"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19.5 14.5V39C19.5 44.2467 15.2467 48.5 10 48.5C4.75329 48.5 0.5 44.2467 0.5 39V12.5C0.5 6.42487 5.42487 1.5 11.5 1.5C17.5751 1.5 22.5 6.42487 22.5 12.5V37C22.5 40.5899 19.5899 43.5 16 43.5C12.4101 43.5 9.5 40.5899 9.5 37V15.5"
      transform="translate(2.5 2.5)"
      stroke="#CBD5E1"
      strokeWidth="0.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.8"
    />
  </svg>
);

export const LevelSelectorHub: React.FC<LevelSelectorHubProps> = ({
  husbands,
  levels,
  initialHusbandId,
  isMuted = false,
  onToggleMute,
  onSelectLevel,
}) => {
  const shouldReduceMotion = Boolean(useReducedMotion());

  const [carousel, setCarousel] = useState<{ index: number; direction: -1 | 1 }>(
    () => ({
      index: resolveInitialHusbandIndex(husbands, initialHusbandId),
      direction: 1,
    }),
  );
  const [lockedFeedback, setLockedFeedback] = useState<string | null>(null);
  const [shakingCaseId, setShakingCaseId] = useState<string | null>(null);

  const pointerStartRef = useRef<{
    x: number;
    y: number;
    pointerId: number;
  } | null>(null);
  const lastSelectAtRef = useRef<number>(-SELECT_DEBOUNCE_MS);

  const safeIndex =
    husbands.length > 0 ? Math.min(carousel.index, husbands.length - 1) : 0;
  const activeHusband = husbands[safeIndex] ?? null;
  const wife = activeHusband?.wifeProfile;

  const filteredLevels = useMemo(() => {
    if (!activeHusband) return [];
    return levels
      .filter((lvl) => lvl.husbandId === activeHusband.husbandId)
      .sort((a, b) => a.levelNumber - b.levelNumber);
  }, [levels, activeHusband]);

  const navigateCarousel = useCallback(
    (delta: -1 | 1) => {
      if (husbands.length <= 1) return;
      setCarousel((prev) => ({
        index: stepCarouselIndex(prev.index, delta, husbands.length),
        direction: delta,
      }));
      setLockedFeedback(null);
      setShakingCaseId(null);
    },
    [husbands.length],
  );

  const handleSelectDot = useCallback((targetIndex: number) => {
    setCarousel((prev) => {
      if (prev.index === targetIndex) return prev;
      return {
        index: targetIndex,
        direction: targetIndex > prev.index ? 1 : -1,
      };
    });
    setLockedFeedback(null);
    setShakingCaseId(null);
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (husbands.length <= 1) return;
      pointerStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        pointerId: e.pointerId,
      };
    },
    [husbands.length],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const start = pointerStartRef.current;
      pointerStartRef.current = null;
      if (!start || start.pointerId !== e.pointerId) return;
      const delta = resolveHorizontalSwipeDelta(
        start.x,
        start.y,
        e.clientX,
        e.clientY,
      );
      if (delta !== 0) {
        navigateCarousel(delta);
      }
    },
    [navigateCarousel],
  );

  const handlePointerCancel = useCallback(() => {
    pointerStartRef.current = null;
  }, []);

  const handleLevelClick = useCallback(
    (level: LevelCardItem) => {
      const now = Date.now();
      const result = evaluateLevelCardClick(
        level,
        Boolean(activeHusband?.comingSoon),
        lastSelectAtRef.current,
        now,
      );
      if (result.action === 'locked') {
        setLockedFeedback(result.feedback);
        if (!shouldReduceMotion) {
          setShakingCaseId(level.caseId);
        }
        return;
      }
      if (result.action === 'select') {
        lastSelectAtRef.current = now;
        setLockedFeedback(null);
        setShakingCaseId(null);
        onSelectLevel(level);
      }
    },
    [activeHusband?.comingSoon, onSelectLevel, shouldReduceMotion],
  );

  const canCycle = husbands.length > 1;
  const isComingSoon = Boolean(activeHusband?.comingSoon);
  const motionCustom = {
    dir: carousel.direction,
    reduced: shouldReduceMotion,
  };

  const traits = activeHusband?.personaTraits ?? [];

  return (
    <div
      className="w-full h-[100dvh] bg-game-canvas text-game-text font-sans flex flex-col overflow-hidden"
      data-screen="level-selector-hub"
    >
      {/* Minimal Header */}
      <header className="shrink-0 w-full max-w-5xl mx-auto flex items-center justify-between px-4 md:px-8 pt-4 pb-2.5">
        <h1 className="text-ios-title-3 font-semibold text-game-text leading-tight">
          Chọn màn
        </h1>

        {onToggleMute && (
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
            aria-pressed={isMuted}
            className="touch-target-min shrink-0 inline-flex items-center justify-center rounded-xl bg-game-dossier text-game-text-secondary border border-white/10 hover:bg-game-elevated hover:text-game-text active:scale-95 transition-[transform,color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
          >
            {isMuted ? (
              <IoVolumeMuteOutline className="w-5 h-5" />
            ) : (
              <IoVolumeHighOutline className="w-5 h-5 text-game-text" />
            )}
          </button>
        )}
      </header>

      {/* Responsive Workspace: Desktop 12-Col Split, Mobile Stacked Scroll */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8 pt-2 pb-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:items-start">
          {/* Left 7 Columns: Open Detective Case File Folder + Separate Wife Profile */}
          {activeHusband && (
            <div className="lg:col-span-7 flex flex-col gap-4">
              <section
                aria-label="Chọn hồ sơ chồng"
                className="flex flex-col"
              >
                <div
                  data-swipe-surface="true"
                  data-husband-id={activeHusband.husbandId}
                  style={{ touchAction: 'pan-y' }}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  className="relative w-full overflow-hidden select-none pt-1 pb-1"
                >
                  <AnimatePresence
                    mode="popLayout"
                    initial={false}
                    custom={motionCustom}
                  >
                    <motion.div
                      key={activeHusband.husbandId}
                      custom={motionCustom}
                      variants={dossierFolderVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={
                        shouldReduceMotion ? { duration: 0.12 } : SNAP_SPRING
                      }
                      className="relative w-full"
                    >
                      {/* Folder Top Index Tab */}
                      <div className="flex items-end">
                        <div
                          data-case-folder-tab="true"
                          className="relative z-10 -mb-px inline-flex items-center gap-2 rounded-t-xl bg-game-paper border-t border-x border-game-paper-border px-4 py-1.5 text-ios-caption-1 font-semibold tracking-wide text-game-ink shadow-sm"
                        >
                          <span
                            aria-hidden="true"
                            className="h-2 w-2 rounded-full bg-game-crimson"
                          />
                          <span>{activeHusband.caseCode ?? 'HỒ SƠ #01'}</span>
                        </div>
                      </div>

                      {/* Warm Manila Case File Folder Body */}
                      <article
                        data-case-folder="true"
                        className="relative overflow-hidden rounded-b-2xl rounded-tr-2xl bg-game-paper text-game-ink border border-game-paper-border shadow-2xl p-5 pl-6"
                      >
                        {/* Crimson Vertical File Spine */}
                        <div
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-game-crimson"
                        />

                        {/* Tilted Red Ink Rubber Stamp */}
                        <div className="flex justify-end mb-2 sm:mb-0 sm:absolute sm:top-4 sm:right-5 sm:z-10">
                          <span
                            data-case-status-stamp="true"
                            data-coming-soon-stamp={
                              isComingSoon ? 'true' : undefined
                            }
                            className="inline-block border-2 border-game-crimson-deep/75 text-game-crimson-deep rotate-[-6deg] px-2.5 py-0.5 text-ios-caption-2 font-bold tracking-wider uppercase rounded-sm bg-game-paper/80"
                          >
                            {isComingSoon ? 'SẮP RA MẮT' : 'ĐANG THEO DÕI'}
                          </span>
                        </div>

                        {/* Dossier Interior: Bigger Photo on Left + Structured Form Context to the Side */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
                          {/* Bigger Pinned Husband Portrait */}
                          <div className="relative shrink-0 pt-2">
                            {/* Masking Tape */}
                            <div
                              aria-hidden="true"
                              className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 z-10 h-4 w-16 -rotate-2 rounded-sm bg-game-tape/90 shadow-sm"
                            />
                            {/* Metallic Paperclip gripping top-right corner */}
                            <MetallicPaperclipSvg className="pointer-events-none absolute -top-1 -right-2 z-20 w-6 h-12 rotate-12 drop-shadow-sm" />

                            <div className="w-36 h-48 sm:w-44 sm:h-56 -rotate-1 rounded-sm bg-game-film-frame p-2 border border-game-paper-border shadow-md">
                              <img
                                src={activeHusband.portraitUrl}
                                alt={activeHusband.displayName}
                                draggable={false}
                                className={`h-full w-full rounded-sm object-cover object-top bg-game-backdrop ${
                                  isComingSoon ? 'grayscale opacity-60' : ''
                                }`}
                              />
                            </div>
                          </div>

                          {/* Structured Dossier Form Context */}
                          <div className="w-full min-w-0 flex-1 sm:pt-5">
                            {/* Field 1: Đối tượng */}
                            <div className="pb-2.5 border-b border-game-paper-border/80">
                              <p className="text-ios-caption-2 font-semibold uppercase tracking-wider text-game-ink-secondary">
                                Đối tượng
                              </p>
                              <div className="mt-1 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                                <h2 className="font-handwriting text-ios-title-2 font-semibold leading-snug text-game-ink">
                                  {activeHusband.displayName}
                                </h2>
                                <span className="text-ios-footnote font-semibold text-game-crimson-deep tabular-nums">
                                  {activeHusband.age} tuổi
                                </span>
                              </div>
                            </div>

                            {/* Field 2: Nghề nghiệp */}
                            <div className="py-2.5 border-b border-game-paper-border/80">
                              <p className="text-ios-caption-2 font-semibold uppercase tracking-wider text-game-ink-secondary">
                                Nghề nghiệp
                              </p>
                              <p className="mt-0.5 text-ios-footnote font-medium leading-relaxed text-game-ink">
                                {activeHusband.occupation}
                              </p>
                            </div>

                            {/* Field 3: Hồ sơ tính cách */}
                            {traits.length > 0 && (
                              <div
                                data-husband-persona="true"
                                className="pt-2.5"
                              >
                                <p className="text-ios-caption-2 font-semibold uppercase tracking-wider text-game-ink-secondary mb-1.5">
                                  Hồ sơ tính cách
                                </p>
                                <ul className="space-y-1.5">
                                  {traits.map((trait) => (
                                    <li
                                      key={trait}
                                      className="flex items-start gap-2 text-ios-footnote leading-snug text-game-ink"
                                    >
                                      <span
                                        aria-hidden="true"
                                        className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-game-crimson"
                                      />
                                      <span>{trait}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Fallback Wife-Anchor Strip only when full wifeProfile is absent */}
                        {!wife && activeHusband.wifeAnchor && (
                          <div
                            data-wife-anchor="true"
                            className="mt-4 rounded-lg bg-game-paper-slip border border-game-paper-border/70 px-3 py-2 text-ios-caption-1 leading-snug text-game-ink-secondary"
                          >
                            {activeHusband.wifeAnchor}
                          </div>
                        )}
                      </article>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Carousel Controls: Prev + Pagination Dots + Next */}
                <div className="flex items-center justify-between gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => navigateCarousel(-1)}
                    disabled={!canCycle}
                    aria-label="Chồng trước"
                    className="touch-target-min shrink-0 inline-flex items-center justify-center rounded-xl bg-game-dossier text-game-text-secondary border border-white/10 hover:bg-game-elevated hover:text-game-text active:scale-95 transition-[transform,color,background-color] disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
                  >
                    <IoChevronBackOutline className="w-5 h-5" />
                  </button>

                  {husbands.length > 1 ? (
                    <div
                      className="flex items-center justify-center"
                      role="tablist"
                      aria-label="Danh sách chồng"
                    >
                      {husbands.map((husband, idx) => {
                        const isActive = idx === safeIndex;
                        return (
                          <button
                            key={husband.husbandId}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-label={`Hồ sơ ${idx + 1}: ${husband.displayName}`}
                            onClick={() => handleSelectDot(idx)}
                            className="touch-target-min inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70 rounded-lg"
                          >
                            <span
                              aria-hidden="true"
                              className={`block h-1.5 w-6 rounded-full transition-[transform,opacity,background-color] duration-200 ${
                                isActive
                                  ? 'bg-game-crimson scale-x-100 opacity-100'
                                  : 'bg-game-text-muted scale-x-50 opacity-50'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <span aria-hidden="true" />
                  )}

                  <button
                    type="button"
                    onClick={() => navigateCarousel(1)}
                    disabled={!canCycle}
                    aria-label="Chồng tiếp theo"
                    className="touch-target-min shrink-0 inline-flex items-center justify-center rounded-xl bg-game-dossier text-game-text-secondary border border-white/10 hover:bg-game-elevated hover:text-game-text active:scale-95 transition-[transform,color,background-color] disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
                  >
                    <IoChevronForwardOutline className="w-5 h-5" />
                  </button>
                </div>
              </section>

              {/* Separate Wife Profile Section */}
              <AnimatePresence mode="wait" initial={false}>
                {wife && (
                  <motion.section
                    key={`wife-${activeHusband.husbandId}`}
                    aria-label="Hồ sơ người vợ"
                    data-wife-profile="true"
                    initial={
                      shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }
                    }
                    animate={{ opacity: 1, y: 0 }}
                    exit={
                      shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }
                    }
                    transition={{ duration: 0.2, ease: EASE_OUT_EXPO }}
                    className="bg-game-paper-slip border border-game-paper-border text-game-ink rounded-xl p-4 shadow-lg relative"
                  >
                    {/* Subtle Paperclip Accent */}
                    <MetallicPaperclipSvg className="pointer-events-none absolute -top-2.5 right-4 w-5 h-10 rotate-6 opacity-80" />

                    <div className="flex items-center gap-2 pb-2.5 border-b border-game-paper-border/75">
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 rounded-full bg-game-crimson"
                      />
                      <h2 className="text-ios-caption-2 font-semibold uppercase tracking-wider text-game-ink-secondary">
                        Hồ sơ người vợ
                      </h2>
                    </div>

                    <div className="mt-3 flex items-start gap-4">
                      <img
                        src={wife.portraitUrl}
                        alt={wife.displayName}
                        draggable={false}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg object-cover object-top border-2 border-game-film-frame shadow-sm shrink-0 bg-game-backdrop"
                      />

                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-ios-headline text-game-ink leading-snug">
                          {wife.displayName}
                        </p>
                        <p className="mt-0.5 text-ios-footnote text-game-ink-secondary tabular-nums">
                          {wife.age} tuổi · {wife.occupation}
                        </p>

                        {wife.anchors.length > 0 && (
                          <ul
                            data-wife-anchors="true"
                            className="mt-2.5 pt-2 border-t border-game-paper-border/70 space-y-1"
                          >
                            {wife.anchors.map((anchor) => (
                              <li
                                key={anchor}
                                className="flex items-start gap-2 text-ios-caption-1 leading-snug text-game-ink"
                              >
                                <span
                                  aria-hidden="true"
                                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-game-crimson-deep/80"
                                />
                                <span>{anchor}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Right 5 Columns: Inline Feedback + Compact Casefile Level List */}
          <main
            aria-label="Danh sách màn chơi"
            className="lg:col-span-5 mt-6 lg:mt-8 flex flex-col gap-3"
          >
            {/* Inline Locked-Level Feedback Banner */}
            <AnimatePresence initial={false}>
              {lockedFeedback && (
                <motion.div
                  key="locked-feedback-banner"
                  role="alert"
                  initial={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={
                    shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }
                  }
                  transition={{ duration: 0.18, ease: EASE_OUT_EXPO }}
                  className="px-4 py-2.5 rounded-xl bg-game-crimson/10 border border-game-crimson/40 text-game-text text-ios-caption-1 flex items-center gap-2"
                >
                  <IoAlertCircleOutline
                    aria-hidden="true"
                    className="w-4 h-4 shrink-0 text-game-crimson"
                  />
                  <span>{lockedFeedback}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {isComingSoon ? (
              <div className="rounded-xl bg-game-dossier border border-white/10 p-6 text-center">
                <IoLockClosedOutline
                  aria-hidden="true"
                  className="w-6 h-6 mx-auto text-game-text-muted mb-2"
                />
                <p className="text-ios-subheadline font-medium text-game-text">
                  Sắp ra mắt
                </p>
              </div>
            ) : filteredLevels.length === 0 ? (
              <div className="rounded-xl bg-game-dossier border border-white/10 p-6 text-center">
                <p className="text-ios-subheadline text-game-text-secondary">
                  Chưa có màn chơi nào
                </p>
              </div>
            ) : (
              <div
                key={activeHusband?.husbandId ?? 'levels'}
                className="space-y-2.5"
              >
                {filteredLevels.map((level, idx) => {
                  const isUnlocked = level.unlocked;
                  const isShaking = shakingCaseId === level.caseId;
                  const starCount = Math.max(
                    0,
                    Math.min(3, level.bestStars ?? 0),
                  );
                  const lockHintText =
                    level.lockHint ??
                    `Hoàn thành Màn ${Math.max(1, level.levelNumber - 1)}`;

                  return (
                    <motion.button
                      key={level.caseId}
                      type="button"
                      data-case-id={level.caseId}
                      data-level-unlocked={isUnlocked ? 'true' : 'false'}
                      aria-disabled={!isUnlocked}
                      onClick={() => handleLevelClick(level)}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 0 }
                          : { opacity: 0, y: 10 }
                      }
                      animate={
                        isShaking
                          ? {
                              opacity: 1,
                              y: 0,
                              x: [0, -6, 6, -4, 4, 0],
                            }
                          : {
                              opacity: 1,
                              y: 0,
                              x: 0,
                            }
                      }
                      transition={
                        isShaking
                          ? { duration: 0.32, ease: 'easeInOut' }
                          : {
                              duration: shouldReduceMotion ? 0.1 : 0.22,
                              delay: shouldReduceMotion ? 0 : idx * 0.03,
                              ease: EASE_OUT_EXPO,
                            }
                      }
                      onAnimationComplete={() => {
                        if (isShaking) {
                          setShakingCaseId(null);
                        }
                      }}
                      whileTap={
                        isUnlocked && !shouldReduceMotion
                          ? { scale: 0.98 }
                          : undefined
                      }
                      className={`touch-target-min w-full text-left rounded-xl px-4 py-3 border border-l-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70 focus-visible:ring-offset-2 focus-visible:ring-offset-game-canvas ${
                        isUnlocked
                          ? 'bg-game-dossier border-white/10 border-l-game-crimson hover:bg-game-elevated active:bg-game-elevated'
                          : 'bg-game-dossier/50 border-white/10 border-l-game-text-muted/40 opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`text-ios-footnote font-semibold leading-snug truncate tabular-nums ${
                              isUnlocked
                                ? 'text-game-text'
                                : 'text-game-text-secondary'
                            }`}
                          >
                            Màn {level.levelNumber} · {level.levelTitle}
                          </h3>

                          {level.isPractice && (
                            <div className="mt-1 flex items-center gap-2">
                              {level.recommended && (
                                <span
                                  data-recommended-badge="true"
                                  className="inline-block px-2 py-0.5 rounded-sm bg-game-sticky text-game-ink font-handwriting text-ios-caption-1 font-semibold -rotate-1 shadow-sm"
                                >
                                  Đề xuất
                                </span>
                              )}
                              <span
                                data-level0-status={
                                  level.level0Status ?? 'not_started'
                                }
                                className="text-ios-caption-1 text-game-text-muted"
                              >
                                {formatLevel0StatusLabel(level.level0Status)}
                              </span>
                            </div>
                          )}

                          {!isUnlocked && (
                            <p className="mt-1 text-ios-caption-1 text-game-text-muted tabular-nums">
                              {lockHintText}
                            </p>
                          )}
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          {!isUnlocked ? (
                            <IoLockClosedOutline
                              aria-hidden="true"
                              className="w-4 h-4 text-game-text-muted"
                            />
                          ) : (
                            <>
                              {!level.isPractice && (
                                <div
                                  className="flex items-center gap-0.5"
                                  aria-label={`Đạt ${starCount} trên 3 sao`}
                                >
                                  {[1, 2, 3].map((starIdx) =>
                                    starIdx <= starCount ? (
                                      <IoStar
                                        key={starIdx}
                                        aria-hidden="true"
                                        className="w-4 h-4 text-game-amber"
                                      />
                                    ) : (
                                      <IoStarOutline
                                        key={starIdx}
                                        aria-hidden="true"
                                        className="w-4 h-4 text-game-text-muted/40"
                                      />
                                    ),
                                  )}
                                </div>
                              )}
                              <IoChevronForwardOutline
                                aria-hidden="true"
                                className="w-4 h-4 text-game-text-muted"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};
