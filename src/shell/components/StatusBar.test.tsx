import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { StatusBar } from './StatusBar';

describe('status bar contrast', () => {
  it.each(['#FFFFFF', '#F3F4F6'])('uses dark indicators on %s', backgroundColor => {
    const currentDate = new Date(2026, 9, 21, 9, 7);
    const html = renderToStaticMarkup(<StatusBar currentDate={currentDate} backgroundColor={backgroundColor} />);
    expect(html).toContain('color:#000000');
    expect(html).not.toContain('text-white');
    expect(html).toContain('09:07');
    expect(html).toContain('Pin 69%');
  });

  it.each(['#000000', '#464EB8', '#ED1C24', '#0088FF', '#EE4D2D', 'transparent'])('uses light indicators on %s', backgroundColor => {
    expect(renderToStaticMarkup(<StatusBar currentDate={new Date(2026, 9, 15, 23, 45)} backgroundColor={backgroundColor} />)).toContain('color:#FFFFFF');
  });

  it('keeps app contrast while leaving the background to the moving app surface', () => {
    const html = renderToStaticMarkup(<StatusBar currentDate={new Date(2026, 9, 15, 23, 45)} backgroundColor="#FFFFFF" overlay />);
    expect(html).toContain('background-color:transparent');
    expect(html).toContain('color:#000000');
    expect(html).not.toContain('transition-colors');
  });
});
