define(['lodash',
        'wixappsCore',
        'wixappsClassics/ecommerce/data/converters/productBundleConverter',
        'wixappsClassics/ecommerce/data/converters/shippingConverter',
        'wixappsClassics/ecommerce/util/responseTransformation',
        'wixappsClassics/ecommerce/data/cartManager',
        'wixappsClassics/ecommerce/util/ecomRequestBuilder',
        'wixappsClassics/ecommerce/util/ecomLogger',
        'wixappsClassics/ecommerce/util/ecomDataUtils',
        'utils'],
    function (_, /** wixappsCore */ wixapps, productBundleConverter, shippingConverter, responseTransformation, /** ecommerce.cartManager */cartManager, ecomRequestBuilder, /** wixappsCore.ecomLogger */ecomLogger, /** ecomDataUtils */ecomDataUtils, utils) {

        "use strict";

        var wixappsDataHandler = wixapps.wixappsDataHandler;

        var ecomAppPartMap = {

            //Product gallery
            "30b4a102-7649-47d9-a60b-bfd89dcca135": {
                action: 'dynamicstore_category.getCategoryProductsByWixId',
                params: {
                    wixId: 'categoryId'
                },
                isReadOnly: true,
                transformFunc: productBundleConverter.convertProductBundleList,
                isOnline: true
            },
            //view cart
            "c029b3fd-e8e4-44f1-b1f0-1f83e437d45c": {
                isCart: true
            },
            //shopping cart
            "adbeffec-c7df-4908-acd0-cdd23155a817": {
                isCart: true
            },
            //joined cart (actual cart page)
            "5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a": {
                isCart: true,
                isJoinedCart: true
            },
            "cd54a28f-e3c9-4522-91c4-15e6dd5bc514": {
                isCart: true,
                isCheckout: true
            },
            //add product to cart
            "c614fb79-dbec-4ac7-b9b0-419669fadecc": {
                isOnline: false,
                transformFunc: createAddToCartButton
            },
            //product page
            "f72a3898-8520-4b60-8cd6-24e4e20d483d": {
                metaData: {
                    action: 'dynamicstore_product.getProductById',
                    transformFunc: responseTransformation.transformSingleProductResponse.bind(null, productBundleConverter.convertProductBundle),
                    customTransform: true
                },
                "collectionId": "Items"
            }
        };

        function createAddToCartButton(siteData, compData, appService) {
            var storeLocation = ecomDataUtils.getApplicationDataStore(siteData);
            storeLocation[compData.id] = [compData.id];
            var cartText = (compData.appLogicParams.addToCartText && compData.appLogicParams.addToCartText.value) || '@ECOM_ADD_TO_CART_BUTTON_DEFAULT_TEXT@';
            storeLocation.items[compData.id] = cartText;
            return getCart(siteData, compData, appService.packageName);
        }

        function sendProductPageBi(siteData, itemId) {
            ecomLogger.reportEvent(siteData, ecomLogger.events.PRODUCT_PAGE_VIEWED_BY_USER, {itemId: itemId});
            if (siteData.currentUrl.query.deeplink_referrer) {
                ecomLogger.reportEvent(siteData, ecomLogger.events.PRODUCT_PAGE_VIEWED_BY_USER, {
                    itemId: itemId,
                    referrer: siteData.currentUrl.query.deeplink_referrer
                });
            }
        }

        function checkZoomDataRequirements(siteData, compData, appService, urlData) {
            var applicationDefinition = siteData.getClientSpecMapEntry(compData.appInnerID);
            if (applicationDefinition.removed) {
                wixappsDataHandler.setPackageMetadata({removed: true}, siteData, ecomDataUtils.packageName);
                return [];
            }

            var itemId = wixapps.wixappsUrlParser.getPageSubItemId(siteData, urlData);

            if (!itemId) {
                return [];
            }

            sendProductPageBi(siteData, itemId);

            var packageName = appService.packageName;

            var failureParams = {siteData: siteData, code: 2024, package: packageName, compId: compData.id};
            var failCallback = onFailure.bind(null, failureParams);
            // always get the cart, so we can add to it in the zoom
            var cartRequests = cartManager.getCart(siteData, compData, failCallback);

            //this is stupid... getApplicationDataStore actually creates the location
            var ecomStoreLocation = ecomDataUtils.getApplicationDataStore(siteData);

            if (!ecomStoreLocation.items.storeId) {
                ecomStoreLocation.items.storeId = appService.magentoStoreId;
            }

            var dataItem = wixappsDataHandler.getDataByPath(siteData, packageName, [itemId]);
            if (!dataItem && urlData.pageItemAdditionalData) {
                var pathToDataItem = urlData.pageItemAdditionalData.split('.');
                var items = wixappsDataHandler.getDataByPath(siteData, packageName, pathToDataItem);
                dataItem = _.find(items, {id: itemId});
            }

            if (dataItem) {
                var zoomDataItem = wixappsDataHandler.getDataByPath(siteData, packageName, ["zoom"]);
                if (!zoomDataItem || (zoomDataItem.id !== dataItem.id)) {
                    zoomDataItem = _.cloneDeep(dataItem);
                    wixappsDataHandler.setDataByPath(siteData, packageName, ["zoom"], zoomDataItem);
                    wixappsDataHandler.setDataForCompId(siteData, packageName, compData.id, ["zoom"]);
                }
                productBundleConverter.setDefaultSelctionForOptions(zoomDataItem);
                productBundleConverter.cleanProductBundle(zoomDataItem);
                return cartRequests;
            }

            var getProductRequest = ecomRequestBuilder.buildRequest(siteData, compData, packageName, {'productId': itemId}, {
                action: 'dynamicstore_product.getProductById',
                transformFunc: responseTransformation.transformSingleProductResponseForZoom.bind(null, compData.id, productBundleConverter.convertProductBundle),
                customTransform: true,
                onError: failCallback
            });

            return cartRequests.concat(getProductRequest);
        }

        function setAppPartDataReady(siteData, packageName, compId) {
            var descriptor = wixappsDataHandler.getDescriptor(siteData, packageName);
            if (descriptor) {
                wixappsDataHandler.clearCompMetadata(siteData, packageName, compId);
            } else {
                wixappsDataHandler.setCompMetadata({dataReady: true}, siteData, packageName, compId);
            }
        }

        function getCart(siteData, compData, packageName) {
            wixappsDataHandler.setCompMetadata({loading: true}, siteData, packageName, compData.id);
            var paramsForFailure = {siteData: siteData, code: 2024, package: packageName, compId: compData.id};
            return cartManager.getCart(siteData, compData, onFailure.bind(null, paramsForFailure));
        }

        function checkDataRequirements(siteData, compData, appService) {
            var packageName = appService.packageName;
            var appPartName = compData.appPartName;
            var compMetaData = ecomAppPartMap[appPartName];

            //data is already there.  Don't fetch again
            if (wixappsDataHandler.getDataByCompId(siteData, packageName, compData.id)) {
                if (compMetaData.isCart) {
                    var storeLocation = ecomDataUtils.getApplicationDataStore(siteData);
                    if (storeLocation.items.cart && storeLocation.items.cart.preloadShipping) {
                        storeLocation.items.cart.preloadShipping = false;
                        var requestMetadata = {
                            action: 'dynamicstore_order_cart.getCountries',
                            customTransform: true,
                            transformFunc: function (res, currentValue) {
                                var countryList = shippingConverter.convertCountriesList(res.result);
                                cartManager.setCartItemData(['fees', 'destination'], countryList, siteData);
                                return currentValue;
                            }
                        };
                        wixappsDataHandler.setCompMetadata({loading: true}, siteData, packageName, compData.id);
                        return ecomRequestBuilder.buildRequest(siteData, compData, ecomDataUtils.packageName, null, requestMetadata);
                    }
                }
                setAppPartDataReady(siteData, packageName, compData.id);
                return [];
            }

            if (!compMetaData) {
                utils.log.verbose('apppart:  ' + appPartName + ' has no metadata');
                return [];
            }

            var ecomStoreLocation = ecomDataUtils.getApplicationDataStore(siteData);

            if (!ecomStoreLocation.items.storeId) {
                ecomStoreLocation.items.storeId = appService.magentoStoreId;
            }

            if (compMetaData.isCheckout) {
                ecomStoreLocation[compData.id] = ['checkout'];
                ecomStoreLocation.items.checkout = {_type: 'CheckoutButton'};
                return [];
            }

            //we need to check if the cart exists. if it's not we just return an empty cart.
            if (compMetaData.isCart) {
                ecomStoreLocation[compData.id] = compMetaData.isJoinedCart ? ['joinedCart'] : ['cart'];
                if (wixappsDataHandler.getDataByPath(siteData, packageName, ecomStoreLocation[compData.id])) {
                    wixappsDataHandler.clearCompMetadata(siteData, packageName, compData.id);
                    return [];
                }

                return getCart(siteData, compData, packageName);
            }

            if (compMetaData.isOnline) {
                wixappsDataHandler.setCompMetadata({loading: true}, siteData, packageName, compData.id);
                return ecomRequestBuilder.buildRequest(siteData, compData, packageName, null, compMetaData);
            }

            return compMetaData.transformFunc(siteData, compData, appService);
        }

        function onFailure(params) {
            var errorCode = params.code || -1;
            var siteData = params.siteData;
            var packageName = params.package;
            var compId = params.compId;

            wixappsDataHandler.setCompMetadata({hasError: errorCode}, siteData, packageName, compId);
        }

        return {
            checkDataRequirements: checkDataRequirements,
            checkZoomDataRequirements: checkZoomDataRequirements
        };

    });
