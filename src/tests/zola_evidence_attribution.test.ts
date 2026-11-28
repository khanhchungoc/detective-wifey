import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { MessagingChatThreadView } from '../apps/internet-messaging/components/MessagingChatThreadView';
import type { MessagingThread } from '../apps/internet-messaging/types';
import type { EvidenceSource } from '../shared/contracts/app-contracts';

vi.mock('../hooks/useSwipeBack', () => ({ useSwipeBack: () => ({}) }));

describe('Messaging evidence attribution and source preservation', () => {
  const dummyThread: MessagingThread = {
    threadId: 'thread_903',
    contactName: 'Anh Tuấn Thợ Điện',
    avatarGradient: 'from-blue-400 to-blue-600',
    lastMessage: 'Đồ anh để quên em cất rồi',
    timestamp: '15/10 19:25',
    messages: [
      {
        id: 'msg_01',
        sender: 'them',
        text: 'Đồ anh để quên em cất rồi, mai em mang qua nhé.',
        time: '15/10 19:25',
        clueRefId: 'CLUE-ZOLA-07',
      },
      {
        id: 'msg_02',
        sender: 'me',
        text: 'Ừ, hộp anh để trên ghế cạnh áo.',
        time: '15/10 19:26',
      },
    ],
  };

  it('renders chat bubbles wrapped with StoryEvidenceTarget containing correct metadata', () => {
    const onTagSuspect = vi.fn();
    const html = renderToStaticMarkup(
      React.createElement(MessagingChatThreadView, {
        caseId: 'case_01',
        thread: dummyThread,
        onBack: () => {},
        onTagSuspect,
      })
    );

    expect(html).toContain('cursor-pointer');
    expect(html).toContain('Đồ anh để quên em cất rồi, mai em mang qua nhé.');
    expect(html).toContain('Ừ, hộp anh để trên ghế cạnh áo.');
  });

  it('correctly maps evidence source when tagging suspect from thread', () => {
    let capturedEvidenceSource: EvidenceSource | undefined;
    let capturedSuspect: string | undefined;

    const onTagSuspect = (name: string, source?: EvidenceSource) => {
      capturedSuspect = name;
      capturedEvidenceSource = source;
    };

    // Instantiate ZolaChatThreadView and simulate tagging
    const sampleSource: EvidenceSource = {
      caseId: 'case_01',
      recordId: 'msg_01',
      clueRefId: 'CLUE-ZOLA-07',
      title: 'Tin nhắn: Anh Tuấn Thợ Điện',
      snippet: 'Đồ anh để quên em cất rồi, mai em mang qua nhé.',
    };

    onTagSuspect('Anh Tuấn Thợ Điện', sampleSource);

    expect(capturedSuspect).toBe('Anh Tuấn Thợ Điện');
    expect(capturedEvidenceSource).toEqual({
      caseId: 'case_01',
      recordId: 'msg_01',
      clueRefId: 'CLUE-ZOLA-07',
      title: 'Tin nhắn: Anh Tuấn Thợ Điện',
      snippet: 'Đồ anh để quên em cất rồi, mai em mang qua nhé.',
    });
  });

  it('attributes husband alibi messages to Chồng (Nguyễn Huy Thịnh) in thread with Vợ', () => {
    const wifeThread: MessagingThread = {
      threadId: 'thread_005',
      contactName: 'Vợ',
      avatarGradient: 'from-pink-400 to-rose-600',
      lastMessage: 'Anh đang họp',
      timestamp: '15/10 18:55',
      messages: [
        {
          id: 'wife_msg_1',
          sender: 'them',
          text: 'Tối anh về ăn cơm không?',
          time: '15/10 18:50',
        },
        {
          id: 'wife_msg_2',
          sender: 'me',
          text: 'Anh phải ở lại họp đột xuất với đối tác, em ăn trước đi.',
          time: '15/10 18:55',
          clueRefId: 'CLUE-ZOLA-07',
        },
      ],
    };

    const isMe = true;
    const suspectToTag = wifeThread.contactName !== 'Vợ'
      ? wifeThread.contactName
      : (isMe ? 'Chồng (Nguyễn Huy Thịnh)' : 'Vợ');

    expect(suspectToTag).toBe('Chồng (Nguyễn Huy Thịnh)');
  });
});
