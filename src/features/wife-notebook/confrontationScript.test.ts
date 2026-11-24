import { describe, expect, it } from 'vitest';
import { case01 } from '../../data/cases';
import { LEVEL_01_KNOWLEDGE_GRAPH } from './level01Fixture';

describe('Level 1 confrontationScript data', () => {
  const script = case01.confrontationScript!;
  const edgeIds = new Set(LEVEL_01_KNOWLEDGE_GRAPH.edges.map(edge => edge.edgeId));

  it('opens with exactly one left and one right confident choice', () => {
    expect(script.opening.map(choice => choice.slot).sort()).toEqual(['left', 'right']);
    expect(script.opening.every(choice => choice.husbandMood === 'confident')).toBe(true);
  });

  it('gives every beat one lead backed by canonical edges, unique slots and smug fallbacks', () => {
    script.beats.forEach((beat, index) => {
      const leads = beat.choices.filter(choice => choice.requiredEdgeIds);
      expect(leads).toHaveLength(1);
      expect(leads[0].requiredEdgeIds!.every(id => edgeIds.has(id))).toBe(true);
      expect(leads[0].onTrue!.husbandMood).toBe(index === script.beats.length - 1 ? 'broken' : 'nervous');
      expect(new Set(beat.choices.map(choice => choice.slot)).size).toBe(beat.choices.length);
      expect(beat.choices.every(choice => choice.onFalse.husbandMood === 'smug')).toBe(true);
    });
  });

  it('covers every required smoking gun before the confession', () => {
    const scripted = script.beats.flatMap(beat => beat.choices.flatMap(choice => choice.requiredEdgeIds ?? []));
    for (const id of LEVEL_01_KNOWLEDGE_GRAPH.requiredSmokingGunEdgeIds) expect(scripted).toContain(id);
  });

  it('uses no em dashes in any line', () => {
    expect(JSON.stringify(script)).not.toMatch(/[\u2014\u2013]/);
  });
});
