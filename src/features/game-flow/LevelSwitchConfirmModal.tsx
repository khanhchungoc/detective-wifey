import React, { useRef } from 'react';
import { IoAlertCircleOutline } from 'react-icons/io5';
import { useDialogFocus } from '../../shared/ui/useDialogFocus';

export interface LevelSwitchConfirmModalProps {
  isOpen: boolean;
  onStay: () => void;
  onConfirm: () => void;
}

export const LevelSwitchConfirmModal: React.FC<LevelSwitchConfirmModalProps> = ({
  isOpen,
  onStay,
  onConfirm,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const handleKeyDown = useDialogFocus(isOpen, dialogRef, onStay);

  if (!isOpen) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-switch-confirm-title"
      onKeyDown={handleKeyDown}
      className="fixed inset-0 z-[90] flex items-center justify-center bg-game-backdrop/80 px-4 backdrop-blur-md font-sans"
    >
      <div className="w-full max-w-sm rounded-2xl border border-white/15 border-l-4 border-l-game-crimson bg-game-dossier p-5 text-game-text shadow-2xl">
        <div className="mb-3 flex items-center gap-2.5">
          <IoAlertCircleOutline aria-hidden="true" className="h-6 w-6 shrink-0 text-game-crimson" />
          <h2 id="level-switch-confirm-title" className="text-ios-title-3 text-game-text">
            Đổi màn chơi?
          </h2>
        </div>
        <p className="mb-5 text-ios-subheadline text-game-text-secondary">
          Tiến độ chưa đối chất của màn hiện tại sẽ mất. Bạn có chắc chắn muốn quay lại Chọn màn chơi?
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onStay}
            className="touch-target-min rounded-xl border border-white/15 bg-game-elevated px-4 py-3 text-ios-headline text-game-text active:scale-[0.97] active:opacity-75 transition-transform"
          >
            Ở lại
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="touch-target-min rounded-xl bg-game-crimson px-4 py-3 text-ios-headline text-game-text active:scale-[0.97] active:opacity-75 transition-transform"
          >
            Đổi màn chơi
          </button>
        </div>
      </div>
    </div>
  );
};
