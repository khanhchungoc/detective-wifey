import React from 'react';
import { IoChevronBackOutline, IoChevronForwardOutline } from 'react-icons/io5';
import type { HusbandProfile } from '../../../shared/contracts/game-flow';
import { HusbandFolder } from './HusbandFolder';
import { usePager } from './usePager';

interface HusbandStageProps {
  husbands: HusbandProfile[];
  activeIndex: number;
  reduced: boolean;
  onIndexChange: (index: number) => void;
  onOpen: () => void;
}

const NAV_BUTTON =
  'touch-target-min shrink-0 inline-flex items-center justify-center rounded-xl bg-game-dossier text-game-text-secondary border border-white/10 hover:bg-game-elevated hover:text-game-text active:scale-95 transition-[transform,color,background-color] disabled:opacity-30 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70';

export const HusbandStage: React.FC<HusbandStageProps> = ({
  husbands,
  activeIndex,
  reduced,
  onIndexChange,
  onOpen,
}) => {
  const pager = usePager({
    index: activeIndex,
    total: husbands.length,
    reduced,
    strideRatio: 0.69,
    onIndexChange,
  });
  const canCycle = husbands.length > 1;

  return (
    <section
      aria-label="Chọn hồ sơ chồng"
      className="flex min-h-0 w-full flex-1 flex-col gap-3 py-4"
    >
      <div
        ref={pager.surfaceRef}
        {...pager.handlers}
        style={{ touchAction: 'pan-y' }}
        className="relative min-h-0 w-full flex-1 overflow-hidden px-1"
      >
        {husbands.map((husband, idx) => (
          <HusbandFolder
            key={husband.husbandId}
            husband={husband}
            index={idx}
            offset={idx - activeIndex}
            isActive={idx === activeIndex}
            reduced={reduced}
            cardRef={pager.registerCard(idx)}
            onActivate={() => {
              if (pager.consumeDragClick()) return;
              if (idx === activeIndex) {
                if (!husband.comingSoon) onOpen();
              } else {
                pager.goTo(idx);
              }
            }}
          />
        ))}
      </div>

      <div className="mx-auto flex w-full max-w-md shrink-0 flex-col gap-2 px-4">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => pager.goTo(activeIndex - 1)}
            disabled={!canCycle || activeIndex === 0}
            aria-label="Chồng trước"
            className={NAV_BUTTON}
          >
            <IoChevronBackOutline className="h-5 w-5" />
          </button>

          {canCycle ? (
            <div className="flex items-center justify-center" role="tablist" aria-label="Danh sách chồng">
              {husbands.map((husband, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={husband.husbandId}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Hồ sơ ${idx + 1}: ${husband.displayName}`}
                    onClick={() => pager.goTo(idx)}
                    className="touch-target-min inline-flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
                  >
                    <span
                      aria-hidden="true"
                      className={`block h-1.5 w-6 rounded-full transition-[transform,opacity,background-color] duration-200 ${
                        isActive
                          ? 'bg-game-crimson scale-x-100 opacity-100'
                          : 'bg-game-text-muted scale-x-50 opacity-50'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <span aria-hidden="true" />
          )}

          <button
            type="button"
            onClick={() => pager.goTo(activeIndex + 1)}
            disabled={!canCycle || activeIndex === husbands.length - 1}
            aria-label="Chồng tiếp theo"
            className={NAV_BUTTON}
          >
            <IoChevronForwardOutline className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
