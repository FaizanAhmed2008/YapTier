import type { TierId } from '../board';
import { createEmptyBoard, DEFAULT_TIER_CONFIGS, TIER_IDS } from '../board';
import type { CollectionImage, TierConfig } from '../../types';
import type { TierBoardState } from '../board';

const DB_NAME = 'yaptier_db';
const DB_VERSION = 1;
const SESSION_STORE = 'sessions';
const IMAGE_STORE = 'images';
const SESSION_KEY = 'active_session';
const LOCAL_STORAGE_BACKUP_KEY = 'yaptier_board_backup_v1';

export interface StoredBoardData {
  version: 1;
  title: string;
  collection: CollectionImage[];
  tiers: Record<TierId, CollectionImage[]>;
  tierConfigs: Record<TierId, TierConfig>;
  updatedAt: number;
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read image as data URL'));
    reader.readAsDataURL(blob);
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0]?.match(/:(.*?);/)?.[1] || 'image/png';
  const binary = atob(parts[1] || '');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

function hasIndexedDB(): boolean {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
}

function hasLocalStorage(): boolean {
  try {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!hasIndexedDB()) {
      reject(new Error('IndexedDB is not available in this environment'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        db.createObjectStore(SESSION_STORE);
      }
      if (!db.objectStoreNames.contains(IMAGE_STORE)) {
        db.createObjectStore(IMAGE_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
  });
}

export async function saveImageBlob(id: string, blob: Blob): Promise<void> {
  if (!hasIndexedDB()) return;

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(IMAGE_STORE).put(blob, id);
    });
  } catch (err) {
    console.warn('Failed to save image blob to IndexedDB:', err);
  }
}

export async function getImageBlob(id: string): Promise<Blob | null> {
  if (!hasIndexedDB()) return null;

  try {
    const db = await openDB();
    return await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE, 'readonly');
      tx.onerror = () => reject(tx.error);
      const req = tx.objectStore(IMAGE_STORE).get(id);
      req.onsuccess = () => resolve((req.result as Blob) ?? null);
    });
  } catch {
    return null;
  }
}

export async function removeImageBlob(id: string): Promise<void> {
  if (!hasIndexedDB()) return;

  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(IMAGE_STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(IMAGE_STORE).delete(id);
    });
  } catch (err) {
    console.warn('Failed to delete image blob from IndexedDB:', err);
  }
}

export function serializeBoard(board: TierBoardState): StoredBoardData {
  return {
    version: 1,
    title: board.title ?? 'YapTier List',
    collection: board.collection.map((item) => ({
      ...item,
      // Do not store ephemeral object URL string in saved structure
      src: item.isObjectUrl ? '' : item.src,
    })),
    tiers: {
      S: board.tiers.S.map((item) => ({ ...item, src: item.isObjectUrl ? '' : item.src })),
      A: board.tiers.A.map((item) => ({ ...item, src: item.isObjectUrl ? '' : item.src })),
      B: board.tiers.B.map((item) => ({ ...item, src: item.isObjectUrl ? '' : item.src })),
      C: board.tiers.C.map((item) => ({ ...item, src: item.isObjectUrl ? '' : item.src })),
      D: board.tiers.D.map((item) => ({ ...item, src: item.isObjectUrl ? '' : item.src })),
    },
    tierConfigs: board.tierConfigs ?? { ...DEFAULT_TIER_CONFIGS },
    updatedAt: Date.now(),
  };
}

export async function saveBoardToStorage(board: TierBoardState): Promise<boolean> {
  const serialized = serializeBoard(board);

  // 1. Try IndexedDB
  if (hasIndexedDB()) {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(SESSION_STORE, 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore(SESSION_STORE).put(serialized, SESSION_KEY);
      });
      return true;
    } catch (err) {
      console.warn('IndexedDB save failed, falling back to localStorage:', err);
    }
  }

  // 2. Fallback to localStorage
  if (hasLocalStorage()) {
    try {
      // Strip large embedded dataUrls from localStorage to avoid quota exceeded
      const compactData = {
        ...serialized,
        collection: serialized.collection.map((item) => ({ ...item, dataUrl: undefined })),
        tiers: {
          S: serialized.tiers.S.map((item) => ({ ...item, dataUrl: undefined })),
          A: serialized.tiers.A.map((item) => ({ ...item, dataUrl: undefined })),
          B: serialized.tiers.B.map((item) => ({ ...item, dataUrl: undefined })),
          C: serialized.tiers.C.map((item) => ({ ...item, dataUrl: undefined })),
          D: serialized.tiers.D.map((item) => ({ ...item, dataUrl: undefined })),
        },
      };
      window.localStorage.setItem(LOCAL_STORAGE_BACKUP_KEY, JSON.stringify(compactData));
      return true;
    } catch (err) {
      console.warn('localStorage save failed:', err);
    }
  }

  return false;
}

export async function loadBoardFromStorage(): Promise<{
  board: TierBoardState;
  createdObjectUrls: string[];
} | null> {
  let data: StoredBoardData | null = null;

  // 1. Try IndexedDB
  if (hasIndexedDB()) {
    try {
      const db = await openDB();
      data = await new Promise<StoredBoardData | null>((resolve, reject) => {
        const tx = db.transaction(SESSION_STORE, 'readonly');
        tx.onerror = () => reject(tx.error);
        const req = tx.objectStore(SESSION_STORE).get(SESSION_KEY);
        req.onsuccess = () => resolve((req.result as StoredBoardData) ?? null);
      });
    } catch {
      data = null;
    }
  }

  // 2. Fallback to localStorage if IndexedDB had nothing
  if (!data && hasLocalStorage()) {
    try {
      const raw = window.localStorage.getItem(LOCAL_STORAGE_BACKUP_KEY);
      if (raw) {
        data = JSON.parse(raw) as StoredBoardData;
      }
    } catch {
      data = null;
    }
  }

  if (!data || !data.tiers) {
    return null;
  }

  const createdObjectUrls: string[] = [];

  async function restoreImage(item: CollectionImage): Promise<CollectionImage> {
    if (item.source !== 'upload') {
      return item;
    }

    // Try retrieving blob from IndexedDB
    let blob = await getImageBlob(item.id);

    // If not found as blob, check if dataUrl is available
    if (!blob && item.dataUrl) {
      try {
        blob = dataUrlToBlob(item.dataUrl);
      } catch {
        blob = null;
      }
    }

    if (blob) {
      try {
        const objectUrl = URL.createObjectURL(blob);
        createdObjectUrls.push(objectUrl);
        return {
          ...item,
          src: objectUrl,
          isObjectUrl: true,
        };
      } catch {
        return item;
      }
    }

    return item;
  }

  const collection = await Promise.all(data.collection.map(restoreImage));
  const tiers: Record<TierId, CollectionImage[]> = {
    S: await Promise.all((data.tiers.S || []).map(restoreImage)),
    A: await Promise.all((data.tiers.A || []).map(restoreImage)),
    B: await Promise.all((data.tiers.B || []).map(restoreImage)),
    C: await Promise.all((data.tiers.C || []).map(restoreImage)),
    D: await Promise.all((data.tiers.D || []).map(restoreImage)),
  };

  const board: TierBoardState = {
    title: data.title || 'YapTier List',
    collection,
    tiers,
    tierConfigs: data.tierConfigs || { ...DEFAULT_TIER_CONFIGS },
  };

  return { board, createdObjectUrls };
}

export async function clearBoardStorage(): Promise<void> {
  if (hasIndexedDB()) {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([SESSION_STORE, IMAGE_STORE], 'readwrite');
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.objectStore(SESSION_STORE).clear();
        tx.objectStore(IMAGE_STORE).clear();
      });
    } catch (err) {
      console.warn('Failed to clear IndexedDB:', err);
    }
  }

  if (hasLocalStorage()) {
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_BACKUP_KEY);
    } catch {
      // ignore
    }
  }
}
