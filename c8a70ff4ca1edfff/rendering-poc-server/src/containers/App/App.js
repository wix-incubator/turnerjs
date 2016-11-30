import React, {PropTypes} from 'react';
import Navigation from './../../components/Navigation/Navigation';

function App({children}) {
  return (
    <div>
      <Navigation/>
      <div>{children}</div>
    </div>
  );
}

App.propTypes = {
  children: PropTypes.element.isRequired
};

export default App;
