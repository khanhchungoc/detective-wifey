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
const CORNER = 8;
const CORNER_EASE = 2.3;

const span = `(100% - ${TAB_W})`;

/** Left edge of the tab paper, relative to the sheet width. */
export function tabShapeLeft(index: number, total: number): string {
  return index === 0 || total <= 1 ? '0px' : `calc(${span} * ${index / (total - 1)})`;
}

/** The part of the tab not covered by the tab in front: where the label sits and the button taps. */
export function tabButtonBox(index: number, total: number): { left: string; width: string } {
  if (index === 0 || total <= 1) return { left: '0px', width: TAB_W };
  const step = `calc(${span} / ${total - 1})`;
  return { left: `calc(${tabShapeLeft(index, total)} + ${TAB_W} - ${step})`, width: step };
}

/**
 * Tap and label area of a TURNED sheet's tab. Turned tabs stack the other way (higher index in
 * front), so each one shows its left `step` and nothing spills onto the tab beside it.
 */
export function tabTurnedBox(index: number, total: number): { left: string; width: string } {
  return { left: tabShapeLeft(index, total), width: total <= 1 ? TAB_W : `calc(${span} / ${total - 1})` };
}

/** Clip outline of a sheet whose box starts at the tab top: sheet body plus its tab, one silhouette. */
export function sheetClip(index: number, total: number): string {
  const l = tabShapeLeft(index, total);
  const at = (dx: string) => `calc(${l} + ${dx})`;
  const pts = [
    `0 ${TAB_H}`,
    `${l} ${TAB_H}`,
    `${l} ${SHOULDER_Y}`,
    `${at(SHOULDER_X)} 0`,
    `${at(`${TAB_W} - ${SHOULDER_X}`)} 0`,
    `${at(TAB_W)} ${SHOULDER_Y}`,
    `${at(TAB_W)} ${TAB_H}`,
    `100% ${TAB_H}`,
    `100% calc(100% - ${CORNER}px)`,
    `calc(100% - ${CORNER_EASE}px) calc(100% - ${CORNER_EASE}px)`,
    `calc(100% - ${CORNER}px) 100%`,
    `${CORNER}px 100%`,
    `${CORNER_EASE}px calc(100% - ${CORNER_EASE}px)`,
    `0 calc(100% - ${CORNER}px)`,
  ];
  return `polygon(${pts.join(', ')})`;
}

/** Outline of the free-standing tab of a turned sheet (open at the bottom, tucked behind the sheet in front). */
export const TURNED_TAB_CLIP = `polygon(0 100%, 0 ${SHOULDER_Y}, ${SHOULDER_X} 0, calc(100% - ${SHOULDER_X}) 0, 100% ${SHOULDER_Y}, 100% 100%)`;
