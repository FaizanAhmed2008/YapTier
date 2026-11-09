import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { installObjectUrlMock } from './test/objectUrl';

let objectUrls: ReturnType<typeof installObjectUrlMock>;

function mockIconSearch() {
  const fetchMock = vi.fn((input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes('/search?')) {
      const query = new URL(url).searchParams.get('query') ?? '';
      const fullName = query === 'star' ? 'mdi:star' : 'mdi:home';
      const prefix = fullName.slice(0, fullName.indexOf(':'));

      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({
          icons: [fullName],
          total: 1,
          collections: {
            [prefix]: {
              name: 'Material Design Icons',
              license: { title: 'Apache 2.0' },
            },
          },
        }),
      });
    }

    const prefix = decodeURIComponent(url.match(/\/([^/]+)\.css\?/)?.[1] ?? '');
    const names = decodeURIComponent(new URL(url).searchParams.get('icons') ?? '').split(',');
    const css = names
      .map(
        (name) =>
          `.icon--${prefix}--${name} { background-image: url("data:image/svg+xml,%3Csvg%3E${name}%3C/svg%3E"); }`,
      )
      .join('\n');

    return Promise.resolve({
      ok: true,
      status: 200,
      text: async () => css,
    });
  });
  vi.stubGlobal('fetch', fetchMock);
}

beforeEach(() => {
  objectUrls = installObjectUrlMock();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('App image collection', () => {
  it('uploads an image, previews it, and removes it', async () => {
    const { container } = render(<App />);

    const input = screen.getByLabelText('Upload images');
    const file = new File(['png'], 'cat.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByRole('button', { name: 'cat' })).toBeInTheDocument();
    expect(objectUrls.createObjectURL).toHaveBeenCalledWith(file);
    expect(container.querySelector('.collection-strip img')).toHaveAttribute(
      'src',
      'blob:mock-1',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove cat' }));

    expect(screen.queryByRole('button', { name: 'cat' })).not.toBeInTheDocument();
    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith('blob:mock-1');
  });

  it('adds and removes custom text items', () => {
    const { container } = render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Add Text' }));

    expect(screen.getByRole('heading', { name: 'Add Text' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add' })).toBeDisabled();

    fireEvent.change(screen.getByLabelText('Text'), {
      target: { value: '  Must play  ' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('button', { name: 'Must play' })).toBeInTheDocument();
    expect(container.querySelector('.image-tile-text .tile-text')).toHaveTextContent(
      'Must play',
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove Must play' }));

    expect(screen.queryByRole('button', { name: 'Must play' })).not.toBeInTheDocument();
  });

  it('adds several icons while keeping the finder open', async () => {
    mockIconSearch();
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: 'Find Icons' }));

    const searchInput = screen.getByRole('searchbox', { name: 'Search icons' });
    fireEvent.change(searchInput, { target: { value: 'home' } });

    const homeButton = await screen.findByRole(
      'button',
      { name: /add mdi:home icon from material design icons/i },
      { timeout: 2500 },
    );
    fireEvent.click(homeButton);

    expect(screen.getByRole('button', { name: 'Remove home' })).toBeInTheDocument();
    expect(searchInput).toHaveValue('');
    expect(searchInput).toHaveFocus();
    expect(screen.getByText('Icon added to collection')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Find Icons' })).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'star' } });

    const starButton = await screen.findByRole(
      'button',
      { name: /add mdi:star icon from material design icons/i },
      { timeout: 2500 },
    );
    fireEvent.click(starButton);

    expect(screen.getByRole('button', { name: 'Remove home' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove star' })).toBeInTheDocument();
    expect(screen.getByText('Icon added to collection')).toBeInTheDocument();
  });

  it('rejects invalid files and keeps valid ones', () => {
    render(<App />);

    const input = screen.getByLabelText('Upload images');
    const gif = new File(['gif'], 'loop.gif', { type: 'image/gif' });
    const png = new File(['png'], 'photo.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [gif, png] } });

    expect(screen.getByRole('alert')).toHaveTextContent('1 file could not be added.');
    expect(screen.getByRole('alert')).toHaveTextContent('loop.gif');
    expect(screen.getByRole('button', { name: 'photo' })).toBeInTheDocument();
    expect(objectUrls.createObjectURL).toHaveBeenCalledTimes(1);
    expect(objectUrls.createObjectURL).toHaveBeenCalledWith(png);
  });

  it('dismisses upload warnings', () => {
    render(<App />);

    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, {
      target: { files: [new File(['gif'], 'loop.gif', { type: 'image/gif' })] },
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss upload warning' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
