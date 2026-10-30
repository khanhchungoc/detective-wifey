import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { PhotosApp } from '../apps/photos/PhotosApp';
import { readPhotosData } from '../apps/photos/data';
import { PhotoLightboxView } from '../apps/photos/components/PhotoLightboxView';
import { PhotoInfoDrawer } from '../apps/photos/components/PhotoInfoDrawer';
import type { AppCaseContext } from '../shared/contracts/app-contracts';

const mockCaseContext: AppCaseContext = {
  caseId: 'case_test_01',
  husbandName: 'Nguyễn Huy Hoàng',
  levelNumber: 1,
  suspectPool: [],
  lockChallenges: [],
  appsData: {},
};

describe('US-008: Photos Gallery & Media Forensics App Module', () => {
  const samplePhotosData = {
    hiddenAlbumLocked: true,
    lockChallengeId: 'lock_photos',
    photos: [
      {
        id: 'photo_wine',
        title: 'Bữa tối tại nhà hàng',
        date: '13/10/2026 21:30',
        timestamp: '13/10/2026 21:30',
        clueRefId: 'CLUE-PHOT-02',
        locationTag: 'Nhà hàng The Deck Saigon - Thảo Điền',
      },
      {
        id: 'photo_car',
        title: 'Bên trong xe ô tô',
        date: '14/10/2026 18:00',
        timestamp: '14/10/2026 18:00',
        clueRefId: 'CLUE-PHOT-03',
        locationTag: 'Hầm xe Landmark 81',
      },
      {
        id: 'video_clip',
        title: 'Video kiểm tra xe',
        date: '12/10/2026',
        timestamp: '12/10/2026',
        isVideo: true,
        duration: '0:26',
      },
      {
        id: 'photo_cat',
        title: 'Mèo ngủ trên yên xe máy',
        date: '11/10/2026',
        timestamp: '11/10/2026',
      },
      {
        id: 'photo_secret',
        title: 'Selfie thân mật',
        date: '08/10/2026',
        timestamp: '08/10/2026',
        isHiddenAlbum: true,
        clueRefId: 'CLUE-PHOT-01',
      },
      {
        id: 'photo_gift',
        title: 'Quà kỷ niệm bất ngờ',
        date: '07/10/2026',
        timestamp: '07/10/2026',
        isHiddenAlbum: true,
        clueRefId: 'CLUE-PHOT-04',
      },
    ],
  };

  it('AC01: mounts photo library grid view with Obsidian Black theme, header, video badges, and floating bottom capsule', () => {
    const html = renderToStaticMarkup(
      createElement(PhotosApp, {
        caseData: { ...mockCaseContext, appsData: { photos: samplePhotosData } },
        onReturnHome: vi.fn(),
        onTagSuspect: vi.fn(),
        onRequestUnlock: vi.fn(),
        unlockedChallenges: new Set<string>(),
      }),
    );

    // Title and Header
    expect(html).toContain('Thư viện');
    expect(html).toContain('Chọn');

    // Obsidian Black canvas
    expect(html).toContain('bg-[#000000]');

    // Ordinary photos and titles
    expect(html).toContain('Bữa tối tại nhà hàng');
    expect(html).toContain('Bên trong xe ô tô');
    expect(html).toContain('Mèo ngủ trên yên xe máy');

    // Video duration overlay badge
    expect(html).toContain('0:26');

    // Floating frosted bottom navigation capsule with segmented filter pills
    expect(html).toContain('Năm');
    expect(html).toContain('Tháng');
    expect(html).toContain('Tất cả');

    // Smart Collections section
    expect(html).toContain('BỘ SƯU TẬP THÔNG MINH');
    expect(html).toContain('Gương mặt &amp; Đối tượng');
    expect(html).toContain('Chuyến đi đáng ngờ');
    expect(html).toContain('Ngày kỷ niệm &amp; Sự kiện');
    expect(html).toContain('Mục bị ẩn');
  });

  it('AC01: displays "Chưa có ảnh." when photo library is empty', () => {
    const html = renderToStaticMarkup(
      createElement(PhotosApp, {
        caseData: { ...mockCaseContext, appsData: { photos: { photos: [] } } },
        onReturnHome: vi.fn(),
        onTagSuspect: vi.fn(),
        onRequestUnlock: vi.fn(),
        unlockedChallenges: new Set<string>(),
      }),
    );

    expect(html).toContain('Chưa có ảnh.');
  });

  it('AC02: renders Forensic Lightbox View with top navigation, info toggle, and forensic magnifier details', () => {
    const normalized = readPhotosData(samplePhotosData);
    const winePhoto = normalized.photos.find((p) => p.clueRefId === 'CLUE-PHOT-02')!;

    const html = renderToStaticMarkup(
      createElement(PhotoLightboxView, {
        photo: winePhoto,
        caseId: mockCaseContext.caseId,
        husbandName: mockCaseContext.husbandName,
        onBack: vi.fn(),
        onToggleInfo: vi.fn(),
        isInfoOpen: false,
        onTriggerEvidence: vi.fn(),
        onShowToast: vi.fn(),
      }),
    );

    // Top Bar controls
    expect(html).toContain('Thư viện');
    expect(html).toContain('13/10/2026 21:30');
    expect(html).toContain('aria-label="Thông tin ảnh"');

    // Forensic Magnifier tool for reflection clue
    expect(html).toContain('Bật kính lúp');

    // Unnecessary bottom toolbar features removed
    expect(html).not.toContain('aria-label="Chia sẻ"');
    expect(html).not.toContain('aria-label="Yêu thích"');
    expect(html).not.toContain('aria-label="Bộ lọc"');
    expect(html).not.toContain('aria-label="Xóa"');
  });

  it('AC03: renders Photo Info & EXIF Metadata Drawer with camera hardware specs and geotag map card', () => {
    const normalized = readPhotosData(samplePhotosData);
    const winePhoto = normalized.photos.find((p) => p.clueRefId === 'CLUE-PHOT-02')!;

    const html = renderToStaticMarkup(
      createElement(PhotoInfoDrawer, {
        photo: winePhoto,
        caseId: mockCaseContext.caseId,
        husbandName: mockCaseContext.husbandName,
        isOpen: true,
        onClose: vi.fn(),
        onNavigateToGrid: vi.fn(),
        onTriggerEvidence: vi.fn(),
        onShowToast: vi.fn(),
      }),
    );

    // Formatted Vietnamese date and time
    expect(html).toContain('Lúc 21:30 Thứ Năm, ngày 13 tháng 10, 2026');
    expect(html).toContain('Điều chỉnh');

    // Original filename
    expect(html).toContain('IMG_9422.HEIC');

    // Camera Hardware EXIF Card
    expect(html).toContain('Apple iPhone 15 Pro');
    expect(html).toContain('HEIF');
    expect(html).toContain('Camera chính — 24 mm ƒ1,78');
    expect(html).toContain('24 MP • 4284 × 5712 • 2,1 MB');
    expect(html).toContain('ISO 500');
    expect(html).toContain('24 mm');
    expect(html).toContain('0 ev');
    expect(html).toContain('ƒ1,78');
    expect(html).toContain('1/50 s');

    // Geotag Map Card with street labels and location name
    expect(html).toContain('P. Thảo Điền');
    expect(html).toContain('NGUYỄN VĂN HƯỞNG');
    expect(html).toContain('XA LỘ HÀ NỘI');
    expect(html).toContain('Nhà hàng The Deck Saigon - Thảo Điền');

    // Full-width action button
    expect(html).toContain('Xem trong Tất cả ảnh');
  });

  it('AC04: locked hidden album gates access until unlocked via PIN challenge', () => {
    const requestUnlockMock = vi.fn();

    // Locked state
    const lockedHtml = renderToStaticMarkup(
      createElement(PhotosApp, {
        caseData: { ...mockCaseContext, appsData: { photos: samplePhotosData } },
        onReturnHome: vi.fn(),
        onTagSuspect: vi.fn(),
        onRequestUnlock: requestUnlockMock,
        unlockedChallenges: new Set<string>(),
      }),
    );

    expect(lockedHtml).toContain('Mục bị ẩn');
    expect(lockedHtml).toContain('Khóa PIN');
    expect(lockedHtml).toContain('Chạm để mở khóa bằng mã PIN 4 số');
    expect(lockedHtml).not.toContain('Selfie thân mật');
    expect(lockedHtml).not.toContain('Quà kỷ niệm bất ngờ');

    // Unlocked state (unlockedChallenges contains 'lock_photos')
    const unlockedHtml = renderToStaticMarkup(
      createElement(PhotosApp, {
        caseData: { ...mockCaseContext, appsData: { photos: samplePhotosData } },
        onReturnHome: vi.fn(),
        onTagSuspect: vi.fn(),
        onRequestUnlock: requestUnlockMock,
        unlockedChallenges: new Set<string>(['lock_photos']),
      }),
    );

    expect(unlockedHtml).toContain('Mục bị ẩn');
    expect(unlockedHtml).toContain('Đã mở khóa • 2 ảnh');
  });

  it('AC05: strictly adheres to zero-spoiler invariant (zero physical ghim buttons or clue badges in grid)', () => {
    const html = renderToStaticMarkup(
      createElement(PhotosApp, {
        caseData: { ...mockCaseContext, appsData: { photos: samplePhotosData } },
        onReturnHome: vi.fn(),
        onTagSuspect: vi.fn(),
        onRequestUnlock: vi.fn(),
        unlockedChallenges: new Set<string>(),
      }),
    );

    // Permanent or visible Ghim buttons strictly forbidden
    expect(html).not.toMatch(/<button[^>]*>[^<]*Ghim[^<]*<\/button>/i);
    expect(html).not.toMatch(/<button[^>]*>[^<]*Thêm Bằng Chứng[^<]*<\/button>/i);

    // No glowing clue borders on photos before long press
    expect(html).not.toContain('ring-red-500');
    expect(html).not.toContain('border-red-500');
  });

  it('AC06: declarative data contract supports both albums and photos arrays seamlessly', () => {
    // Top-level photos array
    const stateA = readPhotosData(samplePhotosData);
    expect(stateA.photos.length).toBe(6);
    expect(stateA.albums.length).toBe(2);
    expect(stateA.hiddenAlbumLocked).toBe(true);

    // Legacy/Case-supplied albums structure
    const stateB = readPhotosData({
      albums: [
        {
          id: 'album_1',
          title: 'Gần đây',
          isLocked: false,
          photos: [{ id: 'p_1', title: 'Ảnh 1' }, { id: 'p_2', title: 'Ảnh 2' }],
        },
      ],
    });
    expect(stateB.albums[0].title).toBe('Gần đây');
    expect(stateB.photos.length).toBe(2);
    expect(stateB.hasHiddenPhotos).toBe(false);
  });
});
