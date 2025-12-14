# Usage Examples

```js
import { obscureString } from 'obscure-string';

obscureString('mysecretkey');
// → 'mys******ey'

obscureString('john.doe@example.com', {
  prefixLength: 2,
  suffixLength: 4,
  maskChar: '#',
});
// → 'jo##############.com'
```
