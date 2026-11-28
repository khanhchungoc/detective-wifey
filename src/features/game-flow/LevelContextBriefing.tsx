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

  const primaryAction =
    mode === 'recall' ? (
      <motion.button
        type="button"
        onClick={onClose}
        whileTap={tapFeedback}
        transition={{ duration: 0.12 }}
        className="game-btn-primary touch-target-min flex min-h-[48px] w-full items-center justify-center rounded-xl px-5 py-3 text-ios-subheadline font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-paper"
      >
        Đóng
      </motion.button>
    ) : (
      <motion.button
        type="button"
        onClick={onStartInvestigation}
        whileTap={tapFeedback}
        transition={{ duration: 0.12 }}
        className="game-btn-primary touch-target-min flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-ios-subheadline font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-paper"
      >
        <IoPhonePortraitOutline className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
        <span>Mở điện thoại</span>
      </motion.button>
    );

  const briefingContent = (
    <motion.article
      data-briefing-sheet="true"
      initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.22, ease: EASE_OUT_CINEMATIC }}
      className="mx-auto flex w-full max-w-2xl flex-col gap-5"
    >
      {/* Compact subject header (name is already shown on the selector) */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <img
          src={briefing.husbandPortraitUrl}
          alt={husbandDisplayName}
          className="h-12 w-12 shrink-0 rounded-xl border border-white/10 bg-game-backdrop object-cover object-top"
        />
        <div className="min-w-0 flex-1">
          <p className="text-ios-footnote font-medium text-game-text-secondary tabular-nums">
            Màn {briefing.levelNumber} · Hồ sơ điều tra
          </p>
          <h2 className="truncate text-ios-headline font-semibold text-game-text">
            {husbandDisplayName}
          </h2>
          <p className="truncate text-ios-footnote text-game-text-secondary tabular-nums">
            {typeof briefing.husbandAge === 'number'
              ? `${briefing.husbandAge} tuổi · ${briefing.husbandOccupation}`
              : briefing.husbandOccupation}
          </p>
        </div>
      </div>

      <h3
        data-briefing-hook="true"
        className="border-y-2 border-game-crimson/70 py-4 font-sans text-ios-title-1 font-extrabold leading-tight text-game-paper"
      >
        {briefing.hookQuestion}
      </h3>

      <section data-briefing-suspicion="true" className="border-l-2 border-game-crimson pl-4">
        <p className="text-ios-footnote font-semibold text-game-crimson">Nghi vấn</p>
        <p className="mt-1.5 text-ios-callout font-normal leading-relaxed text-game-text">
          {briefing.suspicionHook}
        </p>
      </section>

      <section data-briefing-alibi="true">
        <p className="text-ios-footnote font-semibold text-game-text">Lời khai tối nay</p>
        <p className="mt-1.5 text-ios-callout font-normal leading-relaxed text-game-text">
          &ldquo;{briefing.statedAlibi}&rdquo;
        </p>
      </section>

      {personaTraits.length > 0 && (
        <section data-briefing-persona="true" className="border-t border-white/10 pt-5">
          <p className="text-ios-footnote font-semibold text-game-text">Hồ sơ nhân vật</p>
          <ul className="mt-2.5 space-y-2">
            {personaTraits.map((trait) => (
              <li
                key={trait}
                className="flex items-start gap-2.5 text-ios-footnote leading-relaxed text-game-text/90"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 h-1 w-1 shrink-0 rounded-full bg-game-text-secondary"
                />
                <span>{trait}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {wifeProfile && (
        <section data-briefing-wife-profile="true" className="border-t border-white/10 pt-5">
          <p className="text-ios-footnote font-semibold text-game-text">Hồ sơ người vợ</p>
          <div className="mt-3 flex items-center gap-3">
            <img
              src={wifeProfile.portraitUrl}
              alt={wifeProfile.displayName}
              className="h-11 w-11 shrink-0 rounded-xl border border-white/10 bg-game-backdrop object-cover object-top"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-ios-footnote font-medium text-game-text tabular-nums">
                {wifeProfile.displayName} · {wifeProfile.age} tuổi
              </p>
              <p className="truncate text-ios-footnote text-game-text-secondary">
                {wifeProfile.occupation}
              </p>
            </div>
          </div>
          {wifeProfile.anchors.length > 0 && (
            <ul data-briefing-wife-anchor="true" className="mt-3 space-y-1.5">
              {wifeProfile.anchors.map((anchor) => (
                <li
                  key={anchor}
                  className="flex items-start gap-2.5 text-ios-footnote leading-relaxed text-game-text/90"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-1 w-1 shrink-0 rounded-full bg-game-text-secondary"
                  />
                  <span>{anchor}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </motion.article>
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
          initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={prefersReducedMotion ? undefined : { opacity: 0, y: 8 }}
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

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7 md:py-6">
            {briefingContent}
          </div>

          <footer className="shrink-0 border-t border-white/10 bg-game-backdrop px-5 py-3">
            <div className="mx-auto w-full max-w-sm">{primaryAction}</div>
          </footer>
        </motion.div>
      </motion.div>
    );
  }

  const isIntroPhase = flowState.phase === 'intro' && totalBeats > 0;
  const safeIndex = Math.min(flowState.beatIndex, Math.max(totalBeats - 1, 0));
  const currentBeat = isIntroPhase ? briefing.introBeats[safeIndex] : null;
  const isFirstBeat = safeIndex === 0;
  const isLastBeat = safeIndex === totalBeats - 1;
  const showWife = currentBeat?.speakerRole === 'wife' && Boolean(wifeProfile?.portraitUrl);
  const portraitUrl = showWife && wifeProfile ? wifeProfile.portraitUrl : briefing.husbandPortraitUrl;
  const portraitName = showWife && wifeProfile ? wifeProfile.displayName : husbandDisplayName;
  const portraitCaption = showWife && wifeProfile ? wifeProfile.occupation : briefing.husbandOccupation;

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
          {/* Full-bleed atmospheric bedroom backdrop */}
          <img
            src={startupHeroUrl}
            alt=""
            aria-hidden="true"
            data-intro-backdrop="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-center opacity-35 blur-[2px]"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-game-backdrop/80 via-game-backdrop/45 to-game-backdrop/95"
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

          {/* Portrait follows the speaker; smaller so the dialogue line is the focus */}
          <div className="relative z-10 flex min-h-0 w-full flex-1 flex-col items-center justify-center px-4 py-2">
            <div
              data-intro-portrait-stage="true"
              className="relative h-60 w-48 max-h-[40dvh] overflow-hidden rounded-2xl border border-white/15 bg-game-dossier shadow-2xl sm:h-72 sm:w-56 md:h-80 md:w-64"
            >
              <AnimatePresence initial={false}>
                <motion.img
                  key={portraitUrl}
                  src={portraitUrl}
                  alt={portraitName}
                  data-intro-portrait={currentBeat.speakerRole}
                  initial={prefersReducedMotion ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={prefersReducedMotion ? undefined : { opacity: 0 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3, ease: 'easeOut' }}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                />
              </AnimatePresence>

              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-game-backdrop via-game-backdrop/85 to-transparent px-4 pb-3 pt-12 text-center">
                <p className="text-ios-subheadline font-semibold leading-snug text-game-text">
                  {portraitName}
                </p>
                <p className="mt-0.5 text-ios-caption-1 font-normal text-game-text-secondary">
                  {portraitCaption}
                </p>
              </div>
            </div>
          </div>

          {/* Flat Bottom Dialogue Footer Band (No Nested Floating Card) */}
          <div
            data-intro-dialogue-card="true"
            className="relative z-10 w-full shrink-0 border-t border-white/10 bg-game-backdrop/95 px-4 pt-4 pb-5 md:px-6 md:py-5"
          >
            <div className="mx-auto w-full max-w-4xl">
              <div className="border-l-2 border-game-crimson pl-3.5 md:pl-4">
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

                <div className="mt-2 min-h-[4.25rem] md:min-h-[4.75rem]">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={currentBeat.beatId}
                      initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
                      transition={{
                        duration: prefersReducedMotion ? 0 : 0.2,
                        ease: EASE_OUT_CINEMATIC,
                      }}
                      className="text-ios-body font-normal leading-relaxed text-game-text md:text-ios-title-3"
                    >
                      {currentBeat.line}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
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
                      : 'touch-target-min inline-flex items-center justify-center gap-1 rounded-xl border border-white/10 bg-game-dossier px-3.5 text-ios-footnote font-medium text-game-text-secondary transition-colors hover:border-white/20 hover:text-game-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson'
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
                  className="game-btn-primary touch-target-min inline-flex items-center justify-center gap-1.5 rounded-xl px-5 text-ios-footnote font-semibold text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-text"
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

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-8">
            {briefingContent}
          </div>

          <footer className="shrink-0 border-t border-white/10 bg-game-backdrop px-4 py-3 md:px-6">
            <div className="mx-auto w-full max-w-sm">{primaryAction}</div>
          </footer>
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
