import { customFramework } from './custom';
import { horizontalMetier } from './horizontal';
import { spotify } from './spotify';
import { teamTopologies } from './teamTopologies';
import type { Framework } from './types';
import { verticalFeature } from './vertical';

export const FRAMEWORKS: Framework[] = [
  teamTopologies,
  horizontalMetier,
  verticalFeature,
  spotify,
  customFramework,
];

export function getFramework(id: string): Framework | undefined {
  return FRAMEWORKS.find((f) => f.id === id);
}

export type { Framework } from './types';
