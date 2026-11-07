import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import App from './App';
import { installObjectUrlMock } from './test/objectUrl';

let objectUrls: ReturnType<typeof installObjectUrlMock>;

beforeEach(() => {
  objectUrls = installObjectUrlMock();
});

describe('App image collection', () => {
  it('uploads an image, previews it, and removes it', async () => {
    render(<App />);

    const input = screen.getByLabelText('Upload images');
    const file = new File(['png'], 'cat.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByAltText('cat')).toBeInTheDocument();
    expect(screen.getByText('Local preview')).toBeInTheDocument();
    expect(objectUrls.createObjectURL).toHaveBeenCalledWith(file);

    fireEvent.click(screen.getByRole('button', { name: 'Remove cat' }));

    expect(screen.queryByAltText('cat')).not.toBeInTheDocument();
    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith('blob:mock-1');
  });

  it('rejects invalid files and keeps valid ones', () => {
    render(<App />);

    const input = screen.getByLabelText('Upload images');
    const gif = new File(['gif'], 'loop.gif', { type: 'image/gif' });
    const png = new File(['png'], 'photo.png', { type: 'image/png' });

    fireEvent.change(input, { target: { files: [gif, png] } });

    expect(screen.getByRole('alert')).toHaveTextContent('1 file was skipped.');
    expect(screen.getByRole('alert')).toHaveTextContent('loop.gif');
    expect(screen.getByAltText('photo')).toBeInTheDocument();
    expect(objectUrls.createObjectURL).toHaveBeenCalledTimes(1);
    expect(objectUrls.createObjectURL).toHaveBeenCalledWith(png);
  });

  it('dismisses upload errors', () => {
    render(<App />);

    const input = screen.getByLabelText('Upload images');
    fireEvent.change(input, {
      target: { files: [new File(['gif'], 'loop.gif', { type: 'image/gif' })] },
    });

    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss upload errors' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});
