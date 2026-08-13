/**
 * Utility for normalizing phone numbers into clean WhatsApp E.164-like digit strings
 */
export function normalizePhoneNumber(rawPhone: string): string {
  if (!rawPhone) return '';

  let cleaned = rawPhone.replace(/[^\d]/g, '');

  // Strip international double zero prefix
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }

  // Pakistan local 11-digit mobile: 03XX XXXXXXX -> 923XX XXXXXXX
  if (cleaned.length === 11 && cleaned.startsWith('03')) {
    cleaned = '92' + cleaned.substring(1);
  }
  // UK local 11-digit mobile: 07XXX XXXXXX -> 447XXX XXXXXX
  else if (cleaned.length === 11 && cleaned.startsWith('07')) {
    cleaned = '44' + cleaned.substring(1);
  }
  // US / Canada 10-digit mobile
  else if (cleaned.length === 10) {
    cleaned = '1' + cleaned;
  }

  return cleaned;
}

/**
 * Validates whether a phone number meets minimum length requirements after normalization
 */
export function isValidPhoneNumber(rawPhone: string): boolean {
  const normalized = normalizePhoneNumber(rawPhone);
  return normalized.length >= 10 && normalized.length <= 15;
}

/**
 * Converts normalized phone number to WhatsApp JID format
 */
export function phoneToJid(normalizedPhone: string): string {
  const digits = normalizePhoneNumber(normalizedPhone);
  return `${digits}@c.us`;
}
