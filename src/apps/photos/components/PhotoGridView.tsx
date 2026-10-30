import React, { useState, useMemo } from 'react';
import {
  IoImages,
  IoFilterOutline,
  IoSearchOutline,
  IoLockClosedOutline,
  IoLockOpenOutline,
  IoPeopleOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoPlay,
  IoCloseOutline,
} from 'react-icons/io5';
import type { PhotoItem } from '../types';
import { PhotoPreview } from './PhotoPreview';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../../../features/investigation';

interface PhotoGridViewProps {
  photos: PhotoItem[];
  hiddenPhotos: PhotoItem[];
  hasHiddenPhotos: boolean;
  isHiddenUnlocked: boolean;
  caseId: string;
  husbandName: string;
  onSelectPhoto: (photoId: string) => void;
  onRequestUnlock: () => void;
  onTriggerEvidence: (item: UniversalEvidenceItem) => void;
  onShowToast: (message: string) => void;
  activeSegment: 'year' | 'month' | 'all';
  onChangeSegment: (segment: 'year' | 'month' | 'all') => void;
  isViewingHidden: boolean;
  onToggleViewHidden: (viewHidden: boolean) => void;
}

function calculateDateRange(photos: PhotoItem[]): string {
  if (photos.length === 0) return 'Hôm nay';
  const dates = photos.map((p) => p.date).filter(Boolean);
  if (dates.length === 0) return '1–15 thg 8, 2026';

  // If already formatted range or date string
  const first = dates[dates.length - 1];
  const last = dates[0];
  if (first === last) return last;
  return `${first} – ${last}`;
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
  activeSegment,
  onChangeSegment,
  isViewingHidden,
  onToggleViewHidden,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const displayedPhotos = useMemo(() => {
    let list = isViewingHidden ? hiddenPhotos : photos;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q)
          || p.description.toLowerCase().includes(q)
          || (p.locationTag && p.locationTag.toLowerCase().includes(q)),
      );
    }

    if (activeSegment === 'month') {
      // In month segment mode, represent aggregated/grouped monthly slice
      return list.slice(0, Math.min(list.length, 12));
    }
    if (activeSegment === 'year') {
      // In year segment mode, represent yearly highlighted slice
      return list.slice(0, Math.min(list.length, 6));
    }

    return list;
  }, [photos, hiddenPhotos, isViewingHidden, searchQuery, activeSegment]);

  const dateRangeSubtitle = useMemo(() => {
    if (activeSegment === 'year') return 'Năm 2026';
    if (activeSegment === 'month') return 'Tháng 10, 2026';
    return calculateDateRange(photos);
  }, [photos, activeSegment]);

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
                className="px-3 py-1.5 rounded-full bg-[#1C1C1E] text-xs font-semibold text-[#2979FF] hover:bg-white/10 min-h-[44px] flex items-center justify-center transition-all"
              >
                Tất cả ảnh
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onShowToast('Đang hiển thị toàn bộ thư viện')}
                  className="w-9 h-9 rounded-full bg-[#1C1C1E] flex items-center justify-center text-white/80 hover:text-white min-w-[44px] min-h-[44px] transition-all"
                  aria-label="Lọc thư viện"
                >
                  <IoFilterOutline className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onShowToast('Chế độ chọn không khả dụng trong chế độ điều tra')}
                  className="px-3.5 py-1.5 rounded-full bg-[#1C1C1E] text-xs font-semibold text-white/90 hover:text-white min-h-[44px] flex items-center justify-center transition-all"
                >
                  Chọn
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Input Bar */}
        {isSearchOpen && (
          <div className="mt-2.5 flex items-center gap-2 bg-[#1C1C1E] rounded-xl px-3 py-1.5 border border-white/10">
            <IoSearchOutline className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm ảnh, địa điểm..."
              className="w-full bg-transparent text-sm text-white focus:outline-hidden placeholder:text-slate-500"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-slate-400 hover:text-white"
              >
                <IoCloseOutline className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Scrollable Photostream & Collections */}
      <main className="flex-1 overflow-y-auto pb-24">
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
                item={{
                  title: photo.title,
                  subtitle: photo.date,
                  snippet: photo.description || photo.title,
                  suspectToTag: photo.suspectName || husbandName,
                  source: {
                    caseId,
                    recordId: photo.id,
                    clueRefId: photo.clueRefId,
                    title: photo.title,
                    snippet: photo.description || photo.title,
                    kind: 'photo',
                  },
                }}
                onTriggerEvidence={onTriggerEvidence}
              >
                <div
                  onClick={() => onSelectPhoto(photo.id)}
                  className="relative aspect-square overflow-hidden bg-[#1C1C1E] cursor-pointer active:opacity-85 select-none"
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
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
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

              {/* Trip Places Collection */}
              <div
                onClick={() => onShowToast('Đang tải bản đồ các địa điểm chụp ảnh')}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2C2C2E] flex items-center justify-center text-emerald-400">
                    <IoLocationOutline className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-ios-subheadline font-semibold text-white">Chuyến đi đáng ngờ</h3>
                    <p className="text-ios-caption-2 text-slate-400">2 địa điểm gắn thẻ GPS</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400">&gt;</span>
              </div>

              {/* Events Collection */}
              <div
                onClick={() => onShowToast('Lịch sử ngày kỷ niệm và sự kiện')}
                className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
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
                  className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
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
      </main>

      {/* Floating Frosted Bottom Navigation Capsule */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1C1C1E]/80 backdrop-blur-md border border-white/10 shadow-2xl">
        <button
          type="button"
          onClick={() => {
            onToggleViewHidden(false);
            onChangeSegment('all');
          }}
          className="p-1.5 text-[#2979FF] hover:opacity-80 transition-opacity"
          aria-label="Thư viện ảnh"
        >
          <IoImages className="w-5 h-5" />
        </button>

        <div className="h-4 w-px bg-white/20 mx-0.5" />

        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1 bg-black/40 rounded-full p-0.5 border border-white/5">
          <button
            type="button"
            onClick={() => onChangeSegment('year')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              activeSegment === 'year'
                ? 'bg-white/20 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Năm
          </button>
          <button
            type="button"
            onClick={() => onChangeSegment('month')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              activeSegment === 'month'
                ? 'bg-white/20 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tháng
          </button>
          <button
            type="button"
            onClick={() => onChangeSegment('all')}
            className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
              activeSegment === 'all'
                ? 'bg-white/20 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tất cả
          </button>
        </div>

        <div className="h-4 w-px bg-white/20 mx-0.5" />

        {/* Search Icon Button */}
        <button
          type="button"
          onClick={() => setIsSearchOpen((prev) => !prev)}
          className={`p-1.5 rounded-full transition-colors ${
            isSearchOpen ? 'text-[#2979FF] bg-white/10' : 'text-slate-300 hover:text-white'
          }`}
          aria-label="Tìm kiếm ảnh"
        >
          <IoSearchOutline className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
