import { useMotionState } from '../../shared/motion/useMotionState';
import { readAppData } from './data';
import { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('web-browser');
import { IoChevronBack, IoCompassOutline, IoGlobeOutline, IoSearchOutline } from 'react-icons/io5';
import { IoCompass } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget } from '../../features/investigation';
import { UniversalEvidenceModal, UniversalEvidenceItem } from '../../features/investigation';

export const WebBrowserApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
}) => {
  const browserData = readAppData(caseData.appsData?.['web-browser'] || {});
  const history = browserData.history || [];
  const [evidenceItem, setEvidenceItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');

  const swipeHandlers = useSwipeBack({ onBack: onReturnHome });

  return (
    <div
      {...swipeHandlers}
      className="flex flex-col h-full w-full bg-[#F2F2F7] text-[#111827] select-none font-sans"
    >
      <header className="flex items-center justify-between px-3 h-14 bg-[#3F51B5] text-white shadow-md shrink-0">
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
          <IoCompassOutline className="w-5 h-5 text-white" />
          <h1 className="text-ios-headline font-bold tracking-tight">{BRAND.brandName}</h1>
        </div>
        <div className="w-11" />
      </header>

      {/* Mock Address Bar */}
      <div className="px-3 py-2 bg-white border-b border-slate-200">
        <div className="flex items-center gap-2 px-3 h-9 bg-slate-100 rounded-lg text-ios-footnote text-slate-500 font-mono">
          <IoSearchOutline className="w-3.5 h-3.5 text-[#6B7280]" />
          <span className="truncate">{BRAND.brandName.toLowerCase()}://history/today</span>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-3 space-y-2 pb-24">
        <div className="flex items-center justify-between px-1 text-ios-caption-1 font-semibold text-slate-500">
          <span>LỊCH SỬ DUYỆT WEB HÔM NAY</span>
        </div>

        {history.length === 0 ? (
          <div className="p-8 text-center text-ios-subheadline text-slate-500">
            Không có lịch sử tìm kiếm.
          </div>
        ) : (
          history.map((item) => (
            <StoryEvidenceTarget
              key={item.id}
              item={{
                title: item.title,
                profileName: caseData.husbandName,
                subtitle: `${item.time} • ${item.url}`,
                snippet: `Tìm kiếm: "${item.title}"\nURL: ${item.url}`,
                suspectToTag: item.suspectName || item.title || 'Lịch sử duyệt web',
              }}
              onTriggerEvidence={setEvidenceItem}
            >
              <div
                className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all space-y-1 min-h-[52px]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <IoGlobeOutline className="w-4 h-4 text-[#3F51B5] shrink-0" />
                    <h4 className="font-bold text-ios-subheadline text-[#111827] truncate">{item.title}</h4>
                  </div>
                  <span className="text-ios-caption-2 text-[#64748B]">Nhấn giữ</span>
                </div>
                <p className="text-ios-caption-1 text-[#64748B] font-mono truncate">{item.url}</p>
                <span className="text-ios-caption-2 text-[#64748B] block">{item.time}</span>
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
          onPinEvidence={(suspect) => onTagSuspect(suspect, 'web-browser')}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
};

export const appDefinition: AppDefinition = {
  dataKeys: ['web-browser'],
  appId: 'web-browser',
  displayName: BRAND.brandName,
  icon: IoCompass,
  themeGradient: 'from-blue-600 to-indigo-700',
  themeColor: '#3F51B5', bottomBarColor: '#F2F2F7',
  notificationBadgeCount: 0,
  isLocked: false,
  component: WebBrowserApp,
};

export default WebBrowserApp;
