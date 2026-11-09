import type { CollectionImage, TierConfig } from '../types';

export const TIER_IDS = ['S', 'A', 'B', 'C', 'D'] as const;
export type TierId = (typeof TIER_IDS)[number];

export const COLLECTION_ID = 'collection';
export type ContainerId = TierId | typeof COLLECTION_ID;

export const DEFAULT_TIER_CONFIGS: Record<TierId, TierConfig> = {
  S: { label: 'S', color: '#ff7f7f' },
  A: { label: 'A', color: '#ffbf7f' },
  B: { label: 'B', color: '#ffdf7f' },
  C: { label: 'C', color: '#bfff7f' },
  D: { label: 'D', color: '#7fbfff' },
};

export interface TierBoardState {
  title?: string;
  collection: CollectionImage[];
  tiers: Record<TierId, CollectionImage[]>;
  tierConfigs: Record<TierId, TierConfig>;
}

export function createEmptyBoard(title = 'YapTier List'): TierBoardState {
  return {
    title,
    collection: [],
    tiers: { S: [], A: [], B: [], C: [], D: [] },
    tierConfigs: { ...DEFAULT_TIER_CONFIGS },
  };
}

export function tierContainerId(tier: TierId): string {
  return `tier-${tier}`;
}

export function parseContainerId(id: string): ContainerId | null {
  if (id === COLLECTION_ID) {
    return COLLECTION_ID;
  }

  if (id.startsWith('tier-')) {
    const tier = id.slice('tier-'.length);
    if ((TIER_IDS as readonly string[]).includes(tier)) {
      return tier as TierId;
    }
  }

  return null;
}

export function getContainerItems(
  state: TierBoardState,
  container: ContainerId,
): CollectionImage[] {
  return container === COLLECTION_ID ? state.collection : state.tiers[container];
}

function setContainerItems(
  state: TierBoardState,
  container: ContainerId,
  items: CollectionImage[],
): TierBoardState {
  if (container === COLLECTION_ID) {
    return { ...state, collection: items };
  }

  return { ...state, tiers: { ...state.tiers, [container]: items } };
}

export function findItemContainer(
  state: TierBoardState,
  itemId: string,
): ContainerId | null {
  if (state.collection.some((image) => image.id === itemId)) {
    return COLLECTION_ID;
  }

  for (const tier of TIER_IDS) {
    if (state.tiers[tier].some((image) => image.id === itemId)) {
      return tier;
    }
  }

  return null;
}

export function findItem(state: TierBoardState, itemId: string): CollectionImage | null {
  const container = findItemContainer(state, itemId);
  if (!container) {
    return null;
  }

  return getContainerItems(state, container).find((image) => image.id === itemId) ?? null;
}

function moveWithin<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
}

export function resolveDrop(
  state: TierBoardState,
  activeId: string,
  overId: string,
): TierBoardState {
  const source = findItemContainer(state, activeId);
  if (!source) {
    return state;
  }

  const target = findItemContainer(state, overId) ?? parseContainerId(overId);
  if (!target) {
    return state;
  }

  const sourceItems = getContainerItems(state, source);
  const fromIndex = sourceItems.findIndex((image) => image.id === activeId);
  if (fromIndex === -1) {
    return state;
  }

  if (source === target) {
    if (overId === activeId) {
      return state;
    }

    const overIndex = sourceItems.findIndex((image) => image.id === overId);
    const toIndex = overIndex === -1 ? sourceItems.length - 1 : overIndex;

    if (toIndex === fromIndex) {
      return state;
    }

    return setContainerItems(state, source, moveWithin(sourceItems, fromIndex, toIndex));
  }

  const movingItem = sourceItems[fromIndex];
  const targetItems = getContainerItems(state, target);
  const overIndex = targetItems.findIndex((image) => image.id === overId);
  const insertIndex = overIndex === -1 ? targetItems.length : overIndex;

  let next = setContainerItems(
    state,
    source,
    sourceItems.filter((image) => image.id !== activeId),
  );
  next = setContainerItems(next, target, [
    ...targetItems.slice(0, insertIndex),
    movingItem,
    ...targetItems.slice(insertIndex),
  ]);

  return next;
}

export function removeItemFromBoard(state: TierBoardState, itemId: string): TierBoardState {
  const container = findItemContainer(state, itemId);
  if (!container) {
    return state;
  }

  return setContainerItems(
    state,
    container,
    getContainerItems(state, container).filter((image) => image.id !== itemId),
  );
}

export function returnItemToCollection(
  state: TierBoardState,
  itemId: string,
): TierBoardState {
  const container = findItemContainer(state, itemId);
  if (!container || container === COLLECTION_ID) {
    return state;
  }

  const items = getContainerItems(state, container);
  const item = items.find((image) => image.id === itemId);
  if (!item) {
    return state;
  }

  const withoutItem = setContainerItems(
    state,
    container,
    items.filter((image) => image.id !== itemId),
  );

  return setContainerItems(withoutItem, COLLECTION_ID, [...withoutItem.collection, item]);
}

export function getAllImages(state: TierBoardState): CollectionImage[] {
  return [
    ...state.collection,
    ...TIER_IDS.flatMap((tier) => state.tiers[tier]),
  ];
}

export function getTierConfig(state: TierBoardState, tier: TierId): TierConfig {
  return state.tierConfigs?.[tier] ?? DEFAULT_TIER_CONFIGS[tier];
}

export function updateTierConfig(
  state: TierBoardState,
  tier: TierId,
  config: Partial<TierConfig>,
): TierBoardState {
  const current = getTierConfig(state, tier);
  return {
    ...state,
    tierConfigs: {
      ...state.tierConfigs,
      [tier]: {
        label: config.label?.trim() ? config.label.trim() : current.label,
        color: config.color?.trim() ? config.color.trim() : current.color,
      },
    },
  };
}

export function clearBoard(state: TierBoardState): TierBoardState {
  const placedItems = TIER_IDS.flatMap((tier) => state.tiers[tier]);
  return {
    ...state,
    collection: [...state.collection, ...placedItems],
    tiers: { S: [], A: [], B: [], C: [], D: [] },
  };
}

export function resetBoard(title = 'YapTier List'): TierBoardState {
  return createEmptyBoard(title);
}

export function setBoardTitle(state: TierBoardState, title: string): TierBoardState {
  return {
    ...state,
    title: title.trim() || 'YapTier List',
  };
}
