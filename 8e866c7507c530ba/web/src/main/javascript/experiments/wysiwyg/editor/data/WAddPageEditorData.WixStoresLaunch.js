define.experiment.dataItem('PAGE_TYPES.WixStoresLaunch', function (strategy) {
    return strategy.customizeField(function(originalData) {
        /**
         *  removing the old eCommerce component from add page menu
         */
        _.remove(originalData.items, {"name": "ADD_PAGE_SHOP1_NAME"});
        _.remove(originalData.items, {"name": "ADD_PAGE_SHOP2_NAME"});
        _.remove(originalData.items, {"name": "ADD_PAGE_SHOP3_NAME"});
        return originalData;
    });
});