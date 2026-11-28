import React from 'react';
import { motion, useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import type { HusbandProfile } from '../../../shared/contracts/game-flow';
import { ManilaWash, Paperclip, RedactedSilhouette, RedactionBar } from './FolderParts';

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

  return (
    <motion.div
      data-husband-id={isActive ? husband.husbandId : undefined}
      data-husband-folder={husband.husbandId}
      onClick={onActivate}
      style={{ x, rotateY, scale, opacity, zIndex }}
      className="absolute inset-y-0 left-0 right-0 mx-auto flex w-[78%] max-w-[22rem] flex-col will-change-transform select-none"
    >
      <div
        data-case-folder-tab="true"
        className="relative ml-3 flex h-8 w-fit items-center rounded-t-lg border border-b-0 border-game-paper-border bg-game-paper px-3 text-ios-caption-2 font-bold uppercase text-game-ink"
      >
        <ManilaWash />
        <span className="relative">{caseCode}</span>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col gap-3 rounded-xl rounded-tl-none border border-game-paper-border bg-game-paper p-3 shadow-[0_18px_32px_-12px_rgba(0,0,0,0.7)]">
        <ManilaWash />
        <Paperclip className="absolute -top-4 right-6 z-10 h-12 w-5 text-game-ink-secondary" />

        <div className="relative min-h-0 flex-1 overflow-hidden rounded-lg border border-game-ink/20 bg-game-backdrop">
          {comingSoon ? (
            <RedactedSilhouette className="absolute inset-0 h-full w-full" />
          ) : (
            <img
              src={husband.portraitUrl}
              alt={husband.displayName}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          )}
          <span
            data-case-status-stamp="true"
            data-coming-soon-stamp={comingSoon ? 'true' : undefined}
            className={`absolute bottom-3 right-3 -rotate-6 rounded-sm border-2 bg-game-paper/90 px-2 py-0.5 text-ios-caption-2 font-bold uppercase ${
              comingSoon
                ? 'border-game-ink-secondary text-game-ink-secondary'
                : 'border-game-crimson text-game-crimson'
            }`}
          >
            {comingSoon ? 'Sắp ra mắt' : 'Đang theo dõi'}
          </span>
        </div>

        <div className="relative flex shrink-0 flex-col gap-1">
          <h2 className="text-ios-title-2 font-bold leading-tight text-game-ink">
            {husband.displayName}
          </h2>
          {comingSoon ? (
            <>
              <span className="sr-only">Thông tin đang bị che</span>
              <RedactionBar className="mt-1 w-3/4" />
              <RedactionBar className="w-full" />
              <RedactionBar className="w-1/2" />
            </>
          ) : (
            <>
              <p className="text-ios-footnote leading-snug text-game-ink-secondary">
                {husband.age} tuổi · {husband.occupation}
              </p>
              <p className="mt-1 line-clamp-2 border-l-2 border-game-crimson/60 pl-2 text-ios-footnote italic leading-snug text-game-ink">
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
