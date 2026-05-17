import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { useCanopee } from './useCanopee';
import { resetStores } from '@/test/resetStores';

afterEach(() => resetStores());
import { canopeeStore } from '@/store';

function OrgName(): JSX.Element {
  const name = useCanopee((s) => s.org?.name ?? '(none)');
  return <div data-testid="name">{name}</div>;
}

describe('useCanopee', () => {
  it('renders store state and re-renders on change', () => {
    render(<OrgName />);
    expect(screen.getByTestId('name').textContent).toBe('(none)');
    act(() => {
      canopeeStore.getState().newOrg('Acme', 'custom');
    });
    expect(screen.getByTestId('name').textContent).toBe('Acme');
  });
});
