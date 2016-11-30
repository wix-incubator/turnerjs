import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';
import fetch from 'isomorphic-fetch';
import rootReducer from './../reducers';

export default function configureStore(initialState, {baseUrl}) {
  const localFetch = (url, options = {}) => {
    const isLocalUrl = /^\/($|[^\/])/.test(url);

    if (isLocalUrl) {
      return fetch(`${baseUrl}${url}`, options);
    }

    return fetch(url, options);
  };

  const middleware = [thunk.withExtraArgument({fetch: localFetch}), createLogger()];
  const store = createStore(rootReducer, initialState, applyMiddleware(...middleware));

  return store;
}
