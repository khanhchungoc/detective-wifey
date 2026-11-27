import React, { memo, useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import {
  IoNavigateOutline,
  IoGlassesOutline,
  IoPersonOutline,
  IoReceiptOutline,
  IoCallOutline,
  IoTimeOutline,
  IoLocationOutline,
  IoFlashOutline,
  IoCutOutline,
  IoCloseOutline,
  IoBookOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import type { AppDefinition } from '../../../shared/contracts/app-contracts';
import { ContactAvatar } from '../../../shared/ui/ContactAvatar';
import { CANVAS_SIZE, calculateYarnStringCurve } from '../graphEngine';
import { formatCorkboardTransform } from '../useCorkboardGestures';
import type { CorkboardViewport, PlacedNode, PairingState } from '../types';
import type { CaseGraphEdge } from '../../../shared/contracts/knowledge-graph';
import {
  ClueTimelineRail,
  parseNodeToTimelineEntries,
} from './ClueTimelineRail';

export const CARD_WIDTH = 210;
export const PIN_OFFSET_X = 105;
export const PIN_OFFSET_Y = 3;

function getCardTiltDeg(nodeId: string): number {
  let hash = 0;
  for (let i = 0; i < nodeId.length; i++) {
    hash = (hash * 31 + nodeId.charCodeAt(i)) | 0;
  }
  return ((Math.abs(hash) % 29) - 14) / 10;
}

const LAMP_IGNITION = { duration: 850, offsets: [0, 0.18, 0.34, 0.55, 0.72, 1] };
const LAMP_LIGHT_IGNITION = [0.12, 0.95, 0.22, 1, 0.55, 1];
const LAMP_VEIL_IGNITION = [0.65, 0.04, 0.58, 0, 0.34, 0];
/** Ambient flicker: a 420ms stutter every ~8.9s, compressed into the front of one looping animation. */
const LAMP_AMBIENT_PERIOD = 8920;
const LAMP_AMBIENT_OFFSETS = [0, 0.22, 0.48, 0.72, 1].map(offset => offset * 420 / LAMP_AMBIENT_PERIOD);
const LAMP_LIGHT_AMBIENT = [1, 0.45, 0.94, 0.62, 1];
const LAMP_VEIL_AMBIENT = [0, 0.42, 0.05, 0.28, 0];

/**
 * One fixed set of lamp layers; the flicker is pure opacity WAAPI (compositor) with no React state.
 * Swapping layer trees mid-open used to re-rasterize full-board gradients right as the player
 * started dragging, which stuttered the board open/close and card drags.
 */
const FluorescentLampHighlight = memo(function FluorescentLampHighlight({ active = true }: { active?: boolean }) {
  const prefersReducedMotion = useReducedMotion();
  const washRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const tubeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wash = washRef.current, veil = veilRef.current, tube = tubeRef.current;
    if (!active || prefersReducedMotion || !wash?.animate || !veil || !tube) return;
    const running: Animation[] = [];
    const play = (element: HTMLElement, values: number[], offsets: number[], options: KeyframeAnimationOptions) => {
      const animation = element.animate(values.map((opacity, i) => ({ opacity, offset: offsets[i] })), { easing: 'linear', ...options });
      running.push(animation);
      return animation;
    };
    // Start after the board slide-in so its first frames stay smooth.
    const timer = window.setTimeout(() => {
      const ignition = { duration: LAMP_IGNITION.duration, fill: 'backwards' as const };
      const ignite = play(wash, LAMP_LIGHT_IGNITION, LAMP_IGNITION.offsets, ignition);
      play(tube, LAMP_LIGHT_IGNITION, LAMP_IGNITION.offsets, ignition);
      play(veil, LAMP_VEIL_IGNITION, LAMP_IGNITION.offsets, ignition);
      ignite.onfinish = () => {
        const ambient = { duration: LAMP_AMBIENT_PERIOD, iterations: Infinity, delay: LAMP_AMBIENT_PERIOD - 420 };
        play(wash, [...LAMP_LIGHT_AMBIENT, 1], [...LAMP_AMBIENT_OFFSETS, 1], ambient);
        play(tube, [...LAMP_LIGHT_AMBIENT, 1], [...LAMP_AMBIENT_OFFSETS, 1], ambient);
        play(veil, [...LAMP_VEIL_AMBIENT, 0], [...LAMP_AMBIENT_OFFSETS, 1], ambient);
      };
    }, 400);
    return () => {
      window.clearTimeout(timer);
      for (const animation of running) animation.cancel();
    };
  }, [active, prefersReducedMotion]);

  return (
    <>
      {/* Single overhead light wash across the entire board, synced 1:1 with lamp flicker */}
      <div ref={washRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0" style={{ willChange: 'opacity' }}>
        <div className="h-full w-full bg-[radial-gradient(ellipse_110%_95%_at_50%_0%,rgba(226,236,248,0.22)_0%,rgba(148,163,184,0.1)_38%,rgba(148,163,184,0.03)_70%,transparent_96%)]" />
      </div>
      {/* Global board & card dimming veil inversely synced to the single overhead lamp (hidden at rest) */}
      <div ref={veilRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-[25]" style={{ opacity: 0, willChange: 'opacity' }}>
        <div className="h-full w-full bg-[radial-gradient(ellipse_105%_85%_at_50%_0%,rgba(4,7,12,0.72)_0%,rgba(4,7,12,0.88)_55%,rgba(3,5,9,0.96)_100%)]" />
      </div>
      {/* Overhead fluorescent tube */}
      <div ref={tubeRef} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center" style={{ willChange: 'opacity' }}>
        <div className="notebook-lamp-tube h-[2px] w-3/4 max-w-[320px] rounded-full bg-[#E2ECF8]/80 shadow-[0_0_16px_4px_rgba(226,236,248,0.45),0_8px_32px_10px_rgba(148,163,184,0.2)]" />
      </div>
    </>
  );
});

interface CorkboardCanvasProps {
  getSourceApp?: (id: string) => Pick<AppDefinition, 'displayName' | 'icon' | 'iconAsset' | 'themeGradient'> | undefined;
  viewport: CorkboardViewport;
  viewportRef?: React.RefObject<CorkboardViewport>;
  planeRef?: React.RefObject<HTMLDivElement | null>;
  surfaceRef?: React.RefObject<HTMLDivElement | null>;
  /** 'wall' shows the whole board on a lit wall; 'focus' zooms in and pushes the wall back. */
  mode?: 'wall' | 'focus';
  isOpen?: boolean;
  isPinching?: boolean;
  placedNodes: PlacedNode[];
  edges: CaseGraphEdge[];
  verifiedKeyEdgeIds?: readonly string[];
  activePairing: PairingState;
  unmaskedSuspectIds: string[];
  activeContradictions: string[];
  selectedEdgeId: string | null;
  selectedNodeId?: string | null;
  onSelectNode: (nodeId: string) => void;
  onSelectCard?: (nodeId: string | null) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onSelectEdge: (edgeId: string | null) => void;
  onSeverEdge: (edgeId: string) => void;
  onRemoveNode?: (nodeId: string) => void;
  onDeleteCard?: (nodeId: string) => void;
  onDeleteMessage?: (nodeId: string, messageRecordId: string) => void;
  onNavigateToSource: (sourceAppId?: string, recordRefId?: string) => void;
  onCancelPairing: () => void;
}

export { calculateYarnStringCurve } from '../graphEngine';

type CorkboardContentsProps = Omit<CorkboardCanvasProps, 'viewport' | 'viewportRef' | 'planeRef' | 'surfaceRef' | 'mode' | 'isOpen'> & {
  zoomRef: React.RefObject<number>;
};

// Camera changes only move the parent plane; cards and strings keep their render.
const CorkboardContents = memo(function CorkboardContents({
  zoomRef,
  getSourceApp,
  isPinching = false,
  placedNodes,
  edges,
  verifiedKeyEdgeIds,
  activePairing,
  unmaskedSuspectIds,
  activeContradictions,
  selectedEdgeId,
  selectedNodeId,
  onSelectNode,
  onSelectCard,
  onMoveNode,
  onSelectEdge,
  onSeverEdge,
  onRemoveNode,
  onDeleteCard,
  onDeleteMessage,
  onNavigateToSource,
}: CorkboardContentsProps) {
  // Map of node positions for drawing edges
  const nodeMap = useMemo(() => {
    const map = new Map<string, PlacedNode>();
    for (const node of placedNodes) {
      map.set(node.nodeId, node);
    }
    return map;
  }, [placedNodes]);

  const verifiedKeyEdgeIdSet = useMemo(
    () => (verifiedKeyEdgeIds ? new Set(verifiedKeyEdgeIds) : null),
    [verifiedKeyEdgeIds],
  );

  // Active dragging node ID for cursor and rotation styling
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [cardStack, setCardStack] = useState<string[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  // Card dragging state reference (drives GPU transform + connected SVG paths directly with 0 React re-renders)
  const cardDragRef = useRef<{
    pointerId: number;
    nodeId: string;
    element: HTMLElement;
    tiltDeg: number;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    pendingX: number;
    pendingY: number;
    hasMoved: boolean;
    connectedEdges: Array<{
      isSource: boolean;
      otherX: number;
      otherY: number;
      isKeyString: boolean;
      paths: SVGPathElement[];
    }>;
  } | null>(null);
  const dragFrameRef = useRef<number | null>(null);

  const applyLiveCardDrag = (drag: NonNullable<typeof cardDragRef.current>) => {
    const deltaX = drag.pendingX - drag.origX;
    const deltaY = drag.pendingY - drag.origY;
    drag.element.style.willChange = 'transform';
    drag.element.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.04)`;

    for (const conn of drag.connectedEdges) {
      const x1 = (conn.isSource ? drag.pendingX : conn.otherX) + PIN_OFFSET_X;
      const y1 = (conn.isSource ? drag.pendingY : conn.otherY) + PIN_OFFSET_Y;
      const x2 = (conn.isSource ? conn.otherX : drag.pendingX) + PIN_OFFSET_X;
      const y2 = (conn.isSource ? conn.otherY : drag.pendingY) + PIN_OFFSET_Y;
      const { pathD } = calculateYarnStringCurve(x1, y1, x2, y2, conn.isKeyString);
      for (const pathEl of conn.paths) {
        pathEl.setAttribute('d', pathD);
      }
    }
  };

  const resetLiveCardDragVisuals = (drag: NonNullable<typeof cardDragRef.current>) => {
    drag.element.style.willChange = '';
    drag.element.style.transform = `rotate(${drag.tiltDeg}deg)`;
  };

  const flushDragMove = () => {
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    const drag = cardDragRef.current;
    if (drag) {
      resetLiveCardDragVisuals(drag);
      if (drag.hasMoved) {
        onMoveNode(drag.nodeId, drag.pendingX, drag.pendingY);
      }
    }
  };

  useEffect(() => () => {
    if (dragFrameRef.current !== null) cancelAnimationFrame(dragFrameRef.current);
  }, []);

  useEffect(() => {
    if (isPinching) {
      if (dragFrameRef.current !== null) {
        cancelAnimationFrame(dragFrameRef.current);
        dragFrameRef.current = null;
      }
      if (cardDragRef.current) {
        resetLiveCardDragVisuals(cardDragRef.current);
      }
      cardDragRef.current = null;
      setActiveDragId(null);
    }
  }, [isPinching]);

  const stackedNodes = [...placedNodes].sort((a, b) =>
    cardStack.indexOf(a.nodeId) - cardStack.indexOf(b.nodeId));

  const getNodeTypeIcon = (type: string, isAlias: boolean, isUnmasked: boolean) => {
    if (isAlias && !isUnmasked) return <IoGlassesOutline className="text-purple-600" />;
    switch (type) {
      case 'suspect': return <IoPersonOutline className="text-rose-600" />;
      case 'bridge_id': return <IoCallOutline className="text-amber-600" />;
      case 'record_clue': return <IoReceiptOutline className="text-blue-600" />;
      case 'timeline_slot': return <IoTimeOutline className="text-emerald-600" />;
      default: return <IoReceiptOutline className="text-slate-600" />;
    }
  };

  return (
    <>
        {/* 1. Node Cards Layer (z-10, underneath red strings) */}
        {stackedNodes.map(node => {
          const isSelected = selectedNodeId === node.nodeId || activePairing.sourceNodeId === node.nodeId;
          const isAlias = node.type === 'alias';
          const isUnmasked = unmaskedSuspectIds.includes(node.nodeId);
          const hasContradiction = activeContradictions.some(id => id.includes(node.nodeId));
          const sourceApp = node.sourceAppId ? getSourceApp?.(node.sourceAppId) : undefined;
          const avatarName = node.type === 'suspect' || node.type === 'alias' || node.conversationId ||
            (node.visibleAlias && ['phone', 'messages', 'internet-messaging'].includes(node.sourceAppId || ''))
            ? node.visibleAlias || node.label : undefined;
          const isDraggingThis = activeDragId === node.nodeId;
          const tiltDeg = getCardTiltDeg(node.nodeId);
          const photoMeta = (() => {
            if (!node.imageSrc) return null;
            const rawSub = (node.subtitle || '').trim();
            const parts = rawSub ? rawSub.split(/\s*•\s*/).filter(Boolean) : [];
            const fallbackDateTime = [node.eventDate, node.eventTime].filter(Boolean).join(' · ')
              || (node.rawTimestamp ? String(node.rawTimestamp) : '');
            const dateTimeText = parts.length >= 2
              ? parts[0]
              : (fallbackDateTime || parts[0] || '');
            const locationText = parts.length >= 2 ? parts.slice(1).join(' • ') : '';
            if (!dateTimeText && !locationText) return null;
            return { dateTimeText, locationText };
          })();
          const timelineEntries = node.imageSrc && (!node.messages || node.messages.length === 0)
            ? []
            : parseNodeToTimelineEntries(node);
          const hasBody = timelineEntries.length > 0 || Boolean(node.imageSrc);

          return (
            <div
              key={node.nodeId}
              data-node-id={node.nodeId}
              onPointerDown={e => {
                if (e.button !== 0 || isPinching) return;
                // Don't drag if clicking action buttons
                if ((e.target as HTMLElement).closest('button')) return;
                // Yield the left-edge swipe zone to AnchoredOverlay's iOS edge-swipe-back gesture
                const overlay = (e.currentTarget as HTMLElement).closest('[data-notebook-overlay]');
                const overlayLeft = overlay ? overlay.getBoundingClientRect().left : 0;
                if (e.clientX - overlayLeft <= 44) return;
                e.stopPropagation();
                const cardEl = e.currentTarget as HTMLElement;
                setActiveDragId(node.nodeId);
                setCardStack(previous => [...previous.filter(id => id !== node.nodeId && nodeMap.has(id)), node.nodeId]);
                const connectedEdges: NonNullable<typeof cardDragRef.current>['connectedEdges'] = [];
                const svgEl = svgRef.current;
                if (svgEl) {
                  for (const edge of edges) {
                    if (edge.sourceNodeId !== node.nodeId && edge.targetNodeId !== node.nodeId) continue;
                    const isSource = edge.sourceNodeId === node.nodeId;
                    const otherNode = nodeMap.get(isSource ? edge.targetNodeId : edge.sourceNodeId);
                    if (!otherNode) continue;
                    const group = svgEl.querySelector<SVGGElement>(`[data-edge-id="${CSS.escape ? CSS.escape(edge.edgeId) : edge.edgeId}"]`);
                    if (!group) continue;
                    const isContradiction = edge.relationship === 'contradicts_alibi';
                    const isVerifiedKeyEdge = verifiedKeyEdgeIdSet
                      ? verifiedKeyEdgeIdSet.has(edge.edgeId)
                      : (edge.isCanonical !== false && edge.isSmokingGun);
                    connectedEdges.push({
                      isSource,
                      otherX: otherNode.x,
                      otherY: otherNode.y,
                      isKeyString: isContradiction || isVerifiedKeyEdge,
                      paths: Array.from(group.querySelectorAll<SVGPathElement>('path')),
                    });
                  }
                }
                cardDragRef.current = {
                  pointerId: e.pointerId,
                  nodeId: node.nodeId,
                  element: cardEl,
                  tiltDeg,
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: node.x,
                  origY: node.y,
                  pendingX: node.x,
                  pendingY: node.y,
                  hasMoved: false,
                  connectedEdges,
                };
                cardEl.setPointerCapture(e.pointerId);
              }}
              onPointerMove={e => {
                const drag = cardDragRef.current;
                if (!drag || drag.nodeId !== node.nodeId || drag.pointerId !== e.pointerId || isPinching) return;
                e.stopPropagation();
                const dx = (e.clientX - drag.startX) / zoomRef.current;
                const dy = (e.clientY - drag.startY) / zoomRef.current;
                if (Math.hypot(dx, dy) > 4) {
                  drag.hasMoved = true;
                }
                drag.pendingX = Math.round(Math.max(20, Math.min(CANVAS_SIZE - 230, drag.origX + dx)));
                drag.pendingY = Math.round(Math.max(20, Math.min(CANVAS_SIZE - 180, drag.origY + dy)));
                if (dragFrameRef.current === null) {
                  dragFrameRef.current = requestAnimationFrame(() => {
                    dragFrameRef.current = null;
                    const active = cardDragRef.current;
                    if (active) applyLiveCardDrag(active);
                  });
                }
              }}
              onPointerUp={e => {
                const drag = cardDragRef.current;
                if (!drag || drag.nodeId !== node.nodeId || drag.pointerId !== e.pointerId || isPinching) return;
                flushDragMove();
                try {
                  (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
                } catch {
                  // ignore
                }
                if (!drag.hasMoved) {
                  // Click / tap selects card and handles pairing
                  onSelectCard?.(node.nodeId);
                  onSelectNode(node.nodeId);
                }
                cardDragRef.current = null;
                setActiveDragId(null);
              }}
              onPointerCancel={() => {
                if (dragFrameRef.current !== null) {
                  cancelAnimationFrame(dragFrameRef.current);
                  dragFrameRef.current = null;
                }
                if (cardDragRef.current) {
                  resetLiveCardDragVisuals(cardDragRef.current);
                }
                cardDragRef.current = null;
                setActiveDragId(null);
              }}
              className={`corkboard-node-card absolute cursor-grab active:cursor-grabbing transition-shadow duration-150 ${
                node.imageSrc
                  ? 'rounded-[2px] border bg-[#FBF9F4] p-2 pt-3 pb-2.5'
                  : 'corkboard-paper-card rounded-[3px] border p-2.5 pt-[16px]'
              } ${
                isDraggingThis
                  ? 'z-30 border-[#DC2626] shadow-[0_24px_42px_rgba(0,0,0,0.72),0_10px_18px_rgba(0,0,0,0.45)] ring-2 ring-[#EF4444]/75'
                  : isSelected
                  ? 'z-30 border-[#DC2626] ring-2 ring-[#EF4444]/85 shadow-[0_14px_30px_rgba(0,0,0,0.65)]'
                  : isUnmasked && isAlias
                  ? 'z-20 border-[#E11D48] ring-1 ring-[#FB7185] shadow-[0_8px_18px_rgba(0,0,0,0.55)]'
                  : hasContradiction
                  ? 'z-20 border-[#EAB308] ring-1 ring-[#FACC15] shadow-[0_8px_18px_rgba(0,0,0,0.55)]'
                  : node.imageSrc
                  ? 'z-20 border-[#DDD5C7] shadow-[0_10px_24px_rgba(0,0,0,0.6),0_2px_6px_rgba(0,0,0,0.35)] hover:shadow-[0_14px_28px_rgba(0,0,0,0.7)]'
                  : 'z-20 border-[#C9BFAE] shadow-[0_8px_18px_rgba(0,0,0,0.55),0_2px_4px_rgba(0,0,0,0.35)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.65)]'
              }`}
              style={{
                width: `${CARD_WIDTH}px`,
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: isDraggingThis ? 'scale(1.04)' : `rotate(${tiltDeg}deg)`,
                touchAction: 'none',
              }}
            >
              {/* Cold War Masking Tape + Steel/Crimson Marker Pin at Top Center */}
              <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center" style={{ top: PIN_OFFSET_Y - 10 }}>
                <div
                  aria-hidden="true"
                  className="absolute top-1.5 h-2.5 w-10 -rotate-2 rounded-[1px] bg-[#D4B44C]/80 shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
                />
                <div className={`relative h-5 w-5 rounded-full border flex items-center justify-center transition-transform duration-150 bg-gradient-to-br from-[#FB7185] via-[#E11D48] to-[#881337] border-[#FDA4AF]/75 ${
                  isDraggingThis ? 'scale-110 shadow-[0_6px_12px_rgba(0,0,0,0.7)]' : 'shadow-[0_3px_6px_rgba(0,0,0,0.6)]'
                }`}>
                  <div className="absolute top-0.5 left-1 h-1.5 w-1.5 rounded-full bg-white/80" />
                  <div className="h-1 w-1 rounded-full bg-[#090C10]/80 shadow-inner" />
                </div>
                <div className={`w-1.5 h-0.5 bg-black/55 rounded-full -mt-0.5 transition-opacity duration-150 ${
                  isDraggingThis ? 'opacity-30' : 'opacity-100'
                }`} />
              </div>

              {node.imageSrc ? (
                /* Direct Polaroid Photo Pin (no aged-paper note background, full original aspect ratio) */
                <div data-pinned-photo={node.nodeId} className="relative">
                  {/* Floating Action Buttons when Polaroid is selected */}
                  <div
                    className={`absolute right-1.5 top-1.5 h-6 z-20 flex items-center gap-1 ${isSelected ? '' : 'invisible pointer-events-none'}`}
                    inert={!isSelected}
                  >
                    {node.sourceAppId && (
                      <button
                        type="button"
                        aria-label="Đến chat"
                        title="Đến nguồn ảnh"
                        onClick={e => {
                          e.stopPropagation();
                          onNavigateToSource(node.sourceAppId, node.conversationId || node.recordRefId);
                        }}
                        className="relative flex h-6 w-6 items-center justify-center rounded-[4px] bg-black/75 hover:bg-[#DC2626] text-white transition-colors active:scale-90 shadow cursor-pointer before:absolute before:-inset-2"
                      >
                        <IoNavigateOutline className="text-xs" />
                      </button>
                    )}
                    <button
                      type="button"
                      aria-label="Xóa"
                      title="Xóa ảnh"
                      onClick={e => {
                        e.stopPropagation();
                        if (onDeleteCard) onDeleteCard(node.nodeId);
                        else onRemoveNode?.(node.nodeId);
                      }}
                      className="relative flex h-6 w-6 items-center justify-center rounded-[4px] bg-black/75 hover:bg-[#DC2626] text-white transition-colors active:scale-90 shadow cursor-pointer before:absolute before:-inset-2"
                    >
                      <IoTrashOutline className="text-xs" />
                    </button>
                  </div>

                  <div className="w-full overflow-hidden rounded-[1px] bg-[#1C1C1E]">
                    {node.imagePosition ? (() => {
                      const tileW = node.imageAspect === '4:3' ? 400 : 300;
                      const tileH = node.imageAspect === '4:3' ? 300 : 400;
                      const clipId = `polaroid-clip-${node.nodeId}`;
                      return (
                        <svg
                          viewBox={`0 0 ${tileW} ${tileH}`}
                          preserveAspectRatio="xMidYMid meet"
                          className="block w-full h-auto pointer-events-none"
                          aria-label={node.label}
                        >
                          <defs>
                            <clipPath id={clipId}>
                              <rect x="0" y="0" width={tileW} height={tileH} />
                            </clipPath>
                          </defs>
                          <image
                            href={node.imageSrc}
                            xlinkHref={node.imageSrc}
                            x={node.imagePosition.startsWith('100%') ? -tileW : 0}
                            y={node.imagePosition.endsWith('100%') ? -tileH : 0}
                            width={tileW * 2}
                            height={tileH * 2}
                            preserveAspectRatio="none"
                            clipPath={`url(#${clipId})`}
                          />
                        </svg>
                      );
                    })() : (
                      <img
                        src={node.imageSrc}
                        alt={node.label}
                        draggable={false}
                        className="block w-full h-auto select-none"
                      />
                    )}
                  </div>

                  {photoMeta && (
                    <div
                      data-pinned-photo-meta={node.nodeId}
                      className="mt-2 space-y-0.5 px-0.5 font-handwriting text-note-meta text-slate-700 leading-snug"
                    >
                      {photoMeta.dateTimeText && (
                        <div className="flex items-start gap-1">
                          <IoTimeOutline className="mt-0.5 h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />
                          <span className="min-w-0 break-words">{photoMeta.dateTimeText}</span>
                        </div>
                      )}
                      {photoMeta.locationText && (
                        <div className="flex items-start gap-1">
                          <IoLocationOutline className="mt-0.5 h-3 w-3 shrink-0 text-[#DC2626]" aria-hidden="true" />
                          <span className="min-w-0 break-words">{photoMeta.locationText}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Top Bar: Yellow Sticky Note Title on Left, Film-Framed Avatar with App Icon Badge on Right, and Action Buttons */
                <div className={`relative min-h-[36px] ${hasBody ? 'pb-1.5' : 'pb-0.5'}`}>
                  <div
                    className="relative -ml-3.5 -mt-1 flex min-w-0 items-center justify-between gap-2 w-[calc(100%+14px)]"
                    style={isSelected ? {
                      WebkitMaskImage: `linear-gradient(to right, black calc(100% - ${node.sourceAppId ? 88 : 56}px), transparent calc(100% - ${node.sourceAppId ? 58 : 28}px))`,
                      maskImage: `linear-gradient(to right, black calc(100% - ${node.sourceAppId ? 88 : 56}px), transparent calc(100% - ${node.sourceAppId ? 58 : 28}px))`,
                    } : undefined}
                  >
                    <div className="corkboard-sticky-note relative flex min-w-0 items-center gap-1.5 py-1 pl-2.5 pr-2.5 -rotate-[1.5deg]">
                      {!avatarName && !sourceApp && (
                        <span className="shrink-0 text-xs">{getNodeTypeIcon(node.type, isAlias, isUnmasked)}</span>
                      )}
                      <h4 className="font-handwriting text-note-title text-slate-900 line-clamp-2">
                        {isAlias && isUnmasked
                          ? `[BÓC TRẦN] ${node.label}`
                          : node.label}
                      </h4>
                    </div>

                    {(avatarName || sourceApp) && (() => {
                      // Source app shows as a small badge on the profile picture's top-right corner (alone when there is no picture).
                      const appIcon = sourceApp && (
                        <span
                          className={`flex shrink-0 items-center justify-center overflow-hidden text-white ring-1 ring-black/10 ${avatarName ? 'absolute -right-1.5 -top-1.5 z-10 h-4 w-4 rounded-[4px] shadow-[0_1px_3px_rgba(0,0,0,0.45)]' : 'h-6 w-6 rounded-[5px] shadow-xs'} ${sourceApp.iconAsset ? '' : `bg-gradient-to-br ${sourceApp.themeGradient}`}`}
                          title={sourceApp.displayName}
                          role="img"
                          aria-label={sourceApp.displayName}
                        >
                          {sourceApp.iconAsset ? (
                            <img src={sourceApp.iconAsset} alt="" aria-hidden="true" draggable={false} className="h-full w-full" />
                          ) : <sourceApp.icon className={avatarName ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5'} />}
                        </span>
                      );
                      return avatarName ? (
                        <span className="corkboard-film-frame relative z-10 inline-flex shrink-0 flex-col items-center p-[3px] pb-[5px] rotate-2">
                          <ContactAvatar name={avatarName} size={32} shape="square" />
                          {appIcon}
                        </span>
                      ) : appIcon;
                    })()}
                  </div>

                  {/* Card-level Action Buttons: Exactly two buttons [Đến chat] and [Xóa] */}
                  <div
                    className={`absolute right-0 top-0 h-6 z-20 flex items-center gap-1 ${isSelected ? '' : 'invisible pointer-events-none'}`}
                    inert={!isSelected}
                  >
                    {/* Đến chat / Go to conversation button */}
                    {node.sourceAppId && (
                      <button
                        type="button"
                        aria-label="Đến chat"
                        title="Đến chat"
                        onClick={e => {
                          e.stopPropagation();
                          onNavigateToSource(node.sourceAppId, node.conversationId || node.recordRefId);
                        }}
                        className="relative flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#D5DDE5] hover:bg-[#DC2626] hover:text-white text-slate-700 transition-colors active:scale-90 shadow-xs cursor-pointer before:absolute before:-inset-2"
                      >
                        <IoNavigateOutline className="text-xs" />
                      </button>
                    )}

                    {/* Xóa thẻ button */}
                    <button
                      type="button"
                      aria-label="Xóa"
                      title="Xóa thẻ"
                      onClick={e => {
                        e.stopPropagation();
                        if (onDeleteCard) onDeleteCard(node.nodeId);
                        else onRemoveNode?.(node.nodeId);
                      }}
                      className="relative flex h-6 w-6 items-center justify-center rounded-[4px] bg-[#D5DDE5] hover:bg-[#DC2626] hover:text-white text-slate-700 transition-colors active:scale-90 shadow-xs cursor-pointer before:absolute before:-inset-2"
                    >
                      <IoTrashOutline className="text-xs" />
                    </button>
                  </div>
                </div>
              )}

              {/* Card Body: Reusable Left-Hand Vertical Timeline Rail */}
              {timelineEntries.length > 0 && (
                <div className="pt-0.5">
                  <ClueTimelineRail
                    entries={timelineEntries}
                    isSelected={isSelected}
                    className="font-handwriting"
                    onDeleteItem={onDeleteMessage ? (msgId) => onDeleteMessage(node.nodeId, msgId) : undefined}
                  />
                </div>
              )}

              {/* Special Status Stamped Tags */}
              {isAlias && isUnmasked && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-[2px] bg-rose-100 border border-rose-300 px-1.5 py-0.5 font-handwriting text-note-badge uppercase text-rose-800">
                  <span>Khớp danh tính</span>
                </div>
              )}
              {hasContradiction && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded-[2px] bg-yellow-100 border border-yellow-400 px-1.5 py-0.5 font-handwriting text-note-badge uppercase text-yellow-900">
                  <IoFlashOutline className="text-[10px] shrink-0 text-amber-700" />
                  <span>Mâu thuẫn</span>
                </div>
              )}
            </div>
          );
        })}

        {/* 2. SVG Red String Layer Rendered ON TOP of Notes (z-30) */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          style={{ overflow: 'visible' }}
        >
          {edges.map(edge => {
            const source = nodeMap.get(edge.sourceNodeId);
            const target = nodeMap.get(edge.targetNodeId);
            if (!source || !target) return null;

            // Connect lines DIRECTLY from the pushpins (top center of the card)
            const x1 = source.x + PIN_OFFSET_X;
            const y1 = source.y + PIN_OFFSET_Y;
            const x2 = target.x + PIN_OFFSET_X;
            const y2 = target.y + PIN_OFFSET_Y;

            const isContradiction = edge.relationship === 'contradicts_alibi';
            const isVerifiedKeyEdge = verifiedKeyEdgeIdSet
              ? verifiedKeyEdgeIdSet.has(edge.edgeId)
              : (edge.isCanonical !== false && edge.isSmokingGun);
            const isKeyString = isContradiction || isVerifiedKeyEdge;
            const isSelected = selectedEdgeId === edge.edgeId;
            const { pathD } = calculateYarnStringCurve(x1, y1, x2, y2, isKeyString);

            // Simplified 2-type yarn mapping against dark walnut cork:
            // - Key / Smoking-gun or contradiction link: classic detective red #DC2626, solid
            // - Neutral (supporting & speculative connections): amber gold #FBBF24, solid
            const stringStroke = isKeyString ? '#DC2626' : '#FBBF24';

            const strokeWidth = isSelected ? '2.75' : '2';

            const strokeOpacity = isSelected ? 0.85 : 0.55;

            return (
              <g
                key={edge.edgeId}
                data-edge-id={edge.edgeId}
                className="corkboard-string pointer-events-auto cursor-pointer"
                onClick={event => {
                  event.stopPropagation();
                  onSelectEdge(edge.edgeId);
                }}
                onDoubleClick={event => {
                  event.stopPropagation();
                  onSeverEdge(edge.edgeId);
                }}
              >
                {/* Hit area for tapping string */}
                <path
                  d={pathD}
                  stroke="transparent"
                  strokeWidth="24"
                  fill="none"
                />
                {/* Natural vector drop shadow */}
                <path
                  d={pathD}
                  stroke="#140905"
                  strokeWidth={strokeWidth}
                  strokeOpacity={0.18}
                  fill="none"
                  strokeLinecap="round"
                  transform="translate(0.75, 1.25)"
                />
                {/* Slender Detective Yarn */}
                <path
                  d={pathD}
                  stroke={stringStroke}
                  strokeWidth={strokeWidth}
                  strokeOpacity={strokeOpacity}
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            );
          })}
        </svg>
    </>
  );
});

export const CorkboardCanvas: React.FC<CorkboardCanvasProps> = ({
  viewport,
  viewportRef: externalViewportRef,
  planeRef,
  surfaceRef,
  mode = 'focus',
  isOpen = true,
  ...contentsProps
}) => {
  const { placedNodes, activePairing, selectedEdgeId, onSelectCard, onSelectEdge, onSeverEdge, onCancelPairing } = contentsProps;
  const zoomRef = useRef(viewport.zoom);
  useLayoutEffect(() => {
    zoomRef.current = externalViewportRef?.current.zoom ?? viewport.zoom;
  }, [externalViewportRef, viewport.zoom]);
  const planeStyle: React.CSSProperties = {
    left: '50%',
    top: '50%',
    transformOrigin: '0 0',
    transform: formatCorkboardTransform(viewport),
  };
  const planeSizeStyle: React.CSSProperties = {
    width: `${CANVAS_SIZE}px`,
    height: `${CANVAS_SIZE}px`,
    zoom: viewport.zoom,
  };
  return (
    <div
      data-board-mode={mode}
      className={`notebook-cardboard isolate relative w-full h-full overflow-hidden select-none ${mode === 'wall' ? 'cursor-zoom-in' : 'cursor-grab active:cursor-grabbing'}`}
      onClick={() => {
        onSelectCard?.(null);
        onSelectEdge?.(null);
      }}
    >
      {/* Chalkboard surface + frame: moves and zooms with the cards so the board edge is visible */}
      {/* Focus view: dims the wall behind the board (opacity fade only) */}
      <div aria-hidden="true" className="notebook-wall-veil pointer-events-none absolute inset-0" />

      <div ref={surfaceRef} aria-hidden="true" className="pointer-events-none absolute" style={planeStyle}>
        <div className="notebook-board-surface" style={planeSizeStyle} />
      </div>

      {/* Screen-fixed edge falloff over the board, under the cards */}
      <div aria-hidden="true" className="notebook-board-shade pointer-events-none absolute inset-0" />

      {/* Overhead Cold War Fluorescent Lamp Highlight */}
      <FluorescentLampHighlight active={isOpen} />

      {/* Empty State Overlay */}
      {placedNodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-20">
          <div className="corkboard-paper-card relative max-w-[260px] rounded-[3px] border border-[#B8C4D0] px-5 pt-6 pb-5 shadow-[0_14px_32px_rgba(0,0,0,0.68)] -rotate-1">
            <div className="absolute left-1/2 -translate-x-1/2 -top-2.5 flex flex-col items-center">
              <div
                aria-hidden="true"
                className="absolute top-1.5 h-2.5 w-10 -rotate-2 rounded-[1px] bg-[#D4B44C]/80 shadow-[0_1px_2px_rgba(0,0,0,0.3)]"
              />
              <div className="relative h-5 w-5 rounded-full bg-gradient-to-br from-[#FB7185] via-[#E11D48] to-[#881337] border border-[#FDA4AF]/75 shadow-[0_3px_6px_rgba(0,0,0,0.65)]">
                <div className="absolute top-0.5 left-1 h-1.5 w-1.5 rounded-full bg-white/80" />
              </div>
            </div>
            <div className="mx-auto mb-2.5 flex h-11 w-11 items-center justify-center rounded-[4px] border border-[#B8C4D0] bg-[#D5DDE5] text-[#DC2626] text-xl">
              <IoBookOutline />
            </div>
            <h3 className="font-sans text-ios-caption-1 font-extrabold text-slate-900 uppercase tracking-wider">
              CHƯA CÓ MANH MỐI NÀO
            </h3>
            <p className="mt-1.5 text-ios-caption-1 text-slate-700 leading-relaxed">
              Khám phá các ứng dụng trên điện thoại.
              <br />
              <strong className="text-slate-900">Nhấn giữ</strong> nội dung đáng ngờ để ghim vào bảng manh mối.
            </p>
          </div>
        </div>
      )}

      {/* Pairing Banner Indicator */}
      {activePairing.sourceNodeId && (
        <div className="absolute top-3 left-3 right-3 z-40 flex items-center justify-between rounded-[6px] bg-[#0D1219]/95 border border-[#E11D48]/55 p-2.5 px-3.5 text-ios-caption-1 font-semibold text-[#F1F5F9] shadow-2xl">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#E11D48] animate-pulse shrink-0" />
            <span className="font-sans uppercase tracking-wide">ĐANG NỐI DÂY: Chạm thẻ thứ hai để kết nối...</span>
          </span>
          <button
            type="button"
            onClick={onCancelPairing}
            className="flex items-center gap-1 rounded-[4px] bg-[#E11D48] hover:bg-[#BE123C] px-2.5 py-1 text-ios-caption-2 text-white active:scale-95 cursor-pointer"
          >
            <IoCloseOutline className="text-base" /> Huỷ
          </button>
        </div>
      )}

      {/* Zoomable & Pannable Virtual Plane (GPU transform during gestures, crisp CSS zoom when settled) */}
      <div ref={planeRef} className="absolute" style={planeStyle}>
        <div className="relative" style={planeSizeStyle}>
          <CorkboardContents {...contentsProps} zoomRef={zoomRef} />
        </div>
      </div>

      {/* Selected Edge Action Popover */}
      {selectedEdgeId && (
        <div className="corkboard-control-dock absolute bottom-24 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-[6px] bg-[#0D1219]/96 border border-slate-700/85 p-1.5 pl-3.5 shadow-2xl">
          <span className="font-sans text-ios-caption-1 font-medium text-[#F1F5F9] whitespace-nowrap">Đã chọn sợi dây</span>
          <button
            type="button"
            onClick={() => onSeverEdge(selectedEdgeId)}
            className="flex min-h-[36px] items-center gap-1 rounded-[4px] bg-[#E11D48] hover:bg-[#BE123C] px-3 py-1.5 font-sans text-ios-caption-2 font-bold uppercase text-white shadow active:scale-95 cursor-pointer"
          >
            <IoCutOutline className="text-sm" /> Cắt dây
          </button>
          <button
            type="button"
            aria-label="Bỏ chọn sợi dây"
            onClick={() => onSelectEdge(null)}
            className="flex h-8 w-8 items-center justify-center rounded-[4px] bg-slate-800 hover:bg-slate-700 text-[#F1F5F9] cursor-pointer"
          >
            <IoCloseOutline className="text-base" />
          </button>
        </div>
      )}
    </div>
  );
};
