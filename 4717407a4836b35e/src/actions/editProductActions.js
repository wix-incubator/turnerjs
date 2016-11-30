import _ from 'lodash/fp';

import * as CONSTANTS from '../utils/constants';
import * as productActionTypes from '../actionTypes/productActionTypes'
import * as CollectionActions from '../actions/collectionsActions';
import * as ProductsService from '../services/productsServices';

import ProductScheme from '../schema/ProductScheme';
import CqrsCommandBuilder from  '../utils/builders/CqrsCommandsBuilder';
import GUIDGenerator from '../utils/GUIDGenerator';

import { prodCollections } from '../selectors/productSelectors';
import { getDataByScheme, generateEmptyDataByScheme} from '../utils/builders/CloneByScheme';
import { deleteProduct } from '../utils/transformers/cqrsCommands';
import { changeDeepProperty } from '../utils/builders/DeepPropertyChanger';
import { getVariants } from '../selectors/productSelectors';


const autochange = {
    'price': [{
        field: 'discount.value',
        val: 0
    }],
    //'inventory.trackingMethod': [{
    //        field: 'inventory.quantity',
    //        val(parentValue, parentKey, baseProduct, editedProduct) {
    //            return editedProduct.inventory.quantity
    //              || baseProduct.inventory.quantity
    //              || 1;
    //        }
    //    }, {
    //        field: 'inventory.status',
    //        val: 'in_stock'
    //    } , {
    //        field: 'managedProductItems',
    //        val(parentValue, parentKey, baseProduct) {
    //            if (baseProduct.manageProductItems === 'enabled') {
    //                if (parentValue === 'status') return {};
    //                else {
    //                    return _.compose(
    //                      variants => variants.reduce((a, n, i) => (a[i] = n, a),{}),
    //                      _.map(i => _.omit('description')(i)),
    //                      _.values
    //                    )(getVariants(baseProduct, {quantity:1, status: 'in_stock'}));
    //                }
    //            } else {
    //                return baseProduct.managedProductItems
    //            }
    //        }
    //    }]
};

const getEditCommandsQueue = (prop, value, baseProduct, editedProduct) => {
    return _.compose(
      ...(autochange[prop] || []).map(({field, val}) => changeDeepProperty(field, _.isFunction(val) ? val(value, prop, baseProduct, editedProduct) : val)),
      changeDeepProperty(prop, value)
    )
};

export function initEditProduct(product) {
    return async function (dispatch, getState) {
        dispatch({
            type: productActionTypes.EDITOR_SETUP,
            product: getDataByScheme(ProductScheme, product)
        });
    }
}

export function resetEditProduct() {
    return async function (dispatch, getState) {
        const { products: { product } } = getState();


        dispatch({
            type: productActionTypes.EDITOR_SETUP,
            product: getDataByScheme(ProductScheme, product)
        });
    }
}

export function createNewProduct(){
    return (dispatch, getState) => {

        const {collections: {selectedCollection, collections}} = getState();

        let product = generateEmptyDataByScheme(ProductScheme, ['media', 'collections']);
        let _collections = [];
        if (selectedCollection !== CONSTANTS.DEFAULT_COLLECTION) {
            _collections = [_.omit('productIds')(collections[selectedCollection])]
        }

        dispatch({
            type: productActionTypes.PRODUCT_DETAILS,
            product: product
        });

        dispatch({
            type: productActionTypes.NEW_PRODUCT_CREATED
        });

        dispatch({
            type: productActionTypes.EDITOR_SETUP,
            product: _.compose(
                changeDeepProperty('collections', _collections),
                changeDeepProperty('id', GUIDGenerator())
            )(product)
        });
    }
}

export function getCommands(state, edProduct, _product){
    const {
        editProduct: { editedProduct },
        products: { product }
    } = state;

    return editedProduct && product ? CqrsCommandBuilder(
        product,
        edProduct || editedProduct,
        ProductScheme
    ) : null;
}

export function onChangeProperty(prop, value, autoSave){
    return async function (dispatch, getState) {
        const {
          editProduct: {editedProduct},
          products: { product }
        } = getState();

        const _editedProduct = getEditCommandsQueue(prop, value, product, editedProduct)(editedProduct);

        dispatch({
            type: productActionTypes.EDITOR_CHANGE_PROPERTY,
            editedProduct: _editedProduct
        });

        if (autoSave) {
            await saveProduct(dispatch, getState(), getCommands(getState(), _editedProduct), _editedProduct)
        }
    }
}

async function saveProduct(dispatch, state, commands, editedProduct){
    dispatch({type: productActionTypes.PRODUCT_DETAILS_UPDATING});
    try {
        if (commands.length) {
            await ProductsService.executeCommands(state.session || {}, commands, editedProduct.id);

            !state.products.product.id && dispatch(CollectionActions.addToDefault(editedProduct.id));
            dispatch(CollectionActions.addProductIntoCollection(commands, editedProduct.id));
        }

        dispatch({
            type: productActionTypes.PRODUCT_DETAILS_UPDATED,
            product: getDataByScheme(ProductScheme, editedProduct)
        });
    } catch (e) {
        dispatch({type: productActionTypes.PRODUCT_DETAILS_UPDATING_FAILED});
    }
}

export function saveEditedProduct() {
    return async function (dispatch, getState) {
        const {editProduct: {editedProduct}} = getState();
        await saveProduct(dispatch, getState(), getCommands(getState()), editedProduct);
    }
}

export function onDeleteProduct(){
    return async function (dispatch, getState) {
        const {session, editProduct: {editedProduct}} = getState();

        dispatch({type: productActionTypes.PRODUCT_DETAILS_UPDATING, isUpdating: true});

        try {
            await ProductsService.executeCommands(session || {}, [deleteProduct()], editedProduct.id);

            dispatch({type: productActionTypes.PRODUCT_SELECTED_DELETED, productID: editedProduct.id});

        } catch (e) {
            dispatch({type: productActionTypes.PRODUCT_SELECTED_DELETE_FAILED});
        }
    }
}