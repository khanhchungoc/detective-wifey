import { useMotionState } from '../../shared/motion/useMotionState';
import { readAppData } from './data';
import React from 'react';
import { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { IoChevronBack, IoDocumentTextOutline } from 'react-icons/io5';
import { IoDocumentText } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget } from '../../features/investigation';
import { UniversalEvidenceModal, UniversalEvidenceItem } from '../../features/investigation';

export const PersonalNotesApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
}) => {
  const notesData = readAppData(caseData.appsData?.['personal-notes'] || caseData.appsData?.husband_notes || {});
  const notes = notesData.notes || [];
  const [evidenceItem, setEvidenceItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');

  const swipeHandlers = useSwipeBack({ onBack: onReturnHome });

  return (
    <div
      {...swipeHandlers}
      className="flex flex-col h-full w-full bg-[#FFF9E6] text-[#202124] select-none font-sans"
    >
      <header className="flex items-center justify-between px-3 h-14 bg-[#1A73E8] text-white shadow-md shrink-0">
        <button
          type="button"
          onClick={onReturnHome}
          className="flex items-center gap-1 min-w-[44px] min-h-[44px] px-2 text-sm font-semibold rounded-lg hover:bg-white/10 active:scale-95 transition-all"
          aria-label="Trang chủ"
        >
          <IoChevronBack className="w-5 h-5" />
          <span>Trang chủ</span>
        </button>
        <div className="flex items-center gap-2">
          <IoDocumentTextOutline className="w-5 h-5 text-white" />
          <h1 className="text-ios-headline font-bold tracking-tight">Ghi chú của chồng</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
        <div className="flex items-center justify-between px-1 text-ios-caption-1 font-semibold text-[#52525B]">
          <span>DANH SÁCH GHI CHÚ BÍ MẬT</span>
        </div>

        {notes.length === 0 ? (
          <div className="p-8 text-center text-ios-subheadline text-[#374151]">
            Không có ghi chú nào.
          </div>
        ) : (
          notes.map((note) => (
            <StoryEvidenceTarget
              key={note.id}
              item={{
                title: note.title,
                profileName: caseData.husbandName,
                subtitle: 'Ghi chú bảo mật',
                snippet: note.content,
                suspectToTag: note.suspectName || note.title || 'Ghi chú bí mật',
              }}
              onTriggerEvidence={setEvidenceItem}
            >
              <div
                className="p-4 bg-white rounded-xl shadow-sm border border-[#E5E7EB] space-y-2 min-h-[64px] cursor-pointer hover:bg-amber-50/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ios-subheadline text-[#202124]">{note.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#B45309] text-ios-caption-2 font-bold">
                    Bảo mật
                  </span>
                </div>
                <p className="text-ios-footnote text-[#374151] leading-relaxed font-mono whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            </StoryEvidenceTarget>
          ))
        )}
      </main>

      {/* Universal Blurred Pop-up on Long Press */}
      {evidenceItem && (
        <UniversalEvidenceModal
          isOpen={Boolean(evidenceItem)}
          item={evidenceItem}
          onPinEvidence={(suspect) => onTagSuspect(suspect, 'personal-notes')}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
};

export const appDefinition: AppDefinition = {
  dataKeys: ['personal-notes', 'husband_notes'],
  appId: 'personal-notes',
  displayName: 'Ghi chú',
  icon: IoDocumentText,
  themeGradient: 'from-amber-500 to-yellow-600',
  themeColor: '#1A73E8', bottomBarColor: '#FFF9E6',
  notificationBadgeCount: 0,
  isLocked: false,
  component: PersonalNotesApp,
};

export const HusbandNotesApp = PersonalNotesApp;
export default PersonalNotesApp;

