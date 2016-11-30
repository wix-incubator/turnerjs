import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as types from '../../src/actionTypes/collectionsActionTypes';

const middlewares = [ thunk ];
const mockStore = configureMockStore(middlewares);

describe('collections actions', () => {
  let uut;
  
  beforeEach(() => {
    uut = require('proxyquire').noCallThru()(`../../src/actions/collectionsActions`, {
      '../services/collectionsService': {
        getCollectionsList: () => {
          return {
            id: '111',
            name: 'bla'
          }
        }
      }
    });
  });
  
  it('should do smth', () => {
    const expectedAction = {
      type: types.COLLECTIONS_SELECT_COLLECTION,
      collection: {
        id: '111',
        name: 'bla'
      }
    };
    const store = mockStore({ collections: [] });
    store.dispatch(uut.selectCollection({id: '111', name: 'bla'}));
      console.log(store.getActions());
    expect(uut.selectCollection({id: '111', name: 'bla'})).toEqual(expectedAction);
  });
  
});