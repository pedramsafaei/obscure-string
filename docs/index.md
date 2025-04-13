# obscure-string

A tiny utility for masking the middle of strings. Perfect for redacting secrets, emails, or tokens.

## Example

```js
import { obscureString } from 'obscure-string';

obscureString('mysecretkey'); // → 'mys*****key'
```
