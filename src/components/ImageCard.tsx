import { useState } from 'react';
import { describeAttribution } from '../lib/format';
import type { CollectionImage } from '../types';
import { ImageGlyph, TrashGlyph } from './Glyphs';

interface ImageCardProps {
  image: CollectionImage;
  onRemove: (id: string) => void;
}

export function ImageCard({ image, onRemove }: ImageCardProps) {
  const [previewFailed, setPreviewFailed] = useState(false);
  const attribution = image.icon?.attribution;
  const licenseUrl = attribution?.license?.url ?? attribution?.authorUrl;

  return (
    <li className="image-card">
      <div className="image-card-preview">
        {previewFailed ? (
          <span className="image-fallback">
            <ImageGlyph />
            <span>Preview unavailable</span>
          </span>
        ) : (
          <img
            src={image.src}
            alt={image.name}
            loading="lazy"
            draggable={false}
            onError={() => setPreviewFailed(true)}
          />
        )}
        <span className={`source-badge source-${image.source}`}>
          {image.source === 'icon' ? 'Icon' : 'Upload'}
        </span>
        <button
          type="button"
          className="icon-button remove-button"
          onClick={() => onRemove(image.id)}
          aria-label={`Remove ${image.name}`}
          title={`Remove ${image.name}`}
        >
          <TrashGlyph />
        </button>
      </div>

      <div className="image-card-meta">
        <span className="image-card-name" title={image.name}>
          {image.name}
        </span>
        {attribution ? (
          licenseUrl ? (
            <a
              className="license-link"
              href={licenseUrl}
              target="_blank"
              rel="noreferrer"
              title={describeAttribution(attribution)}
            >
              {attribution.license?.title ?? attribution.collectionName}
            </a>
          ) : (
            <span className="meta-hint" title={describeAttribution(attribution)}>
              {attribution.license?.title ?? attribution.collectionName}
            </span>
          )
        ) : (
          <span className="meta-hint" title="This preview exists only in this browser tab">
            Local preview
          </span>
        )}
      </div>
    </li>
  );
}
