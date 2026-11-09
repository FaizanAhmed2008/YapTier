import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { describeAttribution, humanizeIconName, pluralize } from '../lib/format';
import {
  defaultIconSource,
  getIconSource,
  iconSources,
} from '../lib/providers';
import type { IconSourceId } from '../lib/providers';
import type { IconSummary } from '../lib/providers/types';
import { useIconSearch } from '../hooks/useIconSearch';
import { CloseGlyph, ImageGlyph, SearchGlyph, SparklesGlyph } from './Glyphs';
import { Toast } from './Toast';

const SUGGESTED_TERMS = ['cat', 'pizza', 'rocket', 'star', 'heart', 'coffee'];

interface IconCategory {
  label: string;
  query: string;
  sourceId: IconSourceId;
}

const ICON_CATEGORIES: readonly IconCategory[] = [
  { label: 'Animals', query: 'cat', sourceId: 'colorful' },
  { label: 'Food', query: 'pizza', sourceId: 'colorful' },
  { label: 'Gaming', query: 'game', sourceId: 'colorful' },
  { label: 'Sports', query: 'soccer', sourceId: 'colorful' },
  { label: 'Tech', query: 'laptop', sourceId: 'colorful' },
  { label: 'Brands', query: 'brand', sourceId: 'iconify' },
  { label: 'Characters', query: 'superhero', sourceId: 'colorful' },
  { label: 'Music', query: 'music', sourceId: 'colorful' },
];

interface FindIconsDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (icon: IconSummary) => void;
}

function attributionTitle(icon: IconSummary): string {
  return describeAttribution({
    providerId: icon.providerId,
    providerLabel: icon.providerLabel,
    collectionPrefix: icon.prefix,
    collectionName: icon.collectionName,
    author: icon.author,
    authorUrl: icon.authorUrl,
    license: icon.license,
  });
}

function IconResultArt({ icon }: { icon: IconSummary }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [icon.previewUrl]);

  return (
    <span className="icon-result-art">
      {icon.previewUrl && !failed ? (
        <img
          src={icon.previewUrl}
          alt=""
          loading="lazy"
          width="34"
          height="34"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="tile-fallback">
          <ImageGlyph />
        </span>
      )}
    </span>
  );
}

export function FindIconsDialog({ open, onClose, onSelect }: FindIconsDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const titleId = useId();
  const searchId = useId();
  const [query, setQuery] = useState('');
  const [sourceId, setSourceId] = useState<IconSourceId>(defaultIconSource.id);
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);
  const toastIdRef = useRef(0);
  const hideToast = useCallback(() => setToast(null), []);
  const source = getIconSource(sourceId);
  const { status, icons, total, error, isDebouncing, retry } = useIconSearch(
    query,
    source.provider,
  );

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const isWorking = status === 'loading' || (hasQuery && isDebouncing);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open) {
      if (!dialog.open) {
        dialog.showModal();
      }
      const focusTimer = window.setTimeout(() => searchInputRef.current?.focus(), 0);
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
      setQuery('');
      setSourceId(defaultIconSource.id);
      setToast(null);
    }
  }, [open]);

  const handleSelect = (icon: IconSummary) => {
    onSelect(icon);
    setQuery('');
    toastIdRef.current += 1;
    setToast({ id: toastIdRef.current, message: 'Icon added to collection' });
    searchInputRef.current?.focus();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) {
      onClose();
    }
  };

  const statusMessage = isWorking
    ? 'Searching icons.'
    : status === 'success'
      ? `${pluralize(icons.length, 'icon')} found.`
      : status === 'error'
        ? (error ?? 'Icon search failed.')
        : '';

  return (
    <dialog
      ref={dialogRef}
      className="finder-dialog"
      aria-labelledby={titleId}
      onClick={handleBackdropClick}
    >
      <div className="finder-panel">
        <header className="finder-header">
          <div className="finder-heading">
            <span className="finder-badge" aria-hidden="true">
              <SparklesGlyph />
            </span>
            <div>
              <p className="eyebrow">Open icons</p>
              <h2 id={titleId}>Find Icons</h2>
              <p className="finder-subtitle">
                Search open icon collections and add one to your board.
              </p>
            </div>
          </div>
          <button type="button" className="icon-button finder-close" onClick={onClose} aria-label="Close Find Icons">
            <CloseGlyph />
          </button>
        </header>

        <div className="finder-search">
          <label className="visually-hidden" htmlFor={searchId}>
            Search icons
          </label>
          <div className={`search-field${isWorking ? ' is-working' : ''}`}>
            <SearchGlyph className="search-icon" />
            <input
              ref={searchInputRef}
              id={searchId}
              className="search-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search icons — try “rocket”, “cat”, or “coffee”"
              autoComplete="off"
              spellCheck={false}
            />
            {isWorking && <span className="search-spinner" aria-hidden="true" />}
          </div>
          <div className="finder-filters">
            <div className="filter-row" role="group" aria-label="Icon source">
              <span className="filter-label">Source</span>
              {iconSources.map((iconSource) => (
                <button
                  key={iconSource.id}
                  type="button"
                  className="filter-chip"
                  title={iconSource.description}
                  aria-pressed={iconSource.id === sourceId}
                  onClick={() => setSourceId(iconSource.id)}
                >
                  {iconSource.label}
                </button>
              ))}
            </div>
            <div className="filter-row" role="group" aria-label="Icon categories">
              <span className="filter-label">Browse</span>
              {ICON_CATEGORIES.map((category) => (
                <button
                  key={category.label}
                  type="button"
                  className="filter-chip"
                  aria-pressed={
                    category.sourceId === sourceId && category.query === trimmedQuery
                  }
                  onClick={() => {
                    setSourceId(category.sourceId);
                    setQuery(category.query);
                  }}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
          <p className="visually-hidden" role="status" aria-live="polite">
            {statusMessage}
          </p>
        </div>

        <div className="finder-results" aria-busy={isWorking}>
          {!hasQuery ? (
            <div className="finder-state finder-intro">
              <span className="finder-state-icon" aria-hidden="true">
                <SearchGlyph />
              </span>
              <h3>What are you looking for?</h3>
              <p>
                Search {source.description} by keyword, or browse a category. Each result shows its
                collection and license before you add it.
              </p>
              <div className="suggestion-row">
                {SUGGESTED_TERMS.map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="chip-button"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : isWorking ? (
            <div className="skeleton-grid" aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <span className="skeleton-card" key={index} />
              ))}
            </div>
          ) : status === 'error' ? (
            <div className="finder-state finder-error" role="alert">
              <span className="finder-state-icon" aria-hidden="true">
                <CloseGlyph />
              </span>
              <h3>Icon search hit a snag</h3>
              <p>{error}</p>
              <button type="button" className="button button-secondary" onClick={retry}>
                Try again
              </button>
            </div>
          ) : status === 'success' && icons.length === 0 ? (
            <div className="finder-state">
              <span className="finder-state-icon" aria-hidden="true">
                <SearchGlyph />
              </span>
              <h3>No icons found for “{trimmedQuery}”</h3>
              <p>Try a broader keyword, a different spelling, or one of these ideas.</p>
              <div className="suggestion-row">
                {SUGGESTED_TERMS.slice(0, 4).map((term) => (
                  <button
                    key={term}
                    type="button"
                    className="chip-button"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div className="finder-results-head">
                <p>
                  {total > icons.length
                    ? `Showing ${icons.length} of ${total} matches`
                    : `${pluralize(total, 'icon')} found`}
                </p>
              </div>
              <ul className="icon-grid" aria-label="Icon search results">
                {icons.map((icon) => (
                  <li key={icon.id} className="icon-result-item">
                    <button
                      type="button"
                      className="icon-result"
                      onClick={() => handleSelect(icon)}
                      aria-label={`Add ${icon.fullName} icon from ${icon.collectionName} to your collection`}
                    >
                      <IconResultArt icon={icon} />
                      <span className="icon-result-name">{humanizeIconName(icon.name)}</span>
                      <span className="icon-result-collection">{icon.collectionName}</span>
                    </button>
                    <div className="icon-result-footer">
                      <span title={attributionTitle(icon)}>
                        {icon.license?.title ?? 'Collection license'}
                      </span>
                      {icon.license?.url && (
                        <a
                          href={icon.license.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`License details for ${icon.collectionName}`}
                        >
                          License
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <footer className="finder-footer">
          <span>
            Icons come from OpenMoji, Microsoft Fluent Emoji, and other collections through{' '}
            <a href="https://iconify.design" target="_blank" rel="noreferrer">
              Iconify
            </a>
            . Check each collection’s license before publishing.
          </span>
          <span>Press Esc to close</span>
        </footer>
      </div>

      <Toast
        key={toast?.id ?? 0}
        message={toast?.message ?? null}
        onDismiss={hideToast}
      />
    </dialog>
  );
}
