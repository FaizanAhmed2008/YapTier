import { describe, expect, it } from 'vitest';
import type { ClientRect, CollisionDetection, DroppableContainer } from '@dnd-kit/core';
import { boardCollisionDetection, getDropType } from './dndCollisions';

function rect(left: number, top: number, width: number, height: number): ClientRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

function container(id: string, dropType: string, area: ClientRect): DroppableContainer {
  return {
    id,
    key: id,
    data: { current: { dropType } },
    disabled: false,
    node: { current: null },
    rect: { current: area },
  };
}

function detect(
  pointerCoordinates: { x: number; y: number } | null,
  droppableContainers: DroppableContainer[],
): string[] {
  const droppableRects = new Map(
    droppableContainers.map((container) => [container.id, container.rect.current!]),
  );

  return boardCollisionDetection({
    active: {
      id: 'source',
      data: { current: {} },
      rect: { current: { initial: null, translated: null } },
    },
    collisionRect: rect(80, 60, 80, 80),
    droppableRects,
    droppableContainers,
    pointerCoordinates,
  } satisfies Parameters<CollisionDetection>[0]).map((collision) => String(collision.id));
}

describe('board collision detection', () => {
  it('selects an empty tier under the pointer instead of a distant tile center', () => {
    const sTile = container('s-tile', 'item', rect(80, 60, 80, 80));
    const aTier = container('tier-A', 'container', rect(0, 220, 800, 60));

    expect(detect({ x: 160, y: 250 }, [sTile, aTier])).toEqual(['tier-A']);
  });

  it('prefers a tile over its containing tier when both are under the pointer', () => {
    const sTier = container('tier-S', 'container', rect(0, 60, 800, 80));
    const sTile = container('s-tile', 'item', rect(80, 60, 80, 80));

    expect(detect({ x: 100, y: 100 }, [sTier, sTile])).toEqual(['s-tile']);
  });

  it('does not choose a fallback target when the pointer is outside every container', () => {
    const sTier = container('tier-S', 'container', rect(0, 60, 800, 80));

    expect(detect({ x: 900, y: 500 }, [sTier])).toEqual([]);
  });

  it('falls back to closest centers for keyboard dragging without pointer coordinates', () => {
    const nearTile = container('near-tile', 'item', rect(80, 60, 80, 80));
    const farTile = container('far-tile', 'item', rect(500, 60, 80, 80));

    expect(detect(null, [farTile, nearTile])).toEqual(['near-tile']);
  });

  it('reads drop types from droppable data', () => {
    const item = container('item', 'item', rect(0, 0, 10, 10));
    const tier = container('tier', 'container', rect(0, 0, 10, 10));
    const invalid = container('invalid', 'other', rect(0, 0, 10, 10));

    expect(
      getDropType({
        id: 'item',
        data: { droppableContainer: item },
      }),
    ).toBe('item');
    expect(
      getDropType({
        id: 'tier',
        data: { droppableContainer: tier },
      }),
    ).toBe('container');
    expect(
      getDropType({
        id: 'invalid',
        data: { droppableContainer: invalid },
      }),
    ).toBeNull();
  });
});
