define(['lodash', 'utils', 'wixappsCore',
        'wixappsClassics/ecommerce/data/converters/cartConverter',
        'wixappsClassics/ecommerce/data/converters/shippingConverter',
        'wixappsClassics/ecommerce/util/ecomRequestBuilder',
        'wixappsClassics/ecommerce/util/ecomDataUtils',
        'wixappsClassics/ecommerce/util/responseTransformation',
        'wixappsClassics/ecommerce/util/ecomRequestSender'
    ],
    function (_, utils, /** wixappsCore */ wixapps, cartConverter, shippingConverter, ecomRequestBuilder, /** ecomDataUtils */ecomDataUtils, responseTransformation, ecomRequestSender) {
        "use strict";

        var CART_KEY = 'eCommerce_';
        var CART_ACTION_ID = 'dynamicstore_order_cart.getCart';
        var CART_LOCATION_ID = 'cart';
        var JOINED_CART_LOCATION_ID = 'joinedCart';
        var fetchingCart = [];
        var wixappsDataHandler = wixapps.wixappsDataHandler;
        var countryListCache = null;

        function getCartId(siteData) {
            return siteData.requestModel.storage.local.getItem(CART_KEY + siteData.siteId);
        }

        function isReturnFromSuccessCheckout(siteData) {
            var queryParams = siteData.currentUrl.query;
            var result = _.isArray(queryParams.f_checkoutResult) ? queryParams.f_checkoutResult[0] : queryParams.f_checkoutResult;
            var successfulCheckout = result && result === 'success';

            if (successfulCheckout) {
                delete queryParams.f_checkoutResult;
                var urlUtils = utils.urlUtils;
                urlUtils.updateUrl(urlUtils.buildFullUrl(siteData.currentUrl, true));
                return true;
            }

            return false;
        }

        function hasCart(siteData) {
            if (isReturnFromSuccessCheckout(siteData)) {
                clearCart(siteData);
            }

            return !!getCartId(siteData);
        }

        function setCartId(siteData, cartId) {
            siteData.requestModel.storage.local.setItem(CART_KEY + siteData.siteId, cartId);
        }

        function clearCart(siteData) {
            siteData.requestModel.storage.local.removeItem(CART_KEY + siteData.siteId);
        }

        function cartNeeded(siteData) {
            return !wixappsDataHandler.getDataByPath(siteData, 'ecommerce', ['cart']);
        }

        function _wrapJoinedCart(cart) {
            return {
                _type: 'JoinedCart',
                cart: cart,
                checkout: {_type: 'CheckoutButton'}
            };
        }


        function updateCart(cart, wixappsDataAspect) {
            wixappsDataAspect.setBatchedData(ecomDataUtils.packageName, [
                {path:[CART_LOCATION_ID], value:cart},
                {path:[JOINED_CART_LOCATION_ID], value:_wrapJoinedCart(cart)}
            ]);
        }

        function buildCartRequest(siteData, compData) {
            var requestMetadata = {
                action: CART_ACTION_ID,
                transformFunc: getCartResponseFunc({siteData: siteData, dontMergeWithOldData: true}),
                customTransform: true,
                onError: function () {
                    _.forEach(fetchingCart, function (componentData) {
                        wixappsDataHandler.setCompMetadata({hasError: 2024}, siteData, ecomDataUtils.packageName, componentData.id);
                    });
                }
            };
            if (!cartNeeded(siteData)) {
                return [];
            }

            var requests = [];

            // Send request only for the first component that needs the cart
            if (_.isEmpty(fetchingCart)) {
                var additionalParams = {
                    cartId: getCartId(siteData)
                };

                var request = ecomRequestBuilder.buildRequest(
                    siteData, compData, ecomDataUtils.packageName, additionalParams, requestMetadata);

                requests.push(request);
            }

            fetchingCart.push(compData);
            return requests;
        }

        function getCart(siteData, compData, onFailCallback) {
            if (!hasCart(siteData)) {
                //cart is empty so we push an empty cart to siteData directly.
                setCartData(siteData, null, null, ecomDataUtils.getApplicationDataStore(siteData), onFailCallback);
                return [];
            }
            return buildCartRequest(siteData, compData);
        }

        function buildCartPaths(path) {
            var cartPath = _.clone(path);
            cartPath.unshift(CART_LOCATION_ID);
            var joinedCartPath = _.clone(path);
            joinedCartPath.unshift(CART_LOCATION_ID);
            joinedCartPath.unshift(JOINED_CART_LOCATION_ID);
            return [cartPath, joinedCartPath];
        }

        function setCartItemDataAndUpdate(path, value, wixappsDataAspect) {
            _.forEach(buildCartPaths(path), function (cartPath) {
                wixappsDataAspect.setDataByPath(ecomDataUtils.packageName, cartPath, value);
            });
        }

        function setCartItemData(path, value, siteData) {
            _.forEach(buildCartPaths(path), function (cartPath) {
                wixapps.wixappsDataHandler.setDataByPath(siteData, ecomDataUtils.packageName, cartPath, value);
            });
        }

        function setCartData(siteData, wixappsDataAspect, responseData, currentValue, onFailCallback, couponCode) {
            var strippedResponseData = responseTransformation.stripJsonRpc(responseData);

            if (strippedResponseData.result && strippedResponseData.result.cart.clearCart === "true") {
                clearCart(siteData);
                setCartData(siteData, null, null, ecomDataUtils.getApplicationDataStore(siteData), onFailCallback, couponCode);
                return currentValue;
            }

            var cart = cartConverter.convertCart(strippedResponseData.result, couponCode);

            currentValue.items[CART_LOCATION_ID] = cart;
            currentValue.items[JOINED_CART_LOCATION_ID] = _wrapJoinedCart(cart);

            if (wixappsDataAspect) {
                updateCart(cart, wixappsDataAspect);
            }

            if (cart.id && cart.id !== cartConverter.NULL_CART_ID) {
                setCartId(siteData, cart.id);
            }

            var descriptor = wixappsDataHandler.getDescriptor(siteData, ecomDataUtils.packageName);
            _.forEach(fetchingCart, function (compData) {
                if (descriptor) {
                    wixappsDataHandler.clearCompMetadata(siteData, ecomDataUtils.packageName, compData.id);
                } else {
                    wixappsDataHandler.setCompMetadata({dataReady: true}, siteData, ecomDataUtils.packageName, compData.id);
                }
            });

            if (cart.preloadShipping && wixappsDataAspect) {
                getShipping(siteData, wixappsDataAspect, onFailCallback);
            }

            return currentValue;
        }

        function getCouponCode(siteData){
            return wixappsDataHandler.getDataByPath(siteData, ecomDataUtils.packageName, ['cart', 'coupon', 'couponCode']);
        }

        function getCartResponseFunc(params) {
            var siteData = params.siteData;
            var couponCode = params.dontMergeWithOldData ? '' : getCouponCode(siteData);
            return function (res, err) {
                var currentStoreValue = ecomDataUtils.getApplicationDataStore(siteData);
                if (err && params.siteApi) {
                    if (err.code === 1001) {
                        clearCart(siteData);
                        setCartData(null, null, null, currentStoreValue, _.noop);
                    }
                    if (params.onFailCallback){
                        params.onFailCallback(err);
                        return currentStoreValue;
                    }
                    var ecomDialogAspect = params.siteApi.getSiteAspect('ecomDialog');
                    ecomDialogAspect.showMessage({code: 2024});
                    return currentStoreValue;
                }
                return setCartData(siteData, params.wixappsDataAspect, res, currentStoreValue, null, couponCode);
            };
        }

        function sendRequest(siteData, params, requestMetadata, wixappsDataAspect, successCallback, failCallback) {
            wixappsDataAspect.setMetadata({updatingCart: true}, ecomDataUtils.packageName);

            ecomRequestSender.sendRequest(siteData, params, requestMetadata,
                function onSuccessCallback() {
                    wixappsDataAspect.setMetadata({updatingCart: false}, ecomDataUtils.packageName);
                    if (successCallback) {
                        successCallback();
                    }
                },
                failCallback);
        }

        function getShipping(siteData, wixappsDataAspect, onFailCallback) {
            var dataPath = ['fees', 'destination'];
            var countryList;
            if (countryListCache) {
                countryList = shippingConverter.convertCountriesList(countryListCache);
                setCartItemDataAndUpdate(dataPath, countryList, wixappsDataAspect);
                return;
            }

            var requestMetadata = {
                action: 'dynamicstore_order_cart.getCountries',
                transformFunc: function (res) {
                    countryListCache = _.cloneDeep(res);
                    countryList = shippingConverter.convertCountriesList(res);
                    setCartItemDataAndUpdate(dataPath, countryList, wixappsDataAspect);
                }
            };

            sendRequest(siteData, null, requestMetadata, wixappsDataAspect, null, onFailCallback);
        }

        function setShipping(countryId, regionId, siteData, wixappsDataAspect, dontMergeWithOldData, onSuccessCallback, onFailCallback) {
            var requestMetadata = {
                action: 'dynamicstore_order_cart.setDestination',
                transformFunc: getCartResponseFunc({siteData: siteData, dontMergeWithOldData: dontMergeWithOldData, wixappsDataAspect: wixappsDataAspect})
            };

            var shippingObj = {
                destination: {
                    'countryId': countryId,
                    'regionId': regionId
                },
                cartId: getCartId(siteData)
            };
            sendRequest(siteData, shippingObj, requestMetadata, wixappsDataAspect, onSuccessCallback, onFailCallback);
        }

        function setCoupon(couponCode, siteData, wixappsDataAspect, onError) {
            if (couponCode === "" || couponCode === undefined) {
                return;
            }

            var cartResponseFunc = getCartResponseFunc({siteData: siteData, wixappsDataAspect: wixappsDataAspect});
            var requestMetadata = {
                action: 'dynamicstore_order_cart.setCoupon',
                transformFunc: function (res, error) {
                    if (error) {
                        onError(error);
                        return null;
                    }
                    return cartResponseFunc(res, error);
                }
            };
            var couponObj = {
                cartId: getCartId(siteData),
                couponCode: couponCode
            };
            sendRequest(siteData, couponObj, requestMetadata, wixappsDataAspect, null, onError);
        }

        function clearCoupon(siteData, wixappsDataAspect, onFailCallback) {
            var requestMetadata = {
                action: 'dynamicstore_order_cart.clearCoupon',
                transformFunc: getCartResponseFunc({siteData: siteData, wixappsDataAspect: wixappsDataAspect})
            };
            sendRequest(siteData, {cartId: getCartId(siteData)}, requestMetadata, wixappsDataAspect, null, onFailCallback);
        }

        function updateProduct(product, siteData, wixappsDataAspect, onFailCallback) {
            var requestMetadata = {
                action: 'dynamicstore_order_cart.updateProduct',
                transformFunc: getCartResponseFunc({siteData: siteData, wixappsDataAspect: wixappsDataAspect})
            };

            var params = {
                options: [],
                cartId: getCartId(siteData),
                quantity: product.quantity,
                productId: product.id
            };

            sendRequest(siteData, params, requestMetadata, wixappsDataAspect, null, onFailCallback);
        }

        function removeProduct(product, siteData, wixappsDataAspect, onFailCallback) {
            var requestMetadata = {
                action: 'dynamicstore_order_cart.removeProduct',
                transformFunc: getCartResponseFunc({siteData: siteData, wixappsDataAspect: wixappsDataAspect})
            };

            sendRequest(siteData, {productId: product.id, cartId: getCartId(siteData)}, requestMetadata,
                wixappsDataAspect, null, onFailCallback);
        }

        function addProduct(productId, envPartApi, options, callback, onFailCallback) {
            var siteData = envPartApi.getSiteData();
            var wixappsDataAspect = envPartApi.getDataAspect();
            var requestMetadata = {
                action: 'dynamicstore_order_cart.addProduct',
                transformFunc: getCartResponseFunc({siteData: siteData, wixappsDataAspect: wixappsDataAspect, siteApi: envPartApi.getSiteApi(), onFailCallback: onFailCallback})
            };

            var cartId = getCartId(siteData);

            var params = {
                quantity: 1,
                productId: productId,
                cartId: cartId,
                options: options || null
            };

            sendRequest(siteData, params, requestMetadata, wixappsDataAspect, callback, onFailCallback);
        }

        /**
         * @class ecommerce.cartManager
         */
        return {
            getCartId: getCartId,
            getCart: getCart,
            updateCart: updateCart,
            setCartData: setCartData,
            clearCart: clearCart,
            getCartResponseFunc: getCartResponseFunc,
            setCartItemData: setCartItemData,
            setCartItemDataAndUpdate: setCartItemDataAndUpdate,
            getShipping: getShipping,
            setShipping: setShipping,
            setCoupon: setCoupon,
            clearCoupon: clearCoupon,
            addProduct: addProduct,
            updateProduct: updateProduct,
            removeProduct: removeProduct
        };

    });
