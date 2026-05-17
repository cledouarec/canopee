import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LeftRail } from './LeftRail';

describe('LeftRail', () => {
  it('renders the view buttons and reports the active one', () => {
    render(<LeftRail active="graph" onSelect={() => {}} />);
    expect(screen.getByRole('button', { name: 'Graph' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onSelect when a view is clicked', () => {
    const onSelect = vi.fn();
    render(<LeftRail active="graph" onSelect={onSelect} />);
    fireEvent.click(screen.getByRole('button', { name: 'Scenarios' }));
    expect(onSelect).toHaveBeenCalledWith('scenarios');
  });

  it('enables the Comparison entry and reports its selection', () => {
    const onSelect = vi.fn();
    render(<LeftRail active="graph" onSelect={onSelect} />);
    const cmp = screen.getByRole('button', { name: 'Comparison' });
    expect(cmp).not.toBeDisabled();
    fireEvent.click(cmp);
    expect(onSelect).toHaveBeenCalledWith('comparison');
  });
});
