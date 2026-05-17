import { useEffect, useState } from 'react';
import { useReactFlow, useViewport } from 'reactflow';
import type { LayoutMode } from '@/layout/types';
import { useViewPrefs } from '@/viz/useViewPrefs';
import s from './BottomDock.module.css';
import prim from './styles/primitives.module.css';

const MODES: { mode: LayoutMode; label: string; glyph: string }[] = [
  { mode: 'free', label: 'Free layout', glyph: '⋄' },
  { mode: 'tb', label: 'Top-bottom layout', glyph: '↓' },
  { mode: 'lr', label: 'Left-right layout', glyph: '→' },
  { mode: 'bands', label: 'Bands layout', glyph: '☰' },
];

function Separator(): JSX.Element {
  return <div aria-hidden className={s.sep} />;
}

/** Editable zoom percentage. Commits on Enter / blur; clamped to 10–400 %. */
function ZoomLevel({ enabled }: { enabled: boolean }): JSX.Element {
  const zoom = useViewport().zoom;
  const { zoomTo } = useReactFlow();
  const [draft, setDraft] = useState(String(Math.round(zoom * 100)));

  useEffect(() => {
    setDraft(String(Math.round(zoom * 100)));
  }, [zoom]);

  const commit = (): void => {
    const pct = Number(draft);
    if (enabled && Number.isFinite(pct) && pct > 0) {
      zoomTo(Math.min(400, Math.max(10, pct)) / 100);
    } else {
      setDraft(String(Math.round(zoom * 100)));
    }
  };

  return (
    <span className={s.zoom}>
      <input
        aria-label="Zoom level"
        disabled={!enabled}
        value={draft}
        inputMode="numeric"
        onChange={(e) => setDraft(e.target.value.replace(/[^\d]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
        className={s.zoomInput}
      />
      <span className={s.pct}>%</span>
    </span>
  );
}

export interface BottomDockProps {
  /** Zoom controls are inert unless the graph canvas is the active view. */
  graphActive: boolean;
}

export function BottomDock({ graphActive }: BottomDockProps): JSX.Element {
  const prefs = useViewPrefs((s) => s.prefs);
  const setLayoutMode = useViewPrefs((s) => s.setLayoutMode);
  const toggleExpandAll = useViewPrefs((s) => s.toggleExpandAll);
  const { zoomIn, zoomOut } = useReactFlow();

  return (
    <div role="group" aria-label="Canvas controls" className={s.dock}>
      {MODES.map((m) => (
        <button
          key={m.mode}
          aria-label={m.label}
          aria-pressed={prefs.layoutMode === m.mode}
          onClick={() => setLayoutMode(m.mode)}
          className={prefs.layoutMode === m.mode ? prim.pill : prim.pillGhost}
        >
          {m.glyph} {m.label}
        </button>
      ))}
      <button
        aria-label="Expand all"
        aria-pressed={prefs.expandAll}
        onClick={() => toggleExpandAll()}
        className={prefs.expandAll ? prim.pill : prim.pillGhost}
      >
        ⤡ Expand all
      </button>

      <Separator />
      <button
        aria-label="Zoom out"
        disabled={!graphActive}
        onClick={() => zoomOut()}
        className={prim.pillGhost}
      >
        −
      </button>
      <ZoomLevel enabled={graphActive} />
      <button
        aria-label="Zoom in"
        disabled={!graphActive}
        onClick={() => zoomIn()}
        className={prim.pillGhost}
      >
        +
      </button>
    </div>
  );
}
