import { useCallback, useEffect, useRef, useState } from 'react';
import { humanizeIconName, stripFileExtension } from '../lib/format';
import { createId } from '../lib/ids';
import { validateImageFile } from '../lib/images';
import type { CollectionImage, UploadRejection } from '../types';
import type { IconSummary } from '../lib/providers/types';

export function useImageCollection() {
  const [images, setImages] = useState<CollectionImage[]>([]);
  const imagesRef = useRef<CollectionImage[]>([]);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    imagesRef.current = images;
  }, [images]);

  useEffect(() => {
    const objectUrls = objectUrlsRef.current;

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
      objectUrls.clear();
    };
  }, []);

  const commitImages = useCallback((nextImages: CollectionImage[]) => {
    imagesRef.current = nextImages;
    setImages(nextImages);
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
        commitImages([...imagesRef.current, ...accepted]);
      }

      return rejected;
    },
    [commitImages],
  );

  const addIcon = useCallback(
    (icon: IconSummary): CollectionImage => {
      const image: CollectionImage = {
        id: createId('icon'),
        name: humanizeIconName(icon.name),
        src: icon.svgUrl,
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

      commitImages([...imagesRef.current, image]);
      return image;
    },
    [commitImages],
  );

  const removeImage = useCallback(
    (id: string) => {
      const target = imagesRef.current.find((image) => image.id === id);

      if (target?.isObjectUrl && objectUrlsRef.current.has(target.src)) {
        URL.revokeObjectURL(target.src);
        objectUrlsRef.current.delete(target.src);
      }

      commitImages(imagesRef.current.filter((image) => image.id !== id));
    },
    [commitImages],
  );

  return { images, addFiles, addIcon, removeImage };
}
