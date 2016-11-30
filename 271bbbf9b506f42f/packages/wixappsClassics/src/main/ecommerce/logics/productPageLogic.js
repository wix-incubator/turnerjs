define(["lodash", "wixappsCore", "wixappsClassics/ecommerce/logics/helpers/ProductOptionsCalculator", "wixappsClassics/ecommerce/data/cartManager", "wixappsClassics/ecommerce/util/ecomLogger", "utils"
], function (_, /** wixappsCore */wixapps, ProductOptionsCalculator, /** ecommerce.cartManager */ cartManager, ecomLogger, utils) {
    "use strict";

    var SHOW_FEEDBACK = 'showFeedback';

    function fixSetDataBatch(batch, pathToProduct) {
        _.forEach(batch, function (item) {
            item.path = pathToProduct.concat(item.path);
        });
    }

    function getProduct(partApi) {
        var pathToProduct = partApi.getRootDataItemRef();
        return pathToProduct && partApi.getDataAspect().getDataByPath(partApi.getPackageName(), pathToProduct);
    }

    function getTextOptionsValueAndId(partApi) {
        var options = getProduct(partApi).options;
        return _(options)
            .filter({optionType: 'simpleText'})
            .map(function (textOption) {
                return {optionId: textOption.id, value: textOption.text};
            })
            .value();
    }

    function openFeedbackMessageIfNeeded(partApi) {
        var logicParams = partApi.getPartData().appLogicParams;
        if (_.get(logicParams, 'afterAddProduct.value') === SHOW_FEEDBACK && !partApi.getSiteData().isMobileView()) {

            var dataItem = _.clone(partApi.getPartData());
            dataItem.appPartName = '03946768-374D-4426-B885-A1A5C6F570B9';
            dataItem.viewName = 'FeedbackMessage';
            var addComponentAspect = partApi.getSiteApi().getSiteAspect('addComponent');
            addComponentAspect.addComponent('ecomFeedback', {
                id: 'ecomFeedback',
                styleId: 'zoom',
                dataQuery: dataItem.id,
                skin: 'wysiwyg.skins.AppPartZoomSkin',
                componentType: 'wixapps.integration.components.AppPartZoom'
            }, {
                compData: dataItem,
                closeFunction: function () {
                    addComponentAspect.deleteComponent('ecomFeedback');
                }
            });
        }
    }

    function createAddProductOnFailCallback(partApi) {
        return function (err) {
            var siteApi = partApi.getSiteApi();
            var addComponentAspect = siteApi.getSiteAspect('addComponent');
            addComponentAspect.deleteComponent('ecomFeedback');

            var ecomDialogAspect = siteApi.getSiteAspect('ecomDialog');
            ecomDialogAspect.showMessage(err || {code: 2026});
        };
    }

    function setProductImageAndMedia(partApi, mediaItem, image) {
        var setDataBatch = [
            {path: ['productMedia'], value: mediaItem},
            {path: ['currentImage'], value: image}
        ];
        fixSetDataBatch(setDataBatch, partApi.getRootDataItemRef());
        partApi.getDataAspect().setBatchedData(partApi.getPackageName(), setDataBatch);
    }

    function validateAndUpdatePrice() {
        var setDataBatch = [];

        this.validateAndUpdatePrice(this.optionsCalculator.getProductItem(), setDataBatch);

        fixSetDataBatch(setDataBatch, this.partApi.getRootDataItemRef());
        this.partApi.getDataAspect().setBatchedData(this.partApi.getPackageName(), setDataBatch, true);
    }

    function autoSelectSingleOptions() {
        var setDataBatch = [];
        var product = getProduct(this.partApi);
        // if there is only one enabled option select it and set it in site data
        _.forEach(product.options, function (option, optionIndex) {
            var enabledItems = _.filter(option.items, 'enabled');
            if (enabledItems.length === 1) {
                this.optionsCalculator.selectOption(optionIndex, enabledItems[0].value, setDataBatch);
                setDataBatch.push({path: ['options', optionIndex, 'selectedValue'], value: enabledItems[0].value});
            }
        }, this);

        fixSetDataBatch(setDataBatch, this.partApi.getRootDataItemRef());
        this.partApi.getDataAspect().setBatchedData(this.partApi.getPackageName(), setDataBatch, true);

        if (this.optionsCalculator.allOptionsSelected()) {
            validateAndUpdatePrice.call(this);
        }
    }

    var ECOM_TPA_APP_DEF_ID = '1380b703-ce81-ff05-f115-39571d94dfcd';

    function getEcomTpaProductPageId(partApi) {
        var ECOM_TPA_PRODUCT_PAGE_ID = 'product_page';
        var sitePagesMap = partApi.getSiteData().getPagesDataItems();
        var productPageData = _.find(sitePagesMap, 'tpaPageId', ECOM_TPA_PRODUCT_PAGE_ID);
        return _.get(productPageData, 'id');
    }

    function isEcomTpaExistsAndEcomListNot(partApi) {
        var listAppId = partApi.getPartData().appInnerID;
        var isListAppInstalled = !!partApi.getSiteData().getClientSpecMapEntry(listAppId);

        var isEcomTpaInstalled = false;
        if (!isListAppInstalled) {
            var appData = partApi.getSiteData().getClientSpecMapEntryByAppDefinitionId(ECOM_TPA_APP_DEF_ID);
            isEcomTpaInstalled = !_.get(appData, 'permissions.revoked');
        }

        return isEcomTpaInstalled && !isListAppInstalled;
    }

    function getProductIdFromUrl(partApi) {
        var siteData = partApi.getSiteData();
        return siteData.getExistingRootNavigationInfo(siteData.getPrimaryPageId()).pageAdditionalData.split('/')[0];
    }


    /**
     * @class ecom.logics.ProductPageLogic
     * @param partApi
     * @constructor
     */
    function ProductPageLogic(partApi) {
        this.isRedirectingToNewTpaEcom = isEcomTpaExistsAndEcomListNot(partApi);
        if (this.isRedirectingToNewTpaEcom) {
            var siteAPI = partApi.getSiteApi();
            var pageId = getEcomTpaProductPageId(partApi);
            var productId = getProductIdFromUrl(partApi);
            _.defer(siteAPI.navigateToPage.bind(siteAPI, {pageId: pageId, pageAdditionalData: productId}));
            return;
        }

        this.partApi = partApi;
        var product = getProduct(partApi);
        this.optionsCalculator = product && new ProductOptionsCalculator(product);
    }

    ProductPageLogic.prototype = {
        isReady: function () {
            if (this.isRedirectingToNewTpaEcom) {
                return true;
            }
            autoSelectSingleOptions.call(this);
            return true;
        },

        "productOptionChanged": function (event) {
            if (this.isRedirectingToNewTpaEcom) {
                return;
            }
            var payload = event.payload;
            var optionListIndex = _.findIndex(getProduct(this.partApi).options, {id: payload.listData.id});
            var setDataBatch = [];
            var productItem = this.optionsCalculator.selectOption(optionListIndex, payload.value, setDataBatch);
            this.validateAndUpdatePrice(productItem, setDataBatch);
            fixSetDataBatch(setDataBatch, this.partApi.getRootDataItemRef());
            this.partApi.getDataAspect().setBatchedData(this.partApi.getPackageName(), setDataBatch);
        },

        "textAreaOptionChanged": function () {
            if (this.isRedirectingToNewTpaEcom) {
                return;
            }

            var setDataBatch = [];
            this.validateAndUpdatePrice(this.optionsCalculator.getProductItem(), setDataBatch);
            fixSetDataBatch(setDataBatch, this.partApi.getRootDataItemRef());
            this.partApi.getDataAspect().setBatchedData(this.partApi.getPackageName(), setDataBatch);
        },

        "buy-product": function () {
            if (this.isRedirectingToNewTpaEcom) {
                return;
            }

            var setDataBatch = [];
            var productItem = this.optionsCalculator.getProductItem();
            this.validateAndUpdatePrice(productItem, setDataBatch);
            fixSetDataBatch(setDataBatch, this.partApi.getRootDataItemRef());
            this.partApi.getDataAspect().setBatchedData(this.partApi.getPackageName(), setDataBatch);

            if (productItem && _.every(getProduct(this.partApi).options, 'valid')) {
                ecomLogger.reportEvent(this.partApi.getSiteData(), ecomLogger.events.PRODUCT_PAGE_ADD_PRODUCT_TO_CART, {
                    itemId: productItem.id
                });

                var options = getTextOptionsValueAndId(this.partApi);
                var onFailCallback = createAddProductOnFailCallback(this.partApi);
                cartManager.addProduct(productItem.id, this.partApi, options, _.noop, onFailCallback);
                openFeedbackMessageIfNeeded(this.partApi);

                this.partApi.getSiteApi().navigateToPage({pageId: this.partApi.getSiteData().getCurrentUrlPageId()});
            }
        },

        "image-selected": function (event) {
            if (this.isRedirectingToNewTpaEcom) {
                return;
            }

            var product = getProduct(this.partApi);
            var mediaItem = product.mediaItems[event.payload.itemIndex];
            var image = product.imageList[event.payload.itemIndex];
            setProductImageAndMedia(this.partApi, mediaItem, image);
        },

        "gallery-item-clicked": function (event) {
            if (this.isRedirectingToNewTpaEcom) {
                return;
            }

            var mediaItem = event.params.mediaItem;
            var image = event.params.image;
            setProductImageAndMedia(this.partApi, mediaItem, image);
        },

        "shareProductPage": function (event) {
            if (this.isRedirectingToNewTpaEcom) {
                return;
            }

            var product = getProduct(this.partApi);
            var mediaItems = product.mediaItems;

            ecomLogger.reportEvent(this.partApi.getSiteData(), ecomLogger.events.USER_SHARED_PRODUCT_PAGE, {
                productId: product.id,
                service: event.params.service
            });

            utils.socialShareHandler.handleShareRequest({
                url: this.partApi.getSiteData().currentUrl.full,
                service: event.params.service,
                title: product.title,
                imageUrl: mediaItems.length ? product.imageList[0].src : '',
                addDeepLinkParam: true
            }, this.partApi.getSiteApi(), true);
        },

        validateAndUpdatePrice: function (productItem, dataChangesBatch) {
            if (this.isRedirectingToNewTpaEcom) {
                return;
            }

            var isValid = this.optionsCalculator.validateOptions(dataChangesBatch);
            if (isValid) {
                var productItemIndex = _.findIndex(getProduct(this.partApi).productItems, productItem);
                if (productItem) {
                    dataChangesBatch.push({path: ['price'], value: productItem.price});
                }
                dataChangesBatch.push({path: ['selectedItemIndex'], value: productItemIndex});
            }
        }
    };

    wixapps.logicFactory.register("f72a3898-8520-4b60-8cd6-24e4e20d483d", ProductPageLogic);

});
