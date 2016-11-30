define(["wixappsCore",
    "wixappsClassics/ecommerce/data/checkoutManager"
], function (/** wixappsCore */wixapps, checkoutManager) {

    "use strict";

    /**
     * @class ecom.logics.CheckoutButtonLogic
     * @param partApi
     * @constructor
     */
    function CheckoutButtonLogic(partApi) {
        this.partApi = partApi;
    }

    CheckoutButtonLogic.prototype = {
        "click-checkout": function (/*evt*/) {
            checkoutManager.handleCheckout(this.partApi);
        }
    };

    wixapps.logicFactory.register("cd54a28f-e3c9-4522-91c4-15e6dd5bc514", CheckoutButtonLogic);
});