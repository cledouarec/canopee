export const EXPORT_CONTENTS = ['graph', 'directory'] as const;
export const EXPORT_FORMATS = ['svg', 'png'] as const;
export const EXPORT_BACKGROUNDS = ['theme', 'transparent'] as const;

export type ExportContent = (typeof EXPORT_CONTENTS)[number];
export type ExportFormat = (typeof EXPORT_FORMATS)[number];
export type ExportBackground = (typeof EXPORT_BACKGROUNDS)[number];

/** The theme colors needed to render an export without the live DOM. */
export interface ExportThemeTokens {
  bg: string;
  surface: string;
  text: string;
  border: string;
  accent: string;
}
