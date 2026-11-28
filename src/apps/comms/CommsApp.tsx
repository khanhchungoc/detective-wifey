import { useMotionState } from '../../shared/motion/useMotionState';
import { useState } from 'react';
import { IoCall, IoCallOutline, IoChatbubble, IoInformationCircleOutline, IoTimeOutline, IoPeopleOutline, IoArrowUpOutline, IoArrowDownOutline } from 'react-icons/io5';
import type { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { BottomSheet } from '../../shared/ui/BottomSheet';
import { readCommunicationData, findContact, matchThread, type Contact } from './data';
import { CommunicationHeader, EmptyState, useCommunicationEvidence } from './components/CommunicationChrome';
import { ContactAvatar } from '../../shared/ui/ContactAvatar';
import './communications.css';

const callLabels: Record<string, string> = { incoming: 'Cuộc gọi đến', outgoing: 'Cuộc gọi đi', missed: 'Cuộc gọi nhỡ' };
export function CommsApp(props: VirtualAppProps) {
  const data = readCommunicationData(props.caseData);
  const [tab, setTab] = useMotionState<'calls' | 'contacts'>('calls', 'fade');
  const [missedOnly, setMissedOnly] = useMotionState(false, 'fade');
  const [contact, setContact] = useMotionState<Contact | null>(null, 'sheet');
  const [notesOpen, setNotesOpen] = useMotionState(true, 'fade');
  const [feedback, setFeedback] = useState('');
  const evidence = useCommunicationEvidence(props.caseData.caseId, props.onTagSuspect, 'phone');
  const calls = data.calls.filter(call => !missedOnly || call.direction === 'missed');
  const openContact = (next: Contact) => { setContact(next); setFeedback(''); setNotesOpen(true); };
  return <div className="min-h-[44px] communication-app phone-app">
    <CommunicationHeader title="Điện thoại" />
    <main className="communication-scroll">
      <h2 className="communication-large-title">{tab === 'calls' ? 'Gần đây' : 'Danh bạ'}</h2>
      {tab === 'calls' ? <>
        <div className="phone-filter" role="group" aria-label="Lọc cuộc gọi">
          <button type="button" aria-pressed={!missedOnly} onClick={() => setMissedOnly(false)}>Tất cả</button>
          <button type="button" aria-pressed={missedOnly} onClick={() => setMissedOnly(true)}>Gọi nhỡ</button>
        </div>
        {calls.length ? calls.map(call => (
          <div className="phone-call-row" key={call.id}>
            <div className="phone-call-content">
              {evidence.wrap(
                call,
                call.name || call.phone,
                [
                  call.phone || findContact(call, data.contacts).phone,
                  [callLabels[call.direction], call.direction !== 'missed' ? call.duration : ''].filter(Boolean).join(' · '),
                ].filter(Boolean).join('\n'),
                <div className="phone-call-narrative">
                  <span className={`phone-direction ${call.direction === 'missed' ? 'is-missed' : ''}`}>
                    {call.direction === 'outgoing' ? <IoArrowUpOutline /> : <IoArrowDownOutline />}
                  </span>
                  <ContactAvatar name={call.name || call.phone} size={40} />
                  <div className="communication-flex-copy">
                    <strong className={call.direction === 'missed' ? 'is-missed' : ''}>{call.name || call.phone}</strong>
                    <small>{callLabels[call.direction] || ''}{call.direction !== 'missed' && call.duration ? ` · ${call.duration}` : ''}</small>
                  </div>
                  <time>{call.time}</time>
                </div>,
                { eventTime: call.time },
              )}
            </div>
            <button className="phone-info" type="button" aria-label={`Chi tiết ${call.name || call.phone}`} onClick={() => openContact(findContact(call, data.contacts))}><IoInformationCircleOutline aria-hidden="true" /></button>
          </div>
        )) : <EmptyState>{missedOnly ? 'Không có cuộc gọi nhỡ' : 'Chưa có cuộc gọi'}</EmptyState>}
      </> : data.contacts.length ? <div>{data.contacts.map(c => <button type="button" className="phone-contact-row" key={c.id} onClick={() => openContact(c)}><ContactAvatar name={c.name} /><strong>{c.name}</strong></button>)}</div> : <EmptyState>Chưa có liên hệ</EmptyState>}
    </main>
    <nav className="app-bottom-nav phone-tabs" aria-label="Điều hướng Điện thoại">
      <button type="button" aria-current={tab === 'calls' ? 'page' : undefined} onClick={() => setTab('calls')}><IoTimeOutline />Gần đây</button>
      <button type="button" aria-current={tab === 'contacts' ? 'page' : undefined} onClick={() => setTab('contacts')}><IoPeopleOutline />Danh bạ</button>
    </nav>
    {contact && <BottomSheet title="Chi tiết liên hệ" onClose={() => setContact(null)} suspended={evidence.active}>
      <div className="phone-contact-profile"><ContactAvatar name={contact.name} size={84} className="mb-3" /><h3>{contact.name}</h3></div>
      <div className="phone-contact-actions"><button type="button" onClick={() => {
        const thread = matchThread(contact, data.threads);
        if (!thread || !props.onOpenMessages?.(thread.id)) setFeedback('Không có cuộc trò chuyện');
      }}><IoChatbubble />Nhắn tin</button><button type="button" onClick={() => setFeedback('Không thể gọi điện trong chế độ điều tra.')}><IoCallOutline />Gọi điện</button></div>
      {feedback && <p className="communication-feedback" role="status">{feedback}</p>}
      <dl className="phone-contact-fields">{contact.phone && <><dt>Di động</dt><dd>{contact.phone}</dd></>}{contact.secondaryPhone && <><dt>Công việc</dt><dd>{contact.secondaryPhone}</dd></>}</dl>
      <section className="phone-notes"><button type="button" aria-expanded={notesOpen} onClick={() => setNotesOpen(!notesOpen)}>Ghi chú</button>
        {notesOpen && (contact.notes ? evidence.wrap(contact, contact.name, contact.notes, <p>{contact.notes}</p>) : <p>Chưa có ghi chú</p>)}</section>
    </BottomSheet>}
    {evidence.modal}
  </div>;
}
export const phoneDefinition: AppDefinition = {
  appId: 'phone', dataKeys: ['comms', 'phone', 'messages'], displayName: 'Điện thoại', icon: IoCall,
  themeGradient: 'from-green-400 to-green-600', themeColor: '#FFFFFF', bottomBarColor: '#FFFFFF', isLocked: false, component: CommsApp,
};
export const appDefinition: AppDefinition = { ...phoneDefinition, appId: 'comms' };
export default CommsApp;
