# onedice.js

OneDice in TypeScript.

Based on [OneDice](https://github.com/OlivOS-Team/onedice) standard.

## Usage

```ts
import { OneDice } from 'onedice';

const onedice = new OneDice()

onedice.calculate('1d6')
onedice.calculate('2d3+3d4')
```

### Change Random Generator

```ts
class MyOneDice extends OneDice {
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
```

### Extend operator

```
const onedice = new OneDice()
onedice.addOperator(new Operator('+', 1, (a, [o, b]) => a + b))
```