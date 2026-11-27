import { describe, expect, it } from 'vitest';
import {
  cleanDisplayName,
  normalizeTaggedSuspects,
  removePinnedCard,
  removePinnedMessage,
  resolveConversationId,
  restorePinnedEvidence,
  tagSuspect,
  type TaggedSuspect,
} from './tagSuspect';
import type { EvidenceSource } from '../../shared/contracts/evidence';

describe('cleanDisplayName & resolveConversationId', () => {
  it('strips legacy Tin nhắn prefix cleanly', () => {
    expect(cleanDisplayName('Tin nhắn: Anh Tuấn Thợ Điện')).toBe('Anh Tuấn Thợ Điện');
    expect(cleanDisplayName('  Em Lan  ')).toBe('Em Lan');
    expect(cleanDisplayName('')).toBe('');
  });

  it('resolves thread and ecommerce chat conversation IDs from recordIds', () => {
    expect(resolveConversationId('internet-messaging', 'thread_tuan_m4')).toBe('thread_tuan');
    expect(resolveConversationId('internet-messaging', 'thread_tuan')).toBe('thread_tuan');
    expect(resolveConversationId('ecommerce', 'chat:shop_lingerie:message:msg_1')).toBe('shop_lingerie');
    expect(resolveConversationId('banking', 'tx_1001')).toBeUndefined();
  });
});

describe('tagSuspect aggregation, removal, and restore', () => {
  const msg1: EvidenceSource = {
    caseId: 'case_01',
    recordId: 'thread_tuan_m1',
    conversationId: 'thread_tuan',
    kind: 'message',
    title: 'Anh Tuấn Thợ Điện',
    visibleAlias: 'Anh Tuấn Thợ Điện',
    snippet: 'Anh mang áo qua nhé',
    eventTime: '23:44',
  };

  const msg2: EvidenceSource = {
    ...msg1,
    recordId: 'thread_tuan_m2',
    snippet: 'Em mở cửa đi',
    eventTime: '23:45',
  };

  const convPin: EvidenceSource = {
    caseId: 'case_01',
    recordId: 'thread_tuan',
    conversationId: 'thread_tuan',
    kind: 'conversation',
    title: 'Anh Tuấn Thợ Điện',
    visibleAlias: 'Anh Tuấn Thợ Điện',
    snippet: '',
    isExplicitConversationPin: true,
  };

  it('groups multiple messages from the same conversation into one card and deduplicates', () => {
    const step1 = tagSuspect([], 'Anh Tuấn Thợ Điện', 'internet-messaging', 100, msg1);
    expect(step1.added).toBe(true);
    expect(step1.suspects).toHaveLength(1);
    expect(step1.suspects[0].messages).toHaveLength(1);

    // Duplicate message should not add
    const dup = tagSuspect(step1.suspects, 'Anh Tuấn Thợ Điện', 'internet-messaging', 101, msg1);
    expect(dup.added).toBe(false);
    expect(dup.suspects[0].messages).toHaveLength(1);

    // Second unique message appends to same card
    const step2 = tagSuspect(step1.suspects, 'Anh Tuấn Thợ Điện', 'internet-messaging', 102, msg2);
    expect(step2.added).toBe(true);
    expect(step2.suspects).toHaveLength(1);
    expect(step2.suspects[0].messages).toHaveLength(2);
  });

  it('preserves existing messages when upgrading a card to an explicit conversation pin', () => {
    const withMsg = tagSuspect([], 'Anh Tuấn Thợ Điện', 'internet-messaging', 100, msg1);
    const upgraded = tagSuspect(withMsg.suspects, 'Anh Tuấn Thợ Điện', 'internet-messaging', 105, convPin);
    expect(upgraded.added).toBe(true);
    expect(upgraded.suspects).toHaveLength(1);
    expect(upgraded.suspects[0].isExplicitConversationPin).toBe(true);
    expect(upgraded.suspects[0].messages).toHaveLength(1);

    // Re-pinning explicit conversation is idempotent
    const repeat = tagSuspect(upgraded.suspects, 'Anh Tuấn Thợ Điện', 'internet-messaging', 106, convPin);
    expect(repeat.added).toBe(false);
  });

  it('removes empty non-explicit conversation card when its last message is removed, but keeps explicit card', () => {
    const implicit = tagSuspect([], 'Anh Tuấn Thợ Điện', 'internet-messaging', 100, msg1).suspects;
    const removedImplicit = removePinnedMessage(implicit, 'thread_tuan', 'thread_tuan_m1');
    expect(removedImplicit.suspects).toHaveLength(0);
    expect(removedImplicit.removedCard?.conversationId).toBe('thread_tuan');

    const explicit = tagSuspect(implicit, 'Anh Tuấn Thợ Điện', 'internet-messaging', 101, convPin).suspects;
    const removedExplicit = removePinnedMessage(explicit, 'thread_tuan', 'thread_tuan_m1');
    expect(removedExplicit.suspects).toHaveLength(1);
    expect(removedExplicit.suspects[0].messages).toEqual([]);
    expect(removedExplicit.removedCard).toBeUndefined();
  });

  it('removes and idempotently restores cards and individual messages', () => {
    const initial = tagSuspect([], 'Anh Tuấn Thợ Điện', 'internet-messaging', 100, msg1).suspects;
    const { suspects: afterRemove, removedCard } = removePinnedCard(initial, 'thread_tuan');
    expect(afterRemove).toHaveLength(0);
    expect(removedCard).toBeDefined();

    const restored = restorePinnedEvidence(afterRemove, { card: removedCard });
    expect(restored).toHaveLength(1);

    // Restoring again merges without duplicating card or message
    const restoredAgain = restorePinnedEvidence(restored, { card: removedCard });
    expect(restoredAgain).toHaveLength(1);
    expect(restoredAgain[0].messages).toHaveLength(1);
  });

  it('keeps non-conversation records individually addressable and normalizes legacy entries', () => {
    const tx: EvidenceSource = {
      caseId: 'case_01',
      recordId: 'tx_999',
      kind: 'transaction',
      title: 'Chuyển khoản 1.000đ',
      snippet: 'Nhớ em',
    };
    const r1 = tagSuspect([], 'Chuyển khoản', 'banking', 200, tx);
    const r2 = tagSuspect(r1.suspects, 'Chuyển khoản', 'banking', 201, tx);
    expect(r1.added).toBe(true);
    expect(r2.added).toBe(false);

    const legacy: TaggedSuspect[] = [
      {
        suspectId: 'legacy_1',
        displayName: 'Tin nhắn: Anh Tuấn Thợ Điện',
        sourceApp: 'internet-messaging',
        timestamp: 50,
        evidence: {
          caseId: 'case_01',
          recordId: 'thread_tuan_m9',
          kind: 'message',
          title: 'Tin nhắn: Anh Tuấn Thợ Điện',
          snippet: 'Tối nay nhé',
          subtitle: 'Thời gian: 22:15',
        },
      },
    ];
    const normalized = normalizeTaggedSuspects(legacy);
    expect(normalized).toHaveLength(1);
    expect(normalized[0].displayName).toBe('Anh Tuấn Thợ Điện');
    expect(normalized[0].conversationId).toBe('thread_tuan');
    expect(normalized[0].messages?.[0]?.eventTime).toBe('22:15');
  });
});
