define(["wixappsCore",
    'wixappsClassics/ecommerce/data/cartManager',
    'wixappsClassics/ecommerce/util/ecomLogger'
], function (/** wixappsCore */wixapps, /** ecommerce.cartManager */cartManager, /** wixappsCore.ecomLogger */ecomLogger) {
    "use strict";



    var logicFactory = wixapps.logicFactory;

    /**
     * @class ecom.AddToCartButtonLogic
     * @param partApi
     * @constructor
     */
    function AddToCartButtonLogic (partApi) {
        this.partApi = partApi;
    }

    AddToCartButtonLogic.prototype = {
        "add-product-to-cart": function () {
            var productId = this.partApi.getPartData().appLogicParams.productId.value;
            var siteData = this.partApi.getSiteData();

            ecomLogger.reportEvent(siteData, ecomLogger.events.ADD_TO_CART_BTN_ADD_PRODUCT_TO_CART, {c1: productId});
            var options = null;
            var successCallback = null;
            var failCallback = createAddProductOnFailCallback(this.partApi.getSiteApi(), {code: 2026});
            cartManager.addProduct(productId, this.partApi, options, successCallback, failCallback);
        }
    };

    function createAddProductOnFailCallback(siteApi, errorParams) {
        return function (err) {
            var ecomDialogAspect = siteApi.getSiteAspect('ecomDialog');
            ecomDialogAspect.showMessage(err || errorParams);
        };
    }

    logicFactory.register("c614fb79-dbec-4ac7-b9b0-419669fadecc", AddToCartButtonLogic);
});