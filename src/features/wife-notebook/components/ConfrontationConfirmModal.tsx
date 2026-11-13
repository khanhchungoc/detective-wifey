import React, { useEffect, useRef, useState } from 'react';
import {
  IoChatbubbleEllipsesOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoCloseOutline,
  IoChevronBackOutline,
  IoLinkOutline,
  IoFlash,
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
        className="group relative block w-full cursor-pointer rounded-[2px] border border-[#D4C9B6] bg-gradient-to-b from-[#F7F3EA] via-[#F2ECE0] to-[#EAE2D3] p-2 pb-0 sm:p-2.5 sm:pb-0 text-left shadow-[0_12px_24px_rgba(0,0,0,0.46),0_3px_8px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.75)] transition-transform duration-150 hover:-translate-y-0.5 hover:scale-[1.03] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#5C3D24]"
      >
        {/* Square suspect photo with red pushpin and tilted red stamp */}
        <div className="relative aspect-square w-full bg-stone-900">
          <div className="h-full w-full overflow-hidden">
            <ContactAvatar name={photoName} shape="square" fluid />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_rgba(0,0,0,0.12),inset_0_0_18px_rgba(0,0,0,0.16)]"
          />

          {/* Red 3D pushpin at top-left */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-2.5 left-[12%] z-20 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-[#FCA5A5]/45 bg-[radial-gradient(circle_at_35%_30%,#ef4444_0%,#dc2626_48%,#991b1b_85%,#7f1d1d_100%)] shadow-[2px_4px_6px_rgba(0,0,0,0.55)]"
          >
            <div className="relative -translate-x-[0.5px] -translate-y-[0.5px] h-3.5 w-3.5 sm:h-4 sm:w-4 rounded-full bg-[radial-gradient(circle_at_35%_30%,#f87171_0%,#dc2626_65%,#991b1b_100%)] shadow-[1px_2px_3px_rgba(0,0,0,0.45),inset_0_1px_1px_rgba(255,255,255,0.45)]">
              <div className="absolute left-[2px] top-[2px] h-1.5 w-1.5 rounded-full bg-white/65" />
            </div>
          </div>

          {/* Tilted red rectangular stamp */}
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute -right-0.5 top-1 sm:top-1.5 z-10 rotate-[10deg] rounded-[1px] border-[1.5px] border-[#C6221C]/90 bg-[#FAF5EB]/80 shadow-[0_1px_2px_rgba(0,0,0,0.28)] ${
              isSingle ? 'px-2 py-1' : 'px-1.5 py-[3px] sm:px-2 sm:py-1'
            }`}
          >
            <span
              className={`block font-mono font-extrabold uppercase leading-none text-[#C6221C] ${
                isSingle
                  ? 'text-[10px] sm:text-[11px] tracking-[0.12em]'
                  : 'text-[8.5px] sm:text-[10px] tracking-[0.1em]'
              }`}
            >
              {suspect.isUnmasked ? 'Đã lột mặt nạ' : 'Nghi phạm'}
            </span>
          </div>
        </div>

        {/* Polaroid bottom caption chin */}
        <div className={`flex flex-col items-center justify-center px-1 text-center ${isSingle ? 'min-h-[52px] py-2.5' : 'min-h-[44px] sm:min-h-[48px] py-2'}`}>
          <span
            className={`text-center font-bold italic leading-tight tracking-tight text-[#26211D] line-clamp-2 break-words ${
              isSingle ? 'text-sm sm:text-[15px]' : 'text-xs sm:text-[13px]'
            }`}
          >
            {suspect.displayName}
          </span>
          {suspect.isUnmasked && suspect.alias && suspect.alias.trim().toLowerCase() !== suspect.displayName.trim().toLowerCase() && (
            <span className="mt-1 block text-[10px] sm:text-[11px] font-semibold text-rose-800 leading-tight">
              🎭 Vỏ bọc: &quot;{suspect.alias}&quot;
            </span>
          )}
          {suspect.isUnmasked && suspect.unmaskedEvidenceHint && (
            <span className="mt-0.5 block text-[9.5px] sm:text-[10px] font-medium text-stone-600 leading-tight">
              📞 {suspect.unmaskedEvidenceHint}
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
      className="absolute inset-0 z-[75] flex items-center justify-center p-2.5 sm:p-4 bg-[#0E0A07]/85 backdrop-blur-md select-none font-sans animate-fadeIn"
      onClick={onCancel}
      {...swipeHandlers}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="relative w-full max-w-[560px] max-h-[calc(100%_-_1.5rem)] flex flex-col pt-5 animate-scaleUp outline-none"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onCancel(); } }}
      >
        {/* Manila Folder Top File Tab */}
        <div className="pointer-events-none absolute top-0 left-3 z-10 flex items-center rounded-t-[4px] border border-b-0 border-[#C8B99E] bg-[#F2ECE0] px-3 py-1 shadow-sm">
          <span className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#3B2A1E]">
            FILE 01
          </span>
        </div>

        {/* Main Manila Case Dossier Container */}
        <div className="dossier-folder-sheet relative flex min-h-0 flex-1 flex-col gap-3.5 sm:gap-4 overflow-y-auto rounded-[4px] rounded-tl-none border border-[#C8B99E] border-l-[6px] border-l-[#991B1B] p-4 sm:p-5 text-[#26211D]">
          <header className="flex items-center gap-2 border-b border-[#D4C9B6]/80 pb-2.5 shrink-0">
            {!isStep1 && hasSuspectList && (
              <button
                type="button"
                onClick={handleResetSuspect}
                aria-label="Chọn nghi phạm khác"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#4A3828] hover:bg-black/5 outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B]"
              >
                <IoChevronBackOutline className="h-5 w-5" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-[#991B1B]">
                {isStep1 ? 'HỒ SƠ NGHI PHẠM' : 'IN PROGRESS • HỒ SƠ ĐỐI CHẤT'}
              </span>
              <h3
                id="confirm-confrontation-title"
                className={isStep1 ? 'text-base sm:text-lg font-bold tracking-tight text-[#26211D]' : 'sr-only'}
              >
                {isStep1 ? 'Chọn nghi phạm' : 'Xác nhận đối chất'}
              </h3>
            </div>
            {!isStep1 && (
              <span
                aria-hidden="true"
                className="rounded-[2px] bg-[#991B1B] px-2 py-0.5 font-mono text-[11px] font-extrabold tracking-widest text-[#FAF5EB] shadow-sm"
              >
                #01
              </span>
            )}
            <button
              type="button"
              onClick={onCancel}
              aria-label="Đóng"
              className="ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#5C4B3B] hover:bg-black/5 outline-none focus-visible:ring-2 focus-visible:ring-[#991B1B]"
            >
              <IoCloseOutline className="h-5 w-5" />
            </button>
          </header>

          {isStep1 ? (
            hasSuspectList ? (
              <div className="suspect-cork-tray min-h-0 overflow-y-auto rounded-[4px] border-2 border-[#4A2C17]/90 p-4 sm:p-5">
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
                <p className="font-mono text-sm text-[#5C4B3B]">
                  Chưa có nghi phạm. Hãy ghim một người lên bảng điều tra trước.
                </p>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-h-11 px-4 font-mono text-sm font-bold uppercase tracking-wider text-[#991B1B] underline underline-offset-4"
                >
                  Điều tra thêm
                </button>
              </div>
            )
          ) : (
            <>
              {/* Polaroid Face-Off Linked by Red String */}
              <div className="relative flex items-center justify-center gap-2 sm:gap-4 py-2 shrink-0">
                {/* Horizontal Red String connecting both Polaroids */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[24%] right-[24%] top-1/2 -translate-y-1/2 flex items-center justify-center"
                >
                  <div className="h-[2px] w-full bg-[#C6221C] shadow-[0_1px_2px_rgba(0,0,0,0.28)]" />
                  <span className="absolute flex h-7 w-7 items-center justify-center rounded-full border border-[#FCA5A5]/60 bg-[#991B1B] text-[#FAF5EB] shadow-md">
                    <IoFlash className="h-3.5 w-3.5" />
                  </span>
                </div>

                {/* Husband Polaroid */}
                <figure className="relative z-10 w-[124px] sm:w-[140px] shrink-0 -rotate-[1.8deg] rounded-[2px] border border-[#D4C9B6] bg-[#FAF6ED] p-1.5 pb-0 shadow-[0_8px_18px_rgba(0,0,0,0.24)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-20 h-4 w-4 rounded-full border border-[#FCA5A5]/50 bg-[radial-gradient(circle_at_35%_30%,#ef4444_0%,#dc2626_55%,#991b1b_100%)] shadow-[1px_2px_4px_rgba(0,0,0,0.45)]"
                  />
                  <div
                    role="img"
                    aria-label={husbandName}
                    className="aspect-square w-full bg-stone-900 shadow-inner"
                    style={{
                      backgroundImage: `url(${characterSheet})`,
                      backgroundSize: '660%',
                      backgroundPosition: '60% 31%',
                    }}
                  />
                  <figcaption className="flex min-h-[34px] items-center justify-center px-1 py-1 text-center font-mono text-xs font-bold text-[#26211D]">
                    {husbandName}
                  </figcaption>
                </figure>

                <div className="w-6 sm:w-10 shrink-0" aria-hidden="true" />

                {/* Suspect Polaroid */}
                <figure className="relative z-10 w-[124px] sm:w-[140px] shrink-0 rotate-[1.6deg] rounded-[2px] border border-[#D4C9B6] bg-[#FAF6ED] p-1.5 pb-0 shadow-[0_8px_18px_rgba(0,0,0,0.24)]">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 z-20 h-4 w-4 rounded-full border border-[#FCA5A5]/50 bg-[radial-gradient(circle_at_35%_30%,#ef4444_0%,#dc2626_55%,#991b1b_100%)] shadow-[1px_2px_4px_rgba(0,0,0,0.45)]"
                  />
                  <div className="relative aspect-square w-full overflow-hidden bg-stone-900">
                    <div className="flex h-full w-full items-center justify-center">
                      <ContactAvatar
                        name={selectedSuspect?.avatarName || selectedSuspect?.displayName || selectedSuspectDisplayName}
                        shape="square"
                        size={128}
                      />
                    </div>
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-1 top-1 rotate-[8deg] rounded-[1px] border border-[#C6221C] bg-[#FAF5EB]/90 px-1 py-0.5 font-mono text-[8px] font-extrabold uppercase tracking-wider text-[#C6221C]"
                    >
                      {selectedSuspect?.isUnmasked ? 'ĐÃ LỘT MẶT NẠ' : 'NGHI PHẠM'}
                    </span>
                  </div>
                  <figcaption className="flex min-h-[34px] flex-col items-center justify-center px-1 py-1 text-center">
                    <span className="font-mono text-xs font-bold leading-tight text-[#26211D] line-clamp-2 break-words">
                      {selectedSuspectDisplayName}
                    </span>
                    {selectedSuspect?.isUnmasked && selectedSuspect.alias && selectedSuspect.alias.trim().toLowerCase() !== selectedSuspectDisplayName.trim().toLowerCase() && (
                      <span className="mt-0.5 font-mono text-[9px] font-semibold text-[#991B1B] line-clamp-1">
                        🎭 Vỏ bọc: &quot;{selectedSuspect.alias}&quot;
                      </span>
                    )}
                    {selectedSuspect?.isUnmasked && selectedSuspect.unmaskedEvidenceHint && (
                      <span className="font-mono text-[9px] text-[#5C4B3B] line-clamp-1">
                        📞 {selectedSuspect.unmaskedEvidenceHint}
                      </span>
                    )}
                  </figcaption>
                </figure>
              </div>

              {/* Conviction Strength Meter */}
              <div className="flex flex-col items-center gap-1.5 border-y border-dashed border-[#C8B99E] py-2.5 shrink-0">
                <span
                  id="confrontation-success-label"
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#5C4B3B]"
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
                  className="flex w-52 gap-1.5"
                >
                  {[0, 1, 2, 3, 4].map(segment => (
                    <span
                      key={segment}
                      aria-hidden="true"
                      className={`h-2.5 flex-1 rounded-[2px] border ${
                        segment < filledSegments
                          ? isLowSuccessRate
                            ? 'border-[#7F1D1D] bg-[#991B1B]'
                            : 'border-[#14532D] bg-[#15803D]'
                          : 'border-[#C8B99E] bg-[#E5DAC5]'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Evidence Linkage Summary */}
              <section className="min-h-0 overflow-y-auto space-y-2.5 pr-0.5">
                <h4 className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-[#5C4B3B]">
                  Bằng chứng liên kết
                </h4>

                {linkedBridges.length > 0 ? (
                  <ul className="space-y-2.5">
                    {linkedBridges.map(bridge => (
                      <li
                        key={bridge.id}
                        className="dossier-paper-card rounded-[4px] border border-[#D4C9B6] p-2.5 shadow-sm"
                      >
                        <div className="flex items-center gap-2 text-xs">
                          {renderAppBadge(bridge.sourceApp)}
                          <span className="font-semibold text-[#26211D] leading-snug break-words">
                            {bridge.sourceTitle}
                          </span>
                        </div>

                        <div className="my-1.5 flex items-center gap-2 pl-2.5">
                          <span className="h-3.5 w-[2px] bg-[#C6221C]/75" aria-hidden="true" />
                          <span
                            className={`inline-flex items-center gap-1 rounded-[2px] border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider ${
                              bridge.isSmokingGun
                                ? 'border-[#C6221C]/50 bg-[#FEE2E2]/80 text-[#991B1B]'
                                : 'border-[#D4C9B6] bg-[#F2ECE0] text-[#5C4B3B]'
                            }`}
                          >
                            <IoLinkOutline className="h-3 w-3 shrink-0" />
                            {bridge.relationshipLabel || 'Mắt xích liên kết'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          {renderAppBadge(bridge.targetApp)}
                          <span className="font-semibold text-[#26211D] leading-snug break-words">
                            {bridge.targetTitle}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : verifiedCluesList.length > 0 ? (
                  <ul className="space-y-2">
                    {verifiedCluesList.map(clue => (
                      <li
                        key={clue.id}
                        className="dossier-paper-card flex items-start gap-2.5 rounded-[4px] border border-[#D4C9B6] p-2.5 text-sm shadow-sm"
                      >
                        <span className="mt-0.5">{renderAppBadge(clue.sourceApp)}</span>
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold text-xs text-[#26211D] break-words">{clue.title}</h5>
                          {clue.snippet && (
                            <p className="mt-0.5 line-clamp-2 break-words text-xs leading-relaxed text-[#5C4B3B]">
                              {clue.snippet}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="rounded-[4px] border border-dashed border-[#C8B99E] bg-[#FAF6ED]/60 py-3 text-center font-mono text-xs text-[#5C4B3B]">
                    Chưa có mắt xích chứng cứ nào được xác thực.
                  </p>
                )}
              </section>

              {preflight.successRate < 100 && (
                <p
                  role="alert"
                  className="flex items-center justify-center gap-2 rounded-[4px] border border-dashed border-[#991B1B]/50 bg-[#FEE2E2]/60 px-3 py-2 font-mono text-xs font-semibold text-[#991B1B] shrink-0"
                >
                  <IoWarningOutline aria-hidden="true" className="h-4 w-4 shrink-0" />
                  Đối chất thất bại: mất 1 lượt nghi ngờ.
                </p>
              )}

              <footer className="flex flex-col gap-1.5 pt-1 shrink-0">
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex min-h-14 items-center justify-between gap-3 rounded-[4px] border border-[#7F1D1D] bg-[#A31D1D] px-4 text-sm font-mono font-bold uppercase tracking-wider text-[#FAF5EB] shadow-[0_4px_12px_rgba(153,27,27,0.35)] transition-transform hover:bg-[#881818] active:scale-[0.98]"
                >
                  <span className="flex items-center gap-2">
                    <IoChatbubbleEllipsesOutline className="h-5 w-5 shrink-0" />
                    <span>{confrontLabel.toLocaleUpperCase('vi')}!</span>
                  </span>
                  <span className="rounded-[2px] bg-[#FAF5EB] px-2 py-0.5 font-mono text-xs font-extrabold text-[#991B1B] shadow-sm">
                    #01
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="min-h-10 font-mono text-xs font-bold uppercase tracking-wider text-[#5C4B3B] hover:text-[#26211D] underline underline-offset-4"
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
