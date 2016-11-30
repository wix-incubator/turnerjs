define(['lodash', "wixappsCore"], function (_, /** wixappsCore */ wixapps) {
    "use strict";

    /**
     * @class ecom.EcomJoinedCartLogic
     * @param partApi
     * @constructor
     */
    function ViewCartLogic(partApi) {
        this.partApi = partApi;
    }

    ViewCartLogic.prototype = {
        getViewVars: function () {
            var partData = this.partApi.getPartData();
            var params = _.mapValues(partData.appLogicParams, "value");

            return {
                viewCartLink: {
                    _type: "wix:PageLink",
                    pageId: params.cartPageLink
                }
            };
        },
        getUserCustomizations: function (customizations) {
            var ret = _.cloneDeep(customizations);
            var partData = this.partApi.getPartData();
            var formatName = this.partApi.getFormatName();
            var params = _.mapValues(partData.appLogicParams, "value");

            var buttonTypeCustomization = _.find(ret, {view: partData.viewName, fieldId: "vars", key: "buttonType"});
            var cartTextCustomization = _.find(ret, {view: partData.viewName, fieldId: "vars", key: "cartText"});

            var buttonType = (buttonTypeCustomization && buttonTypeCustomization.value) || params.viewCartType || 'itemsCount';
            var cartText = (cartTextCustomization && cartTextCustomization.value) || params.viewCartText || wixapps.localizer.localize("@ECOM_VIEW_CART_BUTTON_DEFAULT_TEXT@", this.partApi.getLocalizationBundle());

            if (buttonTypeCustomization) {
                buttonTypeCustomization.value = buttonType;
                buttonTypeCustomization.format = formatName;
            } else {
                ret.push({forType: 'Cart', view: partData.viewName, fieldId: 'vars', format: formatName, key: "buttonType", value: buttonType});
            }

            if (cartTextCustomization) {
                cartTextCustomization.value = cartText;
                cartTextCustomization.format = formatName;
            } else {
                ret.push({forType: 'Cart', view: partData.viewName, fieldId: 'vars', format: formatName, key: "cartText", value: cartText});
            }

            return ret;
        }
    };

    // Register for FAQ part
    wixapps.logicFactory.register("c029b3fd-e8e4-44f1-b1f0-1f83e437d45c", ViewCartLogic);
});