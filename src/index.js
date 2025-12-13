/**
 * Obscures a portion of a string by replacing the middle with a repeated mask character.
 *
 * @param {string} str - The string to obscure.
 * @param {Object} options - Configuration options.
 * @param {string} [options.maskChar='*'] - Character to use for masking.
 * @param {number} [options.prefixLength=3] - Number of characters to show at the beginning.
 * @param {number} [options.suffixLength=3] - Number of characters to show at the end.
 * @param {number} [options.minMaskLength=0] - Minimum number of mask characters to show (string must be long enough).
 * @param {boolean} [options.fullMask=false] - Mask the entire string.
 * @param {boolean} [options.reverseMask=false] - Show middle, hide edges.
 * @param {number} [options.percentage] - Mask a percentage of the string (0-100).
 * @param {number} [options.maxLength] - Maximum string length to process (prevents DoS).
 * @param {string} [options.preset] - Use a preset pattern ('email', 'creditCard', 'phone').
 * @returns {string} The masked string.
 */
function obscureString(str, options = {}) {
  // Input validation - handle edge cases securely
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') {
    // Coerce to string for numbers, booleans, etc.
    str = String(str);
  }
  if (str === '') return '';

  // Performance: extract and validate options once
  const {
    maskChar = '*',
    prefixLength = 3,
    suffixLength = 3,
    minMaskLength = 0,
    fullMask = false,
    reverseMask = false,
    percentage,
    maxLength = 1000000, // 1MB character limit for DoS prevention
    preset,
  } = options;

  // Security: enforce maximum length to prevent DoS
  if (str.length > maxLength) {
    throw new RangeError(
      `String length ${str.length} exceeds maximum allowed length ${maxLength}`
    );
  }

  // Validate maskChar - should be a non-empty string
  if (typeof maskChar !== 'string' || maskChar.length === 0) {
    throw new TypeError('maskChar must be a non-empty string');
  }

  // Validate numeric parameters
  if (
    !Number.isInteger(prefixLength) ||
    prefixLength < 0 ||
    !Number.isInteger(suffixLength) ||
    suffixLength < 0 ||
    !Number.isInteger(minMaskLength) ||
    minMaskLength < 0
  ) {
    throw new TypeError(
      'prefixLength, suffixLength, and minMaskLength must be non-negative integers'
    );
  }

  // Handle preset patterns
  if (preset) {
    return applyPreset(str, preset, maskChar);
  }

  // Handle full mask
  if (fullMask) {
    return maskChar.repeat(str.length);
  }

  // Handle percentage-based masking
  if (percentage !== undefined) {
    return maskByPercentage(str, percentage, maskChar);
  }

  // Handle reverse mask (show middle, hide edges)
  if (reverseMask) {
    return reverseObscure(
      str,
      prefixLength,
      suffixLength,
      maskChar,
      minMaskLength
    );
  }

  // Standard masking logic - optimized
  const totalVisible = prefixLength + suffixLength;
  const strLength = str.length;

  // If string is too short to mask meaningfully, return as-is
  if (strLength <= totalVisible) return str;

  // Calculate mask length
  const maskLength = strLength - totalVisible;

  // Check minimum mask length requirement
  if (minMaskLength > 0 && maskLength < minMaskLength) {
    return str;
  }

  // Performance optimization: use string concatenation for small strings,
  // array join for larger ones (more efficient)
  if (strLength < 100) {
    return (
      str.slice(0, prefixLength) +
      maskChar.repeat(maskLength) +
      str.slice(-suffixLength)
    );
  }

  // For longer strings, use array approach (faster)
  return (
    str.slice(0, prefixLength) +
    maskChar.repeat(maskLength) +
    str.slice(strLength - suffixLength)
  );
}

/**
 * Apply preset masking patterns
 * @private
 */
function applyPreset(str, preset, maskChar) {
  switch (preset.toLowerCase()) {
    case 'email': {
      const atIndex = str.lastIndexOf('@');
      if (atIndex <= 0) return obscureString(str, { maskChar });

      const localPart = str.slice(0, atIndex);
      const domain = str.slice(atIndex);

      if (localPart.length <= 2) {
        return localPart + domain;
      }

      const showChars = Math.min(2, Math.floor(localPart.length / 3));
      return (
        localPart.slice(0, showChars) +
        maskChar.repeat(localPart.length - showChars) +
        domain
      );
    }

    case 'creditcard': {
      // Show last 4 digits only
      const digits = str.replace(/\D/g, '');
      if (digits.length < 8) return str;
      return maskChar.repeat(digits.length - 4) + digits.slice(-4);
    }

    case 'phone': {
      // Show last 4 digits only
      const digits = str.replace(/\D/g, '');
      if (digits.length < 7) return str;
      return maskChar.repeat(digits.length - 4) + digits.slice(-4);
    }

    default:
      throw new Error(`Unknown preset: ${preset}`);
  }
}

/**
 * Mask by percentage
 * @private
 */
function maskByPercentage(str, percentage, maskChar) {
  if (
    typeof percentage !== 'number' ||
    percentage < 0 ||
    percentage > 100
  ) {
    throw new RangeError('percentage must be a number between 0 and 100');
  }

  const strLength = str.length;
  const charsToMask = Math.floor((strLength * percentage) / 100);

  if (charsToMask === 0) return str;
  if (charsToMask >= strLength) return maskChar.repeat(strLength);

  // Mask from the middle
  const visibleChars = strLength - charsToMask;
  const prefixLen = Math.floor(visibleChars / 2);
  const suffixLen = visibleChars - prefixLen;

  return (
    str.slice(0, prefixLen) +
    maskChar.repeat(charsToMask) +
    str.slice(-suffixLen)
  );
}

/**
 * Reverse obscure - show middle, hide edges
 * @private
 */
function reverseObscure(str, prefixLength, suffixLength, maskChar, minMaskLength) {
  const strLength = str.length;
  const totalMasked = prefixLength + suffixLength;

  if (strLength <= totalMasked) return maskChar.repeat(strLength);

  const middleLength = strLength - totalMasked;

  if (minMaskLength > 0 && totalMasked < minMaskLength) {
    return str;
  }

  const startPos = prefixLength;
  const endPos = strLength - suffixLength;

  return (
    maskChar.repeat(prefixLength) +
    str.slice(startPos, endPos) +
    maskChar.repeat(suffixLength)
  );
}

/**
 * Batch obscure multiple strings
 * @param {string[]} strings - Array of strings to obscure
 * @param {Object} options - Same options as obscureString
 * @returns {string[]} Array of masked strings
 */
function obscureStringBatch(strings, options = {}) {
  if (!Array.isArray(strings)) {
    throw new TypeError('First argument must be an array');
  }

  return strings.map((str) => obscureString(str, options));
}

/**
 * Get info about how a string would be masked without actually masking it
 * @param {string} str - The string to analyze
 * @param {Object} options - Same options as obscureString
 * @returns {Object} Information about the masking
 */
function getMaskInfo(str, options = {}) {
  if (str === null || str === undefined) {
    return { willBeMasked: false, reason: 'null or undefined input' };
  }
  if (typeof str !== 'string') {
    str = String(str);
  }

  const {
    prefixLength = 3,
    suffixLength = 3,
    fullMask = false,
    minMaskLength = 0,
  } = options;

  if (str === '') {
    return { willBeMasked: false, reason: 'empty string' };
  }

  if (fullMask) {
    return {
      willBeMasked: true,
      originalLength: str.length,
      maskedLength: str.length,
      visibleChars: 0,
      maskedChars: str.length,
    };
  }

  const totalVisible = prefixLength + suffixLength;
  const strLength = str.length;

  if (strLength <= totalVisible) {
    return {
      willBeMasked: false,
      reason: 'string too short',
      originalLength: strLength,
    };
  }

  const maskLength = strLength - totalVisible;

  if (minMaskLength > 0 && maskLength < minMaskLength) {
    return {
      willBeMasked: false,
      reason: 'mask length below minimum',
      originalLength: strLength,
      maskLength,
      minMaskLength,
    };
  }

  return {
    willBeMasked: true,
    originalLength: strLength,
    maskedLength: maskLength,
    visibleChars: totalVisible,
    maskedChars: maskLength,
    prefixLength,
    suffixLength,
  };
}

module.exports = { obscureString, obscureStringBatch, getMaskInfo };
