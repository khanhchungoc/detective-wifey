import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { buildPhotoEvidenceItem, readPhotosData } from './data';
import { PhotosApp, appDefinition } from './PhotosApp';
import { deriveNodesFromTaggedEvidence } from '../../features/wife-notebook/WifeNotebookModal';
import { LEVEL_01_KNOWLEDGE_GRAPH } from '../../features/wife-notebook/level01Fixture';
import { createEdgeBetweenNodes } from '../../features/wife-notebook/graphEngine';
import { CorkboardCanvas } from '../../features/wife-notebook/components/CorkboardCanvas';

describe('case-supplied photo library', () => {
  const albums = [
    { id: 'recent', name: 'Gần đây', isLocked: false, photos: [{ id: 'family', title: 'Mâm cơm nhà', description: 'Bữa tối gia đình.', date: '11/10' }] },
    { id: 'private', title: 'Riêng tư', isLocked: true, photos: [{ id: 'private-photo', title: 'Nội dung đã khóa' }] },
  ];
  const render = (payload: unknown) => renderToStaticMarkup(createElement(PhotosApp, {
    caseData: { caseId: 'case', husbandName: 'Hoàng', levelNumber: 1, suspectPool: [], lockChallenges: [], appsData: { photos: payload } },
    onReturnHome: vi.fn(), onTagSuspect: vi.fn(), onRequestUnlock: vi.fn(), unlockedChallenges: new Set<string>(),
  }));

  it('shows supplied ordinary photos while protecting locked album contents', () => {
    const html = render({ albums });
    expect(html).toContain('Mâm cơm nhà');
    expect(html).toContain('11/10');
    expect(html).not.toContain('Nội dung đã khóa');
    expect(html).toContain('Mục bị ẩn');
    expect(readPhotosData({ albums }).albums[0].title).toBe('Gần đây');
  });

  it('does not invent a hidden lock or placeholder photos for an ordinary library', () => {
    const html = render({ albums: [albums[0]] });
    expect(html).not.toContain('Mục bị ẩn');
    expect(html).not.toContain('Ảnh 1');
    expect(render(null)).toContain('Chưa có ảnh.');
  });

  it('exports a valid appDefinition with parody homescreen iconAsset', () => {
    expect(appDefinition.appId).toBe('photos');
    expect(appDefinition.displayName).toBe('Photos');
    expect(appDefinition.iconAsset).toBeDefined();
    expect(typeof appDefinition.iconAsset).toBe('string');
    expect(appDefinition.dataKeys).toContain('photos');
  });

  it('pins photo_dinner_claypot with imageSrc onto the Corkboard and links canonical alibi edge', () => {
    const state = readPhotosData({
      photos: [{
        id: 'photo_dinner_claypot',
        title: 'Bữa tối cơm niêu',
        date: '15/10/2026 19:45',
        timestamp: '15/10/2026 19:45',
        locationTag: 'Phố Cổ, Hoàn Kiếm, Hà Nội',
        clueRefId: 'CLUE-PHOT-05',
      }],
    });
    const dinnerPhoto = state.photos[0];
    const lightboxEvidence = buildPhotoEvidenceItem(dinnerPhoto, 'case_01', 'Hoàng', 'lightbox');
    expect(lightboxEvidence.snippet).toBe('');
    expect(lightboxEvidence.title).toBe('IMG_9518.HEIC');

    const evidence = buildPhotoEvidenceItem(dinnerPhoto, 'case_01', 'Hoàng', 'exif');
    expect(evidence.source?.recordId).toBe('photo_dinner_claypot');
    expect(evidence.source?.imageSrc).toBeTruthy();

    const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [{
      suspectId: 'tag_photo_1',
      displayName: 'Hoàng',
      sourceApp: 'photos',
      timestamp: 1,
      evidence: evidence.source,
    }]);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].nodeId).toBe('node_record_photo_dinner');
    expect(nodes[0].imageSrc).toBe(evidence.source?.imageSrc);

    const { newEdge } = createEdgeBetweenNodes(
      LEVEL_01_KNOWLEDGE_GRAPH,
      [],
      'node_record_photo_dinner',
      'node_record_wife_alibi',
    );
    expect(newEdge?.edgeId).toBe('edge_photo_dinner_alibi');
    expect(newEdge?.relationship).toBe('contradicts_alibi');

    const boardHtml = renderToStaticMarkup(createElement(CorkboardCanvas, {
      viewport: { x: 0, y: 0, zoom: 1 },
      placedNodes: [{ ...nodes[0], x: 545, y: 160 }],
      edges: [],
      activePairing: { sourceNodeId: null },
      unmaskedSuspectIds: [],
      activeContradictions: [],
      selectedEdgeId: null,
      onSelectNode: vi.fn(),
      onMoveNode: vi.fn(),
      onSelectEdge: vi.fn(),
      onSeverEdge: vi.fn(),
      onNavigateToSource: vi.fn(),
      onCancelPairing: vi.fn(),
    }));
    expect(boardHtml).toContain('data-pinned-photo="node_record_photo_dinner"');
    expect(boardHtml).toContain('<img ');
  });
});

