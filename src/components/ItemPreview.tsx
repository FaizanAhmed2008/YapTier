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
    const text = image.text ?? image.name;
    const length = text.length;
    const lengthClass =
      length <= 5
        ? 'tile-text-short'
        : length <= 13
          ? 'tile-text-medium'
          : length <= 28
            ? 'tile-text-long'
            : 'tile-text-xlong';

    return <span className={`tile-text ${lengthClass}`}>{text}</span>;
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
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
