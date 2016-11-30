require('jasmine-expect');
import * as reducer from '../../src/session/reducer';
import * as actionTypes from '../../src/session/actionTypes';

describe('should set session', () => {
  it('should set session', () => {
    const action = {
      type: actionTypes.SET_SESSION,
      session: 'session-data'
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      session: 'session-data'
    });
  });

  it('should by default give initial state', () => {
    const newState = reducer.default(undefined, {type: undefined});
    expect(newState).toEqual({
      ...reducer.initialState
    });
  });
});
