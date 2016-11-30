import React from 'react';
import {Route, IndexRoute} from 'react-router';
import App from './containers/App/App';
import Counter from './containers/Counter/Counter';
import SiteList from './containers/SiteList/SiteList';

export default function () {
  return (
    <Route path="/" component={App}>
      <IndexRoute component={Counter}/>
      <Route path="/site-list" component={SiteList}/>
    </Route>
  );
}
