type AnyChars<S> = S extends `${infer T}${infer U}` ? T | AnyChars<U> : never;

type OperatorParam<O> = [AnyChars<O>, number];
type OperatorRest<P extends readonly any[]> = P extends []
  ? []
  : P extends readonly [infer O, ...infer R]
  ? [OperatorParam<O>, ...OperatorRest<R>]
  : never;

export class Operator<P extends readonly string[] = readonly string[]> {
  constructor(
    public sym: P,
    public priority: number,
    public calculate: (first: number, ...rest: OperatorRest<P>) => number,
  ) {}

  prepareParams(chars: string[], numbers: number[]): OperatorRest<P>;
  prepareParams(chars: string[], numbers: number[]) {
    const result = this.sym.map((s) => {
      const pos = chars.findIndex((char) => s.includes(char));
      if (pos === -1) {
        return [];
      }
      return [chars[pos], numbers[pos]];
    });
    return result;
  }

  doCalculation(first: number, chars: string[], numbers: number[]) {
    return this.calculate(first, ...this.prepareParams(chars, numbers));
  }
}
