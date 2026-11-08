import type { IconLicense } from '../../types';
import type { IconProvider, IconSearchResult, IconSummary } from './types';
import { IconSearchError } from './types';

const ICONIFY_API_BASE = 'https://api.iconify.design';
const SEARCH_LIMIT = 72;
const PREVIEW_HEIGHT = 96;
const PREVIEW_COLOR = '#e8ecf8';
const PREVIEW_BATCH_CONCURRENCY = 4;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value : undefined;
}

function readLicense(value: unknown): IconLicense | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const title = readString(value.title) ?? readString(value.spdx);
  if (!title) {
    return undefined;
  }

  return {
    title,
    spdx: readString(value.spdx),
    url: readString(value.url),
  };
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function groupIconsByPrefix(icons: readonly IconSummary[]): Map<string, IconSummary[]> {
  const groups = new Map<string, IconSummary[]>();

  for (const icon of icons) {
    const group = groups.get(icon.prefix);
    if (group) {
      group.push(icon);
    } else {
      groups.set(icon.prefix, [icon]);
    }
  }

  return groups;
}

async function mapWithConcurrency<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (nextIndex < items.length) {
        const index = nextIndex;
        nextIndex += 1;
        results[index] = await mapper(items[index]);
      }
    },
  );

  await Promise.all(workers);
  return results;
}

export function buildIconifySvgUrl(fullName: string, height = PREVIEW_HEIGHT): string {
  const separator = fullName.indexOf(':');

  if (separator <= 0 || separator === fullName.length - 1) {
    throw new IconSearchError('Iconify returned an invalid icon name.');
  }

  const prefix = fullName.slice(0, separator);
  const name = fullName.slice(separator + 1);

  return `${ICONIFY_API_BASE}/${encodeURIComponent(prefix)}/${encodeURIComponent(name)}.svg?height=${height}&color=${encodeURIComponent(PREVIEW_COLOR)}`;
}

export function buildIconifyCssUrl(
  prefix: string,
  names: readonly string[],
  height = PREVIEW_HEIGHT,
): string {
  const icons = names.map((name) => encodeURIComponent(name)).join(',');

  return `${ICONIFY_API_BASE}/${encodeURIComponent(prefix)}.css?icons=${icons}&height=${height}&color=${encodeURIComponent(PREVIEW_COLOR)}`;
}

export function parseIconifyCssPreviews(
  prefix: string,
  css: string,
  names: readonly string[],
): Map<string, string> {
  const previews = new Map<string, string>();

  for (const name of names) {
    const marker = `.icon--${prefix}--${name}`;
    const pattern = new RegExp(`${escapeRegExp(marker)}(?=\\s*\\{)[^{]*\\{([^}]*)\\}`);
    const block = css.match(pattern)?.[1];
    const url = block?.match(/background-image:\s*url\("([^"]+)"\)/)?.[1];

    if (url) {
      previews.set(`${prefix}:${name}`, url);
    }
  }

  return previews;
}

async function hydrateIconPreviews(
  icons: readonly IconSummary[],
  signal?: AbortSignal,
): Promise<IconSummary[]> {
  if (icons.length === 0) {
    return [...icons];
  }

  const groups = groupIconsByPrefix(icons);
  const previewMaps = await mapWithConcurrency(
    [...groups.values()],
    PREVIEW_BATCH_CONCURRENCY,
    async (group) => {
      const prefix = group[0].prefix;
      const names = group.map((icon) => icon.name);
      const endpoint = buildIconifyCssUrl(prefix, names);

      try {
        const response = await fetch(endpoint, {
          signal,
          headers: { Accept: 'text/css' },
        });

        if (!response.ok) {
          return new Map<string, string>();
        }

        return parseIconifyCssPreviews(prefix, await response.text(), names);
      } catch (error) {
        if (isAbortError(error)) {
          throw error;
        }

        return new Map<string, string>();
      }
    },
  );
  const previews = new Map<string, string>();

  for (const previewMap of previewMaps) {
    for (const [fullName, url] of previewMap) {
      previews.set(fullName, url);
    }
  }

  return icons.map((icon) => {
    const previewUrl = previews.get(icon.fullName);

    return previewUrl ? { ...icon, previewUrl } : icon;
  });
}

export function parseIconifySearchResponse(payload: unknown): IconSearchResult {
  if (!isRecord(payload) || !Array.isArray(payload.icons)) {
    throw new IconSearchError('Iconify returned an unexpected response.');
  }

  const collections = isRecord(payload.collections) ? payload.collections : {};
  const icons: IconSummary[] = [];
  const seen = new Set<string>();

  for (const value of payload.icons) {
    const fullName = readString(value);
    if (!fullName || seen.has(fullName)) {
      continue;
    }

    const separator = fullName.indexOf(':');
    if (separator <= 0 || separator === fullName.length - 1) {
      continue;
    }

    const prefix = fullName.slice(0, separator);
    const name = fullName.slice(separator + 1);
    const rawCollection = collections[prefix];
    const collection = isRecord(rawCollection) ? rawCollection : undefined;
    const author = isRecord(collection?.author) ? collection.author : undefined;

    let svgUrl: string;
    try {
      svgUrl = buildIconifySvgUrl(fullName);
    } catch {
      continue;
    }

    seen.add(fullName);
    icons.push({
      id: fullName,
      fullName,
      prefix,
      name,
      collectionName: readString(collection?.name) ?? prefix,
      author: readString(author?.name),
      authorUrl: readString(author?.url),
      license: readLicense(collection?.license),
      providerId: 'iconify',
      providerLabel: 'Iconify',
      svgUrl,
    });
  }

  const total =
    typeof payload.total === 'number' && Number.isFinite(payload.total) ? payload.total : icons.length;

  return { icons, total };
}

export const iconifyProvider: IconProvider = {
  id: 'iconify',
  label: 'Iconify',

  async search(query, signal) {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      return { icons: [], total: 0 };
    }

    const endpoint = `${ICONIFY_API_BASE}/search?query=${encodeURIComponent(trimmedQuery)}&limit=${SEARCH_LIMIT}`;

    let response: Response;
    try {
      response = await fetch(endpoint, {
        signal,
        headers: { Accept: 'application/json' },
      });
    } catch (error) {
      if (isAbortError(error)) {
        throw error;
      }

      throw new IconSearchError(
        'Could not reach Iconify. Check your connection and try again.',
        { cause: error },
      );
    }

    if (!response.ok) {
      throw new IconSearchError(
        `Iconify search failed (${response.status}). Please try again in a moment.`,
      );
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch (error) {
      throw new IconSearchError('Iconify returned an unreadable response.', { cause: error });
    }

    const result = parseIconifySearchResponse(payload);

    return {
      ...result,
      icons: await hydrateIconPreviews(result.icons, signal),
    };
  },
};
