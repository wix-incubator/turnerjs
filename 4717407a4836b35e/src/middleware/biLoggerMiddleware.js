import httpFacade from '../utils/HttpFacade';
import * as productActionTypes from '../actionTypes/productActionTypes';
import * as sessionActionTypes from '../actionTypes/sessionActionTypes';
import * as appActionTypes from '../actionTypes/appActionTypes';
import * as productActions from '../actions/productActions';
import * as sessionActions from '../actions/sessionActions';
import * as orderActionTypes from '../actionTypes/orderActionTypes';

import * as stateReader from '../reducers/stateReader';

import _ from 'lodash';
import biLogger, {biEvents} from '../services/biLogger.config';


const getProductForBI = function(product) {
    const hasCustomTexts = !_.isEmpty(product.customTextFields);
    const res = {
        id: product.id,
        name: product.name,
        useDescription: !!product.description,
        price_long: parseFloat(product.price) * 100000,
        visibility: product.isVisible,
        numberOfImages: product.media ? product.media.length : 0,
        ribbon: !!product.ribbon,
        type: product.discount.mode,
        discount_long: product.discountPercentRate ? parseFloat(product.discountPercentRate) * 100000 : 0,
        sku: !!product.sku,
        inventoryPolicy: product.inventory.trackingMethod,
        requireQuantity: product.inventory.trackingMethod === 'quantity',
        manageVariance: product.manageProductItems,
        numberOfInfoSection: product.additionalInfo ? product.additionalInfo.length : 0,
        options: '[]',
        weight_long: product.weight ? (parseFloat(product.weight)) : 0,
        customText: hasCustomTexts,
        customTextMandatory: hasCustomTexts ? product.customTextFields[0].isMandatory : false,
        limitCharCustomText: hasCustomTexts ? product.customTextFields[0].inputLimit : 0
    };
    if (product.options && product.options.options) {
        res.options = JSON.stringify(product.options.options
            .filter(option => {
                return option.optionType !== 'CUSTOM_TEXT'; })
            .map(option => {
                return {
                    type: option.optionType,
                    size: option.selections.length
                };
            }));
    }
    return res;
};

const getBiStatus = status => status === 'fulfilled' && status || 'not fulfilled';


export default store => next => action => {
    const currState = store.getState();
    const session = stateReader.getSession(currState);

    switch (action.type) {
        case appActionTypes.ACTIVE_SCREEN :
            biLogger.log({
                ...biEvents.TAB_CLICKED,
                storeId: session.instanceId,
                isMerchant: true,
                tabName: action.activeScreen ? 'Products' : 'Orders'
            });
            break;
        case productActionTypes.NEW_PRODUCT_CREATED:
            biLogger.log({
                ...biEvents.ADD_NEW_PRODUCT_CLICKED,
                storeId: session.instanceId,
                isMerchant: true,
                origin: 'products tab'
            });
            break;
        case productActionTypes.PRODUCT_SELECTED:
            biLogger.log({
                ...biEvents.PRODUCT_CLICKED,
                productId: action.id,
                storeId: session.instanceId,
                isMerchant: true,
                origin: 'products tab'
            });
            break;
        case productActionTypes.PRODUCT_DETAILS_EDIT_MODE:
            biLogger.log({
                ...biEvents.EDIT_PRODUCT_CLICKED,
                id: action.id
            });
            break;
        case productActionTypes.PRODUCT_DETAILS_UPDATED:
            biLogger.log({
                ...biEvents.UPDATE_PRODUCT_CLICKED,
                ...getProductForBI(action.product)
            });
            break;
        case orderActionTypes.ORDER_MARK_AS_PAID:
            biLogger.log({
                ...biEvents.ORDER_STATUS_CHANGED,
                storeId: session.instanceId,
                orderId: action.orderId,
                statustype: 'payment',
                origin: 'order page',
                oldStatus: 'not paid',
                newStatus: 'paid'
            });
            break;
        case orderActionTypes.ORDER_HISTORY_CHANGED:
            biLogger.log({
                ...biEvents.ORDER_STATUS_CHANGED,
                storeId: session.instanceId,
                orderId: action.orderId,
                statustype: 'shipping',
                origin: 'order page',
                oldStatus: getBiStatus(currState.orders.order),
                newStatus: getBiStatus(action.status)
            });
            break;
        case orderActionTypes.ORDER_CONTACT_BUYER_EMAIL:
            biLogger.log({
                ...biEvents.ORDER_CONTACT_BUYER,
                action: 'email'
            });
            break;
        case orderActionTypes.ORDER_CONTACT_BUYER_CALL:
            biLogger.log({
                ...biEvents.ORDER_CONTACT_BUYER,
                action: 'call'
            });
            break;
    }

    return next(action);
}







