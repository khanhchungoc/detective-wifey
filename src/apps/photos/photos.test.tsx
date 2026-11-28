import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { buildPhotoEvidenceItem, readPhotosData } from './data';
import { PhotosApp, appDefinition } from './PhotosApp';
import { PhotoLightboxView } from './components/PhotoLightboxView';
import { deriveNodesFromTaggedEvidence } from '../../features/wife-notebook/WifeNotebookModal';
import { LEVEL_01_KNOWLEDGE_GRAPH } from '../../features/wife-notebook/level01Fixture';
import { loadCase } from '../../features/case-runtime';
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

  it('ships Level 1 photos as everyday content only, with no dinner clue', () => {
    const photos = readPhotosData(loadCase('case_01').appsData.photos).photos;
    expect(photos).toHaveLength(16);
    expect(photos.some(photo => photo.id === 'photo_dinner_claypot')).toBe(false);
    expect(photos.some(photo => photo.clueRefId || photo.locationTag)).toBe(false);
    expect(photos.find(photo => photo.id === 'photo_7')?.title).toBe('Bình nóng lạnh hỏng');
    expect(photos.every(photo => !/15\/10.*(19|2[0-3]):/.test(photo.timestamp ?? ''))).toBe(true);
  });

  it('pins an everyday photo with imageSrc onto the Corkboard', () => {
    const photo = readPhotosData(loadCase('case_01').appsData.photos).photos.find(item => item.id === 'photo_0')!;
    const evidence = buildPhotoEvidenceItem(photo, 'case_01', 'Hoàng', 'exif');
    expect(evidence.source?.recordId).toBe('photo_0');
    expect(evidence.source?.imageSrc).toBeTruthy();

    const nodes = deriveNodesFromTaggedEvidence(LEVEL_01_KNOWLEDGE_GRAPH, [{
      suspectId: 'tag_photo_1',
      displayName: 'Hoàng',
      sourceApp: 'photos',
      timestamp: 1,
      evidence: evidence.source,
    }]);
    expect(nodes).toHaveLength(1);
    expect(nodes[0].imageSrc).toBe(evidence.source?.imageSrc);

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
    expect(boardHtml).toContain(`data-pinned-photo="${nodes[0].nodeId}"`);
    expect(boardHtml).toContain('<img ');
  });

  it('does not render adjacent prev/next slides in PhotoLightboxView unless horizontally paging', () => {
    const state = readPhotosData({
      photos: [
        { id: 'p1', title: 'Ảnh 1', date: '13/10' },
        { id: 'p2', title: 'Ảnh 2', date: '14/10' },
        { id: 'p3', title: 'Ảnh 3', date: '15/10' },
      ],
    });
    const html = renderToStaticMarkup(createElement(PhotoLightboxView, {
      photo: state.photos[1],
      prevPhoto: state.photos[0],
      nextPhoto: state.photos[2],
      caseId: 'case_01',
      husbandName: 'Hoàng',
      onBack: vi.fn(),
      onToggleInfo: vi.fn(),
      isInfoOpen: false,
      onTriggerEvidence: vi.fn(),
      hasPrev: true,
      hasNext: true,
    }));
    expect(html).toContain('data-photo-lightbox');
    expect(html).not.toContain('data-lightbox-prev-slide');
    expect(html).not.toContain('data-lightbox-next-slide');
  });
});
