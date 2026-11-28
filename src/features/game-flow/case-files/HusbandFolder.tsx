import React from 'react';
import type { HusbandProfile } from '../../../shared/contracts/game-flow';
import {
  AttachedPhoto,
  CoffeeRing,
  INK_TEXT,
  INK_TEXT_STRONG,
  LabelStrip,
  PaperSurface,
  RedactionBar,
  RubberStamp,
  Staple,
  folderTabClip,
  paperEdgeMaskStyle,
} from './FolderParts';
import { husbandCardOpacity, husbandCardTransform, husbandCardZIndex } from './usePager';

interface HusbandFolderProps {
  husband: HusbandProfile;
  index: number;
  offset: number;
  isActive: boolean;
  reduced: boolean;
  cardRef: (el: HTMLDivElement | null) => void;
  onActivate: () => void;
}

export const HusbandFolder: React.FC<HusbandFolderProps> = ({
  husband,
  index,
  offset,
  isActive,
  reduced,
  cardRef,
  onActivate,
}) => {
  const comingSoon = Boolean(husband.comingSoon);
  const caseCode = husband.caseCode ?? `HỒ SƠ #${String(index + 1).padStart(2, '0')}`;

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <div
      ref={cardRef}
      role={isActive ? 'button' : undefined}
      tabIndex={isActive && !comingSoon ? 0 : -1}
      aria-label={isActive ? `Mở hồ sơ ${husband.displayName}` : undefined}
      aria-disabled={isActive && comingSoon ? true : undefined}
      data-husband-id={isActive ? husband.husbandId : undefined}
      data-husband-folder={husband.husbandId}
      onClick={onActivate}
      onKeyDown={isActive ? onKeyDown : undefined}
      style={{
        transform: husbandCardTransform(offset, reduced),
        opacity: husbandCardOpacity(offset, reduced),
        zIndex: husbandCardZIndex(offset),
        contain: 'layout paint',
        backfaceVisibility: 'hidden',
      }}
      className={`absolute inset-y-0 left-0 right-0 mx-auto flex w-[86%] max-w-[24rem] flex-col will-change-transform select-none rounded-[4px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-text/80 ${
        isActive && !comingSoon ? 'cursor-pointer' : ''
      }`}
    >
      <div
        data-case-folder-tab="true"
        className="relative z-10 -mb-[2px] ml-2 flex h-8 w-fit items-center bg-game-manila px-4 text-ios-caption-1 uppercase tracking-wider text-game-ink"
        style={{
          clipPath: folderTabClip(index),
        }}
      >
        <PaperSurface worn={false} />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to bottom, rgba(255,249,236,0.34) 0px, rgba(118,82,30,0.14) 3px, transparent 10px)',
          }}
        />
        <span className={`relative ${INK_TEXT}`}>{caseCode}</span>
        <span
          aria-hidden="true"
          style={{ opacity: isActive ? 0 : 0.45 }}
          className="pointer-events-none absolute inset-0 bg-game-backdrop transition-opacity duration-300"
        />
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* Soft ambient shadow behind the masked cardstock body without per-frame filter cost. */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-[2px] rounded-[4px] shadow-[0_16px_30px_-10px_rgba(0,0,0,0.72)]"
        />
        <div
          style={paperEdgeMaskStyle(index, { sharpTopLeft: true })}
          className="relative flex min-h-0 flex-1 flex-col gap-3 rounded-[4px] rounded-tl-none bg-game-manila p-4"
        >
          <PaperSurface />
          <Staple className="absolute left-3 top-2.5 h-3 w-8 -rotate-12" />
          <CoffeeRing className="absolute -bottom-3 -right-3 h-24 w-24 rotate-12" />

          <LabelStrip className="-rotate-1">
            <h2 className={`text-ios-title-3 uppercase leading-tight ${INK_TEXT_STRONG}`}>
              {husband.displayName}
            </h2>
          </LabelStrip>

          <div className="relative flex min-h-0 flex-1 items-center justify-center pt-3">
            <AttachedPhoto src={comingSoon ? null : husband.portraitUrl} className="h-full" />
            <RubberStamp
              tone={comingSoon ? 'slate' : 'red'}
              dataAttrs={{
                'data-case-status-stamp': 'true',
                'data-coming-soon-stamp': comingSoon ? 'true' : undefined,
              }}
              className="absolute bottom-2 right-0 -rotate-12 bg-game-paper/40"
            >
              {comingSoon ? 'Sắp ra mắt' : 'Đang theo dõi'}
            </RubberStamp>
          </div>

          <div className="relative flex shrink-0 flex-col gap-1">
            {comingSoon ? (
              <>
                <span className="sr-only">Thông tin đang bị che</span>
                <RedactionBar className="w-3/4" />
                <RedactionBar className="w-full" />
                <RedactionBar className="w-1/2" />
              </>
            ) : (
              <>
                <p className={`text-ios-footnote leading-snug ${INK_TEXT}`}>
                  {husband.age} tuổi · {husband.occupation}
                </p>
                <p className={`line-clamp-2 text-ios-footnote leading-snug ${INK_TEXT}`}>
                  {husband.teaserQuote}
                </p>
              </>
            )}
          </div>

          <span
            aria-hidden="true"
            style={{ opacity: isActive ? 0 : 0.45 }}
            className="pointer-events-none absolute inset-0 bg-game-backdrop transition-opacity duration-300"
          />
        </div>
      </div>
    </div>
  );
};
