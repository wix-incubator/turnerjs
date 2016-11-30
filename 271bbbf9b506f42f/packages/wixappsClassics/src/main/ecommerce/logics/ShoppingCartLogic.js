define(["lodash", "wixappsCore", "wixappsClassics/ecommerce/data/cartManager"], function (_, /** wixappsCore */wixapps, /** ecommerce.cartManager */cartManager) {
    "use strict";

    function updateQuantity(evt) {
        var ecomDialogAspect = getEcomDialogAspect.call(this);
        var onFailCallback = createOnFailCallback(ecomDialogAspect, 2027);
        var product = evt.params.product;
        product.quantity = evt.payload.oldValue || evt.payload;
        cartManager.updateProduct(product, this.partApi.getSiteData(), this.partApi.getDataAspect(), onFailCallback);
    }

    function createOnFailCallback(ecomDialogAspect, code) {
        if (ecomDialogAspect) {
            return function() {
                var errorParams = {
                    code: code
                };
                ecomDialogAspect.showMessage(errorParams);
            };
        }
        return _.noop;
    }

    function getEcomDialogAspect() {
        return this.partApi.getSiteApi().getSiteAspect('ecomDialog');
    }
    /**
     * @class ecom.ShoppingCartLogic
     * @param partApi
     * @constructor
     */
    function ShoppingCartLogic(partApi) {
        this.partApi = partApi;
    }

    ShoppingCartLogic.prototype = {
        removeProduct: function (evt) {
            var product = evt.params.product;
            var ecomDialogAspect = getEcomDialogAspect.call(this);
            var onFailCallback = createOnFailCallback(ecomDialogAspect, 2028);
            cartManager.removeProduct(product, this.partApi.getSiteData(), this.partApi.getDataAspect(), onFailCallback);

        },
        handleQuantityChanged: _.debounce(updateQuantity, 400),
        handleInvalidQuantity: function (evt) {
            if (evt.payload.invalidValue < evt.payload.minValue) {
                return;
            }

            var addComponentAspect = this.partApi.getSiteApi().getSiteAspect('addComponent');

            var id = "batatot";

            var skin = this.partApi.getSiteData().isMobileView() ? "wysiwyg.viewer.skins.MobileMessageViewSkin" : "wysiwyg.viewer.skins.MessageViewSkin";
            var structure = {
                componentType: "wysiwyg.viewer.components.MessageView",
                skin: skin,
                type: "Component",
                id: id
            };

            var props = {
                compProp: {
                    title: "Insufficient Stock",
                    description: "You reached the maximum available quantity for this product",
                    onCloseCallback: function () {
                        addComponentAspect.deleteComponent(id);
                    }
                }
            };
            addComponentAspect.addComponent(id, structure, props);
        },

        isReady: function (siteData, siteAPI) {
            var ecomMetaData = this.partApi.getDataAspect(siteAPI).getMetadata(this.partApi.getPackageName(siteData));
            return !ecomMetaData.updatingCart;
        }
    };

    wixapps.logicFactory.register("adbeffec-c7df-4908-acd0-cdd23155a817", ShoppingCartLogic);

    return ShoppingCartLogic;
});
