import React from 'react';
import { motion, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { HusbandProfile } from '../../../shared/contracts/game-flow';
import {
  AttachedPhoto,
  CoffeeRing,
  LabelStrip,
  PaperSurface,
  RedactionBar,
  RubberStamp,
  Staple,
} from './FolderParts';

interface HusbandFolderProps {
  husband: HusbandProfile;
  index: number;
  isActive: boolean;
  pos: MotionValue<number>;
  reduced: boolean;
  onActivate: () => void;
}

/** Slot width in percent of the folder width between neighbours. */
const SLOT_PCT = 88;

export const HusbandFolder: React.FC<HusbandFolderProps> = ({
  husband,
  index,
  isActive,
  pos,
  reduced,
  onActivate,
}) => {
  const offset = useTransform(pos, (p) => index - p);
  const x = useTransform(offset, (o) => (reduced ? '0%' : `${o * SLOT_PCT}%`));
  const rotateY = useTransform(offset, (o) => (reduced ? 0 : Math.max(-60, Math.min(60, -o * 38))));
  const scale = useTransform(offset, (o) => (reduced ? 1 : 1 - Math.min(Math.abs(o), 1.5) * 0.14));
  const opacity = useTransform(offset, (o) =>
    reduced ? Math.max(0, 1 - Math.abs(o) * 1.4) : Math.max(0, 1 - Math.max(0, Math.abs(o) - 1) * 1.2),
  );
  const dim = useTransform(offset, (o) => (reduced ? 0 : Math.min(0.55, Math.abs(o) * 0.55)));
  const zIndex = useTransform(offset, (o) => 20 - Math.round(Math.abs(o) * 5));

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
    <motion.div
      role={isActive ? 'button' : undefined}
      tabIndex={isActive && !comingSoon ? 0 : -1}
      aria-label={isActive ? `Mở hồ sơ ${husband.displayName}` : undefined}
      aria-disabled={isActive && comingSoon ? true : undefined}
      data-husband-id={isActive ? husband.husbandId : undefined}
      data-husband-folder={husband.husbandId}
      onClick={onActivate}
      onKeyDown={isActive ? onKeyDown : undefined}
      style={{ x, rotateY, scale, opacity, zIndex }}
      className={`absolute inset-y-0 left-0 right-0 mx-auto flex w-[86%] max-w-[24rem] flex-col will-change-transform select-none rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-text/80 ${
        isActive && !comingSoon ? 'cursor-pointer' : ''
      }`}
    >
      <div
        data-case-folder-tab="true"
        className="relative ml-3 flex h-8 w-fit items-center border border-b-0 border-game-ink/25 bg-game-manila px-4 font-dossier text-ios-caption-2 font-extrabold uppercase text-game-ink"
        style={{
          clipPath: 'polygon(0 100%, 0 30%, 10px 0, calc(100% - 10px) 0, 100% 30%, 100% 100%)',
        }}
      >
        <PaperSurface worn={false} />
        <span className="relative">{caseCode}</span>
      </div>

      <div
        className="relative flex min-h-0 flex-1 flex-col gap-3 rounded-xl rounded-tl-none border border-game-ink/25 bg-game-manila p-4 shadow-[0_18px_32px_-12px_rgba(0,0,0,0.75)]"
      >
        <PaperSurface />
        <Staple className="absolute left-3 top-2.5 h-3 w-8 -rotate-12" />
        <CoffeeRing className="absolute -bottom-3 -right-3 h-24 w-24 rotate-12" />

        <LabelStrip className="-rotate-1">
          <h2 className="font-dossier text-ios-title-2 font-extrabold uppercase leading-tight text-game-ink">
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
              <p className="text-ios-footnote font-medium leading-snug text-game-ink">
                {husband.age} tuổi · {husband.occupation}
              </p>
              <p className="line-clamp-2 -rotate-1 font-handwriting text-ios-footnote leading-snug text-game-ink">
                {husband.teaserQuote}
              </p>
            </>
          )}
        </div>
      </div>

      <motion.span
        aria-hidden="true"
        style={{ opacity: dim }}
        className="pointer-events-none absolute inset-0 rounded-xl bg-game-backdrop"
      />
    </motion.div>
  );
};
