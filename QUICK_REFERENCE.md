# Quick Reference - obscure-string v2.0.0

## Installation

```bash
npm install obscure-string
```

## Basic Usage

```javascript
const { obscureString } = require('obscure-string');

// Default: 3 chars prefix/suffix, * mask
obscureString('mysecretkey');
// => 'mys*****key'

// Custom options
obscureString('secret', {
  prefixLength: 2,
  suffixLength: 2,
  maskChar: '#'
});
// => 'se##et'
```

## API Reference

### Core Functions

| Function | Description | Example |
|----------|-------------|---------|
| `obscureString(str, opts)` | Main masking function | `obscureString('test')` |
| `obscureStringAsync(str, opts)` | Async version for large strings | `await obscureStringAsync(large)` |
| `obscureStringBatch(arr, opts)` | Process multiple strings | `obscureStringBatch(['a', 'b'])` |
| `clearCache()` | Clear internal cache | `clearCache()` |
| `getCacheStats()` | Get cache statistics | `getCacheStats()` |

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maskChar` | string | `'*'` | Mask character (max 10 chars) |
| `prefixLength` | number | `3` | Visible chars at start |
| `suffixLength` | number | `3` | Visible chars at end |
| `percentage` | number | - | Mask percentage (0-100) |
| `pattern` | string | - | `'email'`, `'phone'`, `'auto'` |
| `preservePattern` | string | - | Regex of chars to preserve |
| `randomMask` | boolean | `false` | Use random mask chars |
| `cache` | boolean | `true` | Enable caching |

### Constants

```javascript
const {
  MAX_INPUT_LENGTH,       // 1000000
  MAX_MASK_CHAR_LENGTH,   // 10
  DEFAULT_MASK_CHAR,      // '*'
  DEFAULT_PREFIX_LENGTH,  // 3
  DEFAULT_SUFFIX_LENGTH   // 3
} = require('obscure-string');
```

## Common Patterns

### Email Masking
```javascript
obscureString('user@example.com', { pattern: 'email' });
// => 'u***@example.com'
```

### Phone Masking
```javascript
obscureString('555-123-4567', { pattern: 'phone' });
// => '********4567'
```

### API Keys
```javascript
obscureString('sk_live_1234567890', { prefixLength: 8, suffixLength: 0 });
// => 'sk_live_**********'
```

### Credit Cards
```javascript
obscureString('4532-1234-5678-9010', { prefixLength: 0, suffixLength: 4 });
// => '***************9010'
```

### Percentage Masking
```javascript
obscureString('1234567890', { percentage: 50 });
// => '12***67890'
```

### Random Masking
```javascript
obscureString('confidential', { randomMask: true });
// => 'con•×▪#▫■al' (varies)
```

### Batch Processing
```javascript
obscureStringBatch(['secret1', 'secret2', 'secret3']);
// => ['sec***t1', 'sec***t2', 'sec***t3']
```

## CLI Usage

```bash
# Basic
obscure-string "mysecret"
# => mys****et

# Custom options
obscure-string "test@example.com" --pattern email
# => t***@example.com

# From stdin
echo "secret" | obscure-string --prefix 2 --suffix 2
# => se**et

# Help
obscure-string --help
obscure-string --version
```

## TypeScript

```typescript
import { obscureString, ObscureStringOptions } from 'obscure-string';

const options: ObscureStringOptions = {
  prefixLength: 3,
  suffixLength: 3,
  maskChar: '*',
  pattern: 'email'
};

const result: string = obscureString('test@example.com', options);
```

## Real-World Examples

### Logging
```javascript
logger.info(`User: ${obscureString(email, { pattern: 'email' })}`);
logger.debug(`API Key: ${obscureString(apiKey, { prefixLength: 4, suffixLength: 0 })}`);
```

### API Response
```javascript
res.json({
  email: obscureString(user.email, { pattern: 'email' }),
  phone: obscureString(user.phone, { pattern: 'phone' }),
  ssn: obscureString(user.ssn, { prefixLength: 0, suffixLength: 4 })
});
```

### Database Auditing
```javascript
const obscuredParams = obscureStringBatch(params.map(String));
auditLog.write(`Query executed with: ${obscuredParams.join(', ')}`);
```

## Error Handling

```javascript
try {
  const result = obscureString(input, options);
} catch (error) {
  // Errors never contain sensitive input data
  console.error(error.message);
}
```

## Performance Tips

```javascript
// Enable caching for repeated operations (default)
obscureString('test', { cache: true });

// Disable caching if needed
obscureString('test', { cache: false });

// Clear cache periodically in long-running processes
setInterval(() => clearCache(), 600000);

// Use batch processing for multiple strings
const results = obscureStringBatch(manyStrings);

// Use async for very large strings
const result = await obscureStringAsync(hugeString);
```

## Security Best Practices

```javascript
// ✅ DO: Validate input
if (typeof data === 'string' && data.length > 0) {
  const obscured = obscureString(data);
}

// ✅ DO: Use pattern-specific masking
const email = obscureString(email, { pattern: 'email' });

// ✅ DO: Use random masking for extra privacy
const obscured = obscureString(sensitive, { randomMask: true });

// ❌ DON'T: Log original sensitive data
// logger.info(`Secret: ${secret}`); // Bad!

// ❌ DON'T: Use for cryptography
// const encrypted = obscureString(password); // Use proper encryption!
```

## Links

- 📖 [Full Documentation](./README.md)
- 🔒 [Security Policy](./SECURITY.md)
- 📝 [Changelog](./CHANGELOG.md)
- 🐛 [Issues](https://github.com/pedramsafaei/obscure-string/issues)
- 💬 [Discussions](https://github.com/pedramsafaei/obscure-string/discussions)

## Support

- Email: pedramcodes@gmail.com
- GitHub: [@pedramsafaei](https://github.com/pedramsafaei)
- NPM: [obscure-string](https://www.npmjs.com/package/obscure-string)

---

**Made with ❤️ to keep your secrets secret.**
