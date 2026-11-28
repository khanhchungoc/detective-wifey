import React from 'react';
import { motion, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { IoLockClosedOutline } from 'react-icons/io5';
import type { LevelCardItem } from '../../../shared/contracts/game-flow';
import { INK_TEXT_STRONG, PaperSurface } from './FolderParts';

/** Tab outline: sloped shoulders, open at the bottom so it flows into its own sheet. */
const TAB_CLIP = 'polygon(0 100%, 0 32%, 9px 0, calc(100% - 9px) 0, 100% 32%, 100% 100%)';
/** Full tab width (Tailwind w-24). Tabs are staggered across the sheet width and overlap each other. */
const TAB_W = '6rem';

interface LevelTabProps {
  level: LevelCardItem;
  index: number;
  total: number;
  selected: boolean;
  flip: MotionValue<number>;
  onSelect: () => void;
}

/**
 * The index tab of ONE sheet. It uses the sheet's paper and joins the sheet's top edge without a
 * line. The button only owns the part of the tab that is not covered by the tab in front (so hit
 * areas never fight); the paper shape extends left under that tab.
 */
export const LevelTab: React.FC<LevelTabProps> = ({ level, index, total, selected, flip, onSelect }) => {
  const locked = !level.unlocked && !level.isGuide;
  const paper = level.isGuide ? 'bg-game-paper-slip' : 'bg-game-manila';
  const span = `(100% - ${TAB_W})`;
  const step = total > 1 ? `calc(${span} / ${total - 1})` : TAB_W;
  const first = index === 0 || total <= 1;
  // The turning sheet's tab must paint above everything, then settle back into the tab row.
  const zIndex = useTransform(flip, (f) => (f > 0 && f < 1 ? 101 : 30 - Math.min(index, 20)));
  const turned = useTransform(flip, (f) => 0.16 * f);
  const dip = useTransform(flip, (f) => (f >= 1 ? 3 : Math.sin(Math.PI * f) * 3 + f * 3));

  return (
    <motion.button
      type="button"
      role="tab"
      data-level-tab={level.caseId}
      aria-selected={selected}
      onClick={onSelect}
      style={{
        left: first ? 0 : `calc(${span} * ${index / (total - 1)} + ${TAB_W} - ${step})`,
        width: first ? TAB_W : step,
        zIndex,
        y: dip,
      }}
      className={`pointer-events-auto absolute -bottom-0.5 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-text/80 ${
        selected ? 'h-14' : 'h-12'
      }`}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-24"
        style={{ filter: 'drop-shadow(-2px 0 1.5px rgba(40,28,10,0.28))' }}
      >
        <span className="absolute inset-0 bg-game-ink/45" style={{ clipPath: TAB_CLIP }} />
        <span className={`absolute inset-x-px bottom-0 top-px ${paper}`} style={{ clipPath: TAB_CLIP }}>
          <PaperSurface worn={false} />
          <motion.span className="absolute inset-0 bg-game-ink" style={{ opacity: turned }} />
        </span>
      </span>
      <span className={`relative flex h-full items-center justify-center gap-1 whitespace-nowrap px-2 pb-1 pt-2 text-ios-footnote uppercase tabular-nums ${INK_TEXT_STRONG}`}>
        {`Màn ${level.levelNumber}`}
        {locked && <IoLockClosedOutline aria-label="Đã khóa" className="h-3 w-3 shrink-0" />}
      </span>
    </motion.button>
  );
};
