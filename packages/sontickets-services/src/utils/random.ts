/**
 * Generates a random UUID (if available) or fallback,
 * then stores it in localStorage under the key "pseudoUserId".
 * @returns The existing or newly generated pseudo user ID
 */
export function getOrCreatePseudoUserId(): string | null {
  /**
   * Generates a fallback UUID (v4-like) if crypto.randomUUID isn't available.
   * This is a quick solution; for cryptographic-grade randomness, polyfill or a library is recommended.
   */
  function generateFallbackUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0,
          v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  // This check ensures we're in a browser environment (not SSR)
  if (typeof window === "undefined") {
    console.warn(
      "getOrCreatePseudoUserId called on the server. Returning null."
    );
    return null;
  }

  // Look up the ID in localStorage
  const existingId = localStorage.getItem("pseudoUserId");
  if (existingId) {
    return existingId;
  }

  // Generate a new ID using the browser's crypto API (if available)
  // crypto.randomUUID() is supported in modern browsers
  const newId = crypto.randomUUID
    ? crypto.randomUUID()
    : generateFallbackUUID();

  // Store it in localStorage
  localStorage.setItem("pseudoUserId", newId);
  return newId;
}
