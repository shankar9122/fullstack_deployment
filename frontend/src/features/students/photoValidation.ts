// These mirror the backend limits (middleware/uploadPhoto.js). They only save the user a wasted
// upload. The server still checks everything, and decodes the actual bytes
export const MAX_PHOTO_MB = 2;
export const MAX_PHOTO_BYTES = MAX_PHOTO_MB * 1024 * 1024;

const ACCEPTED_PHOTO_TYPES: readonly string[] = ['image/jpeg', 'image/png', 'image/webp'];

// Value for the <input accept="..."> attribute (the user can still override it in the file picker)
export const PHOTO_INPUT_ACCEPT = ACCEPTED_PHOTO_TYPES.join(',');

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Returns an error message, or null when the file looks fine */
export function validatePhotoFile(file: File): string | null {
  if (file.size === 0) return 'This file is empty';

  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    // iPhones can save photos as HEIC, which the server cannot read
    if (file.type === 'image/heic' || file.type === 'image/heif') {
      return 'HEIC photos are not supported. Please choose a JPEG or PNG';
    }
    return 'Please choose a JPEG, PNG or WebP image';
  }

  if (file.size > MAX_PHOTO_BYTES) {
    return `This image is ${formatSize(file.size)}. The maximum is ${MAX_PHOTO_MB} MB`;
  }

  return null;
}
