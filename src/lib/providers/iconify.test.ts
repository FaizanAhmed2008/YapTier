import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  buildIconifyCssUrl,
  buildIconifySvgUrl,
  iconifyProvider,
  parseIconifyCssPreviews,
  parseIconifySearchResponse,
} from './iconify';
import { IconSearchError } from './types';

const searchPayload = {
  icons: ['mdi:home', 'solar:home-bold', 'not-an-icon', 'mdi:home'],
  total: 42,
  collections: {
    mdi: {
      name: 'Material Design Icons',
      author: { name: 'Pictogrammers', url: 'https://github.com/Templarian/MaterialDesign' },
      license: {
        title: 'Apache 2.0',
        spdx: 'Apache-2.0',
        url: 'https://github.com/Templarian/MaterialDesign/blob/master/LICENSE',
      },
    },
    solar: {
      name: 'Solar',
      author: { name: '480 Design' },
      license: { title: 'CC BY 4.0', spdx: 'CC-BY-4.0', url: 'https://creativecommons.org/licenses/by/4.0/' },
    },
  },
};

const mdiCss = `
.icon--mdi {
  display: inline-block;
}

.icon--mdi--home-outline {
  background-image: url("data:image/svg+xml,%3Csvg%3Eoutline%3C/svg%3E");
}

.icon--mdi--home {
  background-image: url("data:image/svg+xml,%3Csvg%3Ehome%3C/svg%3E");
}
`;

const solarCss = `
.icon--solar--home-bold {
  background-image: url("data:image/svg+xml,%3Csvg%3Ebold%3C/svg%3E");
}
`;

function jsonResponse(payload: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => payload,
  };
}

function textResponse(text: string, ok = true, status = 200) {
  return {
    ok,
    status,
    text: async () => text,
  };
}

function mockIconify(
  options: {
    search?: unknown;
    css?: Record<string, string>;
    searchOk?: boolean;
    searchStatus?: number;
  } = {},
) {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('/search?')) {
      return Promise.resolve(
        jsonResponse(options.search ?? searchPayload, options.searchOk ?? true, options.searchStatus ?? 200),
      );
    }

    const prefix = decodeURIComponent(url.match(/\/([^/]+)\.css\?/)?.[1] ?? '');
    const css = options.css?.[prefix];

    return Promise.resolve(css ? textResponse(css) : textResponse('', false, 404));
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('buildIconifySvgUrl', () => {
  it('builds an SVG preview URL from a full icon name', () => {
    expect(buildIconifySvgUrl('mdi:home')).toBe(
      'https://api.iconify.design/mdi/home.svg?height=96&color=%23e8ecf8',
    );
  });

  it('rejects malformed icon names', () => {
    expect(() => buildIconifySvgUrl('home')).toThrow(IconSearchError);
    expect(() => buildIconifySvgUrl('mdi:')).toThrow(IconSearchError);
  });
});

describe('buildIconifyCssUrl', () => {
  it('builds a batch URL for a collection prefix', () => {
    expect(buildIconifyCssUrl('mdi', ['home', 'home-outline'])).toBe(
      'https://api.iconify.design/mdi.css?icons=home,home-outline&height=96&color=%23e8ecf8',
    );
  });
});

describe('parseIconifyCssPreviews', () => {
  it('extracts each requested icon without matching longer names', () => {
    const previews = parseIconifyCssPreviews('mdi', mdiCss, ['home', 'home-outline', 'missing']);

    expect(previews.get('mdi:home')).toBe('data:image/svg+xml,%3Csvg%3Ehome%3C/svg%3E');
    expect(previews.get('mdi:home-outline')).toBe(
      'data:image/svg+xml,%3Csvg%3Eoutline%3C/svg%3E',
    );
    expect(previews.has('mdi:missing')).toBe(false);
  });
});

describe('parseIconifySearchResponse', () => {
  it('maps icons, collections, authors, and licenses', () => {
    const result = parseIconifySearchResponse(searchPayload);

    expect(result.total).toBe(42);
    expect(result.icons).toHaveLength(2);
    expect(result.icons[0]).toMatchObject({
      fullName: 'mdi:home',
      prefix: 'mdi',
      name: 'home',
      collectionName: 'Material Design Icons',
      author: 'Pictogrammers',
      license: { title: 'Apache 2.0', spdx: 'Apache-2.0' },
      providerId: 'iconify',
      providerLabel: 'Iconify',
      svgUrl: 'https://api.iconify.design/mdi/home.svg?height=96&color=%23e8ecf8',
    });
    expect(result.icons[1].collectionName).toBe('Solar');
    expect(result.icons[1].license?.title).toBe('CC BY 4.0');
  });

  it('throws a friendly error for unexpected payloads', () => {
    expect(() => parseIconifySearchResponse({ collections: {} })).toThrow(IconSearchError);
  });
});

describe('iconifyProvider.search', () => {
  it('loads previews in one batch per collection prefix', async () => {
    const fetchMock = mockIconify({ css: { mdi: mdiCss, solar: solarCss } });

    const result = await iconifyProvider.search('home', new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.iconify.design/search?query=home&limit=72',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      buildIconifyCssUrl('mdi', ['home']),
      expect.objectContaining({
        headers: { Accept: 'text/css' },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      buildIconifyCssUrl('solar', ['home-bold']),
      expect.objectContaining({
        headers: { Accept: 'text/css' },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.icons[0]).toMatchObject({
      svgUrl: 'https://api.iconify.design/mdi/home.svg?height=96&color=%23e8ecf8',
      previewUrl: 'data:image/svg+xml,%3Csvg%3Ehome%3C/svg%3E',
    });
    expect(result.icons[1].previewUrl).toBe('data:image/svg+xml,%3Csvg%3Ebold%3C/svg%3E');
  });

  it('keeps search results when a preview batch fails', async () => {
    mockIconify({ css: { mdi: mdiCss } });

    const result = await iconifyProvider.search('home');

    expect(result.icons).toHaveLength(2);
    expect(result.icons[0].previewUrl).toBe('data:image/svg+xml,%3Csvg%3Ehome%3C/svg%3E');
    expect(result.icons[1].previewUrl).toBeUndefined();
  });

  it('surfaces search HTTP failures as IconSearchError messages', async () => {
    mockIconify({ searchOk: false, searchStatus: 503 });

    await expect(iconifyProvider.search('home')).rejects.toThrow(/503/);
  });

  it('turns search network failures into a helpful message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    await expect(iconifyProvider.search('home')).rejects.toThrow(/could not reach iconify/i);
  });

  it('returns an empty result for a blank query without calling the API', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(iconifyProvider.search('   ')).resolves.toEqual({ icons: [], total: 0 });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
