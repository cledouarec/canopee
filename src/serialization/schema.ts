import { z } from 'zod';
import type { Organization } from '@/model/types';

const dimensionDefSchema = z.object({
  label: z.string(),
  values: z.record(z.string(), z.string()),
});

const relationshipTypeDefSchema = z.object({
  label: z.string(),
  style: z.enum(['solid', 'dashed', 'dotted']),
});

const taxonomySchema = z.object({
  colorBy: z.string(),
  dimensions: z.record(z.string(), dimensionDefSchema),
  relationshipTypes: z.record(z.string(), relationshipTypeDefSchema),
});

const memberSchema = z.object({
  personId: z.string(),
  allocation: z.number().min(0).max(100).optional(),
});

const teamSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  mission: z.string().optional(),
  scope: z.string().optional(),
  icon: z.string().optional(),
  tags: z.record(z.string(), z.string()),
  headcount: z.record(z.string(), z.number().int().nonnegative()),
  members: z.array(memberSchema).optional(),
  parentId: z.string().nullable().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

const personSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  role: z.string(),
  skills: z.array(z.string()).optional(),
});

const relationshipSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string(),
  directed: z.boolean(),
  note: z.string().optional(),
});

const scenarioSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  teams: z.array(teamSchema),
  relationships: z.array(relationshipSchema),
  removedTeamIds: z.array(z.string()).optional(),
  removedRelationshipIds: z.array(z.string()).optional(),
});

// Zod silently strips unknown keys (.strip by default, intentional).
// While V1 is unfrozen the schema may change in place; once V1 ships, any new
// field MUST go through a schemaVersion bump + migration (see migrate.ts).
export const organizationSchema: z.ZodType<Organization> = z.object({
  schemaVersion: z.number().int().positive(),
  name: z.string().min(1),
  taxonomy: taxonomySchema,
  teams: z.array(teamSchema),
  people: z.array(personSchema),
  relationships: z.array(relationshipSchema),
  // at least the 'current' scenario must exist
  scenarios: z.array(scenarioSchema).min(1),
  // Always present from V2 on (the V1->V2 migration backfills it).
  view: z.object({ zoom: z.number().positive() }),
});

export type OrganizationInput = z.infer<typeof organizationSchema>;
