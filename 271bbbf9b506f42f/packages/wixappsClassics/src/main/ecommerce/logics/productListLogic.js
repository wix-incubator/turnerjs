define(["lodash", "wixappsCore"
], function (_, /** wixappsCore */wixapps) {
    "use strict";

    var logicFactory = wixapps.logicFactory;
    var PRODUCT_CHUNK = 5;

    function migrateCustomization(partApi) {
        _(partApi.getPartData().appLogicCustomizations)
            .filter({"fieldId": "vars", "key": "rows", "format": "Mobile"})
            .forEach(function (rowsCustomization) {
                rowsCustomization.fieldId = "logicVars";
            })
            .value();
    }

    /**
     * @class ecom.AddToCartButtonLogic
     * @param partApi
     * @constructor
     */
    function ProductListLogic (partApi) {
        this.partApi = partApi;
        migrateCustomization(partApi);
        var rowsCustomization = _.find(partApi.getPartData().appLogicCustomizations, {"fieldId": "logicVars", "key": "rows", "format": "Mobile"});
        this.rowsToAdd = rowsCustomization ? parseInt(rowsCustomization.value, 10) : PRODUCT_CHUNK;
        this.rows = this.rowsToAdd;
    }

    ProductListLogic.prototype = {
        getViewVars: function() {
            return {
                rows: this.rows
            };
        },

        "load-more": function () {
            this.rows += this.rowsToAdd;
            this.partApi.setVar('rows', this.rows);
        }
    };

    logicFactory.register("30b4a102-7649-47d9-a60b-bfd89dcca135", ProductListLogic);

});
