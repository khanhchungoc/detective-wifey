import React from 'react';
import { IoTrashOutline } from 'react-icons/io5';
import { formatEventDateTime } from '../../../shared/contracts/evidence';
import type { PinnedMessageEntry } from '../../../shared/contracts/evidence';
import { EvidenceSnippet } from '../../../shared/ui/EvidenceSnippet';

export type ClueDirection = 'incoming' | 'outgoing';

export interface TimelineEntryItem {
  id: string;
  timestampText: string;
  direction: ClueDirection;
  content: string;
  fieldIconsEnabled?: boolean;
}

/**
 * Heuristically parses direction from sender, sourceApp, or content.
 * Universal rules:
 * - Orders/purchases/deliveries: all incoming ('incoming').
 * - Banking: Inflow/money received is incoming ('incoming'); Outflow/spending is outgoing ('outgoing').
 * - Messages/chat:
 *     - If sender is explicitly 'me', 'user', 'husband' -> outgoing
 *     - If sender is 'them', 'shop', 'other' -> incoming
 *     - If text starts with indicators or subtitle shows who sent
 *     - Default incoming if from contact, outgoing if from husband
 */
export function resolveEntryDirection(
  entry: {
    sender?: string;
    text?: string;
    direction?: 'inflow' | 'outflow' | 'incoming' | 'outgoing';
  },
  sourceAppId?: string,
): ClueDirection {
  if (entry.direction === 'outgoing' || entry.direction === 'outflow') return 'outgoing';
  if (entry.direction === 'incoming' || entry.direction === 'inflow') return 'incoming';

  if (sourceAppId === 'ecommerce') {
    return 'incoming';
  }

  const sender = (entry.sender || '').toLowerCase().trim();
  if (
    sender === 'me' ||
    sender === 'user' ||
    sender === 'husband' ||
    sender.includes('chồng') ||
    sender.includes('nguyễn huy hoàng')
  ) {
    return 'outgoing';
  }

  if (
    sender === 'them' ||
    sender === 'shop' ||
    sender === 'other' ||
    sender.includes('vợ')
  ) {
    return 'incoming';
  }

  // Heuristic based on text content if sender is unknown
  // In Level 01, messages like "Anh ơi...", "Được rồi, cảm ơn anh.", "Em đặt rồi, 19h30..." are from "them" (incoming)
  // "Em kiểm tra lại...", "Màn phòng họp..." are from "me" (outgoing)
  const text = (entry.text || '').trim();
  if (/^(anh ơi|em đặt|được rồi|đúng là em|em đang|gặp em|mai mang trả)/i.test(text)) {
    return 'incoming';
  }
  if (/^(em kiểm tra|anh tới|anh xem|màn phòng họp|chờ anh|anh gửi)/i.test(text)) {
    return 'outgoing';
  }

  return 'incoming';
}

/**
 * Parses a PinnedMessageEntry into a normalized timeline item.
 */
export function parsePinnedMessageToTimelineEntry(
  msg: PinnedMessageEntry,
  sourceAppId?: string,
): TimelineEntryItem {
  const timestampText = formatEventDateTime(msg.eventDate, msg.eventTime, msg.rawTimestamp);
  const direction = resolveEntryDirection({
    sender: msg.sender,
    text: msg.text,
    direction: msg.direction,
  }, sourceAppId);

  return {
    id: msg.recordId,
    timestampText,
    direction,
    content: msg.text,
    fieldIconsEnabled: sourceAppId === 'ecommerce',
  };
}

/**
 * Parses a single record node (e.g. transaction, order, search, photo, call) into timeline entries.
 */
export function parseNodeToTimelineEntries(
  node: {
    messages?: PinnedMessageEntry[];
    subtitle?: string;
    label?: string;
    eventDate?: string;
    eventTime?: string;
    rawTimestamp?: string | number;
    sourceAppId?: string;
    direction?: 'inflow' | 'outflow' | 'incoming' | 'outgoing';
  },
): TimelineEntryItem[] {
  if (node.messages && node.messages.length > 0) {
    return node.messages.map(m => parsePinnedMessageToTimelineEntry(m, node.sourceAppId));
  }

  if (node.subtitle) {
    const timestampText = formatEventDateTime(node.eventDate, node.eventTime, node.rawTimestamp);
    let direction: ClueDirection = 'incoming';

    if (node.sourceAppId === 'ecommerce') {
      direction = 'incoming';
    } else if (node.sourceAppId === 'banking') {
      // Inflow / Outflow detection from amount or direction
      const sub = node.subtitle.toLowerCase();
      if (node.direction === 'outflow' || sub.includes('-') || sub.includes('thanh toán') || sub.includes('chuyển tiền')) {
        direction = 'outgoing';
      } else if (node.direction === 'inflow' || sub.includes('+') || sub.includes('nhận tiền') || sub.includes('hoàn')) {
        direction = 'incoming';
      } else {
        direction = 'outgoing';
      }
    } else if (node.direction) {
      direction = node.direction === 'outgoing' ? 'outgoing' : 'incoming';
    }

    return [
      {
        id: 'single_entry',
        timestampText,
        direction,
        content: node.subtitle,
        fieldIconsEnabled: node.sourceAppId === 'ecommerce',
      },
    ];
  }

  return [];
}

interface ClueTimelineRailProps {
  entries: TimelineEntryItem[];
  isSelected?: boolean;
  onDeleteItem?: (id: string) => void;
  className?: string;
}

/**
 * Reusable vertical timeline rail component for clue cards.
 * Features:
 * - Left-hand vertical timeline axis (connecting line + bullet dots).
 * - Pink dot and pink ↙ arrow for incoming items.
 * - Gray dot and gray ↗ arrow for outgoing items.
 * - Two-tier layout:
 *     Tier 1: timestamp + directional arrow (e.g. `24/09 · 10:05 ↗`)
 *     Tier 2: message body / narrative content
 * - Item delete buttons only when more than one item remains
 */
export const ClueTimelineRail: React.FC<ClueTimelineRailProps> = ({
  entries,
  isSelected = false,
  onDeleteItem,
  className = '',
}) => {
  if (!entries || entries.length === 0) return null;

  return (
    <div className={`relative pl-4 space-y-2.5 ${className}`}>
      {/* Vertical Timeline Axis Line */}
      <div
        className="absolute left-[4.5px] top-2 bottom-2 w-[1px] bg-stone-300 pointer-events-none rounded-full"
        aria-hidden="true"
      />

      {entries.map((entry) => {
        const isIncoming = entry.direction === 'incoming';
        const arrow = isIncoming ? '↙' : '↗';
        const dotColorClass = isIncoming
          ? 'bg-[#DC2626] ring-[1.5px] ring-red-200'
          : 'bg-stone-500 ring-[1.5px] ring-stone-200';
        const arrowColorClass = isIncoming
          ? 'text-[#DC2626] font-bold'
          : 'text-stone-500 font-semibold';

        return (
          <div key={entry.id} className="relative group text-left min-w-0 pr-5">
            {/* Compact Timeline Bullet Dot */}
            <span
              aria-hidden="true"
              className={`absolute -left-[14.5px] top-[3.5px] h-1.5 w-1.5 rounded-full transition-transform duration-150 ${dotColorClass}`}
            />

            {/* Tier 1: Timestamp & Direction Arrow */}
            {entry.timestampText && (
              <div className="flex items-center gap-1 leading-none mb-0.5">
                <span className="text-[9px] font-medium text-stone-500 tracking-tight">
                  {entry.timestampText}
                </span>
                <span
                  className={`text-[10px] select-none ${arrowColorClass}`}
                  aria-label={isIncoming ? 'Tin đến' : 'Tin đi'}
                  title={isIncoming ? 'Đến' : 'Đi'}
                >
                  {arrow}
                </span>
              </div>
            )}

            {/* Tier 2: Narrative Content Text */}
            <p className="text-[10.5px] leading-[1.3] text-stone-800 break-words whitespace-pre-line font-normal">
              <EvidenceSnippet text={entry.content} fieldIconsEnabled={entry.fieldIconsEnabled} />
            </p>

            {/* Delete button for individual item */}
            {onDeleteItem && entries.length > 1 && (
              <button
                type="button"
                aria-label="Xóa mục"
                title="Xóa mục"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteItem(entry.id);
                }}
                className={`absolute right-0 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded text-stone-400 hover:text-rose-600 hover:bg-rose-100/80 transition-colors active:scale-90 cursor-pointer before:absolute before:-inset-1.5 ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
                }`}
              >
                <IoTrashOutline className="text-[11px]" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

