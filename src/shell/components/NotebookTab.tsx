import { useLayoutEffect, useRef } from 'react';
import { IoBookOutline, IoChevronForwardOutline } from 'react-icons/io5';
import { NOTEBOOK_CLOSED_TRANSFORM, NOTEBOOK_SLIDE_EASING, NOTEBOOK_OPEN_DURATION_MS, NOTEBOOK_CLOSE_DURATION_MS, animateOverlay } from '../../shared/motion/anchoredOverlay';
import {
  clampFloatingPoint, floatingDockPosition, floatingVelocity, isFloatingDrag, projectFloatingDock,
  notebookPullOffset, notebookTabPullX, shouldCommitNotebookPull,
  FLOATING_SAMPLE_MS, FLOATING_SETTLE_MS,
  NOTEBOOK_TAB_WIDTH, NOTEBOOK_TAB_HEIGHT, NOTEBOOK_FLOAT_SIZE,
  type DockEdge, type FloatingBounds, type FloatingPoint, type FloatingSample,
} from './floatingControlPosition';

const transform = (point: FloatingPoint) => `translate3d(${point.x}px, ${point.y}px, 0)`;

export function NotebookTab({
  open,
  hidden = false,
  onOpen,
  onClose,
}: {
  open: boolean;
  hidden?: boolean;
  onOpen: () => void;
  onClose?: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const position = useRef<{ fraction: number }>({ fraction: .68 });
  const bounds = useRef<FloatingBounds>({ left: 0, right: 0, top: 0, bottom: 0 });
  const settling = useRef<Animation | null>(null);
  const frame = useRef<number | null>(null);
  const openRef = useRef(open);
  const lastSettledOpen = useRef(open);
  openRef.current = open;
  const gesture = useRef<{
    id: number; startX: number; startY: number; origin: FloatingPoint; point: FloatingPoint;
    scaleX: number; scaleY: number; moved: boolean; mode: 'vertical' | 'pull' | null;
    surfaceWidth: number; pullOffsetX: number; overlay: HTMLElement | null; backdrop: HTMLElement | null;
    screen: HTMLElement | null; appSurface: HTMLElement | null;
    samples: FloatingSample[];
  } | null>(null);
  const suppressClick = useRef(false);

  useLayoutEffect(() => {
    const element = ref.current;
    const parent = element?.offsetParent as HTMLElement | null;
    if (!element || !parent) return;
    const place = () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = null;
      if (gesture.current) suppressClick.current = true;
      gesture.current = null;
      settling.current?.cancel();
      const style = getComputedStyle(parent);
      const scaleY = parent.getBoundingClientRect().height / parent.offsetHeight || 1;
      const statusHeight = (parent.querySelector('.phone-system-status')?.getBoundingClientRect().height ?? 0) / scaleY;
      const left = parseFloat(style.paddingLeft) || 0;
      const top = Math.max(59, statusHeight, parseFloat(style.paddingTop) || 0) + 8;
      bounds.current = { left, right: Math.max(left, parent.clientWidth - NOTEBOOK_TAB_WIDTH - (parseFloat(style.paddingRight) || 0)), top,
        bottom: Math.max(top, parent.clientHeight - NOTEBOOK_TAB_HEIGHT - Math.max(34, parseFloat(style.paddingBottom) || 0) - 8) };
      const edge: DockEdge = openRef.current ? 'left' : 'right';
      element.style.transform = transform(floatingDockPosition(edge, position.current.fraction, bounds.current));
      element.dataset.edge = edge;
      element.dataset.floating = 'false';
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(parent);
    return () => {
      observer.disconnect();
      settling.current?.cancel();
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      if (gesture.current?.screen) {
        delete gesture.current.screen.dataset?.notebookDragging;
        gesture.current.screen.style.removeProperty('transition');
        gesture.current.screen.style.removeProperty('transform');
        gesture.current.screen.style.removeProperty('border-radius');
        gesture.current.screen.style.removeProperty('outline');
        gesture.current.screen.style.removeProperty('box-shadow');
      }
    };
  }, []);

  const clearScreenOverrides = (screen: HTMLElement | null, appSurface: HTMLElement | null) => {
    if (screen?.dataset) delete screen.dataset.notebookDragging;
    screen?.style.removeProperty('transition');
    screen?.style.removeProperty('transform');
    screen?.style.removeProperty('border-radius');
    screen?.style.removeProperty('outline');
    screen?.style.removeProperty('box-shadow');
    appSurface?.style.removeProperty('transition');
    appSurface?.style.removeProperty('border-radius');
  };

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || gesture.current || lastSettledOpen.current === open) return;
    lastSettledOpen.current = open;
    const parent = element.offsetParent as HTMLElement | null;
    if (typeof parent?.querySelector === 'function') {
      clearScreenOverrides(
        parent.querySelector<HTMLElement>('[data-phone-screen]'),
        parent.querySelector<HTMLElement>('[data-app-surface]'),
      );
    }
    const edge: DockEdge = open ? 'left' : 'right';
    const to = transform(floatingDockPosition(edge, position.current.fraction, bounds.current));
    const from = element.style.transform || getComputedStyle(element).transform;
    settling.current?.cancel();
    element.dataset.edge = edge;
    element.dataset.floating = 'false';
    element.style.transform = to;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduced && element.animate && from && from !== 'none' && from !== to) {
      settling.current = element.animate([{ transform: from }, { transform: to }],
        { duration: open ? NOTEBOOK_OPEN_DURATION_MS : NOTEBOOK_CLOSE_DURATION_MS, easing: NOTEBOOK_SLIDE_EASING });
    }
  }, [open]);

  const finish = (event: React.PointerEvent<HTMLButtonElement>) => {
    const active = gesture.current;
    if (!active || active.id !== event.pointerId) return;
    gesture.current = null;
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    const dx = (event.clientX - active.startX) / active.scaleX;
    const dy = (event.clientY - active.startY) / active.scaleY;
    const cancelled = event.type !== 'pointerup';
    active.moved ||= isFloatingDrag(dx, dy);
    suppressClick.current = active.moved || cancelled;
    if (!active.moved && !cancelled) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const velocity = floatingVelocity(active.samples, { x: event.clientX / active.scaleX, y: event.clientY / active.scaleY, time: event.timeStamp });
    const button = event.currentTarget;
    const from = transform(active.point);
    settling.current?.cancel();
    button.dataset.floating = 'false';

    if (active.mode === 'pull') {
      const offsetX = notebookPullOffset(active.surfaceWidth, dx, open);
      if (active.overlay) {
        active.overlay.style.transform = `translate3d(${Number(offsetX.toFixed(2))}px, 0, 0)`;
      }
      const shouldOpen = !cancelled && shouldCommitNotebookPull(offsetX, active.surfaceWidth, velocity.x, open);
      const targetEdge: DockEdge = shouldOpen ? 'left' : 'right';
      const dockPoint = floatingDockPosition(targetEdge, position.current.fraction, bounds.current);
      const to = transform(dockPoint);
      lastSettledOpen.current = shouldOpen;
      button.dataset.edge = targetEdge;
      button.style.transform = to;
      if (!reduced && button.animate) settling.current = button.animate([{ transform: from }, { transform: to }],
        { duration: shouldOpen ? NOTEBOOK_OPEN_DURATION_MS : NOTEBOOK_CLOSE_DURATION_MS, easing: NOTEBOOK_SLIDE_EASING });

      const backdrop = active.backdrop;
      const duration = shouldOpen ? NOTEBOOK_OPEN_DURATION_MS : NOTEBOOK_CLOSE_DURATION_MS;
      if (backdrop) {
        backdrop.style.transition = `opacity ${duration}ms ${NOTEBOOK_SLIDE_EASING}`;
        backdrop.style.opacity = shouldOpen ? '1' : '0';
      }

      const appSurface = active.appSurface;
      if (active.screen) {
        if (active.screen.dataset) delete active.screen.dataset.notebookDragging;
        active.screen.style.transition = `transform ${duration}ms ${NOTEBOOK_SLIDE_EASING}`;
        if (shouldOpen) {
          active.screen.style.transform = 'translate3d(0, 0, 0) scale(0.94)';
          active.screen.style.borderRadius = '28px';
          active.screen.style.outline = '1px solid rgba(255, 255, 255, 0.15)';
          active.screen.style.boxShadow = '0 18px 42px rgba(0, 0, 0, 0.55)';
        } else {
          active.screen.style.transform = 'translate3d(0, 0, 0) scale(1)';
          active.screen.style.borderRadius = '0px';
          active.screen.style.outline = 'none';
          active.screen.style.boxShadow = 'none';
        }
      }
      if (appSurface) {
        appSurface.style.borderRadius = shouldOpen ? '28px' : '0px';
      }

      const attachScreenCleanup = () => {
        const screenEl = active.screen;
        if (!screenEl?.addEventListener) return;
        const onEnd = (e: Event) => {
          if (e.target !== screenEl || (e as TransitionEvent).propertyName !== 'transform') return;
          screenEl.removeEventListener?.('transitionend', onEnd);
          clearScreenOverrides(screenEl, appSurface);
        };
        screenEl.addEventListener('transitionend', onEnd);
      };

      if (shouldOpen && !open) {
        attachScreenCleanup();
        onOpen();
      } else if (!shouldOpen && open) {
        attachScreenCleanup();
        onClose?.();
      } else if (!shouldOpen && !open && active.overlay) {
        const overlay = active.overlay;
        animateOverlay(overlay, false, NOTEBOOK_CLOSED_TRANSFORM, () => {
          overlay.style.opacity = '0';
          if (backdrop) {
            backdrop.style.transition = `opacity ${NOTEBOOK_CLOSE_DURATION_MS}ms ${NOTEBOOK_SLIDE_EASING}`;
            backdrop.style.opacity = '0';
          }
          clearScreenOverrides(active.screen, appSurface);
        }, undefined, reduced);
      } else if (shouldOpen && open && active.overlay) {
        animateOverlay(active.overlay, true, NOTEBOOK_CLOSED_TRANSFORM, () => {
          if (backdrop) {
            backdrop.style.transition = `opacity ${NOTEBOOK_OPEN_DURATION_MS}ms ${NOTEBOOK_SLIDE_EASING}`;
            backdrop.style.opacity = '1';
          }
          active.screen?.style.removeProperty('transition');
          appSurface?.style.removeProperty('transition');
        }, undefined, reduced);
      }
      return;
    }

    const edge: DockEdge = open ? 'left' : 'right';
    const edgeX = edge === 'left' ? bounds.current.left : bounds.current.right;
    const point = cancelled ? active.point : clampFloatingPoint({ x: edgeX, y: active.origin.y + dy }, bounds.current);
    const dock = projectFloatingDock(point, velocity, bounds.current, !cancelled && !reduced);
    position.current = { fraction: dock.fraction };
    const to = transform(floatingDockPosition(edge, dock.fraction, bounds.current));
    button.dataset.edge = edge;
    button.style.transform = to;
    if (!reduced && button.animate) settling.current = button.animate([{ transform: from }, { transform: to }],
      { duration: FLOATING_SETTLE_MS, easing: NOTEBOOK_SLIDE_EASING });
  };

  return <button ref={ref} data-notebook-tab data-edge={open ? 'left' : 'right'} data-floating="false" type="button"
    aria-label={open ? 'Đóng sổ tay của vợ' : 'Mở sổ tay của vợ'}
    aria-haspopup="dialog" aria-expanded={open} tabIndex={hidden ? -1 : 0} aria-hidden={hidden}
    title={open ? 'Sổ tay của vợ · Chạm hoặc kéo sang phải để đóng, kéo dọc để di chuyển' : 'Sổ tay của vợ · Chạm hoặc kéo sang trái để mở, kéo dọc để di chuyển'}
    className="group absolute left-0 top-0 z-[80] flex cursor-grab items-center justify-center text-white before:absolute before:inset-y-0 before:-left-4 before:-right-4 active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"
    style={{ width: NOTEBOOK_TAB_WIDTH, height: NOTEBOOK_TAB_HEIGHT, touchAction: 'none', opacity: hidden ? 0 : 1, pointerEvents: hidden ? 'none' : 'auto', willChange: 'transform', backfaceVisibility: 'hidden' }}
    onPointerDown={event => {
      if (event.button !== 0 || !event.isPrimary) return;
      event.stopPropagation();
      const button = event.currentTarget;
      const parent = button.offsetParent as HTMLElement | null;
      if (!parent) return;
      const rect = button.getBoundingClientRect(), host = parent.getBoundingClientRect();
      const scaleX = host.width / parent.offsetWidth || 1, scaleY = host.height / parent.offsetHeight || 1;
      const surfaceWidth = parent.offsetWidth || host.width || 390;
      if (bounds.current.right === 0 && surfaceWidth > 0) {
        bounds.current = { left: 0, right: Math.max(0, surfaceWidth - NOTEBOOK_TAB_WIDTH), top: 67, bottom: Math.max(67, (parent.offsetHeight || host.height || 844) - NOTEBOOK_TAB_HEIGHT - 42) };
      }
      const point = { x: (rect.left - host.left) / scaleX - parent.clientLeft, y: (rect.top - host.top) / scaleY - parent.clientTop };
      const overlay = typeof parent.querySelector === 'function' ? parent.querySelector<HTMLElement>('[data-notebook-overlay]') : null;
      const container = overlay?.parentElement;
      const backdrop = typeof container?.querySelector === 'function' ? container.querySelector<HTMLElement>('[data-notebook-backdrop]') : null;
      const screenCandidate = typeof parent.querySelector === 'function' ? parent.querySelector<HTMLElement>('[data-phone-screen]') : null;
      const screen = screenCandidate && screenCandidate !== overlay ? screenCandidate : null;
      const appSurface = typeof screen?.querySelector === 'function' ? screen.querySelector<HTMLElement>('[data-app-surface]') : null;
      settling.current?.cancel();
      button.style.transform = transform(point);
      gesture.current = {
        id: event.pointerId, startX: event.clientX, startY: event.clientY, origin: point, point,
        scaleX, scaleY, moved: false, mode: null, surfaceWidth, pullOffsetX: open ? 0 : surfaceWidth,
        overlay, backdrop, screen, appSurface,
        samples: [{ x: event.clientX / scaleX, y: event.clientY / scaleY, time: event.timeStamp }],
      };
      suppressClick.current = false;
      try { button.setPointerCapture(event.pointerId); } catch { /* synthetic pointer */ }
    }}
    onPointerMove={event => {
      const active = gesture.current;
      if (!active || active.id !== event.pointerId) return;
      event.stopPropagation?.();
      const dx = (event.clientX - active.startX) / active.scaleX, dy = (event.clientY - active.startY) / active.scaleY;
      active.samples = active.samples.filter(sample => event.timeStamp - sample.time <= FLOATING_SAMPLE_MS);
      active.samples.push({ x: event.clientX / active.scaleX, y: event.clientY / active.scaleY, time: event.timeStamp });
      active.moved ||= isFloatingDrag(dx, dy);
      if (!active.moved) return;
      if (active.mode === null) {
        const isHorizontalPull = Math.abs(dx) >= Math.abs(dy) && (open ? dx > 0 : dx < 0);
        active.mode = isHorizontalPull ? 'pull' : 'vertical';
        if (active.mode === 'pull') {
          active.pullOffsetX = notebookPullOffset(active.surfaceWidth, dx, open);
          if (active.overlay) {
            active.overlay.getAnimations?.().forEach(anim => anim.cancel());
            active.overlay.style.transform = `translate3d(${Number(active.pullOffsetX.toFixed(2))}px, 0, 0)`;
            active.overlay.style.visibility = 'visible';
            active.overlay.style.opacity = '1';
            if (active.overlay.parentElement) {
              active.overlay.parentElement.style.visibility = 'visible';
            }
          }
          if (active.backdrop) {
            active.backdrop.style.transition = 'none';
          }
          if (active.screen) {
            if (active.screen.dataset) active.screen.dataset.notebookDragging = 'true';
            active.screen.style.transform = 'translate3d(0, 0, 0) scale(0.94)';
            active.screen.style.borderRadius = '28px';
            active.screen.style.outline = '1px solid rgba(255, 255, 255, 0.15)';
          }
          if (active.appSurface) {
            active.appSurface.style.borderRadius = '28px';
          }
        }
      }
      if (active.mode === 'pull') {
        active.pullOffsetX = notebookPullOffset(active.surfaceWidth, dx, open);
        const tabX = notebookTabPullX(active.pullOffsetX, bounds.current);
        active.point = { x: tabX, y: active.origin.y };
        if (ref.current) ref.current.style.transform = transform(active.point);
        if (active.overlay) {
          active.overlay.style.transform = `translate3d(${Number(active.pullOffsetX.toFixed(2))}px, 0, 0)`;
        }
        const progress = Math.max(0, Math.min(1, 1 - active.pullOffsetX / active.surfaceWidth));
        if (active.backdrop) {
          active.backdrop.style.opacity = progress.toFixed(3);
        }
      } else {
        const edgeX = open ? bounds.current.left : bounds.current.right;
        active.point = clampFloatingPoint({ x: edgeX, y: active.origin.y + dy }, bounds.current);
        if (ref.current) ref.current.style.transform = transform(active.point);
      }
    }} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}
    onClick={event => {
      event.stopPropagation();
      if (suppressClick.current && event.detail !== 0) { suppressClick.current = false; return; }
      settling.current?.cancel();
      const nextEdge: DockEdge = open ? 'right' : 'left';
      event.currentTarget.dataset.edge = nextEdge;
      event.currentTarget.dataset.floating = 'false';
      if (open) {
        onClose?.();
      } else {
        onOpen();
      }
    }}>
      <span data-tab-surface aria-hidden="true"
        className={`pointer-events-none absolute left-1/2 top-1/2 flex h-[var(--tab-dock-height)] w-[var(--tab-dock-width)] -translate-x-1/2 -translate-y-1/2 items-center justify-center border-y border-white/35 bg-slate-900/85 shadow-lg ${
          open ? 'rounded-r-2xl border-r' : 'rounded-l-2xl border-l'
        }`}
        style={{ '--tab-dock-width': `${NOTEBOOK_TAB_WIDTH}px`, '--tab-dock-height': `${NOTEBOOK_TAB_HEIGHT}px`, '--tab-float-size': `${NOTEBOOK_FLOAT_SIZE}px`,
        } as React.CSSProperties}>
        {open ? (
          <IoChevronForwardOutline className="h-4 w-4" />
        ) : (
          <IoBookOutline className="h-4 w-4" />
        )}
      </span>
    </button>;
}
