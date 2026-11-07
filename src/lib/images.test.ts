import { describe, expect, it } from 'vitest';
import { MAX_IMAGE_SIZE_BYTES, validateImageFile } from './images';

function makeFile(name: string, type: string, size?: number): File {
  const file = new File(['content'], name, { type });

  if (size !== undefined) {
    Object.defineProperty(file, 'size', { configurable: true, value: size });
  }

  return file;
}

describe('validateImageFile', () => {
  it.each([
    ['photo.png', 'image/png'],
    ['photo.jpg', 'image/jpeg'],
    ['photo.jpeg', 'image/jpeg'],
    ['photo.webp', 'image/webp'],
  ])('accepts %s', (name, type) => {
    expect(validateImageFile(makeFile(name, type)).valid).toBe(true);
  });

  it('accepts a file with an accepted extension when the browser omits the MIME type', () => {
    expect(validateImageFile(makeFile('photo.png', '')).valid).toBe(true);
  });

  it('rejects unsupported MIME types', () => {
    const result = validateImageFile(makeFile('animation.gif', 'image/gif'));

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/unsupported file type/i);
  });

  it('rejects a spoofed extension with the wrong MIME type', () => {
    expect(validateImageFile(makeFile('photo.png', 'image/gif')).valid).toBe(false);
  });

  it('rejects files without an accepted extension or MIME type', () => {
    expect(validateImageFile(makeFile('notes.txt', 'text/plain')).valid).toBe(false);
  });

  it('rejects empty files', () => {
    const result = validateImageFile(makeFile('empty.png', 'image/png', 0));

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/empty/i);
  });

  it('rejects files over the size limit', () => {
    const result = validateImageFile(
      makeFile('huge.png', 'image/png', MAX_IMAGE_SIZE_BYTES + 1),
    );

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/limit/i);
  });

  it('accepts files exactly at the size limit', () => {
    expect(validateImageFile(makeFile('limit.png', 'image/png', MAX_IMAGE_SIZE_BYTES)).valid).toBe(
      true,
    );
  });
});
