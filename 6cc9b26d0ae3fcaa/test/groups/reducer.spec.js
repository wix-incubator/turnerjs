require('jasmine-expect');
import * as reducer from '../../src/groups/reducer';
import * as actionTypes from '../../src/groups/actionTypes';
import immutable from 'seamless-immutable';

describe('should manage group counts', () => {
  it('should set count for groups', () => {
    const action = {
      type: actionTypes.SET_COUNT_FOR_GROUP,
      group: 123456,
      count: 10
    };
    const newState = reducer.default(reducer.initialState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      123456: 10
    });
  });

  it('should set count for groups', () => {
    const action = {
      type: actionTypes.DECREASE_COUNT_FOR_GROUP,
      group: 123456
    };
    const oldState = immutable({
      ...reducer.initialState,
      123456: 10
    });
    const newState = reducer.default(oldState, action);
    expect(newState).toEqual({
      ...reducer.initialState,
      123456: 9
    });
  });

  it('should by default give initial state', () => {
    const newState = reducer.default(undefined, {type: undefined});
    expect(newState).toEqual({
      ...reducer.initialState
    });
  });
});
