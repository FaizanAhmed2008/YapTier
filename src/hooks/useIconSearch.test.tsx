import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { IconProvider, IconSearchResult } from '../lib/providers/types';
import { useIconSearch } from './useIconSearch';

function createProvider(result: IconSearchResult = { icons: [], total: 0 }) {
  return {
    id: 'test',
    label: 'Test',
    search: vi.fn().mockResolvedValue(result),
  } satisfies IconProvider;
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useIconSearch', () => {
  it('waits 300ms and then searches with the trimmed query', async () => {
    const provider = createProvider();
    const { result, rerender } = renderHook(
      ({ query }) => useIconSearch(query, provider),
      { initialProps: { query: '' } },
    );

    rerender({ query: '  home  ' });
    expect(provider.search).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(299);
    });
    expect(provider.search).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(provider.search).toHaveBeenCalledTimes(1);
    expect(provider.search).toHaveBeenCalledWith('home', expect.any(AbortSignal));
    expect(result.current.status).toBe('success');

    rerender({ query: '' });
    await act(async () => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.status).toBe('idle');
  });

  it('resets the debounce timer while the user keeps typing', async () => {
    const provider = createProvider();
    const { rerender } = renderHook(({ query }) => useIconSearch(query, provider), {
      initialProps: { query: '' },
    });

    rerender({ query: 'h' });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    rerender({ query: 'ho' });
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    rerender({ query: 'home' });
    await act(async () => {
      vi.advanceTimersByTime(299);
    });

    expect(provider.search).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(1);
    });

    expect(provider.search).toHaveBeenCalledTimes(1);
    expect(provider.search).toHaveBeenCalledWith('home', expect.any(AbortSignal));
  });

  it('captures provider errors in state', async () => {
    const provider: IconProvider = {
      id: 'test',
      label: 'Test',
      search: vi.fn().mockRejectedValue(new Error('nope')),
    };
    const { result } = renderHook(() => useIconSearch('home', provider));

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toMatch(/something went wrong/i);
  });
});
