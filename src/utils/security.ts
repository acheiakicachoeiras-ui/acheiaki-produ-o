/**
 * Security & Temporary Password Generator
 * ConectAí Multi-Lojista Marketplace
 * Rules: Exactly 6 characters, mixed uppercase, lowercase, special characters, and digits.
 */

const UPPERCASE = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SPECIALS = '!@#$%&*+?';
const ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIALS;

/**
 * Generates an unpredictable 6-character temporary password
 * strictly containing uppercase, lowercase, special characters, and numbers.
 */
export function generateTemporaryPassword(): string {
  // Guarantee 1 of each required character category
  const guaranteed = [
    UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)],
    LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)],
    DIGITS[Math.floor(Math.random() * DIGITS.length)],
    SPECIALS[Math.floor(Math.random() * SPECIALS.length)],
  ];

  // Fill remaining 2 positions to achieve exactly 6 characters
  const remaining = [
    ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)],
    ALL_CHARS[Math.floor(Math.random() * ALL_CHARS.length)],
  ];

  const combined = [...guaranteed, ...remaining];

  // Fisher-Yates shuffle
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }

  return combined.join('');
}

/**
 * Validates if a temporary password meets complexity criteria:
 * - Exactly 6 characters
 * - Has at least one uppercase letter
 * - Has at least one lowercase letter
 * - Has at least one number
 * - Has at least one special character
 */
export function verifyTemporaryPasswordComplexity(password: string): boolean {
  if (!password || password.length !== 6) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%&*+?]/.test(password);
  return hasUpper && hasLower && hasDigit && hasSpecial;
}

/**
 * Validates a new permanent password chosen by the user on first access
 */
export function validateNewPermanentPassword(
  newPass: string,
  confirmPass: string,
  tempPass?: string
): { isValid: boolean; error?: string } {
  if (!newPass || newPass.length < 8) {
    return {
      isValid: false,
      error: 'A nova senha deve ter no mínimo 8 caracteres.',
    };
  }
  if (tempPass && newPass === tempPass) {
    return {
      isValid: false,
      error: 'A nova senha deve ser diferente da senha provisória de 6 caracteres.',
    };
  }
  if (newPass !== confirmPass) {
    return {
      isValid: false,
      error: 'A confirmação de senha não confere.',
    };
  }
  return { isValid: true };
}
