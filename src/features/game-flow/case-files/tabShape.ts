/**
 * Geometry of a sheet's index tab: ONE source for the sheet outline (sheet + tab as one cut piece of
 * card), the tappable tab button, and the label. Tabs are staggered across the sheet width and each
 * overlaps its neighbour; the sheet in front covers the left part of the tab behind it.
 */

/** Full tab width (Tailwind w-24). */
export const TAB_W = '6rem';
/** Tab height above the sheet body (Tailwind h-12). */
export const TAB_H = '3rem';
const SHOULDER_Y = '0.96rem';
const SHOULDER_X = '9px';
const CORNER = 5;
const CORNER_EASE = 1.6;

const span = `(100% - ${TAB_W})`;

/** Left edge of the tab paper, relative to the sheet width. */
export function tabShapeLeft(index: number, total: number): string {
  return index === 0 || total <= 1 ? '0px' : `calc(${span} * ${index / (total - 1)})`;
}

/** The bounds of a sheet's real index tab, aligned with sheetClip(index, total). */
export function tabButtonBox(index: number, total: number): { left: string; width: string } {
  return { left: tabShapeLeft(index, total), width: TAB_W };
}

/** Deterministic pseudo-random value in [0, 1) so each stacked sheet has a unique stable edge. */
function edgeNoise(seed: number, step: number): number {
  const raw = Math.sin(seed * 91.3 + step * 217.9) * 43758.5453123;
  return raw - Math.floor(raw);
}

/**
 * Clip outline of a sheet whose box starts at the tab top: sheet body plus its tab, one
 * hand-cut cardstock silhouette with subtle organic edge variation and worn blunted corners.
 */
export function sheetClip(index: number, total: number): string {
  const l = tabShapeLeft(index, total);
  const at = (dx: string) => `calc(${l} + ${dx})`;
  const seed = index * 23 + 7;
  let step = 1;

  const jitterPx = (max = 1.9): string => {
    const n = edgeNoise(seed, step++);
    const nick = n > 0.87 ? (n - 0.87) * 5.2 : 0;
    return `${(n * max + nick).toFixed(1)}px`;
  };

  const pts: string[] = [];

  // 1. Left top shoulder (only when tab is not flush-left)
  if (index > 0 && total > 1) {
    const ratio = index / (total - 1);
    const shoulderSteps = Math.max(2, Math.round(ratio * 6));
    pts.push(`${jitterPx(1.2)} calc(${TAB_H} + ${jitterPx(1.3)})`);
    for (let i = 1; i < shoulderSteps; i += 1) {
      const f = (ratio * i) / shoulderSteps;
      pts.push(`calc(${span} * ${f.toFixed(4)}) calc(${TAB_H} + ${jitterPx(1.6)})`);
    }
    pts.push(`${l} calc(${TAB_H} + ${jitterPx(1.0)})`);
  } else {
    pts.push(`${jitterPx(1.1)} ${TAB_H}`);
  }

  // 2. Tab left vertical & worn angled shoulder
  pts.push(`calc(${l} + ${jitterPx(1.0)}) calc(${SHOULDER_Y} + ${jitterPx(0.8)})`);
  pts.push(`${at(`4px + ${jitterPx(0.8)}`)} calc(0.32rem + ${jitterPx(0.7)})`);
  pts.push(`${at(`${SHOULDER_X} + ${jitterPx(0.8)}`)} ${jitterPx(1.2)}`);

  // 3. Tab top edge (organic deckle)
  const tabTopSteps = 4;
  for (let i = 1; i < tabTopSteps; i += 1) {
    const px = (i / tabTopSteps) * (96 - 18) + 9;
    pts.push(`${at(`${px.toFixed(1)}px`)} ${jitterPx(1.4)}`);
  }

  // 4. Tab right worn angled shoulder & vertical
  pts.push(`${at(`${TAB_W} - ${SHOULDER_X} - ${jitterPx(0.8)}`)} ${jitterPx(1.2)}`);
  pts.push(`${at(`${TAB_W} - 4px - ${jitterPx(0.8)}`)} calc(0.32rem + ${jitterPx(0.7)})`);
  pts.push(`${at(`${TAB_W} - ${jitterPx(1.0)}`)} calc(${SHOULDER_Y} + ${jitterPx(0.8)})`);
  pts.push(`${at(TAB_W)} calc(${TAB_H} + ${jitterPx(1.0)})`);

  // 5. Right top shoulder (only when tab is not flush-right)
  if (index < total - 1 && total > 1) {
    const ratio = index / (total - 1);
    const remaining = 1 - ratio;
    const rightSteps = Math.max(2, Math.round(remaining * 6));
    for (let i = 1; i < rightSteps; i += 1) {
      const t = i / rightSteps;
      const pct = (ratio + remaining * t) * 100;
      const rem = remaining * (1 - t) * 6;
      pts.push(`calc(${pct.toFixed(3)}% + ${rem.toFixed(3)}rem) calc(${TAB_H} + ${jitterPx(1.6)})`);
    }
    pts.push(`calc(100% - ${jitterPx(1.2)}) calc(${TAB_H} + ${jitterPx(1.2)})`);
  } else {
    pts.push(`calc(100% - ${jitterPx(1.1)}) ${TAB_H}`);
  }

  // 6. Right edge (top -> bottom)
  const sideSteps = 16;
  for (let i = 1; i < sideSteps; i += 1) {
    const t = i / sideSteps;
    pts.push(
      `calc(100% - ${jitterPx(2.0)}) calc(${TAB_H} + (100% - ${TAB_H} - ${CORNER}px) * ${t.toFixed(4)})`,
    );
  }

  // 7. Bottom-right worn corner
  pts.push(`calc(100% - ${jitterPx(1.0)}) calc(100% - ${CORNER}px)`);
  pts.push(`calc(100% - ${CORNER_EASE}px) calc(100% - ${CORNER_EASE}px)`);
  pts.push(`calc(100% - ${CORNER}px) calc(100% - ${jitterPx(1.0)})`);

  // 8. Bottom edge (right -> left)
  const bottomSteps = 12;
  for (let i = 1; i < bottomSteps; i += 1) {
    const pct = (100 - (i / bottomSteps) * 100).toFixed(2);
    pts.push(`${pct}% calc(100% - ${jitterPx(2.0)})`);
  }

  // 9. Bottom-left worn corner
  pts.push(`${CORNER}px calc(100% - ${jitterPx(1.0)})`);
  pts.push(`${CORNER_EASE}px calc(100% - ${CORNER_EASE}px)`);
  pts.push(`${jitterPx(1.0)} calc(100% - ${CORNER}px)`);

  // 10. Left edge (bottom -> top)
  for (let i = 1; i < sideSteps; i += 1) {
    const t = 1 - i / sideSteps;
    pts.push(
      `${jitterPx(2.0)} calc(${TAB_H} + (100% - ${TAB_H} - ${CORNER}px) * ${t.toFixed(4)})`,
    );
  }

  return `polygon(${pts.join(', ')})`;
}
