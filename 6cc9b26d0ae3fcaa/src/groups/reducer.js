import * as types from './actionTypes';
import immutable from 'seamless-immutable';
import _ from 'lodash';

export const initialState = immutable({});

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_COUNT_FOR_GROUP:
      return handleSetCountForGroup(state, action);
    case types.DECREASE_COUNT_FOR_GROUP:
      return handleDecreaseCountForGroup(state, action);
    default:
      return state;
  }
}

function handleSetCountForGroup(state, action) {
  return state.setIn([action.group], action.count);
}

function handleDecreaseCountForGroup(state, action) {
  const count = _.get(state, [action.group]);
  let newCount = 0;
  if (count) {
    newCount = count - 1;
  }
  return state.setIn([action.group], newCount);
}
