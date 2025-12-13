/**
 * Options for configuring string obscuration behavior.
 */
export interface ObscureStringOptions {
  /**
   * Character(s) to use for masking. Maximum 10 characters.
   * @default '*'
   */
  maskChar?: string;

  /**
   * Number of characters to show at the beginning. Must be non-negative integer.
   * @default 3
   */
  prefixLength?: number;

  /**
   * Number of characters to show at the end. Must be non-negative integer.
   * @default 3
   */
  suffixLength?: number;

  /**
   * Alternative to prefix/suffix: mask a percentage of the string (0-100).
   */
  percentage?: number;

  /**
   * Use pattern-specific masking: 'email', 'phone', 'generic', or 'auto' for automatic detection.
   */
  pattern?: 'email' | 'phone' | 'generic' | 'auto';

  /**
   * Regular expression pattern string for characters to preserve (e.g., '@.' for emails).
   */
  preservePattern?: string;

  /**
   * Use random mask characters from a secure set for enhanced privacy.
   * @default false
   */
  randomMask?: boolean;

  /**
   * Enable memoization for repeated operations with same parameters.
   * @default true
   */
  cache?: boolean;

  /**
   * Size of each chunk for async processing (used in obscureStringAsync).
   * @default 10000
   */
  chunkSize?: number;
}

/**
 * Cache statistics for monitoring and debugging.
 */
export interface CacheStats {
  /** Current number of cached entries */
  size: number;
  /** Maximum cache size */
  maxSize: number;
}

/**
 * Obscures a portion of a string by replacing the middle with a mask character.
 * 
 * This function provides professional-grade string obscuration with:
 * - Comprehensive input validation and sanitization
 * - Protection against injection and memory exhaustion attacks
 * - Safe handling of Unicode characters, emojis, and special characters
 * - Efficient performance with O(n) time complexity
 * - Memoization for repeated operations
 * - Support for custom masking patterns
 *
 * @param str - The string to obscure. Must not exceed 1,000,000 characters.
 * @param options - Configuration options for masking behavior.
 * @returns The obscured string. Returns empty string for invalid input types.
 * @throws Error for invalid parameters with descriptive message.
 *
 * @example
 * ```typescript
 * // Basic usage
 * obscureString('mysecretkey');
 * // => 'mys*****key'
 *
 * // Custom masking
 * obscureString('john.doe@example.com', {
 *   prefixLength: 2,
 *   suffixLength: 4,
 *   maskChar: '#'
 * });
 * // => 'jo##############.com'
 *
 * // Pattern-specific masking
 * obscureString('user@example.com', { pattern: 'email' });
 * // => 'u***@example.com'
 *
 * // Percentage-based masking
 * obscureString('1234567890', { percentage: 50 });
 * // => '12***67890'
 * ```
 */
export function obscureString(
  str: string,
  options?: ObscureStringOptions
): string;

/**
 * Processes a large string asynchronously to avoid blocking the event loop.
 * Useful for processing very large strings or arrays of strings asynchronously.
 *
 * @param str - The string to obscure
 * @param options - Same options as obscureString
 * @returns Promise that resolves to the obscured string
 *
 * @example
 * ```typescript
 * const result = await obscureStringAsync(veryLargeString);
 * ```
 */
export function obscureStringAsync(
  str: string,
  options?: ObscureStringOptions
): Promise<string>;

/**
 * Batch process multiple strings efficiently.
 *
 * @param strings - Array of strings to obscure
 * @param options - Same options as obscureString
 * @returns Array of obscured strings
 *
 * @example
 * ```typescript
 * const results = obscureStringBatch(['secret1', 'secret2', 'secret3']);
 * // => ['sec***t1', 'sec***t2', 'sec***t3']
 * ```
 */
export function obscureStringBatch(
  strings: string[],
  options?: ObscureStringOptions
): string[];

/**
 * Clears the internal cache. Useful for memory management in long-running processes.
 *
 * @example
 * ```typescript
 * clearCache();
 * ```
 */
export function clearCache(): void;

/**
 * Returns cache statistics for monitoring and debugging.
 *
 * @returns Cache statistics
 *
 * @example
 * ```typescript
 * const stats = getCacheStats();
 * console.log(`Cache: ${stats.size}/${stats.maxSize}`);
 * ```
 */
export function getCacheStats(): CacheStats;

/**
 * Maximum allowed input string length (1,000,000 characters)
 */
export const MAX_INPUT_LENGTH: number;

/**
 * Maximum allowed mask character length (10 characters)
 */
export const MAX_MASK_CHAR_LENGTH: number;

/**
 * Default mask character ('*')
 */
export const DEFAULT_MASK_CHAR: string;

/**
 * Default prefix length (3)
 */
export const DEFAULT_PREFIX_LENGTH: number;

/**
 * Default suffix length (3)
 */
export const DEFAULT_SUFFIX_LENGTH: number;
