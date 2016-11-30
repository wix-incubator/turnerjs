import * as types from '../actionTypes/appActionTypes';
const initialState = {
    appFound: true,
    appLoaded: false,
    activeScreen: 0,
    isConnected: true,
    isSearch: false,
    isFailed: false,
    searchString: ''
};

export default function session(state = initialState, action = {}) {
    switch (action.type) {
        case types.APP_NOT_FOUND:
            return {
                ...state,
                appFound: false,
                appLoaded: true
            };
        case types.APP_LOADING:
            return {
                ...state,
                appLoaded: false
            };
        case types.STORE_SETTINGS:
            return {
                ...state,
                appLoaded: true,
                settings: { ...action.settings }
            };
        case types.ACTIVE_SCREEN:
            return {
                ...state,
                activeScreen: action.activeScreen
            };
        case types.OFFLINE_MODE:
            return {
                ...state,
                isConnected: action.connectionStatus
            };
        case types.IS_SEARCH:
            return {
                ...state,
                isSearch: action.isSearch
            };
        case types.SEARCH:{
            return {
                ...state,
                searchString: action.searchString,
            };
        }

        case types.IS_FAILED:
            return {
                ...state,
                isFailed: action.isFailed,
                reloadLists: action.reloadLists
            };
        default:
            return state;
    }
}
