import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { installObjectUrlMock } from '../test/objectUrl';
import type { IconSummary } from '../lib/providers/types';
import { useTierEditor } from './useTierEditor';

let objectUrls: ReturnType<typeof installObjectUrlMock>;

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
  svgUrl: 'https://example.com/home.svg',
};

beforeEach(() => {
  objectUrls = installObjectUrlMock();
});

describe('useTierEditor', () => {
  it('adds valid uploads and reports rejected files', () => {
    const { result } = renderHook(() => useTierEditor());
    const png = new File(['png'], 'cat.png', { type: 'image/png' });
    const gif = new File(['gif'], 'loop.gif', { type: 'image/gif' });
    let rejections: ReturnType<typeof result.current.addFiles> = [];

    act(() => {
      rejections = result.current.addFiles([png, gif]);
    });

    expect(result.current.collection).toHaveLength(1);
    expect(result.current.collection[0]).toMatchObject({
      name: 'cat',
      src: 'blob:mock-1',
      source: 'upload',
      isObjectUrl: true,
    });
    expect(rejections).toHaveLength(1);
    expect(rejections[0]).toMatchObject({ fileName: 'loop.gif' });
    expect(result.current.totalCount).toBe(1);
  });

  it('adds icons to the collection with attribution metadata', () => {
    const { result } = renderHook(() => useTierEditor());

    act(() => {
      result.current.addIcon(icon);
    });

    expect(result.current.collection[0]).toMatchObject({
      name: 'home',
      src: icon.svgUrl,
      source: 'icon',
      isObjectUrl: false,
      icon: {
        fullName: 'mdi:home',
        attribution: {
          collectionName: 'Material Design Icons',
          license: { title: 'Apache 2.0' },
        },
      },
    });
  });

  it('prefers hydrated preview data when adding an icon', () => {
    const { result } = renderHook(() => useTierEditor());

    act(() => {
      result.current.addIcon({ ...icon, previewUrl: 'data:image/svg+xml,%3Csvg%3Ehome%3C/svg%3E' });
    });

    expect(result.current.collection[0].src).toBe('data:image/svg+xml,%3Csvg%3Ehome%3C/svg%3E');
  });

  it('moves items between the collection and tiers', () => {
    const { result } = renderHook(() => useTierEditor());
    const png = new File(['png'], 'cat.png', { type: 'image/png' });

    act(() => {
      result.current.addFiles([png]);
    });
    const id = result.current.collection[0].id;

    act(() => {
      result.current.moveItem(id, 'tier-S');
    });

    expect(result.current.collection).toHaveLength(0);
    expect(result.current.tiers.S).toHaveLength(1);

    act(() => {
      result.current.moveItem(id, 'collection');
    });

    expect(result.current.collection).toHaveLength(1);
    expect(result.current.tiers.S).toHaveLength(0);
  });

  it('revokes upload URLs on permanent removal but not when returning to the collection', () => {
    const { result } = renderHook(() => useTierEditor());
    const png = new File(['png'], 'cat.png', { type: 'image/png' });

    act(() => {
      result.current.addFiles([png]);
    });
    const id = result.current.collection[0].id;

    act(() => {
      result.current.moveItem(id, 'tier-A');
    });
    act(() => {
      result.current.returnToCollection(id);
    });

    expect(objectUrls.revokeObjectURL).not.toHaveBeenCalled();

    act(() => {
      result.current.removeImage(result.current.collection[0].id);
    });

    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith('blob:mock-1');
  });

  it('revokes remaining upload URLs on unmount', () => {
    const { result, unmount } = renderHook(() => useTierEditor());
    const png = new File(['png'], 'cat.png', { type: 'image/png' });

    act(() => {
      result.current.addFiles([png]);
    });

    unmount();

    expect(objectUrls.revokeObjectURL).toHaveBeenCalledWith('blob:mock-1');
  });
});
