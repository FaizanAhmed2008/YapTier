import { describe, expect, it } from 'vitest';
import {
  blobToDataUrl,
  clearBoardStorage,
  dataUrlToBlob,
  loadBoardFromStorage,
  saveBoardToStorage,
  serializeBoard,
} from './db';
import { createEmptyBoard, DEFAULT_TIER_CONFIGS } from '../board';
import type { CollectionImage } from '../../types';

describe('storage db utilities', () => {
  it('converts blob to dataUrl and back', async () => {
    const originalText = 'yaptier-test-image-data';
    const blob = new Blob([originalText], { type: 'text/plain' });
    const dataUrl = await blobToDataUrl(blob);

    expect(dataUrl).toContain('data:text/plain;base64,');

    const restoredBlob = dataUrlToBlob(dataUrl);
    expect(restoredBlob.type).toBe('text/plain');
    expect(restoredBlob.size).toBe(blob.size);
  });

  it('serializes board stripping ephemeral object URLs', () => {
    const board = createEmptyBoard('Anime Tier List');
    const item: CollectionImage = {
      id: 'img-1',
      name: 'Goku',
      src: 'blob:http://localhost:5173/mock-uuid',
      source: 'upload',
      isObjectUrl: true,
      dataUrl: 'data:image/png;base64,abc',
    };
    board.collection.push(item);
    board.tiers.S.push({ ...item, id: 'img-2' });

    const serialized = serializeBoard(board);
    expect(serialized.title).toBe('Anime Tier List');
    expect(serialized.collection[0].src).toBe('');
    expect(serialized.collection[0].dataUrl).toBe('data:image/png;base64,abc');
    expect(serialized.tiers.S[0].src).toBe('');
    expect(serialized.tierConfigs).toEqual(DEFAULT_TIER_CONFIGS);
  });

  it('saves and loads from localStorage fallback when IndexedDB is absent in jsdom', async () => {
    const board = createEmptyBoard('Test Board');
    board.collection.push({
      id: 'txt-1',
      name: 'Text Item',
      src: '',
      source: 'text',
      isObjectUrl: false,
      text: 'Text Item',
    });

    const saved = await saveBoardToStorage(board);
    expect(saved).toBe(true);

    const loaded = await loadBoardFromStorage();
    expect(loaded).not.toBeNull();
    expect(loaded?.board.title).toBe('Test Board');
    expect(loaded?.board.collection).toHaveLength(1);
    expect(loaded?.board.collection[0].name).toBe('Text Item');

    await clearBoardStorage();
    const afterClear = await loadBoardFromStorage();
    expect(afterClear).toBeNull();
  });
});

