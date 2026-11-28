import React from 'react';
import { IoChevronBack, IoClose, IoLocation, IoNavigateOutline } from 'react-icons/io5';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import {
  SHEET_BACKDROP_OPEN_MS,
  SHEET_CLOSE_EASE,
  SHEET_CLOSE_MS,
  SHEET_OPEN_EASE,
  SHEET_OPEN_MS,
} from '../../../shared/motion/sheetMotion';

interface MessagingLocationModalProps {
  isOpen: boolean;
  venueName: string;
  address: string;
  time?: string;
  onClose: () => void;
}

export type ZolaLocationModalProps = MessagingLocationModalProps;

export const MessagingLocationModal: React.FC<MessagingLocationModalProps> = ({
  isOpen,
  venueName,
  address,
  time,
  onClose,
}) => {
  const backdropRef = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const closingRef = React.useRef(false);
  const animsRef = React.useRef<Animation[]>([]);

  const cancelAnims = React.useCallback(() => {
    for (const anim of animsRef.current) anim.cancel();
    animsRef.current = [];
  }, []);

  const requestClose = React.useCallback(() => {
    if (closingRef.current) return;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const reduced = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    if (reduced || !panel || typeof panel.animate !== 'function') {
      onClose();
      return;
    }
    closingRef.current = true;
    cancelAnims();
    panel.style.pointerEvents = 'none';
    panel.style.transform = 'translate3d(0, 100%, 0)';
    const panelAnim = panel.animate(
      [{ transform: 'translate3d(0, 0, 0)' }, { transform: 'translate3d(0, 100%, 0)' }],
      { duration: SHEET_CLOSE_MS, easing: SHEET_CLOSE_EASE },
    );
    const anims: Animation[] = [panelAnim];
    if (backdrop && typeof backdrop.animate === 'function') {
      backdrop.style.opacity = '0';
      anims.push(backdrop.animate([{ opacity: 1 }, { opacity: 0 }], { duration: SHEET_CLOSE_MS, easing: SHEET_CLOSE_EASE }));
    }
    animsRef.current = anims;
    const finish = () => {
      closingRef.current = false;
      onClose();
    };
    void panelAnim.finished.then(finish, finish);
  }, [cancelAnims, onClose]);

  const swipeHandlers = useSwipeBack({ onBack: requestClose });

  React.useLayoutEffect(() => {
    if (!isOpen) return undefined;
    const panel = panelRef.current;
    const backdrop = backdropRef.current;
    const reduced = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
    if (reduced || !panel || typeof panel.animate !== 'function') return undefined;
    cancelAnims();
    const anims: Animation[] = [
      panel.animate(
        [{ transform: 'translate3d(0, 100%, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
        { duration: SHEET_OPEN_MS, easing: SHEET_OPEN_EASE },
      ),
    ];
    if (backdrop && typeof backdrop.animate === 'function') {
      anims.push(backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: SHEET_BACKDROP_OPEN_MS, easing: SHEET_OPEN_EASE }));
    }
    animsRef.current = anims;
    return () => cancelAnims();
  }, [cancelAnims, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className="absolute inset-0 z-50 bg-black/55 flex flex-col justify-end select-none font-sans will-change-[opacity]"
      onClick={requestClose}
    >
      <div
        {...swipeHandlers}
        ref={panelRef}
        style={{ backfaceVisibility: 'hidden' }}
        className="ios-sheet w-full bg-white rounded-t-2xl p-4 shadow-2xl border-t border-slate-200 flex flex-col space-y-4 max-h-[85%] overflow-y-auto will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={requestClose}
              className="w-11 h-11 -ml-2 flex items-center justify-center text-slate-600 hover:text-slate-900 active:scale-95 transition-all"
              aria-label="Quay lại"
            >
              <IoChevronBack className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-1.5 text-ios-caption-1 font-bold text-[#0088FF] uppercase tracking-wide">
              <IoNavigateOutline className="w-4 h-4 text-[#0088FF]" />
              <span>Vị trí chia sẻ qua tin nhắn</span>
            </div>
          </div>
          <button
            type="button"
            onClick={requestClose}
            className="w-11 h-11 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
            aria-label="Đóng chi tiết bản đồ"
          >
            <IoClose className="w-5 h-5" />
          </button>
        </div>

        {/* Emulated Map Canvas */}
        <div className="w-full h-44 rounded-xl bg-slate-100 border border-slate-300 relative overflow-hidden flex flex-col items-center justify-center shadow-inner">
          {/* Grid lines simulating map streets */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#0088FF_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute w-full h-[1px] bg-slate-300 top-1/2 -translate-y-4" />
          <div className="absolute w-[1px] h-full bg-slate-300 left-1/2 -translate-x-6" />
          <div className="absolute w-3/4 h-[1px] bg-sky-300 top-1/3 -rotate-12" />

          {/* Central Pulsing Hotel Pin */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-rose-500/20 animate-ping absolute -top-1" />
            <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white relative z-10">
              <IoLocation className="w-5 h-5 text-white" />
            </div>
            <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-ios-caption-2 font-bold shadow-md">
              Vị trí thực tế
            </span>
          </div>

          <div className="absolute bottom-2 right-2 text-ios-caption-2 text-[#52525B] font-sans">
            GPS: 21.0285° N, 105.8015° E
          </div>
        </div>

        {/* Venue Information */}
        <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-ios-subheadline font-bold text-[#0F172A]">{venueName}</h4>
            {time && <span className="text-ios-footnote font-semibold text-sky-700">{time}</span>}
          </div>
          <p className="text-ios-footnote text-[#64748B] flex items-center gap-1">
            <IoLocation className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>{address}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const ZolaLocationModal = MessagingLocationModal;
export default MessagingLocationModal;
