import React, { useEffect, useRef, useState } from 'react';
import {
  IoChatbubbleEllipsesOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoCloseOutline,
  IoChevronBackOutline,
  IoLinkOutline,
  IoHeart,
  IoGlassesOutline,
  IoCallOutline,
} from 'react-icons/io5';
import characterSheet from '../../../shared/assets/contact-avatar-persona-sheet.jpg';
import { ContactAvatar } from '../../../shared/ui/ContactAvatar';
import type { AppDefinition } from '../../../shared/contracts/app-contracts';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import '../notebook.css';
import type { ConfrontationPreflightInfo, SuspectOnBoard } from '../confrontationEngine';

export const CONFRONTATION_LABELS = ['Làm cho ra nhẽ', 'Lừa sao được bà', 'Mày dám lừa bà', 'Tôi biết hết rồi'] as const;

const POLAROID_TILTS = [1.6, -1.8, -1.1, 1.9, -1.4] as const;

interface SuspectPolaroidCardProps {
  suspect: SuspectOnBoard;
  index: number;
  isSingle: boolean;
  onSelect: (suspectId: string) => void;
}

/**
 * Polaroid suspect card pinned with a red pushpin and stamped "Nghi phạm" label.
 */
const SuspectPolaroidCard: React.FC<SuspectPolaroidCardProps> = ({
  suspect,
  index,
  isSingle,
  onSelect,
}) => {
  const tiltDeg = POLAROID_TILTS[index % POLAROID_TILTS.length];
  const photoName = suspect.avatarName || suspect.displayName;

  return (
    <div
      className={isSingle
        ? 'w-[196px] sm:w-[216px] shrink-0'
        : 'w-[calc(50%-0.4375rem)] sm:w-[calc(50%-0.625rem)] max-w-[184px] shrink-0'}
      style={{ transform: `rotate(${tiltDeg}deg)` }}
    >
      <button
        type="button"
        data-suspect-polaroid={suspect.id}
        onClick={() => onSelect(suspect.id)}
        className="group relative block w-full cursor-pointer rounded-[2px] border border-[#B8C4D0] bg-gradient-to-b from-[#EEF2F6] via-[#E6EBF0] to-[#DCE3EA] p-2 pb-0 sm:p-2.5 sm:pb-0 text-left shadow-[0_12px_24px_rgba(0,0,0,0.62),0_3px_8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.85)] transition-transform duration-150 hover:-translate-y-0.5 hover:scale-[1.03] hover:border-[#FACC15] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1017]"
      >
        {/* Square suspect photo with crimson pushpin and tilted forensic stamp */}
        <div className="relative aspect-square w-full bg-[#090C10]">
          <div className="h-full w-full overflow-hidden">
            <ContactAvatar name={photoName} shape="square" fluid />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.14),inset_0_0_18px_rgba(0,0,0,0.2)]"
          />

          {/* Crimson 3D forensic pin at top-left */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 left-[12%] z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-[#FDA4AF]/55 bg-[radial-gradient(circle_at_35%_30%,#fb7185_0%,#e11d48_48%,#9f1239_85%,#881337_100%)] shadow-[2px_4px_6px_rgba(0,0,0,0.65)]"
          >
            <div className="relative -translate-x-[0.5px] -translate-y-[0.5px] h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fda4af_0%,#e11d48_65%,#9f1239_100%)] shadow-[1px_2px_3px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.45)]">
              <div className="absolute left-[2px] top-[2px] h-1.5 w-1.5 rounded-full bg-white/65" />
            </div>
          </div>

          {/* Tilted crimson forensic rectangular stamp */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -right-0.5 top-1 sm:top-1.5 z-10 rotate-[10deg] rounded-[1px] border-[1.5px] border-[#DC2626] bg-[#F8FAFC]/90 shadow-[0_1px_3px_rgba(0,0,0,0.3)] ${
              isSingle ? 'px-2 py-1' : 'px-1.5 py-[3px] sm:px-2 sm:py-1'
            }`}
          >
            <span
              className={`block font-sans text-ios-caption-2 font-extrabold uppercase leading-none text-[#DC2626] ${
                isSingle ? 'tracking-[0.12em]' : 'tracking-[0.08em]'
              }`}
            >
              {suspect.isUnmasked ? 'Đã lột mặt nạ' : 'Nghi phạm'}
            </span>
          </div>
        </div>

        {/* Polaroid bottom caption chin */}
        <div className={`flex flex-col items-center justify-center px-1 text-center ${isSingle ? 'min-h-[52px] py-2.5' : 'min-h-[44px] sm:min-h-[48px] py-2'}`}>
          <span
            className={`text-center font-sans font-bold leading-tight tracking-tight text-slate-900 line-clamp-2 break-words ${
              isSingle ? 'text-sm sm:text-[15px]' : 'text-xs sm:text-[13px]'
            }`}
          >
            {suspect.displayName}
          </span>
          {suspect.isUnmasked && suspect.alias && suspect.alias.trim().toLowerCase() !== suspect.displayName.trim().toLowerCase() && (
            <span className="mt-1 inline-flex items-center gap-1 text-ios-caption-2 font-semibold text-rose-800 leading-tight">
              <IoGlassesOutline className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span>Vỏ bọc: &quot;{suspect.alias}&quot;</span>
            </span>
          )}
          {suspect.isUnmasked && suspect.unmaskedEvidenceHint && (
            <span className="mt-0.5 inline-flex items-center gap-1 text-ios-caption-2 font-medium text-slate-600 leading-tight">
              <IoCallOutline className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              <span>{suspect.unmaskedEvidenceHint}</span>
            </span>
          )}
        </div>
      </button>
    </div>
  );
};

export interface ConfrontationConfirmModalProps {
  isOpen: boolean;
  preflight: ConfrontationPreflightInfo;
  suspectsOnBoard?: SuspectOnBoard[];
  selectedSuspectId?: string | null;
  husbandName?: string;
  getSourceApp?: (id: string) => Pick<AppDefinition, 'displayName' | 'icon' | 'iconAsset' | 'themeGradient'> | undefined;
  onSelectSuspect?: (suspectId: string | null) => void;
  onConfirmConfront: (suspectId?: string) => void;
  onCancel: () => void;
}

export const ConfrontationConfirmModal: React.FC<ConfrontationConfirmModalProps> = ({
  isOpen,
  preflight,
  suspectsOnBoard = [],
  selectedSuspectId,
  getSourceApp,
  husbandName = 'Hoàng',
  onSelectSuspect,
  onConfirmConfront,
  onCancel,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [confrontLabel] = useState(() => CONFRONTATION_LABELS[Math.floor(Math.random() * CONFRONTATION_LABELS.length)]);

  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(selectedSuspectId ?? null);

  useEffect(() => {
    if (selectedSuspectId !== undefined) {
      setInternalSelectedId(selectedSuspectId);
    }
  }, [selectedSuspectId]);

  const hasSuspectList = suspectsOnBoard.length > 0;
  const currentSuspectId = selectedSuspectId !== undefined ? selectedSuspectId : internalSelectedId;
  const selectedSuspect = suspectsOnBoard.find(suspect => suspect.id === currentSuspectId);
  const isStep1 = !selectedSuspect;

  const swipeHandlers = useSwipeBack({
    onBack: isStep1 ? onCancel : (hasSuspectList ? () => handleResetSuspect() : onCancel),
    enabled: isOpen,
  });

  useEffect(() => {
    if (!isOpen) return;
    dialogRef.current?.focus({ preventScroll: true });
  }, [isOpen, isStep1]);

  if (!isOpen) return null;

  const {
    isLowSuccessRate,
    verifiedCluesList = [],
    verifiedStringsList = [],
  } = preflight;

  const selectedSuspectDisplayName = selectedSuspect?.displayName || '';
  const filledSegments = Math.max(1, Math.ceil(preflight.successRate / 20));
  const linkedBridges = verifiedStringsList.filter(item => item.isConnectedToSuspect !== false);

  const handleSelectSuspect = (id: string) => {
    setInternalSelectedId(id);
    onSelectSuspect?.(id);
  };

  const handleResetSuspect = () => {
    setInternalSelectedId(null);
    onSelectSuspect?.(null);
  };

  const handleConfirm = () => {
    if (selectedSuspect) onConfirmConfront(selectedSuspect.id);
  };

  const renderAppBadge = (appId?: string) => {
    const app = appId ? getSourceApp?.(appId) : undefined;
    if (app) {
      return (
        <span
          role="img"
          aria-label={app.displayName}
          className={`flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[4px] border border-[#D4C9B6] text-white bg-gradient-to-br ${app.themeGradient}`}
        >
          {app.iconAsset ? (
            <img src={app.iconAsset} alt="" className="h-full w-full object-cover" />
          ) : (
            <app.icon className="h-3.5 w-3.5" />
          )}
        </span>
      );
    }
    return <IoDocumentTextOutline aria-hidden="true" className="h-5 w-5 shrink-0 text-[#7A6B57]" />;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-confrontation-title"
      className="absolute inset-0 z-[75] flex items-center justify-center p-2 sm:p-3 bg-[#06080B]/88 backdrop-blur-md select-none font-sans animate-fadeIn"
      style={{ paddingTop: 'max(8px, var(--phone-system-top, 59px))' }}
      onClick={onCancel}
      {...swipeHandlers}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-[560px] max-h-[calc(100%_-_0.5rem)] flex flex-col pt-5 animate-scaleUp outline-none"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onCancel(); } }}
      >
        {/* Sealed Casefile Top File Tab */}
        <div className="pointer-events-none absolute top-0 left-3 z-10 flex items-center rounded-t-[4px] border border-b-0 border-[#2A3544] bg-[#141A22] px-2.5 py-0.5 shadow-sm">
          <span className="font-sans text-ios-caption-2 font-bold uppercase tracking-[0.14em] text-[#FACC15]">
            FILE 01
          </span>
        </div>

        {/* Main Sealed Dark Casefile Container */}
        <div className="dossier-folder-sheet relative flex min-h-0 flex-1 flex-col gap-2.5 sm:gap-3 overflow-y-auto rounded-[4px] rounded-tl-none border border-[#2A3544] border-l-[6px] border-l-[#E11D48] p-3 sm:p-4 text-[#F1F5F9]">
          <header className="flex items-center gap-1.5 border-b border-slate-800 pb-2 shrink-0">
            {!isStep1 && hasSuspectList && (
              <button
                type="button"
                onClick={handleResetSuspect}
                aria-label="Chọn nghi phạm khác"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] text-slate-300 hover:bg-slate-800 outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
              >
                <IoChevronBackOutline className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <span className="block font-sans text-ios-caption-2 font-bold uppercase tracking-[0.14em] text-[#FB7185] truncate">
                {isStep1 ? 'HỒ SƠ NGHI PHẠM' : 'HỒ SƠ ĐỐI CHẤT'}
              </span>
              <h3
                id="confirm-confrontation-title"
                className={isStep1 ? 'text-sm sm:text-base font-bold tracking-tight text-[#F1F5F9]' : 'sr-only'}
              >
                {isStep1 ? 'Chọn nghi phạm' : 'Xác nhận đối chất'}
              </h3>
            </div>
            {!isStep1 && (
              <span
                aria-hidden="true"
                className="rounded-[2px] bg-[#E11D48] px-1.5 py-0.5 font-sans text-ios-caption-2 font-extrabold tracking-widest text-white shadow-sm"
              >
                #01
              </span>
            )}
            <button
              type="button"
              onClick={onCancel}
              aria-label="Đóng"
              className="ml-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-[6px] text-slate-300 hover:bg-slate-800 hover:text-white outline-none focus-visible:ring-2 focus-visible:ring-[#E11D48]"
            >
              <IoCloseOutline className="h-5 w-5" />
            </button>
          </header>

          {isStep1 ? (
            hasSuspectList ? (
              <div className="suspect-cork-tray min-h-0 overflow-y-auto rounded-[4px] border border-[#2A3544] p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-center gap-3.5 sm:gap-5">
                  {suspectsOnBoard.map((suspect, index) => (
                    <SuspectPolaroidCard
                      key={suspect.id}
                      suspect={suspect}
                      index={index}
                      isSingle={suspectsOnBoard.length === 1}
                      onSelect={handleSelectSuspect}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-4">
                <p className="font-sans text-sm text-slate-400">
                  Chưa có nghi phạm. Hãy ghim một người lên bảng điều tra trước.
                </p>
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-1.5 px-3 font-sans text-xs font-bold uppercase tracking-wider text-[#FB7185] underline underline-offset-4"
                >
                  Điều tra thêm
                </button>
              </div>
            )
          ) : (
            <>
              {/* Polaroid Face-Off Linked by Red String */}
              <div className="relative flex items-center justify-center gap-2 sm:gap-3 py-1 shrink-0">
                {/* Horizontal Red String connecting both Polaroids */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[24%] right-[24%] top-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  <div className="h-[2px] w-full bg-[#E11D48] shadow-[0_1px_4px_rgba(225,29,72,0.5)]" />
                  <span className="absolute flex h-7 w-7 items-center justify-center rounded-full border border-[#FDA4AF]/60 bg-[#E11D48] text-white shadow-md">
                    <IoHeart className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* Husband Polaroid */}
                <figure className="relative z-10 w-[112px] sm:w-[130px] shrink-0 -rotate-[1.8deg] rounded-[2px] border border-[#B8C4D0] bg-[#EEF2F6] p-1 pb-0 shadow-[0_8px_18px_rgba(0,0,0,0.48)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-20 h-4 w-4 rounded-full border border-[#FDA4AF]/50 bg-[radial-gradient(circle_at_35%_30%,#fb7185_0%,#e11d48_55%,#881337_100%)] shadow-[1px_2px_4px_rgba(0,0,0,0.6)]"
                  />
                  <div
                    role="img"
                    aria-label={husbandName}
                    className="aspect-square w-full bg-[#090C10] shadow-inner"
                    style={{
                      backgroundImage: `url(${characterSheet})`,
                      backgroundSize: '660%',
                      backgroundPosition: '60% 31%',
                    }}
                  />
                  <figcaption className="flex min-h-[28px] items-center justify-center px-1 py-1 text-center font-sans text-xs font-bold text-slate-900">
                    {husbandName}
                  </figcaption>
                </figure>

                <div className="w-4 sm:w-8 shrink-0" aria-hidden="true" />

                {/* Suspect Polaroid (minimal: avatar + name only) */}
                <figure className="relative z-10 w-[112px] sm:w-[130px] shrink-0 rotate-[1.6deg] rounded-[2px] border border-[#B8C4D0] bg-[#EEF2F6] p-1 pb-0 shadow-[0_8px_18px_rgba(0,0,0,0.48)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-20 h-4 w-4 rounded-full border border-[#FDA4AF]/50 bg-[radial-gradient(circle_at_35%_30%,#fb7185_0%,#e11d48_55%,#881337_100%)] shadow-[1px_2px_4px_rgba(0,0,0,0.6)]"
                  />
                  <div className="relative aspect-square w-full overflow-hidden bg-[#090C10]">
                    <div className="flex h-full w-full items-center justify-center">
                      <ContactAvatar
                        name={selectedSuspect?.avatarName || selectedSuspect?.displayName || selectedSuspectDisplayName}
                        shape="square"
                        size={128}
                      />
                    </div>
                  </div>
                  <figcaption className="flex min-h-[28px] items-center justify-center px-1 py-1 text-center">
                    <span className="font-sans text-xs font-bold leading-tight text-slate-900 line-clamp-2 break-words">
                      {selectedSuspectDisplayName}
                    </span>
                  </figcaption>
                </figure>
              </div>

              {/* Conviction Strength Meter */}
              <div className="flex flex-col items-center gap-1 border-y border-dashed border-slate-700 py-1.5 shrink-0">
                <span
                  id="confrontation-success-label"
                  className="font-sans text-ios-caption-2 font-bold uppercase tracking-[0.12em] text-slate-300"
                >
                  Tỉ lệ thành công
                </span>
                <div
                  role="progressbar"
                  aria-labelledby="confrontation-success-label"
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-valuenow={filledSegments}
                  aria-valuetext={preflight.convictionChance.label}
                  className="flex w-48 gap-1.5"
                >
                  {[0, 1, 2, 3, 4].map(segment => (
                    <span
                      key={segment}
                      aria-hidden="true"
                      className={`h-2.5 flex-1 rounded-[2px] border ${
                        segment < filledSegments
                          ? isLowSuccessRate
                            ? 'border-[#FB7185]/60 bg-[#E11D48]'
                            : 'border-[#4ADE80]/60 bg-[#22C55E]'
                          : 'border-slate-700 bg-[#0E131B]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Evidence Linkage Summary (scrolls naturally with the dossier) */}
              <section className="shrink-0 space-y-2">
                <h4 className="font-sans text-ios-caption-2 font-bold uppercase tracking-[0.12em] text-slate-300">
                  Bằng chứng liên kết
                </h4>

                {linkedBridges.length > 0 ? (
                  <ul className="space-y-2">
                    {linkedBridges.map(bridge => (
                      <li
                        key={bridge.id}
                        className="dossier-paper-card rounded-[3px] border border-[#B8C4D0] p-2 shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          {renderAppBadge(bridge.sourceApp)}
                          <span className="font-semibold text-slate-900 leading-snug break-words">
                            {bridge.sourceTitle}
                          </span>
                        </div>

                        <div className="my-1 flex items-center gap-1.5 pl-2">
                          <span className="h-3 w-[2px] bg-[#DC2626]/80" aria-hidden="true" />
                          <span
                            className={`inline-flex items-center gap-1 rounded-[2px] border px-1.5 py-0.5 font-sans text-ios-caption-2 font-bold uppercase tracking-wider ${
                              bridge.isSmokingGun
                                ? 'border-rose-300 bg-rose-100 text-rose-800'
                                : 'border-[#B8C4D0] bg-[#D5DDE5] text-slate-700'
                            }`}
                          >
                            <IoLinkOutline className="h-3 w-3 shrink-0" />
                            {bridge.relationshipLabel || 'Mắt xích liên kết'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          {renderAppBadge(bridge.targetApp)}
                          <span className="font-semibold text-slate-900 leading-snug break-words">
                            {bridge.targetTitle}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : verifiedCluesList.length > 0 ? (
                  <ul className="space-y-1.5">
                    {verifiedCluesList.map(clue => (
                      <li
                        key={clue.id}
                        className="dossier-paper-card flex items-start gap-2 rounded-[3px] border border-[#B8C4D0] p-2 text-sm shadow-sm"
                      >
                        <span className="mt-0.5">{renderAppBadge(clue.sourceApp)}</span>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-xs text-slate-900 break-words">{clue.title}</h5>
                          {clue.snippet && (
                            <p className="mt-0.5 line-clamp-2 break-words text-xs leading-relaxed text-slate-600">
                              {clue.snippet}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-[4px] border border-dashed border-slate-700 bg-[#0E131B]/70 py-2.5 text-center font-sans text-xs text-slate-400">
                    Chưa có mắt xích chứng cứ nào được xác thực.
                  </p>
                )}
              </section>

              {preflight.successRate < 100 && (
                <p
                  role="alert"
                  className="flex items-center justify-center gap-2 rounded-[4px] border border-dashed border-[#E11D48]/55 bg-[#E11D48]/12 px-2.5 py-1.5 font-sans text-[11px] font-semibold text-[#FDA4AF] shrink-0"
                >
                  <IoWarningOutline aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[#FB7185]" />
                  Đối chất thất bại: mất 1 lượt nghi ngờ.
                </p>
              )}

              <footer className="flex flex-col gap-1 pt-0.5 shrink-0">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex h-10 items-center justify-between gap-2.5 rounded-[4px] border border-[#FB7185]/40 bg-[#E11D48] px-3.5 text-xs font-sans font-bold uppercase tracking-wider text-white shadow-[0_4px_14px_rgba(225,29,72,0.4)] transition-transform hover:bg-[#BE123C] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <IoChatbubbleEllipsesOutline className="h-4 w-4 shrink-0" />
                    <span>{confrontLabel.toLocaleUpperCase('vi')}!</span>
                  </span>
                  <span className="rounded-[2px] bg-[#090C10] px-1.5 py-0.5 font-sans text-[11px] font-extrabold text-[#FDA4AF] shadow-sm">
                    #01
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="py-1 font-sans text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 underline underline-offset-4"
                >
                  Điều tra thêm
                </button>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
