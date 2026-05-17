import type { Id } from '@/model/types';

export interface TeamSizeStats {
  sizes: Record<Id, number>;
  mean: number;
  median: number;
  /** team ids whose size is outside the 5–9 "team-sized" range */
  outOfRange: Id[];
}

export interface CommunicationStats {
  /** intra-team links = n·(n−1)/2, n = team size */
  perTeam: Record<Id, number>;
  thresholdLinks: number;
  overloaded: Id[];
}

export interface CouplingStats {
  degree: Record<Id, number>;
  isolated: Id[];
  mostConnected: Id[];
}

export interface DistributionStats {
  /** dimension key → value → team count ("uncategorized" bucket for unset) */
  byDimension: Record<string, Record<string, number>>;
}

export interface TeamTopologiesRatio {
  present: boolean;
  counts: Record<string, number>;
  streamAlignedPct: number;
}

export interface CognitiveLoadStats {
  perTeam: Record<Id, number>;
  threshold: number;
  overloaded: Id[];
}

export interface MetricsReport {
  teamCount: number;
  teamSize: TeamSizeStats;
  communication: CommunicationStats;
  coupling: CouplingStats;
  dependencyDepth: number;
  distribution: DistributionStats;
  teamTopologies: TeamTopologiesRatio;
  cognitiveLoad: CognitiveLoadStats;
  alerts: string[];
}

export interface MetricsOptions {
  communicationThresholdLinks?: number;
  cognitiveThreshold?: number;
}
