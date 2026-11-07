import { AppHeader } from './components/AppHeader';
import { ImageCollection } from './components/ImageCollection';
import { Workspace } from './components/Workspace';
import { useImageCollection } from './hooks/useImageCollection';

export default function App() {
  const { images, addFiles, addIcon, removeImage } = useImageCollection();

  return (
    <div className="app-shell">
      <div className="app-glow" aria-hidden="true" />
      <AppHeader />
      <main className="app-main">
        <Workspace imageCount={images.length} />
        <ImageCollection
          images={images}
          onAddFiles={addFiles}
          onAddIcon={addIcon}
          onRemoveImage={removeImage}
        />
      </main>
      <footer className="app-footer">
        <span>YapTier · Rank everything. Yap about anything.</span>
        <span>Local-only editor · No account, no database</span>
      </footer>
    </div>
  );
}
