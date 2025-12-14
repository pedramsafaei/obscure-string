const {
  obscureString,
  obscureStringBatch,
  getMaskInfo,
} = require('../src');

describe('obscureString - Basic Functionality', () => {
  test('masks the middle with default settings', () => {
    const result = obscureString('mysecretkey');
    expect(result).toBe('mys******ey');
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
    expect(obscureString('short', { prefixLength: 3, suffixLength: 3 })).toBe(
      'short'
    );
  });

  test('returns empty string for non-string input', () => {
    expect(obscureString(null)).toBe('');
    expect(obscureString(undefined)).toBe('');
  });
});

describe('obscureString - Enhanced Input Validation', () => {
  test('handles null gracefully', () => {
    expect(obscureString(null)).toBe('');
  });

  test('handles undefined gracefully', () => {
    expect(obscureString(undefined)).toBe('');
  });

  test('coerces numbers to strings', () => {
    expect(obscureString(12345)).toBe('12345'); // Too short
    expect(obscureString(1234567890)).toBe('123*****90');
  });

  test('coerces booleans to strings', () => {
    expect(obscureString(true)).toBe('true'); // Too short
    expect(obscureString(false)).toBe('false'); // Too short
  });

  test('handles empty string', () => {
    expect(obscureString('')).toBe('');
  });

  test('handles string with only whitespace', () => {
    expect(obscureString('   ')).toBe('   '); // Too short with default settings
    expect(obscureString('        ', { prefixLength: 2, suffixLength: 2 })).toBe(
      '  ****  '
    );
  });

  test('handles very long strings', () => {
    const longString = 'a'.repeat(10000);
    const result = obscureString(longString);
    expect(result.length).toBe(10000);
    expect(result.startsWith('aaa')).toBe(true);
    expect(result.endsWith('aa')).toBe(true);
    expect(result.slice(3, -2)).toBe('*'.repeat(9995));
  });

  test('throws error for strings exceeding maxLength', () => {
    const longString = 'a'.repeat(1000);
    expect(() => obscureString(longString, { maxLength: 500 })).toThrow(
      RangeError
    );
    expect(() => obscureString(longString, { maxLength: 500 })).toThrow(
      /exceeds maximum allowed length/
    );
  });

  test('validates maskChar is non-empty string', () => {
    expect(() => obscureString('test', { maskChar: '' })).toThrow(TypeError);
    expect(() => obscureString('test', { maskChar: null })).toThrow(TypeError);
    expect(() => obscureString('test', { maskChar: 123 })).toThrow(TypeError);
  });

  test('validates numeric parameters are positive integers', () => {
    expect(() => obscureString('test', { prefixLength: -1 })).toThrow(
      TypeError
    );
    expect(() => obscureString('test', { suffixLength: -1 })).toThrow(
      TypeError
    );
    expect(() => obscureString('test', { minMaskLength: -1 })).toThrow(
      TypeError
    );
    expect(() => obscureString('test', { prefixLength: 1.5 })).toThrow(
      TypeError
    );
  });
});

describe('obscureString - Unicode & Special Characters', () => {
  test('handles unicode emojis correctly', () => {
    const result = obscureString('🔐secret🔑');
    expect(result).toBe('🔐se***t🔑');
  });

  test('handles multi-byte unicode characters', () => {
    const result = obscureString('こんにちは世界');
    expect(result).toBe('こんに**世界');
  });

  test('handles mixed unicode and ASCII', () => {
    const result = obscureString('user@例え.com');
    expect(result).toBe('use******om');
  });

  test('handles special characters', () => {
    expect(obscureString('a!b@c#d$e%f^g')).toBe('a!b********^g');
    expect(obscureString('<script>alert("xss")</script>')).toBe(
      '<sc***********************pt>'
    );
  });

  test('handles line breaks and tabs', () => {
    const result = obscureString('line1\nline2\tline3');
    expect(result.length).toBe(17);
  });

  test('handles null bytes and control characters', () => {
    const result = obscureString('test\x00data\x01end');
    expect(result.length).toBe(13);
  });
});

describe('obscureString - Security Edge Cases', () => {
  test('handles potential XSS attempts', () => {
    const xss = '<script>alert("xss")</script>';
    const result = obscureString(xss);
    expect(result).not.toContain('alert');
    expect(result.startsWith('<sc')).toBe(true);
    expect(result.endsWith('t>')).toBe(true);
  });

  test('handles SQL injection patterns', () => {
    const sql = "'; DROP TABLE users; --";
    const result = obscureString(sql);
    expect(result).toBe("'; ******************* --");
  });

  test('handles path traversal attempts', () => {
    const path = '../../etc/passwd';
    const result = obscureString(path);
    expect(result).toBe('../***********wd');
  });

  test('handles command injection attempts', () => {
    const cmd = 'test; rm -rf /';
    const result = obscureString(cmd);
    expect(result).toBe('tes********* /');
  });

  test('does not expose sensitive data in errors', () => {
    const sensitive = 'password123';
    try {
      obscureString(sensitive, { maskChar: '' });
    } catch (e) {
      expect(e.message).not.toContain('password123');
    }
  });
});

describe('obscureString - New Features: fullMask', () => {
  test('masks entire string when fullMask is true', () => {
    expect(obscureString('sensitive', { fullMask: true })).toBe('*********');
    expect(obscureString('data', { fullMask: true, maskChar: '#' })).toBe(
      '####'
    );
  });

  test('fullMask works with unicode', () => {
    expect(obscureString('🔐🔑🔒', { fullMask: true })).toBe('***');
  });
});

describe('obscureString - New Features: reverseMask', () => {
  test('shows middle and hides edges', () => {
    const result = obscureString('1234567890', {
      reverseMask: true,
      prefixLength: 2,
      suffixLength: 2,
    });
    expect(result).toBe('**345678**');
  });

  test('reverseMask with default settings', () => {
    const result = obscureString('abcdefghijk', { reverseMask: true });
    expect(result).toBe('***defghi**');
  });

  test('reverseMask with minMaskLength', () => {
    const result = obscureString('short', {
      reverseMask: true,
      prefixLength: 1,
      suffixLength: 1,
      minMaskLength: 3,
    });
    // Total masked would be 2, which is less than minMaskLength of 3
    expect(result).toBe('short');
  });
});

describe('obscureString - New Features: percentage', () => {
  test('masks by percentage', () => {
    const result = obscureString('1234567890', { percentage: 50 });
    expect(result).toBe('12*****890');
  });

  test('masks 100% by percentage', () => {
    expect(obscureString('test', { percentage: 100 })).toBe('****');
  });

  test('masks 0% by percentage', () => {
    expect(obscureString('test', { percentage: 0 })).toBe('test');
  });

  test('validates percentage range', () => {
    expect(() => obscureString('test', { percentage: -1 })).toThrow(RangeError);
    expect(() => obscureString('test', { percentage: 101 })).toThrow(
      RangeError
    );
  });
});

describe('obscureString - New Features: minMaskLength', () => {
  test('respects minMaskLength requirement', () => {
    // String: "test" (4 chars), prefix: 1, suffix: 1 = 2 masked chars
    const result = obscureString('test', {
      prefixLength: 1,
      suffixLength: 1,
      minMaskLength: 3,
    });
    // Should return original since mask length (2) < minMaskLength (3)
    expect(result).toBe('test');
  });

  test('masks when minMaskLength is met', () => {
    const result = obscureString('testing', {
      prefixLength: 1,
      suffixLength: 1,
      minMaskLength: 3,
    });
    // mask length is 5, which is >= 3
    expect(result).toBe('t*****g');
  });
});

describe('obscureString - New Features: Presets', () => {
  test('email preset', () => {
    expect(obscureString('john.doe@example.com', { preset: 'email' })).toBe(
      'jo******@example.com'
    );
    expect(obscureString('a@b.com', { preset: 'email' })).toBe('a@b.com');
    expect(obscureString('test', { preset: 'email' })).toBe('tes*');
  });

  test('creditCard preset', () => {
    expect(obscureString('4111111111111111', { preset: 'creditCard' })).toBe(
      '************1111'
    );
    expect(
      obscureString('4111-1111-1111-1111', { preset: 'creditCard' })
    ).toBe('************1111');
    expect(obscureString('123', { preset: 'creditCard' })).toBe('123'); // Too short
  });

  test('phone preset', () => {
    expect(obscureString('1234567890', { preset: 'phone' })).toBe('******7890');
    expect(obscureString('(123) 456-7890', { preset: 'phone' })).toBe(
      '******7890'
    );
    expect(obscureString('123', { preset: 'phone' })).toBe('123'); // Too short
  });

  test('preset with custom maskChar', () => {
    expect(
      obscureString('4111111111111111', {
        preset: 'creditCard',
        maskChar: '#',
      })
    ).toBe('############1111');
  });

  test('throws error for unknown preset', () => {
    expect(() =>
      obscureString('test', { preset: 'unknown' })
    ).toThrow(/Unknown preset/);
  });
});

describe('obscureStringBatch', () => {
  test('masks multiple strings', () => {
    const result = obscureStringBatch(['secret1', 'secret2', 'secret3']);
    expect(result).toEqual(['sec**t1', 'sec**t2', 'sec**t3']);
  });

  test('applies same options to all strings', () => {
    const result = obscureStringBatch(['test1', 'test2'], {
      prefixLength: 1,
      suffixLength: 1,
      maskChar: '#',
    });
    expect(result).toEqual(['t###1', 't###2']);
  });

  test('handles empty array', () => {
    expect(obscureStringBatch([])).toEqual([]);
  });

  test('handles array with mixed types', () => {
    const result = obscureStringBatch(['string', 123, null, undefined]);
    expect(result[0]).toBe('str*ng'); // With suffix=2, 'string' is long enough to mask
    expect(result[1]).toBe('123'); // Too short
    expect(result[2]).toBe('');
    expect(result[3]).toBe('');
  });

  test('throws error for non-array input', () => {
    expect(() => obscureStringBatch('not-an-array')).toThrow(TypeError);
    expect(() => obscureStringBatch(null)).toThrow(TypeError);
  });
});

describe('getMaskInfo', () => {
  test('returns info for maskable string', () => {
    const info = getMaskInfo('mysecretkey');
    expect(info).toEqual({
      willBeMasked: true,
      originalLength: 11,
      maskedLength: 5,
      visibleChars: 6,
      maskedChars: 5,
      prefixLength: 3,
      suffixLength: 3,
    });
  });

  test('returns info for too-short string', () => {
    const info = getMaskInfo('short');
    expect(info).toEqual({
      willBeMasked: false,
      reason: 'string too short',
      originalLength: 5,
    });
  });

  test('returns info for null input', () => {
    const info = getMaskInfo(null);
    expect(info).toEqual({
      willBeMasked: false,
      reason: 'null or undefined input',
    });
  });

  test('returns info for empty string', () => {
    const info = getMaskInfo('');
    expect(info).toEqual({
      willBeMasked: false,
      reason: 'empty string',
    });
  });

  test('returns info for fullMask', () => {
    const info = getMaskInfo('test', { fullMask: true });
    expect(info).toEqual({
      willBeMasked: true,
      originalLength: 4,
      maskedLength: 4,
      visibleChars: 0,
      maskedChars: 4,
    });
  });

  test('returns info when minMaskLength not met', () => {
    const info = getMaskInfo('test', {
      prefixLength: 1,
      suffixLength: 1,
      minMaskLength: 5,
    });
    expect(info).toEqual({
      willBeMasked: false,
      reason: 'mask length below minimum',
      originalLength: 4,
      maskLength: 2,
      minMaskLength: 5,
    });
  });
});

describe('Performance Tests', () => {
  test('handles small strings efficiently', () => {
    const start = Date.now();
    for (let i = 0; i < 10000; i++) {
      obscureString('mysecretkey');
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });

  test('handles medium strings efficiently', () => {
    const mediumString = 'a'.repeat(1000);
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      obscureString(mediumString);
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(200); // Should complete in less than 200ms
  });

  test('handles large strings efficiently', () => {
    const largeString = 'a'.repeat(10000);
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      obscureString(largeString);
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(500); // Should complete in less than 500ms
  });

  test('batch processing is efficient', () => {
    const strings = Array(1000).fill('mysecretkey');
    const start = Date.now();
    obscureStringBatch(strings);
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in less than 100ms
  });

  test('getMaskInfo has minimal overhead', () => {
    const start = Date.now();
    for (let i = 0; i < 10000; i++) {
      getMaskInfo('mysecretkey');
    }
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(50); // Should complete in less than 50ms
  });
});

describe('Stress Tests', () => {
  test('handles extremely long strings up to maxLength', () => {
    const veryLongString = 'a'.repeat(100000);
    const result = obscureString(veryLongString);
    expect(result.length).toBe(100000);
    expect(result.startsWith('aaa')).toBe(true);
    expect(result.endsWith('aa')).toBe(true);
  });

  test('handles many repeated calls', () => {
    const inputs = [
      'test1',
      'test2',
      'test3',
      'test4',
      'test5',
      'test6',
      'test7',
      'test8',
      'test9',
      'test10',
    ];
    for (let i = 0; i < 1000; i++) {
      inputs.forEach((input) => obscureString(input));
    }
    // If we get here without errors, the stress test passed
    expect(true).toBe(true);
  });

  test('handles various unicode combinations', () => {
    const unicodeStrings = [
      '🔐🔑🔒🔓🗝️🔏',
      'Ñoño María José',
      '北京市东城区',
      'مرحبا بك',
      'שָׁלוֹם',
      '🌈🦄🎨🎭🎪',
      'Ĥéļļø Ŵøŕłď',
      'ÄäÖöÜüß',
    ];

    unicodeStrings.forEach((str) => {
      const result = obscureString(str);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  test('handles mixed content stress test', () => {
    const mixedStrings = [
      'email@example.com',
      '4111-1111-1111-1111',
      'user123!@#$%^&*()',
      '<html><body>test</body></html>',
      'line1\nline2\rline3\r\nline4',
      '\t\t\tindented\t\t\t',
      'special™©®℠',
      '1234567890',
      'ALLCAPS',
      'lowercase',
    ];

    mixedStrings.forEach((str) => {
      expect(() => obscureString(str)).not.toThrow();
    });
  });

  test('handles edge cases in options combinations', () => {
    const testCases = [
      { prefixLength: 0, suffixLength: 0 },
      { prefixLength: 100, suffixLength: 100 },
      { prefixLength: 0, suffixLength: 10 },
      { prefixLength: 10, suffixLength: 0 },
      { maskChar: '🔒' },
      { maskChar: '...', prefixLength: 1, suffixLength: 1 },
      { percentage: 25 },
      { percentage: 75 },
      { fullMask: true },
      { reverseMask: true },
      { minMaskLength: 10 },
      { maxLength: 50 },
    ];

    testCases.forEach((options) => {
      expect(() => obscureString('test string data', options)).not.toThrow();
    });
  });
});
