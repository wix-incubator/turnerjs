import { combineReducers } from 'redux';
import session from './session';
import products from './products';
import editProduct from './editProduct';
import orders from './orders';
import app from './app';
import collections from './collections';
import pos from './pos';
import * as types from '../actionTypes/sessionActionTypes';

const combo = combineReducers({
  session,
  products,
  editProduct,
  orders,
  collections,
  pos,
  app
});

const appReducer = function(state, action){
  return combo(action.type === types.SESSION_UPDATED ? undefined : state, action);
};

export default appReducer
