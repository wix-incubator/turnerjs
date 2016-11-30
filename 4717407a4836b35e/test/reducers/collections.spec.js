import collections from '../../src/reducers/collections';
import * as types from '../../src/actionTypes/collectionsActionTypes';

const aCollection = (id, name, productIds) => ({id, name, productIds});

describe('Collections reducer', () => {

  it('should return initial state', () => {
    const initial = {
      isListLoading: false,
      collections: undefined,
      selectedCollection: '00000000-000000-000000-000000000001'
    };
    expect(collections(undefined, {})).toEqual(initial);
  });

  describe('should handle COLLECTIONS_LIST action', () => {

    it('from initial state', () => {
      expect(collections(undefined, {
        type: types.COLLECTIONS_LIST,
        collections: [aCollection('123', '123', ['123']), aCollection('234', '234', ['234'])]
      })).toEqual({
        isListLoading: false,
        collections: {'123': aCollection('123', '123', ['123']), '234': aCollection('234', '234', ['234'])},
        selectedCollection: '00000000-000000-000000-000000000001'
      });
    });

    it('should change list loading status', () => {
      expect(collections({
        isListLoading: true,
        collections: undefined,
        selectedCollection: '00000000-000000-000000-000000000001'
      }, {
        type: types.COLLECTIONS_LIST,
        collections: [aCollection('123', '123', ['123'])]
      })).toEqual({
        isListLoading: false,
        collections: {'123': aCollection('123', '123', ['123'])},
        selectedCollection: '00000000-000000-000000-000000000001'
      });
    });

    describe('from existing state', () => {
      it('if selected collection exists in new list', () => {
        expect(collections({
          isListLoading: false,
          collections: undefined,
          selectedCollection: '234'
        }, {
          type: types.COLLECTIONS_LIST,
          collections: [aCollection('123', '123', ['123']), aCollection('234', '234', ['234'])]
        })).toEqual({
          isListLoading: false,
          collections: {'123': aCollection('123', '123', ['123']), '234': aCollection('234', '234', ['234'])},
          selectedCollection: '234'
        });
      });

      it('if selected collection doesn\'t exist in new list', () => {
        const initialSelectedCollection = '00000000-000000-000000-000000000001';
        expect(collections({
          isListLoading: false,
          collections: {'123': aCollection('123', '123', ['123']), '234': aCollection('234', '234', ['234'])},
          selectedCollection: '234'
        }, {
          type: types.COLLECTIONS_LIST,
          collections: [aCollection('123', '123', ['123']), aCollection('345', '345', ['345'])]
        })).toEqual({
          isListLoading: false,
          collections: {'123': aCollection('123', '123', ['123']), '345': aCollection('345', '345', ['345'])},
          selectedCollection: initialSelectedCollection
        });
      });
    });
  });

  it('should handle COLLECTIONS_LIST_LOADING action', () => {
    expect(collections(undefined, {
      type: types.COLLECTIONS_LIST_LOADING
    })).toEqual({
      isListLoading: true,
      collections: undefined,
      selectedCollection: '00000000-000000-000000-000000000001'
    });
  });

  it('should handle COLLECTIONS_SELECT_COLLECTION action', () => {
    expect(collections(undefined, {
      type: types.COLLECTIONS_SELECT_COLLECTION,
      collection: '111'
    })).toEqual({
      isListLoading: false,
      collections: undefined,
      selectedCollection: '111'
    });
  });

  it('should handle COLLECTIONS_LIST_FETCHING_FAILED action', () => {
    expect(collections({
      isListLoading: true,
      collections: undefined,
      selectedCollection: '234'
    }, {
      type: types.COLLECTIONS_LIST_FETCHING_FAILED
    })).toEqual({
      isListLoading: false,
      collections: undefined,
      selectedCollection: '234'
    });
  });

  describe('should handle COLLECTIONS_ADD_PRODUCT action', () => {
    it('shuold add product to default collection', () => {



    });

    it('shuold add product to collection', () => {

      const someState = {
        collections: {
          '123': aCollection('123', '123', ['123', '275']),
          '2433': aCollection('2433', '2433', ['123']),
          '33': aCollection('33', '33', ['123', '275']),
        }
      };

      const productId = '275';
      const commands = [
        {name: 'RemoveProductFromCategory', data: {categoryId: 33}},
        {name: 'AddProductToCategory', data: {categoryId: 2433}}
      ];

      expect(collections(someState, {
        type: types.COLLECTIONS_ADD_PRODUCT,
        commands: commands, productId: productId
      })).toEqual({
        collections: {
          '33': aCollection('33', '33', ['123']),
          '123': aCollection('123', '123', ['123', '275']),
          '2433': aCollection('2433', '2433', ['275', '123']),
        }
      });

    });
  });

  it('should return old state on others actions', () => {
    const someState = {
      isListLoading: true,
      collections: {'123': aCollection('123', '123', ['123'])},
      selectedCollection: '00000000-000000-000000-000000000001'
    };
    expect(collections(someState, {type: 'UNREAL_ACTION'})).toEqual(someState);
  });

});