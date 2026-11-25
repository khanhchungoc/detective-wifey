import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  IoScaleOutline,
  IoWarningOutline,
  IoSearchOutline,
  IoStar,
  IoStarOutline,
  IoTrophyOutline,
  IoShareSocialOutline,
  IoLockOpenOutline,
  IoCloseOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';
import type { VerdictType } from '../../../shared/contracts/case-schema';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import '../notebook.css';
import {
  CHOICE_STAGGER_S,
  NARRATIVE_IN,
  NARRATIVE_OUT,
  POP,
  REDUCED_FADE,
  SNAP,
  getTypewriterStepMs,
} from '../confrontationMotion';
import { HusbandCharacterImage, type HusbandMood } from './HusbandCharacterImage';
import type {
  ActiveConfrontationChoice,
  ConfrontationEvaluationResult,
  ScriptedConfrontationState,
} from '../confrontationEngine';

export interface ConfrontationModalProps {
  isOpen: boolean;
  session?: ScriptedConfrontationState | null;
  evaluation?: ConfrontationEvaluationResult | null;
  maxStrikes: number;
  onSelectChoice?: (choiceId: string) => void;
  onContinueInvestigation: () => void;
  onForgiveAndAdvance?: () => void;
  onShareRoastCard?: () => void;
  onClose: () => void;
}

const MOOD_LABELS: Record<HusbandMood, string> = {
  confident: 'Khoanh tay, tự tin',
  smug: 'Nhếch mép, thách thức',
  surprised: 'Hơi giật mình, phân bua',
  nervous: 'Gãi đầu, toát mồ hôi',
  broken: 'Cúi đầu, nhận tội',
};

const VERDICT_STAMP_LABELS: Record<VerdictType, string> = {
  cheating: 'BẮT QUẢ TANG NGOẠI TÌNH',
  sugar_relationship: 'VẠCH TRẦN SUGAR DADDY',
  innocent: 'MINH OAN CHỒNG VÔ TỘI',
};

function getAdvanceLabel(verdict: VerdictType, endingChoiceId: string | null): string {
  if (verdict === 'innocent') return 'Làm lành & Qua màn';
  if (endingChoiceId?.includes('divorce')) return 'Chốt hồ sơ & Qua màn';
  return 'Tha thứ & Qua màn';
}

export const ConfrontationModal: React.FC<ConfrontationModalProps> = ({
  isOpen,
  session,
  evaluation,
  maxStrikes,
  onSelectChoice,
  onContinueInvestigation,
  onForgiveAndAdvance,
  onShareRoastCard,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = Boolean(useReducedMotion());

  const dialogueKey = session
    ? `${session.phase}-${session.beatIndex}-${session.selectedEndingChoiceId ?? 'none'}-${session.husbandLine ?? ''}`
    : 'legacy';
  const activeHusbandLine = session?.husbandLine ?? '';
  const shouldTypewrite =
    isOpen &&
    Boolean(session) &&
    Boolean(activeHusbandLine) &&
    !prefersReducedMotion &&
    typeof window !== 'undefined';

  const [typedState, setTypedState] = useState<{ key: string; count: number }>(() => ({
    key: dialogueKey,
    count: shouldTypewrite ? 0 : activeHusbandLine.length,
  }));

  const husbandChars = Array.from(activeHusbandLine);
  const totalHusbandChars = husbandChars.length;
  const revealedCount = !shouldTypewrite
    ? totalHusbandChars
    : typedState.key === dialogueKey
      ? Math.min(typedState.count, totalHusbandChars)
      : 0;
  const isTyping = shouldTypewrite && revealedCount < totalHusbandChars;
  const isDeckReady = !isTyping;
  const visibleHusbandLine = isTyping
    ? husbandChars.slice(0, revealedCount).join('')
    : activeHusbandLine;

  const completeTypewriter = () => {
    if (!isTyping) return;
    setTypedState({ key: dialogueKey, count: totalHusbandChars });
  };

  useEffect(() => {
    if (!shouldTypewrite) return;
    const stepMs = getTypewriterStepMs(totalHusbandChars);
    const timerId = window.setInterval(() => {
      setTypedState(prev => {
        const current = prev.key === dialogueKey ? prev.count : 0;
        if (current >= totalHusbandChars) {
          window.clearInterval(timerId);
          return prev;
        }
        const nextCount = current + 1;
        if (nextCount >= totalHusbandChars) {
          window.clearInterval(timerId);
        }
        return { key: dialogueKey, count: nextCount };
      });
    }, stepMs);
    return () => window.clearInterval(timerId);
  }, [dialogueKey, totalHusbandChars, shouldTypewrite]);

  const isLockedCaught = session
    ? false
    : Boolean(evaluation?.isMaxStrikesReached);

  const handleBack = () => {
    if (isLockedCaught) return;
    onContinueInvestigation();
    onClose();
  };

  const swipeHandlers = useSwipeBack({
    onBack: handleBack,
    enabled: isOpen && !isLockedCaught,
  });

  useEffect(() => {
    if (!isOpen) return;
    // Focus dialog container rather than choice #1 so options stay in equal rest state until keyboard navigation.
    dialogRef.current?.focus({ preventScroll: true });
  }, [isOpen, session?.phase, session?.beatIndex]);

  useEffect(() => {
    if (!isOpen || !session || !onSelectChoice) return;
    const isInteractivePhase =
      session.phase === 'opening' ||
      session.phase === 'beat' ||
      session.phase === 'ending';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleBack();
        return;
      }
      if (isTyping) {
        if (
          event.key === ' ' ||
          event.key === 'Enter' ||
          (event.key >= '1' && event.key <= '4')
        ) {
          event.preventDefault();
          completeTypewriter();
        }
        return;
      }
      if (!isInteractivePhase) return;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const buttons = Array.from(
          dialogRef.current?.querySelectorAll<HTMLButtonElement>('.confrontation-choice:not([disabled])') ?? [],
        );
        if (!buttons.length) return;
        event.preventDefault();
        const activeIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);
        const nextIndex = event.key === 'ArrowDown'
          ? (activeIndex + 1) % buttons.length
          : (activeIndex - 1 + buttons.length) % buttons.length;
        buttons[nextIndex].focus({ preventScroll: true });
        return;
      }

      if (event.key >= '1' && event.key <= '4') {
        const targetChoice = session.choices[Number(event.key) - 1];
        if (targetChoice) {
          event.preventDefault();
          onSelectChoice(targetChoice.choiceId);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  // =========================================================================
  // SCRIPTED INTERROGATION ROOM & VERTICAL NUMBERED CHOICE LIST
  // =========================================================================
  if (session) {
    const usedStrikes = Math.max(0, maxStrikes - session.newStrikesRemaining);
    const isChoicesActive =
      session.phase === 'opening' ||
      session.phase === 'beat' ||
      session.phase === 'ending';
    const isEndingPhase = session.phase === 'ending';

    const stageTopicLabel =
      session.phase === 'opening'
        ? 'Mở màn thẩm vấn'
        : session.phase === 'failed'
          ? 'Thiếu chứng cứ kết tội'
          : session.phase === 'ending'
            ? 'Phán quyết của vợ'
            : session.phase === 'resolved'
              ? VERDICT_STAMP_LABELS[session.verdict]
              : session.topic;

    const spotlightBackground =
      session.husbandMood === 'broken'
        ? 'radial-gradient(ellipse 78% 76% at 50% 0%, rgba(244,63,94,0.22) 0%, rgba(15,23,42,0.08) 55%, transparent 88%)'
        : session.husbandMood === 'smug'
          ? 'radial-gradient(ellipse 78% 76% at 50% 0%, rgba(250,204,21,0.18) 0%, rgba(15,23,42,0.08) 55%, transparent 88%)'
          : session.husbandMood === 'nervous'
            ? 'radial-gradient(ellipse 78% 76% at 50% 0%, rgba(251,146,60,0.22) 0%, rgba(15,23,42,0.08) 55%, transparent 88%)'
            : 'radial-gradient(ellipse 78% 76% at 50% 0%, rgba(186,230,253,0.20) 0%, rgba(15,23,42,0.08) 55%, transparent 88%)';

    const renderVerticalChoice = (choice: ActiveConfrontationChoice, index: number) => {
      const staggerDelay = prefersReducedMotion ? 0 : Math.min(index, 3) * CHOICE_STAGGER_S;
      const isDivorceEnding = isEndingPhase && choice.slot === 'left';

      const toneClasses = isEndingPhase
        ? isDivorceEnding
          ? 'border-rose-500/45 bg-rose-950/30 text-rose-50'
          : 'border-emerald-500/45 bg-emerald-950/25 text-emerald-50'
        : 'border-white/10 bg-darkroom-choice-surface text-darkroom-text-primary';

      return (
        <motion.button
          key={choice.choiceId}
          type="button"
          data-choice-id={choice.choiceId}
          data-choice-slot={choice.slot}
          disabled={!isDeckReady}
          onClick={() => {
            if (!isDeckReady) return;
            onSelectChoice?.(choice.choiceId);
          }}
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
          animate={
            isDeckReady
              ? {
                  opacity: 1,
                  y: 0,
                  transition: prefersReducedMotion
                    ? REDUCED_FADE
                    : { ...SNAP, delay: staggerDelay },
                }
              : {
                  opacity: 0,
                  y: prefersReducedMotion ? 0 : 8,
                }
          }
          exit={{
            opacity: 0,
            transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT,
          }}
          className={`confrontation-choice group w-full min-h-[48px] px-3 py-2.5 rounded-lg border text-left flex items-start gap-2.5 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-darkroom-bg ${toneClasses}`}
        >
          <span
            aria-hidden="true"
            className="confrontation-keycap mt-0.5 shrink-0 inline-flex items-center justify-center w-[22px] h-[22px] rounded-[4px] border border-white/20 bg-white/[0.06] font-sans text-ios-caption-2 tabular-nums text-darkroom-text-dialogue"
          >
            {index + 1}
          </span>

          <span className="flex-1 min-w-0 font-sans text-ios-subheadline">
            {choice.wifeLine}
          </span>

          {isEndingPhase ? (
            isDivorceEnding ? (
              <IoWarningOutline
                aria-hidden="true"
                className="confrontation-chevron mt-0.5 h-4 w-4 shrink-0 text-rose-300"
              />
            ) : (
              <IoLockOpenOutline
                aria-hidden="true"
                className="confrontation-chevron mt-0.5 h-4 w-4 shrink-0 text-emerald-300"
              />
            )
          ) : (
            <IoChevronForwardOutline
              aria-hidden="true"
              className="confrontation-chevron mt-1 h-3.5 w-3.5 shrink-0 text-darkroom-text-muted"
            />
          )}
        </motion.button>
      );
    };

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confrontation-title"
        className="wife-notebook absolute inset-0 z-[80] flex flex-col items-center bg-darkroom-bg text-darkroom-text-primary select-none font-sans overflow-hidden"
        {...swipeHandlers}
      >
        <div
          ref={dialogRef}
          tabIndex={-1}
          onClick={isTyping ? completeTypewriter : undefined}
          className="relative w-full max-w-[480px] h-[100dvh] max-h-full flex flex-col justify-between overflow-hidden outline-none"
          style={{
            paddingTop: 'max(8px, var(--phone-system-top, 16px))',
            paddingBottom: 'max(10px, var(--phone-system-bottom, 14px))',
          }}
        >
          {/* TOP STAGE: Screen-Wide Spotlight + Unframed Large Comic Hoang + Character-Anchored Subtitle */}
          <section className="relative flex-1 min-h-0 flex flex-col justify-between overflow-hidden bg-darkroom-bg">
            {/* Full-Stage Volumetric Overhead Spotlight */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 origin-top will-change-[transform,opacity]"
              style={{ background: spotlightBackground }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.9, scaleX: 1 }
                  : { opacity: [0.82, 1, 0.86], scaleX: [0.99, 1.02, 0.99] }
              }
              transition={
                prefersReducedMotion
                  ? REDUCED_FADE
                  : { duration: 4.2, repeat: Infinity, ease: 'easeInOut' }
              }
            />

            {/* Industrial Overhead Lamp Fixture */}
            <div aria-hidden="true" className="pointer-events-none relative z-10 flex justify-center pt-1 pb-1 shrink-0">
              <svg width="88" height="12" viewBox="0 0 88 12" fill="none">
                <line x1="44" y1="0" x2="44" y2="4" stroke="#475569" strokeWidth="2" />
                <path d="M22 9 L31 3 L57 3 L66 9 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
                <ellipse cx="44" cy="9.5" rx="18" ry="2" fill="#f8fafc" opacity="0.92" />
              </svg>
            </div>

            {/* Top Bar Chrome + Integrated Minimalist Progress Rail */}
            <header className="relative z-20 w-full flex items-center justify-between gap-2 px-3 pt-0.5 shrink-0">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleBack();
                }}
                aria-label="Đóng đối chất"
                className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl bg-white/[0.06] hover:bg-white/15 border border-white/10 text-darkroom-text-dialogue active:scale-[0.97] active:opacity-75 transition-[transform,opacity,background-color] duration-[85ms] cursor-pointer"
              >
                <IoCloseOutline className="h-5 w-5" aria-hidden="true" />
              </button>

              <div className="flex flex-col items-center gap-1 min-w-0">
                <h2
                  id="confrontation-title"
                  className="font-sans text-ios-caption-1 uppercase tracking-widest text-darkroom-text-dialogue truncate"
                >
                  Đối chất · {session.husbandName}
                </h2>
                <div
                  role="progressbar"
                  aria-label="Tiến độ thẩm vấn"
                  aria-valuemin={1}
                  aria-valuemax={session.totalSteps}
                  aria-valuenow={session.currentStepIndex + 1}
                  className="flex items-center justify-center gap-1.5"
                >
                  {Array.from({ length: session.totalSteps }).map((_, idx) => {
                    const isCompleted = idx < session.currentStepIndex;
                    const isCurrent = idx === session.currentStepIndex;
                    if (isCurrent) {
                      const dotColor =
                        session.phase === 'failed'
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]'
                          : session.phase === 'ending' || session.phase === 'resolved'
                            ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.85)]'
                            : 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]';
                      return (
                        <span
                          key={idx}
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 rounded-full transition-colors duration-200 ${dotColor}`}
                        />
                      );
                    }
                    return (
                      <span
                        key={idx}
                        aria-hidden="true"
                        className={`h-[2px] w-3.5 rounded-full transition-colors duration-200 ${
                          isCompleted ? 'bg-rose-500/90' : 'bg-slate-700/85'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div
                aria-label={`Thước đo nghi ngờ: ${usedStrikes} trên ${maxStrikes}`}
                className="min-h-[28px] px-2.5 rounded-full bg-white/[0.06] border border-white/10 flex items-center gap-1.5 font-sans text-ios-caption-2 tabular-nums text-darkroom-text-dialogue"
              >
                <IoScaleOutline className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                <span>{usedStrikes}/{maxStrikes}</span>
              </div>
            </header>

            {/* Unframed Large Comic Character + Direct Bottom Scrim + Dual-Speaker Subtitle */}
            <div className="relative flex-1 min-h-0 flex flex-col justify-end items-center">
              <div className="relative w-full flex-1 min-h-[120px] flex items-end justify-center overflow-hidden">
                <HusbandCharacterImage
                  variant="stage"
                  mood={session.husbandMood}
                  hitTrigger={session.hitSeq}
                  className={
                    session.phase === 'resolved'
                      ? 'max-w-[280px] max-h-[220px] short:max-h-[155px] xshort:max-h-[120px]'
                      : 'max-w-[380px] max-h-[360px] short:max-h-[260px] xshort:max-h-[180px]'
                  }
                />
              </div>

              {/* Seamless Bottom Scrim Directly Over Lower Table & Torso */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%]"
                style={{
                  background:
                    'linear-gradient(to top, var(--notebook-bg, #080b0f) 0%, rgba(8,11,15,0.94) 44%, rgba(8,11,15,0.62) 72%, transparent 100%)',
                }}
              />

              {/* Character-Anchored Subtitle Block (Previously Chosen Wife Line + Typewriter Husband Reply) */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={dialogueKey}
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 6 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_IN,
                  }}
                  exit={{
                    opacity: 0,
                    y: prefersReducedMotion ? 0 : -4,
                    transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT,
                  }}
                  className="relative z-10 w-full px-4 pt-2 pb-5 short:pb-3.5 xshort:pb-2.5 space-y-1.5"
                >
                  {session.husbandLine ? (
                    <>
                      {session.lastWifeLine && (
                        <p className="font-sans text-ios-footnote text-darkroom-text-muted line-clamp-2">
                          <span className="text-darkroom-speaker-wife">Vợ : </span>
                          &ldquo;{session.lastWifeLine}&rdquo;
                        </p>
                      )}
                      <div className="grid [&>*]:col-start-1 [&>*]:row-start-1">
                        <p
                          aria-hidden="true"
                          className="invisible select-none font-sans text-ios-footnote"
                        >
                          <span>{session.husbandName} : </span>
                          &ldquo;{session.husbandLine}&rdquo;
                        </p>
                        <p
                          aria-label={`${session.husbandName}: ${session.husbandLine}`}
                          data-testid="confrontation-husband-line"
                          data-typing={isTyping ? 'true' : 'false'}
                          className="font-sans text-ios-footnote text-darkroom-text-dialogue select-text"
                        >
                          <span className="text-darkroom-speaker-husband">{session.husbandName} : </span>
                          &ldquo;{visibleHusbandLine}
                          {isTyping ? (
                            <span
                              aria-hidden="true"
                              className="inline-block w-[2px] h-[0.95em] ml-0.5 align-[-0.12em] bg-darkroom-speaker-husband animate-pulse"
                            />
                          ) : (
                            <>&rdquo;</>
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="font-sans text-ios-footnote text-darkroom-text-muted text-center pb-0.5">
                      Chọn câu mở đầu bên dưới để bắt đầu chất vấn {session.husbandName}.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </section>

          {/* BOTTOM DECK: Vertical Numbered Tactical Options / Failed / Resolved Verdict */}
          <footer className="relative z-20 shrink-0 bg-darkroom-bg px-4">
            <div className="border-t border-darkroom-divider pt-3.5 pb-2 short:pt-2.5 short:pb-1.5 flex items-center justify-between gap-2">
              {stageTopicLabel && (
                <span className="font-sans text-ios-caption-1 uppercase tracking-wider text-darkroom-text-muted truncate">
                  {stageTopicLabel}
                </span>
              )}
              <span className="font-sans text-ios-caption-2 text-darkroom-text-muted shrink-0">
                {MOOD_LABELS[session.husbandMood]}
              </span>
            </div>

            <div className="relative">
              {isTyping && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                >
                  <span className="font-sans text-ios-caption-1 text-darkroom-text-muted">
                    Chạm để hiện nhanh...
                  </span>
                </div>
              )}

              <div
                aria-hidden={!isDeckReady}
                className={isDeckReady ? undefined : 'pointer-events-none'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isChoicesActive && (
                    <motion.div
                      key={`choices-${session.phase}-${session.beatIndex}`}
                      role="group"
                      aria-label="Lựa chọn chất vấn"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: isDeckReady ? 1 : 0,
                        transition: prefersReducedMotion ? REDUCED_FADE : SNAP,
                      }}
                      exit={{ opacity: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT }}
                      className="flex flex-col gap-2.5 pt-2 pb-3 max-h-[42dvh] overflow-y-auto"
                    >
                      {session.choices.map((choice, index) => renderVerticalChoice(choice, index))}
                    </motion.div>
                  )}

                  {/* FALSE BRANCH: Strictly lock accusation, show ONLY return to investigation */}
                  {session.phase === 'failed' && !session.canAccuse && (
                    <motion.div
                      key="failed-actions"
                      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                      animate={{
                        opacity: isDeckReady ? 1 : 0,
                        y: isDeckReady || prefersReducedMotion ? 0 : 8,
                        transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_IN,
                      }}
                      exit={{ opacity: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT }}
                      className="pt-2 pb-3 space-y-2.5"
                    >
                      <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-3.5 py-2.5 text-amber-200 space-y-1.5">
                        <div className="flex items-center justify-between gap-2 font-sans text-ios-footnote font-semibold text-amber-300">
                          <span className="flex items-center gap-1.5">
                            <IoWarningOutline className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
                            <span>Cảnh báo: Mất 1 lượt nghi ngờ khi rút lui</span>
                          </span>
                          <span className="tabular-nums">{usedStrikes}/{maxStrikes}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {Array.from({ length: maxStrikes }).map((_, idx) => (
                            <div
                              key={idx}
                              className={`h-2 flex-1 rounded-sm ${
                                idx < usedStrikes
                                  ? 'bg-rose-500'
                                  : 'bg-white/10 border border-white/15'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="button"
                        data-testid="confrontation-return-investigate"
                        disabled={!isDeckReady}
                        onClick={handleBack}
                        className="w-full min-h-[48px] rounded-xl bg-darkroom-crimson hover:bg-[#BE123C] active:scale-[0.97] active:opacity-75 transition-[transform,opacity,background-color] duration-[85ms] text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <IoSearchOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Quay lại điều tra</span>
                      </button>
                    </motion.div>
                  )}

                  {/* RESOLVED END BRANCH: Verdict Stamp + Roast Card + Advance */}
                  {session.phase === 'resolved' && session.canAccuse && (
                    <motion.div
                      key="resolved-actions"
                      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                      animate={{
                        opacity: isDeckReady ? 1 : 0,
                        y: isDeckReady || prefersReducedMotion ? 0 : 8,
                        transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_IN,
                      }}
                      exit={{ opacity: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT }}
                      className="pt-2 pb-3 space-y-2"
                    >
                      <motion.div
                        initial={
                          prefersReducedMotion
                            ? { opacity: 0 }
                            : { opacity: 0, scale: 0.88 }
                        }
                        animate={
                          isDeckReady
                            ? prefersReducedMotion
                              ? { opacity: 1 }
                              : { opacity: 1, scale: 1 }
                            : prefersReducedMotion
                              ? { opacity: 0 }
                              : { opacity: 0, scale: 0.88 }
                        }
                        transition={prefersReducedMotion ? REDUCED_FADE : POP}
                        className="w-full rounded-xl border border-rose-500/45 bg-rose-950/25 px-3.5 py-2 text-center space-y-1.5"
                      >
                        <div className="flex items-center justify-center gap-1.5 text-amber-400">
                          {Array.from({ length: 3 }).map((_, idx) => (
                            <IoStar key={idx} className="h-4 w-4 drop-shadow-[0_0_6px_rgba(251,191,36,0.55)]" />
                          ))}
                        </div>
                        {session.wifeTitle && (
                          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-0.5 font-sans text-ios-caption-1 font-semibold uppercase text-amber-300">
                            <IoTrophyOutline className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                            <span>{session.wifeTitle}</span>
                          </div>
                        )}
                        {session.narrativeRoast && (
                          <p className="font-sans text-ios-footnote text-darkroom-text-primary text-left border-l-2 border-rose-500 pl-2.5">
                            &ldquo;{session.narrativeRoast}&rdquo;
                          </p>
                        )}
                      </motion.div>

                      <button
                        type="button"
                        disabled={!isDeckReady}
                        onClick={onShareRoastCard}
                        className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.97] active:opacity-75 transition-[transform,opacity] duration-[85ms] text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <IoShareSocialOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>Tạo thẻ Roast khoe MXH</span>
                      </button>

                      <button
                        type="button"
                        disabled={!isDeckReady}
                        onClick={onForgiveAndAdvance}
                        className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.97] active:opacity-75 transition-[transform,opacity] duration-[85ms] text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                      >
                        <IoLockOpenOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
                        <span>{getAdvanceLabel(session.verdict, session.selectedEndingChoiceId)}</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <div className="border-t border-darkroom-divider pt-2 flex items-center justify-between font-sans text-ios-caption-2 tabular-nums text-darkroom-text-muted">
              <span>HỒ SƠ #01 · {session.husbandName.toUpperCase()}</span>
              <span>BƯỚC {session.currentStepIndex + 1}/{session.totalSteps}</span>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // =========================================================================
  // LEGACY FALLBACK (Levels without confrontationScript, e.g. Level 2 & 3)
  // =========================================================================
  if (!evaluation) return null;

  const {
    stars,
    verifiedSmokingGunCount,
    requiredSmokingGunCount,
    husbandName,
    husbandDialogue,
    husbandMood,
    wifeTitle,
    narrativeRoast,
    isMaxStrikesReached,
    newStrikesRemaining,
  } = evaluation;

  const currentMoodText = MOOD_LABELS[husbandMood] || 'Phòng thủ';
  const usedStrikes = Math.max(0, maxStrikes - newStrikesRemaining);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confrontation-title"
      className="absolute inset-0 z-[80] flex flex-col bg-[#080b0f]/95 backdrop-blur-xl text-white select-none font-sans animate-fadeIn overflow-y-auto"
      {...swipeHandlers}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-[480px] mx-auto min-h-full p-4 flex flex-col justify-between outline-none"
      >
        <header className="flex flex-col items-center gap-2 pt-2 pb-3 border-b border-white/10 relative">
          {!isMaxStrikesReached && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Đóng đối chất"
              className="absolute left-0 top-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.97] active:opacity-75 text-slate-300 transition-[transform,opacity,background-color] duration-[85ms] cursor-pointer"
            >
              <IoCloseOutline className="h-5 w-5" />
            </button>
          )}

          <div className="flex items-center gap-2 text-rose-400">
            <IoScaleOutline className="h-6 w-6" />
            <h2 id="confrontation-title" className="font-sans text-ios-headline uppercase">
              Đối chất chồng {husbandName}
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 font-sans text-ios-caption-1 text-slate-300">
            <span>Tiến độ chứng cứ cốt lõi:</span>
            <span className="font-bold text-amber-400 tabular-nums">
              {verifiedSmokingGunCount}/{requiredSmokingGunCount}
            </span>
          </div>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center py-5 space-y-4">
          <div className="flex flex-col items-center gap-2">
            <HusbandCharacterImage mood={husbandMood} size={140} />
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 font-sans text-ios-caption-1 text-slate-300 border border-white/10 shadow-sm">
              ({currentMoodText})
            </span>
          </div>

          <div className="w-full p-4 rounded-2xl bg-white/10 border border-white/15 shadow-xl relative backdrop-blur-md">
            <div className="font-sans text-ios-caption-1 font-bold text-rose-300 mb-1">
              {husbandName}:
            </div>
            <p className="font-sans text-ios-callout text-slate-100 select-text">
              &ldquo;{husbandDialogue}&rdquo;
            </p>
          </div>

          {stars === 0 && (
            <div className="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-sans text-ios-subheadline font-semibold text-amber-300">
                <IoWarningOutline className="h-5 w-5 text-amber-400 shrink-0" />
                <span>CẢNH BÁO: Nghi ngờ tăng thêm 1 vạch!</span>
              </div>

              <div className="flex items-center justify-between font-sans text-ios-caption-1 text-slate-300 pt-1">
                <span>Thước đo nghi ngờ:</span>
                <span className="font-sans font-bold text-amber-400 tabular-nums">
                  {usedStrikes}/{maxStrikes}
                </span>
              </div>

              <div className="flex items-center gap-1.5 pt-1">
                {Array.from({ length: maxStrikes }).map((_, idx) => {
                  const isFilled = idx < usedStrikes;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 h-3 rounded-md transition-all ${
                        isFilled
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : 'bg-white/10 border border-white/20'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {stars > 0 && (
            <div className="w-full flex flex-col items-center space-y-2 pt-1 text-center">
              <span className="font-sans text-ios-caption-1 font-semibold uppercase tracking-wider text-slate-400">
                Kết quả phán quyết
              </span>

              <div className="flex items-center justify-center gap-2 text-amber-400 py-1">
                {Array.from({ length: 3 }).map((_, idx) => {
                  const isFilled = idx < stars;
                  return isFilled ? (
                    <IoStar key={idx} className="h-6 w-6 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  ) : (
                    <IoStarOutline key={idx} className="h-6 w-6 text-slate-600" />
                  );
                })}
              </div>

              {stars === 3 && wifeTitle && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/40 text-amber-300 font-sans text-ios-subheadline font-semibold shadow-md">
                  <IoTrophyOutline className="h-4 w-4 text-amber-400" />
                  <span className="uppercase tracking-wide">{wifeTitle}</span>
                </div>
              )}

              {stars === 3 && narrativeRoast && (
                <div className="p-3 mt-1 rounded-xl bg-white/5 border-l-4 border-l-rose-500 text-left">
                  <p className="font-sans text-ios-subheadline text-slate-300">
                    &ldquo;{narrativeRoast}&rdquo;
                  </p>
                </div>
              )}

              {stars < 3 && (
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 font-sans text-ios-caption-1 font-bold">
                  ĐÃ VẠCH TRẦN MỘT PHẦN
                </span>
              )}
            </div>
          )}
        </div>

        <footer className="space-y-2.5 pt-3 border-t border-white/10">
          {stars === 0 && (
            <button
              type="button"
              onClick={onContinueInvestigation}
              className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.97] active:opacity-75 text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-[transform,opacity] duration-[85ms] cursor-pointer"
            >
              <IoSearchOutline className="h-5 w-5" />
              <span>Tiếp tục điều tra</span>
            </button>
          )}

          {stars > 0 && stars < 3 && (
            <>
              <button
                type="button"
                onClick={onForgiveAndAdvance}
                className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.97] active:opacity-75 text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-[transform,opacity] duration-[85ms] cursor-pointer"
              >
                <IoLockOpenOutline className="h-5 w-5" />
                <span>Tha thứ &amp; Qua màn</span>
              </button>

              <button
                type="button"
                onClick={onContinueInvestigation}
                className="w-full min-h-[44px] rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.97] active:opacity-75 text-slate-300 font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 transition-[transform,opacity,background-color] duration-[85ms] cursor-pointer"
              >
                <IoSearchOutline className="h-4 w-4" />
                <span>Điều tra tiếp để đạt 3 sao</span>
              </button>
            </>
          )}

          {stars === 3 && (
            <>
              <button
                type="button"
                onClick={onShareRoastCard}
                className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.97] active:opacity-75 text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-[transform,opacity] duration-[85ms] cursor-pointer"
              >
                <IoShareSocialOutline className="h-5 w-5" />
                <span>Tạo thẻ Roast khoe MXH</span>
              </button>

              <button
                type="button"
                onClick={onForgiveAndAdvance}
                className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.97] active:opacity-75 text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-[transform,opacity] duration-[85ms] cursor-pointer"
              >
                <IoLockOpenOutline className="h-5 w-5" />
                <span>Tha thứ &amp; Qua màn</span>
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
