import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { IoImages } from 'react-icons/io5';
import type { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { readPhotosData } from './data';
import { PhotoGridView } from './components/PhotoGridView';
import { PhotoLightboxView, type PhotoOriginDelta } from './components/PhotoLightboxView';
import { PhotoInfoDrawer } from './components/PhotoInfoDrawer';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { UniversalEvidenceModal, type UniversalEvidenceItem } from '../../features/investigation';
import photosIcon from './assets/photos-icon.svg';

const LIGHTBOX_HEADER_HEIGHT = 56;

export const PhotosApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
  onRequestUnlock,
  unlockedChallenges,
}) => {
  const photosData = useMemo(() => readPhotosData(caseData.appsData?.photos), [caseData.appsData?.photos]);

  const rootRef = useRef<HTMLDivElement>(null);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [originDelta, setOriginDelta] = useState<PhotoOriginDelta | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isViewingHidden, setIsViewingHidden] = useState(false);
  const [evidenceItem, setEvidenceItem] = useState<UniversalEvidenceItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const lockChallengeKey = photosData.lockChallengeId || 'lock_photos';
  const isHiddenUnlocked = unlockedChallenges.has(lockChallengeKey);

  // Group photos
  const publicPhotos = useMemo(() => {
    return photosData.photos.filter((p) => !p.isHiddenAlbum);
  }, [photosData.photos]);

  const hiddenPhotos = useMemo(() => {
    return photosData.photos.filter((p) => p.isHiddenAlbum);
  }, [photosData.photos]);

  // Selected photo for Lightbox
  const activeAlbumPhotos = isViewingHidden ? hiddenPhotos : publicPhotos;
  const activePhotoIndex = useMemo(() => {
    if (!activePhotoId) return -1;
    return activeAlbumPhotos.findIndex((p) => p.id === activePhotoId);
  }, [activeAlbumPhotos, activePhotoId]);

  const selectedPhoto = useMemo(() => {
    if (!activePhotoId) return null;
    return photosData.photos.find((p) => p.id === activePhotoId) || null;
  }, [activePhotoId, photosData.photos]);

  const handleStepPhoto = useCallback((direction: -1 | 1) => {
    if (activePhotoIndex < 0) return;
    const target = activeAlbumPhotos[activePhotoIndex + direction];
    if (!target) return;
    setOriginDelta(null);
    setActivePhotoId(target.id);
    setIsInfoOpen(false);
  }, [activeAlbumPhotos, activePhotoIndex]);

  // Toast handler
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Measure tapped thumbnail once on open for iOS Photos hero zoom
  const handleSelectPhoto = useCallback((id: string, originElement?: HTMLElement | null) => {
    const rootRect = rootRef.current?.getBoundingClientRect();
    const tileRect = originElement?.getBoundingClientRect();
    if (rootRect && tileRect && rootRect.width > 0 && rootRect.height > 0 && tileRect.width > 0) {
      const stageCenterX = rootRect.left + rootRect.width / 2;
      const stageCenterY = rootRect.top + LIGHTBOX_HEADER_HEIGHT + (rootRect.height - LIGHTBOX_HEADER_HEIGHT) / 2;
      const tileCenterX = tileRect.left + tileRect.width / 2;
      const tileCenterY = tileRect.top + tileRect.height / 2;
      const scale = Math.max(0.2, Math.min(0.95, tileRect.width / rootRect.width));
      setOriginDelta({
        dx: tileCenterX - stageCenterX,
        dy: tileCenterY - stageCenterY,
        scale,
      });
    } else {
      setOriginDelta(null);
    }
    setActivePhotoId(id);
    setIsInfoOpen(false);
  }, []);

  const handleCloseLightbox = useCallback(() => {
    setActivePhotoId(null);
    setIsInfoOpen(false);
  }, []);

  // Root swipe-back handler
  const handleRootBack = useCallback(() => {
    if (isInfoOpen) {
      setIsInfoOpen(false);
    } else if (activePhotoId) {
      setActivePhotoId(null);
    } else if (isViewingHidden) {
      setIsViewingHidden(false);
    } else {
      onReturnHome();
    }
  }, [isInfoOpen, activePhotoId, isViewingHidden, onReturnHome]);

  const rootSwipeHandlers = useSwipeBack({ onBack: handleRootBack, enabled: !activePhotoId, exitsApp: !isInfoOpen && !isViewingHidden });

  const handleTriggerEvidence = useCallback((item: UniversalEvidenceItem) => {
    try {
      if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
        navigator.vibrate(50);
      }
    } catch {
      // Haptics safe fallback
    }
    setEvidenceItem(item);
  }, []);

  const handleRequestUnlock = useCallback(() => {
    if (onRequestUnlock) {
      onRequestUnlock(lockChallengeKey);
    }
  }, [onRequestUnlock, lockChallengeKey]);

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        {...rootSwipeHandlers}
        className="relative flex flex-col h-full w-full bg-[#000000] text-white select-none font-sans overflow-hidden"
      >
        {/* Photo Library Grid View */}
        <PhotoGridView
          photos={publicPhotos}
          hiddenPhotos={hiddenPhotos}
          hasHiddenPhotos={photosData.hasHiddenPhotos}
          isHiddenUnlocked={isHiddenUnlocked}
          caseId={caseData.caseId}
          husbandName={caseData.husbandName}
          onSelectPhoto={handleSelectPhoto}
          onRequestUnlock={handleRequestUnlock}
          onTriggerEvidence={handleTriggerEvidence}
          onShowToast={showToast}
          isViewingHidden={isViewingHidden}
          onToggleViewHidden={setIsViewingHidden}
        />

        {/* Forensic Lightbox View (Persistent backdrop/header while browsing photos) */}
        <AnimatePresence>
          {selectedPhoto && (
            <PhotoLightboxView
              key="photo-lightbox"
              photo={selectedPhoto}
              prevPhoto={activePhotoIndex > 0 ? activeAlbumPhotos[activePhotoIndex - 1] : null}
              nextPhoto={activePhotoIndex >= 0 && activePhotoIndex < activeAlbumPhotos.length - 1 ? activeAlbumPhotos[activePhotoIndex + 1] : null}
              caseId={caseData.caseId}
              husbandName={caseData.husbandName}
              onBack={handleCloseLightbox}
              onToggleInfo={() => setIsInfoOpen((prev) => !prev)}
              isInfoOpen={isInfoOpen}
              onTriggerEvidence={handleTriggerEvidence}
              onShowToast={showToast}
              originDelta={originDelta}
              hasPrev={activePhotoIndex > 0}
              hasNext={activePhotoIndex >= 0 && activePhotoIndex < activeAlbumPhotos.length - 1}
              onPrevPhoto={() => handleStepPhoto(-1)}
              onNextPhoto={() => handleStepPhoto(1)}
            />
          )}
        </AnimatePresence>

        {/* Photo Info & EXIF Drawer */}
        <AnimatePresence>
          {selectedPhoto && isInfoOpen && (
            <PhotoInfoDrawer
              key={`info-${selectedPhoto.id}`}
              photo={selectedPhoto}
              caseId={caseData.caseId}
              husbandName={caseData.husbandName}
              isOpen={true}
              onClose={() => setIsInfoOpen(false)}
              onNavigateToGrid={() => {
                setIsInfoOpen(false);
                setActivePhotoId(null);
              }}
              onTriggerEvidence={handleTriggerEvidence}
              onShowToast={showToast}
            />
          )}
        </AnimatePresence>

        {/* Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              key={toastMessage}
              initial={{ opacity: 0, y: -10, scale: 0.94, x: '-50%' }}
              animate={{ opacity: 1, y: 0, scale: 1, x: '-50%' }}
              exit={{ opacity: 0, y: -8, scale: 0.94, x: '-50%' }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-16 left-1/2 z-50 px-4 py-2 rounded-full bg-[#1C1C1E]/95 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-2xl"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Universal Evidence Modal */}
        {evidenceItem && (
          <UniversalEvidenceModal
            isOpen={Boolean(evidenceItem)}
            item={evidenceItem}
            onPinEvidence={(suspect) => {
              onTagSuspect(suspect, 'photos', evidenceItem.source);
              setEvidenceItem(null);
              showToast('Đã ghim bằng chứng vào Sổ tay thám tử');
            }}
            onClose={() => setEvidenceItem(null)}
          />
        )}
      </div>
    </MotionConfig>
  );
};

export const appDefinition: AppDefinition = {
  appId: 'photos',
  dataKeys: ['photos'],
  displayName: 'Photos',
  icon: IoImages,
  iconAsset: photosIcon,
  themeGradient: 'from-amber-400 via-rose-500 to-indigo-600',
  themeColor: '#000000',
  bottomBarColor: '#000000',
  notificationBadgeCount: 0,
  isLocked: false,
  component: PhotosApp,
};

export default PhotosApp;
