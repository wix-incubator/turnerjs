import * as types from '../actionTypes/productActionTypes';
import * as CollectionActions from '../actions/collectionsActions';

import ProductScheme from '../schema/ProductScheme';
import { getDataByScheme } from '../utils/builders/CloneByScheme';
import { prodCollections } from '../selectors/productSelectors';


import * as ProductsService from '../services/productsServices';
import GUIDGenerator from '../utils/GUIDGenerator';

export function loadProducts(session) {
    return async (dispatch, getState) => {

        dispatch({type: types.PRODUCT_LIST_LOADING, isListLoading: true});

        try {
            let productsList = await ProductsService.getProductList(session ? {session} : (getState().session || {}));
            dispatch({type: types.PRODUCT_LIST, products: productsList.products})
        } catch (e) {
            console.log(e);
            dispatch({type: types.PRODUCT_LIST_FETCHING_FAILED});
        }
    }
}

export function loadProductDetails(productID) {
    return async function (dispatch, getState) {
        dispatch({type: types.PRODUCT_DETAILS_LOADING});

        try {
            let product = await ProductsService.getDetailedProduct(getState().session || {}, productID);
            const { collections: { collections } } = getState();

            console.log('Product', product);

            dispatch({type: types.PRODUCT_DETAILS, product: getDataByScheme(ProductScheme, {
                ...{
                    ...product,
                    description: product.description
                      .replace(/<[puli]+[^\>]*\>/g, '')
                      .replace(/<\/[puli]+>/g, '\n')
                      .replace(/<[^\>]*\>/g, '')
                      .replace(/&nbsp;/g, ' ')
                      .trim(),
                },
                collections: prodCollections(product, collections)
            })});
        } catch (e) {
            console.log(e);
            dispatch({type: types.PRODUCT_DETAILS_LOADING_FAILED});
        }
    };
}

export function disableAddProduct(isEnabled){
    return {
        type: types.PRODUCT_CAN_BE_CREATED,
        isEnabled
    }
}

export function refreshProducts(){
    return function (dispatch) {
        return dispatch({type: types.PRODUCT_LIST_REFRESH});
    }
}

export function editProduct(id){
    return function (dispatch) {
        return dispatch({type: types.PRODUCT_DETAILS_EDIT_MODE, id});
    }
}