// Must match the backend. bcrypt only uses the first 72 bytes of a password,
// so anything longer would be silently truncated
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_BYTES = 72;

// Bytes, not characters: "é" or an emoji takes more than one byte
export function passwordByteLength(value: string): number {
  return new TextEncoder().encode(value).length;
}
