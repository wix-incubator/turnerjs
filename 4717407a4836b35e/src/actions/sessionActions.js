import * as types from '../actionTypes/sessionActionTypes';
import * as appTypes from '../actionTypes/appActionTypes';

const APP_DEF_ID = '1380b703-ce81-ff05-f115-39571d94dfcd';


export function updateSession(session) {
  return function(dispatch, getState) {
    if (!session) return;

    const clientSpecMap = session.clientSpecMap || {};
    const eComTpa = clientSpecMap[APP_DEF_ID] || {};
    const instance = eComTpa.instance;

    if (!instance || eComTpa.demoMode) {
      dispatch({type: types.SESSION_UPDATED});
      return dispatch({type: appTypes.APP_NOT_FOUND});
    }

    const newClientSpecMap = (getState().session.session || {}).clientSpecMap || {};
    const newEcomTpa = newClientSpecMap[APP_DEF_ID] || {};
    if (eComTpa.instanceId !== newEcomTpa.instanceId) {
      return dispatch({
        type: types.SESSION_UPDATED,
        session: {
          ...session,
          instance: session.clientSpecMap[APP_DEF_ID].instance,
          instanceId: session.clientSpecMap[APP_DEF_ID].instanceId
        }
      });
    }
  };
}

