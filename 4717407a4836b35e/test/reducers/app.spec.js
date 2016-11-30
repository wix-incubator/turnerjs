import app from '../../src/reducers/app';
import * as types from '../../src/actionTypes/appActionTypes';


describe('Collections reducer', () => {

  it('should return initial state', () => {
    const initial = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: false,
      isFailed: false,
      searchString: ''
    };
    expect(app(undefined, {})).toEqual(initial);
  });

  it('should handle APP_NOT_FOUND action', () => {
    const previousState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: false,
      isFailed: false,
      searchString: ''
    };
    const expectedState = {
      appFound: false,
      appLoaded: true,
      activeScreen: 0,
      isConnected: true,
      isSearch: false,
      isFailed: false,
      searchString: ''
    };
    expect(app(previousState, {
      type: types.APP_NOT_FOUND
    })).toEqual(expectedState);
  });

  it('should handle APP_LOADING action', () => {
    const previousState = {
      appFound: true,
      appLoaded: true,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: ''
    };
    const expectedState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: ''
    };
    expect(app(previousState, {
      type: types.APP_LOADING
    })).toEqual(expectedState);
  });

  it('should handle STORE_SETTINGS action', () => {
    const previousState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: ''
    };
    const expectedState = {
      appFound: true,
      appLoaded: true,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    expect(app(previousState, {
      type: types.STORE_SETTINGS,
      settings: {someSetting: 'some setting'}
    })).toEqual(expectedState);
  });

  it('should handle ACTIVE_SCREEN action', () => {
    const previousState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    const expectedState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 1,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    expect(app(previousState, {
      type: types.ACTIVE_SCREEN,
      activeScreen: 1
    })).toEqual(expectedState);
  });

  it('should handle OFFLINE_MODE action', () => {
    // TODO: should be refactored
    const previousState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    const expectedState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: false,
      isSearch: true,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    expect(app(previousState, {
      type: types.OFFLINE_MODE,
      connectionStatus: false
    })).toEqual(expectedState);
  });

  it('should handle IS_SEARCH action', () => {
    const previousState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: false,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    const expectedState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    expect(app(previousState, {
      type: types.IS_SEARCH,
      isSearch: true
    })).toEqual(expectedState);
  });

  it('should handle SEARCH action', () => {
    const previousState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    const expectedState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: 'search string',
      settings: {someSetting: 'some setting'}
    };
    expect(app(previousState, {
      type: types.SEARCH,
      searchString: 'search string'
    })).toEqual(expectedState);
  });

  it('should handle IS_FAILED action', () => {
    const previousState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    const expectedState = {
      appFound: true,
      appLoaded: false,
      activeScreen: 0,
      isConnected: true,
      isSearch: true,
      isFailed: true,
      reloadLists: false,
      searchString: '',
      settings: {someSetting: 'some setting'}
    };
    expect(app(previousState, {
      type: types.IS_FAILED,
      isFailed: true,
      reloadLists: false
    })).toEqual(expectedState);
  });

  it('should return old state on others actions', () => {
    const someState = {
      appFound: true,
      appLoaded: true,
      activeScreen: 1,
      isConnected: true,
      isSearch: true,
      isFailed: false,
      searchString: 'search screen'
    };
    expect(app(someState, {type: 'UNREAL_ACTION'})).toEqual(someState);
  });
});