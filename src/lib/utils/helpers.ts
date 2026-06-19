// src/lib/utils/helpers.ts
/**
 * Utility function to cleanly format lengthy cryptographic hex hashes for UI presentation.
 * Shortens hashes to a standard readable format: 0x1234...abcd
 */
export function truncateHash(hash: string, startLength = 6, endLength = 4): string {
  if (!hash) return "";
  if (hash.length <= startLength + endLength) return hash;
  return `${hash.substring(0, startLength)}...${hash.substring(hash.length - endLength)}`;
}

/**
 * Validates whether a provided string matches standard cryptographic 64-character hex patterns.
 */
export function isValidHexHash(hash: string): boolean {
  const cleanHash = hash.startsWith("0x") ? hash.substring(2) : hash;
  const hexRegex = /^[0-9a-fA-F]{64}$/;
  return hexRegex.test(cleanHash);
}