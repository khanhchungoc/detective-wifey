import React from 'react';
import { motion, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { IoLockClosedOutline } from 'react-icons/io5';
import type { LevelCardItem } from '../../../shared/contracts/game-flow';
import { INK_TEXT_STRONG, PaperSurface } from './FolderParts';
import { TAB_H, TAB_W, TURNED_TAB_CLIP, tabButtonBox, tabShapeLeft, tabTurnedBox } from './tabShape';

export const TAB_LABEL_CLASS = `flex h-full items-center justify-center gap-1 whitespace-nowrap px-2 pb-1 pt-2 text-ios-footnote uppercase tabular-nums ${INK_TEXT_STRONG}`;

/** Label of a tab: "Màn N" plus a lock when the case is locked. */
export const TabLabel: React.FC<{ level: LevelCardItem }> = ({ level }) => (
  <>
    {`Màn ${level.levelNumber}`}
    {!level.unlocked && !level.isGuide && (
      <IoLockClosedOutline aria-label="Đã khóa" className="h-3 w-3 shrink-0" />
    )}
  </>
);

interface LevelTabProps {
  level: LevelCardItem;
  index: number;
  total: number;
  selected: boolean;
  flip: MotionValue<number>;
  onSelect: () => void;
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/**
 * Tappable tab of ONE sheet. While the sheet lies on the stack its tab is part of the sheet's own
 * silhouette (see LevelFile) and the label turns with it. Once the sheet is turned over, this
 * component draws the tab left behind: plain darker paper tucked behind the sheet in front, with the
 * label. The button owns only the part of the tab not covered by the tab in front.
 */
export const LevelTab: React.FC<LevelTabProps> = ({ level, index, total, selected, flip, onSelect }) => {
  const box = tabButtonBox(index, total);
  const turnedBox = tabTurnedBox(index, total);
  const left = useTransform(flip, (f) => (f >= 0.5 ? turnedBox.left : box.left));
  const width = useTransform(flip, (f) => (f >= 0.5 ? turnedBox.width : box.width));
  const paper = level.isGuide ? 'bg-game-paper-slip' : 'bg-game-manila';
  const shown = useTransform(flip, (f) => clamp01((f - 0.5) * 2));
  const darker = useTransform(flip, (f) => 0.16 * f);
  // The turning sheet's tab paints above everything, then settles behind the sheets (turned tabs: higher index in front).
  const zVisual = useTransform(flip, (f) => (f > 0 && f < 1 ? 101 : 1 + Math.min(index, 3)));

  return (
    <>
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute top-4"
        style={{
          left: tabShapeLeft(index, total),
          width: TAB_W,
          height: `calc(${TAB_H} + 4px)`,
          opacity: shown,
          zIndex: zVisual,
          filter: 'drop-shadow(0 0 0.75px rgba(50,36,14,0.55))',
        }}
      >
        <span className={`absolute inset-0 ${paper}`} style={{ clipPath: TURNED_TAB_CLIP }}>
          <PaperSurface worn={false} />
          <motion.span className="absolute inset-0 bg-game-ink" style={{ opacity: darker }} />
        </span>
      </motion.span>
      <motion.button
        type="button"
        role="tab"
        data-level-tab={level.caseId}
        aria-selected={selected}
        onClick={onSelect}
        style={{ left, width }}
        className={`pointer-events-auto absolute top-4 z-30 touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-text/80 ${
          selected ? 'h-14' : 'h-12'
        }`}
      >
        <motion.span className={`block ${TAB_LABEL_CLASS}`} style={{ opacity: shown }}>
          <TabLabel level={level} />
        </motion.span>
      </motion.button>
    </>
  );
};
