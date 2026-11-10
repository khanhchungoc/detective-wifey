import React, { memo, useMemo } from 'react';
import { CANVAS_SIZE } from '../graphEngine';
import type { CorkboardViewport, PlacedNode } from '../types';

interface MiniMapRadarProps {
  viewport: CorkboardViewport;
  placedNodes: PlacedNode[];
  onCenterCluster: () => void;
  size?: number;
}

export const MiniMapRadar: React.FC<MiniMapRadarProps> = memo(function MiniMapRadar({
  viewport,
  placedNodes,
  onCenterCluster,
  size = 56,
}) {
  const RADAR_SIZE = size; // px
  const scale = RADAR_SIZE / CANVAS_SIZE;

  // Approximate mobile viewport dimensions in canvas coordinates
  const viewW = Math.min(CANVAS_SIZE, (393 / viewport.zoom) * scale);
  const viewH = Math.min(CANVAS_SIZE, (680 / viewport.zoom) * scale);
  const viewX = Math.max(0, Math.min(RADAR_SIZE - viewW, (viewport.x * scale) - (viewW / 2)));
  const viewY = Math.max(0, Math.min(RADAR_SIZE - viewH, (viewport.y * scale) - (viewH / 2)));
  const dots = useMemo(() => placedNodes.map(node => (
    <span
      key={node.nodeId}
      className="absolute left-0 top-0 h-1 w-1 rounded-full bg-[#EF4444]"
      style={{
        transform: `translate(${node.x * scale}px, ${node.y * scale}px)`,
      }}
    />
  )), [placedNodes, scale]);

  return (
    <button
      type="button"
      aria-label="Thu nhỏ bản đồ / Định vị"
      onClick={onCenterCluster}
      className="relative rounded-xl border border-white/15 bg-[#1B1511]/90 shadow-inner overflow-hidden flex items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300 active:scale-95 transition-transform shrink-0"
      style={{ width: `${RADAR_SIZE}px`, height: `${RADAR_SIZE}px` }}
    >
      {/* Node dots */}
      {dots}

      {/* Viewport indicator rectangle */}
      <div
        className="absolute left-0 top-0 border border-[#EF4444] bg-red-500/20 rounded-sm pointer-events-none"
        style={{
          transform: `translate(${viewX}px, ${viewY}px)`,
          width: `${Math.max(8, viewW)}px`,
          height: `${Math.max(8, viewH)}px`,
        }}
      />
    </button>
  );
});
