import React, { useEffect, useRef } from 'react';
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
  IoChevronUpOutline,
  IoChevronDownOutline,
  IoChevronBackOutline,
  IoChevronForwardOutline,
} from 'react-icons/io5';
import type { ConfrontationSlot, VerdictType } from '../../../shared/contracts/case-schema';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import {
  CHOICE_STAGGER_S,
  NARRATIVE_IN,
  NARRATIVE_OUT,
  POP,
  REDUCED_FADE,
  SNAP,
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

const ColdWarReticleSvg: React.FC<{
  activeSlots: ReadonlySet<ConfrontationSlot>;
  isEnding: boolean;
}> = ({ activeSlots, isEnding }) => {
  const activeStroke = isEnding ? '#fb7185' : '#38bdf8';
  const idleStroke = '#1e293b';

  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="h-11 w-11 shrink-0 select-none"
    >
      <circle
        cx="24"
        cy="24"
        r="19"
        fill="#080b0f"
        stroke="#334155"
        strokeWidth="1.2"
        strokeDasharray="3 3"
      />
      <circle
        cx="24"
        cy="24"
        r="11"
        fill="none"
        stroke={isEnding ? 'rgba(244,63,94,0.45)' : 'rgba(56,189,248,0.35)'}
        strokeWidth="1.2"
      />
      {/* Cardinal Ticks: Up, Right, Down, Left */}
      <line
        x1="24"
        y1="2"
        x2="24"
        y2="10"
        stroke={activeSlots.has('up') ? activeStroke : idleStroke}
        strokeWidth={activeSlots.has('up') ? '2.4' : '1.4'}
        strokeLinecap="round"
      />
      <line
        x1="46"
        y1="24"
        x2="38"
        y2="24"
        stroke={activeSlots.has('right') ? activeStroke : idleStroke}
        strokeWidth={activeSlots.has('right') ? '2.4' : '1.4'}
        strokeLinecap="round"
      />
      <line
        x1="24"
        y1="46"
        x2="24"
        y2="38"
        stroke={activeSlots.has('down') ? activeStroke : idleStroke}
        strokeWidth={activeSlots.has('down') ? '2.4' : '1.4'}
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="24"
        x2="10"
        y2="24"
        stroke={activeSlots.has('left') ? activeStroke : idleStroke}
        strokeWidth={activeSlots.has('left') ? '2.4' : '1.4'}
        strokeLinecap="round"
      />
      <circle
        cx="24"
        cy="24"
        r="3"
        fill={isEnding ? '#e11d48' : '#38bdf8'}
      />
    </svg>
  );
};

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
    const firstButton = dialogRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])');
    firstButton?.focus({ preventScroll: true });
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
      if (!isInteractivePhase) return;

      const keyToSlot: Partial<Record<string, ConfrontationSlot>> = {
        ArrowUp: 'up',
        ArrowRight: 'right',
        ArrowDown: 'down',
        ArrowLeft: 'left',
      };
      const targetSlot = keyToSlot[event.key];
      if (!targetSlot) return;

      const matched = session.choices.find(item => item.slot === targetSlot);
      if (matched) {
        event.preventDefault();
        onSelectChoice(matched.choiceId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!isOpen) return null;

  // =========================================================================
  // SCRIPTED INTERROGATION ROOM & COD COLD WAR D-PAD (Step 2 - Step 4)
  // =========================================================================
  if (session) {
    const usedStrikes = Math.max(0, maxStrikes - session.newStrikesRemaining);
    const activeSlots = new Set<ConfrontationSlot>(session.choices.map(c => c.slot));
    const choiceBySlot = (slot: ConfrontationSlot): ActiveConfrontationChoice | undefined =>
      session.choices.find(item => item.slot === slot);
    const slotOrderIndex = (slot: ConfrontationSlot): number => {
      const idx = session.choices.findIndex(item => item.slot === slot);
      return idx >= 0 ? Math.min(idx, 3) : 0;
    };

    const isDpadActive =
      session.phase === 'opening' ||
      session.phase === 'beat' ||
      session.phase === 'ending';
    const isEndingPhase = session.phase === 'ending';

    const renderDpadButton = (choice: ActiveConfrontationChoice, slot: ConfrontationSlot) => {
      const staggerDelay = prefersReducedMotion ? 0 : slotOrderIndex(choice.slot) * CHOICE_STAGGER_S;
      const spatialOffset = prefersReducedMotion
        ? { x: 0, y: 0 }
        : slot === 'up'
          ? { x: 0, y: 8 }
          : slot === 'down'
            ? { x: 0, y: -8 }
            : slot === 'left'
              ? { x: 8, y: 0 }
              : { x: -8, y: 0 };

      const toneClasses = isEndingPhase
        ? slot === 'left'
          ? 'border-rose-500/60 bg-rose-950/45 hover:bg-rose-900/55 hover:border-rose-400 text-rose-50'
          : 'border-emerald-500/55 bg-emerald-950/40 hover:bg-emerald-900/50 hover:border-emerald-400 text-emerald-50'
        : 'border-slate-700/85 bg-[#0f1622]/95 hover:bg-[#162032] hover:border-sky-400/65 text-[#F1F5F9]';

      const DirectionIcon =
        slot === 'up'
          ? IoChevronUpOutline
          : slot === 'down'
            ? IoChevronDownOutline
            : slot === 'left'
              ? IoChevronBackOutline
              : IoChevronForwardOutline;

      return (
        <motion.button
          key={choice.choiceId}
          type="button"
          data-choice-id={choice.choiceId}
          data-choice-slot={slot}
          onClick={() => onSelectChoice?.(choice.choiceId)}
          initial={{ opacity: 0, ...spatialOffset }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            transition: prefersReducedMotion
              ? REDUCED_FADE
              : { ...SNAP, delay: staggerDelay },
          }}
          exit={{
            opacity: 0,
            transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT,
          }}
          className={`group relative w-full min-w-[44px] ${
            slot === 'left' || slot === 'right' ? 'min-h-[54px] px-2.5 py-2' : 'min-h-[48px] px-3.5 py-2'
          } flex items-center justify-between gap-2 rounded-xl border shadow-[0_8px_20px_rgba(0,0,0,0.55)] active:scale-[0.97] active:opacity-75 transition-[transform,opacity,background-color,border-color] duration-[85ms] cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${toneClasses}`}
        >
          {slot === 'right' && (
            <DirectionIcon
              aria-hidden="true"
              className="h-3.5 w-3.5 shrink-0 text-sky-400/80 group-hover:text-sky-300"
            />
          )}
          <span
            className={`flex-1 font-sans text-ios-footnote tall:text-ios-subheadline font-medium ${
              slot === 'left'
                ? 'text-right'
                : slot === 'right'
                  ? 'text-left'
                  : 'text-center'
            }`}
          >
            {choice.wifeLine}
          </span>
          {(slot === 'left' || slot === 'up' || slot === 'down') && (
            <DirectionIcon
              aria-hidden="true"
              className={`h-3.5 w-3.5 shrink-0 ${
                isEndingPhase ? 'text-rose-300/85' : 'text-sky-400/80 group-hover:text-sky-300'
              }`}
            />
          )}
        </motion.button>
      );
    };

    const upChoice = choiceBySlot('up');
    const leftChoice = choiceBySlot('left');
    const rightChoice = choiceBySlot('right');
    const downChoice = choiceBySlot('down');

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

    return (
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confrontation-title"
        className="absolute inset-0 z-[80] flex flex-col items-center bg-[#080b0f] text-[#F1F5F9] select-none font-sans overflow-hidden"
        {...swipeHandlers}
      >
        <div
          ref={dialogRef}
          className="relative w-full max-w-[480px] h-[100dvh] max-h-full flex flex-col justify-between overflow-hidden"
          style={{
            paddingTop: 'max(8px, var(--phone-system-top, 16px))',
            paddingBottom: 'max(12px, var(--phone-system-bottom, 14px))',
          }}
        >
          {/* TIER 1 (TOP): Dark Interrogation Stage + Top-Down Spotlight + Comic Hoang */}
          <section className="relative flex flex-col items-center shrink-0 bg-gradient-to-b from-[#080b0f] via-[#0b1017] to-[#080b0f] px-3 pt-1 pb-2 overflow-hidden">
            {/* Stage Overhead Spotlight Cone */}
            <motion.div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-full origin-top will-change-[transform,opacity]"
              style={{
                background:
                  session.husbandMood === 'broken'
                    ? 'radial-gradient(ellipse 58% 92% at 50% 0%, rgba(244,63,94,0.18) 0%, rgba(15,23,42,0.06) 58%, transparent 85%)'
                    : session.husbandMood === 'smug'
                      ? 'radial-gradient(ellipse 58% 92% at 50% 0%, rgba(250,204,21,0.16) 0%, rgba(15,23,42,0.06) 58%, transparent 85%)'
                      : session.husbandMood === 'nervous'
                        ? 'radial-gradient(ellipse 58% 92% at 50% 0%, rgba(251,146,60,0.18) 0%, rgba(15,23,42,0.06) 58%, transparent 85%)'
                        : 'radial-gradient(ellipse 58% 92% at 50% 0%, rgba(226,232,240,0.18) 0%, rgba(56,189,248,0.06) 58%, transparent 85%)',
              }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={prefersReducedMotion ? REDUCED_FADE : NARRATIVE_IN}
            />

            {/* Top Bar Chrome */}
            <header className="relative z-20 w-full flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleBack}
                aria-label="Đóng đối chất"
                className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center rounded-xl bg-white/[0.07] hover:bg-white/15 border border-white/10 text-slate-300 active:scale-[0.97] active:opacity-75 transition-[transform,opacity,background-color] duration-[85ms] cursor-pointer"
              >
                <IoCloseOutline className="h-5 w-5" aria-hidden="true" />
              </button>

              <h2
                id="confrontation-title"
                className="font-sans text-ios-caption-1 uppercase tracking-widest text-slate-300"
              >
                Đối chất · {session.husbandName}
              </h2>

              <div
                aria-label={`Thước đo nghi ngờ: ${usedStrikes} trên ${maxStrikes}`}
                className="min-h-[28px] px-2.5 rounded-full bg-white/[0.06] border border-white/10 flex items-center gap-1.5 font-sans text-ios-caption-2 tabular-nums text-slate-300"
              >
                <IoScaleOutline className="h-3.5 w-3.5 text-rose-400" aria-hidden="true" />
                <span>{usedStrikes}/{maxStrikes}</span>
              </div>
            </header>

            {/* Portrait Spotlight Frame */}
            <div className="relative z-10 mt-1 flex flex-col items-center">
              <HusbandCharacterImage
                mood={session.husbandMood}
                hitTrigger={session.hitSeq}
                size={172}
                className="short:scale-90 origin-center"
              />
            </div>
          </section>

          {/* TIER 2 (MIDDLE): Minimalist `- • -` Progress Rail + Husband Dialogue */}
          <section className="relative z-10 flex-1 min-h-0 px-4 py-1.5 flex flex-col items-center justify-center gap-2 overflow-y-auto">
            {/* Elastic Minimalist `- • -` Progress Indicator */}
            <div
              role="progressbar"
              aria-label="Tiến độ thẩm vấn"
              aria-valuemin={1}
              aria-valuemax={session.totalSteps}
              aria-valuenow={session.currentStepIndex + 1}
              className="flex items-center justify-center gap-2 py-0.5 shrink-0"
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
                      className={`h-2 w-2 rounded-full transition-colors duration-200 ${dotColor}`}
                    />
                  );
                }
                return (
                  <span
                    key={idx}
                    aria-hidden="true"
                    className={`h-[2px] w-4 rounded-full transition-colors duration-200 ${
                      isCompleted ? 'bg-rose-500/90' : 'bg-slate-700/85'
                    }`}
                  />
                );
              })}
            </div>

            {stageTopicLabel && (
              <span className="font-sans text-ios-caption-1 uppercase tracking-wider text-slate-400 text-center shrink-0">
                {stageTopicLabel}
              </span>
            )}

            {/* Husband Dialogue Card */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${session.phase}-${session.beatIndex}-${session.selectedEndingChoiceId ?? 'none'}`}
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
                className="w-full rounded-2xl border border-slate-800/90 bg-[#0b1017]/95 px-4 py-3 shadow-[0_12px_28px_rgba(0,0,0,0.65)]"
              >
                {session.lastWifeLine && (
                  <p className="mb-1.5 border-b border-white/[0.07] pb-1.5 font-sans text-ios-caption-1 text-slate-400 line-clamp-2">
                    Vợ: &ldquo;{session.lastWifeLine}&rdquo;
                  </p>
                )}

                {session.husbandLine ? (
                  <div>
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="font-sans text-ios-caption-1 font-semibold text-rose-400">
                        {session.husbandName}
                      </span>
                      <span className="font-sans text-ios-caption-2 text-slate-400">
                        {MOOD_LABELS[session.husbandMood]}
                      </span>
                    </div>
                    <p className="font-sans text-ios-callout tall:text-ios-body text-[#F1F5F9] select-text">
                      &ldquo;{session.husbandLine}&rdquo;
                    </p>
                  </div>
                ) : (
                  <p className="py-1 text-center font-sans text-ios-subheadline text-slate-300">
                    Chọn câu mở đầu bên dưới để bắt đầu chất vấn {session.husbandName}.
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Resolved Verdict Stamp & Roast */}
            {session.phase === 'resolved' && (
              <motion.div
                initial={
                  prefersReducedMotion
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.88 }
                }
                animate={
                  prefersReducedMotion
                    ? { opacity: 1 }
                    : { opacity: 1, scale: 1 }
                }
                transition={prefersReducedMotion ? REDUCED_FADE : POP}
                className="w-full rounded-xl border border-rose-500/45 bg-rose-950/25 px-3.5 py-2.5 text-center space-y-1.5 shrink-0"
              >
                <div className="flex items-center justify-center gap-1.5 text-amber-400">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <IoStar key={idx} className="h-5 w-5 drop-shadow-[0_0_6px_rgba(251,191,36,0.55)]" />
                  ))}
                </div>
                {session.wifeTitle && (
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-500/15 px-3 py-0.5 font-sans text-ios-caption-1 font-semibold uppercase text-amber-300">
                    <IoTrophyOutline className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    <span>{session.wifeTitle}</span>
                  </div>
                )}
                {session.narrativeRoast && (
                  <p className="font-sans text-ios-footnote text-slate-200 text-left border-l-2 border-rose-500 pl-2.5">
                    &ldquo;{session.narrativeRoast}&rdquo;
                  </p>
                )}
              </motion.div>
            )}
          </section>

          {/* TIER 3 (BOTTOM): COD Cold War Cross Selector / False Return / Verdict Actions */}
          <footer className="relative z-20 px-3 pt-2 shrink-0 border-t border-white/[0.08] bg-[#080b0f]">
            <AnimatePresence mode="wait" initial={false}>
              {isDpadActive && (
                <motion.div
                  key={`dpad-${session.phase}-${session.beatIndex}`}
                  role="group"
                  aria-label="Lựa chọn chất vấn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: prefersReducedMotion ? REDUCED_FADE : SNAP }}
                  exit={{ opacity: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT }}
                  className="flex flex-col items-center gap-2"
                >
                  {/* UP Slot */}
                  {upChoice && (
                    <div className="w-full max-w-[420px]">
                      {renderDpadButton(upChoice, 'up')}
                    </div>
                  )}

                  {/* LEFT - CENTER SVG RETICLE - RIGHT */}
                  <div className="grid w-full grid-cols-[1fr_44px_1fr] items-center gap-2">
                    <div className="min-w-0 flex items-center">
                      {leftChoice ? (
                        renderDpadButton(leftChoice, 'left')
                      ) : (
                        <div
                          aria-hidden="true"
                          className="h-[1px] w-full bg-gradient-to-r from-transparent to-slate-800"
                        />
                      )}
                    </div>

                    <ColdWarReticleSvg
                      activeSlots={activeSlots}
                      isEnding={isEndingPhase}
                    />

                    <div className="min-w-0 flex items-center">
                      {rightChoice ? (
                        renderDpadButton(rightChoice, 'right')
                      ) : (
                        <div
                          aria-hidden="true"
                          className="h-[1px] w-full bg-gradient-to-l from-transparent to-slate-800"
                        />
                      )}
                    </div>
                  </div>

                  {/* DOWN Slot */}
                  {downChoice && (
                    <div className="w-full max-w-[420px]">
                      {renderDpadButton(downChoice, 'down')}
                    </div>
                  )}
                </motion.div>
              )}

              {/* FALSE BRANCH: Strictly lock accusation, show ONLY return to investigation */}
              {session.phase === 'failed' && !session.canAccuse && (
                <motion.div
                  key="failed-actions"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_IN }}
                  exit={{ opacity: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT }}
                  className="space-y-2.5"
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
                    onClick={handleBack}
                    className="w-full min-h-[48px] rounded-xl bg-[#E11D48] hover:bg-[#BE123C] active:scale-[0.97] active:opacity-75 transition-[transform,opacity,background-color] duration-[85ms] text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <IoSearchOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Quay lại điều tra</span>
                  </button>
                </motion.div>
              )}

              {/* RESOLVED END BRANCH: Roast Card + Verdict Advance */}
              {session.phase === 'resolved' && session.canAccuse && (
                <motion.div
                  key="resolved-actions"
                  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
                  animate={{ opacity: 1, y: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_IN }}
                  exit={{ opacity: 0, transition: prefersReducedMotion ? REDUCED_FADE : NARRATIVE_OUT }}
                  className="space-y-2"
                >
                  <button
                    type="button"
                    onClick={onShareRoastCard}
                    className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.97] active:opacity-75 transition-[transform,opacity] duration-[85ms] text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <IoShareSocialOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>Tạo thẻ Roast khoe MXH</span>
                  </button>

                  <button
                    type="button"
                    onClick={onForgiveAndAdvance}
                    className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.97] active:opacity-75 transition-[transform,opacity] duration-[85ms] text-white font-sans text-ios-subheadline font-semibold flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                  >
                    <IoLockOpenOutline className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{getAdvanceLabel(session.verdict, session.selectedEndingChoiceId)}</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
        className="w-full max-w-[480px] mx-auto min-h-full p-4 flex flex-col justify-between"
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
