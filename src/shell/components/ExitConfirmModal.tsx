import React, { useRef } from 'react';
import { IoLogOutOutline, IoPlay, IoWarningOutline } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { useDialogFocus } from '../../shared/ui/useDialogFocus';

export interface ExitConfirmModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLeave: () => void;
}

export const ExitConfirmModal: React.FC<ExitConfirmModalProps> = ({
  isOpen,
  onStay,
  onLeave,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const swipeHandlers = useSwipeBack({ onBack: onStay, enabled: isOpen });
  const handleKeyDown = useDialogFocus(isOpen, dialogRef, onStay);

  if (!isOpen) return null;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="exit-confirm-title"
      aria-describedby="exit-confirm-desc"
      onClick={onStay}
      onKeyDown={handleKeyDown}
      {...swipeHandlers}
      className="absolute inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn select-none font-sans"
    >
      <div
        ref={dialogRef}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-xs bg-slate-900/95 border border-white/20 rounded-2xl p-5 shadow-2xl space-y-4 text-white text-center animate-popIn backdrop-blur-xl"
      >
        <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 mx-auto flex items-center justify-center">
          <IoWarningOutline className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h3 id="exit-confirm-title" className="text-base font-bold text-white tracking-tight">
            Bạn có chắc muốn thoát game?
          </h3>
          <p id="exit-confirm-desc" className="text-xs text-slate-300 leading-relaxed">
            Tiến trình điều tra hiện tại chưa lưu có thể bị gián đoạn nếu bạn rời khỏi game lúc này.
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={onStay}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 font-bold text-xs shadow-md active:scale-95 transition-all text-white"
          >
            <IoPlay className="w-4 h-4 fill-white shrink-0" />
            <span>Tiếp tục chơi</span>
          </button>

          <button
            type="button"
            onClick={onLeave}
            className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 active:bg-white/20 text-slate-300 hover:text-white font-semibold text-xs active:scale-95 transition-all"
          >
            <IoLogOutOutline className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Rời khỏi</span>
          </button>
        </div>
      </div>
    </div>
  );
};
