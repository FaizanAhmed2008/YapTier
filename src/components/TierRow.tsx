import { useDroppable } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { tierContainerId } from '../lib/board';
import type { TierId } from '../lib/board';
import type { CollectionImage } from '../types';
import { ImageTile } from './ImageTile';

interface TierRowProps {
  tier: TierId;
  images: CollectionImage[];
  isOver: boolean;
  onReturn: (id: string) => void;
}

export function TierRow({ tier, images, isOver, onReturn }: TierRowProps) {
  const { setNodeRef } = useDroppable({ id: tierContainerId(tier) });

  return (
    <div className="tier-row">
      <div className={`tier-label tier-label-${tier.toLowerCase()}`} aria-hidden="true">
        {tier}
      </div>
      <div
        ref={setNodeRef}
        className={`tier-dropzone${isOver ? ' is-over' : ''}${images.length === 0 ? ' is-empty' : ''}`}
        role="group"
        aria-label={`${tier} tier`}
      >
        <SortableContext
          items={images.map((image) => image.id)}
          strategy={horizontalListSortingStrategy}
        >
          {images.map((image) => (
            <ImageTile
              key={image.id}
              image={image}
              container={tier}
              onRemove={onReturn}
              removeAction="return"
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
