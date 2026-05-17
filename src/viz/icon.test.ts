import { Box, ShoppingCart } from 'lucide-react';
import { describe, expect, it } from 'vitest';
import { getLucideIcon } from './icon';

describe('getLucideIcon', () => {
  it('resolves a kebab-case icon name to its Lucide component', () => {
    expect(getLucideIcon('shopping-cart')).toBe(ShoppingCart);
  });

  it('resolves a single-word name', () => {
    expect(getLucideIcon('box')).toBe(Box);
  });

  it('falls back to Box for an unknown name', () => {
    expect(getLucideIcon('definitely-not-an-icon')).toBe(Box);
  });

  it('falls back to Box when no name is given', () => {
    expect(getLucideIcon(undefined)).toBe(Box);
  });
});
