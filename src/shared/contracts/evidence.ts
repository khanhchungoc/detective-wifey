export type EvidenceKind =
  | 'person'
  | 'conversation'
  | 'message'
  | 'transaction'
  | 'order'
  | 'note'
  | 'photo'
  | 'search'
  | 'notification'
  | 'generic';

export interface PinnedMessageEntry {
  recordId: string;
  text: string;
  eventTime?: string;
  eventDate?: string;
  rawTimestamp?: string | number;
  clueRefId?: string;
  sender?: string;
  direction?: 'incoming' | 'outgoing' | 'inflow' | 'outflow';
}

export interface EvidenceSource {
  caseId: string;
  recordId: string;
  suspectId?: string;
  clueRefId?: string;
  title: string;
  snippet: string;
  subtitle?: string;
  kind?: EvidenceKind;
  conversationId?: string;
  visibleAlias?: string;
  eventTime?: string;
  eventDate?: string;
  rawTimestamp?: string | number;
  isExplicitConversationPin?: boolean;
  direction?: 'incoming' | 'outgoing' | 'inflow' | 'outflow';
  sender?: string;
  imageSrc?: string;
  imagePosition?: string;
}

export interface UniversalEvidenceItem {
  title: string;
  /** Visible source profile only; attribution alone does not imply an avatar. */
  profileName?: string;
  snippet: string;
  suspectToTag: string;
  subtitle?: string;
  source?: EvidenceSource;
  kind?: EvidenceKind;
  conversationId?: string;
  visibleAlias?: string;
  eventTime?: string;
  eventDate?: string;
  rawTimestamp?: string | number;
  isExplicitConversationPin?: boolean;
  direction?: 'incoming' | 'outgoing' | 'inflow' | 'outflow';
  sender?: string;
  imageSrc?: string;
  imagePosition?: string;
}

/**
 * Normalizes event date and time into canonical "DD/MM · HH:mm" presentation.
 * Displays only verified precision when exact values are unavailable.
 */
export function formatEventDateTime(
  eventDate?: string,
  eventTime?: string,
  rawTimestamp?: string | number,
): string {
  let datePart = (eventDate || '').trim();
  let timePart = (eventTime || '').trim();

  // If eventTime has combined date and time e.g. "24/09 10:18" or "24/09 · 10:18" and datePart is empty
  if (!datePart && timePart) {
    const combinedMatch = timePart.match(/^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:[\s·]+)(\d{1,2}:\d{2})$/);
    if (combinedMatch) {
      datePart = combinedMatch[1];
      timePart = combinedMatch[2];
    }
  }

  // If raw timestamp string is provided, try extracting date and time
  if (typeof rawTimestamp === 'string' && rawTimestamp.trim()) {
    const raw = rawTimestamp.trim();
    // Patterns like "24/09 10:05" or "15/10/2026 23:44" or "28/09 · 12:10"
    const combinedMatch = raw.match(/^(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)(?:[\s·]+)(\d{1,2}:\d{2})$/);
    if (combinedMatch) {
      if (!datePart) datePart = combinedMatch[1];
      if (!timePart) timePart = combinedMatch[2];
    } else {
      // Check if it's only time, e.g. "12:10" or "23:45"
      const timeOnlyMatch = raw.match(/^\d{1,2}:\d{2}$/);
      if (timeOnlyMatch && !timePart) {
        timePart = raw;
      }
      // Check if it's only date, e.g. "28/09" or "28/09/2026"
      const dateOnlyMatch = raw.match(/^\d{1,2}\/\d{1,2}(?:\/\d{2,4})?$/);
      if (dateOnlyMatch && !datePart) {
        datePart = raw;
      }

      // Check if ISO date string e.g. 2026-09-28T12:10:00Z
      if (!datePart || !timePart) {
        const parsedDate = new Date(raw);
        if (!isNaN(parsedDate.getTime())) {
          if (!datePart) {
            const d = String(parsedDate.getUTCDate()).padStart(2, '0');
            const m = String(parsedDate.getUTCMonth() + 1).padStart(2, '0');
            datePart = `${d}/${m}`;
          }
          if (!timePart) {
            const hh = String(parsedDate.getUTCHours()).padStart(2, '0');
            const mm = String(parsedDate.getUTCMinutes()).padStart(2, '0');
            timePart = `${hh}:${mm}`;
          }
        }
      }
    }
  }

  // Format date part to DD/MM if it includes year (e.g., 28/09/2026 -> 28/09)
  if (datePart) {
    const dateMatch = datePart.match(/^(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?$/);
    if (dateMatch) {
      const d = dateMatch[1].padStart(2, '0');
      const m = dateMatch[2].padStart(2, '0');
      datePart = `${d}/${m}`;
    }
  }

  // Format time part to HH:mm
  if (timePart) {
    const timeMatch = timePart.match(/^(\d{1,2}):(\d{2})$/);
    if (timeMatch) {
      const hh = timeMatch[1].padStart(2, '0');
      const mm = timeMatch[2];
      timePart = `${hh}:${mm}`;
    }
  }

  if (datePart && timePart) {
    return `${datePart} · ${timePart}`;
  }
  if (timePart) {
    return timePart;
  }
  if (datePart) {
    return datePart;
  }
  return '';
}

/**
 * Formats a message bullet entry as `• 28/09 · 12:10: "Nội dung tin nhắn..."`
 */
export function formatMessageBullet(
  textOrEntry: string | PinnedMessageEntry,
  eventDate?: string,
  eventTime?: string,
  rawTimestamp?: string | number,
): string {
  if (typeof textOrEntry === 'object' && textOrEntry !== null) {
    const dt = formatEventDateTime(textOrEntry.eventDate, textOrEntry.eventTime, textOrEntry.rawTimestamp);
    return dt ? `• ${dt}: "${textOrEntry.text}"` : `• "${textOrEntry.text}"`;
  }
  const dt = formatEventDateTime(eventDate, eventTime, rawTimestamp);
  return dt ? `• ${dt}: "${textOrEntry}"` : `• "${textOrEntry}"`;
}

/**
 * Formats a timestamp string for natural in-app UI display (e.g. chat bubbles, call list, inbox).
 * Strips the year "/2026" or "/YYYY" if present so UI stays compact and authentic (e.g. "15/10 20:48" or "20:48").
 */
export function formatDisplayTime(rawTime?: string | number, mode: 'full' | 'short' | 'timeOnly' = 'short'): string {
  if (!rawTime) return '';
  const str = String(rawTime).trim();
  // Match "DD/MM/YYYY HH:mm" or "DD/MM/YYYY"
  const fullMatch = str.match(/^(\d{1,2}\/\d{1,2})(?:\/\d{2,4})\s+(\d{1,2}:\d{2})(?::\d{2})?$/);
  if (fullMatch) {
    if (mode === 'timeOnly') return fullMatch[2];
    if (mode === 'short') return `${fullMatch[1]} ${fullMatch[2]}`;
    return str;
  }
  const dateOnlyMatch = str.match(/^(\d{1,2}\/\d{1,2})(?:\/\d{2,4})$/);
  if (dateOnlyMatch) {
    return dateOnlyMatch[1];
  }
  return str;
}

