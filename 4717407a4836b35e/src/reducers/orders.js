import _ from 'lodash';

import * as types from '../actionTypes/orderActionTypes';
import * as appTypes from '../actionTypes/appActionTypes';

const initialState = {
    orders: undefined,
    order: undefined,
    isUpdating: false,
    isSaving: false,
    isFailed: false,
    isListLoading: false,
    isListRefreshing: false,
    searchString: ''
};

const transformOrders = (orders) => {
    return orders && orders.length ? orders.reduce((acc, prod) => (acc[prod.id] = prod, acc), {}) : {};
};


export default function orders(state = initialState, action = {}) {
    switch (action.type) {
        case types.ORDER_LIST:
            return {
                ...state,
                orders: transformOrders(action.orders),
                isListLoading: false,
                isListRefreshing: false
            };
        case types.ORDER_LIST_LOADING: {
            return {
                ...state,
                isListLoading: true
            };
        }

        case types.ORDER_SEARCH:{
            return {
                ...state,
                searchString: action.searchString,
            };
        }
        case types.ORDER_LIST_REFRESH:{
            return {
                ...state,
                isListRefreshing: true,
                order: undefined
            };
        }
        case types.ORDER_UPDATED:
            return {
                ...state,
                orders: {
                    ...state.orders,
                    [action.order.id]: {
                        ...state.orders[action.order.id],
                        isNew: false
                    }
                },
                order: action.order,
                isUpdating: false,
                isSaving: false,
            };
        case types.ORDER_DETAILS:
            return {
                ...state,
                order: action.order,
                isUpdating: false,
                isSaving: false,
            };
        case types.ORDER_DETAILS_LOADING:
            return {
                ...state,
                isUpdating: true,
                isSaving: false,
                isFailed: false
            };
        case types.ORDER_MARK_AS_PAID:
            return {
                ...state,
                orders: {
                    ...state.orders,
                    [action.orderId]: {
                        ...state.orders[action.orderId],
                        billingInfo: {
                            ...state.orders[action.orderId].billingInfo,
                            status: 'paid'
                        }
                    }
                },
                order: {
                    ...state.order,
                    billingInfo: {
                        ...state.order.billingInfo,
                        status: "paid"
                    }
                },
                isSaving: true,
            };
        case types.ORDER_HISTORY_CHANGED:
            return {
                ...state,
                orders: {
                    ...state.orders,
                    [action.orderId]: {
                        ...state.orders[action.orderId],
                        shippingInfo: {
                            ...state.orders[action.orderId].shippingInfo,
                            status: action.status
                        }
                    }
                },
                order: {
                    ...state.order,
                    shippingInfo: {
                        ...state.order.shippingInfo,
                        status: action.status
                    }
                },
                isSaving: true
            };

        case types.ORDER_LIST_LOADING_FAILED:
            return {
                ...state,
                isListLoading: false,
                //orders: {}
            };
        case types.ORDER_UPDATING_FAILED:
        case types.ORDER_HISTORY_CHANGE_FAILED:
            return {
                ...state,
                isUpdating: false,
                isSaving: false
            };
        case types.ORDER_DETAILS_LOADING_FAILED:
            return {
                ...state,
                isUpdating: false,
                isSaving: false,
                isFailed: true
            };
        case types.ORDER_RESET:
            return {
                ...state,
                order: undefined
            };
        case appTypes.ACTIVE_SCREEN:
            return {
                ...state,
                order: undefined
            };
        default:
            return state;
    }
}


