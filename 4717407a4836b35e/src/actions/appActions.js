import * as types from '../actionTypes/appActionTypes';
import * as Store from '../services/storeServices';
import * as productActions from './productActions';
import * as orderActions from './orderActions';
import * as collectionActions from  './collectionsActions';

export function updateStoreSettings(session) {
  return async function(dispatch) {
    let settings = await Store.getStoreSettings({session});
    return dispatch({ type: types.STORE_SETTINGS, settings });
  };
}

export function updateConnectionStatus(connectionStatus) {
  return function(dispatch) {
    return dispatch({ type: types.OFFLINE_MODE, connectionStatus });
  };
}

export function setAppAsFailed(isFailed, reloadLists) {
  return {
    type: types.IS_FAILED,
    isFailed,
    reloadLists: !!reloadLists
  }
}

export function search(searchString) {
  return {
    type: types.SEARCH,
    searchString
  }
}


export function loadAllData() {
  return async function(dispatch, getState) {
    await dispatch(orderActions.loadOrders());
    await dispatch(productActions.loadProducts());
    await dispatch(collectionActions.loadCollections());
  };
}

export function refreshAllData(activeScreen) {
  return async function(dispatch, getState) {

    if (!activeScreen) {
      await dispatch(orderActions.refreshOrders());
      await dispatch(productActions.refreshProducts());
    } else {
      await dispatch(productActions.refreshProducts());
      await dispatch(orderActions.refreshOrders());
    }
    await dispatch(collectionActions.loadCollections());

  };
}
