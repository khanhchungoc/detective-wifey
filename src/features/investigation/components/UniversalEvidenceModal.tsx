import React, { useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import type { UniversalEvidenceItem } from '../../../shared/contracts/evidence';
import { ContactAvatar } from '../../../shared/ui/ContactAvatar';
import { formatEvidenceSubtitle } from '../evidencePresentation';
import { EvidenceSnippet } from '../../../shared/ui/EvidenceSnippet';
import { AppVisibilityContext } from '../../../shared/ui/AppVisibilityContext';
export type { UniversalEvidenceItem } from '../../../shared/contracts/evidence';

interface UniversalEvidenceModalProps {
  isOpen: boolean;
  item: UniversalEvidenceItem | null;
  avatar?: React.ReactNode;
  onPinEvidence: (suspectName: string) => void;
  onClose: () => void;
}

export const UniversalEvidenceModal = ({
  isOpen,
  item,
  avatar,
  onPinEvidence,
  onClose,
}: UniversalEvidenceModalProps): React.JSX.Element | null => {
  const swipeHandlers = useSwipeBack({ onBack: onClose });
  const dialogRef = useRef<HTMLDivElement>(null);
  const appVisible = useContext(AppVisibilityContext);

  useEffect(() => {
    if (!isOpen || !item || !appVisible) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => previous?.focus();
  }, [isOpen, item, appVisible]);

  if (!isOpen || !item || !appVisible) return null;

  const hasAttribution = item.suspectToTag.trim().length > 0;
  const hasSource = Boolean(item.source?.caseId && item.source.recordId && item.source.title.trim());
  const canPin = hasAttribution || hasSource;
  const subtitle = formatEvidenceSubtitle(item);
  const kind = item.kind ?? item.source?.kind;
  const profileName = item.profileName || item.visibleAlias || item.source?.visibleAlias;
  const hasContactVisual = !kind || kind === 'person' || kind === 'conversation' || kind === 'message';

  const handlePin = () => {
    if (!canPin) return;
    onPinEvidence(hasAttribution ? item.suspectToTag : item.source!.title);
    onClose();
  };

  const portalTarget = typeof document !== 'undefined'
    ? (document.querySelector<HTMLElement>('.phone-shell') ?? document.body)
    : null;
  const isShellTarget = portalTarget?.classList?.contains('phone-shell');
  const positionClass = isShellTarget || !portalTarget ? 'absolute inset-0' : 'fixed inset-0';

  const modalContent = (
    <div
      className={`${positionClass} z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md select-none font-sans animate-fadeIn`}
      onClick={onClose}
    >
      <div
        {...swipeHandlers}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="universal-evidence-title"
        className="ios-evidence-modal w-full max-w-[340px] max-h-[calc(100%-2rem)] overflow-y-auto bg-[#F2F2F7] rounded-[26px] p-5 shadow-2xl flex flex-col gap-3.5"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            e.stopPropagation();
            onClose();
          }
          if (e.key === 'Tab') {
            const buttons = Array.from(dialogRef.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])') ?? []);
            const first = buttons[0];
            const last = buttons[buttons.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
            if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
          }
        }}
      >
        <div className="flex items-start gap-2.5">
          {avatar !== undefined ? avatar : (hasContactVisual && profileName?.trim() ? <ContactAvatar name={profileName} size={44} /> : null)}
          <div className="min-w-0 flex-1">
            <h3 id="universal-evidence-title" className="text-[17px] font-semibold text-black leading-snug break-words">
              {item.title}
            </h3>
            {subtitle && <p className="text-[13px] text-[#8E8E93] mt-0.5 break-words whitespace-pre-wrap">{subtitle}</p>}
          </div>
        </div>

        {/* Evidence Snippet - direct on alert surface without nested box */}
        {item.snippet && (
          <div className="text-[15px] text-[#3C3C43] leading-relaxed whitespace-pre-line select-text max-h-52 overflow-y-auto px-0.5">
            <EvidenceSnippet text={item.snippet} fieldIconsEnabled={kind === 'order'} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] bg-[#E5E5EA] hover:bg-[#D1D1D6] active:scale-[0.98] text-black rounded-full font-semibold text-[15px] flex items-center justify-center transition-all"
          >
            <span>Bỏ qua</span>
          </button>

          <button
            type="button"
            onClick={handlePin}
            disabled={!canPin}
            className="w-full min-h-[44px] bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white rounded-full font-semibold text-[15px] flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <span>Ghim</span>
          </button>
        </div>
      </div>
    </div>
  );

  return portalTarget ? createPortal(modalContent, portalTarget) : modalContent;
};


