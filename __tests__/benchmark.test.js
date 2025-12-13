const {
  obscureString,
  obscureStringAsync,
  obscureStringBatch,
  clearCache
} = require('../src');

describe('Performance Benchmarks', () => {
  beforeEach(() => {
    clearCache();
  });

  test('benchmark: small strings (10 chars)', () => {
    const input = 'test123456';
    const iterations = 10000;
    
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      obscureString(input);
    }
    const duration = Date.now() - start;
    const opsPerSecond = Math.floor((iterations / duration) * 1000);
    
    console.log(`Small strings: ${opsPerSecond} ops/sec`);
    expect(duration).toBeLessThan(500); // Should handle 10k ops in under 500ms
  });

  test('benchmark: medium strings (100 chars)', () => {
    const input = 'a'.repeat(100);
    const iterations = 5000;
    
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      obscureString(input);
    }
    const duration = Date.now() - start;
    const opsPerSecond = Math.floor((iterations / duration) * 1000);
    
    console.log(`Medium strings: ${opsPerSecond} ops/sec`);
    expect(duration).toBeLessThan(500);
  });

  test('benchmark: large strings (10k chars)', () => {
    const input = 'a'.repeat(10000);
    const iterations = 1000;
    
    const start = Date.now();
    for (let i = 0; i < iterations; i++) {
      obscureString(input);
    }
    const duration = Date.now() - start;
    const opsPerSecond = Math.floor((iterations / duration) * 1000);
    
    console.log(`Large strings: ${opsPerSecond} ops/sec`);
    expect(duration).toBeLessThan(1000);
  });

  test('benchmark: with caching vs without', () => {
    const input = 'teststring';
    const iterations = 10000;
    
    // Without caching
    clearCache();
    const startNoCache = Date.now();
    for (let i = 0; i < iterations; i++) {
      obscureString(input + (i % 100), { cache: false });
    }
    const durationNoCache = Date.now() - startNoCache;
    
    // With caching
    clearCache();
    const startWithCache = Date.now();
    for (let i = 0; i < iterations; i++) {
      obscureString(input + (i % 100), { cache: true });
    }
    const durationWithCache = Date.now() - startWithCache;
    
    console.log(`No cache: ${durationNoCache}ms, With cache: ${durationWithCache}ms`);
    console.log(`Cache speedup: ${(durationNoCache / durationWithCache).toFixed(2)}x`);
    
    // Caching should provide some improvement
    expect(durationWithCache).toBeLessThanOrEqual(durationNoCache);
  });

  test('benchmark: batch processing', () => {
    const strings = Array.from({ length: 1000 }, (_, i) => 'string' + i);
    
    const start = Date.now();
    const results = obscureStringBatch(strings);
    const duration = Date.now() - start;
    
    console.log(`Batch 1000 strings: ${duration}ms`);
    expect(results.length).toBe(1000);
    expect(duration).toBeLessThan(200);
  });

  test('benchmark: async processing', async () => {
    const input = 'a'.repeat(50000);
    
    const start = Date.now();
    const result = await obscureStringAsync(input);
    const duration = Date.now() - start;
    
    console.log(`Async large string: ${duration}ms`);
    expect(result.length).toBe(input.length);
    expect(duration).toBeLessThan(100);
  });

  test('benchmark: pattern-specific masking', () => {
    const emails = Array.from({ length: 1000 }, (_, i) => `user${i}@example.com`);
    
    const start = Date.now();
    emails.forEach(email => obscureString(email, { pattern: 'email' }));
    const duration = Date.now() - start;
    
    console.log(`Pattern masking 1000 emails: ${duration}ms`);
    expect(duration).toBeLessThan(200);
  });

  test('memory: large string handling', () => {
    // Test that we don't create excessive intermediate objects
    const input = 'a'.repeat(100000);
    const memBefore = process.memoryUsage().heapUsed;
    
    const result = obscureString(input);
    
    const memAfter = process.memoryUsage().heapUsed;
    const memDelta = memAfter - memBefore;
    
    expect(result.length).toBe(input.length);
    // Memory increase should be reasonable (less than 10MB for 100KB string)
    expect(memDelta).toBeLessThan(10 * 1024 * 1024);
  });
});

describe('Performance Regression Tests', () => {
  test('O(n) time complexity verification', () => {
    const sizes = [100, 1000, 10000];
    const timings = [];
    
    sizes.forEach(size => {
      const input = 'a'.repeat(size);
      const iterations = Math.floor(10000 / size);
      
      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        obscureString(input, { cache: false });
      }
      const duration = Date.now() - start;
      const timePerOp = duration / iterations;
      
      timings.push({ size, timePerOp });
    });
    
    // Verify roughly linear time complexity
    // Time should grow roughly proportionally with size
    const ratio1 = timings[1].timePerOp / timings[0].timePerOp;
    const ratio2 = timings[2].timePerOp / timings[1].timePerOp;
    const sizeRatio1 = sizes[1] / sizes[0];
    const sizeRatio2 = sizes[2] / sizes[1];
    
    console.log('Time complexity ratios:', { ratio1, ratio2, sizeRatio1, sizeRatio2 });
    
    // Ratios should be somewhat proportional (within 3x for O(n))
    expect(ratio1).toBeLessThan(sizeRatio1 * 3);
    expect(ratio2).toBeLessThan(sizeRatio2 * 3);
  });

  test('consistent performance across runs', () => {
    const input = 'teststring';
    const iterations = 5000;
    const runs = 5;
    const timings = [];
    
    for (let run = 0; run < runs; run++) {
      clearCache();
      const start = Date.now();
      for (let i = 0; i < iterations; i++) {
        obscureString(input + i);
      }
      const duration = Date.now() - start;
      timings.push(duration);
    }
    
    const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
    const variance = timings.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / timings.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avg;
    
    console.log(`Performance consistency: avg=${avg}ms, stdDev=${stdDev.toFixed(2)}ms, CV=${(coefficientOfVariation * 100).toFixed(1)}%`);
    
    // Coefficient of variation should be low (< 50% for consistent performance)
    expect(coefficientOfVariation).toBeLessThan(0.5);
  });
});