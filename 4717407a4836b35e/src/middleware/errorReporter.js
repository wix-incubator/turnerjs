import { Navigation} from 'react-native-navigation';
import httpFacade from '../utils/HttpFacade';
import * as productActionTypes from '../actionTypes/productActionTypes';
import * as sessionActionTypes from '../actionTypes/sessionActionTypes';
import * as productActions from '../actions/productActions';
import * as sessionActions from '../actions/sessionActions';
import * as orderActionTypes from '../actionTypes/orderActionTypes';
import * as orderActions from '../actions/orderActions';
import * as moduleActions from '../actions/appActions';

export default store => next => action => {
    switch (action.type) {
        case productActionTypes.PRODUCT_SELECTED_DELETE_FAILED:
        case productActionTypes.PRODUCT_DETAILS_LOADING_FAILED:
        case productActionTypes.PRODUCT_DETAILS_UPDATING_FAILED:
        case orderActionTypes.ORDER_DETAILS_LOADING_FAILED:
        case orderActionTypes.ORDER_HISTORY_CHANGE_FAILED:
        case orderActionTypes.ORDER_UPDATING_FAILED:
            store.dispatch(moduleActions.setAppAsFailed(true));
            break;
        case orderActionTypes.ORDER_LIST_LOADING_FAILED:
        case productActionTypes.PRODUCT_LIST_FETCHING_FAILED:
            store.dispatch(moduleActions.setAppAsFailed(true, true));
            break;
    }

    return next(action);
}