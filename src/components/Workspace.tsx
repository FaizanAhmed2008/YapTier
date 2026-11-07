import { pluralize } from '../lib/format';
import { SparklesGlyph } from './Glyphs';

const TIERS = ['S', 'A', 'B', 'C', 'D'];

interface WorkspaceProps {
  imageCount: number;
}

export function Workspace({ imageCount }: WorkspaceProps) {
  return (
    <section className="panel workspace" aria-labelledby="workspace-title">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2 id="workspace-title">Tier board</h2>
        </div>
        <span className="chip">Blank canvas</span>
      </div>

      <div className="workspace-body">
        <div className="tier-board" aria-hidden="true">
          {TIERS.map((tier) => (
            <div className="tier-row" key={tier}>
              <span className={`tier-label tier-${tier.toLowerCase()}`}>{tier}</span>
              <span className="tier-line" />
            </div>
          ))}
        </div>

        <div className="workspace-empty">
          <div className="empty-orbit" aria-hidden="true">
            <SparklesGlyph />
          </div>
          <h3>Your board is a blank slate</h3>
          <p>
            {imageCount === 0
              ? 'Upload images or find icons below to stock your collection. Your tier board is warming up.'
              : `${pluralize(imageCount, 'image')} ready in your collection. The canvas is set — tier building comes next.`}
          </p>
        </div>
      </div>
    </section>
  );
}
