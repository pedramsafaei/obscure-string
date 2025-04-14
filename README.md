# 🕶️ obscure-string

[![NPM Version](https://img.shields.io/npm/v/obscure-string?style=flat-square)](https://www.npmjs.com/package/obscure-string)
[![Build Status](https://img.shields.io/github/actions/workflow/status/pedramsafaei/obscure-string/ci.yml?style=flat-square)](https://github.com/pedramsafaei/obscure-string/actions)
[![License](https://img.shields.io/npm/l/obscure-string?style=flat-square)](./LICENSE)
[![Types Included](https://img.shields.io/npm/types/obscure-string?style=flat-square)](./index.d.ts)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/obscure-string?style=flat-square)](https://bundlephobia.com/result?p=obscure-string)

> A tiny utility to mask part of a string — perfect for hiding secrets, emails, API keys, and IDs. Fully customizable and zero dependencies.

---

## ✨ Features

- 🔐 Hide sensitive values in logs and UIs
- ⚙️ Customizable mask char, prefix, and suffix lengths
- 🪶 Zero dependencies (<1KB gzipped)
- 🧪 Fully tested with edge case handling
- 🧠 TypeScript definitions included
- 📦 Supports CommonJS, ESM, Node.js, bundlers
- 🖥️ CLI support coming soon

---

## 📦 Install

```bash
npm install obscure-string
# or
yarn add obscure-string
```

---

## 🚀 Quick Start

```js
const { obscureString } = require('obscure-string');

obscureString('mysecretkey');
// → 'mys*****key'

obscureString('john.doe@example.com', {
  prefixLength: 2,
  suffixLength: 4,
  maskChar: '#',
});
// → 'jo##############.com'
```

---

## ⚙️ Options

| Option         | Type     | Default | Description                         |
| -------------- | -------- | ------- | ----------------------------------- |
| `maskChar`     | `string` | `*`     | Character used for masking          |
| `prefixLength` | `number` | `3`     | Visible characters at the beginning |
| `suffixLength` | `number` | `3`     | Visible characters at the end       |

> If the input string is shorter than `prefixLength + suffixLength`, it's returned unchanged.

---

## 🧪 Examples

```js
obscureString('mysecretkey');
// → 'mys*****key'

obscureString('supersecretvalue', { prefixLength: 2, suffixLength: 2 });
// → 'su************ue'

obscureString('veryshort', { prefixLength: 5, suffixLength: 5 });
// → 'veryshort' (too short to mask)

obscureString(null);
// → '' (non-string input)

obscureString('1234567890', { prefixLength: 2, suffixLength: 2 });
// → '12******90'
```

---

## 🔠 TypeScript Support

```ts
export function obscureString(
  str: string,
  options?: {
    maskChar?: string;
    prefixLength?: number;
    suffixLength?: number;
  }
): string;
```

---

## 🧪 Running Tests

```bash
npm test
```

Uses [Jest](https://jestjs.io) for unit testing. See `__tests__/` for test cases.

---

## 🧹 Formatting

```bash
npm run format
```

Uses [Prettier](https://prettier.io) with `.prettierrc` config.

---

## 🖥️ CLI (Coming Soon)

A CLI version is planned:

```bash
npx obscure-string "my-secret-token" --prefix 2 --suffix 4 --char "#"
```

---

## 👥 Contributing

Contributions welcome!

1. 🍴 Fork the repo
2. 🛠 Create a feature branch
3. ✅ Add tests and update docs
4. 🚀 Open a pull request

---

## ✅ Roadmap

- [x] Base string masking
- [x] TypeScript support
- [x] Prettier formatting
- [x] Jest test suite
- [ ] CLI via `npx`
- [ ] GitHub Actions CI
- [ ] Optional string-type detectors (email, token, etc.)
- [ ] VSCode extension (stretch)

---

## 🧾 License

MIT © [PDR](https://github.com/pedramsafaei)

---

## 🌍 Related Packages

- [`string-mask`](https://www.npmjs.com/package/string-mask) – pattern masking (more complex)
- [`redact-pii`](https://www.npmjs.com/package/redact-pii) – automatic PII redaction
- [`common-tags`](https://www.npmjs.com/package/common-tags) – tag helpers for strings

---

Made with ❤️ to keep your secrets secret.
