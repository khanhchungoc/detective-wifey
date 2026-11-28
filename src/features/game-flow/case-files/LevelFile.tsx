import React from "react";
import { motion } from "motion/react";
import {
  IoAlertCircleOutline,
  IoLockClosedOutline,
  IoStar,
  IoStarOutline,
} from "react-icons/io5";
import type { LevelCardItem } from "../../../shared/contracts/game-flow";
import {
  AttachedPhoto,
  CoffeeRing,
  INK_TEXT,
  INK_TEXT_SOFT,
  INK_TEXT_STRONG,
  PaperSurface,
  RubberStamp,
  Staple,
} from "./FolderParts";
import { CTA_PRIMARY } from "./ctaStyles";
import { TAB_LABEL_CLASS, TabLabel } from "./LevelTab";
import { sheetClip, tabButtonBox } from "./tabShape";
import type { SheetRestPose } from "./pagerLogic";

interface LevelFileProps {
  level: LevelCardItem;
  subjectPortraitUrl: string;
  index: number;
  total: number;
  isActive: boolean;
  isOngoing?: boolean;
  restPose: SheetRestPose;
  sheetRef: (el: HTMLDivElement | null) => void;
  lockedFeedback: string | null;
  isShaking: boolean;
  onShakeDone: () => void;
  onFileTap: () => void;
  onStart: () => void;
}

const clamp = (v: number, lo: number, hi: number) =>
  Math.max(lo, Math.min(hi, v));

export function levelLockHint(level: LevelCardItem): string {
  return (
    level.lockHint ?? `Hoàn thành Màn ${Math.max(1, level.levelNumber - 1)}`
  );
}

export const LevelFile: React.FC<LevelFileProps> = ({
  level,
  subjectPortraitUrl,
  index,
  total,
  isActive,
  isOngoing = false,
  restPose,
  sheetRef,
  lockedFeedback,
  isShaking,
  onShakeDone,
  onFileTap,
  onStart,
}) => {
  const isGuide = Boolean(level.isGuide);
  const comingSoon = Boolean(level.comingSoon) && !isGuide;
  const locked = !level.unlocked && !isGuide && !comingSoon;
  const stars = clamp(level.bestStars ?? 0, 0, 3);
  const paperTone = isGuide ? "bg-game-paper-slip" : "bg-game-manila";

  return (
    <div
      ref={sheetRef}
      data-level-file={level.caseId}
      data-level-unlocked={level.unlocked ? "true" : "false"}
      data-level-guide={isGuide ? "true" : undefined}
      data-level-coming-soon={comingSoon ? "true" : undefined}
      inert={!isActive}
      aria-hidden={!isActive}
      onClick={isActive ? onFileTap : undefined}
      style={{
        transform: `translate3d(0px, ${restPose.y}px, 0px)`,
        zIndex: restPose.zIndex,
        bottom: 0,
        transformOrigin: "center bottom",
        contain: "layout paint",
        backfaceVisibility: "hidden",
      }}
      className="absolute inset-x-0 -top-12 will-change-transform select-none"
    >
      {/* Sheet and tab are ONE deckled piece: one paper colour, cellulose grain, warm worn rim. */}
      <div
        className={`absolute inset-0 flex flex-col overflow-hidden ${paperTone}`}
        style={{
          clipPath: sheetClip(index, total),
          boxShadow: "inset 0 0 12px rgba(96,66,22,0.18)",
        }}
      >
        <PaperSurface />
        <span
          aria-hidden="true"
          data-level-shade={level.caseId}
          className="pointer-events-none absolute inset-0 bg-game-ink transition-opacity duration-200"
          style={{ opacity: restPose.shade }}
        />
        <span
          aria-hidden="true"
          className="absolute top-0 h-12"
          style={tabButtonBox(index, total)}
        >
          <span className={`block ${TAB_LABEL_CLASS}`}>
            <TabLabel level={level} />
          </span>
        </span>
        <Staple className="absolute left-3 top-14 h-3 w-8 -rotate-6" />
        {index % 2 === 1 && (
          <CoffeeRing className="absolute -right-4 bottom-16 h-24 w-24 -rotate-12" />
        )}
        <motion.div
          animate={isShaking ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
          transition={
            isShaking ? { duration: 0.32, ease: "easeInOut" } : { duration: 0 }
          }
          onAnimationComplete={() => {
            if (isShaking) onShakeDone();
          }}
          className="relative flex min-h-0 flex-1 flex-col gap-3 p-4 pt-[4.5rem]"
        >
          <div className="flex items-start justify-between gap-3">
            <span
              className={`text-ios-subheadline uppercase tabular-nums ${INK_TEXT_STRONG}`}
            >
              Màn {level.levelNumber}
            </span>
            {isGuide && (
              <RubberStamp tone="slate" className="-rotate-6">
                Hướng dẫn
              </RubberStamp>
            )}
            {comingSoon && (
              <RubberStamp tone="slate" className="-rotate-6">
                Sắp ra mắt
              </RubberStamp>
            )}
            {locked && (
              <RubberStamp tone="red" className="-rotate-6">
                Khóa
              </RubberStamp>
            )}
            {!isGuide && !locked && !comingSoon && (
              <div
                className="flex items-center gap-0.5"
                role="img"
                aria-label={`Đạt ${stars} trên 3 sao`}
              >
                {[1, 2, 3].map((n) =>
                  n <= stars ? (
                    <IoStar
                      key={n}
                      aria-hidden="true"
                      className="h-5 w-5 text-game-amber"
                    />
                  ) : (
                    <IoStarOutline
                      key={n}
                      aria-hidden="true"
                      className="h-5 w-5 text-game-ink/60"
                    />
                  ),
                )}
              </div>
            )}
          </div>

          <h3 className={`text-ios-title-2 leading-tight ${INK_TEXT_STRONG}`}>
            {level.levelTitle}
          </h3>
          <div
            aria-hidden="true"
            className="border-t border-dashed border-game-ink/40"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-4 bottom-20 top-[19rem]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, rgba(71,55,25,0.22) 27px, rgba(71,55,25,0.22) 28px)",
            }}
          />
          <div className="flex items-start justify-between gap-3">
            <p
              className={`min-w-0 flex-1 text-ios-callout leading-snug ${INK_TEXT}`}
            >
              {level.summary}
            </p>
            {!isGuide && (
              <div className="h-36 shrink-0 pr-1 pt-2">
                <AttachedPhoto
                  src={subjectPortraitUrl}
                  tilt="rotate-3"
                  className="h-full"
                />
              </div>
            )}
          </div>

          <div className="relative mt-auto flex flex-col gap-2">
            {locked && (
              <p
                className={`flex items-center gap-2 text-ios-footnote ${INK_TEXT}`}
              >
                <IoLockClosedOutline
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0"
                />
                <span>{levelLockHint(level)}</span>
              </p>
            )}
            {locked && lockedFeedback && (
              <p
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-game-crimson/50 bg-game-crimson/10 px-3 py-2 text-ios-caption-1 text-game-ink"
              >
                <IoAlertCircleOutline
                  aria-hidden="true"
                  className="mt-px h-4 w-4 shrink-0 text-game-crimson"
                />
                <span>{lockedFeedback}</span>
              </p>
            )}
            {(isGuide || comingSoon) && (
              <span
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-dashed border-game-ink/60 text-ios-subheadline uppercase tracking-widest ${INK_TEXT_SOFT}`}
              >
                Sắp có
              </span>
            )}
            {isActive && !isGuide && !locked && !comingSoon && (
              <button
                type="button"
                data-case-id={level.caseId}
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                }}
                className={`${CTA_PRIMARY} w-full active:scale-[0.98]`}
              >
                {isOngoing ? "Tiếp tục điều tra" : "Điều tra màn này"}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
