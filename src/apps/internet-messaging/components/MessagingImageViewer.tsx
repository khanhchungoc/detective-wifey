import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { IoAdd, IoClose, IoRemove, IoRefreshOutline } from 'react-icons/io5';
import { useSwipeBack } from '../../../shared/gestures/useSwipeBack';
import { StoryEvidenceTarget, type UniversalEvidenceItem } from '../../../features/investigation';
import { chatImage } from '../assets/chatImages';
import type { MessagingMessage } from '../types';
import { clampImage, fitImage, zoomImage, type ImageBounds, type ImageView } from './imageViewport';

interface Props {
  message: MessagingMessage;
  contactName: string;
  onClose: () => void;
  onEvidence: (item: UniversalEvidenceItem) => void;
  suspended?: boolean;
  caseId?: string;
  conversationId?: string;
}

export function MessagingImageViewer({ message, contactName, onClose, onEvidence, suspended = false, caseId, conversationId }: Props) {
  const [view, setView] = useState(fitImage);
  const [manipulating, setManipulating] = useState(false);
  const viewRef = useRef(view);
  const dialog = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const image = useRef<HTMLImageElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const multiTouch = useRef(false);
  const pressStart = useRef({ x: 0, y: 0 });
  const bounds = useCallback((): ImageBounds => ({ width: viewport.current?.clientWidth ?? 0, height: viewport.current?.clientHeight ?? 0,
    imageWidth: image.current?.clientWidth ?? 0, imageHeight: image.current?.clientHeight ?? 0 }), []);
  const update = useCallback((next: ImageView) => { viewRef.current = next; setView(next); }, []);
  const scale = useCallback((zoom: number, x = 0, y = 0) => update(zoomImage(viewRef.current, zoom, { x, y }, bounds())), [bounds, update]);
  const swipe = useSwipeBack({ onBack: onClose, enabled: !suspended && view.zoom === 1 });

  useLayoutEffect(() => {
    if (suspended) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButton.current?.focus();
    return () => { if (previous?.isConnected) previous.focus(); };
  }, [suspended]);

  useEffect(() => {
    const stage = viewport.current;
    if (!stage || suspended) return;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      const rect = stage.getBoundingClientRect();
      scale(viewRef.current.zoom * Math.exp(-Math.max(-100, Math.min(100, event.deltaY)) * 0.003), event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2);
    };
    const resize = new ResizeObserver(() => update(clampImage(viewRef.current, bounds())));
    resize.observe(stage);
    stage.addEventListener('wheel', wheel, { passive: false });
    return () => { stage.removeEventListener('wheel', wheel); resize.disconnect(); };
  }, [scale, bounds, update, suspended]);

  const release = (id: number) => {
    pointers.current.delete(id);
    if (!pointers.current.size) setManipulating(false);
  };

  const viewer = <div {...swipe} ref={dialog} role="dialog" aria-label="Xem ảnh" aria-modal={!suspended} aria-hidden={suspended} inert={suspended}
    className="absolute inset-0 z-50 overflow-hidden bg-black text-white animate-fadeIn"
    onKeyDown={event => {
      if (suspended) return;
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
      if (event.key === 'Tab') {
        const controls = dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]');
        if (!controls?.length) return;
        const index = Array.from(controls).indexOf(document.activeElement as HTMLElement);
        event.preventDefault();
        controls[(index + (event.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
      }
    }}>
    <div ref={viewport} role="region" aria-label="Ảnh có thể phóng to" tabIndex={0}
      className="absolute inset-0 flex items-center justify-center overflow-hidden bg-black outline-offset-[-2px]"
      style={{ touchAction: 'none', cursor: view.zoom > 1 ? 'grab' : 'zoom-in' }}
      onDoubleClick={event => { const rect = event.currentTarget.getBoundingClientRect(); scale(viewRef.current.zoom > 1 ? 1 : 2.5, event.clientX - rect.left - rect.width / 2, event.clientY - rect.top - rect.height / 2); }}
      onTouchStart={event => {
        if (event.touches.length > 1) {
          multiTouch.current = true;
          setManipulating(true);
        }
        if (multiTouch.current || viewRef.current.zoom > 1) {
          event.stopPropagation();
        }
      }}
      onTouchMove={event => {
        if (event.touches.length > 1) {
          multiTouch.current = true;
          setManipulating(true);
        }
        if (multiTouch.current || viewRef.current.zoom > 1) {
          event.stopPropagation();
        }
      }}
      onTouchEnd={event => {
        if (multiTouch.current || viewRef.current.zoom > 1) event.stopPropagation();
        if (event.touches.length <= 1) {
          multiTouch.current = false;
        }
        if (event.touches.length === 0 && pointers.current.size === 0) {
          setManipulating(false);
        }
      }}
      onTouchCancel={() => {
        multiTouch.current = false;
        if (pointers.current.size === 0) setManipulating(false);
      }}
      onPointerDown={event => {
        if (suspended || event.button !== 0) return;
        if (!pointers.current.size) pressStart.current = { x: event.clientX, y: event.clientY };
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (pointers.current.size > 1) setManipulating(true);
        if (viewRef.current.zoom > 1) event.stopPropagation();
      }}
      onPointerMove={event => {
        const previous = pointers.current.get(event.pointerId);
        if (!previous || suspended) return;
        const before = [...pointers.current.values()];
        pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
        const after = [...pointers.current.values()];
        if (Math.hypot(event.clientX - pressStart.current.x, event.clientY - pressStart.current.y) > 6 || before.length > 1) {
          setManipulating(true);
        }
        if (before.length === 2) {
          const distance = (points: typeof before) => Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
          const rect = event.currentTarget.getBoundingClientRect();
          const oldCenter = { x: (before[0].x + before[1].x) / 2, y: (before[0].y + before[1].y) / 2 };
          const newCenter = { x: (after[0].x + after[1].x) / 2, y: (after[0].y + after[1].y) / 2 };
          const next = zoomImage(viewRef.current, viewRef.current.zoom * distance(after) / Math.max(1, distance(before)), { x: oldCenter.x - rect.left - rect.width / 2, y: oldCenter.y - rect.top - rect.height / 2 }, bounds());
          update(clampImage({ ...next, x: next.x + newCenter.x - oldCenter.x, y: next.y + newCenter.y - oldCenter.y }, bounds()));
          event.stopPropagation();
        } else if (viewRef.current.zoom > 1) {
          update(clampImage({ ...viewRef.current, x: viewRef.current.x + event.clientX - previous.x, y: viewRef.current.y + event.clientY - previous.y }, bounds()));
          event.stopPropagation();
        }
      }}
      onPointerUp={event => {
        if (viewRef.current.zoom > 1 || multiTouch.current) event.stopPropagation();
        release(event.pointerId);
      }}
      onPointerCancel={event => {
        event.stopPropagation();
        release(event.pointerId);
      }}
      onLostPointerCapture={event => release(event.pointerId)}
      onKeyDown={event => {
        if (event.key === '+' || event.key === '=') { event.preventDefault(); scale(viewRef.current.zoom + 0.5); }
        if (event.key === '-') { event.preventDefault(); scale(viewRef.current.zoom - 0.5); }
        if (event.key === '0') { event.preventDefault(); update(fitImage); }
        if (event.key.startsWith('Arrow') && viewRef.current.zoom > 1) {
          event.preventDefault();
          update(clampImage({ ...viewRef.current, x: viewRef.current.x + (event.key === 'ArrowLeft' ? 40 : event.key === 'ArrowRight' ? -40 : 0), y: viewRef.current.y + (event.key === 'ArrowUp' ? 40 : event.key === 'ArrowDown' ? -40 : 0) }, bounds()));
        }
      }}>
      <StoryEvidenceTarget disabled={manipulating || suspended} className="flex h-full w-full items-center justify-center"
        item={{
          title: contactName,
          snippet: message.imageAlt || message.text,
          subtitle: `${contactName} · ${message.time}`,
          suspectToTag: contactName,
          kind: chatImage(message.imageAsset) ? 'photo' : 'message',
          conversationId,
          visibleAlias: contactName,
          eventTime: message.time,
          imageSrc: chatImage(message.imageAsset),
          source: caseId ? {
            caseId,
            recordId: message.id,
            clueRefId: message.clueRefId,
            kind: chatImage(message.imageAsset) ? 'photo' : 'message',
            conversationId,
            visibleAlias: contactName,
            eventTime: message.time,
            title: contactName,
            snippet: message.imageAlt || message.text,
            imageSrc: chatImage(message.imageAsset),
          } : undefined,
        }}
        onTriggerEvidence={onEvidence}>
        <img ref={image} src={chatImage(message.imageAsset)} alt={message.imageAlt || message.text} draggable={false}
          onLoad={() => update(clampImage(viewRef.current, bounds()))}
          className="max-h-full max-w-full select-none object-contain"
          style={{ transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`, transformOrigin: 'center' }} />
      </StoryEvidenceTarget>
    </div>
    <button ref={closeButton} type="button" aria-label="Đóng xem ảnh" onClick={onClose}
      className="absolute z-10 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white"
      style={{ top: 'max(16px, env(safe-area-inset-top, 0px))', right: 'max(16px, env(safe-area-inset-right, 0px))' }}><IoClose className="h-6 w-6" /></button>
    <div className="absolute left-1/2 z-10 flex -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-black/60 px-2 text-white"
      style={{ bottom: 'max(16px, env(safe-area-inset-bottom, 0px))' }} aria-label="Điều khiển thu phóng">
      <button type="button" aria-label="Thu nhỏ" disabled={view.zoom <= 1} onClick={() => scale(viewRef.current.zoom - 0.5)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-40"><IoRemove /></button>
      <output className="min-w-14 text-center text-ios-subheadline tabular-nums" aria-live="polite">{Math.round(view.zoom * 100)}%</output>
      <button type="button" aria-label="Phóng to" disabled={view.zoom >= 5} onClick={() => scale(viewRef.current.zoom + 0.5)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15 disabled:opacity-40"><IoAdd /></button>
      <button type="button" aria-label="Vừa màn hình" onClick={() => update(fitImage)} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/15"><IoRefreshOutline /></button>
    </div>
    <p className="sr-only">{contactName} · {message.time}. Chụm hai ngón hoặc chạm hai lần để thu phóng. Kéo để xem chi tiết.</p>
  </div>;
  return viewer;
}

export const ZolaImageViewer = MessagingImageViewer;
export default MessagingImageViewer;
