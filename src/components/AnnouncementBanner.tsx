import { useState } from 'react';
import { CloseGlyph } from './Glyphs';

const STORAGE_KEY = 'yaptier_announcement_dismissed';

export function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  if (dismissed) {
    return null;
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Storage unavailable — dismiss for this session only
    }
    setDismissed(true);
  };

  return (
    <div className="announcement-banner" role="status">
      <p className="announcement-text">
        YapTier is completely open-source and ad-free! Enjoy creating tier lists freely. Anyone can
        contribute and help improve the project.
      </p>
      <button
        type="button"
        className="icon-button announcement-close"
        onClick={handleDismiss}
        aria-label="Dismiss announcement"
      >
        <CloseGlyph />
      </button>
    </div>
  );
}
