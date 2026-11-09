import { describe, expect, it } from 'vitest';
import { exportBoardToJson, importBoardFromJson } from './json';
import { createEmptyBoard, updateTierConfig } from '../board';
import type { CollectionImage } from '../../types';

describe('JSON export and import', () => {
  it('exports and imports board state preserving items, tier configs and titles', async () => {
    let board = createEmptyBoard('Fighting Games 2026');
    board = updateTierConfig(board, 'S', { label: 'TOP TIER', color: '#ff3333' });

    const textItem: CollectionImage = {
      id: 'txt-1',
      name: 'Street Fighter 6',
      src: '',
      source: 'text',
      isObjectUrl: false,
      text: 'Street Fighter 6',
    };

    const iconItem: CollectionImage = {
      id: 'icon-1',
      name: 'Trophy',
      src: 'https://api.iconify.design/mdi:trophy.svg',
      source: 'icon',
      isObjectUrl: false,
      icon: {
        fullName: 'mdi:trophy',
        prefix: 'mdi',
        name: 'trophy',
        attribution: {
          providerId: 'iconify',
          providerLabel: 'Iconify',
          collectionPrefix: 'mdi',
          collectionName: 'Material Design Icons',
        },
      },
    };

    const uploadItem: CollectionImage = {
      id: 'img-1',
      name: 'Tekken 8',
      src: 'blob:mock-tekken',
      source: 'upload',
      isObjectUrl: true,
      dataUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    };

    board.tiers.S.push(textItem);
    board.tiers.A.push(iconItem);
    board.collection.push(uploadItem);

    const json = await exportBoardToJson(board);
    expect(json).toContain('"format": "yaptier"');
    expect(json).toContain('Fighting Games 2026');
    expect(json).toContain('TOP TIER');

    const imported = importBoardFromJson(json);
    expect(imported.board.title).toBe('Fighting Games 2026');
    expect(imported.board.tierConfigs.S.label).toBe('TOP TIER');
    expect(imported.board.tierConfigs.S.color).toBe('#ff3333');
    expect(imported.board.tiers.S[0].name).toBe('Street Fighter 6');
    expect(imported.board.tiers.A[0].name).toBe('Trophy');
    expect(imported.board.collection[0].name).toBe('Tekken 8');
  });

  it('rejects invalid JSON and corrupted data safely', () => {
    expect(() => importBoardFromJson('invalid json {')).toThrow('Invalid JSON file');
    expect(() => importBoardFromJson('"not an object"')).toThrow('Invalid tier list data');
    expect(() => importBoardFromJson(JSON.stringify({ random: 123 }))).toThrow('Unsupported tier list format');
  });
});
