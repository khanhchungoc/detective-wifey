import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  evaluateConfrontation,
  calculateConfrontationPreflight,
  getSuspectsOnBoard,
  ConfrontationConfirmModal,
  HusbandCharacterImage,
  ConfrontationModal,
  WifeNotebookModal,
  LEVEL_01_KNOWLEDGE_GRAPH,
} from '../features/wife-notebook';
import { PlaySession } from '../features/play-session';
import type { CaseConfig } from '../shared/contracts/case-schema';
import type { CaseGraphEdge } from '../shared/contracts/knowledge-graph';
import type { AppId } from '../shared/contracts/app-contracts';
import type { GameStateRepository, ActiveSessionState, PlayerProgress } from '../features/session';

describe('US-016 - Anytime Confrontation Hub & Dynamic Excuse Engine Suite', () => {
  const mockCaseConfig: CaseConfig = {
    caseId: 'case_01',
    husbandId: 'husband_hoang',
    husbandName: 'Hoàng',
    levelNumber: 1,
    allowedStrikes: 5,
    groundTruth: {
      verdict: 'cheating',
      culpritSuspectId: 'suspect_huong',
      narrativeRoast:
        'Thợ điện gì mà hẹn lại đúng ngày, nhận váy kèm thiệp riêng, còn khiến anh họp ở công ty mà quẹt thẻ tận quán cơm! Anh sửa điện hay sửa luôn lời khai?',
      overJealousRoast:
        'Năm người góp mỗi người một trăm mua quà cho sếp. Em đọc đến dòng thứ ba là giải được, sao lại đối chất từ dòng thứ nhất?',
    },
    suspectPool: [
      {
        suspectId: 'suspect_huong',
        displayName: 'Nguyễn Thị Thu Hương',
        initialDiscoveredApp: 'internet-messaging',
      },
      {
        suspectId: 'suspect_lan_anh',
        displayName: 'Lan Anh Kế Toán',
        initialDiscoveredApp: 'internet-messaging',
      },
    ],
    lockChallenges: [],
    deviceMetadata: {
      narrativeTime: '23:45',
      batteryPercent: '42%',
      carrierTag: '5G',
      pwaThemeColor: '#0f172a',
    },
    activeAppIds: ['internet-messaging', 'banking', 'ecommerce', 'phone'],
    appsData: {},
  };

  const smokingGunEdge1: CaseGraphEdge = {
    edgeId: 'edge_name_suspect',
    sourceNodeId: 'node_bridge_name',
    targetNodeId: 'node_suspect_huong',
    relationship: 'bridges_identity',
    isSmokingGun: true,
  };

  const smokingGunEdge2: CaseGraphEdge = {
    edgeId: 'edge_alibi_contradiction',
    sourceNodeId: 'node_record_wife_alibi',
    targetNodeId: 'node_record_bank_receipt',
    relationship: 'contradicts_alibi',
    isSmokingGun: true,
  };

  const smokingGunEdge3: CaseGraphEdge = {
    edgeId: 'test_third_smoking_gun',
    isCanonical: true,
    sourceNodeId: 'node_record_zola_chat',
    targetNodeId: 'node_record_ecommerce_order',
    relationship: 'bridges_identity',
    isSmokingGun: true,
  };

  describe('Pure Graph Evaluation & Tiered Excuse Ladder', () => {
    it('excludes revalidated speculative strings from smoking-gun scoring', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [{ ...smokingGunEdge1, isCanonical: false, isSmokingGun: false }],
        unmaskedSuspectIds: [], currentStrikes: 5,
      });
      expect(result.verifiedSmokingGunCount).toBe(0);
      expect(result.requiredSmokingGunCount).toBe(LEVEL_01_KNOWLEDGE_GRAPH.requiredSmokingGunEdgeIds.length);
    });

    it('AC 3: 0 smoking-gun links triggers 0 stars, gaslighting dialogue, and 1 strike penalty', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [],
        unmaskedSuspectIds: [],
        currentStrikes: 5,
      });

      expect(result.stars).toBe(0);
      expect(result.verifiedSmokingGunCount).toBe(0);
      expect(result.husbandMood).toBe('confident');
      expect(result.husbandDialogue).toContain('Em lại lướt TikTok drama rồi đa nghi đúng không?');
      expect(result.newStrikesRemaining).toBe(4);
      expect(result.isMaxStrikesReached).toBe(false);
    });

    it('AC 3: 0 smoking-gun links reaching maximum strikes triggers isMaxStrikesReached', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [],
        unmaskedSuspectIds: [],
        currentStrikes: 1, // Last strike remaining
      });

      expect(result.stars).toBe(0);
      expect(result.newStrikesRemaining).toBe(0);
      expect(result.isMaxStrikesReached).toBe(true);
    });

    it('AC 7: Accusing an innocent red-herring suspect with bridge edges triggers specific over-jealous roast', () => {
      const redHerringEdge: CaseGraphEdge = {
        edgeId: 'custom_edge_lan_anh',
        sourceNodeId: 'node_bridge_phone',
        targetNodeId: 'node_suspect_lan_anh',
        relationship: 'bridges_identity',
      };

      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [redHerringEdge],
        unmaskedSuspectIds: ['node_suspect_lan_anh'],
        currentStrikes: 5,
      });

      expect(result.stars).toBe(0);
      expect(result.isRedHerringAccusation).toBe(true);
      expect(result.husbandDialogue).toContain('Năm người góp mỗi người một trăm mua quà cho sếp');
    });

    it('Accusing wrong suspect directly via accusedSuspectId triggers 0 stars, red herring roast, and 1 strike penalty', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2, smokingGunEdge3], // Even with all smoking gun edges connected
        unmaskedSuspectIds: ['node_suspect_huong'],
        accusedSuspectId: 'suspect_lan_anh', // Accused the wrong person!
        currentStrikes: 5,
      });

      expect(result.stars).toBe(0);
      expect(result.isRedHerringAccusation).toBe(true);
      expect(result.husbandMood).toBe('confident');
      expect(result.husbandDialogue).toContain('Năm người góp mỗi người một trăm mua quà cho sếp');
      expect(result.newStrikesRemaining).toBe(4);
    });

    it('getSuspectsOnBoard derives distinct suspects placed on corkboard or tagged', () => {
      const suspects = getSuspectsOnBoard({
        placedNodes: [
          {
            nodeId: 'node_suspect_huong',
            sourceAppId: 'phone',
            type: 'suspect',
            label: 'Nguyễn Thị Thu Hương',
            suspectId: 'suspect_huong',
            x: 0,
            y: 0,
          },
          {
            nodeId: 'node_alias_tuan',
            type: 'alias',
            label: 'Anh Tuấn Thợ Điện',
            visibleAlias: 'Thợ điện',
            suspectId: 'suspect_huong',
            x: 0,
            y: 100,
          },
        ],
        taggedSuspects: [
          {
            suspectId: 'suspect_lan_anh',
            displayName: 'Lan Anh Kế Toán',
            sourceApp: 'internet-messaging' as AppId,
            timestamp: 1000,
          },
        ],
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      });

      expect(suspects).toHaveLength(2);
      expect(suspects.find(s => s.id === 'suspect_huong')).toMatchObject({
        sourceApp: 'phone', avatarName: 'Nguyễn Thị Thu Hương',
      });
      expect(suspects.find(s => s.id === 'suspect_lan_anh')).toMatchObject({
        sourceApp: 'internet-messaging', avatarName: 'Lan Anh Kế Toán',
      });
      expect(suspects.some(s => s.id === 'suspect_huong' && s.isCulprit === true)).toBe(true);
      expect(suspects.some(s => s.id === 'suspect_lan_anh' && s.isCulprit === false)).toBe(true);
    });

    it('uses only pinned contact names and does not duplicate a contact from the suspect pool', () => {
      const suspects = getSuspectsOnBoard({
        placedNodes: [
          { nodeId: 'node_alias_tuan', type: 'alias', label: 'Anh Tuấn Thợ Điện',
            sourceAppId: 'internet-messaging', suspectId: 'suspect_huong', x: 0, y: 0 },
          { nodeId: 'node_zola_tuan', type: 'suspect', label: 'Anh Tuấn Thợ Điện',
            sourceAppId: 'internet-messaging', x: 0, y: 100 },
        ],
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      });
      expect(suspects).toHaveLength(1);
      expect(suspects[0]).toMatchObject({
        id: 'suspect_huong', displayName: 'Anh Tuấn Thợ Điện',
        avatarName: 'Anh Tuấn Thợ Điện', sourceApp: 'internet-messaging',
      });
      const preflight = calculateConfrontationPreflight({
        placedNodes: [
          { nodeId: 'node_alias_tuan', type: 'alias', label: 'Anh Tuấn Thợ Điện',
            sourceAppId: 'internet-messaging', messages: [{ recordId: 'm', text: 'Visible message' }], x: 0, y: 0 },
          { nodeId: 'receipt', type: 'record_clue', label: 'Receipt', subtitle: 'Visible receipt', x: 0, y: 0 },
        ],
        activeEdges: [{ edgeId: 'verified', sourceNodeId: 'node_alias_tuan', targetNodeId: 'receipt',
          isCanonical: true, relationship: 'bridges_identity', isSmokingGun: false }],
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      });
      expect(preflight.accusedSuspectName).toBe('Anh Tuấn Thợ Điện');
      expect(preflight.verifiedCluesList.map(clue => clue.snippet)).toEqual(['Visible message', 'Visible receipt']);
      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal isOpen preflight={calculateConfrontationPreflight({
          caseConfig: mockCaseConfig, activeEdges: [], totalClues: 10,
        })} suspectsOnBoard={suspects} selectedSuspectId="suspect_huong"
          onConfirmConfront={vi.fn()} onCancel={vi.fn()} />,
      );
      expect(html).toContain('Anh Tuấn Thợ Điện');
      expect(html).not.toContain('Nguyễn Thị Thu Hương');
    });

    it('AC 4: 1 verified smoking-gun link yields 1 star and defensive stammering excuse', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
        rngRoll: 10,
      });

      expect(result.stars).toBe(1);
      expect(result.verifiedSmokingGunCount).toBe(1);
      expect(result.husbandMood).toBe('surprised');
      expect(result.husbandDialogue).toContain('Số thợ điện hôm trước anh gọi nhờ sửa dây mạng văn phòng mà');
    });

    it('AC 5: 2 verified smoking-gun links yield 2 stars and stammering partial explanation', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
      });

      expect(result.stars).toBe(2);
      expect(result.verifiedSmokingGunCount).toBe(2);
      expect(result.husbandMood).toBe('nervous');
      expect(result.husbandDialogue).toContain('Con bé Marketing nhờ anh đặt hộ để áp mã Freeship Extra thôi mà em');
    });

    it('AC 6: 3 verified smoking-gun links yield 3 stars, full breakdown confession, Wife Title, and roast', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2, smokingGunEdge3],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
      });

      expect(result.stars).toBe(3);
      expect(result.verifiedSmokingGunCount).toBe(3);
      expect(result.husbandMood).toBe('broken');
      expect(result.husbandDialogue).toContain('Anh xin lỗi vợ... Thôi anh khai thật! Bọn anh có hẹn riêng tối nay ở quán cơm niêu');
      expect(result.wifeTitle).toBe('Nữ thám tử ghen tuông');
      expect(result.narrativeRoast).toBe(mockCaseConfig.groundTruth.narrativeRoast);
    });
  });

  describe('ConfrontationModal Component Rendering', () => {
    it('Renders 0-star premature confrontation with warning and "Tiếp tục điều tra" button', () => {
      const eval0 = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [],
        unmaskedSuspectIds: [],
        currentStrikes: 5,
      });

      const html = renderToStaticMarkup(
        <ConfrontationModal
          isOpen={true}
          evaluation={eval0}
          maxStrikes={5}
          onContinueInvestigation={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      expect(html).toContain('1/5'); // 1 strike used
      expect(html).toContain('Tiếp tục điều tra');
      expect(html).toContain('Khoanh tay, tự tin');
    });

    it('Renders 2-star partial verdict with "Tha thứ & Qua màn" and "Điều tra tiếp để đạt 3 sao" buttons', () => {
      const eval2 = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
      });

      const html = renderToStaticMarkup(
        <ConfrontationModal
          isOpen={true}
          evaluation={eval2}
          maxStrikes={5}
          onForgiveAndAdvance={vi.fn()}
          onContinueInvestigation={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      expect(html).toContain('ĐÃ VẠCH TRẦN MỘT PHẦN');
      expect(html).toContain('Tha thứ &amp; Qua màn');
      expect(html).toContain('Điều tra tiếp để đạt 3 sao');
      expect(html).toContain('Gãi đầu, toát mồ hôi');
    });

    it('Renders 3-star victory with Wife Title, narrative roast, and "Tạo thẻ Roast khoe MXH" button', () => {
      const eval3 = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2, smokingGunEdge3],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
      });

      const html = renderToStaticMarkup(
        <ConfrontationModal
          isOpen={true}
          evaluation={eval3}
          maxStrikes={5}
          onShareRoastCard={vi.fn()}
          onForgiveAndAdvance={vi.fn()}
          onContinueInvestigation={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      expect(html).toContain('Nữ thám tử ghen tuông');
      expect(html).toContain('Thợ điện gì mà hẹn lại đúng ngày');
      expect(html).toContain('Tạo thẻ Roast khoe MXH');
      expect(html).toContain('Tha thứ &amp; Qua màn');
      expect(html).toContain('Cúi đầu, nhận tội');
    });

    it('Strict Zero-Emoji Invariant: ConfrontationModal contains zero raw Unicode emojis', () => {
      const eval3 = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2, smokingGunEdge3],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
      });

      const html = renderToStaticMarkup(
        <ConfrontationModal
          isOpen={true}
          evaluation={eval3}
          maxStrikes={5}
          onContinueInvestigation={vi.fn()}
          onClose={vi.fn()}
        />,
      );

      const rawEmojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(rawEmojiRegex.test(html)).toBe(false);
    });
  });

  describe('PlaySession Confrontation Persistence & Progression Integration', () => {
    const createMockRepo = (): GameStateRepository => {
      let progress: PlayerProgress = {
        schemaVersion: 1,
        unlockedHusbandId: 'husband_hoang',
        unlockedLevel: 1,
        bestStarRatings: {},
        earnedWifeTitles: [],
        audioMutePreference: false,
      };
      let session: ActiveSessionState | null = null;

      return {
        getActiveSession: async () => session,
        saveActiveSession: async (s) => { session = s; },
        clearActiveSession: async () => { session = null; },
        getPlayerProgress: async () => progress,
        savePlayerProgress: async (p) => { progress = { ...progress, ...p }; },
      };
    };

    it('applyConfrontationPenalty reduces strikes and triggers onCaught and restart when strikes exhaust', () => {
      const onCaught = vi.fn();
      let scheduledCallback: (() => void) | null = null;
      const session = new PlaySession({
        repository: createMockRepo(),
        loadCaseByLevel: () => mockCaseConfig,
        getAvailableLevels: () => [],
        getAppDefinition: () => undefined,
        now: () => 1000,
        schedule: (cb) => {
          scheduledCallback = cb;
          return () => {};
        },
        onCaught,
      }, mockCaseConfig);

      expect(session.getSnapshot().strikes).toBe(5);

      session.applyConfrontationPenalty();
      expect(session.getSnapshot().strikes).toBe(4);

      // Deplete strikes
      session.applyConfrontationPenalty();
      session.applyConfrontationPenalty();
      session.applyConfrontationPenalty();
      session.applyConfrontationPenalty();

      expect(session.getSnapshot().strikes).toBe(0);
      expect(onCaught).not.toHaveBeenCalled();

      // Trigger the scheduled caught & restart callback
      scheduledCallback?.();
      expect(onCaught).toHaveBeenCalledTimes(1);
      expect(session.getSnapshot().strikes).toBe(5); // Reset after restart
    });

    it('recordConfrontationVerdict saves star rating, awards Wife Title, and unlocks next level', () => {
      const repo = createMockRepo();
      const session = new PlaySession({
        repository: repo,
        loadCaseByLevel: () => mockCaseConfig,
        getAvailableLevels: () => [],
        getAppDefinition: () => undefined,
        now: () => 1000,
        schedule: (cb) => { cb(); return () => {}; },
        onCaught: vi.fn(),
      }, mockCaseConfig);

      session.recordConfrontationVerdict(3, 'Nữ thám tử ghen tuông');

      const progress = session.getSnapshot().playerProgress;
      expect(progress.bestStarRatings['case_01']).toBe(3);
      expect(progress.earnedWifeTitles).toContain('Nữ thám tử ghen tuông');
      expect(progress.unlockedLevel).toBe(2);
    });

    it('forgiveAndAdvanceLevel selects next level', () => {
      let loadedLevel = 1;
      const session = new PlaySession({
        repository: createMockRepo(),
        loadCaseByLevel: (lvl) => {
          loadedLevel = lvl;
          return { ...mockCaseConfig, levelNumber: lvl as 1 | 2 | 3 };
        },
        getAvailableLevels: () => [],
        getAppDefinition: () => undefined,
        now: () => 1000,
        schedule: () => () => {},
        onCaught: vi.fn(),
      }, mockCaseConfig);

      session.forgiveAndAdvanceLevel();
      expect(loadedLevel).toBe(2);
    });
  });

  describe('WifeNotebookModal Dock Confrontation Button', () => {
    it('AC 1: Renders "Đối chất" action button in top bar and bottom dock', () => {
      const html = renderToStaticMarkup(
        <WifeNotebookModal
          caseConfig={mockCaseConfig}
          knowledgeGraph={LEVEL_01_KNOWLEDGE_GRAPH}
          currentStrikes={5}
          maxStrikes={5}
          onClose={vi.fn()}
        />,
      );

      // Contains "Đối chất" buttons
      expect(html).toContain('Đối chất');
    });
  });

  describe('Clue Bands & RNG Probability Ladder', () => {
    it('< 50% clues (< 5 of 10) yields 0% success rate, 0 potential stars, and isLowSuccessRate = true', () => {
      const preflight = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 4,
        totalClues: 10,
      });

      expect(preflight.cluesFound).toBe(4);
      expect(preflight.cluesFoundPercent).toBe(40);
      expect(preflight.successRate).toBe(0);
      expect(preflight.potentialStars).toBe(0);
      expect(preflight.isLowSuccessRate).toBe(true);

      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        unmaskedSuspectIds: [],
        currentStrikes: 5,
        cluesFound: 4,
        totalClues: 10,
        rngRoll: 0,
      });

      expect(result.stars).toBe(0);
      expect(result.isRngSuccess).toBe(false);
      expect(result.husbandMood).toBe('confident');
      expect(result.newStrikesRemaining).toBe(4);
    });

    it('5-8 clues scales success percentage from 30% to 90% and awards 1 star on RNG success', () => {
      // 5 clues = 30% (< 50%, isLowSuccessRate = true)
      const pf5 = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 5,
        totalClues: 10,
      });
      expect(pf5.successRate).toBe(30);
      expect(pf5.potentialStars).toBe(1);
      expect(pf5.isLowSuccessRate).toBe(true);

      // 6 clues = 50% (>= 50%, isLowSuccessRate = false)
      const pf6 = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 6,
        totalClues: 10,
      });
      expect(pf6.successRate).toBe(50);
      expect(pf6.potentialStars).toBe(1);
      expect(pf6.isLowSuccessRate).toBe(false);

      // 8 clues = 90%
      const pf8 = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 8,
        totalClues: 10,
      });
      expect(pf8.successRate).toBe(90);
      expect(pf8.potentialStars).toBe(1);
      expect(pf8.isLowSuccessRate).toBe(false);

      // RNG win (roll 20 < 30%)
      const winResult = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        activeEdges: [smokingGunEdge1],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
        cluesFound: 5,
        rngRoll: 20,
      });
      expect(winResult.stars).toBe(1);
      expect(winResult.isRngSuccess).toBe(true);
      expect(winResult.husbandMood).toBe('surprised');

      // RNG loss (roll 40 >= 30%)
      const lossResult = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        activeEdges: [smokingGunEdge1],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
        cluesFound: 5,
        rngRoll: 40,
      });
      expect(lossResult.stars).toBe(0);
      expect(lossResult.isRngSuccess).toBe(false);
      expect(lossResult.husbandMood).toBe('confident');
      expect(lossResult.newStrikesRemaining).toBe(4);
    });

    it('9 clues yields 100% success rate and 2 stars victory', () => {
      const pf9 = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 9,
        totalClues: 10,
      });
      expect(pf9.successRate).toBe(100);
      expect(pf9.potentialStars).toBe(2);
      expect(pf9.isLowSuccessRate).toBe(false);

      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        activeEdges: [smokingGunEdge1, smokingGunEdge2],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
        cluesFound: 9,
      });
      expect(result.stars).toBe(2);
      expect(result.isRngSuccess).toBe(true);
      expect(result.husbandMood).toBe('nervous');
    });

    it('10 clues yields 100% success rate and 3 stars victory', () => {
      const pf10 = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 10,
        totalClues: 10,
      });
      expect(pf10.successRate).toBe(100);
      expect(pf10.potentialStars).toBe(3);
      expect(pf10.isLowSuccessRate).toBe(false);

      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        activeEdges: [smokingGunEdge1, smokingGunEdge2, smokingGunEdge3],
        unmaskedSuspectIds: ['node_suspect_huong'],
        currentStrikes: 5,
        cluesFound: 10,
      });
      expect(result.stars).toBe(3);
      expect(result.isRngSuccess).toBe(true);
      expect(result.husbandMood).toBe('broken');
      expect(result.wifeTitle).toBe('Nữ thám tử ghen tuông');
    });
  });

  describe('ConfrontationConfirmModal Component Rendering', () => {
    it('Renders a rough success bar and the failure warning', () => {
      const lowPf = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 4,
        totalClues: 10,
      });

      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          suspectsOnBoard={[{ id: 'suspect_huong', displayName: 'Pinned contact' }]}
          selectedSuspectId="suspect_huong"
          preflight={lowPf}
          husbandName="Hoàng"
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(html).toContain('Xác nhận đối chất');
      expect(html).not.toContain('4/10 manh mối');
      expect(html).toContain('Tỉ lệ thành công');
      expect(html).toMatch(/LÀM CHO RA NHẼ!|LỪA SAO ĐƯỢC BÀ!|MÀY DÁM LỪA BÀ!|TÔI BIẾT HẾT RỒI!/);
      expect(html).toContain('Đối chất thất bại: mất 1 lượt nghi ngờ.');
      expect(html).toContain('Điều tra thêm');

      // The bar hides exact percentages
      expect(html).not.toMatch(/>\s*\d+%\s*</);
    });

    it('Renders high conviction chance and verified clues without aliases or red strings', () => {
      const highPf = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1],
        explicitCluesFound: 10,
        totalClues: 10,
      });

      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          suspectsOnBoard={[{ id: 'suspect_huong', displayName: 'Pinned contact' }]}
          selectedSuspectId="suspect_huong"
          preflight={{ ...highPf, accusedSuspectAlias: 'SECRET_ALIAS' }}
          husbandName="Hoàng"
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(html).not.toContain('10/10 manh mối');
      expect(html).toContain('Tỉ lệ thành công');
      expect(html).toMatch(/LÀM CHO RA NHẼ!|LỪA SAO ĐƯỢC BÀ!|MÀY DÁM LỪA BÀ!|TÔI BIẾT HẾT RỒI!/);
      expect(html).toContain('Bằng chứng');

      // Invariant: Zero red strings in the popup as requested
      expect(html).not.toContain('Dây nối đã xác thực');

      // The bar hides exact percentages
      expect(html).not.toContain('SECRET_ALIAS');
      expect(html).not.toMatch(/>\s*\d+%\s*</);
    });

    it('Step 1: Renders suspect picker list when multiple suspects exist on board', () => {
      const suspects = [
        { id: 'suspect_huong', displayName: 'Nguyễn Thị Thu Hương', alias: 'Anh Tuấn Thợ Điện', avatarName: 'Anh Tuấn Thợ Điện', sourceApp: 'internet-messaging', isCulprit: true },
        { id: 'suspect_lan_anh', displayName: 'Lan Anh Kế Toán', isCulprit: false },
      ];

      const pf = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 5,
        totalClues: 10,
      });

      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          preflight={pf}
          suspectsOnBoard={suspects}
          getSourceApp={() => ({ displayName: 'Zola', iconAsset: '/zola.svg', icon: () => null, themeGradient: 'from-blue-500 to-blue-600' })}
          selectedSuspectId={null} // Step 1
          husbandName="Hoàng"
          onSelectSuspect={vi.fn()}
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(html).toContain('Chọn nghi phạm');
      expect(html).toContain('Nguyễn Thị Thu Hương');
      expect(html).not.toContain('Anh Tuấn Thợ Điện');
      expect(html).toContain('Lan Anh Kế Toán');
      expect(html).toContain('bg-white');
      expect(html).toContain('contact-avatar-persona-sheet');
      expect(html).toContain('aria-label="Zola"');
      expect(html).toContain('-right-1 -top-1');
      expect(html).not.toContain('h-[90vh]');
      expect(html).toContain('overflow-y-auto');
    });

    it('Step 2: hides clue counts and retains the short failure penalty', () => {
      const wrongSuspectPf = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        accusedSuspectId: 'suspect_lan_anh',
        totalClues: 10,
      });

      expect(wrongSuspectPf.isWrongSuspect).toBe(true);
      expect(wrongSuspectPf.cluesFoundDisplay).toBe('Không áp dụng');
      expect(wrongSuspectPf.successRate).toBe(0);
      expect(wrongSuspectPf.isLowSuccessRate).toBe(true);

      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          suspectsOnBoard={[{ id: 'suspect_lan_anh', displayName: 'Pinned contact' }]}
          preflight={wrongSuspectPf}
          selectedSuspectId="suspect_lan_anh"
          husbandName="Hoàng"
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(html).not.toContain('Không áp dụng');
      expect(html).toContain('Tỉ lệ thành công');
      expect(html).toMatch(/LÀM CHO RA NHẼ!|LỪA SAO ĐƯỢC BÀ!|MÀY DÁM LỪA BÀ!|TÔI BIẾT HẾT RỒI!/);
      expect(html).toContain('Đối chất thất bại: mất 1 lượt nghi ngờ.');

      // The bar hides exact percentages
      expect(html).not.toMatch(/>\s*\d+%\s*</);
    });

    it('Strict Zero-Emoji Invariant: ConfrontationConfirmModal contains zero raw emojis', () => {
      const pf = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 5,
        totalClues: 10,
      });

      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          preflight={pf}
          husbandName="Hoàng"
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      const rawEmojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(rawEmojiRegex.test(html)).toBe(false);
    });
  });

  describe('HusbandCharacterImage Vector Illustration', () => {
    it('Renders vector SVG for all 4 moods with distinct aura and facial expressions', () => {
      for (const mood of ['confident', 'surprised', 'nervous', 'broken'] as const) {
        const html = renderToStaticMarkup(
          <HusbandCharacterImage mood={mood} size={140} />,
        );

        expect(html).toContain('<svg');
        expect(html).toContain(`url(#bg-${mood})`);
        expect(html).toContain('viewBox="0 0 200 200"');
      }
    });

    it('Strict Zero-Emoji Invariant: HusbandCharacterImage contains zero raw emojis', () => {
      for (const mood of ['confident', 'surprised', 'nervous', 'broken'] as const) {
        const html = renderToStaticMarkup(
          <HusbandCharacterImage mood={mood} size={140} />,
        );
        const rawEmojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        expect(rawEmojiRegex.test(html)).toBe(false);
      }
    });
  });

  describe('Level 1 Identity Smoking Gun & Suspect Deduplication Fixes', () => {
    it('deduplicates multiple contact pins of Anh Tuấn Thợ Điện across apps and excludes Vợ', () => {
      const placedNodes = [
        { nodeId: 'node_alias_tuan', label: 'Anh Tuấn Thợ Điện', type: 'alias' as const, sourceAppId: 'internet-messaging' as AppId, x: 0, y: 0 },
        { nodeId: 'node_alias_tuan_sms', label: 'Anh Tuấn Thợ Điện', type: 'alias' as const, sourceAppId: 'messages' as AppId, x: 0, y: 100 },
        { nodeId: 'node_bridge_phone', label: 'Anh Tuấn Thợ Điện', type: 'alias' as const, sourceAppId: 'phone' as AppId, x: 0, y: 200 },
        { nodeId: 'node_record_wife_alibi', label: 'Vợ', type: 'record_clue' as const, sourceAppId: 'internet-messaging' as AppId, x: 0, y: 300 },
      ];

      const suspects = getSuspectsOnBoard({
        placedNodes,
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      });

      // Must have exactly 1 entry for Anh Tuấn Thợ Điện (mapped to suspect_huong) and 0 for Vợ
      expect(suspects).toHaveLength(1);
      expect(suspects[0].displayName).toBe('Anh Tuấn Thợ Điện');
      expect(suspects[0].id).toBe('suspect_huong');
      expect(suspects.some(s => s.displayName === 'Vợ')).toBe(false);
    });

    it('verifies 2/2 smoking guns with edge_order_name and edge_alibi_contradiction for 2 stars', () => {
      const edgeOrderName: CaseGraphEdge = {
        edgeId: 'edge_order_name',
        sourceNodeId: 'node_record_ecommerce_order',
        targetNodeId: 'node_bridge_name',
        relationship: 'bridges_identity',
        isSmokingGun: true,
      };
      const edgeAlibi: CaseGraphEdge = {
        edgeId: 'edge_alibi_contradiction',
        sourceNodeId: 'node_record_wife_alibi',
        targetNodeId: 'node_record_bank_receipt',
        relationship: 'contradicts_alibi',
        isSmokingGun: true,
      };

      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [edgeOrderName, edgeAlibi],
        unmaskedSuspectIds: [],
        currentStrikes: 5,
        accusedSuspectId: 'suspect_huong',
        placedNodes: [
          { nodeId: 'node_alias_tuan', label: 'Anh Tuấn Thợ Điện', type: 'alias', sourceAppId: 'internet-messaging', x: 0, y: 0 },
        ],
      });

      expect(result.verifiedSmokingGunCount).toBe(2);
      expect(result.requiredSmokingGunCount).toBe(2);
      expect(result.stars).toBe(2);
      expect(result.successRate).toBe(100);
      expect(result.isRedHerringAccusation).toBe(false);
      expect(result.husbandMood).toBe('nervous');
      expect(result.husbandDialogue).toContain('Con bé Marketing nhờ anh đặt hộ để áp mã Freeship Extra');
    });
  });
});
