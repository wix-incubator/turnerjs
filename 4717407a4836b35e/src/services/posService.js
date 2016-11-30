import GUID from '../utils/GUIDGenerator';
import httpFacade from '../utils/HttpFacade';
import topology from '../utils/Topology';

function formatRequestParams(sessionObject) {
  return {
    XEcomInstance: sessionObject.session.instance
  }
}

export async function createCartCommand(session) {
  let url = topology.baseUrl + topology.createCartCommand;

  return await httpFacade(url, formatRequestParams(session), 'POST', {"cartId": GUID()});
}

export async function addCartItemsCommand(session, products) {
  let url = topology.baseUrl + topology.addCartItemsCommand;

  return await httpFacade(url, formatRequestParams(session), 'POST', {"products": products});
}

export async function removeCartItemCommand(session, cartId, cartItemId) {
  let url = topology.baseUrl + topology.removeCartItemCommand;

  return await httpFacade(url, formatRequestParams(session), 'POST', {cartId, cartItemId});
}

export async function setAdditionalPrice(session, cartId, amount) {
  let url = topology.baseUrl + topology.setCartAdditionalPriceCommand;

  return await httpFacade(url, formatRequestParams(session), 'POST', {
    cartId,
    amount
  });
}

export async function setMerchantDiscount(session, cartId, amount) {
  let url = topology.baseUrl + topology.setMerchantDiscount;

  return await httpFacade(url, formatRequestParams(session), 'POST', {
    cartId: cartId,
    amount: amount,
    discountType: 'amount'
  });
}

export async function createOrder(session, cartId) {
  let url = topology.baseUrl + topology.createOrder;

  return await httpFacade(url, formatRequestParams(session), 'POST', {
    cartId
  });
}

export async function markOrderAsPaid(session, orderId, paymentMethodTxId) {
  let url = topology.baseUrl + topology.markOrderAsPaid;

  return await httpFacade(url, formatRequestParams(session), 'POST', {
    orderId,
    paymentMethodTxId
  });
}

export async function finishOrder(session, orderId, txId) {
  let url = topology.baseUrl + topology.finishOrder;

  console.log(url, orderId, txId);
  return await httpFacade(url, formatRequestParams(session), 'POST', {
    orderId,
    txId
  });
}

export async function addBillingAddress(session, orderId, fullName, email) {
  let url = topology.baseUrl + topology.addBillingAddress;
  let billingAddress = {
    country: 'UA', // to fill with merchant info
    fullName,
    addressLine1: '',
    city: 'Dnipro',
    zipCode: '',
    phoneNumber: '',
    email
  };

  return await httpFacade(url, formatRequestParams(session), 'POST', {
    orderId,
    billingAddress
  });
}

export async function sendNotificationAboutOrder(session, orderId) {
  let url = topology.baseUrl + topology.sendNotificationAboutOrder;
  return await httpFacade(url, formatRequestParams(session), 'POST', {
    orderId
  });
}