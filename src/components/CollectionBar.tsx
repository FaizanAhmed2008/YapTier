import { useCallback, useRef } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { COLLECTION_ID } from '../lib/board';
import type { CollectionImage } from '../types';
import { ImageTile } from './ImageTile';

interface CollectionBarProps {
  images: CollectionImage[];
  isOver: boolean;
  onRemove: (id: string) => void;
}

export function CollectionBar({ images, isOver, onRemove }: CollectionBarProps) {
  const { setNodeRef } = useDroppable({
    id: COLLECTION_ID,
    data: { dropType: 'container' },
  });
  const focusedIndexRef = useRef(-1);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (images.length === 0) {
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();

        let next = focusedIndexRef.current;
        if (event.key === 'ArrowRight') {
          next = (next + 1) % images.length;
        } else {
          next = (next - 1 + images.length) % images.length;
        }

        focusedIndexRef.current = next;

        const strip = event.currentTarget as HTMLElement;
        const focusable = strip.querySelector<HTMLElement>(
          `[data-index="${next}"]`
        );
        if (focusable) {
          focusable.focus();
        }
      }
    },
    [images.length],
  );

  return (
    <section
      ref={setNodeRef}
      className={`collection-bar${isOver ? ' is-over' : ''}`}
      aria-label="Unranked items"
    >
      <div className="collection-label" aria-hidden="true">
        Unranked
      </div>
      <div
        className="collection-strip"
        onKeyDown={handleKeyDown}
      >
        <SortableContext
          items={images.map((image) => image.id)}
          strategy={horizontalListSortingStrategy}
        >
          {images.length === 0 ? (
            <span className="collection-empty">No items yet</span>
          ) : (
            images.map((image, index) => (
              <ImageTile
                key={image.id}
                image={image}
                container={COLLECTION_ID}
                onRemove={onRemove}
                removeAction="delete"
                dataIndex={index}
                isFocused={focusedIndexRef.current === index}
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
}
