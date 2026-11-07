import { useMotionState } from '../../shared/motion/useMotionState';
import { readAppData } from './data';
import { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';

const BRAND = getAppBrand('ride-hailing');
import { IoCarOutline, IoChevronBack, IoLocation } from 'react-icons/io5';
import { IoCar } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget } from '../../features/investigation';
import { UniversalEvidenceModal, UniversalEvidenceItem } from '../../features/investigation';

export const RideHailingApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
}) => {
  const rideData = readAppData(caseData.appsData?.['ride-hailing'] || {});
  const trips = rideData.trips || [];
  const [selectedTrip, setSelectedTrip] = useMotionState<(typeof trips)[number] | null>(null, 'sheet');
  const [evidenceItem, setEvidenceItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');

  const handleBack = () => {
    if (selectedTrip) {
      setSelectedTrip(null);
    } else {
      onReturnHome();
    }
  };

  const swipeHandlers = useSwipeBack({ onBack: handleBack });

  return (
    <div
      {...swipeHandlers}
      className="flex flex-col h-full w-full bg-[#F3F4F6] text-[#1F2937] select-none font-sans"
    >
      <header className="flex items-center justify-between px-3 h-14 bg-[#00B14F] text-white shadow-md shrink-0">
        <button
          type="button"
          onClick={selectedTrip ? () => setSelectedTrip(null) : onReturnHome}
          className="flex items-center gap-1 min-w-[44px] min-h-[44px] px-2 text-ios-subheadline font-semibold rounded-lg hover:bg-white/10 active:scale-95 transition-all"
          aria-label={selectedTrip ? 'Quay lại' : 'Trang chủ'}
        >
          <IoChevronBack className="w-5 h-5" />
          <span>{selectedTrip ? 'Hoạt động' : 'Trang chủ'}</span>
        </button>
        <div className="flex items-center gap-2">
          <IoCarOutline className="w-5 h-5 text-white" />
          <h1 className="text-ios-headline font-bold tracking-tight">{BRAND.brandName}</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
        <div className="flex items-center justify-between px-1 text-ios-caption-1 font-semibold text-slate-500">
          <span>LỊCH SỬ CHUYẾN ĐI & GIAO HÀNG</span>
        </div>

        {trips.length === 0 ? (
          <div className="p-8 text-center text-ios-subheadline text-slate-500">
            Không có chuyến đi gần đây.
          </div>
        ) : (
          trips.map((trip) => (
            <StoryEvidenceTarget
              key={trip.id}
              item={{
                title: `Chuyến đi: ${trip.driver}`,
                profileName: trip.driver,
                subtitle: `${trip.time} • ${trip.cost}`,
                snippet: `Điểm đón: ${trip.pickup}\nĐiểm đến: ${trip.dropoff}\nTài xế: ${trip.driver}\nCước phí: ${trip.cost}`,
                suspectToTag: trip.suspectName || trip.dropoff || 'Chuyến đi',
              }}
              onTriggerEvidence={setEvidenceItem}
            >
              <div
                onClick={() => setSelectedTrip(trip)}
                className="p-3.5 bg-white rounded-xl shadow-sm border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all space-y-2 min-h-[64px]"
              >
                <div className="flex justify-between items-center text-ios-caption-1">
                  <span className="font-bold text-[#1F2937]">{trip.driver}</span>
                  <span className="font-mono font-bold text-[#00B14F]">{trip.cost}</span>
                </div>
                <div className="space-y-1 text-ios-footnote text-slate-600">
                  <div className="flex items-center gap-2">
                    <IoLocation className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="truncate">{trip.pickup}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IoLocation className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="truncate">{trip.dropoff}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-slate-100 text-ios-caption-2 text-[#64748B]">
                  <span>{trip.time}</span>
                  <span className="text-[#64748B]">Nhấn giữ</span>
                </div>
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
          onPinEvidence={(suspect) => onTagSuspect(suspect, 'ride-hailing')}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
};

export const appDefinition: AppDefinition = {
  dataKeys: ['ride-hailing'],
  appId: 'ride-hailing',
  displayName: BRAND.brandName,
  icon: IoCar,
  themeGradient: 'from-emerald-500 to-green-600',
  themeColor: '#00B14F', bottomBarColor: '#F3F4F6',
  notificationBadgeCount: 0,
  isLocked: false,
  component: RideHailingApp,
};

export default RideHailingApp;
