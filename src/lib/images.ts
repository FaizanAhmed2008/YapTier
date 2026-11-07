import { formatBytes } from './format';

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'] as const;

export const FILE_INPUT_ACCEPT = 'image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp';

const acceptedTypes = new Set<string>(ACCEPTED_IMAGE_TYPES);
const acceptedExtensionPattern = /\.(png|jpe?g|webp)$/i;

export interface ImageValidation {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidation {
  const hasAcceptedExtension = acceptedExtensionPattern.test(file.name);

  if (file.type) {
    if (!acceptedTypes.has(file.type)) {
      return {
        valid: false,
        error: 'Unsupported file type. Choose a PNG, JPG, JPEG, or WebP image.',
      };
    }
  } else if (!hasAcceptedExtension) {
    return {
      valid: false,
      error: 'Unsupported file type. Choose a PNG, JPG, JPEG, or WebP image.',
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'This file is empty.' };
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return {
      valid: false,
      error: `This file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_IMAGE_SIZE_BYTES)}.`,
    };
  }

  return { valid: true };
}
