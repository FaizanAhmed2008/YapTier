import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FindIconsDialog } from './FindIconsDialog';

const payload = {
  icons: ['mdi:home', 'solar:home-bold'],
  total: 42,
  collections: {
    mdi: {
      name: 'Material Design Icons',
      author: { name: 'Pictogrammers' },
      license: { title: 'Apache 2.0', url: 'https://example.com/apache' },
    },
    solar: {
      name: 'Solar',
      author: { name: '480 Design' },
      license: { title: 'CC BY 4.0', url: 'https://example.com/cc-by' },
    },
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

function mockSearch(payloadValue: unknown = payload, ok = true, status = 200) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: async () => payloadValue,
  });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

describe('FindIconsDialog', () => {
  it('debounces searches, shows results, licenses, and selects an icon', async () => {
    const fetchMock = mockSearch();
    const onSelect = vi.fn();

    render(<FindIconsDialog open onClose={vi.fn()} onSelect={onSelect} />);

    expect(screen.getByRole('heading', { name: 'Find Icons' })).toBeInTheDocument();
    expect(screen.getByText('What are you looking for?')).toBeInTheDocument();

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search icons' }), {
      target: { value: 'home' },
    });

    const resultButton = await screen.findByRole(
      'button',
      { name: /add mdi:home icon from material design icons/i },
      { timeout: 2500 },
    );

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('query=home'),
      expect.any(Object),
    );
    expect(screen.getByText('Showing 2 of 42 matches')).toBeInTheDocument();
    expect(screen.getByText('Apache 2.0')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /license details for material design icons/i })).toHaveAttribute(
      'href',
      'https://example.com/apache',
    );

    fireEvent.click(resultButton);

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toMatchObject({
      fullName: 'mdi:home',
      collectionName: 'Material Design Icons',
      license: { title: 'Apache 2.0' },
    });
  });

  it('shows an empty state when no icons match', async () => {
    mockSearch({ icons: [], total: 0, collections: {} });

    render(<FindIconsDialog open onClose={vi.fn()} onSelect={vi.fn()} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search icons' }), {
      target: { value: 'zzzzzz' },
    });

    await waitFor(() => {
      expect(screen.getByText('No icons found for “zzzzzz”')).toBeInTheDocument();
    });
  });

  it('shows an API error with a retry action', async () => {
    mockSearch({}, false, 503);

    render(<FindIconsDialog open onClose={vi.fn()} onSelect={vi.fn()} />);

    fireEvent.change(screen.getByRole('searchbox', { name: 'Search icons' }), {
      target: { value: 'home' },
    });

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/iconify search failed \(503\)/i);
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
