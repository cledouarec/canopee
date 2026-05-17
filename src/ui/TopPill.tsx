import { useState } from 'react';
import { Building2, Download, Image, LogOut, Moon, Sun } from 'lucide-react';
import { useCanopee } from '@/viz/useCanopee';
import { useTheme } from '@/theme/useTheme';
import { ExportModal } from './ExportModal';
import { shortDimensionLabel } from './dimensionLabel';
import prim from './styles/primitives.module.css';
import s from './TopPill.module.css';

function downloadJson(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export interface TopPillProps {
  /** Open the project picker (welcome popup) without discarding the current
   *  org — it stays visible behind the modal. */
  onCloseProject?: () => void;
}

export function TopPill({ onCloseProject }: TopPillProps = {}): JSX.Element {
  const org = useCanopee((s) => s.org);
  const selectedScenarioId = useCanopee((s) => s.selectedScenarioId);
  const renameOrg = useCanopee((s) => s.renameOrg);
  const selectScenario = useCanopee((s) => s.selectScenario);
  const setColorBy = useCanopee((s) => s.setColorBy);
  const exportOrg = useCanopee((s) => s.exportOrg);
  const undo = useCanopee((s) => s.undo);
  const redo = useCanopee((s) => s.redo);
  const canUndo = useCanopee((s) => s.canUndo);
  const canRedo = useCanopee((s) => s.canRedo);
  const isDark = useTheme((s) => s.theme.base === 'dark');
  const toggleTheme = useTheme((s) => s.toggleTheme);

  const [exportOpen, setExportOpen] = useState(false);

  if (!org) return <div data-testid="pill-empty" />;

  const dims = Object.keys(org.taxonomy.dimensions);

  const handleClose = (): void => {
    onCloseProject?.();
  };

  return (
    <div role="toolbar" className={s.toolbar}>
      <span className={s.orgName}>
        <Building2 size={16} aria-hidden className={s.icon} />
        <input
          aria-label="Organization name"
          value={org.name}
          onChange={(e) => renameOrg(e.target.value)}
          className={s.nameInput}
        />
      </span>

      <span className={s.label}>Scenario ·</span>
      <select
        aria-label="Scenario"
        value={selectedScenarioId}
        onChange={(e) => selectScenario(e.target.value)}
        className={prim.pillSelect}
      >
        <option value="current">Current</option>
        {org.scenarios
          .filter((s) => s.id !== 'current')
          .map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
      </select>

      <span className={s.label}>Color by ·</span>
      <select
        aria-label="Color by"
        value={org.taxonomy.colorBy}
        onChange={(e) => setColorBy(e.target.value)}
        className={prim.pillSelect}
      >
        <option value="">(none)</option>
        {dims.map((d) => (
          <option key={d} value={d}>
            {shortDimensionLabel(org.taxonomy.dimensions[d].label)}
          </option>
        ))}
      </select>

      <button
        aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
        onClick={() => toggleTheme()}
        className={prim.pill}
      >
        {isDark ? <Sun size={14} aria-hidden /> : <Moon size={14} aria-hidden />}
      </button>

      <button aria-label="Undo" disabled={!canUndo} onClick={() => undo()} className={prim.pill}>
        ↶
      </button>
      <button aria-label="Redo" disabled={!canRedo} onClick={() => redo()} className={prim.pill}>
        ↷
      </button>

      <button
        onClick={() => downloadJson(`${org.name || 'organization'}.orga.json`, exportOrg())}
        className={s.iconBtn}
      >
        <Download size={14} aria-hidden />
        Export
      </button>
      <button aria-label="Export image" onClick={() => setExportOpen(true)} className={s.iconBtn}>
        <Image size={14} aria-hidden />
        Export image
      </button>

      <button aria-label="Close project" onClick={handleClose} className={s.dangerBtn}>
        <LogOut size={14} aria-hidden />
        Close project
      </button>
      {exportOpen && <ExportModal onClose={() => setExportOpen(false)} />}
    </div>
  );
}
