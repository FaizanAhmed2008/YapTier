import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { CloseGlyph } from './Glyphs';

interface AddTextDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
}

export function AddTextDialog({ open, onClose, onAdd }: AddTextDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const inputId = useId();
  const [text, setText] = useState('');

  const trimmedText = text.trim();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 0);
      return () => window.clearTimeout(focusTimer);
    }

    if (dialog.open) {
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

  useEffect(() => {
    if (!open) {
      setText('');
    }
  }, [open]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedText) {
      return;
    }

    onAdd(trimmedText);
    onClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="text-dialog"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <form className="text-panel" onSubmit={handleSubmit}>
        <header className="text-header">
          <h2 id={titleId}>Add Text</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close Add Text"
          >
            <CloseGlyph />
          </button>
        </header>

        <label className="text-field" htmlFor={inputId}>
          Text
          <input
            ref={inputRef}
            id={inputId}
            className="text-input"
            type="text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Type something to rank"
            autoComplete="off"
          />
        </label>

        <div className="text-actions">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={!trimmedText}>
            Add
          </button>
        </div>
      </form>
    </dialog>
  );
}
