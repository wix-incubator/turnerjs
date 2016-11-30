import * as types from '../actionTypes/collectionsActionTypes';
import { DEFAULT_COLLECTION } from '../utils/constants';

const initialState = {
  isListLoading: false,
  collections: undefined,
  selectedCollection: DEFAULT_COLLECTION
};

export default function collections(state = initialState, action = {}) {
  switch (action.type) {
    case types.COLLECTIONS_LIST_LOADING:
      return {
        ...state,
        isListLoading: true
      };
    case types.COLLECTIONS_SELECT_COLLECTION:
      return {
        ...state,
        selectedCollection: action.collection
      };
    case types.COLLECTIONS_LIST:
      const newCollections =  action.collections.reduce((acc, next) => {
        acc[next.id] = next;
        return acc;
      }, {});

      return {
        ...state,
        isListLoading: false,
        collections: newCollections,
        selectedCollection:newCollections[state.selectedCollection] ? state.selectedCollection : initialState.selectedCollection
      };
    case types.COLLECTIONS_LIST_FETCHING_FAILED:
          return {
            ...state,
            isListLoading: false,
          };
    case types.COLLECTIONS_ADD_TO_DEFAULT:
      return {
        ...state,
        collections: {
          ...state.collections,
          [DEFAULT_COLLECTION] : {
            ...state.collections[DEFAULT_COLLECTION],
            productIds: [
              action.productId,
              ...state.collections[DEFAULT_COLLECTION].productIds]
          }
        },
      };
    case types.COLLECTIONS_ADD_PRODUCT:
        let removed = action.commands
            .filter(comm => comm.name === 'RemoveProductFromCategory')
            .map(c => state.collections[c.data.categoryId])
            .map(f => {
              return {
                ...f,
                productIds: f.productIds.filter(id => id !== action.productId)
              }
            }).reduce((coll, next) => (coll[next.id] = next, coll), {});


        let added = action.commands
            .filter(comm => comm.name === 'AddProductToCategory')
            .map(c => state.collections[c.data.categoryId])
            .map(f => {
              return {
                ...f,
                productIds: [action.productId, ...f.productIds]
              }
            }).reduce((coll, next) => (coll[next.id] = next, coll), {});

        return {
          ...state,
          collections: {
            ...state.collections,
            ...added,
            ...removed
          }
        };
    default:
      return state;
  }
}
