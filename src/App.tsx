import { useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import type { TierId } from './lib/board';
import { AddTextDialog } from './components/AddTextDialog';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { AppFooter } from './components/AppFooter';
import { AppHeader } from './components/AppHeader';
import { ConfirmDialog } from './components/ConfirmDialog';
import { FindIconsDialog } from './components/FindIconsDialog';
import { HowToUseDialog } from './components/HowToUseDialog';
import { RedoGlyph, UndoGlyph } from './components/Glyphs';
import { TierConfigDialog } from './components/TierConfigDialog';
import { TierEditor } from './components/TierEditor';
import { Toast } from './components/Toast';
import { UploadNotice } from './components/UploadNotice';
import { useTierEditor } from './hooks/useTierEditor';
import {
  copyPngToClipboard,
  exportBoardToPngBlob,
  downloadPngFile,
  sharePng,
} from './lib/export/png';
import { exportBoardToJson, downloadJsonFile, importBoardFromJson } from './lib/export/json';
import { FILE_INPUT_ACCEPT } from './lib/images';
import type { UploadRejection } from './types';

export default function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const [rejections, setRejections] = useState<UploadRejection[]>([]);
  const [isFinderOpen, setIsFinderOpen] = useState(false);
  const [isTextDialogOpen, setIsTextDialogOpen] = useState(false);
  const [isHowToOpen, setIsHowToOpen] = useState(false);
  const [configTier, setConfigTier] = useState<TierId | null>(null);
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    danger?: boolean;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const {
    board,
    tierConfigs,
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
    updateTier,
    resetBoardAction,
    loadBoard,
    loadSavedSession,
    saveCurrentBoard,
  } = useTierEditor();

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      setRejections(addFiles(files));
    }
    event.target.value = '';
  };

  const handleJsonImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      setToast('Please choose a .json file.');
      return;
    }

    try {
      const text = await file.text();
      const { board: imported, createdObjectUrls } = importBoardFromJson(text);
      loadBoard(imported, createdObjectUrls);
      setToast('Tier list imported.');
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Failed to import tier list.');
    }
  };

  const filenameFor = (title: string): string => {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'yaptier-board'
    );
  };

  const handleSave = async () => {
    const ok = await saveCurrentBoard();
    setToast(
      ok
        ? 'Saved to your browser.'
        : 'Could not save. Storage may be full or unavailable.',
    );
  };

  const handleLoadSaved = async () => {
    const ok = await loadSavedSession();
    setToast(ok ? 'Previous session restored.' : 'No saved session found.');
  };

  const handleSharePng = async () => {
    try {
      const blob = await exportBoardToPngBlob(board);

      if (await sharePng(blob, board.title ?? 'YapTier List')) {
        setToast('Shared via device share menu.');
        return;
      }

      if (await copyPngToClipboard(blob)) {
        setToast('PNG copied to clipboard.');
        return;
      }

      downloadPngFile(blob, `${filenameFor(board.title ?? 'yaptier-board')}.png`);
      setToast('PNG downloaded.');
    } catch {
      setToast('Sharing failed.');
    }
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

  const handleExportJson = async () => {
    try {
      const json = await exportBoardToJson(board);
      downloadJsonFile(json, `${filenameFor(board.title ?? 'yaptier-board')}.json`);
      setToast('Tier list exported.');
    } catch {
      setToast('Export failed.');
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

      <AppHeader
        onUpload={() => fileInputRef.current?.click()}
        onAddText={() => setIsTextDialogOpen(true)}
        onFindIcons={() => setIsFinderOpen(true)}
      />

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
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleLoadSaved}
            >
              Load Saved
            </button>
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

          <div className="toolbar-group">
            <button
              type="button"
              className="button button-secondary"
              onClick={handleSharePng}
            >
              Share PNG
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleExportPng}
            >
              Export PNG
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={handleExportJson}
            >
              Export JSON
            </button>
            <label className="button button-secondary" style={{ display: 'flex', alignItems: 'center' }}>
              Import JSON
              <input
                ref={jsonInputRef}
                className="visually-hidden"
                type="file"
                accept=".json"
                aria-label="Import tier list JSON"
                onChange={handleJsonImport}
                tabIndex={-1}
              />
            </label>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => setIsHowToOpen(true)}
            >
              How to Use
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
          onConfigure={(tier) => setConfigTier(tier)}
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

      <HowToUseDialog
        open={isHowToOpen}
        onClose={() => setIsHowToOpen(false)}
      />

      {configTier && (
        <TierConfigDialog
          open
          tier={configTier}
          config={tierConfigs[configTier]}
          onSave={(updates) => {
            updateTier(configTier, updates);
            setConfigTier(null);
          }}
          onClose={() => setConfigTier(null)}
        />
      )}

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
