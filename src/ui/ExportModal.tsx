import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { buildDirectorySvg, type DirectoryLayout } from '@/export/directorySvg';
import { downloadFile } from '@/export/download';
import { buildGraphSvg } from '@/export/graphSvg';
import { domPngEncoder, svgToPngDataUrl } from '@/export/raster';
import type {
  ExportBackground,
  ExportContent,
  ExportFormat,
  ExportThemeTokens,
} from '@/export/types';
import { computeLayout } from '@/layout/elkAdapter';
import type { Id, XY } from '@/model/types';
import { resolveScenario } from '@/scenarios/resolve';
import { useTheme } from '@/theme/useTheme';
import { useCanopee } from '@/viz/useCanopee';
import s from './ExportModal.module.css';

export function ExportModal({ onClose }: { onClose: () => void }): JSX.Element {
  const org = useCanopee((s) => s.org);
  const selectedScenarioId = useCanopee((s) => s.selectedScenarioId);
  const theme = useTheme((s) => s.theme);

  const [content, setContent] = useState<ExportContent>('graph');
  const [graphLayout, setGraphLayout] = useState<'free' | 'tb' | 'lr'>('free');
  const [dirLayout, setDirLayout] = useState<DirectoryLayout>('grid');
  const [format, setFormat] = useState<ExportFormat>('svg');
  const [background, setBackground] = useState<ExportBackground>('theme');
  const [positions, setPositions] = useState<Map<Id, XY>>(new Map());

  // `theme` is a stable zustand reference; memoize so the `svg` useMemo below
  // is not defeated by a fresh tokens object every render.
  const tokens: ExportThemeTokens = useMemo(
    () => ({
      bg: theme.tokens.bg,
      surface: theme.tokens.surface,
      text: theme.tokens.text,
      border: theme.tokens.border,
      accent: theme.tokens.accent,
    }),
    [theme],
  );

  const state = useMemo(
    () => (org ? resolveScenario(org, selectedScenarioId) : null),
    [org, selectedScenarioId],
  );

  useEffect(() => {
    let alive = true;
    if (state && org && content === 'graph') {
      computeLayout(state, graphLayout, { taxonomy: org.taxonomy }).then((p) => {
        if (alive) setPositions(p);
      });
    }
    return () => {
      alive = false;
    };
  }, [state, org, content, graphLayout]);

  const svg = useMemo(() => {
    if (!state || !org) return '';
    return content === 'graph'
      ? buildGraphSvg(state, org.taxonomy, positions, tokens, background)
      : buildDirectorySvg(state, org.taxonomy, tokens, dirLayout, background);
  }, [state, org, content, positions, dirLayout, background, tokens]);

  const baseName = (): string => (org?.name || 'canopee').replace(/\s+/g, '-').toLowerCase();

  /** Synchronous so the SVG download stays in the click's user activation. */
  function exportNow(): void {
    if (format === 'svg') {
      downloadFile(`${baseName()}.svg`, svg);
    } else {
      void svgToPngDataUrl(svg, domPngEncoder).then((png) =>
        downloadFile(`${baseName()}.png`, png, true),
      );
    }
  }

  return createPortal(
    <div role="dialog" aria-label="Export image" className={s.scrim}>
      <div className={s.card}>
        <div role="radiogroup" aria-label="Content" className={s.radioRow}>
          <label>
            <input
              type="radio"
              name="content"
              aria-label="Graph"
              checked={content === 'graph'}
              onChange={() => setContent('graph')}
            />{' '}
            Graph
          </label>
          <label>
            <input
              type="radio"
              name="content"
              aria-label="Directory"
              checked={content === 'directory'}
              onChange={() => setContent('directory')}
            />{' '}
            Directory
          </label>
        </div>

        <div className={s.controls}>
          {content === 'graph' ? (
            <select
              aria-label="Graph layout"
              value={graphLayout}
              onChange={(e) => setGraphLayout(e.target.value as 'free' | 'tb' | 'lr')}
            >
              <option value="free">Free</option>
              <option value="tb">Top-bottom</option>
              <option value="lr">Left-right</option>
            </select>
          ) : (
            <select
              aria-label="Directory layout"
              value={dirLayout}
              onChange={(e) => setDirLayout(e.target.value as DirectoryLayout)}
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </select>
          )}
          <select
            aria-label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value as ExportFormat)}
          >
            <option value="svg">SVG</option>
            <option value="png">PNG</option>
          </select>
          <select
            aria-label="Background"
            value={background}
            onChange={(e) => setBackground(e.target.value as ExportBackground)}
          >
            <option value="theme">Theme background</option>
            <option value="transparent">Transparent</option>
          </select>
        </div>

        {state ? (
          <div
            data-testid="export-preview"
            className={s.preview}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div data-testid="export-empty" className={s.empty}>
            Load an organization to export an image.
          </div>
        )}

        <div className={s.actions}>
          <button onClick={onClose}>Close</button>
          <button disabled={!state} onClick={exportNow} className={s.exportBtn}>
            Export
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
