import * as types from '../actionTypes/orderActionTypes';
import * as OrdersService from '../services/ordersService';
import { ModuleRegistry } from 'a-wix-react-native-framework';

export function loadOrders(session) {
    return async (dispatch, getState) => {
        dispatch({type: types.ORDER_LIST_LOADING, isListLoading: true});
        try {
            let orderList = await OrdersService.getOrderList(session ? {session} : (getState().session || {}));
            dispatch({type: types.ORDER_LIST, orders: orderList.payload.orders})
        } catch (e) {
            console.log(e);
            dispatch({type: types.ORDER_LIST_LOADING_FAILED})
        }
    }
}

export function loadOrderDetails(orderId) {
    return async function (dispatch, getState) {
        dispatch({type: types.ORDER_DETAILS_LOADING});
        try {
            let order = await OrdersService.getDetailedOrder(getState().session || {}, orderId);

            //console.log('Order Data', order);

            dispatch({type: types.ORDER_DETAILS, order: order.payload});
        } catch (e){
            console.log(e);
            dispatch({type: types.ORDER_DETAILS_LOADING_FAILED});
        }
    };
}

export function markOrderAsPaid(orderId) {
    return async function(dispatch, getState) {
        dispatch({type: types.ORDER_DETAILS_LOADING});
        try {
            await OrdersService.markOrderAsPaid(getState().session || {}, orderId);
            dispatch({type: types.ORDER_MARK_AS_PAID, orderId: orderId});
            ModuleRegistry.notifyListeners('feed.ManualRefresh');
        } catch(e) {
            dispatch({type: types.ORDER_HISTORY_CHANGE_FAILED});
        }
    }
}

export function markOrderAsPaidAndFulfilled(orderId) {
    return async function(dispatch, getState) {
        dispatch({type: types.ORDER_DETAILS_LOADING});
        try {
            await OrdersService.markOrderAsPaid(getState().session || {}, orderId);
            await OrdersService.changeOrderShippingStatus(getState().session || {}, orderId, 'fulfilled');
            dispatch({type: types.ORDER_MARK_AS_PAID, orderId: orderId});
            dispatch({type: types.ORDER_HISTORY_CHANGED, orderId: orderId, status: 'fulfilled'});
            ModuleRegistry.notifyListeners('feed.ManualRefresh');
        } catch(e) {
            dispatch({type: types.ORDER_HISTORY_CHANGE_FAILED});
        }
    }
}

export function markOrderAsRead(order) {
    return async function(dispatch, getState) {
        try {
            let res = await OrdersService.markOrderAsRead(getState().session || {}, order.id);
            if (res.payload && res.payload.success) {
                dispatch({type: types.ORDER_UPDATED, order: {...order, isNew: false}});
            } else {
                dispatch({type: types.ORDER_UPDATING_FAILED});
            }
        } catch(e) {
            dispatch({type: types.ORDER_UPDATING_FAILED});
        }
    }
}

export function changeOrderShippingStatus(orderId, status) {
    return async function(dispatch, getState) {
        dispatch({type: types.ORDER_DETAILS_LOADING});
        try {
            await OrdersService.changeOrderShippingStatus(getState().session || {}, orderId, status);
            dispatch({type: types.ORDER_HISTORY_CHANGED, orderId: orderId, status});
        } catch (e) {
            console.log(e);
            dispatch({type: types.ORDER_HISTORY_CHANGE_FAILED});
        }
    }
}

export function refreshOrders(){
    return function (dispatch) {
        return dispatch({type: types.ORDER_LIST_REFRESH});
    }
}

export function resetOrder() {
    return function (dispatch) {
        return dispatch({type: types.ORDER_RESET});
    }
}

export function contactBuyer(type, address){
    return function (dispatch) {
        dispatch({
            type: type === 'call' ? types.ORDER_CONTACT_BUYER_CALL : types.ORDER_CONTACT_BUYER_EMAIL
        });
    }
}

export function orderSearch(searchString) {
    return {
        type: types.ORDER_SEARCH,
        searchString
    }
}
