import {expect} from 'chai';
import counter from './counter';

describe('reducers', () => {
  describe('counter', () => {
    it('should provide the initial state', () => {
      expect(counter(undefined, {})).to.equal(0);
    });
    it('should increment counter', () => {
      expect(counter(0, {type: 'INCREMENT'})).to.equal(1);
    });
    it('should decrement counter', () => {
      expect(counter(2, {type: 'DECREMENT'})).to.equal(1);
    });
  });
});
