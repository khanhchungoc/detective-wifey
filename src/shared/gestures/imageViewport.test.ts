import { describe, expect, it } from 'vitest';
import { clampImage, fitImage, focusImagePoint, zoomImage } from './imageViewport';

describe('imageViewport', () => {
  const bounds = { width: 390, height: 700, imageWidth: 390, imageHeight: 700 };

  it('clamps zoom to [1, 5] and keeps pan inside zoomed image bounds', () => {
    expect(clampImage({ zoom: 0.5, x: 200, y: -200 }, bounds)).toEqual(fitImage);
    expect(clampImage({ zoom: 6, x: 9999, y: -9999 }, bounds)).toEqual({
      zoom: 5,
      x: 780,
      y: -1400,
    });
  });

  it('keeps the focal point anchored during pinch/wheel zoom', () => {
    const zoomed = zoomImage(fitImage, 2, { x: 50, y: -40 }, bounds);
    expect(zoomed).toEqual({ zoom: 2, x: -50, y: 40 });
  });

  it('centers a forensic hotspot percentage coordinate inside clamped bounds', () => {
    const centered = focusImagePoint({ x: 50, y: 50 }, 2.5, bounds);
    expect(centered).toEqual({ zoom: 2.5, x: 0, y: 0 });

    const topLeft = focusImagePoint({ x: 10, y: 20 }, 2.5, bounds);
    expect(topLeft.zoom).toBe(2.5);
    expect(topLeft.x).toBeGreaterThan(0);
    expect(topLeft.y).toBeGreaterThan(0);
    expect(topLeft.x).toBeLessThanOrEqual((bounds.imageWidth * 2.5 - bounds.width) / 2);
    expect(topLeft.y).toBeLessThanOrEqual((bounds.imageHeight * 2.5 - bounds.height) / 2);
  });
});
