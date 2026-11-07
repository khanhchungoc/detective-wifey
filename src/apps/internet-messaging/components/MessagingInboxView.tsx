import { useMotionState } from '../../../shared/motion/useMotionState';
import React, { useState } from 'react';
import { IoAdd, IoChevronBack, IoCloudOutline, IoNotificationsOffOutline, IoQrCodeOutline, IoSearchOutline } from 'react-icons/io5';
import { MessagingThread, MessagingCloudDocument, MessagingContact } from '../types';
import { contactEvidence } from '../contactEvidence';
import { MessagingEvidenceSheet } from './MessagingEvidenceSheet';
import { StoryEvidenceTarget } from '../../../features/investigation';
import { ContactAvatar } from '../../../shared/ui/ContactAvatar';

import type { EvidenceSource } from '../../../shared/contracts/evidence';

interface MessagingInboxViewProps {
  caseId?: string;
  contacts?: MessagingContact[];
  threads: MessagingThread[];
  otherThreads?: MessagingThread[];
  cloudDocuments?: MessagingCloudDocument[];
  onSelectThread: (threadId: string) => void;
  onTagSuspect: (suspectName: string, source?: EvidenceSource) => void;
  onReturnHome: () => void;
  onOpenMyDocuments?: () => void;
}

export const MessagingInboxView: React.FC<MessagingInboxViewProps> = ({
  caseId,
  contacts = [],
  threads,
  otherThreads = [],
  cloudDocuments = [],
  onSelectThread,
  onTagSuspect,
  onReturnHome,
  onOpenMyDocuments,
}) => {
  const [activeTab, setActiveTab] = useMotionState<'priority' | 'other'>('priority', 'fade');
  const [searchQuery, setSearchQuery] = useState('');
  const [evidenceSheetThread, setEvidenceSheetThread] = useMotionState<MessagingThread | null>(null, 'sheet');

  const currentList = activeTab === 'priority' ? threads : otherThreads;
  const threadSource = (thread: MessagingThread): EvidenceSource | undefined => {
    if (!caseId) return undefined;
    const contact = contacts.find(contact => contact.name === thread.contactName);
    return contact ? contactEvidence(caseId, contact) : {
      caseId,
      recordId: thread.threadId,
      kind: 'conversation',
      conversationId: thread.threadId,
      visibleAlias: thread.contactName,
      title: thread.contactName,
      snippet: '',
      isExplicitConversationPin: true,
    };
  };
  const selectedSource = evidenceSheetThread ? threadSource(evidenceSheetThread) : undefined;

  // Filter threads by search query
  const filteredThreads = currentList.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      t.contactName.toLowerCase().includes(q) ||
      t.lastMessage.toLowerCase().includes(q) ||
      (t.realIdentity && t.realIdentity.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col h-full w-full bg-[#FFFFFF] text-[#0F172A] select-none font-sans overflow-hidden">
      {/* 1. Header (Electric Blue #0088FF) */}
      <header className="h-14 px-3 bg-[#0088FF] text-white flex items-center gap-2 shrink-0 shadow-sm z-10">
        <button
          type="button"
          onClick={onReturnHome}
          className="w-11 h-11 -ml-2 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg shrink-0"
          aria-label="Quay lại màn hình chính"
        >
          <IoChevronBack className="w-6 h-6" />
        </button>
        <div className="flex-1 h-9 bg-white/20 rounded-lg flex items-center px-2.5 gap-2 text-white">
          <IoSearchOutline className="w-4 h-4 text-white/80 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm"
            className="w-full bg-transparent text-ios-subheadline text-white placeholder-white/80 outline-hidden"
          />
        </div>
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg shrink-0"
          aria-label="Quét mã QR"
        >
          <IoQrCodeOutline className="w-5 h-5" />
        </button>
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all rounded-lg shrink-0"
          aria-label="Thêm cuộc trò chuyện mới"
        >
          <IoAdd className="w-5 h-5" />
        </button>
      </header>

      {/* 2. Sub-Header Filter Tabs (Ưu tiên / Khác) */}
      <div className="flex border-b border-slate-200 bg-white h-11 shrink-0">
        <button
          type="button"
          onClick={() => setActiveTab('priority')}
          className={`flex-1 flex items-center justify-center text-ios-subheadline transition-all relative ${
            activeTab === 'priority'
              ? 'font-bold text-[#0F172A]'
              : 'font-normal text-[#666666] hover:text-[#0F172A]'
          }`}
        >
          <span>Ưu tiên</span>
          {activeTab === 'priority' && (
            <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#000000]" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('other')}
          className={`flex-1 flex items-center justify-center text-ios-subheadline transition-all relative ${
            activeTab === 'other'
              ? 'font-bold text-[#0F172A]'
              : 'font-normal text-[#666666] hover:text-[#0F172A]'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span>Khác</span>
          </div>
          {activeTab === 'other' && (
            <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#000000]" />
          )}
        </button>
      </div>

      {/* 3. Main Chat Feed */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden divide-y divide-slate-100 pb-24">
        {/* Pinned Cloud của tôi (My Documents) entry item (Navigation link - zero long-press overlay) */}
        {activeTab === 'priority' && !searchQuery && onOpenMyDocuments && (
          <div
            onClick={onOpenMyDocuments}
            className="flex items-center gap-3 px-3.5 py-3 hover:bg-sky-50/70 active:bg-sky-100/70 transition-all cursor-pointer min-h-[72px] bg-sky-50/40"
          >
            <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
              <IoCloudOutline className="w-6 h-6 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline mb-0.5">
                <span className="font-semibold text-ios-headline text-[#000000] truncate">
                  Cloud của tôi (My Documents)
                </span>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <span className="text-ios-footnote text-[#52525B]">{cloudDocuments[0]?.time || cloudDocuments[0]?.date}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <p className="text-ios-subheadline text-[#6B7280] truncate pr-2">
                  {cloudDocuments.length ? `${cloudDocuments[0].fileName} • ${cloudDocuments.length} tệp` : 'Chưa có tài liệu'}
                </p>
              </div>
            </div>
          </div>
        )}

        {filteredThreads.length === 0 ? (
          <div className="p-8 text-center text-ios-subheadline text-[#52525B]">
            Không có cuộc trò chuyện nào trong mục này.
          </div>
        ) : (
          filteredThreads.map((thread) => (
            <StoryEvidenceTarget
              key={thread.threadId}
              item={{
                title: thread.contactName,
                subtitle: 'Cuộc trò chuyện Zola',
                snippet: threadSource(thread)?.snippet || '',
                suspectToTag: thread.contactName,
                kind: 'conversation',
                conversationId: thread.threadId,
                visibleAlias: thread.contactName,
                isExplicitConversationPin: true,
                source: threadSource(thread),
              }}
              onTriggerEvidence={() => setEvidenceSheetThread(thread)}
            >
              <div
                onClick={() => onSelectThread(thread.threadId)}
                className="flex items-center gap-3 px-3.5 py-3 hover:bg-slate-50 active:bg-slate-100 transition-all cursor-pointer min-h-[72px]"
              >
                {/* Avatar (52px) */}
                <ContactAvatar name={thread.contactName} size={52} className="shadow-sm" />

                {/* Chat Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <span className="font-semibold text-ios-headline text-[#0F172A] truncate">
                      {thread.contactName}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <span className="text-ios-footnote text-[#52525B]">
                        {thread.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <p className="text-ios-subheadline text-[#6B7280] truncate pr-2">
                      {thread.lastMessage}
                    </p>

                    <div className="shrink-0 flex items-center gap-1">
                      {thread.isMuted && (
                        <IoNotificationsOffOutline className="w-3.5 h-3.5 text-[#64748B]" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </StoryEvidenceTarget>
          ))
        )}
      </main>

      {/* Universal Evidence Sheet */}
      {evidenceSheetThread && (
        <MessagingEvidenceSheet
          isOpen={Boolean(evidenceSheetThread)}
          title={evidenceSheetThread.contactName}
          subtitle="Cuộc trò chuyện Zola"
          evidenceSnippet={selectedSource?.snippet}
          suspectToTag={evidenceSheetThread.contactName}
          source={selectedSource}
          onPinEvidence={(name) => onTagSuspect(name, selectedSource)}
          onClose={() => setEvidenceSheetThread(null)}
        />
      )}
    </div>
  );
};

export const ZolaInboxView = MessagingInboxView;
export default MessagingInboxView;

