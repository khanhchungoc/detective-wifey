import { useMotionState } from '../../shared/motion/useMotionState';
import { readAppData } from './data';
import { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('team-collaboration');
import { IoChevronBack, IoPeopleOutline } from 'react-icons/io5';
import { IoPeople } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget } from '../../features/investigation';
import { UniversalEvidenceModal, UniversalEvidenceItem } from '../../features/investigation';

export const TeamCollaborationApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
}) => {
  const teamData = readAppData(caseData.appsData?.['team-collaboration'] || {});
  const channels = teamData.channels || [];
  const [evidenceItem, setEvidenceItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');

  const swipeHandlers = useSwipeBack({ onBack: onReturnHome });

  return (
    <div
      {...swipeHandlers}
      className="flex flex-col h-full w-full bg-[#F5F5F5] text-[#252424] select-none font-sans"
    >
      <header className="flex items-center justify-between px-3 h-14 bg-[#464EB8] text-white shadow-md shrink-0">
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
          <IoPeopleOutline className="w-5 h-5 text-white" />
          <h1 className="text-ios-headline font-bold tracking-tight">{BRAND.brandName}</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
        <div className="flex items-center justify-between px-1 text-ios-caption-1 font-semibold text-[#52525B]">
          <span>KÊNH LÀM VIỆC NHÓM</span>
        </div>

        {channels.length === 0 ? (
          <div className="p-8 text-center text-ios-subheadline text-[#52525B]">
            Không có thông báo nhóm mới.
          </div>
        ) : (
          channels.map((ch) => (
            <StoryEvidenceTarget
              key={ch.id}
              item={{
                title: `Kênh: ${ch.name}`,
                subtitle: BRAND.brandName,
                snippet: ch.lastMessage,
                suspectToTag: ch.suspectName || 'Tin nhắn nội bộ',
              }}
              onTriggerEvidence={setEvidenceItem}
            >
              <div
                className="p-4 bg-white rounded-xl shadow-sm border border-slate-200 space-y-1.5 min-h-[64px] cursor-pointer hover:bg-slate-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ios-subheadline text-[#464EB8]">{ch.name}</h4>
                  <span className="text-ios-caption-2 text-[#64748B]">Nhấn giữ</span>
                </div>
                <p className="text-ios-footnote text-[#252424]">{ch.lastMessage}</p>
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
          onPinEvidence={(suspect) => onTagSuspect(suspect, 'team-collaboration')}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
};

export const appDefinition: AppDefinition = {
  dataKeys: ['team-collaboration'],
  appId: 'team-collaboration',
  displayName: BRAND.brandName,
  icon: IoPeople,
  themeGradient: 'from-indigo-600 to-purple-700',
  themeColor: '#464EB8', bottomBarColor: '#F5F5F5',
  notificationBadgeCount: 2,
  isLocked: false,
  component: TeamCollaborationApp,
};

export default TeamCollaborationApp;

