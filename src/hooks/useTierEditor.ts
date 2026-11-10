import { useCallback, useEffect, useRef, useState } from 'react';
import {
  clearBoard,
  createEmptyBoard,
  findItem,
  getAllImages,
  removeItemFromBoard,
  resetBoard,
  resolveDrop,
  returnItemToCollection,
  updateTierConfig,
} from '../lib/board';
import type { TierBoardState, TierId } from '../lib/board';
import { humanizeIconName, stripFileExtension } from '../lib/format';
import { createId } from '../lib/ids';
import { validateImageFile } from '../lib/images';
import type { IconSummary } from '../lib/providers/types';
import {
  blobToDataUrl,
  clearBoardStorage,
  loadBoardFromStorage,
  removeImageBlob,
  saveBoardToStorage,
  saveImageBlob,
} from '../lib/storage/db';
import type { CollectionImage, TierConfig, UploadRejection } from '../types';

const MAX_HISTORY = 50;
const AUTO_SAVE_DELAY_MS = 400;

export function useTierEditor() {
  const [board, setBoard] = useState<TierBoardState>(createEmptyBoard);
  const boardRef = useRef<TierBoardState>(board);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const saveTimeoutRef = useRef<number | null>(null);

  // Undo / Redo history stacks
  const [past, setPast] = useState<TierBoardState[]>([]);
  const [future, setFuture] = useState<TierBoardState[]>([]);
  const pastRef = useRef<TierBoardState[]>(past);
  const futureRef = useRef<TierBoardState[]>(future);

  pastRef.current = past;
  futureRef.current = future;

  const scheduleAutoSave = useCallback((targetBoard: TierBoardState) => {
    if (typeof window === 'undefined') return;
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = window.setTimeout(() => {
      saveBoardToStorage(targetBoard).catch((err) => {
        console.warn('Auto-save failed:', err);
      });
    }, AUTO_SAVE_DELAY_MS);
  }, []);

  const commitBoard = useCallback(
    (nextBoard: TierBoardState, recordHistory = true) => {
      const prevBoard = boardRef.current;
      if (recordHistory) {
        setPast((prev) => [...prev.slice(-MAX_HISTORY + 1), prevBoard]);
        setFuture([]);
      }
      boardRef.current = nextBoard;
      setBoard(nextBoard);
      scheduleAutoSave(nextBoard);
    },
    [scheduleAutoSave],
  );

  // Load saved session on mount
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const saved = await loadBoardFromStorage();
        if (cancelled || !saved) return;

        const { board: loadedBoard, createdObjectUrls } = saved;
        createdObjectUrls.forEach((url) => objectUrlsRef.current.add(url));

        const hasItems =
          loadedBoard.collection.length > 0 ||
          Object.values(loadedBoard.tiers).some((tierList) => tierList.length > 0);

        if (hasItems) {
          boardRef.current = loadedBoard;
          setBoard(loadedBoard);
        }
      } catch (err) {
        console.warn('Failed to restore working session:', err);
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, []);

  // Cleanup object URLs and auto-save timers on unmount
  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  const undo = useCallback(() => {
    const currentPast = pastRef.current;
    if (currentPast.length === 0) return;

    const previous = currentPast[currentPast.length - 1];
    const newPast = currentPast.slice(0, -1);
    const current = boardRef.current;

    setPast(newPast);
    setFuture((f) => [current, ...f]);
    boardRef.current = previous;
    setBoard(previous);
    scheduleAutoSave(previous);
  }, [scheduleAutoSave]);

  const redo = useCallback(() => {
    const currentFuture = futureRef.current;
    if (currentFuture.length === 0) return;

    const next = currentFuture[0];
    const newFuture = currentFuture.slice(1);
    const current = boardRef.current;

    setPast((p) => [...p.slice(-MAX_HISTORY + 1), current]);
    setFuture(newFuture);
    boardRef.current = next;
    setBoard(next);
    scheduleAutoSave(next);
  }, [scheduleAutoSave]);

  // Global undo/redo keyboard listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const activeEl = document.activeElement;
      const isInput =
        activeEl?.tagName === 'INPUT' ||
        activeEl?.tagName === 'TEXTAREA' ||
        (activeEl as HTMLElement | null)?.isContentEditable;

      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  const addFiles = useCallback(
    (files: readonly File[]): UploadRejection[] => {
      const accepted: CollectionImage[] = [];
      const rejected: UploadRejection[] = [];

      for (const file of files) {
        const validation = validateImageFile(file);

        if (!validation.valid) {
          rejected.push({
            fileName: file.name,
            reason: validation.error ?? 'This file could not be added.',
          });
          continue;
        }

        let src: string;
        try {
          src = URL.createObjectURL(file);
        } catch {
          rejected.push({
            fileName: file.name,
            reason: 'Your browser could not create a preview for this file.',
          });
          continue;
        }

        const id = createId('image');
        objectUrlsRef.current.add(src);

        // Asynchronously persist blob to IndexedDB
        saveImageBlob(id, file).catch((err) => {
          console.warn('Could not cache image in IndexedDB:', err);
        });

        const imageItem: CollectionImage = {
          id,
          name: stripFileExtension(file.name),
          src,
          source: 'upload',
          isObjectUrl: true,
        };

        accepted.push(imageItem);

        // Also convert to dataUrl asynchronously so JSON export can embed it
        blobToDataUrl(file)
          .then((dataUrl) => {
            setBoard((currentBoard) => {
              const attachDataUrl = (item: CollectionImage) =>
                item.id === id ? { ...item, dataUrl } : item;

              const nextBoard: TierBoardState = {
                ...currentBoard,
                collection: currentBoard.collection.map(attachDataUrl),
                tiers: {
                  S: currentBoard.tiers.S.map(attachDataUrl),
                  A: currentBoard.tiers.A.map(attachDataUrl),
                  B: currentBoard.tiers.B.map(attachDataUrl),
                  C: currentBoard.tiers.C.map(attachDataUrl),
                  D: currentBoard.tiers.D.map(attachDataUrl),
                },
              };
              boardRef.current = nextBoard;
              return nextBoard;
            });
          })
          .catch(() => {});
      }

      if (accepted.length > 0) {
        commitBoard({
          ...boardRef.current,
          collection: [...boardRef.current.collection, ...accepted],
        });
      }

      return rejected;
    },
    [commitBoard],
  );

  const addIcon = useCallback(
    (icon: IconSummary): CollectionImage => {
      const image: CollectionImage = {
        id: createId('icon'),
        name: humanizeIconName(icon.name),
        src: icon.previewUrl ?? icon.svgUrl,
        source: 'icon',
        isObjectUrl: false,
        icon: {
          fullName: icon.fullName,
          prefix: icon.prefix,
          name: icon.name,
          attribution: {
            providerId: icon.providerId,
            providerLabel: icon.providerLabel,
            collectionPrefix: icon.prefix,
            collectionName: icon.collectionName,
            author: icon.author,
            authorUrl: icon.authorUrl,
            license: icon.license,
          },
        },
      };

      commitBoard({
        ...boardRef.current,
        collection: [...boardRef.current.collection, image],
      });
      return image;
    },
    [commitBoard],
  );

  const addText = useCallback(
    (text: string): CollectionImage | null => {
      const trimmed = text.trim();

      if (!trimmed) {
        return null;
      }

      const image: CollectionImage = {
        id: createId('text'),
        name: trimmed,
        src: '',
        source: 'text',
        isObjectUrl: false,
        text: trimmed,
      };

      commitBoard({
        ...boardRef.current,
        collection: [...boardRef.current.collection, image],
      });
      return image;
    },
    [commitBoard],
  );

  const moveItem = useCallback(
    (activeId: string, overId: string) => {
      commitBoard(resolveDrop(boardRef.current, activeId, overId));
    },
    [commitBoard],
  );

  const returnToCollection = useCallback(
    (itemId: string) => {
      commitBoard(returnItemToCollection(boardRef.current, itemId));
    },
    [commitBoard],
  );

  const removeImage = useCallback(
    (itemId: string) => {
      const item = findItem(boardRef.current, itemId);
      if (!item) {
        return;
      }

      if (item.isObjectUrl && objectUrlsRef.current.has(item.src)) {
        URL.revokeObjectURL(item.src);
        objectUrlsRef.current.delete(item.src);
      }
      removeImageBlob(itemId).catch(() => {});

      commitBoard(removeItemFromBoard(boardRef.current, itemId));
    },
    [commitBoard],
  );

  const updateTier = useCallback(
    (tierId: TierId, updates: Partial<TierConfig>) => {
      commitBoard(updateTierConfig(boardRef.current, tierId, updates));
    },
    [commitBoard],
  );

  const clearBoardAction = useCallback(() => {
    commitBoard(clearBoard(boardRef.current));
  }, [commitBoard]);

  const resetBoardAction = useCallback(() => {
    // Revoke all active object URLs
    objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
    clearBoardStorage().catch(() => {});

    const newEmpty = resetBoard();
    boardRef.current = newEmpty;
    setBoard(newEmpty);
    setPast([]);
    setFuture([]);
  }, []);

  const loadBoard = useCallback(
    (newBoard: TierBoardState, newObjectUrls: string[] = []) => {
      newObjectUrls.forEach((url) => objectUrlsRef.current.add(url));
      commitBoard(newBoard);
      // Loading replaces the board entirely, so start a fresh history.
      setPast([]);
      setFuture([]);
    },
    [commitBoard],
  );

  const loadSavedSession = useCallback(async (): Promise<boolean> => {
    try {
      const saved = await loadBoardFromStorage();
      if (!saved) {
        return false;
      }
      loadBoard(saved.board, saved.createdObjectUrls);
      return true;
    } catch (err) {
      console.warn('Failed to load saved session:', err);
      return false;
    }
  }, [loadBoard]);

  const saveCurrentBoard = useCallback(async (): Promise<boolean> => {
    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }
    return await saveBoardToStorage(boardRef.current);
  }, []);

  return {
    board,
    collection: board.collection,
    tiers: board.tiers,
    tierConfigs: board.tierConfigs,
    totalCount: getAllImages(board).length,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undo,
    redo,
    addFiles,
    addIcon,
    addText,
    moveItem,
    returnToCollection,
    removeImage,
    updateTier,
    clearBoardAction,
    resetBoardAction,
    loadBoard,
    loadSavedSession,
    saveCurrentBoard,
  };
}
