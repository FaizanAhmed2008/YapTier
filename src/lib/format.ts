import type { IconAttribution } from '../types';

export function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes < 10 ? kilobytes.toFixed(1) : Math.round(kilobytes)} KB`;
  }

  const megabytes = kilobytes / 1024;
  return `${megabytes.toFixed(1)} MB`;
}

export function humanizeIconName(name: string): string {
  return name.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function stripFileExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '') || fileName;
}

export function describeAttribution(attribution: IconAttribution): string {
  const parts = [attribution.collectionName];

  if (attribution.author) {
    parts.push(`by ${attribution.author}`);
  }

  if (attribution.license?.title) {
    parts.push(`· ${attribution.license.title}`);
  }

  parts.push(`via ${attribution.providerLabel}`);
  return parts.join(' ');
}

export function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return `${count} ${count === 1 ? singular : plural}`;
}
