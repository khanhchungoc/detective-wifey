import React from 'react';
import {
  IoChevronBack,
  IoDocumentsOutline,
  IoGitBranchOutline,
  IoGridOutline,
  IoArrowUndoOutline,
  IoScaleOutline,
} from 'react-icons/io5';
import type { UndoAction } from '../types';

export interface NotebookOverlayControlsProps {
  placedCount: number;
  verifiedKeyCount: number;
  requiredKeyCount: number;
  activeUndo: UndoAction | null;
  onCenterCluster: () => void;
  onClose: () => void;
  onAutoArrange: () => void;
  onOpenConfrontation: () => void;
  onPauseUndoTimer: () => void;
  onResumeUndoTimer: () => void;
  onExecuteUndo: () => void;
}

export const NotebookOverlayControls: React.FC<NotebookOverlayControlsProps> = ({
  placedCount,
  verifiedKeyCount,
  requiredKeyCount,
  activeUndo,
  onCenterCluster,
  onClose,
  onAutoArrange,
  onOpenConfrontation,
  onPauseUndoTimer,
  onResumeUndoTimer,
  onExecuteUndo,
}) => {
  return (
    <>
      {/* Top-Right Floating Forensic Stats Overlay Pill */}
      <button
        type="button"
        onClick={onCenterCluster}
        aria-label={`Định vị bảng: ${placedCount} manh mối, ${verifiedKeyCount}/${requiredKeyCount} mắt xích quan trọng`}
        title="Định vị các manh mối trên bảng"
        style={{ top: 'calc(max(6px, var(--phone-system-top, 59px)) + 6px)' }}
        className="corkboard-stats-overlay absolute right-3 z-20 flex h-9 items-center rounded-[6px] border border-slate-700/85 bg-[#0D1219]/95 px-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-slate-800/95 active:scale-95 transition-all cursor-pointer after:absolute after:-inset-1 after:content-['']"
      >
        <span className="flex items-center gap-1.5 font-sans text-ios-caption-2 font-semibold tabular-nums">
          <IoDocumentsOutline className="h-3.5 w-3.5 text-[#F1F5F9]" aria-hidden="true" />
          <span className="text-[#F1F5F9]">{placedCount}</span>
          <span className="text-slate-600" aria-hidden="true">·</span>
          <IoGitBranchOutline className="h-3.5 w-3.5 text-[#E11D48]" aria-hidden="true" />
          <span className="text-[#F1F5F9]">{verifiedKeyCount}/{requiredKeyCount}</span>
        </span>
      </button>

      {/* Split Floating Bottom Bar: Back (Left) & Tactical Actions (Right) */}
      <div
        className="corkboard-control-dock pointer-events-none absolute inset-x-3 z-20 flex items-center justify-between gap-2"
        style={{ bottom: 'max(14px, var(--phone-system-bottom, 18px))' }}
      >
        <button
          type="button"
          onPointerDown={(e) => {
            // Keep left-edge swipe-back and bottom swipe-home from intercepting taps on the close button.
            e.stopPropagation();
          }}
          onTouchStart={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Đóng sổ tay của vợ"
          title="Quay lại màn hình chính"
          className="group pointer-events-auto relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] border border-slate-700/85 bg-[#0D1219]/[0.96] text-[#F1F5F9] shadow-[0_10px_24px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.08)] hover:bg-slate-800 transition-colors cursor-pointer touch-manipulation"
        >
          <IoChevronBack className="h-4 w-4 transition-transform duration-100 group-active:scale-90" aria-hidden="true" />
        </button>

        <div className="pointer-events-auto flex items-center gap-1 rounded-[6px] border border-slate-700/85 bg-[#0D1219]/[0.96] p-0.5 shadow-[0_10px_24px_rgba(0,0,0,0.72),inset_0_1px_0_rgba(255,255,255,0.08)]">
          <button
            type="button"
            onClick={onAutoArrange}
            aria-label="Xếp gọn"
            title="Xếp gọn"
            className="relative flex h-11 w-11 items-center justify-center rounded-[4px] text-[#CBD5E1] hover:bg-slate-800 hover:text-white active:scale-95 transition-all cursor-pointer"
          >
            <IoGridOutline className="h-4 w-4 text-[#CBD5E1]" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onOpenConfrontation}
            className="relative flex h-11 items-center justify-center gap-1.5 rounded-[4px] border border-[#FB7185]/35 bg-[#E11D48] hover:bg-[#BE123C] px-3 text-white shadow-[0_4px_12px_rgba(225,29,72,0.38)] active:scale-95 transition-all cursor-pointer"
          >
            <IoScaleOutline className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="whitespace-nowrap font-sans text-ios-caption-2 font-bold uppercase tracking-[0.05em] text-white leading-none">
              Đối chất
            </span>
          </button>
        </div>
      </div>

      {/* Undo Notification Banner */}
      {activeUndo && (
        <div
          role="status"
          aria-live="polite"
          className="fixed sm:absolute bottom-24 left-4 right-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-[360px] z-50 flex items-center justify-between gap-3 rounded-[6px] bg-[#0D1219]/96 text-[#F1F5F9] px-4 py-2.5 shadow-2xl border border-slate-700/85 animate-fadeIn"
          onMouseEnter={onPauseUndoTimer}
          onMouseLeave={onResumeUndoTimer}
          onFocus={onPauseUndoTimer}
          onBlur={onResumeUndoTimer}
        >
          <span className="text-ios-footnote font-medium text-slate-200 truncate">
            {activeUndo.message}
          </span>
          <button
            type="button"
            onClick={onExecuteUndo}
            className="flex items-center gap-1 shrink-0 px-3 py-1.5 min-h-[44px] rounded-[4px] bg-[#E11D48] hover:bg-[#BE123C] active:scale-95 text-white font-sans font-bold text-ios-caption-1 uppercase shadow-md transition-all cursor-pointer"
          >
            <IoArrowUndoOutline className="text-sm" />
            <span>Hoàn tác</span>
          </button>
        </div>
      )}
    </>
  );
};
