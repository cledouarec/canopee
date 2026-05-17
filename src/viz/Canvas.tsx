import { useEffect, useMemo, useState } from 'react';
import ReactFlow, { Background, BackgroundVariant, useReactFlow } from 'reactflow';
import { DEFAULT_ZOOM, type Id, type ResolvedState, type Taxonomy, type XY } from '@/model/types';
import { canopeeStore } from '@/store';
import { resolveScenario } from '@/scenarios/resolve';
import { computeLayout } from '@/layout/elkAdapter';
import { buildGraph } from './graphModel';
import { TeamNode } from './TeamNode';
import { useCanopee } from './useCanopee';
import { useViewPrefs } from './useViewPrefs';
import s from './Canvas.module.css';

const nodeTypes = { team: TeamNode };
const EMPTY_STATE: ResolvedState = { teams: [], relationships: [] };
const EMPTY_TAXONOMY: Taxonomy = { colorBy: '', dimensions: {}, relationshipTypes: {} };

function savedZoom(): number {
  return canopeeStore.getState().org?.view.zoom ?? DEFAULT_ZOOM;
}

export function Canvas(): JSX.Element {
  const org = useCanopee((s) => s.org);
  const selectedScenarioId = useCanopee((s) => s.selectedScenarioId);
  const selectedEntity = useCanopee((s) => s.selectedEntity);
  const select = useCanopee((s) => s.select);
  const setViewZoom = useCanopee((s) => s.setViewZoom);
  // Bumped only on new/import/close — the cue to snap to the file's saved
  // zoom. Silent zoom updates don't bump it, so they never re-snap.
  const loadNonce = useCanopee((s) => s.loadNonce);

  const prefs = useViewPrefs((s) => s.prefs);
  const [positions, setPositions] = useState<Map<Id, XY>>(new Map());
  const rf = useReactFlow();

  const state = useMemo(
    () => (org ? resolveScenario(org, selectedScenarioId) : EMPTY_STATE),
    [org, selectedScenarioId],
  );

  useEffect(() => {
    let alive = true;
    computeLayout(state, prefs.layoutMode, { taxonomy: org?.taxonomy }).then((p) => {
      if (alive) setPositions(p);
    });
    return () => {
      alive = false;
    };
  }, [state, org, prefs.layoutMode]);

  // On a real document load (new/import), snap to its saved zoom. `fitView`
  // centred the graph; this only overrides the zoom around that centre.
  // `rf` is a stable instance; `savedZoom()` is read fresh so it isn't a dep.
  useEffect(() => {
    rf.zoomTo(savedZoom(), { duration: 0 });
  }, [loadNonce, rf]);

  const selectedId = selectedEntity?.kind === 'team' ? selectedEntity.id : null;

  const graph = useMemo(
    () => buildGraph(state, org?.taxonomy ?? EMPTY_TAXONOMY, positions, prefs),
    [state, org, positions, prefs],
  );

  // Selection is the only per-click change; map it on without rebuilding
  // edges (so the graph memo above stays stable across selections).
  const nodes = useMemo(
    () => graph.nodes.map((n) => (n.id === selectedId ? { ...n, selected: true } : n)),
    [graph, selectedId],
  );

  return (
    <div className={s.canvas}>
      <ReactFlow
        nodes={nodes}
        edges={graph.edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_e, node) => select({ kind: 'team', id: node.id })}
        onPaneClick={() => select(null)}
        onInit={(inst) => inst.zoomTo(savedZoom(), { duration: 0 })}
        onMoveEnd={(_e, vp) => setViewZoom(vp.zoom)}
        fitView
      >
        <Background variant={BackgroundVariant.Lines} gap={30} color="var(--border)" />
      </ReactFlow>
    </div>
  );
}
