define(['lodash', "utils", "wixappsCore"
    ], function (_, utils, /** wixappsCore */wixapps) {
    "use strict";



    var logicFactory = wixapps.logicFactory;

    var blogAppPartNames = utils.blogAppPartNames;

    /**
     * @class ecom.AddToCartButtonLogic
     * @param partApi
     * @constructor
     */
    function ArchiveLogic (partApi) {
        this.partApi = partApi;
    }

    ArchiveLogic.prototype = {
        "comboBoxSelectionChanged": function (evt) {
            var pagesDataItems = this.partApi.getSiteData().getPagesDataItems();
            var blogPage = _.find(pagesDataItems, {appPageType: "AppPage", appPageId: "79f391eb-7dfc-4adf-be6e-64434c4838d9"});
            var navigationInfo = {
                pageId: blogPage.id,
                pageAdditionalData: evt.payload.value ? "Date/" + evt.payload.value : ""
            };

            this.partApi.getSiteApi().navigateToPage(navigationInfo);
        },
        "listOptionClicked": function () {
            // handled in the all mighty appPartDataRequirementsChecker
        }
    };

    logicFactory.register(blogAppPartNames.ARCHIVE, ArchiveLogic);
});
