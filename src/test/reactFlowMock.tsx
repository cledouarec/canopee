import type { ReactNode } from 'react';

/**
 * Shared React Flow test double. Tests mock the module with
 * `vi.mock('reactflow', () => import('@/test/reactFlowMock'))` and read the
 * last props handed to `<ReactFlow>` via the shared `rfCapture` (reset it in
 * `beforeEach`). Keeps every spec's mock identical and in one place.
 */
export const rfCapture: { nodes?: any[]; edges?: any[] } = {};

export default function ReactFlowMock(props: {
  nodes?: unknown[];
  edges?: unknown[];
}): JSX.Element {
  rfCapture.nodes = props.nodes as any[] | undefined;
  rfCapture.edges = props.edges as any[] | undefined;
  return <div data-testid="rf" />;
}

export const Background = (): null => null;
export const BackgroundVariant = { Lines: 'lines', Dots: 'dots', Cross: 'cross' } as const;
export const Controls = (): null => null;
export const Handle = (): null => null;
export const Position = { Top: 'top', Bottom: 'bottom', Left: 'left', Right: 'right' } as const;
export const MarkerType = { Arrow: 'arrow', ArrowClosed: 'arrowclosed' } as const;

export function ReactFlowProvider({ children }: { children: ReactNode }): JSX.Element {
  return <>{children}</>;
}

export function useReactFlow(): {
  zoomIn: () => void;
  zoomOut: () => void;
  zoomTo: (zoom: number, opts?: unknown) => void;
} {
  return { zoomIn: () => {}, zoomOut: () => {}, zoomTo: () => {} };
}

export function useViewport(): { x: number; y: number; zoom: number } {
  return { x: 0, y: 0, zoom: 1 };
}
