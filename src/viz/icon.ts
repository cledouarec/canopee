import * as Lucide from 'lucide-react';
import type { ComponentType } from 'react';

type IconComponent = ComponentType<{ size?: number | string; className?: string }>;

/** "shopping-cart" -> "ShoppingCart" */
function toPascalCase(kebab: string): string {
  return kebab
    .split('-')
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

/**
 * Resolve a kebab-case Lucide icon name to its component.
 * Unknown / missing names fall back to `Box` so a card always has an icon.
 */
export function getLucideIcon(name?: string): IconComponent {
  const fallback = (Lucide as Record<string, unknown>).Box as IconComponent;
  if (!name) return fallback;
  const comp = (Lucide as Record<string, unknown>)[toPascalCase(name)];
  // Lucide icons are React.forwardRef objects, not plain functions.
  const renderable = typeof comp === 'function' || (typeof comp === 'object' && comp !== null);
  return renderable ? (comp as IconComponent) : fallback;
}
