import _ from 'lodash/fp'
import * as CONSTANTS from '../utils/constants';
import {numberFormat} from 'underscore.string';

export const formatPrice = (
    price, {
        currencyFractionSize = 2,
        currencyDecimalSeparator = '.',
        currencyGroupSeparator = ','
    }) => numberFormat(
        price,
        currencyFractionSize,
        currencyDecimalSeparator,
        currencyGroupSeparator
);


export const salePrice = ({editProduct: {editedProduct}}) => (
    !editedProduct.discount.value ? '' : ( editedProduct.discount.mode === 'PERCENT'
    ? ( editedProduct.price - (editedProduct.price * (editedProduct.discount.value/100)) )
    : editedProduct.price - editedProduct.discount.value )
);

export const prodCollections = (product, collections) => !product || !collections
    ? []
    : _.compose(
        _.map(c => _.omit('productIds')(c)),
        _.filter(({productIds}) => !!~productIds.indexOf(product.id)),
        _.values,
        _.omit(CONSTANTS.DEFAULT_COLLECTION)
    )(collections);


export const media = ({editProduct: {editedProduct}, products: {product}}) => {
    return editedProduct || product ?
        !editedProduct ? product.media : editedProduct.media
        : []
};


export const getInventoryStatus = product => {

    const _inv = product.inventory;
    const _mp = product.manageProductItems === 'enabled'
        ? product.managedProductItemsSummary || getManagedProductItemsSummary(product)
        : undefined;

    return {
        quantity: _inv.quantity,
        ...(_mp ? {
            status: _mp.productItemsCount === 0 || (_mp.productItemsCount - _mp.inStockProductItemsCount > 0) ? (_mp.inStockProductItemsCount ? 'partially_out_of_stock' : 'out_of_stock') : 'in_stock',
            showStatus: true
        } : {
            status: (_inv.trackingMethod === 'quantity' && _inv.quantity === 0 || _inv.status === 'out_of_stock') ? 'out_of_stock' : 'in_stock',
            showStatus: !(_inv.trackingMethod === 'quantity' && _inv.quantity !== 0 )
        })
    };
};

const combinations = arr => {
    let acc = arr.map(i => [i]);
    const func = nextArr => !nextArr
        ? acc
        : (acc = nextArr.reduce((acc1, i) => [...acc1, ...acc.reduce((acc2, j) => [...acc2, [...j, i]], [])],[]), func);

    return func;
};

export const getVariants = (product, options = {quantity: 0, status: 'in_stock'}) => {
    return !product.options.options.length ? []: product.options.options.reduce((acc, option) => acc(option.selections), combinations)()
        .map(variant => {
            return variant.reduce((acc, option) => {
                return {
                    ...acc,
                    optionsSelections: [
                        ...acc.optionsSelections,
                        option.id
                    ],
                    description: [
                        ...acc.description,
                        option.description
                    ]
                }
            }, {
                optionsSelections: [],
                description: [],
                visibility: "visible"
            });
        }).reduce((acc, opt, ind) => {
            let variantOptions = (_.find({optionsSelections: opt.optionsSelections})(product.managedProductItems) || {});

            return {
                ...acc,
                [ind]: {
                    ...opt,
                    inventory: variantOptions.inventory || {status: options.status, quantity: options.quantity},
                    visibility: variantOptions.visibility || "visible"
                }
            }
        }, {});
};

export const getManagedProductItemsSummary = product => {

    let variants = getVariants(product);

    let { trackingMethod } = product.inventory;

    let visibleVariants = _.filter({visibility: 'visible'})(variants);


    return {
        inStockProductItemsCount: _.keys(visibleVariants).length -
        (
            (
                _.groupBy(
                    variant => trackingMethod === 'status'
                        ? variant.inventory.status
                        : variant.inventory.quantity
                )(visibleVariants)
            )[
                trackingMethod === 'status' ? 'out_of_stock' : 0
                ] || []
        ).length,
        productItemsCount: _.keys(visibleVariants).length
    }
};
