import { describe, expect, it } from 'vitest';
import level00 from './index';

const ALL_12_LAUNCHER_APP_IDS = [
  'internet-messaging',
  'banking',
  'ecommerce',
  'phone',
  'messages',
  'ride-hailing',
  'web-browser',
  'photos',
  'personal-notes',
  'email',
  'professional-network',
  'team-collaboration',
] as const;

const ACTIVE_LEVEL_0_APP_IDS = ['phone', 'messages', 'photos'] as const;

interface MessagesAppPayload {
  unreadBadge: number;
  threads: Array<{
    threadId: string;
    lastMessageTimestamp: string;
    contactId: string;
    senderTitle: string;
    phoneNumber?: string;
    isPinned: boolean;
    unreadCount: number;
    messages: Array<{
      messageId: string;
      timestamp: string;
      sender: 'incoming' | 'outgoing';
      bodyText: string;
      clueRefId?: string;
    }>;
  }>;
}

interface PhoneAppPayload {
  calls: Array<{
    callId: string;
    contactId: string;
    contactName: string;
    phoneNumber?: string;
    clueRefId?: string;
  }>;
  contacts: Array<{
    contactId: string;
    displayName: string;
    primaryPhone?: string;
    notesField?: string;
    clueRefId?: string;
  }>;
}

interface PhotosAppPayload {
  albums: Array<{
    id: string;
    title: string;
    isLocked?: boolean;
    photos: Array<{
      id: string;
      date: string;
      timestamp?: string;
      locationTag?: string;
      description: string;
      clueRefId?: string;
    }>;
  }>;
}

describe('husband_01 level_00 modular CaseConfig assembly', () => {
  it('assembles Level 0 core metadata, groundTruth, deviceMetadata, and notification hook', () => {
    expect(level00.caseId).toBe('case_00');
    expect(level00.husbandId).toBe('husband_01');
    expect(level00.levelNumber as number).toBe(0);
    expect(level00.allowedStrikes).toBe(5);
    expect(level00.lockChallenges).toEqual([]);

    expect(level00.groundTruth.verdict).toBe('cheating');
    expect(level00.groundTruth.culpritSuspectId).toBe('suspect_01');
    expect(level00.groundTruth.narrativeRoast).toContain('Lê Ngọc Vy');
    expect(level00.groundTruth.overJealousRoast).toContain('Chị Hằng');

    expect(level00.deviceMetadata).toEqual({
      narrativeTime: '22:15',
      batteryPercent: '54%',
      carrierTag: '5G',
      pwaThemeColor: '#0f172a',
    });

    expect(level00.notifications).toHaveLength(1);
    expect(level00.notifications?.[0]).toEqual({
      toastId: 'toast_001',
      sourceAppId: 'messages',
      senderTitle: 'Tin nhắn • 22:10',
      snippetBody: 'Tùng Gara: Áo khoác anh để quên em cất rồi, mai rảnh em gửi lại nhé.',
      triggerDelaySeconds: 2,
    });
  });

  it('keeps exactly 3 active apps and 9 grayed-out apps out of 12 launcher apps', () => {
    expect(level00.activeAppIds).toEqual([...ALL_12_LAUNCHER_APP_IDS]);
    const grayedSet = new Set(level00.grayedOutAppIds ?? []);
    expect(grayedSet.size).toBe(9);
    expect(grayedSet.has('internet-messaging')).toBe(true);
    expect(grayedSet.has('messages')).toBe(false);

    const enabledApps = level00.activeAppIds.filter((appId) => !grayedSet.has(appId));
    expect(enabledApps).toEqual([...ACTIVE_LEVEL_0_APP_IDS]);

    expect(Object.keys(level00.appsData).sort()).toEqual([...ACTIVE_LEVEL_0_APP_IDS].sort());
  });

  it('resolves suspectPool with initial disguise displayName for suspect_01', () => {
    expect(level00.suspectPool).toHaveLength(2);
    expect(level00.suspectPool[0]).toMatchObject({
      suspectId: 'suspect_01',
      displayName: 'Tùng Gara',
      initialDiscoveredApp: 'messages',
    });
    expect(level00.suspectPool[1]).toMatchObject({
      suspectId: 'suspect_02',
      displayName: 'Chị Hằng In Ấn',
      initialDiscoveredApp: 'phone',
    });
  });

  it('resolves confrontationScript with husband shortName token and required smoking gun edges', () => {
    const script = level00.confrontationScript;
    expect(script).toBeDefined();
    expect(script?.opening).toHaveLength(2);
    expect(script?.opening[0].wifeLine).toContain('Thịnh');
    expect(script?.opening[0].wifeLine).not.toContain('{{');

    expect(script?.beats).toHaveLength(2);
    const beat1Lead = script?.beats[0].choices.find((choice) => choice.choiceId === 'choice_l0_03');
    const beat2Lead = script?.beats[1].choices.find((choice) => choice.choiceId === 'choice_l0_05');
    expect(beat1Lead?.requiredEdgeIds).toEqual(['edge_l0_alias_identity']);
    expect(beat2Lead?.requiredEdgeIds).toEqual(['edge_l0_alibi_photo']);
    expect(script?.ending).toHaveLength(2);

    expect(level00.knowledgeGraph?.requiredSmokingGunEdgeIds).toEqual([
      'edge_l0_alias_identity',
      'edge_l0_alibi_photo',
    ]);
    const kgNodes = level00.knowledgeGraph?.nodes ?? [];
    for (const nodeId of ['node_alias_tung', 'node_record_zola_tung', 'node_record_zola_alibi']) {
      expect(kgNodes.find((node) => node.nodeId === nodeId)?.sourceAppId).toBe('messages');
    }
  });

  it('resolves messages, phone, and photos payloads with forensic clues intact', () => {
    const messages = level00.appsData.messages as MessagesAppPayload;
    expect(messages.unreadBadge).toBe(1);
    expect(messages.threads).toHaveLength(7);
    const tungThread = messages.threads.find((thread) => thread.threadId === 'thread_l0_001');
    const wifeThread = messages.threads.find((thread) => thread.threadId === 'thread_l0_002');
    expect(tungThread?.senderTitle).toBe('Tùng Gara');
    expect(tungThread?.messages.find((msg) => msg.messageId === 'msg_l0_001_04')?.clueRefId).toBe('CLUE-ZOLA-01');
    expect(wifeThread?.senderTitle).toBe('Vợ');
    expect(wifeThread?.messages.find((msg) => msg.messageId === 'msg_l0_002_05')?.clueRefId).toBe('CLUE-ZOLA-07');

    const phone = level00.appsData.phone as PhoneAppPayload;
    expect(phone.contacts).toHaveLength(7);
    expect(phone.calls).toHaveLength(5);
    const tungContact = phone.contacts.find((contact) => contact.contactId === 'contact_l0_001');
    expect(tungContact).toMatchObject({
      displayName: 'Tùng Gara',
      primaryPhone: '0933112244',
      notesField: 'Lê Ngọc Vy - 45 Nguyễn Khang',
      clueRefId: 'CLUE-PHONE-02',
    });
    expect(phone.calls.find((call) => call.callId === 'call_l0_001')).toMatchObject({
      contactName: 'Tùng Gara',
      phoneNumber: '0933112244',
      clueRefId: 'CLUE-PHONE-01',
    });

    const photos = level00.appsData.photos as PhotosAppPayload;
    expect(photos.albums).toHaveLength(1);
    expect(photos.albums[0].photos).toHaveLength(6);
    expect(photos.albums[0].photos[0]).toMatchObject({
      id: 'photo_l0_001',
      clueRefId: 'CLUE-PHOT-05',
      date: '12/09',
      timestamp: '12/09/2026 20:25',
      locationTag: 'Góc Phố Coffee - 45 Nguyễn Khang, Cầu Giấy',
    });
  });

  it('contains no em dashes anywhere in the assembled Level 0 dataset', () => {
    expect(JSON.stringify(level00)).not.toContain('\u2014');
  });
});
