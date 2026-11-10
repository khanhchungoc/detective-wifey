import { describe, expect, it } from 'vitest';
import {
  clampFloatingPoint, floatingDockPosition, floatingVelocity, projectFloatingDock, isFloatingDetached,
  notebookPullOffset, notebookTabPullX, shouldCommitNotebookPull,
  NOTEBOOK_FLOAT_SIZE, NOTEBOOK_TAB_WIDTH, NOTEBOOK_TAB_HEIGHT,
} from './floatingControlPosition';

const bounds = { left: 12, right: 254, top: 67, bottom: 716 };
describe('floating overlay button docking and physics', () => {
  it('uses pill overlay dimensions and detects inward detachment only past clearance', () => {
    expect(NOTEBOOK_TAB_WIDTH).toBe(124);
    expect(NOTEBOOK_TAB_HEIGHT).toBe(54);
    expect(NOTEBOOK_FLOAT_SIZE).toBe(NOTEBOOK_TAB_HEIGHT);
    expect(isFloatingDetached({ x: bounds.right, y: 400 }, bounds)).toBe(false);
    expect(isFloatingDetached({ x: bounds.left, y: 500 }, bounds)).toBe(false);
    expect(isFloatingDetached({ x: 100, y: 400 }, bounds)).toBe(true);
  });
  it('always docks on the right edge even when flicked left to avoid overlapping iOS back gestures', () => {
    const wide = { ...bounds, right: 1400 };
    expect(projectFloatingDock({ x: 1300, y: 400 }, { x: -.6, y: 0 }, wide).edge).toBe('right');
    expect(projectFloatingDock({ x: 60, y: 400 }, { x: -.9, y: 0 }, bounds).edge).toBe('right');
    expect(projectFloatingDock({ x: 150, y: 400 }, { x: .2, y: 0 }, bounds).point.x).toBe(bounds.right);
  });
  it('computes 1:1 horizontal pull offset and commit threshold', () => {
    expect(notebookPullOffset(390, -140, false)).toBe(250);
    expect(notebookPullOffset(390, -500, false)).toBe(0);
    expect(notebookPullOffset(390, 40, false)).toBe(390);
    expect(notebookTabPullX(390, bounds)).toBe(bounds.right);
    expect(notebookTabPullX(0, bounds)).toBe(bounds.left);
    expect(shouldCommitNotebookPull(250, 390, 0, false)).toBe(true);
    expect(shouldCommitNotebookPull(320, 390, 0, false)).toBe(false);
    expect(shouldCommitNotebookPull(350, 390, -.6, false)).toBe(true);
    expect(shouldCommitNotebookPull(100, 390, .6, false)).toBe(false);
  });
  it('carries vertical momentum and clamps away from status and home areas', () => {
    expect(projectFloatingDock({ x: 240, y: 400 }, { x: 0, y: 1 }, bounds).point.y).toBe(580);
    expect(projectFloatingDock({ x: 240, y: 100 }, { x: 0, y: -3 }, bounds).point.y).toBe(67);
    expect(projectFloatingDock({ x: 240, y: 700 }, { x: 0, y: 3 }, bounds).point.y).toBe(716);
    expect(clampFloatingPoint({ x: -20, y: 900 }, bounds)).toEqual({ x: 12, y: 716 });
  });
  it('snaps without inertia for cancellation or reduced motion', () => {
    expect(projectFloatingDock({ x: 200, y: 400 }, { x: -5, y: 5 }, bounds, false).point).toEqual({ x: 254, y: 400 });
  });
  it('preserves relative dock position across resize and safely handles tiny hosts', () => {
    const dock = projectFloatingDock({ x: 0, y: (67 + 716) / 2 }, { x: 0, y: 0 }, bounds);
    expect(floatingDockPosition(dock.edge, dock.fraction, { left: 10, right: 700, top: 50, bottom: 550 })).toEqual({ x: 700, y: 300 });
    expect(floatingDockPosition('right', 2, { left: 0, right: 0, top: 52, bottom: 52 })).toEqual({ x: 0, y: 52 });
  });
  it('uses recent release velocity and discards paused or stale flicks', () => {
    expect(floatingVelocity([{ x: 100, y: 200, time: 10 }], { x: 50, y: 240, time: 60 })).toEqual({ x: -1, y: .8 });
    expect(floatingVelocity([{ x: 100, y: 200, time: 10 }], { x: 50, y: 240, time: 160 })).toEqual({ x: 0, y: 0 });
  });
});
