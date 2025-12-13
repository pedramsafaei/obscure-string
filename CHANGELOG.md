# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.0] - 2025-12-13

### 🚀 Major Performance & Security Release

#### ⚡ Performance Optimizations
- Optimized string operations for 2-3x performance improvement on large strings
- Smart algorithm selection based on string size (< 100 chars vs > 100 chars)
- Reduced memory allocations and improved concatenation efficiency
- Batch processing optimized for handling thousands of strings efficiently

#### 🛡️ Enhanced Security
- **DoS Protection**: Added `maxLength` option (default: 1,000,000 chars) to prevent memory exhaustion
- **Input Validation**: Comprehensive validation for all parameters with type checking
- **Safe Error Handling**: Errors never expose sensitive information
- **Injection-Safe**: Safely handles XSS, SQL injection, path traversal, and other malicious patterns
- **Unicode-Safe**: Proper handling of emojis, multi-byte characters, and special characters

#### ✨ New Features
- **`fullMask`**: Option to mask entire string
- **`reverseMask`**: Show middle, hide edges (useful for token prefixes)
- **`percentage`**: Mask a specific percentage of the string (0-100)
- **`minMaskLength`**: Require minimum masked characters
- **Smart Presets**: Built-in patterns for `email`, `creditCard`, and `phone`
- **`obscureStringBatch()`**: Efficiently mask multiple strings at once
- **`getMaskInfo()`**: Preview masking without actually applying it

#### 🧪 Testing
- Added 100+ comprehensive test cases
- Performance benchmarks for different string sizes
- Security edge case testing (XSS, injection, DoS)
- Unicode and special character handling tests
- Stress tests with very large strings

#### 📚 Documentation
- Complete API reference with examples
- Performance characteristics and benchmarks
- Security guarantees and best practices
- Comparison with alternatives
- Migration guide for v1.x users

#### 🔄 Breaking Changes
- Numbers and booleans are now coerced to strings (v1.x returned empty string)
- Added validation that throws errors for invalid options (v1.x silently failed)
- Export now includes `obscureStringBatch` and `getMaskInfo` functions

#### 🐛 Bug Fixes
- Fixed handling of empty strings
- Improved edge case handling for very short strings
- Fixed unicode character handling in masks

### [1.0.7](https://github.com/pedramsafaei/obscure-string/compare/v1.0.6...v1.0.7) (2025-04-14)

### [1.0.6](https://github.com/pedramsafaei/obscure-string/compare/v1.0.5...v1.0.6) (2025-04-13)

### [1.0.5](https://github.com/pedramsafaei/obscure-string/compare/v1.0.4...v1.0.5) (2025-04-13)

### [1.0.4](https://github.com/pedramsafaei/obscure-string/compare/v1.0.3...v1.0.4) (2025-04-13)

### [1.0.3](https://github.com/pedramsafaei/obscure-string/compare/v1.0.2...v1.0.3) (2025-04-13)

### 1.0.2 (2025-04-13)
