/**
 * Cryptographic security constants for Admin Studio Max authentication.
 *
 * For GitHub and public repository protection, private credentials are never
 * stored in plaintext. Passkeys and administrator identifiers are preserved
 * strictly as one-way SHA-256 cryptographic hashes.
 */
export const ADMIN_PASSKEY_SHA256 =
  '1af625ecb5b6fdaa3b447427244f54d59109c39529dffc6d95382c9d9778396f';

// SHA-256 one-way cryptographic hash of administrator email
export const ADMIN_EMAIL_SHA256 =
  'c75cb8afdc35f721a490a54c748047d6282122f7021301a033d3e880aba22b04';

// Publicly displayed masked placeholder ensuring administrator privacy
export const ADMIN_MASKED_EMAIL = '********************';

/**
 * Computes the SHA-256 hex hash of any text string using Web Crypto API.
 */
export async function sha256(text: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifies whether the entered password matches the encrypted master passkey.
 */
export async function verifyAdminPasskey(enteredPassword: string): Promise<boolean> {
  if (!enteredPassword) return false;
  const computedHash = await sha256(enteredPassword);
  return computedHash === ADMIN_PASSKEY_SHA256;
}

/**
 * Masks an email with asterisks to protect administrator identity from others.
 */
export function maskAdminEmail(email?: string): string {
  if (!email) return ADMIN_MASKED_EMAIL;
  return ADMIN_MASKED_EMAIL;
}

/**
 * Saves SHA-256 encrypted passkey for easy login.
 */
export function saveEncryptedPasskey(hash: string): void {
  try {
    localStorage.setItem('motionai_encrypted_admin_key', hash);
  } catch (e) {}
}

/**
 * Retrieves the saved SHA-256 encrypted passkey.
 */
export function getSavedEncryptedPasskey(): string | null {
  try {
    return localStorage.getItem('motionai_encrypted_admin_key');
  } catch (e) {
    return null;
  }
}

/**
 * Clears the saved encrypted passkey.
 */
export function clearSavedEncryptedPasskey(): void {
  try {
    localStorage.removeItem('motionai_encrypted_admin_key');
  } catch (e) {}
}
