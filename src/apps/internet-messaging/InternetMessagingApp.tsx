import React, { useLayoutEffect, useRef, useState } from 'react';
import { readMessagingData } from './data';
import { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { getAppBrand } from '../../shared/branding';
import type { EvidenceSource } from '../../shared/contracts/evidence';
import { IoChatbubbleOutline } from 'react-icons/io5';
import messagingIcon from './assets/messaging-icon.svg';
import { MessagingTab, MessagingBottomNav } from './components/MessagingBottomNav';
import { MessagingInboxView } from './components/MessagingInboxView';
import { MessagingChatThreadView } from './components/MessagingChatThreadView';
import { MessagingContactsView } from './components/MessagingContactsView';
import { MessagingProfileView } from './components/MessagingProfileView';
import { MessagingDiscoverView } from './components/MessagingDiscoverView';
import { MessagingTimelineView } from './components/MessagingTimelineView';
import { MessagingMyDocumentsView } from './components/MessagingMyDocumentsView';
import { MessagingThread, MessagingContact, MessagingCloudDocument } from './types';

const DEFAULT_CONTACTS: MessagingContact[] = [
  {
    id: 'c_bach',
    name: 'Anh Bách QLDA - Ban Quản Lý Toà Nhà',
    department: 'Phòng 402 - Toà Diamond',
    section: 'A',
    avatarGradient: 'from-slate-500 to-slate-700',
  },
  {
    id: 'c_bao_ve',
    name: 'Bác Bảo Vệ Chung Cư',
    department: 'Trực ca đêm sảnh B',
    section: 'B',
    avatarGradient: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'c_lan_anh',
    name: 'Lan Anh Kế Toán',
    department: 'Phòng Tài Chính Kế Toán',
    section: 'L',
    avatarGradient: 'from-teal-400 to-emerald-600',
  },
];

const DEFAULT_CLOUD_DOCS: MessagingCloudDocument[] = [
  {
    id: 'doc_hook',
    fileName: 'quy_uoc_hook.txt',
    date: '11/10/2026',
    fileSize: '1 KB',
    description: 'Quy ước đặt tên hook của nhóm',
    fileType: 'text',
    textMessage: 'Tên hook bắt đầu bằng use, theo camelCase. Ví dụ: useCart.',
  },
  {
    id: 'doc_03',
    fileName: 'Bang_luong_thang_9_CTY.xlsx',
    date: '05/10/2026',
    fileSize: '320 KB',
    description: 'Bảng lương nội bộ & KPI dự án Technosoft',
    fileType: 'xlsx',
  },
];

const DEFAULT_OTHER_THREADS: MessagingThread[] = [
  {
    threadId: 'thread_viettel',
    contactName: 'Viettel CSKH',
    avatarGradient: 'from-red-500 to-rose-600',
    lastMessage: 'Viettel: Quý khách được tặng 50% giá trị thẻ nạp...',
    timestamp: '1 ngày',
    unreadCount: 0,
    isMuted: true,
    messages: [
      {
        id: 'vtl_1',
        sender: 'them',
        text: 'Viettel thông báo: Quý khách được tặng 50% giá trị thẻ nạp khi nạp qua Ví điện tử hôm nay.',
        time: '08:00',
      },
    ],
  },
];

export const InternetMessagingApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
}) => {
  const messagingData = readMessagingData(
    caseData.appsData?.['internet-messaging'],
  );

  const threads: MessagingThread[] = messagingData.threads || [];
  const otherThreads: MessagingThread[] =
    messagingData.otherThreads && messagingData.otherThreads.length > 0
      ? messagingData.otherThreads
      : DEFAULT_OTHER_THREADS;

  const contacts: MessagingContact[] =
    messagingData.contacts && messagingData.contacts.length > 0
      ? messagingData.contacts
      : DEFAULT_CONTACTS;

  const cloudDocuments: MessagingCloudDocument[] =
    messagingData.cloudDocuments && messagingData.cloudDocuments.length > 0
      ? messagingData.cloudDocuments
      : DEFAULT_CLOUD_DOCS;

  const currentUser = messagingData.currentUser || {
    name: 'Nguyễn Huy Hoàng',
    handle: 'hoang_tech88',
    avatarInitials: 'H',
    statusText: 'Đang làm việc...',
  };

  const [activeTab, setActiveTab] = useState<MessagingTab>('messages');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showCloudDrawer, setShowCloudDrawer] = useState(false);
  const detailLayerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const swipeProgressRef = useRef(0);
  const swipeDisplacementRef = useRef(0);
  const closingRef = useRef(false);
  const activeAnimsRef = useRef<Animation[]>([]);

  const DETAIL_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
  const isReducedMotion = () =>
    typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);

  const cancelActiveAnims = () => {
    for (const anim of activeAnimsRef.current) {
      anim.cancel();
    }
    activeAnimsRef.current = [];
  };

  // Active chat thread if any
  const activeThread =
    threads.find((t) => t.threadId === selectedThreadId) ||
    otherThreads.find((t) => t.threadId === selectedThreadId);

  const isDetailActive = Boolean((selectedThreadId && activeThread) || showCloudDrawer);
  const detailKey = selectedThreadId && activeThread ? `thread-${activeThread.threadId}` : showCloudDrawer ? 'cloud' : null;

  useLayoutEffect(() => {
    if (!detailKey) return;
    closingRef.current = false;
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;
    cancelActiveAnims();

    const detailEl = detailLayerRef.current;
    const scrimEl = scrimRef.current;
    if (detailEl) detailEl.style.pointerEvents = '';
    if (scrimEl) scrimEl.style.opacity = '1';

    if (isReducedMotion() || !detailEl || typeof detailEl.animate !== 'function') return;

    const anims: Animation[] = [
      detailEl.animate(
        [{ transform: 'translate3d(100%, 0, 0)' }, { transform: 'translate3d(0, 0, 0)' }],
        { duration: 280, easing: DETAIL_EASE }
      ),
    ];
    if (scrimEl && typeof scrimEl.animate === 'function') {
      anims.push(scrimEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: DETAIL_EASE }));
    }
    activeAnimsRef.current = anims;
    return () => cancelActiveAnims();
  }, [detailKey]);

  const handleDetailSwipeProgress = (progress: number, displacement: number) => {
    swipeProgressRef.current = progress;
    swipeDisplacementRef.current = displacement;
    if (scrimRef.current) {
      scrimRef.current.style.opacity = String(Math.max(0, 1 - progress));
    }
  };

  const handleDetailSwipeEnd = (committed: boolean) => {
    if (committed) return;
    const fromOpacity = Math.max(0, 1 - swipeProgressRef.current);
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;
    const scrimEl = scrimRef.current;
    if (!scrimEl) return;
    scrimEl.style.opacity = '1';
    if (!isReducedMotion() && typeof scrimEl.animate === 'function' && fromOpacity < 1) {
      scrimEl.animate([{ opacity: fromOpacity }, { opacity: 1 }], { duration: 280, easing: DETAIL_EASE });
    }
  };

  const closeDetail = (commitClose: () => void) => {
    if (closingRef.current) return;
    const displacementPx = swipeDisplacementRef.current;
    const progress = swipeProgressRef.current;
    swipeProgressRef.current = 0;
    swipeDisplacementRef.current = 0;

    const detailEl = detailLayerRef.current;
    const scrimEl = scrimRef.current;
    if (isReducedMotion() || !detailEl || typeof detailEl.animate !== 'function') {
      commitClose();
      return;
    }

    closingRef.current = true;
    cancelActiveAnims();
    detailEl.style.pointerEvents = 'none';

    // Clear any inline swipe displacement on the inner detail surface so outer + inner transforms never double-stack for a frame.
    const innerSurface = detailEl.firstElementChild;
    if (innerSurface instanceof HTMLElement) {
      innerSurface.style.transform = '';
    }

    const duration = displacementPx > 0 ? Math.max(150, Math.round(280 * (1 - progress))) : 280;
    const fromTransform = displacementPx > 0 ? `translate3d(${displacementPx}px, 0, 0)` : 'translate3d(0, 0, 0)';
    // Lock final off-screen transform inline so cancelling animations on unmount can never flash back to 0px.
    detailEl.style.transform = 'translate3d(100%, 0, 0)';
    const detailAnim = detailEl.animate(
      [{ transform: fromTransform }, { transform: 'translate3d(100%, 0, 0)' }],
      { duration, easing: DETAIL_EASE }
    );
    const anims: Animation[] = [detailAnim];

    if (scrimEl && typeof scrimEl.animate === 'function') {
      const fromOpacity = Math.max(0, 1 - progress);
      scrimEl.style.opacity = '0';
      anims.push(
        scrimEl.animate([{ opacity: fromOpacity }, { opacity: 0 }], {
          duration,
          easing: DETAIL_EASE,
        })
      );
    }
    activeAnimsRef.current = anims;

    const finish = () => {
      closingRef.current = false;
      commitClose();
    };
    void detailAnim.finished.then(finish, finish);
  };

  const handleTag = (suspectName: string, source?: EvidenceSource) => {
    onTagSuspect(suspectName, 'internet-messaging', source);
  };

  return (
    <div
      className="flex flex-col h-full w-full bg-[#FFFFFF] text-[#0F172A] select-none font-sans overflow-hidden min-h-[44px]"
    >
      {/* Viewport Content */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {/* Base Layer: Screens with Bottom Tab Bar (z-10 stacking context stays strictly behind z-20 detail views) */}
        <div
          className="absolute inset-0 z-10 flex flex-col min-h-0 overflow-hidden"
          inert={isDetailActive}
          aria-hidden={isDetailActive}
        >
          <div data-motion-content className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
            {activeTab === 'messages' && (
              <MessagingInboxView
                caseId={caseData.caseId}
                contacts={contacts}
                threads={threads}
                otherThreads={otherThreads}
                cloudDocuments={cloudDocuments}
                onSelectThread={(id) => {
                  swipeProgressRef.current = 0;
                  setSelectedThreadId(id);
                }}
                onTagSuspect={handleTag}
                onReturnHome={onReturnHome}
                onOpenMyDocuments={() => {
                  swipeProgressRef.current = 0;
                  setShowCloudDrawer(true);
                }}
              />
            )}

            {activeTab === 'contacts' && (
              <MessagingContactsView
                caseId={caseData.caseId}
                contacts={contacts}
                onTagSuspect={handleTag}
                onReturnHome={onReturnHome}
              />
            )}

            {activeTab === 'discover' && (
              <MessagingDiscoverView
                discoverData={messagingData.discoverData}
                onTagSuspect={handleTag}
              />
            )}

            {activeTab === 'timeline' && (
              <MessagingTimelineView
                timelinePosts={messagingData.timelinePosts}
                onTagSuspect={handleTag}
              />
            )}

            {activeTab === 'profile' && (
              <MessagingProfileView
                currentUser={currentUser}
                cloudDocuments={cloudDocuments}
                onOpenCloudDrawer={() => {
                  swipeProgressRef.current = 0;
                  setShowCloudDrawer(true);
                }}
                onReturnHome={onReturnHome}
                onTagSuspect={handleTag}
              />
            )}
          </div>

          {/* Bottom 5-Tab Bar (kept mounted in base layer behind detail views for flicker-free push/pop) */}
          <MessagingBottomNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            messageBadgeCount={[...threads, ...otherThreads].reduce((total, thread) => total + (thread.unreadCount ?? 0), 0)}
          />

          {/* Dimmed Scrim Overlay over previous screen when a detail screen is active */}
          {isDetailActive && (
            <div
              ref={scrimRef}
              aria-hidden="true"
              className="absolute inset-0 bg-black/35 z-10 pointer-events-none will-change-[opacity]"
            />
          )}
        </div>

        {/* Top Layer: Active Chat Thread & My Documents (compositor-thread WAAPI slide, 120Hz flicker-free) */}
        {isDetailActive && (
          <div
            ref={detailLayerRef}
            key={detailKey}
            className="absolute inset-0 z-20 will-change-transform"
          >
            {selectedThreadId && activeThread ? (
              <MessagingChatThreadView
                caseId={caseData.caseId}
                contacts={contacts}
                thread={activeThread}
                onBack={() => closeDetail(() => setSelectedThreadId(null))}
                onTagSuspect={handleTag}
                onSwipeProgress={handleDetailSwipeProgress}
                onSwipeEnd={handleDetailSwipeEnd}
              />
            ) : (
              <MessagingMyDocumentsView
                documents={cloudDocuments}
                onBack={() => closeDetail(() => setShowCloudDrawer(false))}
                onTagSuspect={handleTag}
                onSwipeProgress={handleDetailSwipeProgress}
                onSwipeEnd={handleDetailSwipeEnd}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const BRAND = getAppBrand('internet-messaging');

export const appDefinition: AppDefinition = {
  dataKeys: ['internet-messaging'],
  appId: 'internet-messaging',
  displayName: BRAND.brandName,
  icon: IoChatbubbleOutline,
  iconAsset: messagingIcon,
  themeGradient: 'from-blue-500 to-sky-600',
  themeColor: '#0088FF',
  bottomBarColor: '#FFFFFF',
  notificationBadgeCount: 4,
  isLocked: false,
  component: InternetMessagingApp,
};

export default InternetMessagingApp;
