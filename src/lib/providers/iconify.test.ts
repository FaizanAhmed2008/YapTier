import { afterEach, describe, expect, it, vi } from 'vitest';
import { buildIconifySvgUrl, iconifyProvider, parseIconifySearchResponse } from './iconify';
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
  it('requests the Iconify search API and returns parsed results', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => searchPayload,
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await iconifyProvider.search('home', new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.iconify.design/search?query=home&limit=72',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        signal: expect.any(AbortSignal),
      }),
    );
    expect(result.icons).toHaveLength(2);
  });

  it('surfaces HTTP failures as IconSearchError messages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({}) }),
    );

    await expect(iconifyProvider.search('home')).rejects.toThrow(/503/);
  });

  it('turns network failures into a helpful message', async () => {
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
