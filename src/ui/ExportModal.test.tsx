import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { canopeeStore } from '@/store';
import { resetStores } from '@/test/resetStores';
import { ExportModal } from './ExportModal';

beforeEach(() => {
  act(() => {
    canopeeStore.getState().newOrg('Acme', 'team-topologies');
    canopeeStore.getState().upsertTeam({
      id: 't-1',
      name: 'Checkout',
      mission: 'Win',
      tags: {},
      headcount: { dev: 3 },
    });
  });
});
afterEach(() => resetStores());

describe('ExportModal', () => {
  it('renders a live SVG preview of the graph by default', async () => {
    render(<ExportModal onClose={() => {}} />);
    const preview = await screen.findByTestId('export-preview');
    expect(preview.querySelector('svg')).toBeTruthy();
    expect(preview.innerHTML).toContain('Checkout');
  });

  it('switches to the directory content', async () => {
    render(<ExportModal onClose={() => {}} />);
    fireEvent.click(screen.getByRole('radio', { name: 'Directory' }));
    const preview = await screen.findByTestId('export-preview');
    expect(preview.innerHTML).toContain('Win');
  });

  it('exports an SVG file on demand', async () => {
    const create = vi.fn(() => 'blob:x');
    const revoke = vi.fn();
    const u = URL as unknown as Record<string, unknown>;
    const pc = u.createObjectURL;
    const pr = u.revokeObjectURL;
    u.createObjectURL = create;
    u.revokeObjectURL = revoke;
    try {
      render(<ExportModal onClose={() => {}} />);
      await screen.findByTestId('export-preview');
      fireEvent.click(screen.getByRole('button', { name: 'Export' }));
      expect(create).toHaveBeenCalled();
    } finally {
      u.createObjectURL = pc;
      u.revokeObjectURL = pr;
    }
  });

  it('closes via the Close button', () => {
    const onClose = vi.fn();
    render(<ExportModal onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows a hint instead of a preview when no org is loaded', async () => {
    act(() => canopeeStore.setState({ org: null }));
    render(<ExportModal onClose={() => {}} />);
    expect(screen.getByTestId('export-empty')).toBeInTheDocument();
  });
});
