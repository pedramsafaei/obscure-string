export interface ObscureStringOptions {
  /** Character to use for masking (default: '*') */
  maskChar?: string;
  /** Number of characters to show at the beginning (default: 3) */
  prefixLength?: number;
  /** Number of characters to show at the end (default: 2) */
  suffixLength?: number;
  /** Minimum number of mask characters required (default: 0) */
  minMaskLength?: number;
  /** Mask the entire string (default: false) */
  fullMask?: boolean;
  /** Show middle, hide edges (default: false) */
  reverseMask?: boolean;
  /** Mask a percentage of the string (0-100) */
  percentage?: number;
  /** Maximum string length to process (default: 1000000) */
  maxLength?: number;
  /** Use a preset pattern: 'email', 'creditCard', 'phone' */
  preset?: 'email' | 'creditCard' | 'phone';
}

export interface MaskInfo {
  /** Whether the string will be masked */
  willBeMasked: boolean;
  /** Reason if not masked */
  reason?: string;
  /** Original string length */
  originalLength?: number;
  /** Number of characters that will be masked */
  maskedLength?: number;
  /** Number of visible characters */
  visibleChars?: number;
  /** Number of masked characters */
  maskedChars?: number;
  /** Prefix length */
  prefixLength?: number;
  /** Suffix length */
  suffixLength?: number;
  /** Minimum mask length */
  minMaskLength?: number;
  /** Actual mask length */
  maskLength?: number;
}

/**
 * Obscures a portion of a string by replacing characters with a mask character.
 * 
 * @param str - The string to obscure
 * @param options - Configuration options
 * @returns The masked string
 * 
 * @example
 * ```ts
 * obscureString('mysecretkey') // 'mys*****key'
 * obscureString('john@example.com', { preset: 'email' }) // 'jo**@example.com'
 * obscureString('4111111111111111', { preset: 'creditCard' }) // '************1111'
 * ```
 */
export function obscureString(
  str: string | null | undefined,
  options?: ObscureStringOptions
): string;

/**
 * Batch obscure multiple strings with the same options.
 * 
 * @param strings - Array of strings to obscure
 * @param options - Configuration options
 * @returns Array of masked strings
 * 
 * @example
 * ```ts
 * obscureStringBatch(['secret1', 'secret2'], { prefixLength: 2 })
 * // ['se****1', 'se****2']
 * ```
 */
export function obscureStringBatch(
  strings: string[],
  options?: ObscureStringOptions
): string[];

/**
 * Get information about how a string would be masked without actually masking it.
 * 
 * @param str - The string to analyze
 * @param options - Configuration options
 * @returns Information about the masking
 * 
 * @example
 * ```ts
 * getMaskInfo('mysecret', { prefixLength: 3, suffixLength: 3 })
 * // { willBeMasked: true, originalLength: 8, maskedLength: 2, ... }
 * ```
 */
export function getMaskInfo(
  str: string | null | undefined,
  options?: ObscureStringOptions
): MaskInfo;
