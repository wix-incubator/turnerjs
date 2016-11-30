/*eslint require-yield: 0*/

import * as types from './actionTypes';
import * as uploadActions from '../uploads/actions';

export function updateSession(newSession) {
  return async(dispatch, getState) => {
    const session = getState().session.session;
    // check if we really have a new session
    if (newSession !== session) {
      // save the session in our reducer
      dispatch({type: types.SET_SESSION, session: newSession});
      // handle the update
      if (newSession) {
        // session is defined, we are logged-in, let's refresh data from the server
        dispatch(uploadActions.loadPreviousUploads());
      } else {
        // session is undefined, we were logged-out (we usually delete persistent data on logout)
        dispatch(uploadActions.clearUploads());
      }
    }
  };
}
