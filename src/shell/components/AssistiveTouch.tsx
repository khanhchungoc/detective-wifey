import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { IoBook, IoLayers, IoExpand, IoContract } from 'react-icons/io5';
import { useSwipeBack } from '../../shared/gestures/useSwipeBack';
import { assistiveMenuPosition } from './assistiveMenuPosition';
import { animateAssistiveMenu } from './assistiveMenuMotion';

interface AssistiveTouchProps {
  onGoHome: () => void;
  onOpenNotebook: () => void;
  onOpenLevelSelector: () => void;
  onRestartLevel: () => void;
  onToggleFullscreen: () => void;
  onOpenPwaGuide: () => void;
  isFullscreen: boolean;
  isIOS?: boolean;
}

const SIZE = 56;
const THROW_SPEED = 0.5; // CSS pixels per millisecond.
const THROW_SAMPLE_MS = 100;
const clamp = (value: number, max: number) => Math.max(0, Math.min(value, max));

export const AssistiveTouch: React.FC<AssistiveTouchProps> = ({
  onGoHome, onOpenNotebook, onOpenLevelSelector, onToggleFullscreen,
  onOpenPwaGuide, isFullscreen, isIOS = false,
}) => {
  const [isOpen, setOpen] = useState(false);
  const [isPresent, setPresent] = useState(false);
  const stopMenuMotion = useRef<(() => void) | undefined>(undefined);
  const menuTarget = useRef({ scale: 1, x: 0, y: 0 });
  const setIsOpen = useCallback((open: boolean) => {
    if (open) setPresent(true);
    setOpen(open);
  }, []);
  const position = useRef({ edge: 'right', y: 0.8 });
  const frame = useRef<number | null>(null);
  const settling = useRef<Animation | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const gesture = useRef<{
    id: number; startX: number; startY: number; offsetX: number; offsetY: number;
    moved: boolean; x: number; y: number;
    samples: { x: number; y: number; time: number }[];
    left: number; top: number; scaleX: number; scaleY: number; width: number; height: number;
  } | null>(null);
  const suppressClick = useRef(false);
  const menuSwipe = useSwipeBack({
    // Read the dragged position before the shared gesture restores its transform.
    onBack: () => flushSync(() => setIsOpen(false)), enabled: isOpen,
  });

  useLayoutEffect(() => {
    if (!isPresent) return;
    const button = buttonRef.current;
    const panel = panelRef.current;
    const overlay = overlayRef.current;
    if (!button || !panel || !overlay) return;
    const placeMenu = () => {
      const bounds = overlay.getBoundingClientRect();
      const anchor = button.getBoundingClientRect();
      const scaleX = bounds.width / overlay.offsetWidth || 1;
      const scaleY = bounds.height / overlay.offsetHeight || 1;
      const style = getComputedStyle(overlay);
      const placement = assistiveMenuPosition(
        { width: overlay.clientWidth, height: overlay.clientHeight },
        { x: (anchor.left - bounds.left) / scaleX, y: (anchor.top - bounds.top) / scaleY,
          width: anchor.width / scaleX, height: anchor.height / scaleY },
        { top: parseFloat(style.paddingTop) || 0, right: parseFloat(style.paddingRight) || 0,
          bottom: parseFloat(style.paddingBottom) || 0, left: parseFloat(style.paddingLeft) || 0 },
      );
      panel.style.left = `${placement.left}px`;
      panel.style.top = `${placement.top}px`;
      panel.style.width = `${placement.size}px`;
      panel.style.height = `${placement.size}px`;
      panel.style.transformOrigin = `${placement.originX}px ${placement.originY}px`;
      menuTarget.current = placement.closed;
    };
    placeMenu();
    const observer = new ResizeObserver(placeMenu);
    observer.observe(overlay);
    return () => observer.disconnect();
  }, [isPresent]);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!isPresent || !panel) { stopMenuMotion.current?.(); return; }
    stopMenuMotion.current = animateAssistiveMenu(panel, isOpen, () => setPresent(false), menuTarget.current, stopMenuMotion.current, buttonRef.current ?? undefined);
  }, [isOpen, isPresent]);

  useEffect(() => () => stopMenuMotion.current?.(), []);

  useLayoutEffect(() => {
    const button = buttonRef.current;
    const parent = button?.offsetParent as HTMLElement | null;
    if (!button || !parent) return;
    const place = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      if (gesture.current) suppressClick.current = true;
      gesture.current = null;
      delete button.dataset.dragging;
      settling.current?.cancel();
      const width = Math.max(0, parent.clientWidth - SIZE);
      const height = Math.max(0, parent.clientHeight - SIZE);
      button.style.transform = `translate3d(${position.current.edge === 'left' ? 0 : width}px, ${position.current.y * height}px, 0)`;
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(parent);
    return () => {
      observer.disconnect();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      settling.current?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!isPresent) return;
    panelRef.current?.querySelector('button')?.focus();
    return () => buttonRef.current?.focus();
  }, [isPresent]);

  const finishDrag = (event: React.PointerEvent<HTMLButtonElement>) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    const button = event.currentTarget;
    const { width, height } = current;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (current.moved) {
      const sample = current.samples.find(point => event.timeStamp - point.time <= THROW_SAMPLE_MS);
      const elapsed = sample ? event.timeStamp - sample.time : 0;
      const dx = sample ? event.clientX - sample.x : 0;
      const dy = sample ? event.clientY - sample.y : 0;
      const isThrow = event.type === 'pointerup' && elapsed > 0
        && Math.abs(dx) / elapsed >= THROW_SPEED && Math.abs(dx) > Math.abs(dy);
      const edge = isThrow ? (dx < 0 ? 'left' : 'right') : (current.x < width / 2 ? 'left' : 'right');
      position.current = { edge, y: height ? clamp(current.y, height) / height : 0 };
    }
    const from = `translate3d(${current.x}px, ${current.y}px, 0)`;
    const to = `translate3d(${position.current.edge === 'left' ? 0 : width}px, ${position.current.y * height}px, 0)`;
    button.style.transform = to;
    delete button.dataset.dragging;
    if (from !== to && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      settling.current = button.animate([{ transform: from }, { transform: to }],
        { duration: 200, easing: 'cubic-bezier(.32,.72,0,1)' });
    }
    suppressClick.current = current.moved || event.type === 'pointercancel';
    gesture.current = null;
  };

  const actions = [
    { label: 'Sổ tay của vợ', icon: <IoBook />, run: onOpenNotebook, place: 'col-start-2 row-start-1' },
    { label: isFullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình', icon: isFullscreen ? <IoContract /> : <IoExpand />, run: isIOS ? onOpenPwaGuide : onToggleFullscreen, place: 'col-start-1 row-start-2' },
    { label: 'Chọn màn chơi', icon: <IoLayers />, run: onOpenLevelSelector, place: 'col-start-3 row-start-2' },
    { label: 'Màn hình chính', icon: <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/70"><span className="h-7 w-7 rounded-full border-2 border-white bg-white/90 shadow-inner" /></span>, run: onGoHome, place: 'col-start-2 row-start-3' },
  ];

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Menu trợ năng"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-hidden={isPresent}
        tabIndex={isPresent ? -1 : 0}
        onPointerDown={event => {
          if (!event.isPrimary || event.button !== 0) return;
          event.stopPropagation();
          const button = event.currentTarget;
          const parent = button.offsetParent as HTMLElement | null;
          if (!parent) return;
          // Read the visible position before cancelling an in-flight throw.
          const rect = button.getBoundingClientRect();
          const bounds = parent.getBoundingClientRect();
          const scaleX = bounds.width / parent.offsetWidth || 1;
          const scaleY = bounds.height / parent.offsetHeight || 1;
          const x = (rect.left - bounds.left) / scaleX - parent.clientLeft;
          const y = (rect.top - bounds.top) / scaleY - parent.clientTop;
          settling.current?.cancel();
          button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
          gesture.current = {
            id: event.pointerId, startX: event.clientX, startY: event.clientY,
            offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top,
            moved: false, x, y, left: bounds.left + parent.clientLeft * scaleX,
            top: bounds.top + parent.clientTop * scaleY, scaleX, scaleY,
            width: Math.max(0, parent.clientWidth - SIZE), height: Math.max(0, parent.clientHeight - SIZE),
            samples: [{ x: event.clientX, y: event.clientY, time: event.timeStamp }],
          };
          suppressClick.current = false;
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={event => {
          const current = gesture.current;
          if (!current || current.id !== event.pointerId) return;
          current.samples = current.samples.filter(point => event.timeStamp - point.time <= THROW_SAMPLE_MS);
          current.samples.push({ x: event.clientX, y: event.clientY, time: event.timeStamp });
          if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 6) current.moved = true;
          if (!current.moved) return;
          current.x = clamp((event.clientX - current.left - current.offsetX) / current.scaleX, current.width);
          current.y = clamp((event.clientY - current.top - current.offsetY) / current.scaleY, current.height);
          if (frame.current === null) frame.current = requestAnimationFrame(() => {
            frame.current = null;
            if (!buttonRef.current || gesture.current !== current) return;
            buttonRef.current.dataset.dragging = '';
            buttonRef.current.style.transform = `translate3d(${current.x}px, ${current.y}px, 0)`;
          });
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onClick={event => {
          event.stopPropagation();
          if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
          setIsOpen(true);
        }}
        style={{
          left: 0,
          top: 0,
          touchAction: 'none',
        }}
        className={`glass-elevated absolute z-40 flex h-14 w-14 cursor-grab data-[dragging]:cursor-grabbing select-none items-center justify-center rounded-[18px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${isPresent ? 'pointer-events-none' : ''}`}
      >
        <span aria-hidden="true" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 shadow-[0_0_0_1px_rgba(0,0,0,0.25)]">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/50">
            <span className="h-7 w-7 rounded-full bg-white/90 shadow-sm" />
          </span>
        </span>
      </button>
      {isPresent && (
        <div
          ref={overlayRef}
          className="absolute inset-0 z-50"
          style={{
            paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
            paddingRight: 'max(16px, env(safe-area-inset-right, 0px))',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom, 0px))',
            paddingLeft: 'max(16px, env(safe-area-inset-left, 0px))',
          }}
          onClick={() => setIsOpen(false)}
          onKeyDown={event => {
            if (event.key === 'Escape') { event.stopPropagation(); setIsOpen(false); }
            if (event.key === 'Tab') {
              const buttons = panelRef.current?.querySelectorAll('button');
              if (!buttons?.length) return;
              const index = Array.from(buttons).indexOf(document.activeElement as HTMLButtonElement);
              event.preventDefault();
              buttons[(index + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus();
            }
          }}
        >
          <div
            {...menuSwipe}
            ref={panelRef}
            inert={!isOpen}
            role="dialog"
            aria-modal={isOpen}
            aria-hidden={!isOpen}
            aria-label="Menu trợ năng"
            onClick={event => event.stopPropagation()}
            className="glass-elevated assistive-menu-glass absolute grid aspect-square w-[280px] max-w-full grid-cols-3 grid-rows-3 gap-1 overflow-y-auto rounded-[32px] p-3 text-white"
          >
            {actions.map(action => (
              <button
                key={action.place}
                type="button"
                onClick={() => { setIsOpen(false); action.run(); }}
                className={`${action.place} flex min-h-11 min-w-11 flex-col items-center justify-center gap-2 rounded-2xl text-center text-[12px] leading-tight hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white active:bg-white/20`}
              >
                <span aria-hidden="true" className="flex h-10 w-10 items-center justify-center text-[36px]">{action.icon}</span>
                <span>{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
