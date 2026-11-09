import { describe, expect, it } from 'vitest';
import {
  COLLECTION_ID,
  clearBoard,
  createEmptyBoard,
  findItem,
  findItemContainer,
  getAllImages,
  getContainerItems,
  getTierConfig,
  parseContainerId,
  removeItemFromBoard,
  resetBoard,
  resolveDrop,
  returnItemToCollection,
  setBoardTitle,
  tierContainerId,
  updateTierConfig,
} from './board';
import type { TierBoardState } from './board';
import type { CollectionImage } from '../types';

function image(id: string): CollectionImage {
  return {
    id,
    name: id,
    src: `blob:${id}`,
    source: 'upload',
    isObjectUrl: false,
  };
}

function ids(items: CollectionImage[]): string[] {
  return items.map((item) => item.id);
}

function withItems(
  collection: string[],
  tiers: Partial<Record<'S' | 'A' | 'B' | 'C' | 'D', string[]>> = {},
): TierBoardState {
  const board = createEmptyBoard();
  board.collection = collection.map(image);

  for (const tier of ['S', 'A', 'B', 'C', 'D'] as const) {
    board.tiers[tier] = (tiers[tier] ?? []).map(image);
  }

  return board;
}

describe('board containers', () => {
  it('creates an empty board with all tiers', () => {
    const board = createEmptyBoard();

    expect(board.collection).toEqual([]);
    expect(Object.keys(board.tiers)).toEqual(['S', 'A', 'B', 'C', 'D']);
    expect(getAllImages(board)).toEqual([]);
  });

  it('parses tier and collection container ids', () => {
    expect(parseContainerId(COLLECTION_ID)).toBe(COLLECTION_ID);
    expect(parseContainerId('tier-S')).toBe('S');
    expect(parseContainerId('tier-D')).toBe('D');
    expect(parseContainerId('tier-Z')).toBeNull();
    expect(parseContainerId('not-a-container')).toBeNull();
    expect(tierContainerId('A')).toBe('tier-A');
  });

  it('finds item containers and items', () => {
    const board = withItems(['one'], { S: ['two'], D: ['three'] });

    expect(findItemContainer(board, 'one')).toBe(COLLECTION_ID);
    expect(findItemContainer(board, 'two')).toBe('S');
    expect(findItemContainer(board, 'three')).toBe('D');
    expect(findItemContainer(board, 'missing')).toBeNull();
    expect(findItem(board, 'three')).toMatchObject({ id: 'three' });
    expect(findItem(board, 'missing')).toBeNull();
    expect(ids(getContainerItems(board, 'S'))).toEqual(['two']);
  });
});

describe('resolveDrop', () => {
  it('moves an item from the collection into an empty tier', () => {
    const board = withItems(['one', 'two']);
    const next = resolveDrop(board, 'one', 'tier-S');

    expect(ids(next.collection)).toEqual(['two']);
    expect(ids(next.tiers.S)).toEqual(['one']);
  });

  it('moves an item from the collection into a tier at the hovered position', () => {
    const board = withItems(['one', 'two'], { S: ['a', 'b'] });
    const next = resolveDrop(board, 'one', 'b');

    expect(ids(next.collection)).toEqual(['two']);
    expect(ids(next.tiers.S)).toEqual(['a', 'one', 'b']);
  });

  it('reorders items within the same tier', () => {
    const board = withItems([], { A: ['a', 'b', 'c'] });
    const next = resolveDrop(board, 'a', 'c');

    expect(ids(next.tiers.A)).toEqual(['b', 'c', 'a']);
  });

  it('moves an item between tiers', () => {
    const board = withItems([], { A: ['a', 'b'], B: ['c'] });
    const next = resolveDrop(board, 'a', 'c');

    expect(ids(next.tiers.A)).toEqual(['b']);
    expect(ids(next.tiers.B)).toEqual(['a', 'c']);
  });

  it('returns an item from a tier to the collection', () => {
    const board = withItems(['one'], { S: ['two', 'three'] });
    const next = resolveDrop(board, 'two', 'collection');

    expect(ids(next.collection)).toEqual(['one', 'two']);
    expect(ids(next.tiers.S)).toEqual(['three']);
  });

  it('returns an item from a tier to a position in the collection', () => {
    const board = withItems(['one', 'two'], { S: ['three'] });
    const next = resolveDrop(board, 'three', 'two');

    expect(ids(next.collection)).toEqual(['one', 'three', 'two']);
    expect(ids(next.tiers.S)).toEqual([]);
  });

  it('ignores unknown items and containers', () => {
    const board = withItems(['one'], { S: ['two'] });

    expect(resolveDrop(board, 'missing', 'tier-S')).toBe(board);
    expect(resolveDrop(board, 'one', 'missing')).toBe(board);
  });
});

describe('board mutations', () => {
  it('removes an item from any container', () => {
    const board = withItems(['one'], { S: ['two'] });

    expect(ids(removeItemFromBoard(board, 'one').collection)).toEqual([]);
    expect(ids(removeItemFromBoard(board, 'two').tiers.S)).toEqual([]);
    expect(removeItemFromBoard(board, 'missing')).toBe(board);
  });

  it('returns a tier item to the end of the collection', () => {
    const board = withItems(['one'], { B: ['two', 'three'] });
    const next = returnItemToCollection(board, 'two');

    expect(ids(next.collection)).toEqual(['one', 'two']);
    expect(ids(next.tiers.B)).toEqual(['three']);
    expect(returnItemToCollection(board, 'one')).toBe(board);
    expect(returnItemToCollection(board, 'missing')).toBe(board);
  });

  it('collects images in collection then tier order', () => {
    const board = withItems(['one'], { S: ['two'], D: ['three'] });

    expect(ids(getAllImages(board))).toEqual(['one', 'two', 'three']);
  });

  it('updates tier configuration and colors', () => {
    const board = createEmptyBoard();
    const updated = updateTierConfig(board, 'S', { label: 'GOD TIER', color: '#ff0000' });

    expect(getTierConfig(updated, 'S')).toEqual({ label: 'GOD TIER', color: '#ff0000' });
    expect(getTierConfig(updated, 'A')).toEqual({ label: 'A', color: '#ffbf7f' });
  });

  it('clears placed items back to the unranked collection', () => {
    const board = withItems(['unranked-1'], { S: ['s-1'], A: ['a-1', 'a-2'] });
    const cleared = clearBoard(board);

    expect(ids(cleared.collection)).toEqual(['unranked-1', 's-1', 'a-1', 'a-2']);
    expect(cleared.tiers.S).toEqual([]);
    expect(cleared.tiers.A).toEqual([]);
  });

  it('resets the board and sets custom titles', () => {
    const board = withItems(['one'], { S: ['two'] });
    const reset = resetBoard('My Favorite Games');

    expect(reset.title).toBe('My Favorite Games');
    expect(reset.collection).toEqual([]);
    expect(reset.tiers.S).toEqual([]);

    const titled = setBoardTitle(reset, 'Anime 2026');
    expect(titled.title).toBe('Anime 2026');
  });
});
