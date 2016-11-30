import {combineReducers} from 'redux';
import counter from './counter';
import sites from './sites';

export default combineReducers({
  counter,
  sites
});
