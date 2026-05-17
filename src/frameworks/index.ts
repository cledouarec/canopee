import type { Framework } from './types';
import { teamTopologies } from './teamTopologies';
import { horizontalMetier } from './horizontal';
import { verticalFeature } from './vertical';
import { spotify } from './spotify';
import { customFramework } from './custom';

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
