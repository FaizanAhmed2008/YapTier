import type { TierBoardState, TierId } from '../board';
import { getTierConfig, TIER_IDS } from '../board';
import type { CollectionImage } from '../../types';

export interface PngExportOptions {
  scale?: number;
  watermark?: boolean;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If CORS failed on external url, try fetching as blob/dataURL
      if (src.startsWith('http://') || src.startsWith('https://')) {
        fetch(src, { mode: 'cors' })
          .then((res) => res.blob())
          .then((blob) => {
            const objectUrl = URL.createObjectURL(blob);
            const retryImg = new Image();
            retryImg.onload = () => {
              URL.revokeObjectURL(objectUrl);
              resolve(retryImg);
            };
            retryImg.onerror = () => reject(new Error(`Failed to load image: ${src}`));
            retryImg.src = objectUrl;
          })
          .catch(() => reject(new Error(`Failed to load image: ${src}`)));
      } else {
        reject(new Error(`Failed to load image: ${src}`));
      }
    };
    img.src = src;
  });
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  // If a single word is wider than maxWidth, break character by character
  if (lines.length === 1 && ctx.measureText(lines[0]).width > maxWidth) {
    const chars = lines[0].split('');
    lines.length = 0;
    let charLine = '';
    for (const char of chars) {
      if (ctx.measureText(charLine + char).width > maxWidth && charLine) {
        lines.push(charLine);
        charLine = char;
      } else {
        charLine += char;
      }
    }
    if (charLine) lines.push(charLine);
  }

  return lines;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export async function exportBoardToCanvas(
  board: TierBoardState,
  options: PngExportOptions = {},
): Promise<HTMLCanvasElement> {
  const scale = options.scale ?? 2; // Default 2x for sharp retina rendering
  const watermark = options.watermark ?? true;

  const ROW_HEIGHT = 96;
  const LABEL_WIDTH = 76;
  const GAP = 8;
  const INNER_PADDING_Y = 6;
  const INNER_PADDING_X = 10;
  const AVAILABLE_HEIGHT = ROW_HEIGHT - INNER_PADDING_Y * 2;
  const SEPARATOR_HEIGHT = 1;
  const BORDER_RADIUS = 6;

  // 1. Preload all placed images and measure widths
  interface MeasuredItem {
    item: CollectionImage;
    width: number;
    imgElement?: HTMLImageElement;
  }

  const measuredTiers: Record<TierId, MeasuredItem[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
    D: [],
  };

  // Temp canvas for font measurement
  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d')!;

  for (const tier of TIER_IDS) {
    const items = board.tiers[tier] || [];
    for (const item of items) {
      if (item.source === 'text') {
        const text = item.text ?? item.name;
        const len = text.length;
        let fontSize = 16;
        if (len <= 5) fontSize = 26;
        else if (len <= 13) fontSize = 20;
        else if (len <= 28) fontSize = 15;
        else fontSize = 13.5;

        measureCtx.font = `800 ${fontSize}px Inter, Segoe UI, system-ui, sans-serif`;
        const textWidth = measureCtx.measureText(text).width;
        // Text item width with padding and min/max clamps
        const width = Math.min(240, Math.max(76, Math.round(textWidth + 24)));
        measuredTiers[tier].push({ item, width });
      } else {
        // Source is upload or icon
        let imgElement: HTMLImageElement | undefined;
        let width = AVAILABLE_HEIGHT; // Default square

        if (item.src) {
          try {
            imgElement = await loadImage(item.src);
            const naturalW = imgElement.naturalWidth || AVAILABLE_HEIGHT;
            const naturalH = imgElement.naturalHeight || AVAILABLE_HEIGHT;
            const aspectRatio = naturalW / naturalH;
            width = Math.round(AVAILABLE_HEIGHT * aspectRatio);
          } catch {
            // Keep default square fallback
          }
        }
        measuredTiers[tier].push({ item, width, imgElement });
      }
    }
  }

  // 2. Calculate required width so no row clips
  let maxContentWidth = 800; // Minimum default board content width
  for (const tier of TIER_IDS) {
    const rowItems = measuredTiers[tier];
    if (rowItems.length > 0) {
      const totalItemsWidth = rowItems.reduce((acc, cur) => acc + cur.width, 0);
      const totalGaps = (rowItems.length - 1) * GAP;
      const rowWidth = totalItemsWidth + totalGaps + INNER_PADDING_X * 2;
      if (rowWidth > maxContentWidth) {
        maxContentWidth = rowWidth;
      }
    }
  }

  const BASE_WIDTH = LABEL_WIDTH + maxContentWidth;
  const TITLE_HEIGHT = board.title ? 48 : 0;
  const WATERMARK_HEIGHT = watermark ? 32 : 0;
  const BOARD_HEIGHT = ROW_HEIGHT * TIER_IDS.length + SEPARATOR_HEIGHT * (TIER_IDS.length - 1);
  const TOTAL_HEIGHT = TITLE_HEIGHT + BOARD_HEIGHT + WATERMARK_HEIGHT + 24; // 24px outer margins

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(BASE_WIDTH * scale);
  canvas.height = Math.round(TOTAL_HEIGHT * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#161616';
  ctx.fillRect(0, 0, BASE_WIDTH, TOTAL_HEIGHT);

  let currentY = 12;

  // Title if present
  if (board.title) {
    ctx.fillStyle = '#f1f1f1';
    ctx.font = '900 24px Inter, Segoe UI, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(board.title, 12, currentY + 18);
    currentY += TITLE_HEIGHT;
  }

  // Outer board container
  const boardX = 12;
  const boardWidth = BASE_WIDTH - 24;
  const boardY = currentY;

  // Clip board to rounded rectangle
  ctx.save();
  drawRoundedRect(ctx, boardX, boardY, boardWidth, BOARD_HEIGHT, BORDER_RADIUS);
  ctx.clip();

  // Draw separator background
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(boardX, boardY, boardWidth, BOARD_HEIGHT);

  let rowY = boardY;

  // Draw each tier row
  for (let i = 0; i < TIER_IDS.length; i++) {
    const tier = TIER_IDS[i];
    const config = getTierConfig(board, tier);
    const rowItems = measuredTiers[tier];

    // Label cell
    ctx.fillStyle = config.color;
    ctx.fillRect(boardX, rowY, LABEL_WIDTH, ROW_HEIGHT);

    // Label text
    ctx.fillStyle = '#171717';
    ctx.font = '900 22px Inter, Segoe UI, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(config.label, boardX + LABEL_WIDTH / 2, rowY + ROW_HEIGHT / 2);

    // Row separator right of label
    ctx.fillStyle = '#0d0d0d';
    ctx.fillRect(boardX + LABEL_WIDTH, rowY, 1, ROW_HEIGHT);

    // Items area background
    const itemsAreaX = boardX + LABEL_WIDTH + 1;
    const itemsAreaWidth = boardWidth - LABEL_WIDTH - 1;
    ctx.fillStyle = '#242424';
    ctx.fillRect(itemsAreaX, rowY, itemsAreaWidth, ROW_HEIGHT);

    // Draw placed items
    let itemX = itemsAreaX + INNER_PADDING_X;
    const itemY = rowY + INNER_PADDING_Y;

    for (const { item, width, imgElement } of rowItems) {
      if (item.source === 'text') {
        // Draw text card
        ctx.fillStyle = '#2a2a2a';
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 1;
        drawRoundedRect(ctx, itemX, itemY, width, AVAILABLE_HEIGHT, 6);
        ctx.fill();
        ctx.stroke();

        // Text styling
        const text = item.text ?? item.name;
        const len = text.length;
        let fontSize = 16;
        let maxLines = 4;
        if (len <= 5) {
          fontSize = 26;
          maxLines = 1;
        } else if (len <= 13) {
          fontSize = 19;
          maxLines = 2;
        } else if (len <= 28) {
          fontSize = 15;
          maxLines = 3;
        } else {
          fontSize = 13;
          maxLines = 4;
        }

        ctx.font = `800 ${fontSize}px Inter, Segoe UI, system-ui, sans-serif`;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const lines = wrapText(ctx, text, width - 16).slice(0, maxLines);
        const lineHeight = fontSize * 1.18;
        const totalTextHeight = lines.length * lineHeight;
        const startTextY = itemY + AVAILABLE_HEIGHT / 2 - totalTextHeight / 2 + lineHeight / 2;

        lines.forEach((line, lineIdx) => {
          ctx.fillText(line, itemX + width / 2, startTextY + lineIdx * lineHeight);
        });
      } else if (imgElement) {
        // Draw image directly with object-fit: contain
        ctx.drawImage(imgElement, itemX, itemY, width, AVAILABLE_HEIGHT);
      } else {
        // Fallback placeholder
        ctx.strokeStyle = '#555555';
        ctx.strokeRect(itemX, itemY, width, AVAILABLE_HEIGHT);
      }

      itemX += width + GAP;
    }

    rowY += ROW_HEIGHT + SEPARATOR_HEIGHT;
  }

  ctx.restore(); // Restore clipping

  // Watermark footer
  if (watermark) {
    ctx.fillStyle = '#8a8a8a';
    ctx.font = '600 12px Inter, Segoe UI, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Made with YapTier — Open-source & ad-free Tier List Maker', BASE_WIDTH / 2, TOTAL_HEIGHT - 12);
  }

  return canvas;
}

export async function exportBoardToPngBlob(
  board: TierBoardState,
  options: PngExportOptions = {},
): Promise<Blob> {
  const canvas = await exportBoardToCanvas(board, options);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas could not create PNG blob'));
    }, 'image/png');
  });
}

export function downloadPngFile(blob: Blob, filename = 'yaptier-board.png'): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function sharePng(blob: Blob, title = 'YapTier List'): Promise<boolean> {
  const file = new File([blob], 'yaptier-board.png', { type: 'image/png' });

  if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title,
        text: `${title} created with YapTier`,
        files: [file],
      });
      return true;
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.warn('Web Share failed:', err);
      }
      return false;
    }
  }

  return false;
}

export async function copyPngToClipboard(blob: Blob): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return true;
    } catch (err) {
      console.warn('Clipboard write failed:', err);
      return false;
    }
  }
  return false;
}

