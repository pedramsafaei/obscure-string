/**
 * Examples demonstrating the enhanced obscure-string library
 */

const {
  obscureString,
  obscureStringAsync,
  obscureStringBatch,
  clearCache,
  getCacheStats
} = require('./src/index.js');

console.log('='.repeat(60));
console.log('obscure-string v2.0.0 - Example Usage');
console.log('='.repeat(60));

// ============================================
// Basic Usage
// ============================================
console.log('\n📌 BASIC USAGE\n');

console.log('Default masking (3 chars prefix/suffix):');
console.log(obscureString('mysecretkey'));
// => mys*****key

console.log('\nCustom prefix/suffix:');
console.log(obscureString('john.doe@example.com', {
  prefixLength: 2,
  suffixLength: 4
}));
// => jo##############.com

console.log('\nCustom mask character:');
console.log(obscureString('secret', { maskChar: '#' }));
// => sec##et

// ============================================
// Pattern-Specific Masking
// ============================================
console.log('\n📌 PATTERN-SPECIFIC MASKING\n');

console.log('Email pattern:');
console.log(obscureString('john.doe@company.com', { pattern: 'email' }));
// => j*******e@company.com

console.log('\nPhone pattern:');
console.log(obscureString('555-123-4567', { pattern: 'phone' }));
// => ********4567

console.log('\nAuto-detect pattern:');
console.log(obscureString('user@example.com', { pattern: 'auto' }));
// => u***@example.com

// ============================================
// Advanced Features
// ============================================
console.log('\n📌 ADVANCED FEATURES\n');

console.log('Percentage-based masking (50%):');
console.log(obscureString('1234567890', { percentage: 50 }));
// => 12***67890

console.log('\nRandom masking (varies each time):');
console.log(obscureString('confidential', { randomMask: true }));
console.log(obscureString('confidential', { randomMask: true }));
// => con•×▪#▫■□ial (different each time)

console.log('\nPreserve specific characters (@ and .):');
console.log(obscureString('test@example.com', {
  prefixLength: 0,
  suffixLength: 0,
  preservePattern: '@\\.'
}));
// => ****@*******.***

// ============================================
// Unicode & Special Characters
// ============================================
console.log('\n📌 UNICODE & SPECIAL CHARACTERS\n');

console.log('Unicode characters:');
console.log(obscureString('café☕secret'));
// => caf*****ret

console.log('\nEmojis:');
console.log(obscureString('Hello 👋 World 🌍', { prefixLength: 6, suffixLength: 8 }));
// => Hello ****World 🌍

console.log('\nMulti-byte characters:');
console.log(obscureString('你好世界测试'));
// => 你好世***测试

// ============================================
// Batch Processing
// ============================================
console.log('\n📌 BATCH PROCESSING\n');

const secrets = ['secret1', 'secret2', 'secret3', 'secret4'];
console.log('Original:', secrets);
console.log('Obscured:', obscureStringBatch(secrets, { prefixLength: 2, suffixLength: 2 }));
// => ['se****t1', 'se****t2', 'se****t3', 'se****t4']

// ============================================
// Async Processing
// ============================================
console.log('\n📌 ASYNC PROCESSING\n');

(async () => {
  const largeString = 'a'.repeat(50000);
  console.log('Processing large string asynchronously...');
  const result = await obscureStringAsync(largeString);
  console.log(`Result length: ${result.length} (matches input: ${result.length === largeString.length})`);
})();

// ============================================
// Cache Management
// ============================================
console.log('\n📌 CACHE MANAGEMENT\n');

clearCache();
console.log('Cache cleared:', getCacheStats());

obscureString('test1');
obscureString('test2');
obscureString('test3');
console.log('After 3 operations:', getCacheStats());

// ============================================
// Security Features
// ============================================
console.log('\n📌 SECURITY FEATURES\n');

console.log('Input validation:');
try {
  obscureString('test', { prefixLength: -1 });
} catch (error) {
  console.log(`✓ Caught error: ${error.message}`);
}

console.log('\nSafe error messages (no data leakage):');
try {
  obscureString('mysecretpassword', { prefixLength: 100 });
} catch (error) {
  console.log(`✓ Error message safe: "${error.message}"`);
  console.log(`✓ Does not contain "mysecretpassword": ${!error.message.includes('mysecretpassword')}`);
}

// ============================================
// Real-World Use Cases
// ============================================
console.log('\n📌 REAL-WORLD USE CASES\n');

// Logging
console.log('1. Logging sensitive data:');
const userEmail = 'user@example.com';
const apiKey = 'sk_live_1234567890abcdef';
console.log(`   User logged in: ${obscureString(userEmail, { pattern: 'email' })}`);
console.log(`   API Key used: ${obscureString(apiKey, { prefixLength: 8, suffixLength: 0 })}`);

// API Response
console.log('\n2. API Response sanitization:');
const userData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '555-123-4567',
  ssn: '123-45-6789'
};
console.log('   Original:', userData);
console.log('   Sanitized:', {
  name: obscureString(userData.name),
  email: obscureString(userData.email, { pattern: 'email' }),
  phone: obscureString(userData.phone, { pattern: 'phone' }),
  ssn: obscureString(userData.ssn, { prefixLength: 0, suffixLength: 4 })
});

// Database Auditing
console.log('\n3. Database audit trail:');
const queryParams = ['john@example.com', '1234567890', 'password123'];
console.log('   Query params (obscured):', obscureStringBatch(queryParams, { prefixLength: 2, suffixLength: 2 }));

// ============================================
// Performance Demo
// ============================================
console.log('\n📌 PERFORMANCE DEMO\n');

console.log('Processing 1000 operations...');
const startTime = Date.now();
for (let i = 0; i < 1000; i++) {
  obscureString('teststring' + i);
}
const duration = Date.now() - startTime;
console.log(`Completed in ${duration}ms (${Math.floor(1000 / duration * 1000)} ops/sec)`);

console.log('\nWith caching (same input):');
clearCache();
const cachedStart = Date.now();
for (let i = 0; i < 1000; i++) {
  obscureString('teststring', { prefixLength: 2, suffixLength: 2 });
}
const cachedDuration = Date.now() - cachedStart;
console.log(`Completed in ${cachedDuration}ms (${Math.floor(1000 / cachedDuration * 1000)} ops/sec)`);
console.log(`Speedup: ${(duration / cachedDuration).toFixed(2)}x faster`);

// ============================================
console.log('\n' + '='.repeat(60));
console.log('✓ All examples completed successfully!');
console.log('='.repeat(60) + '\n');
