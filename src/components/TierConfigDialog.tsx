import { useEffect, useId, useRef, useState } from 'react';
import type { FormEvent, MouseEvent } from 'react';
import { CloseGlyph } from './Glyphs';

const PRESET_COLORS = ['#ff7f7f', '#ffbf7f', '#ffdf7f', '#bfff7f', '#7fbfff'];
const MAX_LABEL_LENGTH = 20;

interface TierConfigDialogProps {
  open: boolean;
  tier: string;
  config: { label: string; color: string };
  onSave: (updates: { label: string; color: string }) => void;
  onClose: () => void;
}

export function TierConfigDialog({
  open,
  tier,
  config,
  onSave,
  onClose,
}: TierConfigDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const labelInputId = useId();
  const colorInputId = useId();

  const [label, setLabel] = useState(config.label);
  const [color, setColor] = useState(config.color);

  useEffect(() => {
    if (open) {
      setLabel(config.label);
      setColor(config.color);
    }
  }, [open, config.label, config.color]);

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

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave({ label: label.trim() || tier, color });
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="tier-config-dialog"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <form className="tier-config-panel" onSubmit={handleSubmit}>
        <header className="tier-config-header">
          <h2 id={titleId}>Customize Tier {tier}</h2>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close tier config"
          >
            <CloseGlyph />
          </button>
        </header>

        <div className="tier-config-body">
          <label className="tier-config-field" htmlFor={labelInputId}>
            Label
            <input
              id={labelInputId}
              className="tier-config-input"
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              maxLength={MAX_LABEL_LENGTH}
              placeholder={tier}
              autoComplete="off"
            />
          </label>

          <div className="tier-config-field">
            <label htmlFor={colorInputId}>Color</label>
            <div className="tier-config-color-row">
              <input
                id={colorInputId}
                className="tier-config-color-input"
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
              />
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`tier-config-preset${preset === color ? ' active' : ''}`}
                  style={{ background: preset }}
                  onClick={() => setColor(preset)}
                  aria-label={`Preset color ${preset}`}
                />
              ))}
            </div>
          </div>

          <div
            className="tier-config-preview"
            style={{ background: color }}
            aria-hidden="true"
          >
            {label || tier}
          </div>
        </div>

        <div className="tier-config-actions">
          <button type="button" className="button button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="button button-primary">
            Save
          </button>
        </div>
      </form>
    </dialog>
  );
}
