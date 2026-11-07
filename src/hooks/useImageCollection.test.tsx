import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { IconSummary } from '../lib/providers/types';
import { installObjectUrlMock } from '../test/objectUrl';
import { useImageCollection } from './useImageCollection';

const icon: IconSummary = {
  id: 'mdi:home',
  fullName: 'mdi:home',
  prefix: 'mdi',
  name: 'home',
  collectionName: 'Material Design Icons',
  author: 'Pictogrammers',
  license: { title: 'Apache 2.0', url: 'https://example.com/license' },
  providerId: 'iconify',
  providerLabel: 'Iconify',
  svgUrl: 'https://api.iconify.design/mdi/home.svg?height=96&color=%23e8ecf8',
};

let objectUrls: ReturnType<typeof installObjectUrlMock>;

beforeEach(() => {
  objectUrls = installObjectUrlMock();
});

describe('useImageCollection', () => {
  it('adds valid uploads, creates object URLs, and reports rejected files', () => {
    const { result } = renderHook(() => useImageCollection());
    const png = new File(['png'], 'cat.png', { type: 'image/png' });
    const gif = new File(['gif'], 'cat.gif', { type: 'image/gif' });
    const webp = new File(['webp'], 'dog.webp', { type: 'image/webp' });

    let rejections: ReturnType<typeof result.current.addFiles> = [];
    act(() => {
      rejections = result.current.addFiles([png, gif, webp]);
    });

    expect(rejections).toHaveLength(1);
    expect(rejections[0]).toMatchObject({ fileName: 'cat.gif' });
    expect(result.current.images).toHaveLength(2);
    expect(result.current.images[0]).toMatchObject({
      name: 'cat',
      source: 'upload',
      isObjectUrl: true,
      src: 'blob:mock-1',
    });
    expect(result.current.images[1].name).toBe('dog');
    expect(objectUrls.createObjectURL).toHaveBeenCalledTimes(2);
    expect(objectUrls.createObjectURL).toHaveBeenCalledWith(png);
    expect(objectUrls.createObjectURL).toHaveBeenCalledWith(webp);
  });

  it('revokes the object URL when an uploaded image is removed', () => {
    const { result } = renderHook(() => useImageCollection());
    const png = new File(['png'], 'cat.png', { type: 'image/png' });

    act(() => {
      result.current.addFiles([png]);
    });

    const image = result.current.images[0];

    act(() => {
      result.current.removeImage(image.id);
    });

    expect(result.current.images).toHaveLength(0);
    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith(image.src);
  });

  it('adds icons by remote SVG URL without creating object URLs', () => {
    const { result } = renderHook(() => useImageCollection());

    let addedImage: ReturnType<typeof result.current.addIcon> | undefined;
    act(() => {
      addedImage = result.current.addIcon(icon);
    });

    expect(objectUrls.createObjectURL).not.toHaveBeenCalled();
    expect(addedImage).toMatchObject({
      name: 'home',
      src: icon.svgUrl,
      source: 'icon',
      isObjectUrl: false,
    });
    expect(addedImage?.icon?.attribution).toMatchObject({
      providerId: 'iconify',
      collectionName: 'Material Design Icons',
      license: { title: 'Apache 2.0' },
    });
  });

  it('does not revoke remote icon URLs on removal', () => {
    const { result } = renderHook(() => useImageCollection());

    act(() => {
      result.current.addIcon(icon);
    });
    act(() => {
      result.current.removeImage(result.current.images[0].id);
    });

    expect(objectUrls.revokeObjectURL).not.toHaveBeenCalled();
  });

  it('revokes outstanding object URLs on unmount', () => {
    const { result, unmount } = renderHook(() => useImageCollection());
    const png = new File(['png'], 'cat.png', { type: 'image/png' });

    act(() => {
      result.current.addFiles([png]);
    });

    const src = result.current.images[0].src;
    unmount();

    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith(src);
  });
});
