import { record, records, text, textFields } from '../../shared/data/read';
import type { NormalizedPhotosState, PhotoAlbum, PhotoExif, PhotoItem } from './types';
import photosAnniversary from './assets/photos-anniversary.jpg';
import photosEveryday01 from './assets/photos-everyday-01.jpg';
import photosEveryday02 from './assets/photos-everyday-02.jpg';
import photosEveryday03 from './assets/photos-everyday-03.jpg';
import photosEveryday04 from './assets/photos-everyday-04.jpg';
import photosForensic from './assets/photos-forensic.jpg';

export type PhotoArtwork = Readonly<{ src: string; position: string }>;

type SpriteQuadrant = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';

function spriteArtwork(src: string): Record<SpriteQuadrant, PhotoArtwork> {
  return {
    topLeft: { src, position: '0% 0%' },
    topRight: { src, position: '100% 0%' },
    bottomLeft: { src, position: '0% 100%' },
    bottomRight: { src, position: '100% 100%' },
  };
}

const everyday01 = spriteArtwork(photosEveryday01);
const everyday02 = spriteArtwork(photosEveryday02);
const everyday03 = spriteArtwork(photosEveryday03);
const everyday04 = spriteArtwork(photosEveryday04);
const anniversary = spriteArtwork(photosAnniversary);
const forensic = spriteArtwork(photosForensic);

const photoArtworkById: Readonly<Record<string, PhotoArtwork>> = {
  photo_0: everyday01.topLeft,
  photo_1: everyday01.topRight,
  photo_2: everyday01.bottomLeft,
  photo_3: everyday01.bottomRight,
  photo_4: everyday02.topLeft,
  photo_5: everyday02.topRight,
  photo_6: everyday03.topRight,
  photo_7: everyday03.topLeft,
  photo_8: everyday02.bottomRight,
  photo_9: everyday04.topLeft,
  photo_history_0: everyday04.bottomRight,
  photo_history_1: everyday02.bottomLeft,
  photo_history_2: everyday03.bottomRight,
  photo_history_3: everyday03.bottomLeft,
  photo_history_4: everyday04.topRight,
  photo_history_5: everyday04.bottomLeft,
  p1: anniversary.topLeft,
  p2: anniversary.topRight,
  df_p1: everyday01.topLeft,
  df_p2: everyday01.topRight,
  df_p3: everyday02.topLeft,
  df_p4: everyday02.topRight,
  df_p5: anniversary.topLeft,
  df_p6: anniversary.topRight,
};

const photoArtworkByClue: Readonly<Record<string, PhotoArtwork>> = {
  'CLUE-PHOT-01': forensic.bottomLeft,
  'CLUE-PHOT-02': forensic.topLeft,
  'CLUE-PHOT-03': forensic.topRight,
  'CLUE-PHOT-04': forensic.bottomRight,
};

function getPhotoArtwork(photo: Record<string, unknown>): PhotoArtwork | undefined {
  const clueArtwork = photoArtworkByClue[text(photo.clueRefId)];
  return clueArtwork || photoArtworkById[text(photo.id)] || photoArtworkById[text(photo.photoId)];
}

const CLUE_FORENSIC_SPECS: Readonly<Record<string, Partial<PhotoItem>>> = {
  'CLUE-PHOT-01': {
    hasForensicHotspot: false,
    isHiddenAlbum: true,
    locationTag: 'Khách sạn La Vela Saigon',
    exif: {
      device: 'Apple iPhone 15 Pro',
      format: 'HEIF',
      lens: 'Camera trước — 23 mm ƒ1,9',
      resolution: '12 MP • 3024 × 4032 • 1,8 MB',
      iso: 400,
      focalLength: 23,
      ev: 0,
      aperture: 'ƒ1,9',
      shutterSpeed: '1/40 s',
      locationName: 'P. Võ Thị Sáu, Quận 3',
      streetLabels: ['NAM KỲ KHỞI NGHĨA', 'LÝ CHÍNH THẮNG', 'TRẦN QUỐC THẢO'],
      filename: 'IMG_9650.HEIC',
    },
  },
  'CLUE-PHOT-02': {
    hasForensicHotspot: true,
    hotspotCoordinates: { x: 45, y: 65, zoomLevel: 3 },
    hotspotClueDescription: 'Bóng ly rượu vang: Phản chiếu bàn tay phụ nữ làm móng đỏ và hình bóng bí mật.',
    locationTag: 'Nhà hàng The Deck Saigon - Thảo Điền',
    exif: {
      device: 'Apple iPhone 15 Pro',
      format: 'HEIF',
      lens: 'Camera chính — 24 mm ƒ1,78',
      resolution: '24 MP • 4284 × 5712 • 2,1 MB',
      iso: 500,
      focalLength: 24,
      ev: 0,
      aperture: 'ƒ1,78',
      shutterSpeed: '1/50 s',
      locationName: 'P. Thảo Điền, TP. Thủ Đức',
      streetLabels: ['P. Thảo Điền', 'NGUYỄN VĂN HƯỞNG', 'XA LỘ HÀ NỘI'],
      filename: 'IMG_9422.HEIC',
    },
  },
  'CLUE-PHOT-03': {
    hasForensicHotspot: true,
    hotspotCoordinates: { x: 74, y: 55, zoomLevel: 2.5 },
    hotspotClueDescription: 'Ghế phụ ô tô: Túi xách nữ hàng hiệu lạ lẫm đặt trên ghế.',
    locationTag: 'Hầm xe Landmark 81',
    exif: {
      device: 'Apple iPhone 15 Pro',
      format: 'HEIF',
      lens: 'Camera chính — 24 mm ƒ1,78',
      resolution: '24 MP • 4284 × 5712 • 2,4 MB',
      iso: 320,
      focalLength: 24,
      ev: 0,
      aperture: 'ƒ1,78',
      shutterSpeed: '1/60 s',
      locationName: 'P. 22, Q. Bình Thạnh',
      streetLabels: ['VINHOMES CENTRAL PARK', 'NGUYỄN HỮU CẢNH', 'ĐIỆN BIÊN PHỦ'],
      filename: 'IMG_8819.HEIC',
    },
  },
  'CLUE-PHOT-04': {
    hasForensicHotspot: false,
    isHiddenAlbum: true,
    locationTag: 'Cửa hàng PNJ Vincom',
    exif: {
      device: 'Apple iPhone 15 Pro',
      format: 'HEIF',
      lens: 'Camera chính — 24 mm ƒ1,78',
      resolution: '24 MP • 4284 × 5712 • 2,2 MB',
      iso: 125,
      focalLength: 24,
      ev: 0,
      aperture: 'ƒ1,78',
      shutterSpeed: '1/120 s',
      locationName: 'P. Bến Nghé, Quận 1',
      streetLabels: ['LÊ THÁNH TÔN', 'ĐỒNG KHỞI', 'LÝ TỰ TRỌNG'],
      filename: 'IMG_9711.HEIC',
    },
  },
};

function buildDefaultExif(photo: Record<string, unknown>, id: string, clueRefId?: string): PhotoExif {
  const clueDefaults = clueRefId ? CLUE_FORENSIC_SPECS[clueRefId] : undefined;
  const clueExif = clueDefaults?.exif;
  const rawExif = record(photo.exif);
  const locationTag = text(photo.locationTag) || clueExif?.locationName || 'P. Nghĩa Đô, Cầu Giấy';
  const numericId = id.replace(/\D/g, '') || '9422';

  const defaultStreetLabels = clueExif?.streetLabels && clueExif.streetLabels.length > 0
    ? clueExif.streetLabels
    : ['P. Nghĩa Đô', 'HỒ TÙNG MẬU', 'QL.32'];

  return {
    device: text(rawExif.device) || clueExif?.device || 'Apple iPhone 15 Pro',
    format: text(rawExif.format) || clueExif?.format || 'HEIF',
    lens: text(rawExif.lens) || clueExif?.lens || 'Camera chính — 24 mm ƒ1,78',
    resolution: text(rawExif.resolution) || clueExif?.resolution || '24 MP • 4284 × 5712 • 2,1 MB',
    fileSize: text(rawExif.fileSize) || clueExif?.fileSize || '2,1 MB',
    iso: rawExif.iso !== undefined ? Number(rawExif.iso) : (clueExif?.iso ?? (clueRefId === 'CLUE-PHOT-02' ? 500 : 64)),
    focalLength: rawExif.focalLength !== undefined ? Number(rawExif.focalLength) : (clueExif?.focalLength ?? 24),
    ev: rawExif.ev !== undefined ? Number(rawExif.ev) : (clueExif?.ev ?? 0),
    aperture: text(rawExif.aperture) || clueExif?.aperture || 'ƒ1,78',
    shutterSpeed: text(rawExif.shutterSpeed) || clueExif?.shutterSpeed || (clueRefId === 'CLUE-PHOT-02' ? '1/50 s' : '1/120 s'),
    locationName: text(rawExif.locationName) || locationTag,
    streetLabels: Array.isArray(rawExif.streetLabels) && rawExif.streetLabels.length > 0
      ? rawExif.streetLabels.map(String)
      : defaultStreetLabels,
    filename: text(rawExif.filename) || clueExif?.filename || `IMG_${numericId}.HEIC`,
  };
}

function normalizeSinglePhoto(photo: Record<string, unknown>, isFromLockedAlbum = false): PhotoItem {
  const id = text(photo.id) || text(photo.photoId) || 'photo';
  const clueRefId = text(photo.clueRefId) || undefined;
  const clueDefaults = clueRefId ? CLUE_FORENSIC_SPECS[clueRefId] : undefined;
  const date = text(photo.date) || text(photo.timestamp) || '';
  const title = text(photo.title) || text(photo.caption) || 'Ảnh';
  const description = text(photo.description) || title;
  const isHiddenAlbum = photo.isHiddenAlbum === true || isFromLockedAlbum || clueDefaults?.isHiddenAlbum === true;
  const rawCoords = record(photo.hotspotCoordinates);

  const hasForensicHotspot = photo.hasForensicHotspot === true || clueDefaults?.hasForensicHotspot === true;
  const hotspotCoordinates = (rawCoords.x !== undefined && rawCoords.y !== undefined)
    ? {
      x: Number(rawCoords.x),
      y: Number(rawCoords.y),
      zoomLevel: rawCoords.zoomLevel !== undefined ? Number(rawCoords.zoomLevel) : 2.5,
    }
    : clueDefaults?.hotspotCoordinates;

  const isVideo = photo.isVideo === true || Boolean(photo.duration);
  const duration = text(photo.duration) || (isVideo ? '0:13' : undefined);

  return {
    id,
    photoId: id,
    title,
    caption: text(photo.caption) || title,
    description,
    date,
    timestamp: text(photo.timestamp) || date,
    suspectName: text(photo.suspectName) || undefined,
    clueRefId,
    artwork: getPhotoArtwork(photo),
    thumbnailUrl: text(photo.thumbnailUrl) || undefined,
    highResUrl: text(photo.highResUrl) || undefined,
    locationTag: text(photo.locationTag) || clueDefaults?.locationTag || undefined,
    isHiddenAlbum,
    hasForensicHotspot,
    hotspotCoordinates,
    hotspotClueDescription: text(photo.hotspotClueDescription) || clueDefaults?.hotspotClueDescription || undefined,
    isVideo,
    duration,
    exif: buildDefaultExif(photo, id, clueRefId),
  };
}

export function readPhotosData(value: unknown): NormalizedPhotosState {
  const root = record(value);
  const rawAlbums = records(root.albums);
  const rawPhotos = records(root.photos);

  let albums: PhotoAlbum[] = [];
  const allPhotos: PhotoItem[] = [];

  if (rawAlbums.length > 0) {
    albums = rawAlbums.map((album) => {
      const isLocked = album.isLocked === true;
      const albumPhotos = records(album.photos).map((p) => normalizeSinglePhoto(p, isLocked));
      allPhotos.push(...albumPhotos);
      return {
        ...textFields(album, ['id', 'title'] as const),
        title: text(album.title) || text(album.name) || 'Album',
        isLocked,
        photos: albumPhotos,
      };
    });
  } else if (rawPhotos.length > 0) {
    const normalizedList = rawPhotos.map((p) => normalizeSinglePhoto(p, false));
    allPhotos.push(...normalizedList);
    const publicPhotos = allPhotos.filter((p) => !p.isHiddenAlbum);
    const hiddenPhotos = allPhotos.filter((p) => p.isHiddenAlbum);

    albums = [
      {
        id: 'album_recent',
        title: 'Gần đây',
        isLocked: false,
        photos: publicPhotos,
      },
    ];

    if (hiddenPhotos.length > 0) {
      albums.push({
        id: 'album_hidden',
        title: 'Mục bị ẩn',
        isLocked: root.hiddenAlbumLocked !== false,
        photos: hiddenPhotos,
      });
    }
  }

  const hasHiddenPhotos = albums.some((a) => a.isLocked || a.photos.some((p) => p.isHiddenAlbum))
    || allPhotos.some((p) => p.isHiddenAlbum);

  const hiddenAlbumLocked = root.hiddenAlbumLocked !== false
    && (albums.some((a) => a.isLocked) || hasHiddenPhotos);

  const lockChallengeId = text(root.lockChallengeId) || 'lock_photos';

  return {
    albums,
    photos: allPhotos,
    hiddenAlbumLocked,
    lockChallengeId,
    hasHiddenPhotos,
  };
}
