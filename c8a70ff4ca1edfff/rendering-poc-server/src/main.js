import React from 'react/dist/react.min';
import ReactDOM from 'react-dom';
import ReactApp from './components/ReactApp';

var mountNode = document.getElementById('root');

ReactDOM.render( React.createElement(ReactApp,{}), mountNode );


//<script src="<%= baseStaticUrl %>main.bundle.js"></script>
