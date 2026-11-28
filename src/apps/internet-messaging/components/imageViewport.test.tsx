import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { clampImage, fitImage, zoomImage } from './imageViewport';
import { MessagingImageViewer } from './MessagingImageViewer';
import { MessagingChatThreadView } from './MessagingChatThreadView';
import { loadCase } from '../../../features/case-runtime';
import { readMessagingData } from '../data';

describe('Messaging image inspection', () => {
  const bounds = { width: 400, height: 400, imageWidth: 400, imageHeight: 300 };
  it('zooms around the inspected point and keeps panning bounded by the image', () => {
    expect(zoomImage(fitImage, 2, { x: 40, y: 20 }, bounds)).toEqual({ zoom: 2, x: -40, y: -20 });
    expect(clampImage({ zoom: 2, x: 900, y: -900 }, bounds)).toEqual({ zoom: 2, x: 200, y: -100 });
    expect(zoomImage({ zoom: 3, x: 100, y: 100 }, 1, { x: 0, y: 0 }, bounds)).toEqual(fitImage);
    expect(zoomImage(fitImage, 20, { x: 0, y: 0 }, bounds).zoom).toBe(5);
  });

  it('leaves letterboxed images centered until they exceed the viewport', () => {
    expect(clampImage({ zoom: 1.5, x: 20, y: 30 }, { width: 800, height: 600, imageWidth: 400, imageHeight: 300 })).toEqual({ zoom: 1.5, x: 0, y: 0 });
  });

  it('uses a full-screen black dialog with image controls and no sheet or permanent evidence action', () => {
    const html = renderToStaticMarkup(createElement(MessagingImageViewer, { message: { id: 'photo', sender: 'them', text: 'Bữa cơm nhà', time: '29/09 11:09', type: 'image', imageAsset: 'family-meal', imageAlt: 'Mâm cơm gia đình' }, contactName: 'Mẹ', caseId: 'case_01', onClose: vi.fn(), onEvidence: vi.fn() }));
    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain('absolute inset-0');
    expect(html).toContain('bg-black');
    expect(html).not.toContain('ios-sheet');
    expect(html).not.toContain('rounded-t-');
    expect(html).toContain('Đóng xem ảnh');
    expect(html).toContain('Phóng to');
    expect(html).toContain('Thu nhỏ');
    expect(html).toContain('Vừa màn hình');
    expect(html).toContain('Mâm cơm gia đình');
    expect(html).not.toMatch(/<button[^>]*>[^<]*Ghim/);
  });

  it('prioritizes spouse and parent history without promoting the culprit in the inbox', () => {
    const data = readMessagingData(loadCase('case_01').appsData['internet-messaging']);
    const wife = data.threads!.find(t => t.threadId === 'thread_005')!;
    const mother = data.threads!.find(t => t.threadId === 'thread_010')!;
    const culprit = data.threads!.find(t => t.threadId === 'thread_003')!;
    expect(wife.historyPriority).toBe('high');
    expect(mother.historyPriority).toBe('high');
    expect(wife.messages.length).toBeGreaterThanOrEqual(70);
    expect(mother.messages.length).toBeGreaterThanOrEqual(60);
    expect(mother.messages.length).toBeGreaterThan(culprit.messages.length * 3);
    expect(wife.messages[0].time).toContain('/08');
    expect(data.contacts!.every(c => c.historyPriority)).toBe(true);
    expect(culprit.isPinned ?? false).toBe(false);
  });

  it('renders chat message container targeting latest message on thread opening', () => {
    const data = readMessagingData(loadCase('case_01').appsData['internet-messaging']);
    const thread = data.threads!.find(t => t.threadId === 'thread_005')!;
    const lastMessage = thread.messages[thread.messages.length - 1];
    const html = renderToStaticMarkup(createElement(MessagingChatThreadView, {
      thread,
      onBack: vi.fn(),
      onTagSuspect: vi.fn(),
    }));
    expect(html).toContain('data-testid="chat-messages-container"');
    expect(html).toContain(lastMessage.text);
  });
});
