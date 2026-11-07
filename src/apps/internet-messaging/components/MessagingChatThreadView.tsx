import { useMotionState } from '../../../shared/motion/useMotionState';
import React from 'react';
import { IoCallOutline, IoCheckmark, IoCheckmarkDone, IoChevronBack, IoEllipsisHorizontal, IoEllipsisVertical, IoHappyOutline, IoImageOutline, IoLocation, IoMicOutline, IoTimeOutline, IoVideocamOutline } from 'react-icons/io5';
import { MessagingThread, type MessagingMessage } from '../types';
import { chatImage } from '../assets/chatImages';
import { MessagingImageViewer } from './MessagingImageViewer';
import { MessagingLocationModal } from './MessagingLocationModal';
import { MessagingEvidenceSheet } from './MessagingEvidenceSheet';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget } from '../../../features/investigation';
import { UniversalEvidenceItem } from '../../../features/investigation';
import { type EvidenceSource, formatDisplayTime } from '../../../shared/contracts/evidence';
import { ContactAvatar } from '../../../shared/ui/ContactAvatar';

interface MessagingChatThreadViewProps {
  thread: MessagingThread;
  onBack: () => void;
  onTagSuspect: (suspectName: string, source?: EvidenceSource) => void;
  caseId?: string;
}

export const MessagingChatThreadView: React.FC<MessagingChatThreadViewProps> = ({
  thread,
  onBack,
  onTagSuspect,
  caseId,
}) => {
  const [selectedLocation, setSelectedLocation] = useMotionState<{
    venueName: string;
    address: string;
    time?: string;
  } | null>(null, 'sheet');

  const [evidenceSheetItem, setEvidenceSheetItem] = useMotionState<UniversalEvidenceItem | null>(null, 'sheet');
  const [selectedImage, setSelectedImage] = React.useState<MessagingMessage | null>(null);
  const messagesContainerRef = React.useRef<HTMLElement | null>(null);

  const scrollToBottom = React.useCallback(() => {
    const el = messagesContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  React.useLayoutEffect(() => {
    scrollToBottom();
    const frameId = requestAnimationFrame(scrollToBottom);
    return () => cancelAnimationFrame(frameId);
  }, [thread.threadId, thread.messages.length, scrollToBottom]);

  const handleImageLoad = React.useCallback(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 160;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, []);

  // Swipe back to inbox
  const swipeHandlers = useSwipeBack({
    onBack: () => {
      onBack();
    },
    enabled: !selectedImage && !evidenceSheetItem && !selectedLocation,
  });

  const evidenceSheet = evidenceSheetItem && <MessagingEvidenceSheet
    isOpen={true} title={evidenceSheetItem.title} evidenceSnippet={evidenceSheetItem.snippet}
    subtitle={evidenceSheetItem.subtitle} profileName={evidenceSheetItem.visibleAlias || thread.contactName}
    suspectToTag={evidenceSheetItem.suspectToTag} source={evidenceSheetItem.source}
    onPinEvidence={name => onTagSuspect(name, evidenceSheetItem.source)} onClose={() => setEvidenceSheetItem(null)} />;

  return (
    <div
      {...swipeHandlers}
      data-detail-layer
      className="absolute inset-0 z-20 flex flex-col h-full w-full bg-[#E5EBF0] text-[#0F172A] select-none font-sans overflow-hidden shadow-2xl"
    >
      {/* Header */}
      <header className="flex items-center justify-between px-2 h-14 bg-[#0088FF] text-white shrink-0 shadow-sm z-20">
        <div className="flex items-center gap-1.5 min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center justify-center min-w-[44px] min-h-[44px] rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white"
            aria-label="Quay lại danh sách chat"
          >
            <IoChevronBack className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-2 min-w-0 flex-1 ml-1">
            {/* Contact Avatar */}
            <ContactAvatar name={thread.contactName} size={36} className="shadow-sm" />

            <div className="min-w-0 flex-1">
              <h2 className="text-ios-headline font-bold truncate text-white leading-tight">
                {thread.contactName}
              </h2>
              <p className="text-ios-caption-1 text-white/85 truncate">
                Bấm để xem thông tin
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            type="button"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white"
            aria-label="Gọi thoại"
          >
            <IoCallOutline className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white"
            aria-label="Gọi video"
          >
            <IoVideocamOutline className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-white/10 active:scale-95 transition-all text-white"
            aria-label="Tuỳ chọn cuộc trò chuyện"
          >
            <IoEllipsisVertical className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* System banner (story data: thread.systemBanner) */}
      {thread.systemBanner && (
        <StoryEvidenceTarget
          item={{
            title: 'Thông báo hệ thống',
            snippet: thread.systemBanner,
            suspectToTag: thread.contactName,
            subtitle: `Cuộc trò chuyện với ${thread.contactName}`,
            source: caseId ? {
              caseId,
              recordId: `${thread.threadId}_banner`,
              title: 'Thông báo hệ thống',
              snippet: thread.systemBanner,
            } : undefined,
          }}
          onTriggerEvidence={setEvidenceSheetItem}
        >
          <div className="px-3 py-1.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-ios-footnote flex items-center justify-center gap-1.5 shadow-xs shrink-0">
            <IoTimeOutline className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-medium text-center">{thread.systemBanner}</span>
          </div>
        </StoryEvidenceTarget>
      )}

      {/* Messages Canvas */}
      <main
        ref={messagesContainerRef}
        data-testid="chat-messages-container"
        className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-3 pb-24"
      >
        {/* Floating Date Badge */}
        <div className="flex justify-center my-1">
          <span className="px-3 py-0.5 rounded-full bg-slate-900/70 backdrop-blur-md text-white text-ios-caption-1 font-medium shadow-xs">
            Lịch sử trò chuyện
          </span>
        </div>

        {thread.messages.map((msg) => {
          const isMe = msg.sender === 'me';
          const image = msg.type === 'image' ? chatImage(msg.imageAsset) : undefined;

          // Interactive Location Pin Card (CLUE-ZOLA-04)
          if (msg.type === 'location' && msg.locationData) {
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <StoryEvidenceTarget
                  item={{
                    title: thread.contactName,
                    snippet: `${msg.locationData.venueName}\nĐịa chỉ: ${msg.locationData.address}`,
                    suspectToTag: thread.contactName,
                    subtitle: `Vị trí chia sẻ bởi ${thread.contactName} • ${msg.time}`,
                    kind: 'message',
                    conversationId: thread.threadId,
                    visibleAlias: thread.contactName,
                    eventTime: msg.time,
                    source: caseId ? {
                      caseId,
                      recordId: msg.id,
                      clueRefId: msg.clueRefId || undefined,
                      kind: 'message',
                      conversationId: thread.threadId,
                      visibleAlias: thread.contactName,
                      eventTime: msg.time,
                      title: thread.contactName,
                      snippet: `${msg.locationData.venueName} - ${msg.locationData.address}`,
                    } : undefined,
                  }}
                  onTriggerEvidence={setEvidenceSheetItem}
                  className="max-w-[85%]"
                >
                  <div
                    onClick={() => {
                      setSelectedLocation({
                        venueName: msg.locationData!.venueName,
                        address: msg.locationData!.address,
                        time: msg.time,
                      });
                    }}
                    className="w-full bg-white rounded-2xl rounded-bl-xs border border-slate-200 shadow-sm p-3 cursor-pointer hover:border-[#0088FF] transition-all"
                  >
                    <div className="flex items-center gap-1.5 text-rose-600 font-bold text-ios-subheadline mb-1.5">
                      <IoLocation className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{msg.text || 'Vị trí hiện tại'}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-0.5">
                      <h4 className="text-ios-subheadline font-bold text-[#0F172A]">
                        {msg.locationData.venueName}
                      </h4>
                      <p className="text-ios-footnote text-[#64748B] leading-tight">
                        {msg.locationData.address}
                      </p>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-1.5 border-t border-slate-100">
                      <span className="text-ios-caption-1 text-[#0088FF] font-semibold">
                        [Chạm để xem chi tiết bản đồ]
                      </span>
                      <span className="text-ios-caption-1 text-[#52525B]">{msg.time}</span>
                    </div>
                  </div>
                </StoryEvidenceTarget>
              </div>
            );
          }

          const msgTime = msg.timestamp || msg.time || '';
          const displayTime = formatDisplayTime(msgTime, 'timeOnly');

          // Standard Message Bubble
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <StoryEvidenceTarget
                item={{
                  title: thread.contactName,
                  snippet: msg.text,
                  suspectToTag: thread.contactName !== 'Vợ' ? thread.contactName : (isMe ? 'Chồng (Nguyễn Huy Hoàng)' : 'Vợ'),
                  subtitle: msgTime,
                  kind: 'message',
                  conversationId: thread.threadId,
                  visibleAlias: thread.contactName,
                  eventTime: msgTime,
                  direction: isMe ? 'outgoing' : 'incoming',
                  sender: isMe ? 'me' : 'them',
                  source: caseId ? {
                    caseId,
                    recordId: msg.id,
                    clueRefId: msg.clueRefId || undefined,
                    kind: 'message',
                    conversationId: thread.threadId,
                    visibleAlias: thread.contactName,
                    eventTime: msgTime,
                    title: thread.contactName,
                    snippet: msg.text,
                    direction: isMe ? 'outgoing' : 'incoming',
                    sender: isMe ? 'me' : 'them',
                  } : undefined,
                }}
                onTriggerEvidence={setEvidenceSheetItem}
                className="max-w-[80%]"
              >
                <div
                  title="Nhấn giữ để ghim vào Sổ tay"
                  className={`w-full px-3.5 py-2.5 text-ios-body shadow-[0_1px_2px_rgba(0,0,0,0.06)] relative transition-all active:scale-[0.98] ${
                    isMe
                      ? 'bg-[#D2F4FF] text-[#0F172A] rounded-[14px] rounded-tr-[4px] border border-sky-100'
                      : 'bg-[#FFFFFF] text-[#0F172A] rounded-[14px] rounded-tl-[4px] border border-slate-100'
                  }`}
                >
                  {image && <button type="button" aria-label={`Mở ảnh: ${msg.imageAlt || msg.text}`} onClick={() => setSelectedImage(msg)} className="mb-2 block min-h-11 min-w-11 rounded-lg">
                    <img src={image} alt={msg.imageAlt || msg.text} draggable={false} loading="lazy" onLoad={handleImageLoad}
                      className="max-h-72 w-full max-w-[280px] rounded-lg object-contain" />
                  </button>}
                  <div className="select-none">{msg.text || (msg.type === 'image' && !image ? 'Không thể hiển thị ảnh.' : '')}</div>

                  {/* Bubble Footer: Time & Read status */}
                  <div
                    className={`flex items-center gap-1 text-ios-caption-1 text-[#52525B] mt-1 ${
                      isMe ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <span>{displayTime}</span>
                    {isMe && (
                      <span className="flex items-center text-[#0088FF]">
                        <IoCheckmarkDone className="w-3 h-3 text-[#0088FF]" />
                        <span className="ml-0.5">Đã xem</span>
                      </span>
                    )}
                    {!isMe && (
                      <span className="flex items-center text-[#64748B]">
                        <IoCheckmark className="w-3 h-3" />
                        <span className="ml-0.5">Đã nhận</span>
                      </span>
                    )}
                  </div>
                </div>
              </StoryEvidenceTarget>
            </div>
          );
        })}
        <div aria-hidden="true" className="h-0 w-full" />
      </main>

      {/* Input Bar */}
      <footer className="h-[52px] bg-white border-t border-[#E2E8F0] px-1 flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
          aria-label="Nhãn dán"
        >
          <IoHappyOutline className="w-6 h-6" />
        </button>

        <div className="flex-1 min-w-0 px-1 text-ios-subheadline text-slate-400">
          <span>Tin nhắn</span>
        </div>

        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
          aria-label="Thêm tuỳ chọn"
        >
          <IoEllipsisHorizontal className="w-6 h-6" />
        </button>

        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
          aria-label="Ghi âm"
        >
          <IoMicOutline className="w-6 h-6" />
        </button>

        <button
          type="button"
          className="w-11 h-11 flex items-center justify-center text-slate-500 hover:text-slate-800 active:scale-95 transition-all"
          aria-label="Gửi hình ảnh"
        >
          <IoImageOutline className="w-6 h-6" />
        </button>
      </footer>

      {/* Modals */}
      {selectedImage && <MessagingImageViewer message={selectedImage} contactName={thread.contactName} conversationId={thread.threadId} caseId={caseId}
        onClose={() => setSelectedImage(null)} onEvidence={setEvidenceSheetItem} suspended={Boolean(evidenceSheetItem)} />}
      {selectedLocation && (
        <MessagingLocationModal
          isOpen={Boolean(selectedLocation)}
          venueName={selectedLocation.venueName}
          address={selectedLocation.address}
          time={selectedLocation.time}
          onClose={() => setSelectedLocation(null)}
        />
      )}

      {evidenceSheet && <div className="absolute inset-0 z-[60]">{evidenceSheet}</div>}
    </div>
  );
};

export const ZolaChatThreadView = MessagingChatThreadView;
export default MessagingChatThreadView;

