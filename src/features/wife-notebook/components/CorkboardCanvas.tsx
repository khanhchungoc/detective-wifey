import React, { memo, useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import {
  IoNavigateOutline,
  IoGlassesOutline,
  IoPersonOutline,
  IoReceiptOutline,
  IoCallOutline,
  IoTimeOutline,
  IoFlashOutline,
  IoCutOutline,
  IoCloseOutline,
  IoBookOutline,
  IoTrashOutline,
} from 'react-icons/io5';
import type { AppDefinition } from '../../../shared/contracts/app-contracts';
import { ContactAvatar } from '../../../shared/ui/ContactAvatar';
import { CANVAS_SIZE, calculateYarnStringCurve } from '../graphEngine';
import type { CorkboardViewport, PlacedNode, PairingState } from '../types';
import type { CaseGraphEdge } from '../../../shared/contracts/knowledge-graph';
import {
  ClueTimelineRail,
  parseNodeToTimelineEntries,
} from './ClueTimelineRail';

export const CARD_WIDTH = 210;
export const PIN_OFFSET_X = 105;
export const PIN_OFFSET_Y = 3;

interface CorkboardCanvasProps {
  getSourceApp?: (id: string) => Pick<AppDefinition, 'displayName' | 'icon' | 'iconAsset' | 'themeGradient'> | undefined;
  viewport: CorkboardViewport;
  isPinching?: boolean;
  placedNodes: PlacedNode[];
  edges: CaseGraphEdge[];
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

type CorkboardContentsProps = Omit<CorkboardCanvasProps, 'viewport'> & {
  zoomRef: React.RefObject<number>;
};

// Camera changes only move the parent plane; cards and strings keep their render.
const CorkboardContents = memo(function CorkboardContents({
  zoomRef,
  getSourceApp,
  isPinching = false,
  placedNodes,
  edges,
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

  // Active dragging node ID for cursor and rotation styling
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [cardStack, setCardStack] = useState<string[]>([]);

  // Card dragging state reference
  const cardDragRef = useRef<{
    pointerId: number;
    nodeId: string;
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    pendingX: number;
    pendingY: number;
    hasMoved: boolean;
  } | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const flushDragMove = () => {
    if (dragFrameRef.current !== null) {
      cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }
    const drag = cardDragRef.current;
    if (drag && drag.hasMoved) {
      onMoveNode(drag.nodeId, drag.pendingX, drag.pendingY);
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
          const timelineEntries = parseNodeToTimelineEntries(node);
          const hasBody = timelineEntries.length > 0;

          return (
            <div
              key={node.nodeId}
              data-node-id={node.nodeId}
              onPointerDown={e => {
                if (e.button !== 0 || isPinching) return;
                // Don't drag if clicking action buttons
                if ((e.target as HTMLElement).closest('button')) return;
                e.stopPropagation();
                setActiveDragId(node.nodeId);
                setCardStack(previous => [...previous.filter(id => id !== node.nodeId && nodeMap.has(id)), node.nodeId]);
                cardDragRef.current = {
                  pointerId: e.pointerId,
                  nodeId: node.nodeId,
                  startX: e.clientX,
                  startY: e.clientY,
                  origX: node.x,
                  origY: node.y,
                  pendingX: node.x,
                  pendingY: node.y,
                  hasMoved: false,
                };
                (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
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
                    if (active) onMoveNode(active.nodeId, active.pendingX, active.pendingY);
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
                cardDragRef.current = null;
                setActiveDragId(null);
              }}
              className={`corkboard-node-card absolute rounded-xl border p-2.5 pt-[15px] cursor-grab active:cursor-grabbing transition-shadow duration-150 ${
                isDraggingThis
                  ? 'z-30 border-rose-400 bg-[#FFFDF5] shadow-[0_22px_40px_-4px_rgba(0,0,0,0.3),0_12px_22px_-6px_rgba(0,0,0,0.18)] ring-2 ring-rose-400/60'
                  : isSelected
                  ? 'z-30 border-rose-500 bg-[#FFFBEB] ring-4 ring-rose-400/60 shadow-[0_8px_24px_rgba(225,29,72,0.35)]'
                  : isUnmasked && isAlias
                  ? 'z-20 border-rose-400 bg-[#FFF5F5] ring-1 ring-rose-300 shadow-[0_4px_12px_rgba(30,20,10,0.25)]'
                  : hasContradiction
                  ? 'z-20 border-amber-400 bg-[#FFFDF0] ring-1 ring-amber-300 shadow-[0_4px_12px_rgba(30,20,10,0.25)]'
                  : 'z-20 border-[#E8E0D2] bg-[#FFFDF5] shadow-[0_3px_10px_rgba(35,22,12,0.2)] hover:shadow-[0_6px_16px_rgba(35,22,12,0.3)]'
              }`}
              style={{
                width: `${CARD_WIDTH}px`,
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: isDraggingThis ? 'scale(1.05)' : undefined,
                touchAction: 'none',
              }}
            >
              {/* Realistic 3D Pushpin at Top Center */}
              <div className="absolute left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center" style={{ top: PIN_OFFSET_Y - 10 }}>
                <div className={`relative h-5 w-5 rounded-full bg-gradient-to-br from-red-500 via-rose-600 to-red-900 border border-rose-300/60 flex items-center justify-center transition-transform duration-150 ${
                  isDraggingThis ? 'scale-110 shadow-[0_4px_8px_rgba(0,0,0,0.5)]' : 'shadow-[0_2px_4px_rgba(0,0,0,0.4)]'
                }`}>
                  <div className="absolute top-0.5 left-1 h-1.5 w-1.5 rounded-full bg-white/75" />
                  <div className="h-1 w-1 rounded-full bg-red-950/80 shadow-inner" />
                </div>
                <div className={`w-1 h-0.5 bg-stone-900/35 rounded-full -mt-0.5 transition-opacity duration-150 ${
                  isDraggingThis ? 'opacity-30' : 'opacity-100'
                }`} />
              </div>

              {/* Top Bar: App Badge, Contact Title, and Action Buttons */}
              <div className={`relative min-h-[24px] pt-0.5 ${hasBody ? 'pb-0' : 'pb-0.5'}`}>
                <div
                  className="flex min-w-0 items-center gap-1.5 h-6 w-full"
                  style={isSelected ? {
                    WebkitMaskImage: `linear-gradient(to right, black calc(100% - ${node.sourceAppId ? 88 : 56}px), transparent calc(100% - ${node.sourceAppId ? 58 : 28}px))`,
                    maskImage: `linear-gradient(to right, black calc(100% - ${node.sourceAppId ? 88 : 56}px), transparent calc(100% - ${node.sourceAppId ? 58 : 28}px))`,
                  } : undefined}
                >
                  <span className="relative flex shrink-0 items-center">
                  {avatarName && <ContactAvatar name={avatarName} size={24} />}
                  {sourceApp ? (
                    <span
                      className={`flex shrink-0 items-center justify-center overflow-hidden text-white ${avatarName ? 'absolute -right-1 -top-1 h-3 w-3 rounded ring-1 ring-[#FFFDF5]' : 'h-5 w-5 rounded-md'} ${sourceApp.iconAsset ? '' : `bg-gradient-to-br ${sourceApp.themeGradient}`}`}
                      title={sourceApp.displayName}
                      role="img"
                      aria-label={sourceApp.displayName}
                    >
                      {sourceApp.iconAsset ? (
                        <img src={sourceApp.iconAsset} alt="" aria-hidden="true" draggable={false} className="h-full w-full" />
                      ) : <sourceApp.icon className={avatarName ? 'h-2 w-2' : 'text-sm'} />}
                    </span>
                  ) : !avatarName && (
                    <span className="shrink-0 text-xs">{getNodeTypeIcon(node.type, isAlias, isUnmasked)}</span>
                  )}
                  </span>
                  <h4 className="text-[10px] font-bold leading-snug text-stone-900 tracking-tight line-clamp-2">
                    {isAlias && isUnmasked
                      ? `[BÓC TRẦN] ${node.label}`
                      : node.label}
                  </h4>
                </div>

                {/* Card-level Action Buttons: Exactly two buttons [Đến chat] and [Xóa] */}
                <div
                  className={`absolute right-0 top-0.5 h-6 z-10 flex items-center gap-1 ${isSelected ? '' : 'invisible pointer-events-none'}`}
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
                      className="relative flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 hover:bg-rose-100 hover:text-rose-600 text-stone-600 transition-colors active:scale-90 shadow-xs cursor-pointer before:absolute before:-inset-2"
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
                    className="relative flex h-6 w-6 items-center justify-center rounded-md bg-stone-100 hover:bg-rose-100 hover:text-rose-600 text-stone-600 transition-colors active:scale-90 shadow-xs cursor-pointer before:absolute before:-inset-2"
                  >
                    <IoTrashOutline className="text-xs" />
                  </button>
                </div>
              </div>

              {/* Card Body: Reusable Left-Hand Vertical Timeline Rail */}
              {timelineEntries.length > 0 && (
                <div className="pt-0.5">
                  <ClueTimelineRail
                    entries={timelineEntries}
                    isSelected={isSelected}
                    onDeleteItem={onDeleteMessage ? (msgId) => onDeleteMessage(node.nodeId, msgId) : undefined}
                  />
                </div>
              )}

              {/* Special Status Stamped Tags */}
              {isAlias && isUnmasked && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[9px] font-bold text-rose-700">
                  <span>Khớp danh tính</span>
                </div>
              )}
              {hasContradiction && (
                <div className="mt-1.5 inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                  <IoFlashOutline className="text-[10px] shrink-0 text-amber-600" />
                  <span>Mâu thuẫn</span>
                </div>
              )}
            </div>
          );
        })}

        {/* 2. SVG Red String Layer Rendered ON TOP of Notes (z-30) */}
        <svg
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
            const isSelected = selectedEdgeId === edge.edgeId;
            const isCanonical = edge.isCanonical ?? (
              edge.edgeId in {
                edge_alias_phone: 1,
                edge_order_phone: 1,
                edge_order_name: 1,
                edge_name_suspect: 1,
                edge_alibi_contradiction: 1,
              } || !edge.edgeId.startsWith('custom_edge_')
            );
            const { pathD } = calculateYarnStringCurve(x1, y1, x2, y2, isContradiction);

            // Yarn color mapping:
            // - Selected: vivid active rose #e11d48
            // - Contradiction: amber gold #d97706
            // - All verified/canonical strings: uniform rich crimson red #b91c1c
            // - Speculative unverified strings: muted light red #e07a7a
            const stringStroke = isSelected
              ? '#e11d48'
              : isContradiction
              ? '#d97706'
              : isCanonical
              ? '#b91c1c'
              : '#e07a7a';

            const strokeDasharray = isContradiction
              ? '5 3'
              : undefined;

            // Verified strings always share identical 1.75px thickness regardless of layer
            const strokeWidth = isSelected
              ? '2.5'
              : isContradiction
              ? '1.75'
              : isCanonical
              ? '1.75'
              : '1.25';

            const strokeOpacity = isSelected
              ? 0.95
              : isCanonical
              ? 0.5
              : 0.4;

            return (
              <g
                key={edge.edgeId}
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
                  stroke="#450a0a"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeOpacity={0.16}
                  fill="none"
                  strokeLinecap="round"
                  transform="translate(0.5, 0.75)"
                />
                {/* Slender Detective Yarn */}
                <path
                  d={pathD}
                  stroke={stringStroke}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
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

export const CorkboardCanvas: React.FC<CorkboardCanvasProps> = ({ viewport, ...contentsProps }) => {
  const { placedNodes, activePairing, selectedEdgeId, onSelectCard, onSelectEdge, onSeverEdge, onCancelPairing } = contentsProps;
  const zoomRef = useRef(viewport.zoom);
  useLayoutEffect(() => { zoomRef.current = viewport.zoom; }, [viewport.zoom]);
  const cameraStyle: React.CSSProperties = {
    left: '50%',
    top: '50%',
    transformOrigin: '0 0',
    transform: `translate(${Math.round(-viewport.x * viewport.zoom)}px, ${Math.round(-viewport.y * viewport.zoom)}px) scale(${viewport.zoom})`,
  };
  return (
    <div
      className="notebook-cardboard relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      onClick={() => {
        onSelectCard?.(null);
        onSelectEdge?.(null);
      }}
    >

      {/* Empty State Overlay */}
      {placedNodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none z-20">
          <div className="h-16 w-16 rounded-3xl bg-[var(--notebook-paper)] border border-[var(--notebook-border)] shadow-md flex items-center justify-center text-[#C2185B] text-3xl mb-3">
            <IoBookOutline />
          </div>
          <h3 className="text-sm font-extrabold text-stone-800 uppercase tracking-wider">
            CHƯA CÓ MANH MỐI NÀO
          </h3>
          <p className="mt-1 text-xs text-stone-700 max-w-xs leading-relaxed">
            Khám phá các ứng dụng trên điện thoại.
            <br />
            <strong>Nhấn giữ</strong> nội dung đáng ngờ để lưu manh mối vào Sổ tay.
          </p>
        </div>
      )}

      {/* Pairing Banner Indicator */}
      {activePairing.sourceNodeId && (
        <div className="absolute top-2 left-4 right-4 z-40 flex items-center justify-between rounded-xl bg-rose-50 border border-rose-300 p-2.5 px-4 text-xs font-semibold text-rose-900 shadow-xl animate-pulse">
          <span>ĐANG NỐI DÂY: Chạm thẻ thứ hai để kết nối...</span>
          <button
            type="button"
            onClick={onCancelPairing}
            className="flex items-center gap-1 rounded-lg bg-rose-700/80 hover:bg-rose-600 px-2.5 py-1 text-[11px] text-white active:scale-95"
          >
            <IoCloseOutline className="text-base" /> Huỷ
          </button>
        </div>
      )}

      {/* Zoomable & Pannable Virtual Plane */}
      <div
        className="absolute"
        style={{
          width: `${CANVAS_SIZE}px`,
          height: `${CANVAS_SIZE}px`,
          ...cameraStyle,
        }}
      >
        <CorkboardContents {...contentsProps} zoomRef={zoomRef} />
      </div>

      {/* Selected Edge Action Popover */}
      {selectedEdgeId && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl bg-[var(--notebook-paper)] border border-[var(--notebook-border)] p-2 px-3 shadow-2xl">
          <span className="text-xs font-medium text-stone-800">Đã chọn sợi dây đỏ</span>
          <button
            type="button"
            onClick={() => onSeverEdge(selectedEdgeId)}
            className="flex items-center gap-1 rounded-xl bg-red-600 hover:bg-red-500 px-3 py-1.5 text-xs font-bold text-white shadow active:scale-95"
          >
            <IoCutOutline className="text-sm" /> Cắt dây
          </button>
          <button
            type="button"
            onClick={() => onSelectEdge(null)}
            className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 hover:bg-amber-200 text-stone-800"
          >
            <IoCloseOutline className="text-base" />
          </button>
        </div>
      )}
    </div>
  );
};
