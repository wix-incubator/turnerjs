/** @class wysiwyg.viewer.managers.viewer.SiteDataHandler */
define.experiment.Class('wysiwyg.viewer.managers.viewer.SiteDataHandler.RemoveOldEcomAndGetNewWixStores', function (classDefinition, experimentStrategy) {

    var def = classDefinition;
    var strategy = experimentStrategy;

    def.statics({
        PROPERTIES_OF_TYPE: {
            "wixapps.integration.components.AppPage": ['id', 'appPageId'],
            "wixapps.integration.components.AppPart2": ['id', 'appInnerID', 'appPartName'],
            "wixapps.integration.components.AppPart": ['id', 'appPartName']
        }
    });
});
