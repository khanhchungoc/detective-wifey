import { useMotionState } from '../../shared/motion/useMotionState';
import { useState, useRef, useLayoutEffect } from 'react';
import { IoChatbubble, IoSearch, IoHeart, IoThumbsUp, IoHappy, IoAlert, IoChevronForward, IoClose, IoTimeOutline } from 'react-icons/io5';
import type { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { StoryEvidenceTarget } from '../../features/investigation';
import { SwipeBackContainer } from '../../shared/ui/SwipeBackContainer';
import { BottomSheet } from '../../shared/ui/BottomSheet';
import { readCommunicationData, searchThreads, type Message } from './data';
import { CommunicationHeader, EmptyState, useCommunicationEvidence } from './components/CommunicationChrome';
import { ContactAvatar } from '../../shared/ui/ContactAvatar';
import './communications.css';

const reactions = { heart: IoHeart, like: IoThumbsUp, laugh: IoHappy, exclamation: IoAlert };
const reactionLabels: Record<string, string> = { heart: 'Yêu thích', like: 'Thích', laugh: 'Cười', exclamation: 'Nhấn mạnh' };
export function MessagesApp(props: VirtualAppProps) {
  const data = readCommunicationData(props.caseData);
  const [query, setQuery] = useState('');
  const [threadId, setThreadId] = useMotionState<string | null>(props.initialThreadId ?? null, 'navigation');
  const [draft, setDraft] = useMotionState<Message | null>(null, 'sheet');
  const [reactionTime, setReactionTime] = useMotionState<string | null>(null, 'fade');
  const thread = data.threads.find(t => t.id === threadId);
  const evidence = useCommunicationEvidence(props.caseData.caseId, props.onTagSuspect, 'messages');
  const visible = searchThreads(data.threads, query);
  const pinned = query.trim() ? [] : visible.filter(t => t.pinned);
  const messagesContainerRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (threadId && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
      const frameId = requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      });
      return () => cancelAnimationFrame(frameId);
    }
  }, [threadId]);

  const back = () => { setThreadId(null); setReactionTime(null); };
  const openThread = (id: string) => { setThreadId(id); setReactionTime(null); };
  const row = (t: typeof data.threads[number]) => (
    <StoryEvidenceTarget
      key={t.id}
      item={{
        title: t.name,
        snippet: '',
        suspectToTag: t.name,
        kind: 'conversation',
        conversationId: t.id,
        visibleAlias: t.name,
        isExplicitConversationPin: true,
        source: {
          caseId: props.caseData.caseId,
          recordId: t.id,
          title: t.name,
          snippet: '',
          kind: 'conversation',
          conversationId: t.id,
          visibleAlias: t.name,
          isExplicitConversationPin: true,
        },
      }}
      onTriggerEvidence={evidence.setItem}
    >
      <button type="button" className="messages-thread-row" onClick={() => openThread(t.id)}>
        <span className={`messages-unread ${t.unread ? 'is-unread' : ''}`} aria-label={t.unread ? 'Chưa đọc' : undefined} />
        <ContactAvatar name={t.name} avatarIndex={t.avatarIndex} />
        <span className="communication-flex-copy">
          <span className="messages-thread-heading">
            <strong>{t.name}</strong>
            <time>{t.time}</time>
            <IoChevronForward aria-hidden="true" />
          </span>
          <span className="messages-preview">
            {t.messages.filter(m => !m.canceled).slice(-1)[0]?.body || 'Chưa có tin nhắn'}
          </span>
        </span>
      </button>
    </StoryEvidenceTarget>
  );
  return <SwipeBackContainer className="min-h-[44px] communication-app messages-app" onBack={back} enabled={Boolean(threadId) && !draft && !evidence.active}>
    <CommunicationHeader title={threadId ? thread?.name || 'Tin nhắn' : 'Tin nhắn'} backLabel="Tin nhắn" onBack={threadId ? back : undefined} avatarName={threadId ? thread?.name : undefined} avatarIndex={threadId ? thread?.avatarIndex : undefined} />
    {!threadId ? <main className="communication-scroll">
      <h2 className="communication-large-title">Tin nhắn</h2>
      <div className="messages-search"><IoSearch aria-hidden="true" /><input aria-label="Tìm kiếm tin nhắn" placeholder="Tìm kiếm tin nhắn" value={query} onChange={e => setQuery(e.target.value)} />{query && <button type="button" aria-label="Xóa tìm kiếm" onClick={() => setQuery('')}><IoClose /></button>}</div>
      {pinned.length > 0 && (
        <section className="messages-pinned" aria-label="Hội thoại ưu tiên">
          {pinned.map(t => (
            <StoryEvidenceTarget
              key={t.id}
              item={{
                title: t.name,
                snippet: '',
                suspectToTag: t.name,
                kind: 'conversation',
                conversationId: t.id,
                visibleAlias: t.name,
                isExplicitConversationPin: true,
                source: {
                  caseId: props.caseData.caseId,
                  recordId: t.id,
                  title: t.name,
                  snippet: '',
                  kind: 'conversation',
                  conversationId: t.id,
                  visibleAlias: t.name,
                  isExplicitConversationPin: true,
                },
              }}
              onTriggerEvidence={evidence.setItem}
            >
              <button type="button" onClick={() => openThread(t.id)}>
                <ContactAvatar name={t.name} avatarIndex={t.avatarIndex} size={64} />
                <span>{t.name}</span>
              </button>
            </StoryEvidenceTarget>
          ))}
        </section>
      )}
      {visible.length ? visible.filter(t => query.trim() || !t.pinned).map(row) : <EmptyState>{query.trim() ? 'Không tìm thấy cuộc trò chuyện' : 'Chưa có cuộc trò chuyện'}</EmptyState>}
    </main> : thread ? <main ref={messagesContainerRef} className="communication-scroll messages-conversation">
      {!thread.messages.length && <EmptyState>Chưa có tin nhắn</EmptyState>}
      {thread.messages.filter(m => !m.canceled).map(message => {
        const Reaction = reactions[message.reaction?.type as keyof typeof reactions] ?? IoHeart;
        return <article key={message.id} className={`messages-message ${message.outgoing ? 'is-outgoing' : ''}`}>
          {evidence.wrap(
            message,
            thread.name,
            message.body,
            <div className="messages-bubble">{message.body}</div>,
            {
              kind: 'message',
              conversationId: thread.id,
              visibleAlias: thread.name,
              eventTime: message.time,
            }
          )}
          {message.time && <time>{message.time}</time>}
          {message.reaction && <div className="messages-reaction">{evidence.wrap({ ...message, id: `${message.id}:reaction` }, thread.name,
            `${reactionLabels[message.reaction.type] || 'Phản ứng'} · ${message.reaction.time}`,
            <button type="button" aria-label={`Xem thời gian phản ứng ${reactionLabels[message.reaction.type] || ''}`} onClick={() => setReactionTime(message.reaction?.time || 'Không có thời gian phản ứng')}><Reaction aria-hidden="true" /><span>{reactionLabels[message.reaction.type] || 'Phản ứng'}</span></button>)}</div>}
        </article>;
      })}
      {reactionTime && <p className="communication-feedback" role="status">{reactionTime}</p>}
      {thread.messages.filter(m => m.canceled).map(message => <button type="button" className="messages-draft-link" key={message.id} onClick={() => setDraft(message)}><IoTimeOutline />Xem bản nháp hẹn giờ đã hủy<IoChevronForward /></button>)}
    </main> : <EmptyState>Không có cuộc trò chuyện</EmptyState>}
    {draft && <BottomSheet title="Bản nháp đã hủy" onClose={() => setDraft(null)} suspended={evidence.active}>
      <p className="messages-draft-recipient">Người nhận: {thread?.name}</p>
      {evidence.wrap(draft, thread?.name || 'Bản nháp đã hủy', [draft.body, draft.scheduledTime, draft.canceledTime].filter(Boolean).join(' · '), <div className="messages-draft-body"><p>{draft.body}</p>{draft.scheduledTime && <p>Dự kiến gửi: {draft.scheduledTime}</p>}{draft.canceledTime && <p>Đã hủy lúc: {draft.canceledTime}</p>}</div>)}
      <p className="messages-read-only">Chỉ xem</p>
    </BottomSheet>}
    {evidence.modal}
  </SwipeBackContainer>;
}
export const messagesDefinition: AppDefinition = {
  appId: 'messages', dataKeys: ['comms', 'phone', 'messages'], displayName: 'Tin nhắn', icon: IoChatbubble,
  themeGradient: 'from-green-400 to-green-600', themeColor: '#FFFFFF', bottomBarColor: '#FFFFFF', isLocked: false, component: MessagesApp,
};
