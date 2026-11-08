import type { IconLicense } from '../../types';

export interface IconSummary {
  id: string;
  fullName: string;
  prefix: string;
  name: string;
  collectionName: string;
  author?: string;
  authorUrl?: string;
  license?: IconLicense;
  providerId: string;
  providerLabel: string;
  svgUrl: string;
  previewUrl?: string;
}

export interface IconSearchResult {
  icons: IconSummary[];
  total: number;
}

export interface IconProvider {
  id: string;
  label: string;
  search(query: string, signal?: AbortSignal): Promise<IconSearchResult>;
}

export class IconSearchError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'IconSearchError';
  }
}
