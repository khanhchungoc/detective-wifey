import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { IoChevronBackOutline, IoLockClosedOutline } from 'react-icons/io5';
import type { HusbandProfile, LevelCardItem } from '../../../shared/contracts/game-flow';
import { INK_TEXT_STRONG, PaperSurface } from './FolderParts';
import { CTA_SECONDARY } from './ctaStyles';
import { LevelFile } from './LevelFile';
import { SELECT_DEBOUNCE_MS, evaluateLevelCardClick, resolveDefaultLevelIndex } from './pagerLogic';
import { usePager } from './usePager';

interface LevelStageProps {
  husband: HusbandProfile;
  levels: LevelCardItem[];
  reduced: boolean;
  onBack: () => void;
  onSelectLevel: (level: LevelCardItem) => void;
  /** Test seam: starting file index. Defaults to the highest unlocked non-guide case. */
  initialIndex?: number;
}

const TAB_CLIP = 'polygon(0 100%, 0 32%, 9px 0, calc(100% - 9px) 0, 100% 32%, 100% 100%)';

export const LevelStage: React.FC<LevelStageProps> = ({
  husband,
  levels,
  reduced,
  onBack,
  onSelectLevel,
  initialIndex,
}) => {
  const [index, setIndex] = useState(() => initialIndex ?? resolveDefaultLevelIndex(levels));
  const [lockedFeedback, setLockedFeedback] = useState<string | null>(null);
  const [shakingId, setShakingId] = useState<string | null>(null);
  const [coverGone, setCoverGone] = useState(false);
  const lastSelectAtRef = useRef(-SELECT_DEBOUNCE_MS);

  const handleIndexChange = useCallback((next: number) => {
    setIndex(next);
    setLockedFeedback(null);
    setShakingId(null);
  }, []);

  const pager = usePager({ index, total: levels.length, reduced, onIndexChange: handleIndexChange });

  const handleLevelAction = useCallback(
    (level: LevelCardItem) => {
      const now = Date.now();
      const result = evaluateLevelCardClick(
        level,
        Boolean(husband.comingSoon),
        lastSelectAtRef.current,
        now,
      );
      if (result.action === 'locked') {
        setLockedFeedback(result.feedback);
        if (!reduced) setShakingId(level.caseId);
        return;
      }
      if (result.action === 'select') {
        lastSelectAtRef.current = now;
        setLockedFeedback(null);
        onSelectLevel(level);
      }
    },
    [husband.comingSoon, onSelectLevel, reduced],
  );

  const caseCode = husband.caseCode ?? 'HỒ SƠ';

  return (
    <section aria-label="Danh sách màn chơi" className="flex min-h-0 w-full flex-1 flex-col gap-2 py-3">
      <div className="flex shrink-0 items-center justify-between gap-3 px-4">
        <button
          type="button"
          onClick={onBack}
          className={`${CTA_SECONDARY} pl-2 pr-4`}
        >
          <IoChevronBackOutline aria-hidden="true" className="h-5 w-5" />
          Đổi hồ sơ
        </button>
        <div className="min-w-0 text-right">
          <p className="truncate font-dossier text-ios-subheadline font-bold text-game-text">{husband.displayName}</p>
          <p className="font-dossier text-ios-caption-1 font-bold uppercase text-game-text-secondary">{caseCode}</p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Danh sách màn"
        className="relative z-30 -mb-2 mx-4 flex shrink-0 items-end gap-1 pl-3 pt-1"
      >
        {levels.map((level, idx) => {
          const selected = idx === index;
          const locked = !level.unlocked && !level.isGuide;
          return (
            <button
              key={level.caseId}
              type="button"
              role="tab"
              data-level-tab={level.caseId}
              aria-selected={selected}
              onClick={() => pager.goTo(idx)}
              className={`relative touch-target-min inline-flex shrink-0 items-center justify-center gap-1.5 rounded-t-md px-4 text-ios-subheadline tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-text/80 ${
                selected ? 'min-h-14 -mb-3 pb-3' : 'min-h-11'
              }`}
            >
              <span aria-hidden="true" className="absolute inset-0 bg-game-manila-edge" style={{ clipPath: TAB_CLIP }} />
              <span
                aria-hidden="true"
                className={`absolute inset-x-px bottom-0 top-px ${selected ? (level.isGuide ? 'bg-game-paper-slip' : 'bg-game-manila') : 'bg-game-kraft'}`}
                style={{ clipPath: TAB_CLIP }}
              >
                <PaperSurface worn={false} />
              </span>
              <span className={`relative uppercase tracking-wider ${INK_TEXT_STRONG}`}>Màn {level.levelNumber}</span>
              {locked && <IoLockClosedOutline aria-label="Đã khóa" className="relative h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      {/*
        Stacking: this wrapper must NOT create a stacking context (no z-index, no perspective, no
        transform). Perspective/transform on the old wrapper trapped the flipping cover and pages
        inside its z-10 context, so the z-30 tab row painted over them. Now the static back board
        sits under the tabs (z-10) and the 3D layer (cover + pages) is a sibling above them (z-40)
        in the section context. The 3D layer ignores pointer events except on the pager surface,
        which starts below the tab overlap, so tabs stay tappable.
      */}
      <div className="relative mx-4 min-h-0 flex-1">
        <div className="absolute inset-0 z-10 rounded-xl rounded-tl-none border border-game-ink/30 bg-game-kraft shadow-[0_18px_32px_-12px_rgba(0,0,0,0.75)]">
          <PaperSurface />
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-40"
          style={{ perspective: reduced ? undefined : '1200px' }}
        >
          <div
            ref={pager.surfaceRef}
            {...pager.handlers}
            style={{ touchAction: 'pan-y' }}
            className="pointer-events-auto absolute inset-3 overflow-visible"
          >
            {levels.map((level, idx) => (
              <LevelFile
                key={level.caseId}
                level={level}
                subjectPortraitUrl={husband.portraitUrl}
                index={idx}
                isActive={idx === index}
                pos={pager.pos}
                reduced={reduced}
                lockedFeedback={idx === index ? lockedFeedback : null}
                isShaking={shakingId === level.caseId}
                onShakeDone={() => setShakingId(null)}
                onFileTap={() => {
                  if (pager.consumeDragClick()) return;
                  if (!level.unlocked && !level.isGuide) handleLevelAction(level);
                }}
                onStart={() => handleLevelAction(level)}
              />
            ))}
          </div>

          {!coverGone && (
            <motion.div
              aria-hidden="true"
              initial={{ rotateY: 0 }}
              animate={reduced ? { opacity: [1, 1, 0] } : { rotateY: -112 }}
              transition={{ duration: reduced ? 0.18 : 0.34, ease: 'easeInOut' }}
              onAnimationComplete={() => setCoverGone(true)}
              style={{ transformOrigin: 'left center', backfaceVisibility: 'hidden' }}
              className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-xl rounded-tl-none border border-game-ink/30 bg-game-manila shadow-[0_18px_32px_-12px_rgba(0,0,0,0.75)]"
            >
              <PaperSurface />
              <span className={`relative text-ios-title-2 uppercase tracking-wider ${INK_TEXT_STRONG}`}>{caseCode}</span>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
