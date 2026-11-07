import { iconifyProvider } from './iconify';

export type { IconProvider, IconSearchResult, IconSummary } from './types';
export { IconSearchError } from './types';

export const iconProviders = [iconifyProvider];
export const defaultIconProvider = iconifyProvider;
