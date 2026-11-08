import { closestCenter, pointerWithin } from '@dnd-kit/core';
import type { Collision, CollisionDetection } from '@dnd-kit/core';

export type BoardDropType = 'item' | 'container';

export function getDropType(collision: Collision): BoardDropType | null {
  const dropType = collision.data?.droppableContainer.data.current?.dropType;

  return dropType === 'item' || dropType === 'container' ? dropType : null;
}

export const boardCollisionDetection: CollisionDetection = (args) => {
  if (!args.pointerCoordinates) {
    const collision = closestCenter(args)[0];

    return collision ? [collision] : [];
  }

  const collisions = pointerWithin(args);
  if (collisions.length === 0) {
    return [];
  }

  const itemCollision = collisions.find((collision) => getDropType(collision) === 'item');

  return [itemCollision ?? collisions[0]];
};
