import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { calculateClueCardsCenter } from './graphEngine';
import {
  FOCUS_ZOOM,
  isInsideBoard,
  isBoardChromeControl,
  computeWallViewport,
  loadSavedCorkboard,
  type CorkboardMode,
  type SavedCorkboardState,
} from './corkboardState';
import { useCorkboardGestures } from './useCorkboardGestures';
import chalkboardBoardUrl from './assets/chalkboard-board.webp';
import detectiveOfficeWallUrl from './assets/detective-office-wall.webp';
import type { PlacedNode, CorkboardViewport } from './types';

interface UseCorkboardViewportParams {
  caseId?: string;
  savedState: SavedCorkboardState | null;
  initialPlacedNodes: PlacedNode[];
  placedNodes: PlacedNode[];
  boardRef: React.RefObject<HTMLDivElement | null>;
  onDismissSelection: () => void;
}

export function useCorkboardViewport({
  caseId,
  savedState,
  initialPlacedNodes,
  placedNodes,
  boardRef,
  onDismissSelection,
}: UseCorkboardViewportParams) {
  const [boardMode, setBoardMode] = useState<CorkboardMode>(() => loadSavedCorkboard(caseId)?.mode ?? 'wall');
  const boardModeRef = useRef(boardMode);
  boardModeRef.current = boardMode;

  const hasRestoredCards = Boolean(
    savedState?.viewport &&
    initialPlacedNodes.length > 0 &&
    savedState.placedNodes.some(saved => initialPlacedNodes.some(node => node.nodeId === saved.nodeId)),
  );
  const initialViewport = useMemo<CorkboardViewport>(() => {
    if (hasRestoredCards && savedState?.viewport) {
      return savedState.viewport;
    }
    return {
      ...calculateClueCardsCenter(placedNodes),
      zoom: 1.0,
    };
  }, [hasRestoredCards, savedState, placedNodes]);

  const planeRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);

  // Warm chalkboard + office wall textures and handwriting font on idle so the first slide-out never stalls on decode.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const warmAssets = () => {
      if (typeof Image !== 'undefined') {
        for (const src of [chalkboardBoardUrl, detectiveOfficeWallUrl]) {
          const img = new Image();
          img.src = src;
          void img.decode?.().catch(() => {});
        }
      }
      void document.fonts?.load('400 14px "Shantell Sans"', 'Tiếng Việt ăâđêôơư').catch(() => {});
      void document.fonts?.load('500 14px "Shantell Sans"', 'Tiếng Việt ăâđêôơư').catch(() => {});
      void document.fonts?.load('600 14px "Shantell Sans"', 'Tiếng Việt ăâđêôơư').catch(() => {});
    };
    const idleApi = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (idleApi.requestIdleCallback) {
      const id = idleApi.requestIdleCallback(warmAssets, { timeout: 1200 });
      return () => idleApi.cancelIdleCallback?.(id);
    }
    const timer = window.setTimeout(warmAssets, 300);
    return () => window.clearTimeout(timer);
  }, []);

  const prefersReducedMotion = useReducedMotion();
  const {
    viewport,
    viewportRef,
    isPinching,
    setViewport,
    setCenter,
    containerProps,
    animateTo,
  } = useCorkboardGestures({
    initialViewport,
    onTapBackground: point => tapBackgroundRef.current(point),
    onDoubleTapBackground: () => doubleTapBackgroundRef.current(),
    onPinchOutAtMinZoom: () => pinchCloseRef.current(),
    onPinchInFromLocked: () => pinchOpenRef.current(),
    locked: boardMode === 'wall',
    reducedMotion: Boolean(prefersReducedMotion),
    planeRef,
    surfaceRef,
    boardRef,
  });

  const flightMs = prefersReducedMotion ? 0 : 420;
  const suppressNextWallClickRef = useRef(false);

  const enterWallView = useCallback(() => {
    suppressNextWallClickRef.current = true;
    onDismissSelection();
    setBoardMode('wall');
    boardModeRef.current = 'wall';
    animateTo(computeWallViewport(boardRef.current), flightMs);
  }, [animateTo, boardRef, flightMs, onDismissSelection]);

  const enterFocusView = useCallback((point: { x: number; y: number }) => {
    setBoardMode('focus');
    boardModeRef.current = 'focus';
    animateTo({ x: point.x, y: point.y, zoom: FOCUS_ZOOM }, flightMs);
  }, [animateTo, flightMs]);

  // Focus view: tapping the wall around the board, double-tapping the board, or pinching out at min zoom puts it back on the wall.
  const tapBackgroundRef = useRef<(point: { x: number; y: number }) => void>(() => {});
  tapBackgroundRef.current = point => {
    if (!isInsideBoard(point)) {
      enterWallView();
      return;
    }
    onDismissSelection();
  };
  const doubleTapBackgroundRef = useRef<() => void>(() => {});
  doubleTapBackgroundRef.current = () => {
    enterWallView();
  };
  const pinchCloseRef = useRef<() => void>(() => {});
  pinchCloseRef.current = () => {
    enterWallView();
  };
  const pinchOpenRef = useRef<() => void>(() => {});
  pinchOpenRef.current = () => {
    setBoardMode('focus');
    boardModeRef.current = 'focus';
  };

  // Wall view: cards are not interactive; a single tap on the board or a card brings the board forward into focus view.
  const handleWallClickCapture = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isBoardChromeControl(e.target)) return;
    e.stopPropagation();
    e.preventDefault();
    if (suppressNextWallClickRef.current) {
      suppressNextWallClickRef.current = false;
      return;
    }
    const cardEl = (e.target as HTMLElement).closest<HTMLElement>('[data-node-id]');
    const node = cardEl ? placedNodes.find(n => n.nodeId === cardEl.dataset.nodeId) : undefined;
    if (node && cardEl) {
      enterFocusView({ x: node.x + cardEl.offsetWidth / 2, y: node.y + cardEl.offsetHeight / 2 });
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const cam = viewportRef.current;
    const point = {
      x: cam.x + (e.clientX - rect.left - rect.width / 2) / cam.zoom,
      y: cam.y + (e.clientY - rect.top - rect.height / 2) / cam.zoom,
    };
    if (isInsideBoard(point)) enterFocusView(point);
  }, [enterFocusView, placedNodes, viewportRef]);

  const boardContainerProps = boardMode === 'wall'
    ? {
        // Keep move/up/cancel capture handlers mounted so pinch-to-close never orphans pointers
        // and 1-gesture pinch-to-zoom works directly from wall view.
        ...containerProps,
        onPointerDownCapture: (e: React.PointerEvent<HTMLDivElement>) => {
          suppressNextWallClickRef.current = false;
          containerProps.onPointerDownCapture(e);
          if (!isBoardChromeControl(e.target)) e.stopPropagation();
        },
        onClickCapture: handleWallClickCapture,
      }
    : containerProps;

  // Keep the whole board framed in wall view when the screen size changes.
  useEffect(() => {
    if (boardMode !== 'wall') return;
    const refit = () => setViewport(computeWallViewport(boardRef.current));
    window.addEventListener('resize', refit);
    return () => window.removeEventListener('resize', refit);
  }, [boardMode, boardRef, setViewport]);

  // On first open, once cards mount in DOM, accurately center the bounding box if not restoring a saved viewport
  const hasInitializedViewport = useRef(hasRestoredCards && boardMode === 'focus');
  useLayoutEffect(() => {
    if (hasInitializedViewport.current) return;
    if (boardModeRef.current === 'wall') {
      hasInitializedViewport.current = true;
      setViewport(computeWallViewport(boardRef.current));
      return;
    }
    if (placedNodes.length === 0) return;
    hasInitializedViewport.current = true;
    const cards = new Map(
      Array.from(boardRef.current?.querySelectorAll<HTMLElement>('[data-node-id]') ?? []).map(card => [
        card.dataset.nodeId,
        card,
      ]),
    );
    const center = calculateClueCardsCenter(placedNodes, nodeId => {
      const el = cards.get(nodeId);
      return el ? { width: el.offsetWidth, height: el.offsetHeight } : undefined;
    });
    setViewport({ ...center, zoom: 1.0 });
  }, [boardRef, placedNodes, setViewport]);

  return {
    boardMode,
    boardModeRef,
    viewport,
    viewportRef,
    isPinching,
    planeRef,
    surfaceRef,
    setCenter,
    enterFocusView,
    boardContainerProps,
  };
}
