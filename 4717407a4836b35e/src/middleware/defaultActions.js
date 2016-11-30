import httpFacade from '../utils/HttpFacade';
import * as productActionTypes from '../actionTypes/productActionTypes';
import * as sessionActionTypes from '../actionTypes/sessionActionTypes';
import * as productActions from '../actions/productActions';
import * as editProductActions from '../actions/editProductActions';
import * as sessionActions from '../actions/sessionActions';
import * as orderActionTypes from '../actionTypes/orderActionTypes';
import * as orderActions from '../actions/orderActions';
import * as moduleActions from '../actions/appActions';
import * as collectionActions from '../actions/collectionsActions';

export default store => next => action => {
    switch (action.type) {
        case productActionTypes.PRODUCT_DETAILS:
            editProductActions.initEditProduct(action.product)(store.dispatch, store.getState);
            break;
        case productActionTypes.PRODUCT_LIST_REFRESH:
            store.dispatch(productActions.loadProducts());
            break;
        case sessionActionTypes.SESSION_UPDATED:
            if (action.session) {
                store.dispatch(moduleActions.updateStoreSettings(action.session));
            }
            break;
        case orderActionTypes.ORDER_LIST_REFRESH:
            store.dispatch(orderActions.loadOrders());
            break;
        case orderActionTypes.ORDER_MARK_AS_PAID:
        case orderActionTypes.ORDER_HISTORY_CHANGED:
            store.dispatch(orderActions.loadOrderDetails(action.orderId));
            //store.dispatch(orderActions.loadOrders());
            break;
    }

    return next(action);
}
