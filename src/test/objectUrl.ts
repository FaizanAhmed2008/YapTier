import { vi } from 'vitest';

export function installObjectUrlMock() {
  let counter = 0;
  const createObjectURL = vi.fn((_file: Blob) => `blob:mock-${++counter}`);
  const revokeObjectURL = vi.fn((_url: string) => undefined);

  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    writable: true,
    value: createObjectURL,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    writable: true,
    value: revokeObjectURL,
  });

  return { createObjectURL, revokeObjectURL };
}
