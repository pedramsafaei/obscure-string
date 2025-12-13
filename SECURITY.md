# Security Policy

## Supported Versions

We actively maintain and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| 1.x.x   | :x:                |

## Security Features

### Input Validation

The library implements comprehensive input validation to protect against:

1. **Type Confusion Attacks**
   - Strict type checking on all inputs
   - No implicit type coercion
   - Safe handling of null/undefined

2. **Memory Exhaustion Attacks**
   - Maximum input length: 1,000,000 characters
   - Maximum mask character length: 10 characters
   - Cache size limits: 100 entries
   - No unbounded memory allocation

3. **Injection Attacks**
   - All parameters are validated and sanitized
   - No dynamic code execution
   - No use of `eval()` or similar functions

4. **Regular Expression DoS (ReDoS)**
   - Pre-compiled, safe regular expressions
   - No user-supplied regex patterns (except in `preservePattern` with validation)
   - Pattern complexity limits

### Safe Defaults

- Conservative memory limits
- Automatic cache size management
- Error messages that don't expose sensitive data
- No logging of user input

### Threat Model

**Protected Against:**
- Memory exhaustion attacks
- Type confusion vulnerabilities
- Injection attacks (command, code, SQL)
- Regular expression DoS (ReDoS)
- Information leakage through errors
- Cache overflow attacks

**Not Protected Against:**
- Physical access to memory
- Process memory dumps
- Debugger inspection
- Side-channel timing attacks (not designed for cryptographic use)

**Out of Scope:**
- This library is for data masking/obfuscation, not encryption
- Should not be used as sole security measure for highly sensitive data
- Does not protect against privileged/root access

## Best Practices

### Input Validation

```javascript
// ✅ DO: Validate input before processing
function processUserInput(input) {
  if (typeof input !== 'string' || input.length === 0) {
    throw new Error('Invalid input');
  }
  return obscureString(input);
}

// ❌ DON'T: Trust user input blindly
// const result = obscureString(userInput); // Could fail
```

### Error Handling

```javascript
// ✅ DO: Catch and handle errors properly
try {
  const obscured = obscureString(data, options);
  logger.info(`Data processed: ${obscured}`);
} catch (error) {
  logger.error('Failed to obscure data', { error: error.message });
  // error.message never contains the input data
}

// ❌ DON'T: Log sensitive data in error cases
// logger.error(`Failed for: ${data}`); // Bad!
```

### Rate Limiting

For high-volume public-facing applications:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.post('/api/obscure', limiter, (req, res) => {
  const result = obscureString(req.body.data);
  res.json({ result });
});
```

### Cache Management

```javascript
// ✅ DO: Clear cache periodically in long-running processes
setInterval(() => {
  clearCache();
}, 600000); // Every 10 minutes

// ✅ DO: Monitor cache stats
const stats = getCacheStats();
if (stats.size > stats.maxSize * 0.9) {
  console.warn('Cache nearly full');
}
```

### Sensitive Data Handling

```javascript
// ✅ DO: Use appropriate masking for data type
const email = obscureString(userEmail, { pattern: 'email' });
const phone = obscureString(userPhone, { pattern: 'phone' });
const apiKey = obscureString(apiKey, { prefixLength: 4, suffixLength: 0 });

// ✅ DO: Use random masking for enhanced privacy
const obscured = obscureString(sensitive, { randomMask: true });

// ❌ DON'T: Use for cryptographic purposes
// const encrypted = obscureString(password); // Use proper encryption!

// ❌ DON'T: Assume obscured data is reversible
// const original = unobscure(obscured); // Not possible!
```

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public issue

Security vulnerabilities should not be publicly disclosed until patched.

### 2. Email us directly

Send details to: **pedramcodes@gmail.com**

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. Response Timeline

- **24 hours**: Initial acknowledgment
- **72 hours**: Initial assessment and response
- **7 days**: Fix developed and tested (for critical issues)
- **14 days**: Fix released (for non-critical issues)

### 4. Disclosure Process

1. We will confirm the vulnerability
2. We will develop and test a fix
3. We will release a security patch
4. We will publish a security advisory
5. We will credit the reporter (unless anonymity requested)

## Security Updates

Security updates are released as:
- **Critical**: Patch version immediately (2.0.x)
- **High**: Patch within 7 days
- **Medium**: Patch within 30 days
- **Low**: Included in next minor release

Subscribe to security advisories:
- GitHub Security Advisories: [Watch this repo](https://github.com/pedramsafaei/obscure-string)
- NPM: `npm audit` will report known vulnerabilities

## Security Checklist

Before using in production:

- [ ] Validate all user input before processing
- [ ] Implement rate limiting for public APIs
- [ ] Set up error handling that doesn't leak data
- [ ] Configure cache clearing for long-running processes
- [ ] Use pattern-specific masking where appropriate
- [ ] Review security best practices in this document
- [ ] Keep library updated to latest version
- [ ] Run `npm audit` regularly
- [ ] Monitor application logs for errors
- [ ] Test with malformed/malicious input

## Security Testing

The library includes comprehensive security tests:

```bash
# Run all tests including security scenarios
npm test

# Tests include:
# - Injection attempt handling
# - Malformed input validation
# - Memory exhaustion protection
# - Error message sanitization
# - Unicode/emoji safety
# - Type coercion protection
```

## Compliance

This library can help meet requirements for:

- **GDPR**: Data minimization and privacy
- **HIPAA**: Protected Health Information (PHI) logging
- **PCI DSS**: Credit card number masking
- **SOC 2**: Audit trail obfuscation
- **General Privacy**: Sensitive data protection

**Note**: This library is a tool to help with compliance, but does not guarantee compliance on its own. Consult with legal and security teams for your specific requirements.

## Contact

- Security issues: pedramcodes@gmail.com
- General questions: [GitHub Discussions](https://github.com/pedramsafaei/obscure-string/discussions)
- Bug reports: [GitHub Issues](https://github.com/pedramsafaei/obscure-string/issues)

---

Last updated: 2025-12-13
