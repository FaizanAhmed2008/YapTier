import { useEffect, useState } from 'react';
import type { CollectionImage } from '../types';
import { ImageGlyph } from './Glyphs';

interface ItemPreviewProps {
  image: CollectionImage;
}

export function ItemPreview({ image }: ItemPreviewProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [image.src]);

  if (image.source === 'text') {
    return <span className="tile-text">{image.text ?? image.name}</span>;
  }

  if (failed || !image.src) {
    return (
      <span className="tile-fallback">
        <ImageGlyph />
      </span>
    );
  }

  return (
    <img
      src={image.src}
      alt=""
      loading="lazy"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
