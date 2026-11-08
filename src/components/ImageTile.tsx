import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ContainerId } from '../lib/board';
import type { CollectionImage } from '../types';
import { CloseGlyph, ImageGlyph, TrashGlyph } from './Glyphs';

type RemoveAction = 'delete' | 'return';

interface ImageTileProps {
  image: CollectionImage;
  container: ContainerId;
  onRemove: (id: string) => void;
  removeAction: RemoveAction;
}

export function ImageTile({ image, container, onRemove, removeAction }: ImageTileProps) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: image.id,
    data: { container, dropType: 'item' },
  });

  const removeLabel =
    removeAction === 'delete' ? `Remove ${image.name}` : `Return ${image.name} to collection`;

  return (
    <li
      ref={setNodeRef}
      className={`image-tile${isDragging ? ' is-dragging' : ''}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      data-container={container}
    >
      <button
        type="button"
        className="tile-drag"
        {...attributes}
        {...listeners}
        aria-label={image.name}
        title={image.name}
      >
        {previewFailed ? (
          <span className="tile-fallback">
            <ImageGlyph />
          </span>
        ) : (
          <img
            src={image.src}
            alt=""
            loading="lazy"
            draggable={false}
            onError={() => setPreviewFailed(true)}
          />
        )}
      </button>
      <button
        type="button"
        className="tile-remove"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onRemove(image.id);
        }}
        aria-label={removeLabel}
        title={removeLabel}
      >
        {removeAction === 'delete' ? <TrashGlyph /> : <CloseGlyph />}
      </button>
    </li>
  );
}
