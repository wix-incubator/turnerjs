import React from 'react';
import {Provider} from 'react-redux';
import {render} from 'react-dom';
import {Router, useRouterHistory} from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory';
import createRoutes from './routes';
import configureStore from './store/configureStore';
import fetchData from './fetch-data';

const initialState = window.__INITIAL_STATE__;
const basename = window.__BASENAME__;
const rootElement = document.getElementById('root');

const store = configureStore(initialState, {baseUrl: basename});
const history = useRouterHistory(createBrowserHistory)({basename});
const routes = createRoutes(store);

function onUpdate() {
  if (window.__INITIAL_STATE__ !== null) {
    return window.__INITIAL_STATE__ = null;
  }

  const {components, params} = this.state;

  return fetchData(store.dispatch, components, params);
}

render(
  <Provider store={store}>
    <Router history={history} onUpdate={onUpdate}>
      {routes}
    </Router>
  </Provider>,
  rootElement
);
