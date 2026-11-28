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
  pos: MotionValue<number>;
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
  pos,
  reduced,
  lockedFeedback,
  isShaking,
  onShakeDone,
  onFileTap,
  onStart,
}) => {
  const offset = useTransform(pos, (p) => index - p);
  // Upcoming files (o > 0) peek behind the current one; flipped files (o < 0) swing away on the left edge.
  const x = useTransform(offset, (o) => (reduced ? '0%' : o >= 0 ? `${o * 4}%` : `${clamp(o, -1.5, 0) * 105}%`));
  const y = useTransform(offset, (o) => (reduced || o < 0 ? 0 : -Math.min(o, 3) * 7));
  const scale = useTransform(offset, (o) => (reduced || o < 0 ? 1 : 1 - Math.min(o, 3) * 0.035));
  const rotateZ = useTransform(offset, (o) => (reduced || o < 0 ? 0 : Math.min(o, 3) * 1.1 * (index % 2 === 0 ? 1 : -1)));
  const rotateY = useTransform(offset, (o) => (reduced || o >= 0 ? 0 : clamp(o, -1.5, 0) * 40));
  const opacity = useTransform(offset, (o) => {
    if (reduced) return Math.max(0, 1 - Math.abs(o) * 1.6);
    // A turned page stays solid while it covers the next one, then fades once it is mostly gone.
    if (o < 0) return Math.min(1, Math.max(0, 1 + (o + 0.6) * 2.5));
    return Math.max(0, 1 - Math.max(0, o - 2) * 1);
  });
  const zIndex = useTransform(offset, (o) => (o >= 0 ? 20 - Math.round(o * 4) : 30 + Math.round(o * 4)));

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
        x, y, scale, rotateZ, rotateY, opacity, zIndex,
        transformOrigin: 'left center',
      }}
      className={`absolute inset-0 flex flex-col overflow-hidden rounded-lg border border-game-ink/25 ${paperTone} shadow-[0_10px_24px_-10px_rgba(0,0,0,0.65)] will-change-transform select-none`}
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
          <span className={`text-ios-subheadline uppercase tracking-widest tabular-nums ${INK_TEXT_STRONG}`}>
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
