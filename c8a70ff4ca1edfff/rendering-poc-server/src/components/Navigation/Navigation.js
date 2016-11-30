import React from 'react';
import {Link} from 'react-router';

function Navigation() {
  return (
    <div role="navigation">
      <Link data-hook="counter-tab" to="/">Counter</Link> {' '}
      <Link data-hook="site-list-tab" to="/site-list">My Sites</Link>
    </div>
  );
}

export default Navigation;
