import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { case01, case02, case03 } from '../../data/cases';
import type { CaseGraphEdge } from '../../shared/contracts/knowledge-graph';
import { LEVEL_01_KNOWLEDGE_GRAPH } from './level01Fixture';
import {
  advanceScriptedConfrontation,
  createScriptedConfrontation,
  evaluateConfrontation,
  hasConfrontationScript,
} from './confrontationEngine';
import { ConfrontationModal } from './components/ConfrontationModal';
import { HOANG_COMIC_ASSETS, HusbandCharacterImage } from './components/HusbandCharacterImage';

const VERIFIED_EDGES_ALL: CaseGraphEdge[] = [
  {
    edgeId: 'edge_order_phone',
    sourceNodeId: 'node_record_ecommerce_order',
    targetNodeId: 'node_bridge_phone',
    relationship: 'bridges_identity',
    isCanonical: true,
    isSmokingGun: true,
  },
  {
    edgeId: 'edge_order_name',
    sourceNodeId: 'node_record_ecommerce_order',
    targetNodeId: 'node_bridge_name',
    relationship: 'bridges_identity',
    isCanonical: true,
    isSmokingGun: true,
  },
  {
    edgeId: 'edge_alibi_contradiction',
    sourceNodeId: 'node_record_wife_alibi',
    targetNodeId: 'node_record_bank_receipt',
    relationship: 'contradicts_alibi',
    isCanonical: true,
    isSmokingGun: true,
  },
];

const RAW_EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
const EM_DASH_REGEX = /[\u2014\u2013]/;

describe('Beat-by-Beat Scripted Confrontation Flow & Interrogation UI', () => {
  it('Beat 1 (opening): exposes 2 opening choices, returns distinct confident replies, and advances to Beat 2', () => {
    const initial = createScriptedConfrontation({
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
      currentStrikes: 5,
    })!;

    expect(initial).not.toBeNull();
    expect(initial.phase).toBe('opening');
    expect(initial.husbandMood).toBe('confident');
    expect(initial.canAccuse).toBe(false);
    expect(initial.choices.map(c => c.slot)).toEqual(['left', 'right']);

    const afterLeft = advanceScriptedConfrontation(initial, 'open_ask', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
    });
    const afterRight = advanceScriptedConfrontation(initial, 'open_offer', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
    });

    expect(afterLeft.phase).toBe('beat');
    expect(afterLeft.beatIndex).toBe(0);
    expect(afterLeft.husbandMood).toBe('confident');
    expect(afterLeft.husbandLine).toBe(case01.confrontationScript!.opening[0].husbandLine);

    expect(afterRight.phase).toBe('beat');
    expect(afterRight.beatIndex).toBe(0);
    expect(afterRight.husbandMood).toBe('confident');
    expect(afterRight.husbandLine).toBe(case01.confrontationScript!.opening[1].husbandLine);

    const html = renderToStaticMarkup(
      <ConfrontationModal
        isOpen
        session={initial}
        maxStrikes={5}
        onSelectChoice={vi.fn()}
        onContinueInvestigation={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(html).toContain('data-choice-slot="left"');
    expect(html).toContain('data-choice-slot="right"');
    expect(html).toContain('role="progressbar"');
    expect(RAW_EMOJI_REGEX.test(html)).toBe(false);
    expect(EM_DASH_REGEX.test(html)).toBe(false);
  });

  it('False branch: missing evidence or red herring triggers smug mood, locks canAccuse, hides all accusation buttons, and deducts 1 strike', () => {
    let state = createScriptedConfrontation({
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
      currentStrikes: 5,
    })!;

    state = advanceScriptedConfrontation(state, 'open_ask', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
    });

    // Attempt lead choice without edge_order_phone connected
    const failedMissingEdge = advanceScriptedConfrontation(state, 'khoa_shared_phone', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
    });

    expect(failedMissingEdge.phase).toBe('failed');
    expect(failedMissingEdge.husbandMood).toBe('smug');
    expect(failedMissingEdge.canAccuse).toBe(false);
    expect(failedMissingEdge.choices).toEqual([]);
    expect(failedMissingEdge.newStrikesRemaining).toBe(4);
    expect(failedMissingEdge.isMaxStrikesReached).toBe(false);

    // Attempt red herring even when all canonical edges are connected
    const failedRedHerring = advanceScriptedConfrontation(state, 'thao_herring', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: VERIFIED_EDGES_ALL,
    });
    expect(failedRedHerring.phase).toBe('failed');
    expect(failedRedHerring.husbandMood).toBe('smug');
    expect(failedRedHerring.canAccuse).toBe(false);

    // Last strike check (currentStrikes = 1 -> 0 -> isMaxStrikesReached = true)
    let lastStrikeState = createScriptedConfrontation({
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
      currentStrikes: 1,
    })!;
    lastStrikeState = advanceScriptedConfrontation(lastStrikeState, 'open_offer', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
    });
    lastStrikeState = advanceScriptedConfrontation(lastStrikeState, 'tuan_herring', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: [],
    });
    expect(lastStrikeState.newStrikesRemaining).toBe(0);
    expect(lastStrikeState.isMaxStrikesReached).toBe(true);

    // Verify DOM strictly hides all accusation/verdict actions and shows only return button
    const failedHtml = renderToStaticMarkup(
      <ConfrontationModal
        isOpen
        session={failedMissingEdge}
        maxStrikes={5}
        onSelectChoice={vi.fn()}
        onContinueInvestigation={vi.fn()}
        onForgiveAndAdvance={vi.fn()}
        onShareRoastCard={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(failedHtml).toContain('Quay lại điều tra');
    expect(failedHtml).toContain('1/5');
    expect(failedHtml).not.toContain('Ký đơn đi');
    expect(failedHtml).not.toContain('Tha thứ &amp; Qua màn');
    expect(failedHtml).not.toContain('Chốt hồ sơ &amp; Qua màn');
    expect(failedHtml).not.toContain('Tạo thẻ Roast khoe MXH');
    expect(RAW_EMOJI_REGEX.test(failedHtml)).toBe(false);
    expect(EM_DASH_REGEX.test(failedHtml)).toBe(false);
  });

  it('False branch: accusing wrong suspect forces smug failure even if culprit edges exist', () => {
    let state = createScriptedConfrontation({
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: VERIFIED_EDGES_ALL,
      accusedSuspectId: 'suspect_lan_anh',
      currentStrikes: 5,
    })!;

    state = advanceScriptedConfrontation(state, 'open_ask', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: VERIFIED_EDGES_ALL,
    });
    state = advanceScriptedConfrontation(state, 'khoa_shared_phone', {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: VERIFIED_EDGES_ALL,
    });

    expect(state.phase).toBe('failed');
    expect(state.husbandMood).toBe('smug');
    expect(state.canAccuse).toBe(false);
  });

  it('True multi-beat chain: progresses confident -> nervous -> nervous -> broken -> ending -> resolved', () => {
    const ctx = {
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: VERIFIED_EDGES_ALL,
    };

    let state = createScriptedConfrontation({
      ...ctx,
      accusedSuspectId: 'suspect_huong',
      currentStrikes: 5,
    })!;
    expect(state.husbandMood).toBe('confident');

    // Beat 1: Opening
    state = advanceScriptedConfrontation(state, 'open_offer', ctx);
    expect(state.phase).toBe('beat');
    expect(state.beatIndex).toBe(0);
    expect(state.husbandMood).toBe('confident');

    // Beat 2: khoa_shared_phone -> nervous
    state = advanceScriptedConfrontation(state, 'khoa_shared_phone', ctx);
    expect(state.phase).toBe('beat');
    expect(state.beatIndex).toBe(1);
    expect(state.husbandMood).toBe('nervous');
    expect(state.verifiedBeatCount).toBe(1);
    expect(state.hitSeq).toBe(1);
    expect(state.canAccuse).toBe(false);

    // Beat 3: dress_legal_name -> nervous
    state = advanceScriptedConfrontation(state, 'dress_legal_name', ctx);
    expect(state.phase).toBe('beat');
    expect(state.beatIndex).toBe(2);
    expect(state.husbandMood).toBe('nervous');
    expect(state.verifiedBeatCount).toBe(2);
    expect(state.hitSeq).toBe(2);
    expect(state.canAccuse).toBe(false);

    // Beat 4: alibi_card_swipe -> broken + unlocks Ending!
    state = advanceScriptedConfrontation(state, 'alibi_card_swipe', ctx);
    expect(state.phase).toBe('ending');
    expect(state.husbandMood).toBe('broken');
    expect(state.verifiedBeatCount).toBe(3);
    expect(state.hitSeq).toBe(3);
    expect(state.canAccuse).toBe(true);
    expect(state.choices.map(c => c.choiceId)).toEqual(['end_divorce', 'end_forgive']);

    const endingHtml = renderToStaticMarkup(
      <ConfrontationModal
        isOpen
        session={state}
        maxStrikes={5}
        onSelectChoice={vi.fn()}
        onContinueInvestigation={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(endingHtml).toContain('data-choice-id="end_divorce"');
    expect(endingHtml).toContain('data-choice-id="end_forgive"');

    // Final Verdict Choice: Divorce vs Forgive
    const divorced = advanceScriptedConfrontation(state, 'end_divorce', ctx);
    expect(divorced.phase).toBe('resolved');
    expect(divorced.stars).toBe(3);
    expect(divorced.wifeTitle).toBe('Nữ thám tử ghen tuông');
    expect(divorced.narrativeRoast).toBe(case01.groundTruth.narrativeRoast);
    expect(divorced.newStrikesRemaining).toBe(5);

    const resolvedHtml = renderToStaticMarkup(
      <ConfrontationModal
        isOpen
        session={divorced}
        maxStrikes={5}
        onContinueInvestigation={vi.fn()}
        onForgiveAndAdvance={vi.fn()}
        onShareRoastCard={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(resolvedHtml).toContain('BẮT QUẢ TANG NGOẠI TÌNH');
    expect(resolvedHtml).toContain('Tạo thẻ Roast khoe MXH');
    expect(resolvedHtml).toContain('Chốt hồ sơ &amp; Qua màn');
    expect(RAW_EMOJI_REGEX.test(resolvedHtml)).toBe(false);
    expect(EM_DASH_REGEX.test(resolvedHtml)).toBe(false);
    // Without an epilogue the result screen shows no banner.
    expect(resolvedHtml).not.toContain('role="alert"');

    // Epilogue banner appears only once the ending choice has resolved.
    expect(case01.epilogueNotification).toBeTruthy();
    const render = (session: typeof state) => renderToStaticMarkup(
      <ConfrontationModal
        isOpen
        session={session}
        epilogueNotification={case01.epilogueNotification}
        maxStrikes={5}
        onContinueInvestigation={vi.fn()}
        onForgiveAndAdvance={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(render(state)).not.toContain('role="alert"');
    const epilogueHtml = render(divorced);
    expect(epilogueHtml).toContain('role="alert"');
    expect(epilogueHtml).toContain('NGUYEN THI THU HUONG');
    expect(epilogueHtml).toContain('Anh chan so em that a?');
    expect(EM_DASH_REGEX.test(epilogueHtml)).toBe(false);
  });

  it('Accusing the real electrician (suspect_tuan_dien) gives his roast and a strike, never a win', () => {
    const ctx = { caseConfig: case01, knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH, activeEdges: VERIFIED_EDGES_ALL };
    let state = createScriptedConfrontation({ ...ctx, accusedSuspectId: 'suspect_tuan_dien', currentStrikes: 5 })!;
    expect(state.isWrongSuspect).toBe(true);
    state = advanceScriptedConfrontation(state, 'open_ask', ctx);
    state = advanceScriptedConfrontation(state, 'khoa_shared_phone', ctx);
    expect(state.phase).toBe('failed');
    expect(state.newStrikesRemaining).toBe(4);

    const result = evaluateConfrontation({
      caseConfig: case01,
      knowledgeGraph: LEVEL_01_KNOWLEDGE_GRAPH,
      activeEdges: VERIFIED_EDGES_ALL,
      unmaskedSuspectIds: [],
      currentStrikes: 5,
      accusedSuspectId: 'suspect_tuan_dien',
      rngRoll: 0,
    });
    expect(result.isRedHerringAccusation).toBe(true);
    expect(result.stars).toBe(0);
    expect(result.newStrikesRemaining).toBe(4);
    expect(result.husbandDialogue).toContain('Bà ấy là mẹ anh');
  });

  it('Fallback: levels without confrontationScript (Level 2 & Level 3) safely return null and render fallback evaluation', () => {
    expect(hasConfrontationScript(case02)).toBe(false);
    expect(hasConfrontationScript(case03)).toBe(false);

    expect(
      createScriptedConfrontation({
        caseConfig: case02,
        activeEdges: [],
        currentStrikes: 4,
      }),
    ).toBeNull();
    expect(
      createScriptedConfrontation({
        caseConfig: case03,
        activeEdges: [],
        currentStrikes: 3,
      }),
    ).toBeNull();

    const evalL2 = evaluateConfrontation({
      caseConfig: case02,
      activeEdges: [],
      unmaskedSuspectIds: [],
      currentStrikes: 4,
    });
    const htmlL2 = renderToStaticMarkup(
      <ConfrontationModal
        isOpen
        evaluation={evalL2}
        maxStrikes={4}
        onContinueInvestigation={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(htmlL2).toContain('Tiếp tục điều tra');
    expect(htmlL2).toContain('1/4');
  });

  it('HusbandCharacterImage renders all 4 comic moods (confident, smug, nervous, broken) cleanly', () => {
    for (const mood of ['confident', 'smug', 'nervous', 'broken'] as const) {
      expect(HOANG_COMIC_ASSETS[mood]).toBeTruthy();
      const html = renderToStaticMarkup(
        <HusbandCharacterImage mood={mood} hitTrigger={1} size={172} />,
      );
      expect(html).toContain('<svg');
      expect(html).toContain(`url(#bg-${mood})`);
      expect(html).toContain(HOANG_COMIC_ASSETS[mood]);
      expect(RAW_EMOJI_REGEX.test(html)).toBe(false);
      expect(EM_DASH_REGEX.test(html)).toBe(false);
    }
  });
});
