import { SearchGlyph, TextGlyph, UploadGlyph } from './Glyphs';

interface AppHeaderProps {
  onUpload: () => void;
  onAddText: () => void;
  onFindIcons: () => void;
}

export function AppHeader({ onUpload, onAddText, onFindIcons }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="brand">
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <p className="brand-name">
          Yap<span>Tier</span>
        </p>
      </div>
      <div className="header-actions">
        <button type="button" className="button button-secondary" onClick={onUpload}>
          <UploadGlyph />
          Upload
        </button>
        <button type="button" className="button button-secondary" onClick={onAddText}>
          <TextGlyph />
          Add Text
        </button>
        <button type="button" className="button button-primary" onClick={onFindIcons}>
          <SearchGlyph />
          Find Icons
        </button>
      </div>
    </header>
  );
}
