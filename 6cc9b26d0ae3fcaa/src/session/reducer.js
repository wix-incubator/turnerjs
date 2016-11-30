import * as types from './actionTypes';
import immutable from 'seamless-immutable';

export const initialState = immutable({});

export default function reduce(state = initialState, action = {}) {
  switch (action.type) {
    case types.SET_SESSION:
      return handleSetSession(state, action);
    default:
      return state;
  }
}

function handleSetSession(state, action) {
  return state.set('session', action.session);
}
