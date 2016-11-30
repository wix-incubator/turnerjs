define(['lodash', 'documentServices/componentDetectorAPI/componentDetectorAPI', 'documentServices/dataModel/dataModel'], function (_, componentDetectorAPI, dataModel) {
    'use strict';

    var OLD_APPS = ['news', 'menu', 'faq'];
    var APP_PART_COMP_TYPE = 'wixapps.integration.components.AppPart';

    function getMasterPageDocumentData(ps) {
        var masterPageDataPointer = ps.pointers.page.getPageData('masterPage');
        return ps.dal.get(masterPageDataPointer);
    }

    function hasAppPage(ps) {
        var masterPageDocumentData = getMasterPageDocumentData(ps);
        return !!_.find(masterPageDocumentData, {type: 'AppPage', appPageType: 'AppBuilderPage'});
    }

    function hasOldApp(ps) {
        var clientSpecMapPointer = ps.pointers.general.getClientSpecMap();
        var clientSpecMap = ps.dal.get(clientSpecMapPointer);
        var oldAppClientSpecMap = {};
        _.forEach(OLD_APPS, function (oldApp) {
            var app = _.find(clientSpecMap, {type: 'wixapps', packageName: oldApp});
            if (app) {
                var appId = app.applicationId;
                oldAppClientSpecMap[appId] = app;
            }
        });

        var oldEcom = _.find(clientSpecMap, {packageName: 'ecommerce'});
        if (oldEcom) {
            oldAppClientSpecMap[oldEcom.applicationId] = oldEcom;
        }

        if (_.isEmpty(oldAppClientSpecMap)) {
            return false;
        }

        var appPartCompPointers = componentDetectorAPI.getComponentByType(ps, APP_PART_COMP_TYPE);

        return _.some(appPartCompPointers, function (compPointer) {
            var dataItem = dataModel.getDataItem(ps, compPointer);
            return !!oldAppClientSpecMap[dataItem.appInnerID];
        });
    }

    return {
        /**compata
         * Returns whether or not the site has an app page (if so it's not compatible to editor >= 1.6)
         *
         * @returns {boolean}
         */
        hasAppPage: hasAppPage,
        /**
         * Returns whether or not the site has an old app (i.e news/e-com/menu/faq, if so it's not compatible to editor >= 1.6)
         *
         * @returns {boolean}
         */
        hasOldApp: hasOldApp
    };
});
