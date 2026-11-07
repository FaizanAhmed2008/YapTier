import { useCallback, useEffect, useState } from 'react';
import { defaultIconProvider } from '../lib/providers';
import { IconSearchError } from '../lib/providers/types';
import type { IconProvider, IconSummary } from '../lib/providers/types';
import { useDebouncedValue } from './useDebouncedValue';

export type IconSearchStatus = 'idle' | 'loading' | 'success' | 'error';

interface IconSearchState {
  status: IconSearchStatus;
  icons: IconSummary[];
  total: number;
  error: string | null;
}

const idleState: IconSearchState = {
  status: 'idle',
  icons: [],
  total: 0,
  error: null,
};

export function useIconSearch(query: string, provider: IconProvider = defaultIconProvider) {
  const trimmedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(trimmedQuery, 300);
  const [state, setState] = useState<IconSearchState>(idleState);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!debouncedQuery) {
      setState(idleState);
      return;
    }

    const controller = new AbortController();
    setState({
      status: 'loading',
      icons: [],
      total: 0,
      error: null,
    });

    provider
      .search(debouncedQuery, controller.signal)
      .then((result) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: 'success',
          icons: result.icons,
          total: result.total,
          error: null,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: 'error',
          icons: [],
          total: 0,
          error:
            error instanceof IconSearchError
              ? error.message
              : 'Something went wrong while searching icons. Please try again.',
        });
      });

    return () => controller.abort();
  }, [debouncedQuery, provider, attempt]);

  const retry = useCallback(() => setAttempt((current) => current + 1), []);

  return {
    ...state,
    debouncedQuery,
    isDebouncing: trimmedQuery !== debouncedQuery,
    retry,
  };
}
