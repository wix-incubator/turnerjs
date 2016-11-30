import editProduct from '../../src/reducers/editProduct';
import * as types from '../../src/actionTypes/productActionTypes';

describe('editProduct reducer', () => {
  it('should return initial state', () => {
    const initial = {editedProduct: undefined};
    expect(editProduct(undefined, {})).toEqual(initial);
  });

  //it('should handle SESSION_UPDATED action', () => {
  //  const previousState = {
  //    session: 'some session',
  //    otherValue: 'other value'
  //  };
  //  expect(session(previousState, {
  //    type: types.SESSION_UPDATED,
  //    session: 'other session'
  //  })).toEqual({
  //    session: 'other session',
  //    otherValue: 'other value'
  //  });
  //});
  //
  //it('should return old state on others actions', () => {
  //  const someState = {
  //    session: 'some session',
  //    otherValue: 'other value'
  //  };
  //  expect(session(someState, {type: 'UNREAL_ACTION'})).toEqual(someState);
  //});
});