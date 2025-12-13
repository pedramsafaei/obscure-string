const {
  obscureString,
  obscureStringAsync,
  obscureStringBatch,
  clearCache,
  getCacheStats,
  MAX_INPUT_LENGTH,
  MAX_MASK_CHAR_LENGTH,
  DEFAULT_MASK_CHAR,
  DEFAULT_PREFIX_LENGTH,
  DEFAULT_SUFFIX_LENGTH
} = require('../src');

describe('obscureString - Basic Functionality', () => {
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

  test('handles empty string', () => {
    expect(obscureString('')).toBe('');
  });

  test('handles single character string', () => {
    expect(obscureString('a', { prefixLength: 1, suffixLength: 0 })).toBe('a');
  });

  test('handles exact length match (no masking needed)', () => {
    expect(obscureString('abc', { prefixLength: 2, suffixLength: 1 })).toBe('abc');
  });
});

describe('obscureString - Unicode and Special Characters', () => {
  test('handles Unicode characters correctly', () => {
    const result = obscureString('café☕secret');
    expect(result).toBe('caf*****ret');
  });

  test('handles emojis correctly', () => {
    const result = obscureString('Hello 👋 World 🌍');
    expect(result.slice(0, 3)).toBe('Hel');
    expect(result.slice(-3)).toBe('d 🌍');
  });

  test('handles multi-byte characters', () => {
    const result = obscureString('你好世界测试');
    expect(result.slice(0, 3)).toBe('你好世');
    expect(result.slice(-3)).toBe('界测试');
  });

  test('handles special characters in maskChar', () => {
    const result = obscureString('secret', { maskChar: '•', prefixLength: 2, suffixLength: 2 });
    expect(result).toBe('se••et');
  });

  test('handles multi-character maskChar', () => {
    const result = obscureString('test', { maskChar: 'XX', prefixLength: 1, suffixLength: 1 });
    expect(result).toBe('tXXXXXXst');
  });
});

describe('obscureString - Input Validation', () => {
  test('throws error for non-string maskChar', () => {
    expect(() => obscureString('test', { maskChar: 123 }))
      .toThrow('maskChar must be a string');
  });

  test('throws error for empty maskChar', () => {
    expect(() => obscureString('test', { maskChar: '' }))
      .toThrow('maskChar cannot be empty');
  });

  test('throws error for maskChar exceeding max length', () => {
    expect(() => obscureString('test', { maskChar: '*'.repeat(11) }))
      .toThrow(`maskChar exceeds maximum length of ${MAX_MASK_CHAR_LENGTH}`);
  });

  test('throws error for negative prefixLength', () => {
    expect(() => obscureString('test', { prefixLength: -1 }))
      .toThrow('prefixLength must be a non-negative integer');
  });

  test('throws error for non-integer prefixLength', () => {
    expect(() => obscureString('test', { prefixLength: 1.5 }))
      .toThrow('prefixLength must be a non-negative integer');
  });

  test('throws error for negative suffixLength', () => {
    expect(() => obscureString('test', { suffixLength: -1 }))
      .toThrow('suffixLength must be a non-negative integer');
  });

  test('throws error for non-integer suffixLength', () => {
    expect(() => obscureString('test', { suffixLength: 2.5 }))
      .toThrow('suffixLength must be a non-negative integer');
  });

  test('throws error for prefixLength exceeding string length', () => {
    expect(() => obscureString('test', { prefixLength: 10 }))
      .toThrow('prefixLength exceeds string length');
  });

  test('throws error for suffixLength exceeding string length', () => {
    expect(() => obscureString('test', { suffixLength: 10 }))
      .toThrow('suffixLength exceeds string length');
  });

  test('throws error when prefix + suffix exceeds string length', () => {
    expect(() => obscureString('test', { prefixLength: 3, suffixLength: 3 }))
      .toThrow('prefixLength + suffixLength cannot exceed string length');
  });

  test('throws error for invalid percentage', () => {
    expect(() => obscureString('test', { percentage: -10 }))
      .toThrow('percentage must be a number between 0 and 100');
    expect(() => obscureString('test', { percentage: 150 }))
      .toThrow('percentage must be a number between 0 and 100');
  });

  test('throws error for non-string preservePattern', () => {
    expect(() => obscureString('test', { preservePattern: 123 }))
      .toThrow('preservePattern must be a string');
  });

  test('throws error for non-boolean randomMask', () => {
    expect(() => obscureString('test', { randomMask: 'yes' }))
      .toThrow('randomMask must be a boolean');
  });

  test('handles maximum input length', () => {
    const longString = 'a'.repeat(MAX_INPUT_LENGTH);
    const result = obscureString(longString, { prefixLength: 1, suffixLength: 1 });
    expect(result.length).toBe(MAX_INPUT_LENGTH);
    expect(result[0]).toBe('a');
    expect(result[result.length - 1]).toBe('a');
  });

  test('throws error for input exceeding maximum length', () => {
    const tooLongString = 'a'.repeat(MAX_INPUT_LENGTH + 1);
    expect(() => obscureString(tooLongString))
      .toThrow(`Input exceeds maximum length of ${MAX_INPUT_LENGTH}`);
  });
});

describe('obscureString - Security Features', () => {
  test('does not leak sensitive data in error messages', () => {
    try {
      obscureString('mysecretpassword', { prefixLength: 100 });
      fail('Should have thrown an error');
    } catch (error) {
      expect(error.message).not.toContain('mysecretpassword');
    }
  });

  test('sanitizes potentially dangerous input', () => {
    // Test that the function handles potentially malicious input safely
    const maliciousInputs = [
      'test\x00null',
      'test\r\ninjection',
      'test<script>alert(1)</script>',
    ];

    maliciousInputs.forEach(input => {
      const result = obscureString(input);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  test('random mask uses different characters', () => {
    const results = new Set();
    for (let i = 0; i < 10; i++) {
      const result = obscureString('teststring', { randomMask: true, prefixLength: 2, suffixLength: 2 });
      results.add(result);
    }
    // With random masking, we should get multiple different results
    expect(results.size).toBeGreaterThan(1);
  });

  test('random mask maintains length', () => {
    const input = 'teststring';
    const result = obscureString(input, { randomMask: true });
    expect(result.length).toBe(input.length);
  });
});

describe('obscureString - Performance Features', () => {
  test('handles small strings efficiently', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      obscureString('test' + i);
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in under 100ms
  });

  test('handles large strings efficiently', () => {
    const largeString = 'a'.repeat(10000);
    const start = Date.now();
    const result = obscureString(largeString);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50); // Should complete in under 50ms
    expect(result.length).toBe(largeString.length);
  });

  test('uses caching for repeated operations', () => {
    clearCache();
    
    const input = 'teststring';
    const options = { prefixLength: 2, suffixLength: 2 };
    
    // First call - not cached
    const result1 = obscureString(input, options);
    const stats1 = getCacheStats();
    
    // Second call - should use cache
    const result2 = obscureString(input, options);
    const stats2 = getCacheStats();
    
    expect(result1).toBe(result2);
    expect(stats2.size).toBeGreaterThan(0);
  });

  test('cache can be disabled', () => {
    clearCache();
    
    const input = 'teststring';
    const result = obscureString(input, { cache: false });
    const stats = getCacheStats();
    
    expect(typeof result).toBe('string');
    expect(stats.size).toBe(0);
  });

  test('cache respects maximum size', () => {
    clearCache();
    
    // Add many unique entries
    for (let i = 0; i < 150; i++) {
      obscureString('test' + i, { prefixLength: i % 5 });
    }
    
    const stats = getCacheStats();
    expect(stats.size).toBeLessThanOrEqual(stats.maxSize);
  });
});

describe('obscureString - Advanced Features', () => {
  test('percentage-based masking', () => {
    const result = obscureString('1234567890', { percentage: 50 });
    // 50% of 10 chars = 5 chars masked in the middle
    expect(result).toMatch(/^\d+\*+\d+$/);
    expect((result.match(/\*/g) || []).length).toBe(5);
  });

  test('percentage-based masking with 0%', () => {
    const result = obscureString('test', { percentage: 0 });
    expect(result).toBe('test');
  });

  test('percentage-based masking with 100%', () => {
    const result = obscureString('test', { percentage: 100 });
    expect(result).toBe('****');
  });

  test('email pattern masking', () => {
    const result = obscureString('user@example.com', { pattern: 'email' });
    expect(result).toMatch(/^u\*+r@example\.com$/);
  });

  test('email pattern masking with short local part', () => {
    const result = obscureString('ab@example.com', { pattern: 'email' });
    expect(result).toBe('ab@example.com');
  });

  test('phone pattern masking', () => {
    const result = obscureString('1234567890', { pattern: 'phone' });
    expect(result).toBe('******7890');
  });

  test('phone pattern masking with formatting', () => {
    const result = obscureString('+1 (555) 123-4567', { pattern: 'phone' });
    expect(result).toMatch(/^\*+4567$/);
  });

  test('auto pattern detection for email', () => {
    const result = obscureString('test@example.com', { pattern: 'auto' });
    expect(result).toMatch(/^t\*+t@example\.com$/);
  });

  test('auto pattern detection for phone', () => {
    const result = obscureString('5551234567', { pattern: 'auto' });
    expect(result).toBe('******4567');
  });

  test('preserve pattern keeps specific characters', () => {
    const result = obscureString('test@example.com', {
      prefixLength: 0,
      suffixLength: 0,
      preservePattern: '@\\.',
      maskChar: '*'
    });
    expect(result).toContain('@');
    expect(result).toContain('.');
    expect(result).toContain('*');
  });

  test('generic pattern falls back to standard masking', () => {
    const result = obscureString('normalstring', { pattern: 'generic' });
    expect(result).toBe('nor******ing');
  });
});

describe('obscureStringAsync', () => {
  test('obscures string asynchronously', async () => {
    const result = await obscureStringAsync('teststring');
    expect(result).toBe('tes****ing');
  });

  test('handles small strings efficiently', async () => {
    const result = await obscureStringAsync('test');
    expect(result).toBe('test');
  });

  test('handles large strings', async () => {
    const largeString = 'a'.repeat(50000);
    const result = await obscureStringAsync(largeString);
    expect(result.length).toBe(largeString.length);
  });

  test('accepts same options as sync version', async () => {
    const result = await obscureStringAsync('teststring', {
      prefixLength: 2,
      suffixLength: 2,
      maskChar: '#'
    });
    expect(result).toBe('te######ng');
  });

  test('handles errors in async mode', async () => {
    await expect(obscureStringAsync('test', { prefixLength: 100 }))
      .rejects.toThrow('prefixLength exceeds string length');
  });

  test('handles non-string input', async () => {
    const result = await obscureStringAsync(null);
    expect(result).toBe('');
  });
});

describe('obscureStringBatch', () => {
  test('processes multiple strings', () => {
    const results = obscureStringBatch(['test1', 'test2', 'test3']);
    expect(results).toEqual(['test1', 'test2', 'test3']);
  });

  test('applies options to all strings', () => {
    const results = obscureStringBatch(
      ['mysecret1', 'mysecret2', 'mysecret3'],
      { prefixLength: 2, suffixLength: 2 }
    );
    results.forEach(result => {
      expect(result).toMatch(/^my\*+\d$/);
    });
  });

  test('handles mixed valid and invalid inputs', () => {
    const results = obscureStringBatch([
      'valid',
      null,
      'another',
      undefined,
      'lastone'
    ]);
    expect(results).toEqual(['valid', '', 'another', '', 'lastone']);
  });

  test('throws error for non-array input', () => {
    expect(() => obscureStringBatch('notanarray'))
      .toThrow('Input must be an array of strings');
  });

  test('maintains array length even with errors', () => {
    const input = ['test1', 'test2', 'test3', 'test4'];
    const results = obscureStringBatch(input, { prefixLength: 100 });
    expect(results.length).toBe(input.length);
    expect(results).toEqual(['', '', '', '']);
  });

  test('handles empty array', () => {
    const results = obscureStringBatch([]);
    expect(results).toEqual([]);
  });
});

describe('Cache Management', () => {
  test('clearCache empties the cache', () => {
    obscureString('test1');
    obscureString('test2');
    const statsBefore = getCacheStats();
    expect(statsBefore.size).toBeGreaterThan(0);
    
    clearCache();
    
    const statsAfter = getCacheStats();
    expect(statsAfter.size).toBe(0);
  });

  test('getCacheStats returns correct structure', () => {
    clearCache();
    const stats = getCacheStats();
    expect(stats).toHaveProperty('size');
    expect(stats).toHaveProperty('maxSize');
    expect(typeof stats.size).toBe('number');
    expect(typeof stats.maxSize).toBe('number');
  });

  test('cache grows with unique operations', () => {
    clearCache();
    
    obscureString('test1');
    const stats1 = getCacheStats();
    
    obscureString('test2');
    const stats2 = getCacheStats();
    
    expect(stats2.size).toBeGreaterThan(stats1.size);
  });
});

describe('Constants Export', () => {
  test('exports MAX_INPUT_LENGTH constant', () => {
    expect(typeof MAX_INPUT_LENGTH).toBe('number');
    expect(MAX_INPUT_LENGTH).toBe(1000000);
  });

  test('exports MAX_MASK_CHAR_LENGTH constant', () => {
    expect(typeof MAX_MASK_CHAR_LENGTH).toBe('number');
    expect(MAX_MASK_CHAR_LENGTH).toBe(10);
  });

  test('exports DEFAULT_MASK_CHAR constant', () => {
    expect(typeof DEFAULT_MASK_CHAR).toBe('string');
    expect(DEFAULT_MASK_CHAR).toBe('*');
  });

  test('exports DEFAULT_PREFIX_LENGTH constant', () => {
    expect(typeof DEFAULT_PREFIX_LENGTH).toBe('number');
    expect(DEFAULT_PREFIX_LENGTH).toBe(3);
  });

  test('exports DEFAULT_SUFFIX_LENGTH constant', () => {
    expect(typeof DEFAULT_SUFFIX_LENGTH).toBe('number');
    expect(DEFAULT_SUFFIX_LENGTH).toBe(3);
  });
});

describe('Edge Cases and Stress Tests', () => {
  test('handles strings with only special characters', () => {
    const result = obscureString('!@#$%^&*()');
    expect(result).toMatch(/^!\@#\*+\(\)$/);
  });

  test('handles strings with mixed content', () => {
    const result = obscureString('Test123!@#');
    expect(result).toBe('Tes****@#');
  });

  test('handles zero suffix length', () => {
    const result = obscureString('test', { prefixLength: 2, suffixLength: 0 });
    expect(result).toBe('te**');
  });

  test('handles zero prefix length', () => {
    const result = obscureString('test', { prefixLength: 0, suffixLength: 2 });
    expect(result).toBe('**st');
  });

  test('handles both zero prefix and suffix', () => {
    const result = obscureString('test', { prefixLength: 0, suffixLength: 0 });
    expect(result).toBe('****');
  });

  test('maintains performance with repeated cache hits', () => {
    clearCache();
    const input = 'performance-test-string';
    const options = { prefixLength: 5, suffixLength: 5 };
    
    const start = Date.now();
    for (let i = 0; i < 10000; i++) {
      obscureString(input, options);
    }
    const duration = Date.now() - start;
    
    expect(duration).toBeLessThan(100); // Should be very fast with caching
  });

  test('handles alternating patterns efficiently', () => {
    const results = [];
    for (let i = 0; i < 100; i++) {
      results.push(obscureString('test' + (i % 2), { prefixLength: i % 3 }));
    }
    expect(results.length).toBe(100);
  });
});

describe('Backward Compatibility', () => {
  test('maintains backward compatibility with v1 API', () => {
    // Old API should still work
    const result = obscureString('mysecretkey');
    expect(result).toBe('mys*****key');
  });

  test('default options match v1 behavior', () => {
    const result = obscureString('teststring', {});
    expect(result).toBe('tes****ing');
  });

  test('non-string input returns empty string like v1', () => {
    expect(obscureString(null)).toBe('');
    expect(obscureString(undefined)).toBe('');
    expect(obscureString(123)).toBe('');
  });
});
