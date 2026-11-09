import {
  colorfulIconProvider,
  fluentEmojiProvider,
  iconifyProvider,
  openMojiProvider,
} from './iconify';
import type { IconProvider } from './types';

export type { IconProvider, IconSearchResult, IconSummary } from './types';
export { IconSearchError } from './types';

export interface IconSource {
  id: 'colorful' | 'openmoji' | 'fluent' | 'iconify';
  label: string;
  description: string;
  provider: IconProvider;
}

export type IconSourceId = IconSource['id'];

export const iconSources: readonly IconSource[] = [
  {
    id: 'colorful',
    label: 'Colorful',
    description: 'OpenMoji + Fluent Emoji',
    provider: colorfulIconProvider,
  },
  {
    id: 'openmoji',
    label: 'OpenMoji',
    description: 'OpenMoji emoji set',
    provider: openMojiProvider,
  },
  {
    id: 'fluent',
    label: 'Fluent Emoji',
    description: 'Microsoft Fluent Emoji',
    provider: fluentEmojiProvider,
  },
  {
    id: 'iconify',
    label: 'Iconify',
    description: 'All Iconify collections',
    provider: iconifyProvider,
  },
];

export const defaultIconSource = iconSources[0];
export const iconProviders = iconSources.map((source) => source.provider);
export const defaultIconProvider = defaultIconSource.provider;

export function getIconSource(id: IconSourceId): IconSource {
  return iconSources.find((source) => source.id === id) ?? defaultIconSource;
}
