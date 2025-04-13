/**
 * Obscures a portion of a string by replacing the middle with a repeated mask character.
 *
 * @param {string} str - The string to obscure.
 * @param {Object} options - Configuration options.
 * @param {string} [options.maskChar='*'] - Character to use for masking.
 * @param {number} [options.prefixLength=3] - Number of characters to show at the beginning.
 * @param {number} [options.suffixLength=3] - Number of characters to show at the end.
 * @returns {string} The masked string.
 */
function obscureString(str, options = {}) {
  const { maskChar = '*', prefixLength = 3, suffixLength = 3 } = options;

  if (typeof str !== 'string') return '';
  if (str.length <= prefixLength + suffixLength) return str;

  const start = str.slice(0, prefixLength);
  const end = str.slice(-suffixLength);
  const masked = maskChar.repeat(str.length - prefixLength - suffixLength);

  return start + masked + end;
}

module.exports = { obscureString };
