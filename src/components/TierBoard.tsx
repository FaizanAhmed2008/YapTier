import { TIER_IDS } from '../lib/board';
import type { ContainerId, TierBoardState } from '../lib/board';
import { TierRow } from './TierRow';

interface TierBoardProps {
  board: TierBoardState;
  overContainer: ContainerId | null;
  onReturn: (id: string) => void;
}

export function TierBoard({ board, overContainer, onReturn }: TierBoardProps) {
  return (
    <section className="tier-board" aria-label="Tier board">
      {TIER_IDS.map((tier) => (
        <TierRow
          key={tier}
          tier={tier}
          images={board.tiers[tier]}
          isOver={overContainer === tier}
          onReturn={onReturn}
        />
      ))}
    </section>
  );
}
