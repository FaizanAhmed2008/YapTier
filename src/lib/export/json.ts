import type { TierId } from '../board';
import { DEFAULT_TIER_CONFIGS, TIER_IDS } from '../board';
import { blobToDataUrl, dataUrlToBlob } from '../storage/db';
import type { CollectionImage, TierConfig } from '../../types';
import type { TierBoardState } from '../board';

export interface ExportedBoardSchema {
  format: 'yaptier';
  version: 1;
  title: string;
  createdAt: string;
  tierConfigs: Record<TierId, TierConfig>;
  collection: ExportedItemSchema[];
  tiers: Record<TierId, ExportedItemSchema[]>;
}

export interface ExportedItemSchema {
  id: string;
  name: string;
  source: 'upload' | 'icon' | 'text';
  src: string;
  dataUrl?: string;
  text?: string;
  icon?: {
    fullName: string;
    prefix: string;
    name: string;
    attribution: {
      providerId: string;
      providerLabel: string;
      collectionPrefix: string;
      collectionName: string;
      author?: string;
      authorUrl?: string;
      license?: {
        title: string;
        spdx?: string;
        url?: string;
      };
    };
  };
}

function sanitizeString(val: unknown, fallback = ''): string {
  if (typeof val !== 'string') return fallback;
  // Strip control characters while keeping valid text
  return val.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}

export async function exportBoardToJson(board: TierBoardState): Promise<string> {
  async function prepareItem(item: CollectionImage): Promise<ExportedItemSchema> {
    let dataUrl = item.dataUrl;

    if (item.source === 'upload' && !dataUrl && item.src.startsWith('blob:')) {
      try {
        const response = await fetch(item.src);
        const blob = await response.blob();
        dataUrl = await blobToDataUrl(blob);
      } catch {
        // keep dataUrl undefined if fetch fails
      }
    }

    return {
      id: sanitizeString(item.id),
      name: sanitizeString(item.name),
      source: item.source,
      src: item.source === 'icon' ? sanitizeString(item.src) : '',
      dataUrl: dataUrl || undefined,
      text: item.text ? sanitizeString(item.text) : undefined,
      icon: item.icon
        ? {
            fullName: sanitizeString(item.icon.fullName),
            prefix: sanitizeString(item.icon.prefix),
            name: sanitizeString(item.icon.name),
            attribution: {
              providerId: sanitizeString(item.icon.attribution.providerId),
              providerLabel: sanitizeString(item.icon.attribution.providerLabel),
              collectionPrefix: sanitizeString(item.icon.attribution.collectionPrefix),
              collectionName: sanitizeString(item.icon.attribution.collectionName),
              author: item.icon.attribution.author ? sanitizeString(item.icon.attribution.author) : undefined,
              authorUrl: item.icon.attribution.authorUrl ? sanitizeString(item.icon.attribution.authorUrl) : undefined,
              license: item.icon.attribution.license
                ? {
                    title: sanitizeString(item.icon.attribution.license.title),
                    spdx: item.icon.attribution.license.spdx ? sanitizeString(item.icon.attribution.license.spdx) : undefined,
                    url: item.icon.attribution.license.url ? sanitizeString(item.icon.attribution.license.url) : undefined,
                  }
                : undefined,
            },
          }
        : undefined,
    };
  }

  const payload: ExportedBoardSchema = {
    format: 'yaptier',
    version: 1,
    title: sanitizeString(board.title, 'YapTier List'),
    createdAt: new Date().toISOString(),
    tierConfigs: board.tierConfigs ?? { ...DEFAULT_TIER_CONFIGS },
    collection: await Promise.all(board.collection.map(prepareItem)),
    tiers: {
      S: await Promise.all(board.tiers.S.map(prepareItem)),
      A: await Promise.all(board.tiers.A.map(prepareItem)),
      B: await Promise.all(board.tiers.B.map(prepareItem)),
      C: await Promise.all(board.tiers.C.map(prepareItem)),
      D: await Promise.all(board.tiers.D.map(prepareItem)),
    },
  };

  return JSON.stringify(payload, null, 2);
}

export function downloadJsonFile(jsonString: string, filename = 'yaptier-board.json'): void {
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface ImportedBoardResult {
  board: TierBoardState;
  createdObjectUrls: string[];
}

export function importBoardFromJson(jsonString: string): ImportedBoardResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch (err) {
    throw new Error('Invalid JSON file. Please ensure the file is valid JSON.');
  }

  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('Invalid tier list data. The file does not contain a tier list object.');
  }

  const raw = parsed as Record<string, unknown>;

  // Check format identifier or structure
  if (raw.format !== 'yaptier' && !raw.tiers) {
    throw new Error('Unsupported tier list format. Expected a YapTier exported JSON file.');
  }

  const title = sanitizeString(raw.title, 'Imported Tier List');

  // Parse tierConfigs safely
  const rawConfigs = (typeof raw.tierConfigs === 'object' && raw.tierConfigs !== null
    ? raw.tierConfigs
    : {}) as Record<string, unknown>;

  const tierConfigs: Record<TierId, TierConfig> = { ...DEFAULT_TIER_CONFIGS };
  for (const tier of TIER_IDS) {
    const cfg = rawConfigs[tier];
    if (typeof cfg === 'object' && cfg !== null) {
      const label = sanitizeString((cfg as { label?: unknown }).label, tier);
      const color = sanitizeString((cfg as { color?: unknown }).color, DEFAULT_TIER_CONFIGS[tier].color);
      tierConfigs[tier] = { label, color };
    }
  }

  const createdObjectUrls: string[] = [];

  function sanitizeItem(rawItem: unknown): CollectionImage | null {
    if (typeof rawItem !== 'object' || rawItem === null) return null;
    const item = rawItem as Record<string, unknown>;

    const id = sanitizeString(item.id, `item-${Math.random().toString(36).slice(2, 9)}`);
    const name = sanitizeString(item.name, 'Item');
    const source = item.source === 'upload' || item.source === 'icon' || item.source === 'text' ? item.source : 'text';

    if (source === 'text') {
      const text = sanitizeString(item.text ?? item.name, name);
      return {
        id,
        name: text,
        src: '',
        source: 'text',
        isObjectUrl: false,
        text,
      };
    }

    if (source === 'icon') {
      const src = sanitizeString(item.src);
      return {
        id,
        name,
        src,
        source: 'icon',
        isObjectUrl: false,
        icon: typeof item.icon === 'object' && item.icon !== null ? (item.icon as CollectionImage['icon']) : undefined,
      };
    }

    // Source is upload
    const dataUrl = typeof item.dataUrl === 'string' && item.dataUrl.startsWith('data:') ? item.dataUrl : '';
    let src = '';
    let isObjectUrl = false;

    if (dataUrl) {
      try {
        const blob = dataUrlToBlob(dataUrl);
        src = URL.createObjectURL(blob);
        isObjectUrl = true;
        createdObjectUrls.push(src);
      } catch {
        src = '';
      }
    }

    return {
      id,
      name,
      src,
      source: 'upload',
      isObjectUrl,
      dataUrl: dataUrl || undefined,
    };
  }

  function parseItemList(list: unknown): CollectionImage[] {
    if (!Array.isArray(list)) return [];
    return list.map(sanitizeItem).filter((item): item is CollectionImage => item !== null);
  }

  const rawTiers = (typeof raw.tiers === 'object' && raw.tiers !== null ? raw.tiers : {}) as Record<string, unknown>;

  const board: TierBoardState = {
    title,
    collection: parseItemList(raw.collection),
    tiers: {
      S: parseItemList(rawTiers.S),
      A: parseItemList(rawTiers.A),
      B: parseItemList(rawTiers.B),
      C: parseItemList(rawTiers.C),
      D: parseItemList(rawTiers.D),
    },
    tierConfigs,
  };

  return { board, createdObjectUrls };
}

