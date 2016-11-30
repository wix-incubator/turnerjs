import _ from 'lodash';

import * as types from '../actionTypes/productActionTypes';
import * as appTypes from '../actionTypes/appActionTypes';

const initialState = {
  editedProduct: undefined
};

export default function editProduct(state = initialState, action = {}) {
  switch (action.type) {
    case types.EDITOR_SETUP:
      return {
        ...state,
        editedProduct: action.product
      };
    case types.EDITOR_CHANGE_PROPERTY:
      return {
        ...state,
        editedProduct: action.editedProduct
      };
    default:
      return state;
  }
}