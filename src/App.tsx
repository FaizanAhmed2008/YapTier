import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { AddTextDialog } from './components/AddTextDialog';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { ConfirmDialog } from './components/ConfirmDialog';
import { FindIconsDialog } from './components/FindIconsDialog';
import { RedoGlyph, UndoGlyph } from './components/Glyphs';
import { TierEditor } from './components/TierEditor';
import { Toast } from './components/Toast';
import { UploadNotice } from './components/UploadNotice';
import { useTierEditor } from './hooks/useTierEditor';
import { exportBoardToPngBlob, downloadPngFile } from './lib/export/png';
import { FILE_INPUT_ACCEPT } from './lib/images';
import type { UploadRejection } from './types';

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rejections, setRejections] = useState<UploadRejection[]>([]);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const {
    board,
    totalCount,
    canUndo,
    canRedo,
    undo,
    redo,
    addFiles,
    addIcon,
    addText,
    moveItem,
    returnToCollection,
    removeImage,
    resetBoardAction,
  } = useTierEditor();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      setRejections(addFiles(files));
    }
    event.target.value = '';
  };

  const filenameFor = (title: string): string => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'yaptier-board'
    );
  };

  const handleExportPng = async () => {
    try {
      const blob = await exportBoardToPngBlob(board);
      downloadPngFile(blob, `${filenameFor(board.title ?? 'yaptier-board')}.png`);
      setToast('PNG exported.');
    } catch {
      setToast(
        'PNG export failed. Make sure all images have loaded, then try again.',
      );
    }
  };

  const handleConfirm = () => {
    if (confirm) {
      confirm.onConfirm();
    }
    setConfirm(null);
  };

  const handleCancel = () => {
    setConfirm(null);
  };

  return (
    <div className="app">
      <AnnouncementBanner />

      <AppHeader />

      <main className="app-main">
        <UploadNotice rejections={rejections} onDismiss={() => setRejections([])} />

        <section className="board-toolbar">
          <div className="toolbar-group">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setConfirm({
                  title: 'Start a new list?',
                  message:
                    'This clears your board and removes the saved session. It cannot be undone.',
                  onConfirm: resetBoardAction,
                  danger: true,
                });
              }}
            >
              New List
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleExportPng}
            >
              Export PNG
            </button>
          </div>

          <div className="toolbar-spacer" />

          <div className="toolbar-group toolbar-count">
            {totalCount} item{totalCount !== 1 ? 's' : ''}
          </div>
        </section>

        <TierEditor
          board={board}
          onMove={moveItem}
          onRemove={removeImage}
          onReturn={returnToCollection}
        >
          <section className="unranked-controls">
            <div className="controls-left">
              <button
                type="button"
                className="button button-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Upload
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setIsTextDialogOpen(true)}
              >
                Add Text
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setIsFinderOpen(true)}
              >
                Find Icons
              </button>
            </div>

            <div className="controls-right">
              <button
                type="button"
                className="icon-button"
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
                disabled={!canUndo}
                onClick={undo}
              >
                <UndoGlyph />
              </button>
              <button
                type="button"
                className="icon-button"
                aria-label="Redo"
                title="Redo (Ctrl+Shift+Z)"
                disabled={!canRedo}
                onClick={redo}
              >
                <RedoGlyph />
              </button>
            </div>
          </section>
        </TierEditor>
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

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ''}
        message={confirm?.message ?? ''}
        confirmLabel={confirm?.danger ? 'Delete everything' : 'Confirm'}
        cancelLabel="Cancel"
        danger={confirm?.danger ?? false}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />

      <Toast message={toast} onDismiss={() => setToast(null)} />

      <AppFooter />
    </div>
  );
}
