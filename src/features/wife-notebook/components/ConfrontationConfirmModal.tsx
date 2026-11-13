import React, { useEffect, useRef, useState } from 'react';
import {
  IoChatbubbleEllipsesOutline,
  IoHeart,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoCloseOutline,
  IoChevronBackOutline,
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
          {suspect.isUnmasked && suspect.alias && (
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
  } = preflight;

  const selectedSuspectDisplayName = selectedSuspect?.displayName || '';
  const filledSegments = Math.max(1, Math.ceil(preflight.successRate / 20));

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

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="confirm-confrontation-title"
      className="absolute inset-0 z-[75] flex items-center justify-center p-2 sm:p-3 bg-black/75 backdrop-blur-md select-none font-sans animate-fadeIn"
      onClick={onCancel} {...swipeHandlers}>
      <div ref={dialogRef} tabIndex={-1}
        className="w-full max-w-[560px] max-h-[calc(100%_-_1rem)] bg-white rounded-3xl p-4 sm:p-6 shadow-2xl text-slate-900 flex flex-col gap-4 sm:gap-5 animate-scaleUp overflow-y-auto outline-none"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => { if (e.key === 'Escape') { e.stopPropagation(); onCancel(); } }}>
        <header className="flex items-center gap-2 shrink-0">
          {!isStep1 && hasSuspectList && (
            <button type="button" onClick={handleResetSuspect} aria-label="Chọn nghi phạm khác"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-black/5 outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
              <IoChevronBackOutline className="h-5 w-5" />
            </button>
          )}
          <h3 id="confirm-confrontation-title" className={isStep1 ? "flex-1 text-base sm:text-lg font-bold tracking-tight" : "sr-only"}>
            {isStep1 ? 'Chọn nghi phạm' : 'Xác nhận đối chất'}
          </h3>
          <button type="button" onClick={onCancel} aria-label="Đóng"
            className="ml-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-black/5 outline-none focus-visible:ring-2 focus-visible:ring-rose-500">
            <IoCloseOutline className="h-5 w-5" />
          </button>
        </header>
        {isStep1 ? (
          hasSuspectList ? (
            <div className="suspect-cork-tray min-h-0 overflow-y-auto rounded-2xl border-2 border-[#4A2C17]/90 p-4 sm:p-6">
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
              <p className="text-sm text-stone-500">Chưa có nghi phạm. Hãy ghim một người lên bảng điều tra trước.</p>
              <button type="button" onClick={onCancel} className="min-h-11 px-4 text-sm font-semibold text-rose-700">Điều tra thêm</button>
            </div>
          )
        ) : (
          <>
            <div className="relative flex items-center justify-center gap-3 py-3 shrink-0">
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-40 rounded-full bg-[radial-gradient(ellipse,rgba(225,29,72,0.14),transparent_70%)]" />
              <figure className="relative flex min-w-0 flex-1 flex-col items-center gap-3">
                <div role="img" aria-label={husbandName}
                  className="h-32 w-32 rounded-full ring-4 ring-[#D4B977]/30 shadow-lg"
                  style={{ backgroundImage: `url(${characterSheet})`, backgroundSize: '660%', backgroundPosition: '60% 31%' }} />
                <figcaption className="text-center text-lg font-bold">{husbandName}</figcaption>
              </figure>
              <IoHeart aria-hidden="true" className="relative h-10 w-10 shrink-0 text-rose-600" />
              <figure className="relative flex min-w-0 flex-1 flex-col items-center gap-3">
                <span className="relative shrink-0">
                  <ContactAvatar name={selectedSuspect?.avatarName || selectedSuspect?.displayName || selectedSuspectDisplayName} size={128} />
                </span>
                <figcaption className="text-center text-sm font-bold break-words">
                  {selectedSuspectDisplayName}
                  {selectedSuspect?.isUnmasked && selectedSuspect.alias && (
                    <span className="block mt-1 text-xs font-semibold text-rose-700">
                      🎭 Vỏ bọc: &quot;{selectedSuspect.alias}&quot;
                    </span>
                  )}
                  {selectedSuspect?.isUnmasked && selectedSuspect.unmaskedEvidenceHint && (
                    <span className="block mt-0.5 text-[11px] font-medium text-stone-600">
                      📞 {selectedSuspect.unmaskedEvidenceHint}
                    </span>
                  )}
                </figcaption>
              </figure>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <span id="confrontation-success-label" className="text-sm font-semibold text-stone-600">Tỉ lệ thành công</span>
              <div role="progressbar" aria-labelledby="confrontation-success-label"
                aria-valuemin={0} aria-valuemax={5} aria-valuenow={filledSegments}
                aria-valuetext={preflight.convictionChance.label}
                className="flex w-48 gap-1.5">
                {[0, 1, 2, 3, 4].map(segment => (
                  <span key={segment} aria-hidden="true"
                    className={`h-2.5 flex-1 rounded-full ${segment < filledSegments ? (isLowSuccessRate ? 'bg-rose-600' : 'bg-emerald-600') : 'bg-[#D4B977]/30'}`} />
                ))}
              </div>
            </div>
            <section className="min-h-0 overflow-y-auto space-y-2">
              <h4 className="sr-only">Bằng chứng</h4>
              {verifiedCluesList.length ? (
                <ul className="space-y-4">
                  {verifiedCluesList.map(clue => {
                    const app = clue.sourceApp ? getSourceApp?.(clue.sourceApp) : undefined;
                    return (
                      <li key={clue.id} className="flex items-start gap-3 text-sm">
                        {app ? (
                          <span role="img" aria-label={app.displayName} className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-md text-white bg-gradient-to-br ${app.themeGradient}`}>
                            {app.iconAsset ? <img src={app.iconAsset} alt="" className="h-full w-full object-cover" /> : <app.icon className="h-4 w-4" />}
                          </span>
                        ) : <IoDocumentTextOutline aria-hidden="true" className="mt-0.5 h-6 w-6 shrink-0 text-stone-400" />}
                        <div className="min-w-0 flex-1">
                          <h5 className="font-semibold break-words">{clue.title}</h5>
                          {clue.snippet && (
                            <ul className="mt-1 list-disc pl-4 text-stone-600 marker:text-rose-500">
                              <li><p className="line-clamp-3 break-words leading-relaxed">{clue.snippet}</p></li>
                            </ul>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : <p className="py-3 text-center text-sm text-stone-500">Chưa có bằng chứng đã xác thực.</p>}

            </section>
            {preflight.successRate < 100 && (
              <p role="alert" className="flex items-center justify-center gap-2 text-sm font-medium text-rose-700 shrink-0">
                <IoWarningOutline aria-hidden="true" className="h-5 w-5 shrink-0" />
                Đối chất thất bại: mất 1 lượt nghi ngờ.
              </p>
            )}
            <footer className="flex flex-col gap-1 shrink-0">
              <button type="button" onClick={handleConfirm}
                className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 text-sm font-semibold text-white hover:bg-rose-700 active:scale-[0.98]">
                <IoChatbubbleEllipsesOutline className="h-5 w-5" />
                {confrontLabel.toLocaleUpperCase('vi')}!
              </button>
              <button type="button" onClick={onCancel} className="min-h-11 text-sm font-medium text-slate-600 hover:text-slate-900">Điều tra thêm</button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
};
