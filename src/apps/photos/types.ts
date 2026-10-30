import type { PhotoArtwork } from './data';

export interface HotspotCoordinates {
  x: number;
  y: number;
  zoomLevel: number;
}

export interface PhotoExif {
  device: string;
  format: string;
  lens: string;
  resolution: string;
  fileSize?: string;
  iso: number | string;
  focalLength: number | string;
  ev: number | string;
  aperture: string;
  shutterSpeed: string;
  locationName: string;
  streetLabels: string[];
  filename: string;
}

export interface PhotoItem {
  id: string;
  photoId: string;
  title: string;
  caption?: string;
  description: string;
  date: string;
  timestamp: string;
  suspectName?: string;
  clueRefId?: string;
  artwork?: PhotoArtwork;
  thumbnailUrl?: string;
  highResUrl?: string;
  locationTag?: string;
  isHiddenAlbum: boolean;
  hasForensicHotspot: boolean;
  hotspotCoordinates?: HotspotCoordinates;
  hotspotClueDescription?: string;
  isVideo: boolean;
  duration?: string;
  exif: PhotoExif;
}

export interface PhotoAlbum {
  id: string;
  title: string;
  isLocked: boolean;
  photos: PhotoItem[];
}

export interface NormalizedPhotosState {
  albums: PhotoAlbum[];
  photos: PhotoItem[];
  hiddenAlbumLocked: boolean;
  lockChallengeId?: string;
  hasHiddenPhotos: boolean;
}
