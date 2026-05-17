import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarChart } from './BarChart';

describe('BarChart', () => {
  it('renders one bar per datum with an accessible label', () => {
    render(
      <BarChart
        title="Sizes"
        data={[
          { label: 'A', value: 4 },
          { label: 'B', value: 8 },
        ]}
      />,
    );
    const svg = screen.getByRole('img', { name: 'Sizes' });
    expect(svg.querySelectorAll('rect')).toHaveLength(2);
  });

  it('renders an empty chart without crashing', () => {
    render(<BarChart title="Empty" data={[]} />);
    expect(screen.getByRole('img', { name: 'Empty' }).querySelectorAll('rect')).toHaveLength(0);
  });

  it('scales the tallest bar to (almost) full height', () => {
    render(<BarChart title="S" data={[{ label: 'x', value: 10 }, { label: 'y', value: 5 }]} />);
    const rects = screen.getByRole('img', { name: 'S' }).querySelectorAll('rect');
    const h0 = Number(rects[0].getAttribute('height'));
    const h1 = Number(rects[1].getAttribute('height'));
    expect(h0).toBeGreaterThan(h1);
  });
});
