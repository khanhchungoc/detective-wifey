import React from 'react';
import { motion, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { IoAlertCircleOutline, IoLockClosedOutline, IoStar, IoStarOutline } from 'react-icons/io5';
import type { LevelCardItem } from '../../../shared/contracts/game-flow';
import {
  AttachedPhoto,
  CoffeeRing,
  INK_TEXT,
  INK_TEXT_SOFT,
  INK_TEXT_STRONG,
  PaperSurface,
  RubberStamp,
  Staple,
} from './FolderParts';
import { CTA_PRIMARY } from './ctaStyles';

interface LevelFileProps {
  level: LevelCardItem;
  subjectPortraitUrl: string;
  index: number;
  isActive: boolean;
  /** 0 = on the stack, 1 = turned over. */
  flip: MotionValue<number>;
  reduced: boolean;
  lockedFeedback: string | null;
  isShaking: boolean;
  onShakeDone: () => void;
  onFileTap: () => void;
  onStart: () => void;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export function levelLockHint(level: LevelCardItem): string {
  return level.lockHint ?? `Hoàn thành Màn ${Math.max(1, level.levelNumber - 1)}`;
}

export const LevelFile: React.FC<LevelFileProps> = ({
  level,
  subjectPortraitUrl,
  index,
  isActive,
  flip,
  reduced,
  lockedFeedback,
  isShaking,
  onShakeDone,
  onFileTap,
  onStart,
}) => {
  // Binder sheet: flip 0 = flat on the stack, 1 = turned over on its left edge. Reduced motion only fades.
  const x = useTransform(flip, (f) => (reduced ? '0%' : `${-f * 6}%`));
  const rotateY = useTransform(flip, (f) => (reduced ? 0 : -f * 100));
  const opacity = useTransform(flip, (f) => {
    if (reduced) return 1 - f;
    // A turning sheet stays solid until it is edge-on, then fades out of the way.
    return f < 0.6 ? 1 : Math.max(0, 1 - (f - 0.6) * 2.5);
  });
  // A sheet in motion paints above the whole stack and the tabs; at rest it returns to its layer.
  const zIndex = useTransform(flip, (f) => (f >= 1 ? 5 : f > 0 ? 100 : 20 - Math.min(index, 15)));

  const isGuide = Boolean(level.isGuide);
  const locked = !level.unlocked && !isGuide;
  const stars = clamp(level.bestStars ?? 0, 0, 3);
  const paperTone = isGuide ? 'bg-game-paper-slip' : 'bg-game-manila';

  return (
    <motion.div
      data-level-file={level.caseId}
      data-level-unlocked={level.unlocked ? 'true' : 'false'}
      data-level-guide={isGuide ? 'true' : undefined}
      inert={!isActive}
      aria-hidden={!isActive}
      onClick={isActive ? onFileTap : undefined}
      style={{
        x, rotateY, opacity, zIndex,
        // Deeper sheets stick out a little below, so the stack reads as stacked paper.
        bottom: -Math.min(index, 3) * 3,
        transformOrigin: 'left center',
      }}
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-b-lg border border-game-ink/25 ${paperTone} shadow-[0_10px_24px_-10px_rgba(0,0,0,0.65)] will-change-transform select-none`}
    >
      <PaperSurface />
      <Staple className="absolute left-3 top-2 h-3 w-8 -rotate-6" />
      {index % 2 === 1 && <CoffeeRing className="absolute -right-4 bottom-16 h-24 w-24 -rotate-12" />}
      <motion.div
        animate={isShaking ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
        transition={isShaking ? { duration: 0.32, ease: 'easeInOut' } : { duration: 0 }}
        onAnimationComplete={() => {
          if (isShaking) onShakeDone();
        }}
        className="relative flex min-h-0 flex-1 flex-col gap-3 p-4 pt-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span className={`text-ios-subheadline uppercase tabular-nums ${INK_TEXT_STRONG}`}>
            Màn {level.levelNumber}
          </span>
          {isGuide && (
            <RubberStamp tone="slate" className="-rotate-6">
              Hướng dẫn
            </RubberStamp>
          )}
          {locked && (
            <RubberStamp tone="red" className="-rotate-6">
              Khóa
            </RubberStamp>
          )}
          {!isGuide && !locked && (
            <div className="flex items-center gap-0.5" role="img" aria-label={`Đạt ${stars} trên 3 sao`}>
              {[1, 2, 3].map((n) =>
                n <= stars ? (
                  <IoStar key={n} aria-hidden="true" className="h-5 w-5 text-game-amber" />
                ) : (
                  <IoStarOutline key={n} aria-hidden="true" className="h-5 w-5 text-game-ink/60" />
                ),
              )}
            </div>
          )}
        </div>

        <h3 className={`text-ios-title-2 leading-tight ${INK_TEXT_STRONG}`}>{level.levelTitle}</h3>
        <div aria-hidden="true" className="border-t border-dashed border-game-ink/40" />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 bottom-20 top-64"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(71,55,25,0.22) 27px, rgba(71,55,25,0.22) 28px)',
          }}
        />
        <div className="flex items-start justify-between gap-3">
          <p className={`min-w-0 flex-1 text-ios-callout leading-snug ${INK_TEXT}`}>{level.summary}</p>
          {!isGuide && (
            <div className="h-36 shrink-0 pr-1 pt-2">
              <AttachedPhoto src={subjectPortraitUrl} tilt="rotate-3" className="h-full" />
            </div>
          )}
        </div>

        <div className="relative mt-auto flex flex-col gap-2">
          {locked && (
            <p className={`flex items-center gap-2 text-ios-footnote ${INK_TEXT}`}>
              <IoLockClosedOutline aria-hidden="true" className="h-4 w-4 shrink-0" />
              <span>{levelLockHint(level)}</span>
            </p>
          )}
          {locked && lockedFeedback && (
            <p
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-game-crimson/50 bg-game-crimson/10 px-3 py-2 text-ios-caption-1 text-game-ink"
            >
              <IoAlertCircleOutline aria-hidden="true" className="mt-px h-4 w-4 shrink-0 text-game-crimson" />
              <span>{lockedFeedback}</span>
            </p>
          )}
          {isGuide && (
            <span className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-dashed border-game-ink/60 text-ios-subheadline uppercase tracking-widest ${INK_TEXT_SOFT}`}>
              Sắp có
            </span>
          )}
          {isActive && !isGuide && !locked && (
            <button
              type="button"
              data-case-id={level.caseId}
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              className={`${CTA_PRIMARY} w-full active:scale-[0.98]`}
            >
              Điều tra màn này
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
