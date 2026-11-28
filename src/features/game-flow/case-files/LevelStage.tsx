import React, { useCallback, useEffect, useRef, useState } from 'react';
import { IoChevronBackOutline } from 'react-icons/io5';
import type { HusbandProfile, LevelCardItem } from '../../../shared/contracts/game-flow';
import { INK_TEXT_STRONG, PaperSurface } from './FolderParts';
import { LevelTab } from './LevelTab';
import { CTA_SECONDARY } from './ctaStyles';
import { LevelFile } from './LevelFile';
import {
  SELECT_DEBOUNCE_MS,
  evaluateLevelCardClick,
  resolveDefaultLevelIndex,
  resolveSheetRestPose,
} from './pagerLogic';
import { useBinder } from './useBinder';

const COVER_OPEN_MS = 640;
const COVER_REDUCED_MS = 200;
const COVER_OPEN_EASE = 'cubic-bezier(0.45, 0, 0.25, 1)';

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
  const coverRef = useRef<HTMLDivElement | null>(null);
  const lastSelectAtRef = useRef(-SELECT_DEBOUNCE_MS);

  // Wait one painted frame so the closed manila cover is visible before swinging open on the compositor.
  useEffect(() => {
    if (coverGone) return undefined;
    const el = coverRef.current;
    if (!el || typeof el.animate !== 'function') {
      setCoverGone(true);
      return undefined;
    }

    let anim: Animation | null = null;
    const rafId = requestAnimationFrame(() => {
      anim = reduced
        ? el.animate([{ opacity: 1 }, { opacity: 0 }], {
            duration: COVER_REDUCED_MS,
            easing: 'ease-in-out',
            fill: 'forwards',
          })
        : el.animate(
            [
              { transform: 'rotateY(0deg)', opacity: 1, offset: 0 },
              { transform: 'rotateY(-84deg)', opacity: 1, offset: 0.78 },
              { transform: 'rotateY(-108deg)', opacity: 0, offset: 1 },
            ],
            {
              duration: COVER_OPEN_MS,
              easing: COVER_OPEN_EASE,
              fill: 'forwards',
            },
          );
      anim.onfinish = () => setCoverGone(true);
    });

    return () => {
      cancelAnimationFrame(rafId);
      anim?.cancel();
    };
  }, [coverGone, reduced]);

  const handleIndexChange = useCallback((next: number) => {
    setIndex(next);
    setLockedFeedback(null);
    setShakingId(null);
  }, []);

  const binder = useBinder({ index, total: levels.length, reduced, onIndexChange: handleIndexChange });

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

      {/*
        Stacking: this wrapper must NOT create a stacking context. The static back board sits at z-10;
        the stack layer above it holds the tab hit targets and the sheets. Every sheet and its
        matching transparent tab button share the same per-sheet zIndex (active = 30, behind = 20 - dist),
        and the folder cover sits at z-200 while opening.
      */}
      <div className="relative mx-4 min-h-0 flex-1">
        <div className="absolute inset-x-0 bottom-0 top-12 z-10 rounded-xl border border-game-ink/30 bg-game-kraft shadow-[0_18px_32px_-12px_rgba(0,0,0,0.75)]">
          <PaperSurface />
        </div>

        <div
          className="pointer-events-none absolute inset-0 z-40"
          style={{ perspective: !coverGone && !reduced ? '1200px' : undefined }}
        >
          <div role="tablist" aria-label="Danh sách màn" className="pointer-events-none absolute inset-x-3 top-0 z-40 h-16">
            {levels.map((level, idx) => (
              <LevelTab
                key={level.caseId}
                level={level}
                index={idx}
                total={levels.length}
                selected={idx === index}
                zIndex={resolveSheetRestPose(idx, index).zIndex}
                onSelect={() => binder.goTo(idx)}
              />
            ))}
          </div>

          <div
            ref={binder.surfaceRef}
            {...binder.handlers}
            style={{ touchAction: 'pan-y' }}
            className="pointer-events-auto absolute inset-x-3 bottom-3 top-16 overflow-visible"
          >
            {levels.map((level, idx) => (
              <LevelFile
                key={level.caseId}
                level={level}
                subjectPortraitUrl={husband.portraitUrl}
                index={idx}
                total={levels.length}
                isActive={idx === index}
                restPose={resolveSheetRestPose(idx, index)}
                sheetRef={binder.registerSheet(idx)}
                lockedFeedback={idx === index ? lockedFeedback : null}
                isShaking={shakingId === level.caseId}
                onShakeDone={() => setShakingId(null)}
                onFileTap={() => {
                  if (binder.consumeDragClick()) return;
                  if (!level.unlocked && !level.isGuide) handleLevelAction(level);
                }}
                onStart={() => handleLevelAction(level)}
              />
            ))}
          </div>

          {!coverGone && (
            <div
              ref={coverRef}
              aria-hidden="true"
              style={{
                transformOrigin: 'left center',
                backfaceVisibility: 'hidden',
                zIndex: 200,
                willChange: 'transform, opacity',
              }}
              className="pointer-events-none absolute inset-x-0 bottom-0 top-12 flex items-center justify-center rounded-xl border border-game-ink/30 bg-game-manila shadow-[0_18px_32px_-12px_rgba(0,0,0,0.75)]"
            >
              <PaperSurface />
              <span className={`relative text-ios-title-2 uppercase ${INK_TEXT_STRONG}`}>{caseCode}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
