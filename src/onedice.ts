import { Operator } from './operator';

function range(n: number) {
  const result: number[] = [];
  for (let i = 0; i < n; i++) {
    result.push(i);
  }
  return result;
}

function minBy<T>(array: T[], iteratee: (item: T) => number) {
  let result: T = undefined;
  if (array == null) {
    return result;
  }
  let computed: number = undefined;
  for (const value of array) {
    const current = iteratee(value);
    if (
      current != null &&
      (computed === undefined ? current === current : current < computed)
    ) {
      computed = current;
      result = value;
    }
  }
  return result;
}

function maxBy<T>(array: T[], iteratee: (item: T) => number) {
  let result: T = undefined;
  if (array == null) {
    return result;
  }
  let computed: number = undefined;
  for (const value of array) {
    const current = iteratee(value);
    if (
      current != null &&
      (computed === undefined ? current === current : current > computed)
    ) {
      computed = current;
      result = value;
    }
  }
  return result;
}

function sum(array: number[]) {
  return array.reduce((a, b) => a + b, 0);
}

function lastValueOf<T>(arr: T[]) {
  return arr[arr.length - 1];
}

export interface OneDiceConfig {
  maxDiceCount?: number;
  maxDiceFaces?: number;
  valueDict?: { [key: string]: number };
}

export class OneDice {
  random(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private splitThrow(
    count: number,
    picker: (tens: number[], comparer: (ten: number) => number) => number,
  ) {
    if (count == null) {
      throw new Error('Count is required in pb.');
    }
    const first = this.random(0, 9);
    const tens = range(count + 1).map(() => this.random(0, 9));
    const tenFun = (ten: number) => (first === 0 && ten === 0 ? 10 : ten);
    const pickTen = picker(tens, tenFun);
    const combined = first + 10 * pickTen;
    return combined === 0 ? 100 : combined;
  }

  private bonusThrow(count: number) {
    return this.splitThrow(count, (tens, comparer) => minBy(tens, comparer)!);
  }

  private penaltyThrow(count: number) {
    return this.splitThrow(count, (tens, comparer) => maxBy(tens, comparer)!);
  }

  private pbThrow(count: number, mode: 'p' | 'b') {
    return mode === 'p' ? this.penaltyThrow(count) : this.bonusThrow(count);
  }

  readonly allOperatorChars = new Set<string>(['(', ')']);
  readonly operatorMap = new Map<string, Operator>();

  addOperator(operator: Operator) {
    for (const char of operator.sym[0]) {
      this.operatorMap.set(char, operator);
    }
    for (const sym of operator.sym) {
      for (const char of sym) {
        this.allOperatorChars.add(char);
      }
    }
  }

  constructor(private config: OneDiceConfig = {}) {
    this.defaultOperators.forEach((op) => this.addOperator(op));
  }

  checkDiceCount(count: number) {
    if (
      count == null ||
      count < 1 ||
      (this.config.maxDiceCount && count > this.config.maxDiceCount)
    ) {
      throw new Error(`Invalid dice count: ${count}`);
    }
  }

  checkDiceFaces(faces: number) {
    if (
      faces == null ||
      faces < 1 ||
      (this.config.maxDiceFaces && faces > this.config.maxDiceFaces)
    ) {
      throw new Error(`Invalid dice faces: ${faces}`);
    }
  }

  defaultOperators: Operator[] = [
    new Operator(['+'] as const, 2, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return a + b;
    }),
    new Operator(['-'] as const, 2, (a, [o, b]) => {
      if (b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      a ??= 0;
      return a - b;
    }),
    new Operator(['*x'] as const, 3, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return a * b;
    }),
    new Operator(['/\\'] as const, 3, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      if (b === 0) {
        throw new Error('Divided by zero.');
      }
      return Math.floor(a / b);
    }),
    new Operator(['%'] as const, 3, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      if (b === 0) {
        throw new Error('Modded by zero.');
      }
      return a % b;
    }),
    new Operator(['^'] as const, 4, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return Math.pow(a, b);
    }),
    new Operator(['&'] as const, 5, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return a & b;
    }),
    new Operator(['|'] as const, 5, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return a | b;
    }),
    new Operator(['~'] as const, 5, (a, [o, b]) => {
      if (b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      if (a == null) {
        return ~b;
      }
      return a ^ b;
    }),
    new Operator(['!'] as const, 7, (a) => {
      if (a == null) {
        throw new Error(`Invalid operands: ${a}!`);
      }
      let result = 1;
      for (let i = 2; i <= a; i++) {
        result *= i;
      }
      return result;
    }),
    new Operator(['>'] as const, 1, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return a > b ? 1 : 0;
    }),
    new Operator(['<'] as const, 1, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return a < b ? 1 : 0;
    }),
    new Operator(['='] as const, 1, (a, [o, b]) => {
      if (a == null || b == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return a === b ? 1 : 0;
    }),
    new Operator(['?', ':'] as const, 0, (a, [o, b], [v, c]) => {
      if (a == null || b == null || c == null) {
        throw new Error(`Invalid operands: ${a} ${o} ${b}`);
      }
      return a === 0 ? c : b;
    }),
    // dice
    new Operator(
      ['d', 'kq', '\x01\x02', '\x03'] as const,
      6,
      (count, [, faces], [kq, select], [pb, pbCount], [pool, min]) => {
        count ??= 1;
        faces ??= 6;
        this.checkDiceCount(count);
        this.checkDiceFaces(faces);
        let results: number[];
        if (kq && pb) {
          throw new Error(
            `Invalid operands: ${kq} and ${pb} cannot be used together`,
          );
        }
        if (pb && count) {
          results = range(count).map(() =>
            this.pbThrow(pbCount, pb === '\x01' ? 'p' : 'b'),
          );
        } else {
          results = range(count).map(() => this.random(1, faces));
        }
        if (pool && min) {
          return results.filter((r) => r >= min).length;
        }
        if (kq && select) {
          results.sort();
          if (kq === 'k') {
            results.reverse();
          }
          results = results.slice(0, select);
        }
        return sum(results);
      },
    ),
    new Operator(['pb'] as const, 6, (__, [pb, pbCount]) => {
      return this.pbThrow(pbCount, pb);
    }),
    new Operator(
      ['a', 'k', 'q', 'm'] as const,
      6,
      (count, [, addLine], [, moreThan], [, lessThan], [, faces]) => {
        faces ??= 10;
        this.checkDiceCount(count);
        this.checkDiceFaces(faces);
        if (addLine == null || addLine < 2) {
          throw new Error(`Invalid addLine: ${addLine}`);
        }
        moreThan ??= 8;
        lessThan ??= 0xffffffff;
        let totalResults: number[] = [];
        let nextCount = count;
        while (nextCount) {
          const results = range(nextCount).map(() => this.random(1, faces));
          totalResults = totalResults.concat(results);
          nextCount = results.filter((r) => r >= addLine).length;
        }
        return totalResults.filter((r) => r >= moreThan && r <= lessThan)
          .length;
      },
    ),
    new Operator(['c', 'm'] as const, 6, (count, [, addLine], [, faces]) => {
      if (addLine == null || addLine < 2) {
        throw new Error(`Invalid addLine: ${addLine}`);
      }
      faces ??= 10;
      this.checkDiceCount(count);
      this.checkDiceFaces(faces);
      const totalResults: number[][] = [];
      let nextCount = count;
      while (nextCount) {
        const results = range(nextCount).map(() => this.random(1, faces));
        totalResults.push(results);
        nextCount = results.filter((r) => r >= addLine).length;
      }
      return totalResults.length - 1 + Math.max(...lastValueOf(totalResults));
    }),
    new Operator(['f'] as const, 6, (count) => {
      count ??= 4;
      if (count < 1) {
        throw new Error(`Invalid count: ${count}`);
      }
      return sum(range(count).map(() => this.random(-1, 1)));
    }),
  ];

  private parseChain(expr: string) {
    if (this.config.valueDict) {
      for (const [key, val] of Object.entries(this.config.valueDict)) {
        const reg = new RegExp(`\\{${key}\\}`, 'g');
        expr = expr.replaceAll(reg, val.toString());
      }
    }
    const result: (string | number)[] = [];
    for (let i = 0; i < expr.length; i++) {
      const char = expr[i];
      const topResult = lastValueOf(result);
      if (char.match(/\d/)) {
        if (typeof topResult === 'number') {
          result[result.length - 1] = topResult * 10 + parseInt(char);
        } else {
          result.push(parseInt(char));
        }
      } else if (char.match(/\s/)) {
        // do nothing and simply skip
      } else if (this.allOperatorChars.has(char)) {
        const previousChar = lastValueOf(result);
        if (
          typeof previousChar === 'string' &&
          previousChar !== ')' &&
          char !== '('
        ) {
          // for missing param
          result.push(null);
        }
        const rollEscapes = {
          p: '\x01',
          b: '\x02',
          a: '\x03',
        };
        if (rollEscapes[char]) {
          // convert A(pb)B into 1d100pB
          const dChars = new Set(['k', 'q', '\x01', '\x02', '\x03']);
          let isDiceParam = false;
          let bracketCount = 0;
          for (let j = result.length - 1; j >= 0; j--) {
            const prevChar = result[j];
            if (prevChar === ')') {
              ++bracketCount;
              continue;
            }
            if (prevChar === '(') {
              if (bracketCount === 0) {
                break;
              }
              --bracketCount;
              continue;
            }
            if (
              bracketCount > 0 ||
              typeof prevChar === 'number' ||
              dChars.has(prevChar)
            ) {
              continue;
            }
            if (prevChar === 'd') {
              isDiceParam = true;
              break;
            }
            break;
          }
          if (isDiceParam) {
            result.push(rollEscapes[char]);
          } else {
            result.push(char);
          }
        } else {
          result.push(char);
        }
      } else {
        throw new Error(`Invalid character: ${char}`);
      }
    }
    const lastChar = lastValueOf(result);
    if (typeof lastChar === 'string' && lastChar !== ')') {
      // for missing param
      result.push(null);
    }
    // console.log(result);
    return result;
  }

  private isPop(currentChar: string, operatorStack: string[]) {
    if (!operatorStack.length) {
      return false;
    }
    let topOp: Operator;
    for (let i = operatorStack.length - 1; i >= 0; i--) {
      const op = operatorStack[i];
      if (op === '(') {
        break;
      }
      topOp = this.operatorMap.get(op);
      if (topOp) {
        break;
      }
    }
    const currentOp = this.operatorMap.get(currentChar);
    if (currentOp == null || topOp == null) {
      return false;
    }
    return currentOp.priority <= topOp.priority;
  }

  private handleCalculation(numberStack: number[], operatorStack: string[]) {
    // console.log('before', numberStack, operatorStack);
    const numberMiniStack: number[] = [];
    const operatorMiniStack: string[] = [];
    while (
      !(
        operatorMiniStack.length &&
        this.operatorMap.has(lastValueOf(operatorMiniStack))
      )
    ) {
      const operatorChar = operatorStack.pop();
      if (!operatorChar || operatorChar === '(') {
        throw new Error(`Invalid operator: ${operatorChar}`);
      }
      operatorMiniStack.push(operatorChar);
      numberMiniStack.push(numberStack.pop());
    }
    const firstValue = numberStack.pop();
    operatorMiniStack.reverse();
    numberMiniStack.reverse();
    // console.log('calculate', firstValue, numberMiniStack, operatorMiniStack);
    const operator = this.operatorMap.get(operatorMiniStack[0]);
    const calculated = operator.doCalculation(
      firstValue,
      operatorMiniStack,
      numberMiniStack,
    );
    // console.log('calculated', calculated);
    numberStack.push(calculated);
  }

  calculate(expr: string) {
    const chain = this.parseChain(expr);
    const numberStack: number[] = [];
    const operatorStack: string[] = [];
    for (let i = 0; i < chain.length; i++) {
      const segment = chain[i];
      if (typeof segment === 'number') {
        numberStack.push(segment);
        continue;
      }
      if (segment === null) {
        numberStack.push(segment as any);
        continue;
      }
      if (!operatorStack.length) {
        operatorStack.push(segment);
        continue;
      }
      while (this.isPop(segment, operatorStack)) {
        this.handleCalculation(numberStack, operatorStack);
      }
      if (segment === ')') {
        while (lastValueOf(operatorStack) !== '(') {
          this.handleCalculation(numberStack, operatorStack);
        }
        operatorStack.pop(); // pop out '('
      } else {
        operatorStack.push(segment);
      }
    }
    while (operatorStack.length) {
      this.handleCalculation(numberStack, operatorStack);
    }
    return numberStack[0];
  }
}
