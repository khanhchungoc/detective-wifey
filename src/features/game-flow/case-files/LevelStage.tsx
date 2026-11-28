import React, { useCallback, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { IoChevronBackOutline, IoLockClosedOutline } from 'react-icons/io5';
import type { HusbandProfile, LevelCardItem } from '../../../shared/contracts/game-flow';
import { ManilaWash } from './FolderParts';
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
          className="touch-target-min inline-flex items-center gap-1 rounded-xl border border-white/10 bg-game-dossier py-2 pl-2 pr-4 text-ios-subheadline font-medium text-game-text hover:bg-game-elevated active:scale-95 transition-[transform,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
        >
          <IoChevronBackOutline aria-hidden="true" className="h-5 w-5" />
          Đổi hồ sơ
        </button>
        <div className="min-w-0 text-right">
          <p className="truncate text-ios-subheadline font-semibold text-game-text">{husband.displayName}</p>
          <p className="text-ios-caption-1 uppercase text-game-text-secondary">{caseCode}</p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Danh sách màn"
        className="flex shrink-0 items-end gap-1.5 overflow-x-auto px-4 pt-1"
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
              className={`relative touch-target-min inline-flex shrink-0 items-center justify-center gap-1.5 rounded-t-lg border border-b-0 px-4 text-ios-subheadline font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70 ${
                selected
                  ? 'min-h-12 border-game-paper-border bg-game-paper text-game-ink'
                  : 'min-h-11 border-white/10 bg-game-dossier text-game-text-secondary'
              }`}
            >
              Màn {level.levelNumber}
              {locked && <IoLockClosedOutline aria-label="Đã khóa" className="h-3.5 w-3.5" />}
            </button>
          );
        })}
      </div>

      <div
        className="relative mx-4 -mt-2 min-h-0 flex-1"
        style={{ perspective: reduced ? undefined : '1200px' }}
      >
        <div className="absolute inset-0 rounded-xl rounded-tl-none border border-game-paper-border bg-game-paper shadow-[0_18px_32px_-12px_rgba(0,0,0,0.7)]">
          <ManilaWash />
        </div>

        <div
          ref={pager.surfaceRef}
          {...pager.handlers}
          style={{ touchAction: 'pan-y' }}
          className="absolute inset-3 overflow-visible"
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
            initial={{ rotateY: 0, opacity: 1 }}
            animate={reduced ? { opacity: 0 } : { rotateY: -112, opacity: [1, 1, 0] }}
            transition={{ duration: reduced ? 0.15 : 0.32, ease: 'easeInOut' }}
            onAnimationComplete={() => setCoverGone(true)}
            style={{ transformOrigin: 'left center' }}
            className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center rounded-xl rounded-tl-none border border-game-paper-border bg-game-paper shadow-[0_18px_32px_-12px_rgba(0,0,0,0.7)]"
          >
            <ManilaWash />
            <span className="relative text-ios-title-2 font-bold uppercase text-game-ink-secondary">{caseCode}</span>
          </motion.div>
        )}
      </div>
    </section>
  );
};
