import React, { useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  IoFilterOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoPeopleOutline,
  IoCalendarOutline,
  IoPlay,
} from 'react-icons/io5';
import type { PhotoItem } from '../types';
import { buildPhotoEvidenceItem } from '../data';
import { PhotoPreview } from './PhotoPreview';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../../../features/investigation';

interface PhotoGridViewProps {
  photos: PhotoItem[];
  hiddenPhotos: PhotoItem[];
  hasHiddenPhotos: boolean;
  isHiddenUnlocked: boolean;
  caseId: string;
  husbandName: string;
  onSelectPhoto: (photoId: string, originElement?: HTMLElement | null) => void;
  onRequestUnlock: () => void;
  onTriggerEvidence: (item: UniversalEvidenceItem) => void;
  onShowToast: (message: string) => void;
  isViewingHidden: boolean;
  onToggleViewHidden: (viewHidden: boolean) => void;
}

const IOS_EASE = [0.4, 0, 0.2, 1] as const;

function calculateDateRange(photos: PhotoItem[]): string {
  if (photos.length === 0) return 'Hôm nay';
  const dates = photos.map((p) => p.date).filter(Boolean);
  if (dates.length === 0) return '1-15 thg 8, 2026';

  // If already formatted range or date string
  const first = dates[dates.length - 1];
  const last = dates[0];
  if (first === last) return last;
  return `${first} - ${last}`;
}

export const PhotoGridView: React.FC<PhotoGridViewProps> = ({
  photos,
  hiddenPhotos,
  hasHiddenPhotos,
  isHiddenUnlocked,
  caseId,
  husbandName,
  onSelectPhoto,
  onRequestUnlock,
  onTriggerEvidence,
  onShowToast,
  isViewingHidden,
  onToggleViewHidden,
}) => {
  const displayedPhotos = useMemo(() => {
    return isViewingHidden ? hiddenPhotos : photos;
  }, [photos, hiddenPhotos, isViewingHidden]);

  const dateRangeSubtitle = useMemo(() => {
    return calculateDateRange(photos);
  }, [photos]);

  return (
    <div className="flex-1 flex flex-col bg-[#000000] text-white overflow-hidden relative">
      {/* Top Header */}
      <header className="px-4 pt-3 pb-2 flex flex-col shrink-0 border-b border-white/10 bg-[#000000]/90 backdrop-blur-md z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isViewingHidden ? 'Mục bị ẩn' : 'Thư viện'}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {isViewingHidden ? `${hiddenPhotos.length} ảnh đã mở khóa` : dateRangeSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isViewingHidden ? (
              <button
                type="button"
                onClick={() => onToggleViewHidden(false)}
                className="px-3 py-1.5 rounded-full bg-[#1C1C1E] text-xs font-semibold text-[#2979FF] hover:bg-white/10 active:scale-[0.97] active:opacity-75 min-h-[44px] flex items-center justify-center transition-all duration-100"
              >
                Tất cả ảnh
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onShowToast('Đang hiển thị toàn bộ thư viện')}
                  className="w-9 h-9 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white/80 hover:text-white active:scale-[0.97] active:opacity-75 min-w-[44px] min-h-[44px] transition-all duration-100"
                  aria-label="Lọc thư viện"
                >
                  <IoFilterOutline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Chế độ chọn không khả dụng trong chế độ điều tra')}
                  className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] text-xs font-semibold text-white/90 hover:text-white active:scale-[0.97] active:opacity-75 min-h-[44px] flex items-center justify-center transition-all duration-100"
                >
                  Chọn
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Scrollable Photostream & Collections */}
      <main className="flex-1 overflow-y-auto pb-24">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={isViewingHidden ? 'hidden-album' : 'library-grid'}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: IOS_EASE }}
          >
            {isViewingHidden && (
              <div className="m-3 p-3 bg-amber-500/10 border border-[#FFC107]/30 rounded-xl text-xs text-amber-200">
                Thư mục ảnh bị ẩn đã mở khóa thành công.
              </div>
            )}

            {/* Photo Grid */}
            {displayedPhotos.length > 0 ? (
              <div className="grid grid-cols-3 gap-0.5 sm:gap-1 p-0.5">
                {displayedPhotos.map((photo) => (
                  <StoryEvidenceTarget
                    key={photo.id}
                    item={buildPhotoEvidenceItem(photo, caseId, husbandName, 'grid')}
                    onTriggerEvidence={onTriggerEvidence}
                  >
                    <div
                      data-photo-tile={photo.id}
                      onClick={(e) => onSelectPhoto(photo.id, e.currentTarget)}
                      className="relative aspect-square overflow-hidden bg-[#1C1C1E] cursor-pointer active:scale-[0.96] active:opacity-80 transition-transform duration-100 select-none"
                    >
                      <PhotoPreview photo={photo} className="w-full h-full object-cover" />

                      {/* Video Duration Badge */}
                      {photo.isVideo && photo.duration && (
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-ios-caption-2 font-medium text-white flex items-center gap-0.5 shadow-sm">
                          <IoPlay className="w-2.5 h-2.5" />
                          <span>{photo.duration}</span>
                        </span>
                      )}
                    </div>
                  </StoryEvidenceTarget>
                ))}
              </div>
            ) : (
              <div className="py-20 text-center text-ios-subheadline text-slate-400">
                Chưa có ảnh.
              </div>
            )}

            {/* Smart Collections Section (Shown in regular library view) */}
            {!isViewingHidden && (
              <section className="mt-8 px-4 space-y-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  BỘ SƯU TẬP THÔNG MINH
                </h2>

                <div className="rounded-2xl bg-[#1C1C1E] border border-white/10 divide-y divide-white/10 overflow-hidden">
                  {/* People Collection */}
                  <div
                    onClick={() => onShowToast('Đang nhận diện từ thư viện ảnh')}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 active:scale-[0.98] active:opacity-75 transition-all duration-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#2979FF]">
                        <IoPeopleOutline className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-ios-subheadline font-semibold text-white">Gương mặt & Đối tượng</h3>
                        <p className="text-ios-caption-2 text-slate-400">4 người nhận diện</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">&gt;</span>
                  </div>

                  {/* Events Collection */}
                  <div
                    onClick={() => onShowToast('Lịch sử ngày kỷ niệm và sự kiện')}
                    className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 active:scale-[0.98] active:opacity-75 transition-all duration-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#2C2C2E] flex items-center justify-center text-purple-400">
                        <IoCalendarOutline className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-ios-subheadline font-semibold text-white">Ngày kỷ niệm & Sự kiện</h3>
                        <p className="text-ios-caption-2 text-slate-400">Xem thêm sự kiện</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">&gt;</span>
                  </div>

                  {/* Hidden Album Entry Point */}
                  {hasHiddenPhotos && (
                    <div
                      onClick={() => {
                        if (!isHiddenUnlocked) {
                          onRequestUnlock();
                        } else {
                          onToggleViewHidden(true);
                        }
                      }}
                      className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 active:scale-[0.98] active:opacity-75 transition-all duration-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[#FFC107]">
                          {isHiddenUnlocked ? (
                            <IoLockOpenOutline className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <IoLockClosedOutline className="w-5 h-5 text-[#FFC107]" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-ios-subheadline font-semibold text-white">Mục bị ẩn</h3>
                            {!isHiddenUnlocked && (
                              <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-[#FFC107] text-ios-caption-2 font-bold">
                                Khóa PIN
                              </span>
                            )}
                          </div>
                          <p className="text-ios-caption-2 text-slate-400">
                            {isHiddenUnlocked
                              ? `Đã mở khóa • ${hiddenPhotos.length} ảnh`
                              : 'Chạm để mở khóa bằng mã PIN 4 số'}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">&gt;</span>
                    </div>
                  )}
                </div>
              </section>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};
