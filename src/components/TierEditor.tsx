import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragOverEvent, DragStartEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  COLLECTION_ID,
  findItem,
  findItemContainer,
  parseContainerId,
} from '../lib/board';
import { boardCollisionDetection } from '../lib/dndCollisions';
import type { ContainerId, TierBoardState } from '../lib/board';
import type { CollectionImage } from '../types';
import { CollectionBar } from './CollectionBar';
import { TierBoard } from './TierBoard';

interface TierEditorProps {
  board: TierBoardState;
  onMove: (activeId: string, overId: string) => void;
  onRemove: (id: string) => void;
  onReturn: (id: string) => void;
}

function DragPreview({ image }: { image: CollectionImage }) {
  return (
    <div className="drag-preview">
      <img src={image.src} alt="" draggable={false} />
      <span className="visually-hidden">{image.name}</span>
    </div>
  );
}

export function TierEditor({ board, onMove, onRemove, onReturn }: TierEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overContainer, setOverContainer] = useState<ContainerId | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const activeItem = activeId ? findItem(board, activeId) : null;

  const resetDragState = () => {
    setActiveId(null);
    setOverContainer(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setActiveId(id);
    setOverContainer(findItemContainer(board, id));
  };

  const handleDragOver = (event: DragOverEvent) => {
    if (!event.over) {
      setOverContainer(null);
      return;
    }

    const overId = String(event.over.id);
    setOverContainer(findItemContainer(board, overId) ?? parseContainerId(overId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (event.over) {
      onMove(String(event.active.id), String(event.over.id));
    }
    resetDragState();
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={boardCollisionDetection}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={resetDragState}
    >
      <div className="editor">
        <TierBoard board={board} overContainer={overContainer} onReturn={onReturn} />
        <CollectionBar
          images={board.collection}
          isOver={overContainer === COLLECTION_ID}
          onRemove={onRemove}
        />
      </div>

      <DragOverlay dropAnimation={{ duration: 160, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}>
        {activeItem ? <DragPreview image={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
