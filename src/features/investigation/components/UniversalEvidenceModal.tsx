import React, { useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoDocumentTextOutline, IoImageOutline, IoPinOutline } from 'react-icons/io5';
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

  const isVisible = Boolean(isOpen && item && appVisible);

  useEffect(() => {
    if (!isVisible) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => previous?.focus();
  }, [isVisible]);

  if (!isVisible || !item) return null;

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

  const renderFallbackIcon = () => (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-game-elevated text-game-text-secondary">
      {item.source?.imageSrc ? (
        <IoImageOutline aria-hidden="true" className="h-[18px] w-[18px]" />
      ) : (
        <IoDocumentTextOutline aria-hidden="true" className="h-[18px] w-[18px]" />
      )}
    </div>
  );

  const modalContent = (
    <div
      className={`${positionClass} z-[60] flex items-center justify-center p-4 bg-black/45 select-none font-sans animate-fadeIn`}
      onClick={onClose}
    >
      <div
        {...swipeHandlers}
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="universal-evidence-title"
        className="ios-evidence-modal animate-scaleUp w-full max-w-[342px] max-h-[calc(100%-2rem)] overflow-y-auto rounded-2xl border border-white/10 bg-game-dossier p-5 text-game-text shadow-2xl flex flex-col gap-4"
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
        <div className="flex items-start gap-3">
          {avatar !== undefined
            ? avatar
            : hasContactVisual && profileName?.trim()
              ? <ContactAvatar name={profileName} size={40} />
              : renderFallbackIcon()}
          <div className="min-w-0 flex-1">
            <h3 id="universal-evidence-title" className="text-ios-headline font-semibold text-game-text break-words">
              {item.title}
            </h3>
            {subtitle && (
              <p className="mt-0.5 text-ios-footnote text-game-text-secondary break-words whitespace-pre-wrap">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Photo Evidence Preview */}
        {item.source?.imageSrc && (
          <div className="h-36 w-full shrink-0 overflow-hidden rounded-xl border border-white/10 bg-game-canvas">
            {item.source.imagePosition ? (
              <svg
                viewBox="0 0 627 627"
                preserveAspectRatio="xMidYMid slice"
                className="w-full h-full pointer-events-none"
                aria-label={item.title}
              >
                <image
                  href={item.source.imageSrc}
                  xlinkHref={item.source.imageSrc}
                  x={item.source.imagePosition.startsWith('100%') ? -627 : 0}
                  y={item.source.imagePosition.endsWith('100%') ? -627 : 0}
                  width="1254"
                  height="1254"
                />
              </svg>
            ) : (
              <img
                src={item.source.imageSrc}
                alt={item.title}
                draggable={false}
                className="w-full h-full object-cover select-none"
              />
            )}
          </div>
        )}

        {/* Evidence Snippet on elevated dossier surface */}
        {item.snippet && (
          <div className="rounded-xl border border-white/10 bg-game-elevated p-3.5 text-ios-subheadline leading-relaxed text-game-text/90 whitespace-pre-line select-text max-h-52 overflow-y-auto">
            <EvidenceSnippet text={item.snippet} fieldIconsEnabled={kind === 'order'} />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="touch-target-min min-h-[44px] border-0 bg-transparent px-2 text-ios-subheadline font-medium text-game-text-secondary hover:text-game-text active:opacity-75 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            <span>Bỏ qua</span>
          </button>

          <button
            type="button"
            onClick={handlePin}
            disabled={!canPin}
            className="touch-target-min min-h-[44px] min-w-[120px] inline-flex items-center justify-center gap-1.5 rounded-xl bg-game-crimson px-5 py-2.5 text-ios-subheadline font-semibold text-game-text active:scale-[0.98] active:opacity-85 transition-[transform,opacity] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-game-crimson/70"
          >
            <IoPinOutline aria-hidden="true" className="h-[18px] w-[18px] shrink-0" />
            <span>Ghim</span>
          </button>
        </div>
      </div>
    </div>
  );

  return portalTarget ? createPortal(modalContent, portalTarget) : modalContent;
};
