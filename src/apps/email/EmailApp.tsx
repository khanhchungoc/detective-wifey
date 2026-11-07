import { useMotionState } from '../../shared/motion/useMotionState';
import { readAppData } from './data';
import { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('email');
import { IoChevronBack, IoMailOutline, IoStar } from 'react-icons/io5';
import { IoMail } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget } from '../../features/investigation';
import { UniversalEvidenceModal, UniversalEvidenceItem } from '../../features/investigation';

export const EmailApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
}) => {
  const emailData = readAppData(caseData.appsData?.email || {});
  const emails = emailData.emails || [];
  const [selectedMail, setSelectedMail] = useMotionState<(typeof emails)[number] | null>(null, 'navigation');
  const [evidenceItem, setEvidenceItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');

  const rootSwipeHandlers = useSwipeBack({
    onBack: onReturnHome,
    enabled: !selectedMail,
  });

  const detailSwipeHandlers = useSwipeBack({
    onBack: () => setSelectedMail(null),
    enabled: Boolean(selectedMail),
  });

  return (
    <div className="relative flex flex-col h-full w-full bg-[#FFFFFF] text-[#202124] select-none font-sans overflow-hidden">
      {/* Base Layer: Email Inbox List */}
      <div
        {...rootSwipeHandlers}
        className="flex flex-col h-full w-full bg-[#FFFFFF] min-h-0 relative overflow-hidden"
        inert={Boolean(selectedMail)}
        aria-hidden={Boolean(selectedMail)}
      >
        <header className="flex items-center justify-between px-3 h-14 bg-[#EA4335] text-white shadow-md shrink-0">
          <button
            type="button"
            onClick={onReturnHome}
            className="flex items-center gap-1 min-w-[44px] min-h-[44px] px-2 text-ios-subheadline font-semibold rounded-lg hover:bg-white/10 active:scale-95 transition-all"
            aria-label="Trang chủ"
          >
            <IoChevronBack className="w-5 h-5" />
            <span>Trang chủ</span>
          </button>
          <div className="flex items-center gap-2">
            <IoMailOutline className="w-5 h-5 text-white" />
            <h1 className="text-ios-headline font-bold tracking-tight">{BRAND.brandName}</h1>
          </div>
          <div className="w-11" />
        </header>

        <main className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
          <div className="flex items-center justify-between px-1 text-ios-caption-1 font-semibold text-[#52525B]">
            <span>HỘP THƯ ĐẾN</span>
          </div>

          {emails.length === 0 ? (
            <div className="p-8 text-center text-ios-subheadline text-[#52525B]">
              Hộp thư đến trống.
            </div>
          ) : (
            emails.map((mail) => (
              <StoryEvidenceTarget
                key={mail.id}
                item={{
                  title: mail.subject,
                  profileName: mail.sender,
                  subtitle: mail.time,
                  snippet: mail.snippet,
                  suspectToTag: mail.suspectName || mail.subject || 'Email chứng cứ',
                }}
                onTriggerEvidence={setEvidenceItem}
              >
                <div
                  onClick={() => setSelectedMail(mail)}
                  className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 cursor-pointer transition-all space-y-1.5 min-h-[72px]"
                >
                  <div className="flex justify-between items-center text-ios-subheadline">
                    <span className="font-bold text-[#202124]">{mail.sender}</span>
                    <IoStar className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="font-semibold text-ios-footnote text-[#1A73E8]">{mail.subject}</h4>
                  <p className="text-ios-caption-1 text-[#52525B] line-clamp-2">{mail.snippet}</p>
                </div>
              </StoryEvidenceTarget>
            ))
          )}
        </main>

        {/* Dimmed Scrim Overlay */}
        {selectedMail && (
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/40 z-10 pointer-events-none transition-opacity duration-200"
          />
        )}
      </div>

      {/* Top Layer: Selected Mail Detail */}
      {selectedMail && (
        <div
          {...detailSwipeHandlers}
          data-detail-layer
          className="absolute inset-0 z-20 flex flex-col h-full w-full bg-[#FFFFFF] shadow-2xl overflow-hidden"
        >
          <header className="flex items-center justify-between px-3 h-14 bg-[#EA4335] text-white shadow-md shrink-0">
            <button
              type="button"
              onClick={() => setSelectedMail(null)}
              className="flex items-center gap-1 min-w-[44px] min-h-[44px] px-2 text-ios-subheadline font-semibold rounded-lg hover:bg-white/10 active:scale-95 transition-all"
              aria-label="Quay lại hộp thư"
            >
              <IoChevronBack className="w-5 h-5" />
              <span>Hộp thư</span>
            </button>
            <div className="flex items-center gap-2">
              <IoMailOutline className="w-5 h-5 text-white" />
              <h1 className="text-ios-headline font-bold tracking-tight">{BRAND.brandName}</h1>
            </div>
            <div className="w-11" />
          </header>

          <main className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
            <StoryEvidenceTarget
              item={{
                title: selectedMail.subject,
                profileName: selectedMail.sender,
                subtitle: selectedMail.time,
                snippet: selectedMail.snippet,
                suspectToTag: selectedMail.suspectName || selectedMail.subject || 'Email chứng cứ',
              }}
              onTriggerEvidence={setEvidenceItem}
            >
              <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 space-y-3 cursor-pointer hover:bg-slate-50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-ios-subheadline text-[#202124]">{selectedMail.subject}</h3>
                    <p className="text-ios-caption-1 text-[#52525B] mt-0.5">{selectedMail.sender}</p>
                  </div>
                  <span className="text-ios-caption-2 text-[#64748B]">{selectedMail.time || 'Hôm nay'}</span>
                </div>
                <div className="pt-2 border-t border-slate-100 text-ios-body text-[#3C4043] leading-relaxed whitespace-pre-wrap">
                  {selectedMail.snippet}
                </div>
              </div>
            </StoryEvidenceTarget>
          </main>
        </div>
      )}

      {/* Universal Blurred Pop-up on Long Press */}
      {evidenceItem && (
        <UniversalEvidenceModal
          isOpen={Boolean(evidenceItem)}
          item={evidenceItem}
          onPinEvidence={(suspect) => onTagSuspect(suspect, 'email')}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
};

export const appDefinition: AppDefinition = {
  dataKeys: ['email'],
  appId: 'email',
  displayName: BRAND.brandName,
  icon: IoMail,
  themeGradient: 'from-red-500 to-rose-600',
  themeColor: '#EA4335', bottomBarColor: '#FFFFFF',
  notificationBadgeCount: 4,
  isLocked: false,
  component: EmailApp,
};

export default EmailApp;

