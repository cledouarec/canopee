import { useEffect, useRef, useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import { applyTheme } from '@/theme/applyTheme';
import { useTheme } from '@/theme/useTheme';
import { Canvas } from '@/viz/Canvas';
import { useCanopee } from '@/viz/useCanopee';
import s from './AppShell.module.css';
import { BottomDock } from './BottomDock';
import { ComparisonView } from './ComparisonView';
import { Inspector } from './Inspector';
import { LeftRail, type RailView } from './LeftRail';
import { ScenariosPanel } from './ScenariosPanel';
import { TopPill } from './TopPill';
import { WelcomeScreen } from './WelcomeScreen';

export function AppShell(): JSX.Element {
  const theme = useTheme((s) => s.theme);
  const reduced = useTheme((s) => s.reducedTransparency);
  const hasOrg = useCanopee((s) => s.org !== null);
  const rootRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<RailView>('graph');
  // The picker is forced open when no org is loaded, or on demand via the
  // top bar's "Close project" (which keeps the current content behind it).
  const [pickerOpen, setPickerOpen] = useState(false);
  const showWelcome = !hasOrg || pickerOpen;

  useEffect(() => {
    if (rootRef.current) applyTheme(rootRef.current, theme, reduced);
  }, [theme, reduced]);

  return (
    <div ref={rootRef} data-testid="app-shell" className={s.shell}>
      {/* One provider so the sibling Canvas and BottomDock share React Flow
          context (the dock drives zoom via `useReactFlow`); inert for the
          scenarios/comparison views where no `<ReactFlow>` is mounted. */}
      <ReactFlowProvider>
        {/* The full shell always renders so the grid/canvas (and any loaded
          content) stay visible behind the picker. */}
        <div className={s.layer}>
          {view === 'comparison' ? (
            <ComparisonView />
          ) : view === 'scenarios' ? (
            <ScenariosPanel />
          ) : (
            <Canvas />
          )}
        </div>

        {/* Floating chrome, overlaid on the canvas like the HTML mock. */}
        <div className={s.top}>
          <TopPill onCloseProject={() => setPickerOpen(true)} />
        </div>

        <div className={s.left}>
          <LeftRail active={view} onSelect={setView} />
        </div>

        <div className={s.right}>
          <Inspector />
        </div>

        <div className={s.bottom}>
          <BottomDock graphActive={view === 'graph'} />
        </div>

        {showWelcome && (
          <WelcomeScreen dismissible={hasOrg} onDismiss={() => setPickerOpen(false)} />
        )}
      </ReactFlowProvider>
    </div>
  );
}
