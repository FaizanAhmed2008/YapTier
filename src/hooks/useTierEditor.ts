import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createEmptyBoard,
  findItem,
  getAllImages,
  removeItemFromBoard,
  resolveDrop,
  returnItemToCollection,
} from '../lib/board';
import type { TierBoardState } from '../lib/board';
import { humanizeIconName, stripFileExtension } from '../lib/format';
import { createId } from '../lib/ids';
import { validateImageFile } from '../lib/images';
import type { IconSummary } from '../lib/providers/types';
import type { CollectionImage, UploadRejection } from '../types';

export function useTierEditor() {
  const [board, setBoard] = useState<TierBoardState>(createEmptyBoard);
  const boardRef = useRef<TierBoardState>(board);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const commitBoard = useCallback((nextBoard: TierBoardState) => {
    boardRef.current = nextBoard;
    setBoard(nextBoard);
  }, []);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

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

        objectUrlsRef.current.add(src);
        accepted.push({
          id: createId('image'),
          name: stripFileExtension(file.name),
          src,
          source: 'upload',
          isObjectUrl: true,
        });
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

      commitBoard(removeItemFromBoard(boardRef.current, itemId));
    },
    [commitBoard],
  );

  return {
    board,
    collection: board.collection,
    tiers: board.tiers,
    totalCount: getAllImages(board).length,
    addFiles,
    addIcon,
    addText,
    moveItem,
    returnToCollection,
    removeImage,
  };
}
