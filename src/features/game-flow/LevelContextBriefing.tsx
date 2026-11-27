import React, { useEffect, useReducer } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  IoChevronBackOutline,
  IoChevronForwardOutline,
  IoPhonePortraitOutline,
} from 'react-icons/io5';
import type { CaseBriefingData } from '../../shared/contracts/game-flow';
import startupHeroUrl from './assets/startup-hero.jpg';

export interface LevelContextBriefingProps {
  briefing: CaseBriefingData;
  mode: 'entry' | 'recall';
  onBack?: () => void;
  onStartInvestigation?: () => void;
  onClose?: () => void;
}

export interface BriefingFlowState {
  phase: 'intro' | 'briefing';
  beatIndex: number;
}

export type BriefingFlowAction =
  | { type: 'advance'; totalBeats: number }
  | { type: 'prev' }
  | { type: 'skip' }
  | { type: 'reset'; mode: 'entry' | 'recall'; totalBeats: number };

export function createInitialBriefingState(
  mode: 'entry' | 'recall',
  totalBeats: number,
): BriefingFlowState {
  if (mode === 'entry' && totalBeats > 0) {
    return { phase: 'intro', beatIndex: 0 };
  }
  return { phase: 'briefing', beatIndex: 0 };
}

export function reduceBriefingFlowState(
  state: BriefingFlowState,
  action: BriefingFlowAction,
): BriefingFlowState {
  switch (action.type) {
    case 'reset':
      return createInitialBriefingState(action.mode, action.totalBeats);
    case 'skip':
      return { phase: 'briefing', beatIndex: state.beatIndex };
    case 'prev': {
      if (state.phase !== 'intro') return state;
      return { phase: 'intro', beatIndex: Math.max(0, state.beatIndex - 1) };
    }
    case 'advance': {
      if (state.phase !== 'intro') return state;
      const nextIndex = state.beatIndex + 1;
      if (nextIndex >= action.totalBeats) {
        return { phase: 'briefing', beatIndex: state.beatIndex };
      }
      return { phase: 'intro', beatIndex: nextIndex };
    }
    default:
      return state;
  }
}

export interface LevelContextBriefingSurfaceProps extends LevelContextBriefingProps {
  flowState: BriefingFlowState;
  onAdvanceBeat: () => void;
  onPrevBeat?: () => void;
  onSkipIntro: () => void;
  prefersReducedMotion?: boolean;
}

const EASE_OUT_CINEMATIC = [0.22, 1, 0.36, 1] as const;
const SNAP_SPRING = { type: 'spring' as const, stiffness: 400, damping: 40 };

export const LevelContextBriefingSurface: React.FC<LevelContextBriefingSurfaceProps> = ({
  briefing,
  mode,
  flowState,
  onBack,
  onStartInvestigation,
  onClose,
  onAdvanceBeat,
  onPrevBeat,
  onSkipIntro,
  prefersReducedMotion = false,
}) => {
  const totalBeats = briefing.introBeats.length;
  const tapFeedback = prefersReducedMotion ? undefined : { scale: 0.97 };
  const husbandDisplayName = briefing.husbandFullName ?? briefing.husbandName;
  const personaTraits = briefing.personaTraits?.slice(0, 3) ?? [];
  const wifeProfile = briefing.wifeProfile;

  const briefingSheet = (
    <div className="mx-auto w-full max-w-4xl">
      {/* Manila Folder Tab */}
      <div className="flex items-end justify-between pl-4 pr-2">
        <div
          aria-hidden="true"
          className="inline-flex items-center gap-2 rounded-t-xl border border-b-0 border-game-paper-border bg-game-paper px-4 py-1.5 text-xs font-semibold tracking-wide text-game-ink-secondary shadow-sm"
        >
          <span>MÀN {briefing.levelNumber}</span>
          <span className="text-game-paper-border">·</span>
          <span className="truncate max-w-[14rem] sm:max-w-xs">{briefing.levelTitle}</span>
        </div>
      </div>

      {/* Aged Paper Casefile */}
      <motion.article
        data-briefing-sheet="true"
        initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={prefersReducedMotion ? { duration: 0 } : SNAP_SPRING}
        className="relative overflow-hidden rounded-2xl rounded-tl-none border border-game-paper-border bg-game-paper p-5 pl-6 text-game-ink shadow-2xl md:p-7 md:pl-8"
      >
        {/* Crimson vertical dossier spine */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1.5 bg-game-crimson"
        />

        {/* Top Casefile Header Bar with Red Stamp */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-game-paper-border/80 pb-3.5">
          <div className="min-w-0">
            <p className="text-ios-caption-1 font-semibold uppercase tracking-wider text-game-ink-secondary">
              Hồ sơ điều tra
            </p>
            <h2 className="mt-0.5 font-handwriting text-ios-title-2 text-game-ink">
              {husbandDisplayName}
            </h2>
          </div>

          <span
            data-briefing-stamp="true"
            className="inline-flex shrink-0 -rotate-2 items-center rounded border-2 border-game-crimson/85 px-2.5 py-1 text-ios-caption-1 font-bold uppercase tracking-wider text-game-crimson-deep"
          >
            HỒ SƠ MÀN {briefing.levelNumber}
          </span>
        </div>

        {/* Two-column Desktop / Stacked Mobile Casefile Body */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-7">
          {/* Left Column: Large Husband Portrait + Persona Traits + Wife Profile Mini-Card */}
          <div className="flex flex-col gap-4 md:col-span-5">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start md:flex-col md:items-center">
              <div className="relative shrink-0 pt-2">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-0.5 left-1/2 z-10 h-4 w-16 -translate-x-1/2 -rotate-2 rounded-sm bg-game-tape/90 shadow-sm"
                />
                <div className="-rotate-1 rounded-sm border border-game-paper-border bg-game-film-frame p-2 pb-3 shadow-md">
                  <img
                    src={briefing.husbandPortraitUrl}
                    alt={husbandDisplayName}
                    className="h-52 w-40 rounded-sm bg-game-backdrop object-cover object-top md:h-60 md:w-48"
                  />
                </div>
              </div>

              <div className="w-full min-w-0 text-center sm:pt-2 sm:text-left md:pt-0 md:text-center">
                {typeof briefing.husbandAge === 'number' && (
                  <p className="text-ios-footnote font-semibold tabular-nums text-game-crimson-deep">
                    {briefing.husbandAge} tuổi
                  </p>
                )}
                <p className="mt-1 text-ios-footnote font-medium leading-relaxed text-game-ink-secondary">
                  {briefing.husbandOccupation}
                </p>
              </div>
            </div>

            {/* Persona Traits */}
            {personaTraits.length > 0 && (
              <section
                data-briefing-persona="true"
                className="border-t border-game-paper-border/80 pt-3.5"
              >
                <p className="text-ios-caption-1 font-semibold uppercase tracking-wide text-game-ink-secondary">
                  Hồ sơ nhân vật
                </p>
                <ul className="mt-2 space-y-1.5">
                  {personaTraits.map((trait) => (
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
              </section>
            )}

            {/* Separate Wife Profile Mini-Card */}
            {wifeProfile ? (
              <section
                data-briefing-wife-profile="true"
                className="rounded-xl border border-game-paper-border/80 bg-game-paper-slip p-3.5 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={wifeProfile.portraitUrl}
                    alt={wifeProfile.displayName}
                    className="h-12 w-12 shrink-0 rounded-lg border border-game-paper-border bg-game-backdrop object-cover object-top"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-ios-caption-2 font-semibold uppercase tracking-wide text-game-ink-secondary">
                      Hồ sơ người vợ
                    </p>
                    <p className="truncate text-ios-footnote font-semibold text-game-ink">
                      {wifeProfile.displayName} · {wifeProfile.age} tuổi
                    </p>
                    <p className="truncate text-ios-caption-1 text-game-ink-secondary">
                      {wifeProfile.occupation}
                    </p>
                  </div>
                </div>
                {wifeProfile.anchors.length > 0 && (
                  <ul
                    data-briefing-wife-anchor="true"
                    className="mt-2.5 flex flex-wrap gap-1.5 border-t border-game-paper-border/60 pt-2.5"
                  >
                    {wifeProfile.anchors.map((anchor) => (
                      <li
                        key={anchor}
                        className="rounded-md border border-game-paper-border/70 bg-game-film-frame px-2 py-0.5 text-ios-caption-1 text-game-ink-secondary"
                      >
                        {anchor}
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : briefing.wifeAnchor ? (
              <section
                data-briefing-wife-anchor="true"
                className="rounded-xl border border-game-paper-border/80 bg-game-paper-slip p-3.5 text-ios-footnote leading-snug text-game-ink-secondary shadow-sm"
              >
                <p className="mb-1 text-ios-caption-2 font-semibold uppercase tracking-wide text-game-ink-secondary">
                  Hồ sơ người vợ
                </p>
                <p>{briefing.wifeAnchor}</p>
              </section>
            ) : null}
          </div>

          {/* Right Column: Stated Alibi + Suspicion Hook + Crisp Editorial CTA */}
          <div className="flex flex-col justify-between gap-4 md:col-span-7">
            <div className="space-y-4">
              {/* Stated Alibi */}
              <section className="rounded-xl border border-game-paper-border/75 bg-game-film-frame p-4 md:p-5">
                <p className="text-ios-caption-1 font-semibold uppercase tracking-wide text-game-ink-secondary">
                  Lời khai tối nay
                </p>
                <p className="mt-2 text-ios-subheadline font-normal leading-relaxed text-game-ink md:text-ios-callout">
                  &ldquo;{briefing.statedAlibi}&rdquo;
                </p>
              </section>

              {/* Wife's Suspicion Hook */}
              <section className="rounded-xl border border-game-paper-border/75 bg-game-film-frame p-4 md:p-5">
                <div className="border-l-2 border-game-crimson pl-3.5">
                  <p className="text-ios-caption-1 font-semibold uppercase tracking-wide text-game-crimson-deep">
                    Nghi vấn
                  </p>
                  <p className="mt-2 text-ios-subheadline font-normal leading-relaxed text-game-ink md:text-ios-callout">
                    {briefing.suspicionHook}
                  </p>
                </div>
              </section>
            </div>

            {/* Crisp Editorial CTA */}
            <div className="pt-2">
              {mode === 'recall' ? (
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileTap={tapFeedback}
                  transition={{ duration: 0.12 }}
                  className="touch-target-min flex min-h-[48px] w-full items-center justify-center rounded-xl bg-game-crimson px-5 py-3 text-ios-subheadline font-semibold text-game-text shadow-md transition-colors hover:bg-game-crimson-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-ink"
                >
                  Đóng
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={onStartInvestigation}
                  whileTap={tapFeedback}
                  transition={{ duration: 0.12 }}
                  className="touch-target-min flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-game-crimson px-5 py-3 text-ios-subheadline font-semibold text-game-text shadow-md transition-colors hover:bg-game-crimson-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-ink"
                >
                  <IoPhonePortraitOutline className="h-5 w-5 shrink-0" aria-hidden="true" />
                  <span>Mở điện thoại</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );

  // Recall mode: read-only modal overlay
  if (mode === 'recall') {
    return (
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-briefing-recall-title"
        data-briefing-phase="recall"
        initial={prefersReducedMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={prefersReducedMotion ? undefined : { opacity: 0 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-game-backdrop/85 p-4 backdrop-blur-sm md:p-6"
      >
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.2, ease: EASE_OUT_CINEMATIC }}
          className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-game-canvas text-game-text shadow-2xl"
        >
          <header className="shrink-0 border-b border-white/10 bg-game-backdrop px-5 py-3">
            <h1
              id="case-briefing-recall-title"
              className="truncate text-ios-subheadline font-semibold text-game-text"
            >
              {briefing.levelTitle}
            </h1>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">{briefingSheet}</div>
        </motion.div>
      </motion.div>
    );
  }

  const isIntroPhase = flowState.phase === 'intro' && totalBeats > 0;
  const safeIndex = Math.min(flowState.beatIndex, Math.max(totalBeats - 1, 0));
  const currentBeat = isIntroPhase ? briefing.introBeats[safeIndex] : null;
  const isFirstBeat = safeIndex === 0;
  const isLastBeat = safeIndex === totalBeats - 1;

  return (
    <AnimatePresence mode="wait">
      {isIntroPhase && currentBeat ? (
        <motion.section
          key="intro"
          data-briefing-phase="intro"
          aria-label={`Mở đầu màn ${briefing.levelNumber}`}
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' }}
          className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-game-backdrop text-game-text"
        >
          {/* Full-bleed atmospheric bedroom backdrop with radial spotlight vignette */}
          <img
            src={startupHeroUrl}
            alt=""
            aria-hidden="true"
            data-intro-backdrop="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-center opacity-35 blur-[2px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_38%,rgba(251,191,36,0.12)_0%,rgba(8,11,15,0.68)_54%,rgba(8,11,15,0.96)_100%)]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-game-backdrop/75 via-transparent to-game-backdrop/95"
          />

          {/* Quiet midnight top navigation */}
          <header className="relative z-10 shrink-0 px-4 py-2 md:px-6 md:py-3">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                aria-label="Chọn màn"
                className="touch-target-min inline-flex items-center justify-center rounded-lg text-game-text-secondary transition-colors hover:text-game-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson"
              >
                <IoChevronBackOutline className="h-5 w-5 shrink-0" aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={onSkipIntro}
                className="touch-target-min inline-flex items-center justify-center rounded-lg px-3 text-ios-footnote font-medium text-game-text-secondary transition-colors hover:text-game-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson"
              >
                Bỏ qua
              </button>
            </div>
          </header>

          {/* Full-viewport narrative stage: Commanding portrait + Dialogue panel */}
          <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center justify-between px-4 pb-5 pt-1 md:px-6 md:pb-8">
            {/* Upper-middle 55-62% Husband Portrait Center Stage */}
            <div className="relative flex min-h-0 w-full flex-1 flex-col items-center justify-center">
              {/* Subtle warm rim spotlight behind portrait */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute h-80 w-80 rounded-full bg-game-amber/15 blur-3xl md:h-96 md:w-96"
              />

              {/* Spotlighted Comic-Noir Character Frame */}
              <div
                data-intro-portrait-stage="true"
                className="relative h-80 w-64 max-h-[58dvh] overflow-hidden rounded-2xl border border-game-amber/30 bg-game-dossier shadow-[0_24px_64px_rgba(0,0,0,0.75),0_0_40px_rgba(251,191,36,0.12)] sm:h-96 sm:w-72 md:h-[420px] md:w-80"
              >
                <img
                  src={briefing.husbandPortraitUrl}
                  alt={husbandDisplayName}
                  className="h-full w-full object-cover object-top"
                />

                {/* Subtle warm rim light along top edge */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-game-amber/60 to-transparent"
                />

                {/* Crisp bottom gradient fade + Character Nameplate */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-game-backdrop via-game-backdrop/80 to-transparent px-4 pb-3.5 pt-16 text-center">
                  <p className="text-ios-footnote font-semibold leading-snug text-game-text sm:text-ios-subheadline">
                    <span>{husbandDisplayName}</span>
                    <span className="mx-1.5 text-game-amber">·</span>
                    <span className="font-normal text-game-text-secondary">
                      {briefing.husbandOccupation}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Darkroom Dialogue Card Underneath */}
            <div
              data-intro-dialogue-card="true"
              className="mt-4 w-full shrink-0 rounded-2xl border border-white/10 bg-game-dossier/95 p-4 text-left shadow-2xl backdrop-blur-md md:p-6"
            >
              <div className="border-l-2 border-game-crimson pl-3.5 md:pl-4">
                {/* Top row: Speaker name + beat progress dots */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-ios-footnote font-semibold text-game-crimson md:text-ios-subheadline">
                    {currentBeat.speaker}
                  </span>

                  <div
                    role="group"
                    aria-label={`Đoạn ${safeIndex + 1} trên ${totalBeats}`}
                    data-beat-progress={`${safeIndex + 1}/${totalBeats}`}
                    className="flex items-center gap-1.5"
                  >
                    {briefing.introBeats.map((beat, index) => {
                      const isActive = index === safeIndex;
                      const isPast = index < safeIndex;
                      return (
                        <span
                          key={beat.beatId}
                          aria-hidden="true"
                          data-beat-indicator={isActive ? 'active' : isPast ? 'past' : 'upcoming'}
                          className={
                            isActive
                              ? 'h-1.5 w-1.5 rounded-full bg-game-crimson'
                              : isPast
                                ? 'h-0.5 w-3 rounded-full bg-game-text-secondary/60'
                                : 'h-0.5 w-3 rounded-full bg-white/20'
                          }
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Middle: Crisp dialogue text with AnimatePresence crossfade */}
                <div className="mt-2.5 min-h-[4.5rem] md:min-h-[5rem]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentBeat.beatId}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.22,
                        ease: EASE_OUT_CINEMATIC,
                      }}
                      className="text-ios-body font-normal leading-relaxed text-game-text md:text-ios-title-3"
                    >
                      {currentBeat.line}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Bottom control bar inside dialogue card */}
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
                <motion.button
                  type="button"
                  data-intro-prev-button="true"
                  disabled={isFirstBeat}
                  onClick={(e) => {
                    e?.stopPropagation();
                    if (!isFirstBeat) {
                      onPrevBeat?.();
                    }
                  }}
                  whileTap={isFirstBeat ? undefined : tapFeedback}
                  transition={{ duration: 0.12 }}
                  className={
                    isFirstBeat
                      ? 'touch-target-min inline-flex cursor-not-allowed items-center justify-center gap-1 rounded-xl px-3.5 text-ios-footnote font-medium text-game-text-muted opacity-40'
                      : 'touch-target-min inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-game-elevated/70 px-3.5 text-ios-footnote font-medium text-game-text-secondary transition-colors hover:border-white/20 hover:text-game-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson'
                  }
                >
                  <IoChevronBackOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Trước</span>
                </motion.button>

                <motion.button
                  type="button"
                  data-intro-advance-card="true"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onAdvanceBeat();
                  }}
                  whileTap={tapFeedback}
                  transition={{ duration: 0.12 }}
                  className="touch-target-min inline-flex items-center justify-center gap-1.5 rounded-xl bg-game-crimson px-4 text-ios-footnote font-semibold text-game-text shadow-md transition-colors hover:bg-game-crimson-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-text"
                >
                  <span>{isLastBeat ? 'Xem hồ sơ' : 'Tiếp'}</span>
                  <IoChevronForwardOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
                </motion.button>
              </div>
            </div>
          </div>
        </motion.section>
      ) : (
        <motion.section
          key="briefing"
          data-briefing-phase="briefing"
          aria-labelledby="case-briefing-entry-title"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.18, ease: 'easeOut' }}
          className="flex h-[100dvh] w-full flex-col overflow-hidden bg-game-canvas text-game-text"
        >
          <header className="shrink-0 border-b border-white/10 bg-game-backdrop px-4 py-2 md:px-6">
            <div className="mx-auto flex w-full max-w-4xl items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                aria-label="Chọn màn"
                className="touch-target-min inline-flex items-center justify-center rounded-lg text-game-text-secondary transition-colors hover:text-game-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson"
              >
                <IoChevronBackOutline className="h-5 w-5 shrink-0" aria-hidden="true" />
              </button>

              <h1
                id="case-briefing-entry-title"
                className="truncate px-2 text-ios-subheadline font-medium text-game-text"
              >
                {briefing.levelTitle}
              </h1>

              <span className="w-11 shrink-0" aria-hidden="true" />
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-5 md:justify-center md:px-6 md:py-8">
            {briefingSheet}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
};

export const LevelContextBriefing: React.FC<LevelContextBriefingProps> = ({
  briefing,
  mode,
  onBack,
  onStartInvestigation,
  onClose,
}) => {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const totalBeats = briefing.introBeats.length;
  const [flowState, dispatch] = useReducer(
    reduceBriefingFlowState,
    { mode, totalBeats },
    ({ mode: initialMode, totalBeats: initialTotalBeats }) =>
      createInitialBriefingState(initialMode, initialTotalBeats),
  );

  useEffect(() => {
    dispatch({ type: 'reset', mode, totalBeats });
  }, [briefing.caseId, mode, totalBeats]);

  useEffect(() => {
    if (mode !== 'recall' || !onClose) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, onClose]);

  return (
    <LevelContextBriefingSurface
      briefing={briefing}
      mode={mode}
      flowState={flowState}
      prefersReducedMotion={prefersReducedMotion}
      onBack={onBack}
      onStartInvestigation={onStartInvestigation}
      onClose={onClose}
      onAdvanceBeat={() => dispatch({ type: 'advance', totalBeats })}
      onPrevBeat={() => dispatch({ type: 'prev' })}
      onSkipIntro={() => dispatch({ type: 'skip' })}
    />
  );
};
