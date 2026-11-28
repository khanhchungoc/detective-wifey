import React, { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { IoVolumeHighOutline, IoVolumeMuteOutline } from 'react-icons/io5';
import type { HusbandProfile, LevelCardItem } from '../../shared/contracts/game-flow';
import { HusbandStage } from './case-files/HusbandStage';
import { LevelStage } from './case-files/LevelStage';
import { clampPageIndex, resolveInitialHusbandIndex } from './case-files/pagerLogic';

export {
  DRAG_START_PX,
  FLICK_VELOCITY_PX_S,
  LOCKED_LEVEL_FEEDBACK,
  PAGE_TURN_RATIO,
  SELECT_DEBOUNCE_MS,
  applyRubberBand,
  canStartLevel,
  clampPageIndex,
  evaluateLevelCardClick,
  resolveDefaultLevelIndex,
  resolveInitialHusbandIndex,
  resolvePagerTarget,
} from './case-files/pagerLogic';

export interface LevelSelectorHubProps {
  husbands: HusbandProfile[];
  levels: LevelCardItem[];
  initialHusbandId?: string;
  isMuted?: boolean;
  onToggleMute?: () => void;
  onSelectLevel: (level: LevelCardItem) => void;
}

type SelectorStage = 'husbands' | 'levels';

export const LevelSelectorHub: React.FC<LevelSelectorHubProps> = ({
  husbands,
  levels,
  initialHusbandId,
  isMuted = false,
  onToggleMute,
  onSelectLevel,
}) => {
  const reduced = Boolean(useReducedMotion());
  const [stage, setStage] = useState<SelectorStage>('husbands');
  const [husbandIndex, setHusbandIndex] = useState(() =>
    resolveInitialHusbandIndex(husbands, initialHusbandId),
  );

  const safeIndex = clampPageIndex(husbandIndex, husbands.length);
  const activeHusband = husbands[safeIndex] ?? null;

  const husbandLevels = useMemo(() => {
    if (!activeHusband) return [];
    return levels
      .filter((lvl) => lvl.husbandId === activeHusband.husbandId)
      .sort((a, b) => a.levelNumber - b.levelNumber);
  }, [levels, activeHusband]);

  const openFolder = useCallback(() => {
    if (activeHusband && !activeHusband.comingSoon) setStage('levels');
  }, [activeHusband]);
  const closeFolder = useCallback(() => setStage('husbands'), []);

  const fade = reduced
    ? { duration: 0.12 }
    : { duration: 0.12, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

  return (
    <div
      className="flex h-[100dvh] w-full flex-col overflow-hidden bg-game-canvas font-sans text-game-text"
      data-screen="level-selector-hub"
      data-selector-stage={stage}
    >
      <header className="w-full shrink-0 border-b border-white/10 bg-game-backdrop">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-4 py-3 md:px-8">
          <h1 className="text-ios-headline font-semibold leading-tight text-game-text">Hồ sơ vụ án</h1>

          {onToggleMute && (
            <button
              type="button"
              onClick={onToggleMute}
              aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              aria-pressed={isMuted}
              className="touch-target-min inline-flex shrink-0 items-center justify-center rounded-xl border border-white/10 bg-game-dossier text-game-text-secondary transition-[transform,color,background-color] hover:bg-game-elevated hover:text-game-text active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
            >
              {isMuted ? (
                <IoVolumeMuteOutline className="h-5 w-5" />
              ) : (
                <IoVolumeHighOutline className="h-5 w-5 text-game-text" />
              )}
            </button>
          )}
        </div>
      </header>

      <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col">
        <AnimatePresence mode="wait" initial={false}>
          {stage === 'husbands' || !activeHusband ? (
            <motion.div
              key="husbands"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="flex min-h-0 flex-1 flex-col"
            >
              <HusbandStage
                husbands={husbands}
                activeIndex={safeIndex}
                reduced={reduced}
                onIndexChange={setHusbandIndex}
                onOpen={openFolder}
              />
            </motion.div>
          ) : (
            <motion.div
              key="levels"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={fade}
              className="flex min-h-0 flex-1 flex-col"
            >
              <LevelStage
                husband={activeHusband}
                levels={husbandLevels}
                reduced={reduced}
                onBack={closeFolder}
                onSelectLevel={onSelectLevel}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
