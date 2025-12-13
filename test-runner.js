#!/usr/bin/env node

/**
 * Simple test runner to verify basic functionality without Jest
 */

const {
  obscureString,
  obscureStringAsync,
  obscureStringBatch,
  clearCache,
  getCacheStats,
  MAX_INPUT_LENGTH,
  DEFAULT_MASK_CHAR
} = require('./src/index.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✓ ${name}`);
    passed++;
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    failed++;
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`${message || 'Assertion failed'}: expected "${expected}", got "${actual}"`);
  }
}

function assertThrows(fn, message) {
  try {
    fn();
    throw new Error(`${message || 'Expected to throw'}: but did not throw`);
  } catch (error) {
    if (error.message.startsWith('Expected to throw')) {
      throw error;
    }
    // Success - it threw as expected
  }
}

console.log('Running basic functionality tests...\n');

// Basic tests
test('Basic masking with defaults', () => {
  const result = obscureString('mysecretkey');
  assertEqual(result, 'mys*****key', 'Default masking');
});

test('Custom prefix/suffix', () => {
  const result = obscureString('teststring', { prefixLength: 2, suffixLength: 2 });
  assertEqual(result, 'te******ng', 'Custom prefix/suffix');
});

test('Custom mask character', () => {
  const result = obscureString('secret', { maskChar: '#', prefixLength: 2, suffixLength: 2 });
  assertEqual(result, 'se##et', 'Custom mask char');
});

test('Empty string input', () => {
  const result = obscureString('');
  assertEqual(result, '', 'Empty string');
});

test('Non-string input returns empty', () => {
  assertEqual(obscureString(null), '', 'Null input');
  assertEqual(obscureString(undefined), '', 'Undefined input');
  assertEqual(obscureString(123), '', 'Number input');
});

test('String too short to mask', () => {
  const result = obscureString('short', { prefixLength: 3, suffixLength: 3 });
  assertEqual(result, 'short', 'Too short');
});

// Validation tests
test('Throws on negative prefixLength', () => {
  assertThrows(
    () => obscureString('test', { prefixLength: -1 }),
    'Negative prefix'
  );
});

test('Throws on empty maskChar', () => {
  assertThrows(
    () => obscureString('test', { maskChar: '' }),
    'Empty maskChar'
  );
});

test('Throws on prefix + suffix exceeding length', () => {
  assertThrows(
    () => obscureString('test', { prefixLength: 3, suffixLength: 3 }),
    'Combined length too long'
  );
});

// Advanced features
test('Percentage-based masking', () => {
  const result = obscureString('1234567890', { percentage: 50 });
  const maskCount = (result.match(/\*/g) || []).length;
  assertEqual(maskCount, 5, 'Percentage masking');
});

test('Email pattern masking', () => {
  const result = obscureString('user@example.com', { pattern: 'email' });
  if (!result.includes('@example.com')) {
    throw new Error('Email pattern failed');
  }
});

test('Phone pattern masking', () => {
  const result = obscureString('1234567890', { pattern: 'phone' });
  if (!result.endsWith('7890')) {
    throw new Error('Phone pattern failed');
  }
});

// Batch processing
test('Batch processing', () => {
  const results = obscureStringBatch(['test1', 'test2', 'test3']);
  if (results.length !== 3) {
    throw new Error('Batch length mismatch');
  }
});

test('Batch with invalid inputs', () => {
  const results = obscureStringBatch(['valid', null, 'another']);
  assertEqual(results[0], 'valid', 'First item');
  assertEqual(results[1], '', 'Null item');
  assertEqual(results[2], 'another', 'Third item');
});

// Cache tests
test('Cache stats', () => {
  clearCache();
  obscureString('test1');
  const stats = getCacheStats();
  if (stats.size === 0) {
    throw new Error('Cache should have entries');
  }
  if (typeof stats.maxSize !== 'number') {
    throw new Error('maxSize should be a number');
  }
});

test('Clear cache', () => {
  obscureString('test');
  clearCache();
  const stats = getCacheStats();
  assertEqual(stats.size, 0, 'Cache should be empty');
});

// Constants
test('Constants are exported', () => {
  if (typeof MAX_INPUT_LENGTH !== 'number') {
    throw new Error('MAX_INPUT_LENGTH not exported');
  }
  if (typeof DEFAULT_MASK_CHAR !== 'string') {
    throw new Error('DEFAULT_MASK_CHAR not exported');
  }
});

// Async test
test('Async obscureString', async () => {
  const result = await obscureStringAsync('teststring');
  assertEqual(result, 'tes****ing', 'Async result');
});

// Unicode test
test('Unicode handling', () => {
  const result = obscureString('café☕test');
  if (result.length === 0) {
    throw new Error('Unicode handling failed');
  }
});

// Performance test
test('Performance - 1000 operations', () => {
  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    obscureString('teststring' + i);
  }
  const duration = Date.now() - start;
  if (duration > 1000) {
    throw new Error(`Too slow: ${duration}ms for 1000 operations`);
  }
});

// Large string test
test('Large string handling', () => {
  const largeString = 'a'.repeat(10000);
  const result = obscureString(largeString);
  assertEqual(result.length, largeString.length, 'Large string length');
});

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(50));

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\n✓ All tests passed!');
  process.exit(0);
}
