import { useEffect, useId, useRef } from 'react';
import type { MouseEvent } from 'react';
import { CloseGlyph } from './Glyphs';

interface HowToUseDialogProps {
  open: boolean;
  onClose: () => void;
}

const steps = [
  'Upload images from your device',
  'Search and add icons from thousands of icon sets',
  'Create custom text items',
  'Drag items into different tiers',
  'Reorder items as needed',
  'Undo or redo changes (Ctrl+Z / Ctrl+Shift+Z)',
  'Save and export your tier list',
];

export function HowToUseDialog({ open, onClose }: HowToUseDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="howto-dialog"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <div className="howto-panel">
        <header className="howto-header">
          <h2 id={titleId}>How to Use</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close How to Use"
          >
            <CloseGlyph />
          </button>
        </header>

        <ol className="howto-steps">
          {steps.map((step, index) => (
            <li key={index} className="howto-step">
              <span className="howto-step-number">{index + 1}</span>
              <span className="howto-step-text">{step}</span>
            </li>
          ))}
        </ol>

        <div className="howto-actions">
          <button type="button" className="button button-primary" onClick={onClose}>
            Got it
          </button>
        </div>
      </div>
    </dialog>
  );
}
