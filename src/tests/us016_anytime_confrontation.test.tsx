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
import { deriveNodesFromTaggedEvidence, restoreCorkboardState } from '../features/wife-notebook/WifeNotebookModal';
import { getKeyConnectionProgress } from '../features/wife-notebook/confrontationEngine';
import { PlaySession } from '../features/play-session';
import type { CaseConfig } from '../shared/contracts/case-schema';
import type { CaseGraphEdge } from '../shared/contracts/knowledge-graph';
import type { AppId } from '../shared/contracts/app-contracts';
import type { GameStateRepository, ActiveSessionState, PlayerProgress } from '../features/session';
import { husbandFixture } from './helpers/husbandFixture';

describe('US-016 - Anytime Confrontation Hub & Dynamic Excuse Engine Suite', () => {
  const mockCaseConfig: CaseConfig = {
    caseId: 'case_01',
    husbandId: 'husband_01',
    husband: husbandFixture,
    levelNumber: 1,
    allowedStrikes: 5,
    groundTruth: {
      verdict: 'cheating',
      culpritSuspectId: 'suspect_01',
      narrativeRoast:
        'Khoa BE gì mà mặc váy size S, hẹn khao đúng hôm tròn một tháng, lại đúng hôm sếp hủy họp! Anh fix bug hay fix luôn lời khai?',
      overJealousRoast:
        'Năm người góp mỗi người một trăm mua quà cho sếp. Em đọc đến dòng thứ ba là giải được, sao lại đối chất từ dòng thứ nhất?',
    },
    suspectPool: [
      {
        suspectId: 'suspect_01',
        displayName: 'Nguyễn Thị Thu Hương',
        initialDiscoveredApp: 'internet-messaging',
      },
      {
        suspectId: 'suspect_04',
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
    edgeId: 'edge_order_phone',
    sourceNodeId: 'node_record_ecommerce_order',
    targetNodeId: 'node_bridge_phone',
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
    edgeId: 'edge_order_name',
    isCanonical: true,
    sourceNodeId: 'node_record_ecommerce_order',
    targetNodeId: 'node_bridge_name',
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
        edgeId: 'custom_edge_902',
        sourceNodeId: 'node_bridge_phone',
        targetNodeId: 'node_suspect_04',
        relationship: 'bridges_identity',
      };

      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [redHerringEdge],
        unmaskedSuspectIds: ['node_suspect_04'],
        currentStrikes: 5,
      });

      expect(result.stars).toBe(0);
      expect(result.isRedHerringAccusation).toBe(true);
      expect(result.husbandDialogue).toContain('Lan Anh thu quỹ sinh nhật sếp');
    });

    it('Accusing wrong suspect directly via accusedSuspectId triggers 0 stars, red herring roast, and 1 strike penalty', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2, smokingGunEdge3], // Even with all smoking gun edges connected
        unmaskedSuspectIds: ['node_suspect_01'],
        accusedSuspectId: 'suspect_04', // Accused the wrong person!
        currentStrikes: 5,
      });

      expect(result.stars).toBe(0);
      expect(result.isRedHerringAccusation).toBe(true);
      expect(result.husbandMood).toBe('confident');
      expect(result.husbandDialogue).toContain('Lan Anh thu quỹ sinh nhật sếp');
      expect(result.newStrikesRemaining).toBe(4);
    });

    it('getSuspectsOnBoard derives distinct suspects placed on corkboard or tagged', () => {
      const suspects = getSuspectsOnBoard({
        placedNodes: [
          {
            nodeId: 'node_suspect_01',
            sourceAppId: 'phone',
            type: 'suspect',
            label: 'Nguyễn Thị Thu Hương',
            suspectId: 'suspect_01',
            x: 0,
            y: 0,
          },
          {
            nodeId: 'node_alias_01',
            type: 'alias',
            label: 'Khoa BE',
            visibleAlias: 'Thợ điện',
            suspectId: 'suspect_01',
            x: 0,
            y: 100,
          },
        ],
        taggedSuspects: [
          {
            suspectId: 'suspect_04',
            displayName: 'Lan Anh Kế Toán',
            sourceApp: 'internet-messaging' as AppId,
            timestamp: 1000,
          },
        ],
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      });

      expect(suspects).toHaveLength(2);
      expect(suspects.find(s => s.id === 'suspect_01')).toMatchObject({
        sourceApp: 'phone', avatarName: 'Nguyễn Thị Thu Hương',
      });
      expect(suspects.find(s => s.id === 'suspect_04')).toMatchObject({
        sourceApp: 'internet-messaging', avatarName: 'Lan Anh Kế Toán',
      });
      expect(suspects.some(s => s.id === 'suspect_01' && s.isCulprit === true)).toBe(true);
      expect(suspects.some(s => s.id === 'suspect_04' && s.isCulprit === false)).toBe(true);
    });

    it('uses only pinned contact names and does not duplicate a contact from the suspect pool', () => {
      const suspects = getSuspectsOnBoard({
        placedNodes: [
          { nodeId: 'node_alias_01', type: 'alias', label: 'Khoa BE',
            sourceAppId: 'internet-messaging', suspectId: 'suspect_01', x: 0, y: 0 },
          { nodeId: 'node_902', type: 'suspect', label: 'Khoa BE',
            sourceAppId: 'internet-messaging', x: 0, y: 100 },
        ],
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      });
      expect(suspects).toHaveLength(1);
      expect(suspects[0]).toMatchObject({
        id: 'suspect_01', displayName: 'Khoa BE',
        avatarName: 'Khoa BE', sourceApp: 'internet-messaging',
      });
      const preflight = calculateConfrontationPreflight({
        placedNodes: [
          { nodeId: 'node_alias_01', type: 'alias', label: 'Khoa BE',
            sourceAppId: 'internet-messaging', messages: [{ recordId: 'm', text: 'Visible message' }], x: 0, y: 0 },
          { nodeId: 'receipt', type: 'record_clue', label: 'Receipt', subtitle: 'Visible receipt', x: 0, y: 0 },
        ],
        activeEdges: [{ edgeId: 'verified', sourceNodeId: 'node_alias_01', targetNodeId: 'receipt',
          isCanonical: true, relationship: 'bridges_identity', isSmokingGun: false }],
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      });
      expect(preflight.accusedSuspectName).toBe('Khoa BE');
      expect(preflight.verifiedCluesList.map(clue => clue.snippet)).toEqual(['Visible message', 'Visible receipt']);
      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal isOpen preflight={calculateConfrontationPreflight({
          caseConfig: mockCaseConfig, activeEdges: [], totalClues: 10,
        })} suspectsOnBoard={suspects} selectedSuspectId="suspect_01"
          onConfirmConfront={vi.fn()} onCancel={vi.fn()} />,
      );
      expect(html).toContain('Khoa BE');
      expect(html).not.toContain('Nguyễn Thị Thu Hương');
    });

    it('AC 4: 1 verified smoking-gun link yields 1 star and defensive stammering excuse', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1],
        unmaskedSuspectIds: ['node_suspect_01'],
        currentStrikes: 5,
        rngRoll: 10,
      });

      expect(result.stars).toBe(1);
      expect(result.verifiedSmokingGunCount).toBe(1);
      expect(result.husbandMood).toBe('surprised');
      expect(result.husbandDialogue).toContain('Khoa... Khoa là dev mới bên anh');
    });

    it('AC 5: 2 verified smoking-gun links yield 2 stars and stammering partial explanation', () => {
      const caseWith3RequiredGraph: CaseKnowledgeGraph = {
        ...LEVEL_01_KNOWLEDGE_GRAPH,
        requiredSmokingGunEdgeIds: [
          'edge_order_phone',
          'edge_alibi_contradiction',
          'edge_order_name',
        ],
      };
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: caseWith3RequiredGraph,
        activeEdges: [smokingGunEdge1, smokingGunEdge2],
        unmaskedSuspectIds: ['node_suspect_01'],
        currentStrikes: 5,
      });

      expect(result.stars).toBe(2);
      expect(result.verifiedSmokingGunCount).toBe(2);
      expect(result.requiredSmokingGunCount).toBe(3);
      expect(result.husbandMood).toBe('nervous');
      expect(result.husbandDialogue).toContain('Hương bên Marketing nhờ anh áp mã Freeship Extra');
    });

    it('AC 6: 3 verified smoking-gun links yield 3 stars, full breakdown confession, Wife Title, and roast', () => {
      const result = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2, smokingGunEdge3],
        unmaskedSuspectIds: ['node_suspect_01'],
        currentStrikes: 5,
      });

      expect(result.stars).toBe(3);
      expect(result.verifiedSmokingGunCount).toBe(3);
      expect(result.husbandMood).toBe('broken');
      expect(result.husbandDialogue).toContain('Anh xin lỗi... không có họp nào cả');
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
        knowledgeGraph: {
          ...LEVEL_01_KNOWLEDGE_GRAPH,
          requiredSmokingGunEdgeIds: [
            'edge_order_phone',
            'edge_alibi_contradiction',
            'edge_order_name',
          ],
        },
        activeEdges: [smokingGunEdge1, smokingGunEdge2],
        unmaskedSuspectIds: ['node_suspect_01'],
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
        unmaskedSuspectIds: ['node_suspect_01'],
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
      expect(html).toContain('Khoa BE gì mà mặc váy size S');
      expect(html).toContain('Tạo thẻ Roast khoe MXH');
      expect(html).toContain('Tha thứ &amp; Qua màn');
      expect(html).toContain('Cúi đầu, nhận tội');
    });

    it('Strict Zero-Emoji Invariant: ConfrontationModal contains zero raw Unicode emojis', () => {
      const eval3 = evaluateConfrontation({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [smokingGunEdge1, smokingGunEdge2, smokingGunEdge3],
        unmaskedSuspectIds: ['node_suspect_01'],
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
        unlockedHusbandId: 'husband_01',
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
    it('AC 1: Renders full-bleed corkboard with floating stats overlay and split bottom dock (Back + Xếp gọn + Đối chất)', () => {
      const html = renderToStaticMarkup(
        <WifeNotebookModal
          caseTitle="Cơn ghen lúc nửa đêm"
          caseConfig={mockCaseConfig}
          knowledgeGraph={LEVEL_01_KNOWLEDGE_GRAPH}
          currentStrikes={5}
          maxStrikes={5}
          onClose={vi.fn()}
        />,
      );

      expect(html).not.toContain('<header');
      expect(html).toContain('corkboard-stats-overlay');
      expect(html).toContain('Đóng sổ tay của vợ');
      expect(html).not.toContain('notebook-wood-frame');
      expect(html).toContain('Xếp gọn');
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
        unmaskedSuspectIds: ['node_suspect_01'],
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
        unmaskedSuspectIds: ['node_suspect_01'],
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
        unmaskedSuspectIds: ['node_suspect_01'],
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
        unmaskedSuspectIds: ['node_suspect_01'],
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
          suspectsOnBoard={[{ id: 'suspect_01', displayName: 'Pinned contact' }]}
          selectedSuspectId="suspect_01"
          preflight={lowPf}
          husbandName="Thịnh"
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
          suspectsOnBoard={[{ id: 'suspect_01', displayName: 'Pinned contact' }]}
          selectedSuspectId="suspect_01"
          preflight={{ ...highPf, accusedSuspectAlias: 'SECRET_ALIAS' }}
          husbandName="Thịnh"
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
        { id: 'suspect_01', displayName: 'Nguyễn Thị Thu Hương', alias: 'Khoa BE', avatarName: 'Khoa BE', sourceApp: 'internet-messaging', isCulprit: true },
        { id: 'suspect_04', displayName: 'Lan Anh Kế Toán', isCulprit: false },
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
          husbandName="Thịnh"
          onSelectSuspect={vi.fn()}
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(html).toContain('Chọn nghi phạm');
      expect(html).toContain('Nguyễn Thị Thu Hương');
      expect(html).not.toContain('Khoa BE');
      expect(html).toContain('Lan Anh Kế Toán');
      expect(html).toContain('bg-white');
      expect(html).toContain('suspect-cork-tray');
      expect(html).toContain('data-suspect-polaroid="suspect_01"');
      expect(html).toContain('data-suspect-polaroid="suspect_04"');
      expect(html).toContain('Nghi phạm');
      expect(html).toContain('contact-avatar-persona-sheet');
      expect(html).toContain('rounded-[1px]');
      expect(html).not.toContain('rounded-full border border-black/5');
      expect(html).not.toContain('aria-label="Zola"');
      expect(html).not.toContain('-right-1 -top-1');
      expect(html).not.toContain('h-[90vh]');
      expect(html).toContain('overflow-y-auto');
    });

    it('Step 1: Renders a single Polaroid suspect card centered with red pushpin and "Nghi phạm" stamp', () => {
      const suspects = [
        { id: 'suspect_01', displayName: 'Khoa BE', avatarName: 'Khoa BE', sourceApp: 'internet-messaging', isCulprit: true },
      ];
      const pf = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 2,
        totalClues: 10,
      });

      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          preflight={pf}
          suspectsOnBoard={suspects}
          selectedSuspectId={null}
          husbandName="Thịnh"
          onSelectSuspect={vi.fn()}
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(html).toContain('Chọn nghi phạm');
      expect(html).toContain('data-suspect-polaroid="suspect_01"');
      expect(html).toContain('Khoa BE');
      expect(html).toContain('Nghi phạm');
      expect(html).toContain('w-[196px]');
      expect(html).toContain('aspect-square');
      expect(html).toContain('rotate(1.6deg)');
    });

    it('Step 1 & Step 2: Renders unmasked suspect card with real name, disguise alias link, phone evidence hint, and "Đã lột mặt nạ" stamp', () => {
      const suspects = [
        {
          id: 'suspect_01',
          displayName: 'Nguyễn Thị Thu Hương',
          alias: 'Khoa BE',
          avatarName: 'Nguyễn Thị Thu Hương',
          sourceApp: 'ecommerce',
          isCulprit: true,
          isUnmasked: true,
          unmaskedEvidenceHint: 'Trùng SĐT: 0988886677',
        },
      ];
      const pf = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        explicitCluesFound: 5,
        totalClues: 10,
        unmaskedSuspectIds: ['suspect_01'],
      });

      // Step 1: Suspect Selection
      const htmlStep1 = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          preflight={pf}
          suspectsOnBoard={suspects}
          selectedSuspectId={null}
          husbandName="Thịnh"
          onSelectSuspect={vi.fn()}
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(htmlStep1).toContain('Chọn nghi phạm');
      expect(htmlStep1).toContain('Nguyễn Thị Thu Hương');
      expect(htmlStep1).toContain('Đã lột mặt nạ');
      expect(htmlStep1).toContain('Vỏ bọc: &quot;Khoa BE&quot;');
      expect(htmlStep1).toContain('Trùng SĐT: 0988886677');

      // Step 2: Confirmation Stage
      const htmlStep2 = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          preflight={pf}
          suspectsOnBoard={suspects}
          selectedSuspectId="suspect_01"
          husbandName="Thịnh"
          onSelectSuspect={vi.fn()}
          onConfirmConfront={vi.fn()}
          onCancel={vi.fn()}
        />,
      );

      expect(htmlStep2).toContain('Nguyễn Thị Thu Hương');
      expect(htmlStep2).not.toContain('Vỏ bọc: &quot;Khoa BE&quot;');
      expect(htmlStep2).not.toContain('Trùng SĐT: 0988886677');
      expect(htmlStep2).not.toContain('ĐÃ LỘT MẶT NẠ');
    });

    it('Step 2: hides clue counts and retains the short failure penalty', () => {
      const wrongSuspectPf = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        activeEdges: [],
        accusedSuspectId: 'suspect_04',
        totalClues: 10,
      });

      expect(wrongSuspectPf.isWrongSuspect).toBe(true);
      expect(wrongSuspectPf.cluesFoundDisplay).toBe('Không áp dụng');
      expect(wrongSuspectPf.successRate).toBe(0);
      expect(wrongSuspectPf.isLowSuccessRate).toBe(true);

      const html = renderToStaticMarkup(
        <ConfrontationConfirmModal
          isOpen={true}
          suspectsOnBoard={[{ id: 'suspect_04', displayName: 'Pinned contact' }]}
          preflight={wrongSuspectPf}
          selectedSuspectId="suspect_04"
          husbandName="Thịnh"
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
          husbandName="Thịnh"
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
          <HusbandCharacterImage husbandName={husbandFixture.shortName} mood={mood} size={140} />,
        );

        expect(html).toContain('<svg');
        expect(html).toContain(`url(#bg-${mood})`);
        expect(html).toContain('viewBox="0 0 200 200"');
      }
    });

    it('Strict Zero-Emoji Invariant: HusbandCharacterImage contains zero raw emojis', () => {
      for (const mood of ['confident', 'surprised', 'nervous', 'broken'] as const) {
        const html = renderToStaticMarkup(
          <HusbandCharacterImage husbandName={husbandFixture.shortName} mood={mood} size={140} />,
        );
        const rawEmojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
        expect(rawEmojiRegex.test(html)).toBe(false);
      }
    });
  });

  describe('Level 1 Identity Smoking Gun & Suspect Deduplication Fixes', () => {
    it('deduplicates multiple contact pins of Khoa BE across apps and excludes Vợ', () => {
      const placedNodes = [
        { nodeId: 'node_alias_01', label: 'Khoa BE', type: 'alias' as const, sourceAppId: 'internet-messaging' as AppId, x: 0, y: 0 },
        { nodeId: 'node_alias_01_group', label: 'Khoa BE', type: 'alias' as const, sourceAppId: 'messages' as AppId, x: 0, y: 100 },
        { nodeId: 'node_bridge_phone', label: 'Khoa BE', type: 'alias' as const, sourceAppId: 'phone' as AppId, x: 0, y: 200 },
        { nodeId: 'node_record_wife_alibi', label: 'Vợ', type: 'record_clue' as const, sourceAppId: 'internet-messaging' as AppId, x: 0, y: 300 },
      ];

      const suspects = getSuspectsOnBoard({
        placedNodes,
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      });

      // Must have exactly 1 entry for Khoa BE (mapped to suspect_01) and 0 for Vợ
      expect(suspects).toHaveLength(1);
      expect(suspects[0].displayName).toBe('Khoa BE');
      expect(suspects[0].id).toBe('suspect_01');
      expect(suspects.some(s => s.displayName === 'Vợ')).toBe(false);
    });

    it('verifies 3/3 smoking guns (phone, legal name, alibi) to achieve a 3-star victory (US-016 AC 6)', () => {
      const edgeOrderPhone: CaseGraphEdge = {
        edgeId: 'edge_order_phone',
        sourceNodeId: 'node_record_ecommerce_order',
        targetNodeId: 'node_bridge_phone',
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
        activeEdges: [edgeOrderPhone, smokingGunEdge3, edgeAlibi],
        unmaskedSuspectIds: [],
        currentStrikes: 5,
        accusedSuspectId: 'suspect_01',
        placedNodes: [
          { nodeId: 'node_alias_01', label: 'Khoa BE', type: 'alias', sourceAppId: 'internet-messaging', x: 0, y: 0 },
        ],
      });

      expect(result.verifiedSmokingGunCount).toBe(3);
      expect(result.requiredSmokingGunCount).toBe(3);
      expect(result.stars).toBe(3);
      expect(result.successRate).toBe(100);
      expect(result.isRedHerringAccusation).toBe(false);
      expect(result.husbandMood).toBe('broken');
      expect(result.husbandDialogue).toContain('Anh xin lỗi... không có họp nào cả');
      expect(result.wifeTitle).toBe('Nữ thám tử ghen tuông');
      expect(result.narrativeRoast).toBe(mockCaseConfig.groundTruth.narrativeRoast);
    });

    it('counts edge_order_name as a smoking gun but never the auto edge_name_suspect', () => {
      const edgeNameSuspect: CaseGraphEdge = {
        edgeId: 'edge_name_suspect',
        sourceNodeId: 'node_bridge_name',
        targetNodeId: 'node_suspect_01',
        relationship: 'bridges_identity',
        isSmokingGun: false,
        isCanonical: true,
      };

      expect(getKeyConnectionProgress([edgeNameSuspect], LEVEL_01_KNOWLEDGE_GRAPH).verifiedCount).toBe(0);
      expect(getKeyConnectionProgress([smokingGunEdge3, edgeNameSuspect], LEVEL_01_KNOWLEDGE_GRAPH).verifiedCount).toBe(1);

      const preflight = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        activeEdges: [edgeNameSuspect],
        accusedSuspectId: 'suspect_01',
      });

      expect(preflight.successRate).toBe(0);
      expect(preflight.potentialStars).toBe(0);
      expect(preflight.isLowSuccessRate).toBe(true);
    });

    it('does not auto-report 100% from non-smoking-gun clues alone', () => {
      const ordinaryNodes = [
        { nodeId: 'node_alias_01', type: 'alias' as const, label: 'Khoa BE', sourceAppId: 'internet-messaging' as AppId, suspectId: 'suspect_01', messages: [{ recordId: 'm0', text: 'Msg' }], x: 0, y: 0 },
        ...Array.from({ length: 10 }, (_, idx) => ({
          nodeId: `ordinary_${idx}`,
          type: 'record_clue' as const,
          label: `Manh mối ${idx}`,
          subtitle: `Chi tiết ${idx}`,
          x: 0,
          y: idx * 100,
        })),
      ];
      const ordinaryEdges: CaseGraphEdge[] = Array.from({ length: 10 }, (_, idx) => ({
        edgeId: `ordinary_edge_${idx}`,
        sourceNodeId: idx === 0 ? 'node_alias_01' : `ordinary_${idx - 1}`,
        targetNodeId: `ordinary_${idx}`,
        relationship: 'bridges_identity' as const,
        isCanonical: true,
        isSmokingGun: false,
      }));

      const preflight = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        knowledgeGraph: {
          nodes: ordinaryNodes,
          edges: ordinaryEdges,
          requiredSmokingGunEdgeIds: ['edge_order_phone', 'edge_alibi_contradiction'],
        },
        placedNodes: ordinaryNodes,
        activeEdges: ordinaryEdges,
        accusedSuspectId: 'suspect_01',
      });

      expect(preflight.successRate).toBe(90);
      expect(preflight.potentialStars).toBe(1);
    });

    it('prunes orphan edges from stale saved corkboard state when only Vợ and Khoa BE are pinned', () => {
      const tagged = [
        {
          suspectId: 'tag_wife',
          displayName: 'Vợ',
          sourceApp: 'internet-messaging' as AppId,
          timestamp: 100,
          conversationId: 'thread_005',
          messages: [{ recordId: 'thread_005_m8', text: 'Chưa em, cả nhóm vẫn ở phòng họp.', eventTime: '15/10 20:46' }],
        },
        {
          suspectId: 'tag_901',
          displayName: 'Khoa BE',
          sourceApp: 'internet-messaging' as AppId,
          timestamp: 101,
          conversationId: 'thread_003',
          messages: [{ recordId: 'msg_003_0014', text: 'Vâng anh, em đặt bàn bên Phố Cổ rồi nhé, 19h30.', eventTime: '15/10 16:42' }],
        },
      ];
      const allNodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, tagged);
      const staleSavedBoard = {
        placedNodes: [
          { nodeId: 'node_record_wife_alibi', type: 'record_clue' as const, label: 'Vợ', x: 100, y: 100 },
          { nodeId: 'node_alias_01', type: 'alias' as const, label: 'Khoa BE', x: 400, y: 100 },
          { nodeId: 'node_record_ecommerce_order', type: 'record_clue' as const, label: 'Váy Satin', x: 100, y: 300 },
          { nodeId: 'node_bridge_name', type: 'bridge_id' as const, label: 'Nguyen Thi Thu Huong', x: 400, y: 300 },
          { nodeId: 'node_record_bank_receipt', type: 'record_clue' as const, label: 'Cơm Niêu', x: 700, y: 300 },
          { nodeId: 'node_bridge_phone', type: 'bridge_id' as const, label: '0988886677', x: 700, y: 100 },
        ],
        edges: [
          { edgeId: 'edge_order_name', sourceNodeId: 'node_record_ecommerce_order', targetNodeId: 'node_bridge_name', relationship: 'bridges_identity' as const, isCanonical: true, isSmokingGun: true },
          { edgeId: 'edge_alibi_contradiction', sourceNodeId: 'node_record_wife_alibi', targetNodeId: 'node_record_bank_receipt', relationship: 'contradicts_alibi' as const, isCanonical: true, isSmokingGun: true },
          { edgeId: 'edge_alias_phone', sourceNodeId: 'node_alias_01', targetNodeId: 'node_bridge_phone', relationship: 'bridges_identity' as const, isCanonical: true, isSmokingGun: false },
        ],
      };

      const restored = restoreCorkboardState(staleSavedBoard, allNodes);
      expect(restored.placedNodes).toHaveLength(2);
      expect(restored.edges).toEqual([]);

      const speculativeEdge: CaseGraphEdge = {
        edgeId: 'custom_edge_903',
        sourceNodeId: 'node_record_wife_alibi',
        targetNodeId: 'node_alias_01',
        relationship: 'bridges_identity',
        isCanonical: false,
        isSmokingGun: false,
      };
      const preflight = calculateConfrontationPreflight({
        caseConfig: mockCaseConfig,
        knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
        placedNodes: restored.placedNodes,
        taggedSuspects: tagged,
        activeEdges: [...restored.edges, speculativeEdge],
        accusedSuspectId: 'suspect_01',
      });

      expect(preflight.successRate).toBe(0);
      expect(preflight.potentialStars).toBe(0);
      expect(preflight.isLowSuccessRate).toBe(true);
      expect(preflight.verifiedCluesList).toEqual([]);
    });
  });
});
