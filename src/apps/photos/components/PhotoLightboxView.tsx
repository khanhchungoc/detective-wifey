import React, { useState, useRef, useCallback } from 'react';
import {
  IoChevronBack,
  IoInformationCircleOutline,
  IoInformationCircle,
  IoSparklesOutline,
} from 'react-icons/io5';
import type { PhotoItem } from '../types';
import { PhotoPreview } from './PhotoPreview';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../../../features/investigation';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';

interface PhotoLightboxViewProps {
  photo: PhotoItem;
  caseId: string;
  husbandName: string;
  onBack: () => void;
  onToggleInfo: () => void;
  isInfoOpen: boolean;
  onTriggerEvidence: (item: UniversalEvidenceItem) => void;
  onShowToast?: (message: string) => void;
}

export const PhotoLightboxView: React.FC<PhotoLightboxViewProps> = ({
  photo,
  caseId,
  husbandName,
  onBack,
  onToggleInfo,
  isInfoOpen,
  onTriggerEvidence,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);

  // Swipe back handler (swipe right to go back to grid)
  const swipeBackHandlers = useSwipeBack({
    onBack: (e?: unknown) => {
      if (e && typeof (e as Event).stopPropagation === 'function') {
        (e as Event).stopPropagation();
      }
      onBack();
    },
  });

  // Swipe up gesture detection for opening info drawer
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    swipeBackHandlers.onTouchStart?.(e);
    if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    swipeBackHandlers.onTouchEnd?.(e);
    if (touchStartY.current !== null && touchStartX.current !== null && e.changedTouches.length === 1) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX.current);
      if (deltaY < -50 && deltaX < 60) {
        onToggleInfo();
      }
    }
    touchStartY.current = null;
    touchStartX.current = null;
  };

  // Double tap to toggle zoom
  const lastTapRef = useRef<number>(0);
  const handleDoubleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (zoomLevel === 1) {
        setZoomLevel(photo.hasForensicHotspot && photo.hotspotCoordinates ? photo.hotspotCoordinates.zoomLevel : 2.5);
        if (photo.hasForensicHotspot) {
          setIsMagnifierActive(true);
        }
      } else {
        setZoomLevel(1);
        setIsMagnifierActive(false);
      }
    }
    lastTapRef.current = now;
  }, [zoomLevel, photo]);

  const toggleMagnifier = () => {
    if (!isMagnifierActive) {
      setIsMagnifierActive(true);
      setZoomLevel(photo.hotspotCoordinates?.zoomLevel || 2.5);
    } else {
      setIsMagnifierActive(false);
      setZoomLevel(1);
    }
  };

  const evidenceItem: UniversalEvidenceItem = {
    title: photo.title,
    subtitle: `${photo.date} • ${photo.locationTag || photo.exif.locationName}`,
    snippet: photo.hotspotClueDescription
      ? `Chi tiết pháp y phát hiện: ${photo.hotspotClueDescription}`
      : (photo.description || photo.title),
    suspectToTag: photo.suspectName || husbandName,
    source: {
      caseId,
      recordId: photo.id,
      clueRefId: photo.clueRefId,
      title: photo.title,
      snippet: photo.description || photo.title,
      kind: 'photo',
    },
  };

  const hotspot = photo.hotspotCoordinates;
  const isHotspotRevealed = (isMagnifierActive || zoomLevel > 1) && photo.hasForensicHotspot && hotspot;

  return (
    <div
      {...swipeBackHandlers}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="absolute inset-0 z-30 flex flex-col bg-[#000000] text-white select-none overflow-hidden"
    >
      {/* Top iOS Header */}
      <header className="h-14 px-3 flex items-center justify-between border-b border-white/10 bg-black/80 backdrop-blur-md shrink-0 z-20">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 min-w-[44px] min-h-[44px] px-2 text-ios-subheadline font-semibold text-[#2979FF] rounded-lg active:scale-95 transition-all"
          aria-label="Quay lại Thư viện"
        >
          <IoChevronBack className="w-5 h-5" />
          <span>Thư viện</span>
        </button>

        <span className="text-ios-subheadline font-medium text-white/90 truncate max-w-[180px]">
          {photo.date || 'Ảnh'}
        </span>

        <button
          type="button"
          onClick={onToggleInfo}
          className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full transition-colors ${
            isInfoOpen ? 'text-[#2979FF] bg-white/10' : 'text-white/80 hover:text-white'
          }`}
          aria-label="Thông tin ảnh"
        >
          {isInfoOpen ? (
            <IoInformationCircle className="w-6 h-6" />
          ) : (
            <IoInformationCircleOutline className="w-6 h-6" />
          )}
        </button>
      </header>

      {/* Main Photo Viewport */}
      <main
        className="flex-1 relative flex items-center justify-center overflow-hidden bg-[#000000] p-4 pb-8"
        onClick={handleDoubleTap}
      >
        <StoryEvidenceTarget
          item={evidenceItem}
          onTriggerEvidence={onTriggerEvidence}
          className="w-full h-full flex items-center justify-center"
        >
          <div className="relative w-full max-w-[420px] aspect-square max-h-[70vh] flex items-center justify-center cursor-pointer">
            <PhotoPreview
              photo={photo}
              className="w-full h-full rounded-2xl shadow-2xl"
              zoomLevel={zoomLevel}
              centerCoordinates={isMagnifierActive && hotspot ? { x: hotspot.x, y: hotspot.y } : undefined}
            />

            {/* Forensic Cyan Ring Hotspot Indicator */}
            {isHotspotRevealed && (
              <div
                className="absolute pointer-events-none transition-all duration-300 z-10"
                style={{
                  left: `${hotspot.x}%`,
                  top: `${hotspot.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div className="w-14 h-14 rounded-full border-2 border-[#00E5FF] shadow-[0_0_15px_#00E5FF] animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                </div>
              </div>
            )}
          </div>
        </StoryEvidenceTarget>

        {/* Forensic Hotspot Callout Box */}
        {isHotspotRevealed && photo.hotspotClueDescription && (
          <div className="absolute bottom-6 inset-x-4 z-20 p-3 rounded-2xl bg-black/85 backdrop-blur-md border border-[#00E5FF]/40 shadow-2xl text-left animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#00E5FF] mb-1">
              <IoSparklesOutline className="w-3.5 h-3.5" />
              <span>Phát hiện chi tiết pháp y</span>
            </div>
            <p className="text-ios-caption-1 text-slate-200">
              {photo.hotspotClueDescription}
            </p>
          </div>
        )}

        {/* Forensic Magnifier Action Button (AI Clean Up / Spatial Reframing) */}
        {photo.hasForensicHotspot && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleMagnifier();
            }}
            className={`absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border transition-all active:scale-95 min-h-[36px] ${
              isMagnifierActive
                ? 'bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]'
                : 'bg-[#1C1C1E]/80 text-white/90 border-white/20 hover:text-white'
            }`}
          >
            <IoSparklesOutline className="w-3.5 h-3.5" />
            <span>{isMagnifierActive ? 'Tắt kính lúp' : 'Bật kính lúp'}</span>
          </button>
        )}
      </main>
    </div>
  );
};

export default PhotoLightboxView;
