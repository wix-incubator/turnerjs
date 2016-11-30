import * as types from '../actionTypes/sessionActionTypes';
const initialState = {};

export default function session(state = initialState, action = {}) {
  switch (action.type) {
    case types.SESSION_UPDATED:
      return {
        ...state,
        session: action.session
      };
    default:
      return state;
  }
}
