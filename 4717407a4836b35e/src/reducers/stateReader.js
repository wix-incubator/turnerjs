export function getSettings(state) {
  return state.app.settings;
}

export function isConnected(state) {
  return state.app.isConnected;
}

export function getAppLoadingStatus(state) {
  return state.app.appLoaded;
}
export function getIsSearchStatus(state) {
  return state.app.isSearch;
}

export function getSearchString(state) {
  return state.app.searchString;
}

export function getAppExistingStatus(state) {
  return state.app.appFound;
}

export function getActiveScreen(state) {
  return state.app.activeScreen;
}

export function getSession(state) {
  return state.session.session;
}

export function getProducts(state) {
  return state.products.products;
}

export function getProductListUpdateStatus(state) {
  return state.products.isListLoading;
}

export function getProduct(state) {
  return state.products.product;
}

export function getEditedProduct(state) {
  return state.editProduct.editedProduct;
}


export function getNewProductIds(state) {
  return state.products.newProductIds;
}

export function getProductUpdateStatus(state) {
  return state.products.isUpdating;
}

export function getProductListRefreshStatus(state) {
  return state.products.isListRefreshing;
}

export function getProductSavingStatus(state) {
  return state.products.isSaving;
}

export function getProductMedia(state) {
  return state.media.media
}

export function getProductMediaChanges(state) {
  return state.media.changes
}

export function getOrders(state) {
  return state.orders.orders;
}

export function getOrder(state) {
  return state.orders.order;
}
export function getOrderListUpdateStatus (state){
  return state.orders.isListLoading;
}
export function getOrderListRefreshStatus(state) {
  return state.orders.isListRefreshing;
}

export function getOrderUpdateStatus(state) {
  return state.orders.isUpdating;
}
export function getOrderSavingStatus(state) {
  return state.orders.isSaving;
}

export function getCollectionsListUpdateStatus(state) {
  return state.collections.isListLoading;
}

export function getCollections(state) {
  return state.collections.collections;
}
export function getSelectedCollection(state) {
  return state.collections.selectedCollection;
}

export function isProductFailed(state) {
  return state.products.isFailed;
}

export function isOrderFailed(state) {
  return state.orders.isFailed;
}

export function getOrderSearchString(state) {
  return state.orders.searchString;
}
