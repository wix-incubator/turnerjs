import _ from 'lodash';

import * as types from '../actionTypes/productActionTypes';
import * as appTypes from '../actionTypes/appActionTypes';

import { changeDeepProperty } from '../utils/builders/DeepPropertyChanger';
import { getManagedProductItemsSummary } from '../selectors/productSelectors';

const initialState = {
    products: undefined,
    product: undefined,
    isUpdating: false,
    isListLoading: false,
    isListRefreshing: false,
    newProductIds: [],
    isProductScreen: false,
    isSaving: false,
    isFailed: false,
    searchString: '',
    canCreateNewProduct: true
};

export default function products(state = initialState, action = {}) {
    switch (action.type) {
        case types.PRODUCT_LIST:
            return {
                ...state,
                products: transformProducts(action.products),
                isListLoading: false,
                isListRefreshing: false
            };
        case types.PRODUCT_LIST_REFRESH:{
            return {
                ...state,
                isListRefreshing: true,
                product: undefined
            };
        }
        case types.PRODUCT_LIST_LOADING:{
            return {
                ...state,
                isListLoading: true
            };
        }
        case types.PRODUCT_LIST_FETCHING_FAILED: {
            return {
                ...state,
                isListLoading: false,
                //products: {},
            };
        }

        case types.PRODUCT_DETAILS_UPDATING:
            return {
                ...state,
                isSaving: true,
                isUpdating: true
            };
        case types.PRODUCT_DETAILS_LOADING:
            return {
                ...state,
                isUpdating: true,
                isSaving: false,
                isFailed: false
            };
        case types.PRODUCT_SELECTED_DELETED:
            return {
                ...state,
                isUpdating: false,
                isSaving: false,
                canCreateNewProduct: true,
                products: _.omit( state.products, action.productID),
                product: null
            };
        case types.PRODUCT_DETAILS_UPDATED:
            return {
                ...state,
                product: action.product,
                isUpdating: false,
                isSaving: false,
                canCreateNewProduct: true,
                products: state.products[action.product.id] ? {
                    ...state.products,
                    [action.product.id]: updateListProduct(action.product, state.products)
                } : transformProducts([updateListProduct(action.product, state.products)].concat(_.values(state.products)))
            };
        case types.PRODUCT_DETAILS:
            return {
                ...state,
                product: action.product,
                isUpdating: false,
                isSaving: false,
                canCreateNewProduct: true
            };

        case types.PRODUCT_CAN_BE_CREATED:
            return {
                ...state,
                canCreateNewProduct: action.isEnabled
            };
        case types.PRODUCT_DETAILS_UPDATING_FAILED:
        case types.PRODUCT_SELECTED_DELETE_FAILED:
            return {
                ...state,
                isUpdating: false,
                isSaving: false
            };
        case types.PRODUCT_DETAILS_LOADING_FAILED:
            return {
              ...state,
              isUpdating: false,
              isSaving: false,
              isFailed: true
            };
        case appTypes.ACTIVE_SCREEN:
            return {
                ...state,
                product: undefined
            };
        default:
            return state;
    }
}

const transformProducts = products => products && products.length
    ? products.reduce((acc, prod) => (acc[prod.id] = prod, acc), {})
    : {};

const updateListProduct = (product, productList) => {
    return {
        ...(productList[product.id] || {
            id: product.id
        }),
        inventory: {
            quantity: product.inventory.quantity || 0,
            status: product.inventory.status || 'in_stock',
            trackingMethod: product.inventory.trackingMethod || 'status'
        },
        mediaUrl: (_.find(product.media, i => !i.index) || {}).url,
        mainMedia: {...(_.find(product.media, i => !i.index) || {})},
        discount: {
            ...product.discount
        },
        manageProductItems: product.manageProductItems,
        managedProductItemsSummary: (product.manageProductItems === 'enabled') ? getManagedProductItemsSummary(product) : undefined,
        ...[
            'price',
            'ribbon',
            'isVisible',
            'name',
        ].reduce((acc, next) => (acc[next] = product[next], acc), {})
    }

};