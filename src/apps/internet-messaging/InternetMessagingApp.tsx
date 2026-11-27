import React from 'react';
import { useMotionState } from '../../shared/motion/useMotionState';
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
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';

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

  const [activeTab, setActiveTab] = useMotionState<MessagingTab>('messages', 'fade');
  const [selectedThreadId, setSelectedThreadId] = useMotionState<string | null>(null, 'navigation');
  const [showCloudDrawer, setShowCloudDrawer] = useMotionState(false, 'navigation');

  // Active chat thread if any
  const activeThread =
    threads.find((t) => t.threadId === selectedThreadId) ||
    otherThreads.find((t) => t.threadId === selectedThreadId);

  const isDetailActive = Boolean(selectedThreadId || showCloudDrawer);

  const swipeHandlers = useSwipeBack({
    onBack: onReturnHome,
    enabled: !isDetailActive,
    exitsApp: true,
  });

  const handleTag = (suspectName: string, source?: EvidenceSource) => {
    onTagSuspect(suspectName, 'internet-messaging', source);
  };

  return (
    <div
      {...swipeHandlers}
      className="flex flex-col h-full w-full bg-[#FFFFFF] text-[#0F172A] select-none font-sans overflow-hidden min-h-[44px]"
    >
      {/* Viewport Content */}
      <div className="flex-1 flex flex-col min-h-0 relative overflow-hidden">
        {/* Base Layer: Screens with Bottom Tab Bar (kept mounted behind detail screens) */}
        <div
          className="absolute inset-0 flex flex-col min-h-0 overflow-hidden"
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
                onSelectThread={(id) => setSelectedThreadId(id)}
                onTagSuspect={handleTag}
                onReturnHome={onReturnHome}
                onOpenMyDocuments={() => setShowCloudDrawer(true)}
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
                onOpenCloudDrawer={() => setShowCloudDrawer(true)}
                onReturnHome={onReturnHome}
                onTagSuspect={handleTag}
              />
            )}
          </div>

          {/* Bottom 5-Tab Bar */}
          {!isDetailActive && (
            <MessagingBottomNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              messageBadgeCount={[...threads, ...otherThreads].reduce((total, thread) => total + (thread.unreadCount ?? 0), 0)}
            />
          )}

          {/* Dimmed Scrim Overlay over previous screen when a detail screen is active */}
          {isDetailActive && (
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black/40 z-10 pointer-events-none transition-opacity duration-200"
            />
          )}
        </div>

        {/* Top Layer: Active Chat Thread */}
        {selectedThreadId && activeThread && (
          <MessagingChatThreadView
            caseId={caseData.caseId}
            contacts={contacts}
            thread={activeThread}
            onBack={() => setSelectedThreadId(null)}
            onTagSuspect={handleTag}
          />
        )}

        {/* Top Layer: My Documents */}
        {showCloudDrawer && (
          <MessagingMyDocumentsView
            documents={cloudDocuments}
            onBack={() => setShowCloudDrawer(false)}
            onTagSuspect={handleTag}
          />
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
