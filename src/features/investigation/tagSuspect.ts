import type { AppId } from '../../shared/contracts/app-contracts';
import type { EvidenceSource, PinnedMessageEntry } from '../../shared/contracts/evidence';
import { cleanDisplayName, resolveConversationId } from '../../shared/contracts/conversationId';

export { cleanDisplayName, resolveConversationId };

export type PinnedMessageItem = PinnedMessageEntry;

export interface TaggedSuspect {
  suspectId: string;
  displayName: string;
  sourceApp: AppId;
  timestamp: number;
  evidence?: EvidenceSource;
  conversationId?: string;
  isExplicitConversationPin?: boolean;
  messages?: PinnedMessageItem[];
}

function contactConversationId(suspects: readonly TaggedSuspect[], name: string, appId: AppId): string | undefined {
  if (appId !== 'internet-messaging') return undefined;
  for (const suspect of suspects) {
    if (suspect.sourceApp !== appId || cleanDisplayName(suspect.displayName) !== name) continue;
    const id = resolveConversationId(appId, suspect.evidence?.recordId,
      suspect.conversationId || suspect.evidence?.conversationId, suspect.displayName);
    if (id) return id;
  }
  return undefined;
}

/**
 * Normalizes an array of TaggedSuspect items:
 * - Strips "Tin nhắn: " prefix from names.
 * - Extracts conversation ID and groups all messages from the same conversation into ONE card.
 * - Migrates legacy unaggregated message items into bullet entries.
 */
export function normalizeTaggedSuspects(
  suspects: readonly TaggedSuspect[],
): TaggedSuspect[] {
  if (!suspects || suspects.length === 0) return [];

  const groupedMap = new Map<string, TaggedSuspect>();
  const nonGrouped: TaggedSuspect[] = [];

  for (const s of suspects) {
    const cleanedName = cleanDisplayName(s.displayName);
    const convId = resolveConversationId(
      s.sourceApp,
      s.evidence?.recordId,
      s.conversationId || s.evidence?.conversationId,
      s.displayName,
    ) || (s.evidence?.kind === 'person' ? contactConversationId(suspects, cleanedName, s.sourceApp) : undefined);

    if (convId) {
      const key = `${s.sourceApp}::${convId}`;
      const existing = groupedMap.get(key);

      // Collect any messages from this entry
      const incomingMessages: PinnedMessageItem[] = [...(s.messages || [])];
      // If legacy entry had no messages array but had evidence snippet from a message bubble
      if (incomingMessages.length === 0 && s.evidence?.snippet && s.evidence.snippet.trim()) {
        const isMessageRecord = s.evidence.kind === 'message' ||
          (s.evidence.recordId && s.evidence.recordId !== convId) ||
          s.displayName.startsWith('Tin nhắn:');
        if (isMessageRecord) {
          let eventTime = s.evidence.eventTime;
          const eventDate = s.evidence.eventDate;
          if (!eventTime && s.evidence.subtitle) {
            const timeMatch = s.evidence.subtitle.match(/(?:Thời gian:\s*|•\s*)(\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}|\d{1,2}:\d{2})/i);
            if (timeMatch) {
              eventTime = timeMatch[1];
            }
          }
          incomingMessages.push({
            recordId: s.evidence.recordId || `msg_${s.timestamp}`,
            text: s.evidence.snippet,
            eventTime,
            eventDate,
            rawTimestamp: s.evidence.rawTimestamp,
            clueRefId: s.evidence.clueRefId,
            direction: s.evidence.direction,
            sender: s.evidence.sender,
          });
        }
      }

      for (const m of incomingMessages) {
        if (!m.eventTime && s.evidence?.subtitle) {
          const timeMatch = s.evidence.subtitle.match(/(?:Thời gian:\s*|•\s*)(\d{1,2}\/\d{1,2}\s+\d{1,2}:\d{2}|\d{1,2}:\d{2})/i);
          if (timeMatch) {
            m.eventTime = timeMatch[1];
          }
        }
      }

      const isExplicit = Boolean(
        s.isExplicitConversationPin ||
        s.evidence?.isExplicitConversationPin ||
        s.evidence?.kind === 'conversation' ||
        s.evidence?.recordId === convId ||
        (existing?.isExplicitConversationPin),
      );

      if (!existing) {
        groupedMap.set(key, {
          ...s,
          displayName: cleanedName || s.displayName,
          conversationId: convId,
          isExplicitConversationPin: isExplicit,
          messages: incomingMessages,
          evidence: s.evidence ? {
            ...s.evidence,
            title: cleanedName || s.displayName,
            conversationId: convId,
            kind: incomingMessages.length > 0 ? 'message' : 'conversation',
          } : undefined,
        });
      } else {
        // Merge messages deduplicated by recordId or text
        const currentMessages = [...(existing.messages || [])];
        for (const msg of incomingMessages) {
          const isDuplicate = currentMessages.some(m =>
            (m.recordId && msg.recordId && m.recordId === msg.recordId) ||
            (m.text && msg.text && m.text.trim() === msg.text.trim()),
          );
          if (!isDuplicate) {
            currentMessages.push(msg);
          }
        }

        groupedMap.set(key, {
          ...existing,
          displayName: existing.displayName || cleanedName,
          timestamp: Math.min(existing.timestamp, s.timestamp),
          isExplicitConversationPin: isExplicit,
          messages: currentMessages,
          evidence: (existing.evidence || s.evidence) ? {
            ...(existing.evidence || s.evidence)!,
            ...s.evidence,
            caseId: s.evidence?.caseId || existing.evidence?.caseId || '',
            recordId: s.evidence?.recordId || existing.evidence?.recordId || convId,
            title: existing.displayName || cleanedName,
            conversationId: convId,
            kind: currentMessages.length > 0 ? 'message' : 'conversation',
            clueRefId: existing.evidence?.clueRefId || s.evidence?.clueRefId,
          } : undefined,
        });
      }
    } else {
      nonGrouped.push({
        ...s,
        displayName: cleanedName || s.displayName,
      });
    }
  }

  return [...groupedMap.values(), ...nonGrouped];
}

/**
 * Pinned evidence aggregator and deduplicator.
 *
 * Invariants:
 * - Grouping key for conversations: (sourceApp, conversationId).
 * - Pinning a conversation pins the visible alias only (no body/preview).
 * - Pinning a message adds a unique message bullet to that conversation's card.
 * - Re-pinning an existing message does not duplicate it or increase card count.
 * - Pinning a conversation when messages already exist preserves those messages and marks conversation as explicitly pinned.
 * - Transactions, orders, and non-conversation clues remain individually addressable.
 * - Legacy person tags without evidence remain supported.
 */
export function tagSuspect(
  suspects: readonly TaggedSuspect[],
  name: string,
  appId: AppId,
  timestamp: number,
  evidence?: EvidenceSource,
): { suspects: TaggedSuspect[]; added: boolean } {
  const normalized = normalizeTaggedSuspects(suspects);
  const cleanedName = cleanDisplayName(evidence?.visibleAlias || name);
  const conversationId = resolveConversationId(
    appId,
    evidence?.recordId,
    evidence?.conversationId || (evidence?.kind === 'conversation' ? evidence.recordId : undefined),
    cleanedName,
  ) || (evidence?.kind === 'person' ? contactConversationId(normalized, cleanedName, appId) : undefined);

  // Grouped conversation flow
  if (conversationId) {
    const existingIndex = normalized.findIndex(
      s => s.sourceApp === appId &&
           (s.conversationId === conversationId ||
            s.evidence?.conversationId === conversationId ||
            s.evidence?.recordId === conversationId ||
            (cleanedName && s.displayName === cleanedName)),
    );

    const isConversationPin = evidence?.kind === 'conversation' || evidence?.isExplicitConversationPin;
    const visibleName = cleanedName || (existingIndex !== -1 ? normalized[existingIndex].displayName : name.trim());
    const existing = normalized[existingIndex];
    const currentMessages = [...(existing?.messages || [])];
    // Keep contact details when either a conversation or message joins its card.
    if (currentMessages.length === 0 && existing?.evidence?.kind === 'person' && existing.evidence.snippet.trim()) {
      currentMessages.push({ recordId: existing.evidence.recordId, text: existing.evidence.snippet });
    }

    if (isConversationPin) {
      if (existingIndex !== -1) {
        // If already explicitly pinned and visible name matches, nothing new added
        if (existing.isExplicitConversationPin && existing.displayName === visibleName) {
          return { suspects: normalized, added: false };
        }
        // Upgrade to explicitly pinned conversation while preserving all existing messages
        const updatedList = [...normalized];
        updatedList[existingIndex] = {
          ...existing,
          displayName: visibleName || existing.displayName,
          conversationId,
          messages: currentMessages,
          isExplicitConversationPin: true,
          evidence: {
            ...existing.evidence,
            ...evidence,
            title: visibleName || existing.displayName,
            snippet: '',
            isExplicitConversationPin: true,
          },
        };
        return { suspects: updatedList, added: true };
      }

      // New title-only conversation card
      const newSuspect: TaggedSuspect = {
        suspectId: `tag_${timestamp}`,
        displayName: visibleName,
        sourceApp: appId,
        timestamp,
        conversationId,
        isExplicitConversationPin: true,
        messages: [],
        evidence: {
          ...evidence,
          title: visibleName,
          snippet: '',
          isExplicitConversationPin: true,
        },
      };
      return { suspects: [...normalized, newSuspect], added: true };
    }

    // Message pin flow
    const messageEntry: PinnedMessageItem = {
      recordId: evidence?.recordId || `msg_${timestamp}`,
      text: evidence?.snippet || '',
      eventTime: evidence?.eventTime,
      eventDate: evidence?.eventDate,
      rawTimestamp: evidence?.rawTimestamp,
      clueRefId: evidence?.clueRefId,
      direction: evidence?.direction,
      sender: evidence?.sender,
    };

    if (existingIndex !== -1) {
      // Deduplicate message by recordId or text
      if (currentMessages.some(m => (m.recordId && m.recordId === messageEntry.recordId) || (m.text && m.text.trim() === messageEntry.text.trim()))) {
        return { suspects: normalized, added: false };
      }

      const updatedCard: TaggedSuspect = {
        ...existing,
        displayName: existing.displayName || visibleName,
        conversationId,
        messages: [...currentMessages, messageEntry],
      };
      const updatedList = [...normalized];
      updatedList[existingIndex] = updatedCard;
      return { suspects: updatedList, added: true };
    }

    // Create new conversation card with this first message
    const newSuspect: TaggedSuspect = {
      suspectId: `tag_${timestamp}`,
      displayName: visibleName,
      sourceApp: appId,
      timestamp,
      conversationId,
      isExplicitConversationPin: false,
      messages: [messageEntry],
      evidence: evidence ? {
        ...evidence,
        caseId: evidence.caseId || '',
        recordId: evidence.recordId || conversationId,
        title: visibleName,
      } : undefined,
    };
    return { suspects: [...normalized, newSuspect], added: true };
  }

  // Non-conversation records (transactions, orders, generic evidence)
  if (evidence) {
    if (normalized.some(s => s.sourceApp === appId &&
                             s.evidence?.recordId === evidence.recordId)) {
      return { suspects: normalized, added: false };
    }
    return {
      added: true,
      suspects: [...normalized, {
        suspectId: `tag_${timestamp}`,
        displayName: cleanedName || evidence.visibleAlias || name,
        sourceApp: appId,
        timestamp,
        evidence,
      }],
    };
  }

  // Legacy person tag without evidence
  if (normalized.some(s => s.displayName === cleanedName || s.displayName === name)) {
    return { suspects: normalized, added: false };
  }

  return {
    added: true,
    suspects: [...normalized, {
      suspectId: `tag_${timestamp}`,
      displayName: cleanedName || name,
      sourceApp: appId,
      timestamp,
    }],
  };
}

/**
 * Removes an individual message from a conversation card.
 * If the card has no remaining messages:
 * - If the conversation was explicitly pinned, keeps the title-only card.
 * - Otherwise, removes the empty card entirely.
 */
export function removePinnedMessage(
  suspects: readonly TaggedSuspect[],
  targetId: string, // suspectId or conversationId
  messageRecordId: string,
): {
  suspects: TaggedSuspect[];
  removedMessage?: PinnedMessageItem;
  removedCard?: TaggedSuspect;
} {
  const cardIndex = suspects.findIndex(
    s => s.suspectId === targetId || s.conversationId === targetId,
  );
  if (cardIndex === -1) {
    return { suspects: [...suspects] };
  }

  const card = suspects[cardIndex];
  const messages = card.messages || [];
  const messageToRemove = messages.find(m => m.recordId === messageRecordId);
  if (!messageToRemove) {
    return { suspects: [...suspects] };
  }

  const remainingMessages = messages.filter(m => m.recordId !== messageRecordId);
  if (remainingMessages.length === 0 && !card.isExplicitConversationPin) {
    // Remove the entire card since it was not explicitly pinned
    const updated = suspects.filter((_, idx) => idx !== cardIndex);
    return {
      suspects: updated,
      removedMessage: messageToRemove,
      removedCard: card,
    };
  }

  // Keep card with updated messages list
  const updatedCard: TaggedSuspect = {
    ...card,
    messages: remainingMessages,
  };
  const updated = [...suspects];
  updated[cardIndex] = updatedCard;

  return {
    suspects: updated,
    removedMessage: messageToRemove,
  };
}

/**
 * Removes a whole clue card (and all its pinned messages).
 */
export function removePinnedCard(
  suspects: readonly TaggedSuspect[],
  targetId: string,
): {
  suspects: TaggedSuspect[];
  removedCard?: TaggedSuspect;
} {
  const card = suspects.find(
    s => s.suspectId === targetId || s.evidence?.recordId === targetId || s.conversationId === targetId,
  );
  if (!card) {
    return { suspects: [...suspects] };
  }
  return {
    suspects: suspects.filter(s => s !== card),
    removedCard: card,
  };
}

/**
 * Restores removed evidence (either a card or an individual message).
 * Handles idempotency: if the card or message was re-pinned in the meantime, merges cleanly without duplication.
 */
export function restorePinnedEvidence(
  suspects: readonly TaggedSuspect[],
  restored: {
    card?: TaggedSuspect;
    message?: PinnedMessageItem;
    targetSuspectId?: string;
    targetId?: string;
  },
): TaggedSuspect[] {
  // 1. Restoring a whole card
  if (restored.card) {
    const existingIndex = suspects.findIndex(
      s => s.suspectId === restored.card!.suspectId ||
           (s.conversationId && restored.card!.conversationId &&
            s.conversationId === restored.card!.conversationId &&
            s.sourceApp === restored.card!.sourceApp),
    );
    if (existingIndex === -1) {
      return [...suspects, restored.card];
    }
    // If card exists, merge explicit pin state and messages
    const existing = suspects[existingIndex];
    const mergedMessages = [...(existing.messages || [])];
    for (const msg of restored.card.messages || []) {
      if (!mergedMessages.some(m => m.recordId === msg.recordId)) {
        mergedMessages.push(msg);
      }
    }
    const updated = [...suspects];
    updated[existingIndex] = {
      ...existing,
      isExplicitConversationPin: existing.isExplicitConversationPin || restored.card.isExplicitConversationPin,
      messages: mergedMessages,
    };
    return updated;
  }

  // 2. Restoring an individual message
  const targetId = restored.targetSuspectId || restored.targetId;
  if (restored.message && targetId) {
    const cardIndex = suspects.findIndex(
      s => s.suspectId === targetId || s.conversationId === targetId || s.evidence?.recordId === targetId,
    );
    if (cardIndex !== -1) {
      const card = suspects[cardIndex];
      const messages = card.messages || [];
      if (!messages.some(m => m.recordId === restored.message!.recordId)) {
        const updatedCard = {
          ...card,
          messages: [...messages, restored.message],
        };
        const updated = [...suspects];
        updated[cardIndex] = updatedCard;
        return updated;
      }
      return [...suspects];
    }
  }

  return [...suspects];
}
