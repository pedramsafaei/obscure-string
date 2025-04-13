const { obscureString } = require('../src');

describe('obscureString', () => {
  test('masks the middle with default settings', () => {
    const result = obscureString('mysecretkey');
    expect(result).toBe('mys*****key');
  });

  test('masks with custom prefix/suffix and mask character', () => {
    const input = 'john.doe@example.com';
    const result = obscureString(input, {
      prefixLength: 2,
      suffixLength: 4,
      maskChar: '#',
    });

    const expected = 'jo' + '#'.repeat(14) + '.com';
    expect(result).toBe(expected);
  });

  test('returns full string if too short to mask', () => {
    expect(obscureString('short', { prefixLength: 3, suffixLength: 3 })).toBe('short');
  });

  test('returns empty string for non-string input', () => {
    expect(obscureString(null)).toBe('');
    expect(obscureString(undefined)).toBe('');
    expect(obscureString(12345)).toBe('');
  });
});
