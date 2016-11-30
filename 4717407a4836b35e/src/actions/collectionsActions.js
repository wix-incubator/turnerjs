import * as types from '../actionTypes/collectionsActionTypes';
import { getCollectionsList } from '../services/collectionsService';

export function loadCollections() {
    return async (dispatch, getState) => {
        dispatch({type: types.COLLECTIONS_LIST_LOADING, isListLoading: true});

        try {
            let collectionList = await getCollectionsList(getState().session || {});
            dispatch({type: types.COLLECTIONS_LIST, collections: collectionList.categories});
        } catch (e) {
            console.log(e);
            dispatch({type: types.COLLECTIONS_LIST_FETCHING_FAILED})
        }
    }
}

export function selectCollection(collection) {
    return {
        type: types.COLLECTIONS_SELECT_COLLECTION,
        collection
    }
}

export function addProductIntoCollection(commands, productId) {
    return {
        type: types.COLLECTIONS_ADD_PRODUCT,
        commands,
        productId
    }
}

export function addToDefault(productId) {
    return {
        type: types.COLLECTIONS_ADD_TO_DEFAULT,
        productId
    }
}

