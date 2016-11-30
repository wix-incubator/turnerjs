import session from '../../src/reducers/session';
import * as types from '../../src/actionTypes/sessionActionTypes';

describe('session reducer', () => {
  it('should return initial state', () => {
    const initial = {};
    expect(session(undefined, {})).toEqual(initial);
  });

  it('should handle SESSION_UPDATED action', () => {
    const previousState = {
      session: 'some session',
      otherValue: 'other value'
    };
    expect(session(previousState, {
      type: types.SESSION_UPDATED,
      session: 'other session'
    })).toEqual({
      session: 'other session',
      otherValue: 'other value'
    });
  });

  it('should return old state on others actions', () => {
    const someState = {
      session: 'some session',
      otherValue: 'other value'
    };
    expect(session(someState, {type: 'UNREAL_ACTION'})).toEqual(someState);
  });
});