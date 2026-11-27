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
      {/* Clean Top Bar */}
      <header className="shrink-0 w-full border-b border-white/10 bg-game-backdrop">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between px-4 md:px-8 py-3">
          <h1 className="text-ios-headline font-semibold text-game-text leading-tight">
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
        </div>
      </header>

      {/* Scrollable Workspace: Flat Darkroom Layout (Zero Nested Cards) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-5 lg:grid lg:grid-cols-12 lg:gap-10 lg:items-start">
          {/* Primary Column: Husband Switcher + Levels (Immediately visible above the fold) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {activeHusband && (
              <section
                aria-label="Chọn hồ sơ chồng"
                className="flex flex-col gap-3 pb-5 border-b border-white/10"
              >
                <div
                  data-swipe-surface="true"
                  data-husband-id={activeHusband.husbandId}
                  style={{ touchAction: 'pan-y' }}
                  onPointerDown={handlePointerDown}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerCancel}
                  className="relative w-full overflow-hidden select-none"
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
                      className="flex items-center gap-4"
                    >
                      <img
                        src={activeHusband.portraitUrl}
                        alt={activeHusband.displayName}
                        draggable={false}
                        className={`h-20 w-20 sm:h-24 sm:w-24 shrink-0 rounded-xl object-cover object-top border border-white/10 bg-game-backdrop ${
                          isComingSoon ? 'grayscale opacity-60' : ''
                        }`}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-ios-caption-1 text-game-text-secondary">
                          <span data-case-folder-tab="true">
                            {(activeHusband.caseCode ?? 'Hồ sơ #01').replace(/^HỒ SƠ/i, 'Hồ sơ')}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span
                            data-case-status-stamp="true"
                            data-coming-soon-stamp={
                              isComingSoon ? 'true' : undefined
                            }
                            className={
                              isComingSoon
                                ? 'text-game-text-muted'
                                : 'text-game-crimson font-medium'
                            }
                          >
                            {isComingSoon ? 'Sắp ra mắt' : 'Đang theo dõi'}
                          </span>
                        </div>

                        <h2 className="mt-1 text-ios-title-3 font-semibold leading-snug text-game-text truncate">
                          {activeHusband.displayName}
                        </h2>

                        <p className="mt-0.5 text-ios-footnote text-game-text-secondary tabular-nums leading-snug">
                          {activeHusband.age} tuổi · {activeHusband.occupation}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Compact Carousel Controls */}
                <div className="flex items-center justify-between gap-2">
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
            )}

            {/* Primary Action: Level List */}
            <main
              aria-label="Danh sách màn chơi"
              className="flex flex-col gap-3"
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
                <div className="py-8 text-center">
                  <IoLockClosedOutline
                    aria-hidden="true"
                    className="w-6 h-6 mx-auto text-game-text-muted mb-2"
                  />
                  <p className="text-ios-subheadline font-medium text-game-text">
                    Sắp ra mắt
                  </p>
                </div>
              ) : filteredLevels.length === 0 ? (
                <div className="py-8 text-center">
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
                            : { opacity: 0, y: 8 }
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
                                duration: shouldReduceMotion ? 0.1 : 0.2,
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
                        className={`touch-target-min w-full text-left rounded-xl px-4 py-3.5 border border-l-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70 focus-visible:ring-offset-2 focus-visible:ring-offset-game-canvas ${
                          isUnlocked
                            ? 'bg-game-dossier border-white/10 border-l-game-crimson hover:bg-game-elevated active:bg-game-elevated'
                            : 'bg-game-dossier/45 border-white/10 border-l-game-text-muted/40 opacity-75'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3
                              className={`text-ios-subheadline font-semibold leading-snug truncate tabular-nums ${
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
                                    className="inline-block px-2 py-0.5 rounded-md bg-game-sticky text-game-ink text-ios-caption-1 font-medium"
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

          {/* Secondary Column: Quiet Reference Notes (Flat Hairline Sections, Zero Boxes) */}
          {activeHusband && (traits.length > 0 || wife || activeHusband.wifeAnchor) && (
            <aside className="lg:col-span-5 mt-6 pt-6 border-t border-white/10 lg:mt-0 lg:pt-0 lg:border-t-0 lg:border-l lg:border-white/10 lg:pl-8 flex flex-col gap-6">
              {traits.length > 0 && (
                <section data-husband-persona="true">
                  <h3 className="text-ios-caption-1 font-medium text-game-text-secondary">
                    Hồ sơ tính cách
                  </h3>
                  <ul className="mt-2.5 space-y-2">
                    {traits.map((trait) => (
                      <li
                        key={trait}
                        className="flex items-start gap-2.5 text-ios-footnote leading-relaxed text-game-text/90"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1 w-1 shrink-0 rounded-full bg-game-text-muted"
                        />
                        <span>{trait}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {wife ? (
                <section
                  aria-label="Hồ sơ người vợ"
                  data-wife-profile="true"
                  className="pt-5 border-t border-white/10"
                >
                  <h3 className="text-ios-caption-1 font-medium text-game-text-secondary">
                    Hồ sơ người vợ
                  </h3>
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={wife.portraitUrl}
                      alt={wife.displayName}
                      draggable={false}
                      className="h-12 w-12 rounded-xl object-cover object-top border border-white/10 shrink-0 bg-game-backdrop"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-ios-footnote text-game-text truncate">
                        {wife.displayName}
                      </p>
                      <p className="text-ios-caption-1 text-game-text-secondary tabular-nums truncate">
                        {wife.age} tuổi · {wife.occupation}
                      </p>
                    </div>
                  </div>
                  {wife.anchors.length > 0 && (
                    <ul
                      data-wife-anchors="true"
                      className="mt-3 space-y-1.5"
                    >
                      {wife.anchors.map((anchor) => (
                        <li
                          key={anchor}
                          className="flex items-start gap-2.5 text-ios-footnote leading-relaxed text-game-text/85"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-2 h-1 w-1 shrink-0 rounded-full bg-game-text-muted"
                          />
                          <span>{anchor}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
              ) : activeHusband.wifeAnchor ? (
                <section
                  data-wife-anchor="true"
                  className="pt-5 border-t border-white/10 text-ios-footnote leading-relaxed text-game-text-secondary"
                >
                  {activeHusband.wifeAnchor}
                </section>
              ) : null}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
