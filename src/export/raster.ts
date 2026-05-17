/** SVG markup → base64 `data:` URL (UTF-8 safe). */
export function svgDataUrl(svg: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(svg)) {
    binary += String.fromCharCode(byte);
  }
  return `data:image/svg+xml;base64,${btoa(binary)}`;
}

/** Rasterizes an SVG to a PNG `data:` URL (browser canvas path). */
export type PngEncoder = (svg: string, width: number, height: number) => Promise<string>;

function readSize(svg: string): { width: number; height: number } {
  const w = Number(/width="(\d+(?:\.\d+)?)"/.exec(svg)?.[1] ?? 800);
  const h = Number(/height="(\d+(?:\.\d+)?)"/.exec(svg)?.[1] ?? 600);
  return { width: w, height: h };
}

/**
 * Convert an SVG string to a PNG data URL using the supplied encoder
 * (default `domPngEncoder` works in a browser; tests inject a fake).
 */
export async function svgToPngDataUrl(
  svg: string,
  encoder: PngEncoder | undefined,
): Promise<string> {
  if (!encoder) {
    throw new Error('PNG export requires a rasterization encoder (browser only).');
  }
  const { width, height } = readSize(svg);
  return encoder(svg, width, height);
}

/** Default browser encoder: draw the SVG onto a canvas and read PNG bytes. */
export const domPngEncoder: PngEncoder = (svg, width, height) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('2D canvas context unavailable.'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => reject(new Error('Failed to rasterize SVG.'));
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  });
