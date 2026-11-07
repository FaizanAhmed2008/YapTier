import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { formatBytes } from '../lib/format';
import { FILE_INPUT_ACCEPT, MAX_IMAGE_SIZE_BYTES } from '../lib/images';
import type { IconSummary } from '../lib/providers/types';
import type { CollectionImage, UploadRejection } from '../types';
import { FindIconsDialog } from './FindIconsDialog';
import { AlertGlyph, CheckGlyph, CloseGlyph, ImageGlyph, SparklesGlyph, UploadGlyph } from './Glyphs';
import { ImageCard } from './ImageCard';

interface ImageCollectionProps {
  images: CollectionImage[];
  onAddFiles: (files: readonly File[]) => UploadRejection[];
  onAddIcon: (icon: IconSummary) => CollectionImage;
  onRemoveImage: (id: string) => void;
}

interface AddedFeedback {
  id: string;
  message: string;
}

export function ImageCollection({
  images,
  onAddFiles,
  onAddIcon,
  onRemoveImage,
}: ImageCollectionProps) {
  const [rejections, setRejections] = useState<UploadRejection[]>([]);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<AddedFeedback | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!addedFeedback) {
      return;
    }

    const timeoutId = window.setTimeout(() => setAddedFeedback(null), 3200);
    return () => window.clearTimeout(timeoutId);
  }, [addedFeedback]);

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.currentTarget.files;
    if (!selectedFiles || selectedFiles.length === 0) {
      return;
    }

    setRejections(onAddFiles(Array.from(selectedFiles)));
    event.currentTarget.value = '';
  };

  const handleIconSelect = (icon: IconSummary) => {
    const addedImage = onAddIcon(icon);
    setAddedFeedback({
      id: addedImage.id,
      message: `Added “${addedImage.name}” to your collection.`,
    });
  };

  return (
    <section className="panel collection-panel" aria-labelledby="collection-title">
      <div className="panel-heading collection-heading">
        <div>
          <p className="eyebrow">Your stock</p>
          <div className="collection-title-row">
            <h2 id="collection-title">Image collection</h2>
            <span className="count-badge">{images.length}</span>
          </div>
        </div>

        <div className="collection-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={() => setIsFinderOpen(true)}
          >
            <SparklesGlyph />
            Find Icons
          </button>
          <button
            type="button"
            className="button button-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadGlyph />
            Upload
          </button>
          <input
            ref={fileInputRef}
            className="visually-hidden"
            type="file"
            accept={FILE_INPUT_ACCEPT}
            multiple
            tabIndex={-1}
            aria-label="Upload images"
            onChange={handleFileSelection}
          />
        </div>
      </div>

      <div className="collection-body">
        {rejections.length > 0 && (
          <div className="notice notice-error" role="alert">
            <AlertGlyph className="notice-icon" />
            <div className="notice-copy">
              <p>
                {rejections.length === 1
                  ? '1 file was skipped.'
                  : `${rejections.length} files were skipped.`}
              </p>
              <ul>
                {rejections.map((rejection, index) => (
                  <li key={`${rejection.fileName}-${index}`}>
                    <strong>{rejection.fileName}</strong> — {rejection.reason}
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="icon-button notice-dismiss"
              onClick={() => setRejections([])}
              aria-label="Dismiss upload errors"
            >
              <CloseGlyph />
            </button>
          </div>
        )}

        {addedFeedback && (
          <p className="notice notice-success" role="status" key={addedFeedback.id}>
            <CheckGlyph className="notice-icon" />
            {addedFeedback.message}
          </p>
        )}

        {images.length === 0 ? (
          <div className="collection-empty">
            <span className="collection-empty-icon" aria-hidden="true">
              <ImageGlyph />
            </span>
            <div>
              <h3>No images yet</h3>
              <p>
                Upload PNG, JPG, JPEG, or WebP files up to {formatBytes(MAX_IMAGE_SIZE_BYTES)} each,
                or pull icons from Iconify.
              </p>
            </div>
          </div>
        ) : (
          <ul className="image-grid" aria-label="Image collection">
            {images.map((image) => (
              <ImageCard key={image.id} image={image} onRemove={onRemoveImage} />
            ))}
          </ul>
        )}

        <div className="collection-footer">
          <span>Previews use browser object URLs. Nothing is stored or uploaded to a server.</span>
          <span>
            Icons via{' '}
            <a href="https://iconify.design" target="_blank" rel="noreferrer">
              Iconify
            </a>{' '}
            · Each collection keeps its own license.
          </span>
        </div>
      </div>

      <FindIconsDialog
        open={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        onSelect={handleIconSelect}
      />
    </section>
  );
}
