/** Trigger a browser download of `content` (text) or a data URL. */
export function downloadFile(filename: string, content: string, isDataUrl = false): void {
  const href = isDataUrl
    ? content
    : // application/octet-stream so the browser always downloads (a
      // renderable type like image/svg+xml can open inline instead).
      URL.createObjectURL(new Blob([content], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = href;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick: revoking synchronously can abort the download
  // before the browser has fetched the blob. Optional-chained because
  // revokeObjectURL is an optional browser API (absent under jsdom).
  if (!isDataUrl) setTimeout(() => URL.revokeObjectURL?.(href), 0);
}
