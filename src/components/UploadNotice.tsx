import { AlertGlyph, CloseGlyph } from './Glyphs';
import type { UploadRejection } from '../types';

interface UploadNoticeProps {
  rejections: UploadRejection[];
  onDismiss: () => void;
}

export function UploadNotice({ rejections, onDismiss }: UploadNoticeProps) {
  if (rejections.length === 0) {
    return null;
  }

  return (
    <section className="upload-notice" role="alert">
      <AlertGlyph className="upload-notice-icon" />
      <div className="upload-notice-copy">
        <strong>
          {rejections.length === 1
            ? '1 file could not be added.'
            : `${rejections.length} files could not be added.`}
        </strong>
        <ul>
          {rejections.map((rejection, index) => (
            <li key={`${rejection.fileName}-${index}`}>
              <span>{rejection.fileName}</span>: {rejection.reason}
            </li>
          ))}
        </ul>
      </div>
      <button
        type="button"
        className="icon-button upload-notice-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss upload warning"
      >
        <CloseGlyph />
      </button>
    </section>
  );
}
