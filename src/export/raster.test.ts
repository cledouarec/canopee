import { describe, it, expect, vi } from 'vitest';
import { svgToPngDataUrl, svgDataUrl } from './raster';

describe('svgDataUrl', () => {
  it('base64-encodes the SVG as a data URL', () => {
    const url = svgDataUrl('<svg/>');
    expect(url.startsWith('data:image/svg+xml;base64,')).toBe(true);
    const b64 = url.split(',')[1];
    const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    expect(new TextDecoder().decode(bytes)).toBe('<svg/>');
  });
});

describe('svgToPngDataUrl', () => {
  it('delegates rasterization to the injected encoder', async () => {
    const encode = vi.fn(async (svg: string, w: number, h: number) => {
      expect(svg).toContain('<svg');
      expect(w).toBe(100);
      expect(h).toBe(50);
      return 'data:image/png;base64,ZZZ';
    });
    const out = await svgToPngDataUrl(
      '<svg width="100" height="50"><rect/></svg>',
      encode,
    );
    expect(out).toBe('data:image/png;base64,ZZZ');
    expect(encode).toHaveBeenCalledOnce();
  });

  it('reads width/height from the svg root for the encoder', async () => {
    const encode = vi.fn(async () => 'data:image/png;base64,Q');
    await svgToPngDataUrl('<svg width="640" height="480"></svg>', encode);
    expect(encode).toHaveBeenCalledWith(expect.any(String), 640, 480);
  });

  it('throws a clear error when no encoder is available', async () => {
    await expect(
      svgToPngDataUrl('<svg width="10" height="10"></svg>', undefined),
    ).rejects.toThrow(/PNG/);
  });
});
