import * as types from '../actionTypes/posActionsTypes';

import * as ProductsService from '../services/productsServices';
import * as PosService from '../services/posService';
import _ from 'lodash';
import getInventoryStatus from '../utils/getInventoryStatus';


export function createCartWithAdditionalPrice(amount) {
  return async function (dispatch, getState) {
    dispatch({type: types.POS_CART_RESET});

    try {
      let cart = await PosService.createCartCommand(getState().session);
      cart = await PosService.setAdditionalPrice(getState().session, cart.cartSummary.cartId, amount);
      dispatch({type: types.POS_REWRITE_CART, cart: cart.cartSummary});
    } catch (e) {
      console.log(e);
    }
  }
}

export function createCartFromLocalCart() {
  return async function (dispatch, getState) {
    dispatch({type: types.POS_CART_RESET});

    let selectedProducts = getState().pos.localCart.map(product => ({
      productId: product.productId,
      optionsSelections: product.optionsSelections,
      quantity: product.quantity
    }));

    try {
      const cart = await PosService.addCartItemsCommand(getState().session, selectedProducts);
      dispatch({type: types.POS_REWRITE_CART, cart: cart.cartSummary});
    } catch (e) {
      console.log(e);
    }
  }
}

export function setAdditionalPrice(amount) {
  return async function (dispatch, getState) {
    dispatch({type: types.POS_UPDATING_CART});
    try {
      const cart = await PosService.setAdditionalPrice(getState().session, getState().pos.cart.cartId, amount);

      const newCart = await PosService.setMerchantDiscount(getState().session, cart.cartSummary.cartId, 0);
      dispatch({type: types.POS_REWRITE_CART, cart: newCart});
    } catch (e) {
      console.log(e);
    }
  }
}

export function setMerchantDiscount(amount) {
  return async function (dispatch, getState) {
    dispatch({type: types.POS_UPDATING_CART});
    try {
      const cart = await PosService.setMerchantDiscount(getState().session, getState().pos.cart.cartId, amount);
      dispatch({type: types.POS_REWRITE_CART, cart: cart});
    } catch (e) {
      console.log(e);
    }
  }
}

export function createOrder() {
  return async function (dispatch, getState) {
    dispatch({type: types.POS_CREATING_ORDER});
    try {
      const order = await PosService.createOrder(
        getState().session,
        getState().pos.cart.cartId,
      );


      console.log(order);

      dispatch({type: types.POS_CREATE_ORDER, orderId: order.payload});
    } catch (e) {
      console.log(e);
    }
  }
}

export function createOrderWithAdditionalPrice(amount) {
  return async function (dispatch, getState) {
    dispatch({type: types.POS_CREATING_ORDER});
    dispatch({type: types.POS_CART_RESET});
    try {
      let cart = await PosService.createCartCommand(getState().session);
      cart = await PosService.setAdditionalPrice(getState().session, cart.cartSummary.cartId, amount);
      dispatch({type: types.POS_REWRITE_CART, cart: cart.cartSummary});
      const order = await PosService.createOrder(
        getState().session,
        cart.cartSummary.cartId,
      );
      dispatch({type: types.POS_CREATE_ORDER, orderId: order.payload});
    } catch (e) {
      console.log(e);
    }
  }
}

export function payment(params) {
  return async function (dispatch, getState) {
    try {
      dispatch({type: types.POS_SUCCESS_PAYMENT, details: params});
    } catch (e) {
      console.log(e);
    }
  }
}

export function finishOrder(paymentMethodTxId) {
  return async function (dispatch, getState) {
    try {
      console.log('finish', getState().session,
        getState().pos.orderId,
        paymentMethodTxId);
      const order = await PosService.finishOrder(
        getState().session,
        getState().pos.orderId,
        paymentMethodTxId
      );
      
      //dispatch({type: types.POS_ORDER_CREATED, order: res});
      //dispatch({type: types.POS_CREATE_ORDER, order: order.payload});
    } catch (e) {
      console.log(e);
    }
  }
}

export function setNameAndEmailToOrder(name, email) {
  return async function (dispatch, getState) {
    try {
      const order = await PosService.addBillingAddress(
        getState().session,
        getState().pos.orderId,
        name, email
      );

      //dispatch({type: types.POS_ORDER_CREATED, order: res});
      //dispatch({type: types.POS_CREATE_ORDER, order: order});
    } catch (e) {
      console.log(e);
    }
  }
}

export function sendEmail(name, email) {
  return async function (dispatch, getState) {
    try {
      const order1 = await PosService.addBillingAddress(
        getState().session,
        getState().pos.orderId,
        name, email
      );
      const order2 = await PosService.sendNotificationAboutOrder(
        getState().session,
        getState().pos.orderId
      );

      //dispatch({type: types.POS_ORDER_CREATED, order: res});
      //dispatch({type: types.POS_CREATE_ORDER, order});
    } catch (e) {
      console.log(e);
    }
  }
}

export function addProductToLocalCart(productId, quantity = 1, optionsSelections = [], variantSurcharge = 0) {
  return function (dispatch, getState) {
    let localCart = getState().pos.localCart;
    let index = _.findIndex(localCart, (item) => {
      return _.isEqual(
        {productId: item.productId, optionsSelections: item.optionsSelections},
        {productId, optionsSelections}
      )
    });

    let product = getState().products.products[productId];
    let inventoryStatus = getInventoryStatus(product.inventory, product.managedProductItemsSummary);
    
    let newQuantity = !!~index && !optionsSelections.length ? localCart[index].quantity + quantity : quantity;
    newQuantity = Math.min(newQuantity, product.inventory.trackingMethod === 'quantity' ? inventoryStatus.quantity : 99999);

    if (newQuantity === 0) {
      return;
    }
    
    let newCart = !!~index ? [
      ...localCart.slice(0, index),
      {productId, quantity: newQuantity, optionsSelections, variantSurcharge},
      ...localCart.slice(index + 1)
    ] : [...localCart, {productId, quantity, optionsSelections, variantSurcharge}];

    return dispatch({type: types.POS_UPDATE_LOCAL_CART, localCart: newCart});
  }
}

export function removeProductFromLocalCart(productId, optionsSelections = []) {
  return function (dispatch, getState) {
    let localCart = getState().pos.localCart;
    let index = _.findIndex(localCart, (item) => {
        return _.isEqual(
          {productId: item.productId, optionsSelections: item.optionsSelections},
          {productId, optionsSelections}
        )
      }
    );

    let newCart = [
      ...localCart.slice(0, index),
      ...localCart.slice(index + 1)
    ];

    return dispatch({type: types.POS_UPDATE_LOCAL_CART, localCart: newCart});
  }
}

export function removeProductFromCart(cartItemId) {
  return async function (dispatch, getState) {
    dispatch({type: types.POS_UPDATING_CART});
    const cart = getState().pos.cart;
    let optimisticCart = {
      ...cart,
      isOptimistic: true,
      items: _.filter(cart.items, (item) => item.cartItemId !== cartItemId)
    };
    dispatch({type: types.POS_REWRITE_CART_LOCALLY, cart: optimisticCart});
    try {
      const cartP = await PosService.removeCartItemCommand(getState().session, cart.cartId, cartItemId);
      const newCart = await PosService.setMerchantDiscount(getState().session, cart.cartId, 0);
      dispatch({type: types.POS_REWRITE_CART, cart: newCart});
    } catch (e) {
      dispatch({type: types.POS_REWRITE_CART, cart: cart});
      console.log(e);
    }
  }
}

export function getDetailedProduct(productId) {
  return async function (dispatch, getState) {
    dispatch({type: types.POS_LOADING_PRODUCT});
    try {
      let product = await ProductsService.getDetailedProduct(getState().session || {}, productId);
      dispatch({type: types.POS_LOADED_PRODUCT, product});
    } catch (e) {
      console.log(e);
      dispatch({type: types.POS_LOAD_PRODUCT_FAILED});
    }
  }
}

export function resetCart() {
  return function (dispatch, getState) {
    return dispatch({type: types.POS_CART_RESET});
  }
}

export function resetPOS() {
  return function (dispatch, getState) {
    return dispatch({type: types.POS_RESET});
  }
}

