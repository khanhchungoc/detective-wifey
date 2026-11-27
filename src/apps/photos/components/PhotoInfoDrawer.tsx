import React, { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useReducedMotion } from 'motion/react';
import {
  IoChevronForward,
  IoCloudOutline,
  IoCloseOutline,
  IoLocationSharp,
} from 'react-icons/io5';
import type { PhotoItem } from '../types';
import { buildPhotoEvidenceItem } from '../data';
import { PhotoPreview } from './PhotoPreview';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../../../features/investigation';

interface PhotoInfoDrawerProps {
  photo: PhotoItem;
  caseId: string;
  husbandName: string;
  isOpen: boolean;
  onClose: () => void;
  onNavigateToGrid?: () => void;
  onTriggerEvidence: (item: UniversalEvidenceItem) => void;
  onShowToast?: (message: string) => void;
}

const SHEET_SPRING = { type: 'spring' as const, stiffness: 360, damping: 34, mass: 0.9 };
const DISMISS_DISTANCE = 80;
const DISMISS_VELOCITY = 0.45;

function formatVietnameseDate(photo: PhotoItem): string {
  const raw = photo.timestamp || photo.date || '';

  // If already full Vietnamese string, return as-is
  if (raw.toLowerCase().includes('lúc') || raw.toLowerCase().includes('ngày')) {
    return raw;
  }

  // Check if matches DD/MM or DD/MM/YYYY
  const parts = raw.split('/');
  if (parts.length >= 2) {
    const day = parts[0];
    const month = parts[1];
    const year = parts[2] ? parts[2].split(' ')[0] : '2026';
    const timeMatch = raw.match(/(\d{1,2}:\d{2})/);
    const time = timeMatch ? timeMatch[1] : '18:37';
    return `Lúc ${time} Thứ Năm, ngày ${day} tháng ${month}, ${year}`;
  }

  return `Lúc 18:37 Thứ Năm, ngày 22 tháng 10, 2026`;
}

export const PhotoInfoDrawer: React.FC<PhotoInfoDrawerProps> = ({
  photo,
  caseId,
  husbandName,
  isOpen,
  onClose,
  onTriggerEvidence,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const sheetY = useMotionValue(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startY: number; lastY: number; lastTime: number; vy: number } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const { exif } = photo;
  const formattedDate = formatVietnameseDate(photo);
  const streetLabels = exif.streetLabels && exif.streetLabels.length >= 3
    ? exif.streetLabels
    : ['P. Nghĩa Đô', 'HỒ TÙNG MẬU', 'QL.32'];

  const evidenceItem = buildPhotoEvidenceItem(photo, caseId, husbandName, 'exif', formattedDate);

  const handleDragPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    if (scrollRef.current && scrollRef.current.scrollTop > 0) return;
    const now = performance.now();
    dragRef.current = { startY: event.clientY, lastY: event.clientY, lastTime: now, vy: 0 };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleDragPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag) return;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastTime);
    drag.vy = (event.clientY - drag.lastY) / dt;
    drag.lastY = event.clientY;
    drag.lastTime = now;
    const dy = Math.max(0, event.clientY - drag.startY);
    sheetY.set(dy);
  };

  const handleDragPointerEnd = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const drag = dragRef.current;
    if (!drag) return;
    dragRef.current = null;
    const dy = event.clientY - drag.startY;
    if (!cancelled && (dy >= DISMISS_DISTANCE || drag.vy > DISMISS_VELOCITY)) {
      onClose();
      return;
    }
    if (prefersReducedMotion) {
      sheetY.set(0);
    } else {
      animate(sheetY, 0, SHEET_SPRING);
    }
  };

  return (
    <motion.div
      data-photo-info-drawer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className="absolute inset-0 z-40 flex flex-col justify-end"
    >
      {/* Dimmed Scrim Backdrop */}
      <button
        type="button"
        aria-label="Đóng bảng thông tin"
        onClick={onClose}
        className="absolute inset-0 bg-black/45 backdrop-blur-xs cursor-pointer"
      />

      {/* Slide-Up Sheet */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Thông tin ảnh"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%', transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } }}
        transition={SHEET_SPRING}
        style={{ y: sheetY, willChange: 'transform' }}
        className="relative max-h-[85%] bg-[#000000] text-white rounded-t-3xl shadow-2xl border-t border-white/10 flex flex-col overflow-hidden"
      >
        {/* Top Grab Handle (Drag-Down to Dismiss) */}
        <div
          className="pt-3 pb-2 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing"
          style={{ touchAction: 'none' }}
          onPointerDown={handleDragPointerDown}
          onPointerMove={handleDragPointerMove}
          onPointerUp={(e) => handleDragPointerEnd(e, false)}
          onPointerCancel={(e) => handleDragPointerEnd(e, true)}
        >
          <div className="w-9 h-[5px] bg-white/35 rounded-full" />
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 pb-24 space-y-4">
          {/* Top Cropped Photo Preview */}
          <div className="h-28 w-full rounded-2xl overflow-hidden relative border border-white/10 shrink-0">
            <PhotoPreview photo={photo} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5 pointer-events-none">
              <span className="text-xs font-semibold text-white truncate">{photo.title}</span>
            </div>
            {/* Close button overlaid on top-right of the photo */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-2.5 right-2.5 z-10 w-9 h-9 min-w-[44px] min-h-[44px] rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:text-white transition-transform duration-100 active:scale-95 shadow-md"
              aria-label="Đóng bảng thông tin"
            >
              <IoCloseOutline className="w-5 h-5" />
            </button>
          </div>

          {/* Date, Time & Filename */}
          <div className="space-y-1">
            <p className="text-ios-subheadline font-semibold text-white">{formattedDate}</p>
            <div className="flex items-center gap-1.5 text-ios-caption-1 text-slate-400">
              <IoCloudOutline className="w-4 h-4 text-[#2979FF]" />
              <span>{exif.filename}</span>
            </div>
          </div>

          {/* Camera & Hardware EXIF Card */}
          <StoryEvidenceTarget
            item={evidenceItem}
            onTriggerEvidence={onTriggerEvidence}
          >
            <div className="bg-[#1C1C1E] rounded-2xl p-3.5 border border-white/10 space-y-2 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all duration-100">
              <div className="flex items-center justify-between">
                <span className="text-ios-subheadline font-bold text-white">{exif.device}</span>
                <span className="px-1.5 py-0.5 rounded bg-white/10 text-white/80 text-ios-caption-2 font-semibold tracking-wider">
                  {exif.format}
                </span>
              </div>
              <p className="text-ios-caption-1 text-slate-300">{exif.lens}</p>
              <p className="text-ios-caption-2 text-slate-400">{exif.resolution}</p>

              {/* 5-Column Exposure Metrics Divider Row */}
              <div className="pt-2 border-t border-white/10 grid grid-cols-5 gap-1 text-center text-ios-caption-2 text-slate-300">
                <div className="border-r border-white/10 last:border-0 pr-1">
                  <span className="block font-medium">ISO {exif.iso}</span>
                </div>
                <div className="border-r border-white/10 last:border-0 pr-1">
                  <span className="block font-medium">{exif.focalLength} mm</span>
                </div>
                <div className="border-r border-white/10 last:border-0 pr-1">
                  <span className="block font-medium">{exif.ev} ev</span>
                </div>
                <div className="border-r border-white/10 last:border-0 pr-1">
                  <span className="block font-medium">{exif.aperture}</span>
                </div>
                <div>
                  <span className="block font-medium">{exif.shutterSpeed}</span>
                </div>
              </div>
            </div>
          </StoryEvidenceTarget>

          {/* Geotag Map Card */}
          <StoryEvidenceTarget
            item={evidenceItem}
            onTriggerEvidence={onTriggerEvidence}
          >
            <div className="bg-[#1C1C1E] rounded-2xl p-3.5 border border-white/10 space-y-3 cursor-pointer hover:bg-white/5 active:scale-[0.98] transition-all duration-100">
              {/* Vector Map Preview */}
              <div className="h-28 rounded-xl bg-[#2C2C2E] relative overflow-hidden border border-white/10 flex items-center justify-center">
                {/* Stylized Street Grid Lines */}
                <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="35%" x2="100%" y2="35%" stroke="#8E8E93" strokeWidth="4" />
                  <line x1="0" y1="70%" x2="100%" y2="70%" stroke="#8E8E93" strokeWidth="6" />
                  <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#8E8E93" strokeWidth="5" />
                  <line x1="75%" y1="0" x2="75%" y2="100%" stroke="#8E8E93" strokeWidth="3" />
                  <line x1="0" y1="0" x2="100%" y2="100%" stroke="#636366" strokeWidth="2" strokeDasharray="4 4" />
                </svg>

                {/* Street Labels */}
                <span className="absolute top-2 left-3 text-ios-caption-2 font-bold text-white/60 tracking-wider">
                  {streetLabels[0]}
                </span>
                <span className="absolute bottom-2 left-3 text-ios-caption-2 font-bold text-white/60 tracking-wider">
                  {streetLabels[1]}
                </span>
                <span className="absolute top-2 right-3 text-ios-caption-2 font-bold text-white/60 tracking-wider">
                  {streetLabels[2]}
                </span>

                {/* Custom Marker Pin with Thumbnail */}
                <div className="relative flex flex-col items-center drop-shadow-lg z-10">
                  <div className="w-9 h-9 rounded-full ring-2 ring-white overflow-hidden bg-black shadow-lg">
                    <PhotoPreview photo={photo} className="w-full h-full object-cover" />
                  </div>
                  <IoLocationSharp className="w-5 h-5 text-rose-500 -mt-1.5" />
                </div>
              </div>

              {/* Location Row */}
              <div className="flex items-center gap-1.5 min-w-0 text-ios-subheadline">
                <span className="font-semibold text-white truncate">{exif.locationName}</span>
                <IoChevronForward className="w-4 h-4 text-slate-400 shrink-0" />
              </div>
            </div>
          </StoryEvidenceTarget>
        </div>
      </motion.div>
    </motion.div>
  );
};
