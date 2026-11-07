import React from 'react';
import { useMotionState } from '../../shared/motion/useMotionState';
import { readAppData } from './data';
import { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';
import { IoChevronBack, IoRibbonOutline, IoBriefcase } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget, UniversalEvidenceModal, UniversalEvidenceItem } from '../../features/investigation';

const BRAND = getAppBrand('professional-network');

export const ProfessionalNetworkApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
}) => {
  const networkData = readAppData(caseData.appsData?.['professional-network'] || {});
  const posts = networkData.posts || [];
  const [evidenceItem, setEvidenceItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');

  const swipeHandlers = useSwipeBack({ onBack: onReturnHome });

  return (
    <div
      {...swipeHandlers}
      className="flex flex-col h-full w-full bg-[#F3F2F0] text-[#191919] select-none font-sans"
    >
      <header className="flex items-center justify-between px-3 h-14 bg-[#0A66C2] text-white shadow-md shrink-0">
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
          <IoRibbonOutline className="w-5 h-5 text-white" />
          <h1 className="text-ios-headline font-bold tracking-tight">{BRAND.brandName}</h1>
        </div>
        <div className="w-11" />
      </header>

      <main className="flex-1 overflow-y-auto p-3 space-y-3 pb-24">
        <div className="flex items-center justify-between px-1 text-ios-caption-1 font-semibold text-[#52525B]">
          <span>BẢNG TIN NGHỀ NGHIỆP</span>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center text-ios-subheadline text-[#52525B]">
            Không có bài đăng mới.
          </div>
        ) : (
          posts.map((post) => (
            <StoryEvidenceTarget
              key={post.id}
              item={{
                title: `Bài đăng: ${post.author}`,
                profileName: post.author,
                subtitle: post.time || BRAND.brandName,
                snippet: post.content,
                suspectToTag: post.suspectName || 'Kỷ niệm 5 năm (1509)',
              }}
              onTriggerEvidence={setEvidenceItem}
            >
              <div
                className="p-4 bg-white rounded-xl shadow-sm border border-[#E0E0E0] space-y-2 min-h-[64px] cursor-pointer hover:bg-blue-50/30 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-ios-subheadline text-[#191919]">{post.author}</h4>
                    <span className="text-ios-caption-2 text-[#52525B]">{post.time}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#B45309] text-ios-caption-2 font-bold">
                    Kỷ niệm 5 năm
                  </span>
                </div>
                <p className="text-ios-footnote text-[#191919] leading-relaxed whitespace-pre-wrap">
                  {post.content}
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
          onPinEvidence={(suspect) => onTagSuspect(suspect, 'professional-network')}
          onClose={() => setEvidenceItem(null)}
        />
      )}
    </div>
  );
};

export const appDefinition: AppDefinition = {
  dataKeys: ['professional-network'],
  appId: 'professional-network',
  displayName: BRAND.brandName,
  icon: IoBriefcase,
  themeGradient: 'from-blue-700 to-indigo-800',
  themeColor: '#0A66C2', bottomBarColor: '#F3F2F0',
  notificationBadgeCount: 1,
  isLocked: false,
  component: ProfessionalNetworkApp,
};

export default ProfessionalNetworkApp;
