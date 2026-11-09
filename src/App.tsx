import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AddTextDialog } from './components/AddTextDialog';
import { AppHeader } from './components/AppHeader';
import { FindIconsDialog } from './components/FindIconsDialog';
import { TierEditor } from './components/TierEditor';
import { UploadNotice } from './components/UploadNotice';
import { useTierEditor } from './hooks/useTierEditor';
import { FILE_INPUT_ACCEPT } from './lib/images';
import type { UploadRejection } from './types';

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rejections, setRejections] = useState<UploadRejection[]>([]);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const {
    board,
    addFiles,
    addIcon,
    addText,
    moveItem,
    returnToCollection,
    removeImage,
  } = useTierEditor();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      setRejections(addFiles(files));
    }
    event.target.value = '';
  };

  return (
    <div className="app">
      <AppHeader
        onUpload={() => fileInputRef.current?.click()}
        onAddText={() => setIsTextDialogOpen(true)}
        onFindIcons={() => setIsFinderOpen(true)}
      />

      <main className="app-main">
        <UploadNotice rejections={rejections} onDismiss={() => setRejections([])} />
        <TierEditor
          board={board}
          onMove={moveItem}
          onRemove={removeImage}
          onReturn={returnToCollection}
        />
      </main>

      <input
        ref={fileInputRef}
        className="visually-hidden"
        type="file"
        accept={FILE_INPUT_ACCEPT}
        aria-label="Upload images"
        multiple
        onChange={handleFileChange}
        tabIndex={-1}
      />

      <AddTextDialog
        open={isTextDialogOpen}
        onClose={() => setIsTextDialogOpen(false)}
        onAdd={addText}
      />

      <FindIconsDialog
        open={isFinderOpen}
        onClose={() => setIsFinderOpen(false)}
        onSelect={addIcon}
      />
    </div>
  );
}
