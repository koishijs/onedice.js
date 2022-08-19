import { OneDice } from '../src/onedice';

class TestOneDice extends OneDice {
  random(min: number, max: number): number {
    return max;
  }
}

describe('Sample test.', () => {
  const onedice = new TestOneDice({
    valueDict: {
      foo: 50,
      bar: 60,
    },
  });
  it('should calculate', () => {
    expect(onedice.calculate('1+1')).toBe(2);
    expect(onedice.calculate('1+2*2')).toBe(5);
    expect(onedice.calculate('1+2*(2+3)')).toBe(11);
  });

  it('should roll dice', () => {
    expect(onedice.calculate('1d1')).toBe(1);
    expect(onedice.calculate('1d2')).toBe(2);
    expect(onedice.calculate('2d3')).toBe(6);
    expect(onedice.calculate('2d3+1')).toBe(7);
    expect(onedice.calculate('2d3+4d(5*2)')).toBe(46);
    expect(onedice.calculate('d6')).toBe(6);
    expect(onedice.calculate('d6+d6')).toBe(12);
    expect(onedice.calculate('1d+d6+d6')).toBe(18);
  });

  it('should pass onedice tests', () => {
    expect(onedice.calculate('((1-1>2)|(1-1<2))?(1+1):(1-2)')).toBe(2);
    expect(onedice.calculate('7d5f')).toBe(35);
  });
});
