import {combineReducers} from 'redux';

function list(state = [], action) {
  switch (action.type) {
    case 'FETCH_SITES_SUCCESS':
      return action.data;
    default:
      return state;
  }
}

function loading(state = false, action) {
  switch (action.type) {
    case 'FETCH_SITES_REQUEST':
      return true;
    case 'FETCH_SITES_ERROR':
    case 'FETCH_SITES_SUCCESS':
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  list,
  loading
});
