import React, { useEffect, useRef } from 'react';
import {
  IoScaleOutline,
  IoWarningOutline,
  IoSearchOutline,
  IoStar,
  IoStarOutline,
  IoTrophyOutline,
  IoShareSocialOutline,
  IoLockOpenOutline,
  IoCloseOutline,
} from 'react-icons/io5';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import { HusbandCharacterImage } from './HusbandCharacterImage';
import type { ConfrontationEvaluationResult } from '../confrontationEngine';

export interface ConfrontationModalProps {
  isOpen: boolean;
  evaluation: ConfrontationEvaluationResult;
  maxStrikes: number;
  onContinueInvestigation: () => void;
  onForgiveAndAdvance?: () => void;
  onShareRoastCard?: () => void;
  onClose: () => void;
}

export const ConfrontationModal: React.FC<ConfrontationModalProps> = ({
  isOpen,
  evaluation,
  maxStrikes,
  onContinueInvestigation,
  onForgiveAndAdvance,
  onShareRoastCard,
  onClose,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    if (evaluation.isMaxStrikesReached) return;
    onContinueInvestigation();
    onClose();
  };

  const swipeHandlers = useSwipeBack({
    onBack: handleBack,
    enabled: isOpen && !evaluation.isMaxStrikesReached,
  });

  useEffect(() => {
    if (!isOpen) return;
    const firstButton = dialogRef.current?.querySelector<HTMLButtonElement>('button:not([disabled])');
    firstButton?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  const {
    stars,
    verifiedSmokingGunCount,
    requiredSmokingGunCount,
    husbandName,
    husbandDialogue,
    husbandMood,
    wifeTitle,
    narrativeRoast,
    isMaxStrikesReached,
    newStrikesRemaining,
  } = evaluation;

  // Mood label and visual badge
  const moodLabels = {
    confident: 'Khoanh tay, tự tin',
    surprised: 'Hơi giật mình, phân bua',
    nervous: 'Gãi đầu, toát mồ hôi',
    broken: 'Cúi đầu, nhận tội',
  };

  const currentMoodText = moodLabels[husbandMood] || 'Phòng thủ';

  // Calculate used strikes for visual meter
  const usedStrikes = Math.max(0, maxStrikes - newStrikesRemaining);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confrontation-title"
      className="absolute inset-0 z-[80] flex flex-col bg-slate-950/95 backdrop-blur-xl text-white select-none animate-fadeIn overflow-y-auto"
      {...swipeHandlers}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-[420px] mx-auto min-h-full p-4 flex flex-col justify-between"
      >
        {/* Top Header */}
        <header className="flex flex-col items-center gap-2 pt-2 pb-3 border-b border-white/10 relative">
          {!isMaxStrikesReached && (
            <button
              type="button"
              onClick={handleBack}
              aria-label="Đóng đối chất"
              className="absolute left-0 top-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 transition-all cursor-pointer"
            >
              <IoCloseOutline className="text-xl" />
            </button>
          )}

          <div className="flex items-center gap-2 text-rose-400">
            <IoScaleOutline className="text-2xl" />
            <h2 id="confrontation-title" className="text-lg font-bold tracking-tight uppercase">
              Đối chất chồng {husbandName}
            </h2>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-slate-300 font-medium">
            <span>Tiến độ chứng cứ cốt lõi:</span>
            <span className="font-bold text-amber-400">
              {verifiedSmokingGunCount}/{requiredSmokingGunCount}
            </span>
          </div>
        </header>

        {/* Center Content: Character Avatar & Dialogue Speech Bubble */}
        <div className="flex-1 flex flex-col items-center justify-center py-5 space-y-4">
          {/* Character Avatar Representation */}
          <div className="flex flex-col items-center gap-2">
            <HusbandCharacterImage mood={husbandMood} size={140} />

            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-slate-300 italic border border-white/10 shadow-sm">
              ({currentMoodText})
            </span>
          </div>

          {/* Dialogue Speech Card */}
          <div className="w-full p-4 rounded-2xl bg-white/10 border border-white/15 shadow-xl relative backdrop-blur-md">
            <div className="text-xs font-bold text-rose-300 mb-1">
              {husbandName}:
            </div>
            <p className="text-base text-slate-100 font-normal leading-relaxed italic select-text">
              &ldquo;{husbandDialogue}&rdquo;
            </p>
          </div>

          {/* Conditional Middle Section based on star rating */}
          {stars === 0 && (
            <div className="w-full p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                <IoWarningOutline className="text-lg text-amber-400 shrink-0" />
                <span>CẢNH BÁO: Nghi ngờ tăng thêm 1 vạch!</span>
              </div>

              {/* Suspicion Meter */}
              <div className="flex items-center justify-between text-xs text-slate-300 pt-1">
                <span>Thước đo nghi ngờ:</span>
                <span className="font-sans font-bold text-amber-400">
                  {usedStrikes}/{maxStrikes}
                </span>
              </div>

              {/* Visual Meter Boxes */}
              <div className="flex items-center gap-1.5 pt-1">
                {Array.from({ length: maxStrikes }).map((_, idx) => {
                  const isFilled = idx < usedStrikes;
                  return (
                    <div
                      key={idx}
                      className={`flex-1 h-3 rounded-md transition-all ${
                        isFilled
                          ? 'bg-rose-500 shadow-sm shadow-rose-500/50'
                          : 'bg-white/10 border border-white/20'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {stars > 0 && (
            <div className="w-full flex flex-col items-center space-y-2 pt-1 text-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Kết quả phán quyết
              </span>

              {/* Star Rating Display */}
              <div className="flex items-center justify-center gap-2 text-2xl text-amber-400 py-1">
                {Array.from({ length: 3 }).map((_, idx) => {
                  const isFilled = idx < stars;
                  return isFilled ? (
                    <IoStar key={idx} className="drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                  ) : (
                    <IoStarOutline key={idx} className="text-slate-600" />
                  );
                })}
              </div>

              {stars === 3 && wifeTitle && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-400/40 text-amber-300 text-sm font-bold shadow-md">
                  <IoTrophyOutline className="text-base text-amber-400" />
                  <span className="uppercase tracking-wide">{wifeTitle}</span>
                </div>
              )}

              {stars === 3 && narrativeRoast && (
                <div className="p-3 mt-1 rounded-xl bg-white/5 border-l-4 border-l-rose-500 text-left">
                  <p className="text-sm italic text-slate-300 leading-relaxed">
                    &ldquo;{narrativeRoast}&rdquo;
                  </p>
                </div>
              )}

              {stars < 3 && (
                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold">
                  ĐÃ VẠCH TRẦN MỘT PHẦN
                </span>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions */}
        <footer className="space-y-2.5 pt-3 border-t border-white/10">
          {stars === 0 && (
            <button
              type="button"
              onClick={onContinueInvestigation}
              className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
            >
              <IoSearchOutline className="text-lg" />
              <span>Tiếp tục điều tra</span>
            </button>
          )}

          {stars > 0 && stars < 3 && (
            <>
              <button
                type="button"
                onClick={onForgiveAndAdvance}
                className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <IoLockOpenOutline className="text-lg" />
                <span>Tha thứ &amp; Qua màn</span>
              </button>

              <button
                type="button"
                onClick={onContinueInvestigation}
                className="w-full min-h-[44px] rounded-2xl bg-white/10 hover:bg-white/15 active:scale-[0.98] text-slate-300 font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <IoSearchOutline className="text-base" />
                <span>Điều tra tiếp để đạt 3 sao</span>
              </button>
            </>
          )}

          {stars === 3 && (
            <>
              <button
                type="button"
                onClick={onShareRoastCard}
                className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
              >
                <IoShareSocialOutline className="text-lg" />
                <span>Tạo thẻ Roast khoe MXH</span>
              </button>

              <button
                type="button"
                onClick={onForgiveAndAdvance}
                className="w-full min-h-[48px] rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <IoLockOpenOutline className="text-lg" />
                <span>Tha thứ &amp; Qua màn</span>
              </button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
};
