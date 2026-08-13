// Security Hardening & Input Sanitization Utilities for Teethly OS

/**
 * Sanitizes string input to prevent XSS attacks when rendering HTML/Markdown or saving text fields.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates medical patient inputs (CNIC/National ID, Phone, Email, Medical Record Numbers)
 */
export const InputValidators = {
  isValidEmail: (email: string): boolean => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
  },
  
  isValidPhone: (phone: string): boolean => {
    return /^[\d\+\-\s\(\)]{8,20}$/.test(phone);
  },

  isValidMRN: (mrn: string): boolean => {
    return /^DEN-[A-Z0-9]{4,10}$/i.test(mrn);
  },

  isValidCNIC: (cnic: string): boolean => {
    return /^\d{5}-\d{7}-\d{1}$/.test(cnic) || /^\d{13}$/.test(cnic);
  }
};

/**
 * Client-Side Rate Limiter to prevent rapid repeated actions (e.g. login attempts, online booking spam)
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();

  public checkRateLimit(key: string, maxAttempts: number = 5, windowMs: number = 60000): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const timestamps = (this.attempts.get(key) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= maxAttempts) {
      return { allowed: false, remaining: 0 };
    }

    timestamps.push(now);
    this.attempts.set(key, timestamps);
    return { allowed: true, remaining: maxAttempts - timestamps.length };
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Generates secure anti-CSRF token nonces for forms and sensitive mutations
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 16; i++) array[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}
