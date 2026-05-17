import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('reactflow', () => import('@/test/reactFlowMock'));

import { resetStores } from '@/test/resetStores';
import { viewPrefsStore } from '@/viz/useViewPrefs';
import { BottomDock } from './BottomDock';

beforeEach(() => {
  act(() => {
    viewPrefsStore.setState({
      prefs: { layoutMode: 'free', expandAll: false, expandedTeamIds: [] },
    });
  });
});
afterEach(() => resetStores());

describe('BottomDock', () => {
  it('switches the layout mode', () => {
    render(<BottomDock graphActive />);
    fireEvent.click(screen.getByRole('button', { name: 'Top-bottom layout' }));
    expect(viewPrefsStore.getState().prefs.layoutMode).toBe('tb');
  });

  it('marks the active layout mode pressed', () => {
    render(<BottomDock graphActive />);
    expect(screen.getByRole('button', { name: 'Free layout' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('toggles expand all', () => {
    render(<BottomDock graphActive />);
    fireEvent.click(screen.getByRole('button', { name: 'Expand all' }));
    expect(viewPrefsStore.getState().prefs.expandAll).toBe(true);
  });

  it('disables the zoom controls when the graph is not active', () => {
    render(<BottomDock graphActive={false} />);
    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
    expect(screen.getByLabelText('Zoom level')).toBeDisabled();
  });
});
