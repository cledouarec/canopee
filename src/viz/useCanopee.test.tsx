import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { resetStores } from '@/test/resetStores';
import { useCanopee } from './useCanopee';

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
