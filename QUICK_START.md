# Quick Start Guide - obscure-string v2.0

## Installation

```bash
npm install obscure-string
```

## Basic Usage

```javascript
const { obscureString } = require('obscure-string');

// Simple masking
obscureString('mysecretkey');
// → 'mys*****key'

// Custom options
obscureString('john.doe@example.com', {
  prefixLength: 2,
  suffixLength: 4,
  maskChar: '#'
});
// → 'jo##############.com'
```

## Quick Examples

### Email Protection
```javascript
obscureString('support@company.com', { preset: 'email' });
// → 'su*****@company.com'
```

### Credit Card Masking
```javascript
obscureString('4111-1111-1111-1111', { preset: 'creditCard' });
// → '************1111'
```

### Phone Number
```javascript
obscureString('(555) 123-4567', { preset: 'phone' });
// → '******4567'
```

### Full Masking
```javascript
obscureString('sensitive', { fullMask: true });
// → '*********'
```

### Batch Processing
```javascript
const { obscureStringBatch } = require('obscure-string');

obscureStringBatch(['secret1', 'secret2', 'secret3']);
// → ['sec**t1', 'sec**t2', 'sec**t3']
```

## CLI Usage

```bash
# Install globally
npm install -g obscure-string

# Use directly
obscure-string "mysecret"
# → mys***et

# With options
obscure-string "john@example.com" --preset email
# → jo**@example.com

# Show help
obscure-string --help
```

## Common Patterns

### Logging Sensitive Data
```javascript
console.log('API Key:', obscureString(apiKey, { 
  prefixLength: 7, 
  suffixLength: 4 
}));
```

### API Response Sanitization
```javascript
const sanitize = (user) => ({
  ...user,
  email: obscureString(user.email, { preset: 'email' }),
  phone: obscureString(user.phone, { preset: 'phone' }),
});
```

### Conditional Masking
```javascript
const { getMaskInfo } = require('obscure-string');

const smartMask = (value) => {
  const info = getMaskInfo(value);
  return info.willBeMasked 
    ? obscureString(value)
    : obscureString(value, { fullMask: true });
};
```

## All Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maskChar` | string | `'*'` | Character to use for masking |
| `prefixLength` | number | `3` | Visible chars at start |
| `suffixLength` | number | `3` | Visible chars at end |
| `minMaskLength` | number | `0` | Min masked chars required |
| `fullMask` | boolean | `false` | Mask entire string |
| `reverseMask` | boolean | `false` | Show middle, hide edges |
| `percentage` | number | - | Mask percentage (0-100) |
| `maxLength` | number | `1000000` | Max string length |
| `preset` | string | - | Use preset pattern |

## Need More Help?

- 📖 [Full Documentation](./README.md)
- 🔄 [Migration Guide](./MIGRATION.md)
- 📝 [Changelog](./CHANGELOG.md)
- 🐛 [Report Issues](https://github.com/pedramsafaei/obscure-string/issues)

## TypeScript

```typescript
import { obscureString, type ObscureStringOptions } from 'obscure-string';

const options: ObscureStringOptions = {
  maskChar: '#',
  preset: 'email'
};

const result = obscureString('test@example.com', options);
```

---

**v2.0 Features:**
✨ Smart Presets | ⚡ 2-3x Faster | 🛡️ DoS Protection | 🌍 Unicode-Safe | 📦 Zero Dependencies
