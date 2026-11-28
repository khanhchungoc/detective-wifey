import { expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MessagingContactsView } from './components/MessagingContactsView';
import { MessagingInboxView } from './components/MessagingInboxView';
import { normalizeTaggedSuspects, tagSuspect } from '../../features/investigation';
import { deriveNodesFromTaggedEvidence } from '../../features/wife-notebook/WifeNotebookModal';
import { LEVEL_01_KNOWLEDGE_GRAPH } from '../../features/wife-notebook/level01Fixture';
import type { MessagingContact, MessagingThread } from './types';
import type { EvidenceSource } from '../../shared/contracts/evidence';

const state = vi.hoisted(() => ({
  contact: null as MessagingContact | null,
  thread: null as MessagingThread | null,
  sheet: null as { onPinEvidence: (name: string) => void; source?: EvidenceSource } | null,
}));
vi.mock('../../shared/motion/useMotionState', () => ({
  useMotionState: (initial: unknown) => [initial === null ? state.thread || state.contact : initial, vi.fn()],
}));
vi.mock('./components/MessagingEvidenceSheet', () => ({
  MessagingEvidenceSheet: (props: NonNullable<typeof state.sheet>) => {
    state.sheet = props;
    return null;
  },
}));

it.each(['0988886677', undefined])('pins contact details with supplied phone %s into the clue card', phone => {
  state.contact = { id: 'contact_901', name: 'Anh Tuấn Thợ Điện', section: 'A', department: 'Bảo trì', phone };
  state.thread = null;
  state.sheet = null;
  const onTagSuspect = vi.fn();
  renderToStaticMarkup(<MessagingContactsView caseId="case_01" contacts={[state.contact]}
    onTagSuspect={onTagSuspect} onReturnHome={vi.fn()} />);

  const sheet = state.sheet!;
  sheet.onPinEvidence(state.contact.name);
  expect(onTagSuspect).toHaveBeenCalledWith(state.contact.name, expect.objectContaining({
    caseId: 'case_01', recordId: 'contact_901', kind: 'person',
    snippet: phone ? `SĐT: ${phone} • Bảo trì` : 'Bảo trì',
  }));
  const pinned = tagSuspect([], state.contact.name, 'internet-messaging', 1, onTagSuspect.mock.calls[0][1]);
  state.thread = {
    threadId: 'thread_903', contactName: state.contact.name, lastMessage: 'Unpinned preview', timestamp: '19:30', messages: [],
  };
  renderToStaticMarkup(<MessagingInboxView caseId="case_01" contacts={[state.contact]} threads={[state.thread]}
    onSelectThread={vi.fn()} onTagSuspect={onTagSuspect} onReturnHome={vi.fn()} />);
  const conversationSheet = state.sheet!;
  expect(conversationSheet.source).toEqual(sheet.source);
  conversationSheet.onPinEvidence(state.thread.contactName);
  expect(onTagSuspect.mock.calls[1]).toEqual(onTagSuspect.mock.calls[0]);
  expect(tagSuspect(pinned.suspects, state.contact.name, 'internet-messaging', 2, conversationSheet.source).suspects)
    .toHaveLength(1);
  const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, pinned.suspects);
  expect(nodes).toHaveLength(1);
  expect(nodes[0].label).toBe(state.contact.name);
  expect([nodes[0].subtitle, ...(nodes[0].messages?.map(message => message.text) ?? [])]
    .filter(Boolean).join('\n')).toBe(sheet.source!.snippet);

  const message: EvidenceSource = {
    caseId: 'case_01', recordId: 'thread_903_m1', conversationId: 'thread_903',
    kind: 'message', title: state.contact.name, visibleAlias: state.contact.name,
    snippet: 'Anh tới rồi.', eventTime: '19:30',
  };
  const withMessage = tagSuspect(pinned.suspects, state.contact.name, 'internet-messaging', 2, message);
  const reloaded = normalizeTaggedSuspects(JSON.parse(JSON.stringify(withMessage.suspects)));
  const withSecondMessage = tagSuspect(reloaded, state.contact.name, 'internet-messaging', 3, {
    ...message, recordId: 'thread_903_m2', snippet: 'Em xuống nhé.',
  });
  const mergedNodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, withSecondMessage.suspects);
  expect(mergedNodes).toHaveLength(1);
  expect(mergedNodes[0].messages?.map(entry => entry.text)).toEqual([
    sheet.source!.snippet, 'Anh tới rồi.', 'Em xuống nhé.',
  ]);
});

it('keeps unmatched conversations free of invented phone numbers and unpinned message previews', () => {
  state.contact = null;
  state.thread = { threadId: 'thread_unknown', contactName: 'Người quen', lastMessage: 'Unpinned preview', timestamp: '19:30', messages: [] };
  const onTagSuspect = vi.fn();
  renderToStaticMarkup(<MessagingInboxView caseId="case_01" contacts={[
    { id: 'other', name: 'Someone else', phone: '0999999999', section: 'S' },
  ]} threads={[state.thread]} onSelectThread={vi.fn()} onTagSuspect={onTagSuspect} onReturnHome={vi.fn()} />);
  state.sheet!.onPinEvidence(state.thread.contactName);
  expect(onTagSuspect).toHaveBeenCalledWith('Người quen', expect.objectContaining({
    kind: 'conversation', recordId: 'thread_unknown', snippet: '',
  }));
});

it.each([false, true])('merges saved conversation and contact pins in either order (contact first: %s)', contactFirst => {
  const name = 'Hương Em';
  const contact: EvidenceSource = {
    caseId: 'case_01', recordId: 'contact_902', kind: 'person', title: name,
    visibleAlias: name, snippet: 'SĐT: 0988886677',
  };
  const conversation: EvidenceSource = {
    caseId: 'case_01', recordId: 'thread_902', conversationId: 'thread_902',
    kind: 'conversation', title: name, visibleAlias: name, snippet: '', isExplicitConversationPin: true,
  };
  const sources = contactFirst ? [contact, conversation] : [conversation, contact];
  const first = tagSuspect([], name, 'internet-messaging', 1, sources[0]);
  const second = tagSuspect(first.suspects, name, 'internet-messaging', 2, sources[1]);
  const reloaded = normalizeTaggedSuspects(JSON.parse(JSON.stringify(second.suspects)));
  expect(reloaded).toHaveLength(1);
  expect(reloaded[0].messages?.map(entry => entry.text)).toContain(contact.snippet);
  expect(deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, reloaded)).toHaveLength(1);
  const withMessage = tagSuspect(reloaded, name, 'internet-messaging', 3, {
    ...conversation, kind: 'message', isExplicitConversationPin: false,
    recordId: 'thread_902_m1', snippet: 'Em xuống nhé.',
  });
  const repinned = tagSuspect(withMessage.suspects, name, 'internet-messaging', 4, contact);
  expect(repinned.added).toBe(false);
  expect(repinned.suspects).toHaveLength(1);
  expect(repinned.suspects[0].messages?.map(entry => entry.text)).toEqual([contact.snippet, 'Em xuống nhé.']);

  const separateSavedCards = sources.map((source, index) => tagSuspect([], name, 'internet-messaging', index + 1, source).suspects[0]);
  expect(normalizeTaggedSuspects(separateSavedCards)).toHaveLength(1);
  expect(normalizeTaggedSuspects(separateSavedCards)[0].messages?.map(entry => entry.text)).toContain(contact.snippet);
});
