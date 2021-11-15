import { br2ln } from '~/utils';

describe('HTML breakline to new line', () => {
  it('replaces breakline elements with no spaces', () => {
    const actual = br2ln('hello<br/>there');
    expect(actual).toEqual('hello\nthere');
  });

  it('replaces breakline elements with spaces', () => {
    const actual = br2ln('hello<br  />there');
    expect(actual).toEqual('hello\nthere');
  });

  it('returns string with no breaklines', () => {
    const actual = br2ln('hello there');
    expect(actual).toEqual('hello there');
  });

  it('handles null', () => {
    const actual = br2ln(null);
    expect(actual).toEqual(null);
  });

  it('handles undefined', () => {
    const actual = br2ln(undefined);
    expect(actual).toEqual(undefined);
  });
});
