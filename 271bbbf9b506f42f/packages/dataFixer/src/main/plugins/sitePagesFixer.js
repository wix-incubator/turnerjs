define(['lodash'], function(_) {
    'use strict';

    function getSitePagesFromMasterPage(masterPage){
        var sitePages;

        if (masterPage.structure.children){
            var pageContainer = _.find(masterPage.structure.children, {id: "PAGES_CONTAINER"});

            if (pageContainer && !_.isEmpty(pageContainer.components)) {
                sitePages = _.find(pageContainer.components, {id: "SITE_PAGES"});
            }
        }


        return sitePages;
    }

    function getMobileSitePagesFromMasterPage(masterPage){
        var mobileSitePages;

        if (masterPage.structure.mobileComponents){
            var mobilePageContainer = _.find(masterPage.structure.mobileComponents, {id: "PAGES_CONTAINER"});
            if (mobilePageContainer && !_.isEmpty(mobilePageContainer.components)) {
                mobileSitePages = _.find(mobilePageContainer.components, {id: "SITE_PAGES"});
            }
        }

        return mobileSitePages;
    }

    function fixSitePagesContainsOnlyPages(sitePages) {
        if (!_.isEmpty(sitePages.components)) {
            sitePages.components = [];
        }
    }

    function fixSitePagesTop(sitePages){
        if (sitePages.layout){
            sitePages.layout.y = 0;
        }
    }

    /**
     * @exports utils/dataFixer/plugins/masterPageFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function(pageJson) {
            if (pageJson.structure && pageJson.structure.type === 'Document') { //masterPage
                var sitePages = getSitePagesFromMasterPage(pageJson);
                var mobileSitePages = getMobileSitePagesFromMasterPage(pageJson);

                if (sitePages){
                    fixSitePagesContainsOnlyPages(sitePages);
                    fixSitePagesTop(sitePages);
                }

                if (mobileSitePages){
                    fixSitePagesContainsOnlyPages(mobileSitePages);
                    fixSitePagesTop(mobileSitePages);
                }
            }

            return pageJson;
        }
    };

    return exports;
});
