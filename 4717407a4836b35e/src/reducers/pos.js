import * as types from '../actionTypes/posActionsTypes';

const initialState = {
  selectedProduct: null,
  selectedProducts: {},
  localCart: [],
  cart: null,
  orderId: null,
  cartUpdating: false,
  orderCreating: false,
  successPayment: false,
  paymentDetails: null
};

export default function orders(state = initialState, action = {}) {
  switch (action.type) {
    case types.POS_INSTANTIATE:
      return {
        ...state,
        selectedProducts: {}
      };
    case types.POS_UPDATE_LOCAL_CART:
      return {
        ...state,
        localCart: action.localCart
      };
    case types.POS_LOADING_PRODUCT:
      return {
        ...state,
        selectedProduct: null
      };
    case types.POS_LOADED_PRODUCT: 
      return {
        ...state,
        selectedProduct: action.product
      };
    case types.POS_CREATE_CART:
      return {
        ...state,
        cart: action.cart
      };
    case types.POS_UPDATING_CART:
      return {
        ...state,
        cartUpdating: true
      };
    case types.POS_REWRITE_CART_LOCALLY:
      return {
        ...state,
        cart: action.cart
      };
    case types.POS_REWRITE_CART:
      return {
        ...state,
        cart: action.cart,
        cartUpdating: false
      };
    case types.POS_CREATING_ORDER:
      return {
        ...state,
        orderCreating: true
      };
    case types.POS_CREATE_ORDER:
      return {
        ...state,
        orderId: action.orderId,
        orderCreating: false
      };
    case types.POS_SUCCESS_PAYMENT:
      return {
        ...state,
        successPayment: true,
        paymentDetails: action.details
      };
    case types.POS_CART_RESET:
      return {
        ...state,
        cart: null
      };
    case types.POS_RESET:
      return {...initialState};
    default:
      return state;
  }
}