define(["lodash",
    "wixappsCore",
    "wixappsClassics/ecommerce/data/cartManager",
    "wixappsClassics/ecommerce/util/ecomDataUtils",
    "wixappsClassics/ecommerce/data/checkoutManager",
    "wixappsClassics/ecommerce/logics/ShoppingCartLogic"
], function (_, /** wixappsCore */wixapps, /** ecommerce.cartManager */cartManager, /** ecomDataUtils */ecomDataUtils, checkoutManager, ShoppingCartLogic) {

    "use strict";

    var logicFactory = wixapps.logicFactory;

    function getRegions(countryId) {
        var shippingData = getShippingData(this.partApi);
        var countries = shippingData.countries.items;
        var countryDefinition = _.find(countries, {value: countryId});
        return countryDefinition && countryDefinition.regions;
    }

    function getShippingData(partApi) {
        var cart = ecomDataUtils.getApplicationDataStore(partApi.getSiteData()).items.cart;
        return cart.fees.destination;
    }

    function setRegions(partApi, regions) {
        cartManager.setCartItemDataAndUpdate(['fees', 'destination', 'regions'], regions, partApi.getDataAspect());
    }

    /**
     * @class ecom.EcomJoinedCartLogic
     * @param partApi
     * @constructor
     */
    function EcomJoinedCartLogic(partApi) {
        ShoppingCartLogic.call(this, partApi);
    }

    function setCountriesValidity(partApi) {
        var shippingData = getShippingData(partApi);

        shippingData.countries.valid = !!this._selectedCountry;
        cartManager.setCartItemDataAndUpdate(['fees', 'destination'], shippingData, partApi.getDataAspect());
    }

    function canClickCheckout(partApi) {
        var shippingData = getShippingData(partApi);
        var canClick = shippingData && (!shippingData.shippable || shippingData.name);

        if (!canClick) {
            setCountriesValidity.call(this, partApi);
            if (this._selectedCountry) {
                var regions = getRegions.call(this, this._selectedCountry);
                if (regions) {
                    regions.valid = regions.selectedValue !== -1;
                    setRegions(partApi, regions);
                }
            }
        }

        return canClick;
    }

    function onShippingFailed(errorParams) {
        var siteApi = this.partApi.getSiteApi();
        var ecomDialogAspect = siteApi.getSiteAspect('ecomDialog');
        ecomDialogAspect.showMessage(errorParams);
    }

    EcomJoinedCartLogic.prototype = _.assign(Object.create(ShoppingCartLogic.prototype), {
        getViewVars: function () {
            return {couponValid: true, toggleState: 'off'};
        },
        "changeDestination": function () {
            this._selectedCountry = null;
            var siteData = this.partApi.getSiteData();
            var dataAspect = this.partApi.getDataAspect();
            cartManager.setShipping(null, null, siteData, dataAspect, false, null, onShippingFailed.bind(this, {code: 2032}));
            var shippingData = getShippingData(this.partApi);
            if (!shippingData.countries) {
                cartManager.getShipping(siteData, dataAspect, onShippingFailed.bind(this, {code: 2033}));
            }
        },

        "clear-coupon": function () {
            cartManager.clearCoupon(this.partApi.getSiteData(), this.partApi.getDataAspect());
        },

        "set-coupon": function (evt) {
            var self = this;
            cartManager.setCoupon(evt.params.couponCode, this.partApi.getSiteData(), this.partApi.getDataAspect(), function (error) {
                var errorCode = error ? error.code : 0;
                var errorMessage = wixapps.localizer.localize("@ECOM_COUPON_API_FAILED_ERR_DESC@", self.partApi.getLocalizationBundle()) + " (" + errorCode + ").";
                self.partApi.setVar('couponValid', false);
                cartManager.setCartItemDataAndUpdate(['coupon', 'validationMessage'], errorMessage, self.partApi.getDataAspect());
            });
        },

        "clear-message": function () {
            this.partApi.setVar('couponValid', true);
            cartManager.setCartItemDataAndUpdate(['coupon', 'validationMessage'], "", this.partApi.getDataAspect());
        },

        "click-checkout": function () {
            if (canClickCheckout.call(this, this.partApi)) {
                checkoutManager.handleCheckout(this.partApi);
            }
        },
        "countrySelected": function (evt) {
            var self = this;
            var countryId = evt.payload.value;
            var regions = getRegions.call(this, countryId);
            this._selectedCountry = countryId; //set country selected
            setCountriesValidity.call(this, this.partApi);
            var setCouponToggle = function () {
                self.partApi.setVar('toggleState', 'off');
            };
            if (_.get(regions, 'items.length', 0) > 0) {
                setRegions(this.partApi, regions);
                return;
            }
            var siteData = this.partApi.getSiteData();
            var dataAspect = this.partApi.getDataAspect();
            cartManager.setShipping(countryId, undefined, siteData, dataAspect, true, setCouponToggle, onShippingFailed.bind(this, {code: 2032}));
        },
        "regionSelected": function (evt) {
            var self = this;
            var regionId = evt.payload.value;
            var siteData = this.partApi.getSiteData();
            var dataAspect = this.partApi.getDataAspect();
            var setCouponToggle = function () {
                self.partApi.setVar('toggleState', 'off');
            };
            cartManager.setShipping(this._selectedCountry, regionId, siteData, dataAspect, true, setCouponToggle, onShippingFailed.bind(this, {code: 2032}));
        },

        getUserCustomizations: function (customizations) {
            return _.map(customizations, function (item) {
                if (item.fieldId === "checkoutButtonLink" && item.value === "") {
                    item.value = "CHECKOUT NOW";
                }
                return item;
            });
        }
    });

    logicFactory.register("5fca0e8b-a33c-4c18-b8eb-da50d7f31e4a", EcomJoinedCartLogic);

});
