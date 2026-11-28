import React from 'react';
import { IoLockClosedOutline } from 'react-icons/io5';
import type { LevelCardItem } from '../../../shared/contracts/game-flow';
import { INK_TEXT_STRONG } from './FolderParts';
import { tabButtonBox } from './tabShape';

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
  zIndex: number;
  onSelect: () => void;
}

/**
 * Transparent accessible tab hit target aligned directly over the sheet's real cut tab
 * (`sheetClip` in `LevelFile`). Mirrors the sheet's `zIndex` so tapping any visible portion of any
 * tab activates that exact sheet.
 */
export const LevelTab: React.FC<LevelTabProps> = ({
  level,
  index,
  total,
  selected,
  zIndex,
  onSelect,
}) => {
  const box = tabButtonBox(index, total);

  return (
    <button
      type="button"
      role="tab"
      data-level-tab={level.caseId}
      aria-selected={selected}
      aria-label={`Màn ${level.levelNumber}: ${level.levelTitle}`}
      onClick={onSelect}
      style={{ left: box.left, width: box.width, zIndex }}
      className={`pointer-events-auto absolute top-4 touch-manipulation rounded-t-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-text/80 ${
        selected ? 'h-14' : 'h-12'
      }`}
    />
  );
};
