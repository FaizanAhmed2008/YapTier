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

  return (
    <section
      ref={setNodeRef}
      className={`collection-bar${isOver ? ' is-over' : ''}`}
      aria-label="Unranked images"
    >
      <div className="collection-label" aria-hidden="true">
        Unranked
      </div>
      <div className="collection-strip">
        <SortableContext
          items={images.map((image) => image.id)}
          strategy={horizontalListSortingStrategy}
        >
          {images.length === 0 ? (
            <span className="collection-empty">No images yet</span>
          ) : (
            images.map((image) => (
              <ImageTile
                key={image.id}
                image={image}
                container={COLLECTION_ID}
                onRemove={onRemove}
                removeAction="delete"
              />
            ))
          )}
        </SortableContext>
      </div>
    </section>
  );
}
