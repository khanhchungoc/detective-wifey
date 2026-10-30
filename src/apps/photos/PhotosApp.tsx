import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { IoImages } from 'react-icons/io5';
import type { VirtualAppProps, AppDefinition } from '../../shared/contracts/app-contracts';
import { readPhotosData } from './data';
import { PhotoGridView } from './components/PhotoGridView';
import { PhotoLightboxView } from './components/PhotoLightboxView';
import { PhotoInfoDrawer } from './components/PhotoInfoDrawer';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { UniversalEvidenceModal, type UniversalEvidenceItem } from '../../features/investigation';
import photosIcon from './assets/photos-icon.svg';

export const PhotosApp: React.FC<VirtualAppProps> = ({
  caseData,
  onTagSuspect,
  onReturnHome,
  onRequestUnlock,
  unlockedChallenges,
}) => {
  const photosData = useMemo(() => readPhotosData(caseData.appsData?.photos), [caseData.appsData?.photos]);

  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'year' | 'month' | 'all'>('all');
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
  const selectedPhoto = useMemo(() => {
    if (!activePhotoId) return null;
    return photosData.photos.find((p) => p.id === activePhotoId) || null;
  }, [activePhotoId, photosData.photos]);

  // Toast handler
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 2000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

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

  const rootSwipeHandlers = useSwipeBack({ onBack: handleRootBack });

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
    <div
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
        onSelectPhoto={(id) => {
          setActivePhotoId(id);
          setIsInfoOpen(false);
        }}
        onRequestUnlock={handleRequestUnlock}
        onTriggerEvidence={handleTriggerEvidence}
        onShowToast={showToast}
        activeSegment={activeSegment}
        onChangeSegment={setActiveSegment}
        isViewingHidden={isViewingHidden}
        onToggleViewHidden={setIsViewingHidden}
      />

      {/* Forensic Lightbox View (When photo selected) */}
      {selectedPhoto && (
        <PhotoLightboxView
          photo={selectedPhoto}
          caseId={caseData.caseId}
          husbandName={caseData.husbandName}
          onBack={() => {
            setActivePhotoId(null);
            setIsInfoOpen(false);
          }}
          onToggleInfo={() => setIsInfoOpen((prev) => !prev)}
          isInfoOpen={isInfoOpen}
          onTriggerEvidence={handleTriggerEvidence}
          onShowToast={showToast}
        />
      )}

      {/* Photo Info & EXIF Drawer */}
      {selectedPhoto && (
        <PhotoInfoDrawer
          photo={selectedPhoto}
          caseId={caseData.caseId}
          husbandName={caseData.husbandName}
          isOpen={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          onNavigateToGrid={() => {
            setIsInfoOpen(false);
            setActivePhotoId(null);
          }}
          onTriggerEvidence={handleTriggerEvidence}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full bg-[#1C1C1E]/95 backdrop-blur-md border border-white/20 text-xs font-semibold text-white shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          {toastMessage}
        </div>
      )}

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
