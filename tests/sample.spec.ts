import { OneDice } from '../src/onedice';

describe('Sample test.', () => {
  const onedice = new OneDice({
    valueDict: {
      foo: 50,
      bar: 60,
    },
    random: () => 0.99999,
  });
  it('should eval', () => {
    expect(onedice.eval('1+1')).toBe(2);
    expect(onedice.eval('1+2*2')).toBe(5);
    expect(onedice.eval('1+2*(2+3)')).toBe(11);
  });

  it('should roll dice', () => {
    expect(onedice.eval('1d1')).toBe(1);
    expect(onedice.eval('1d2')).toBe(2);
    expect(onedice.eval('2d3')).toBe(6);
    expect(onedice.eval('2d3+1')).toBe(7);
    expect(onedice.eval('2d3+4d(5*2)')).toBe(46);
    expect(onedice.eval('d6')).toBe(6);
    expect(onedice.eval('d6+d6')).toBe(12);
    expect(onedice.eval('1d+d6+d6')).toBe(18);
  });

  it('should pass onedice tests', () => {
    expect(onedice.eval('((1-1>2)|(1-1<2))?(1+1):(1-2)')).toBe(2);
    expect(onedice.eval('7d5f')).toBe(35);
  });
});
