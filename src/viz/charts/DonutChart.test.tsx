import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DonutChart } from './DonutChart';

describe('DonutChart', () => {
  it('renders one arc per non-zero segment', () => {
    render(
      <DonutChart
        title="Distribution"
        segments={[
          { label: 'a', value: 3, color: '#111' },
          { label: 'b', value: 1, color: '#222' },
          { label: 'c', value: 0, color: '#333' },
        ]}
      />,
    );
    const svg = screen.getByRole('img', { name: 'Distribution' });
    expect(svg.querySelectorAll('path')).toHaveLength(2);
  });

  it('renders nothing but the ring when all values are zero', () => {
    render(<DonutChart title="Z" segments={[{ label: 'a', value: 0, color: '#000' }]} />);
    expect(screen.getByRole('img', { name: 'Z' }).querySelectorAll('path')).toHaveLength(0);
  });
});
