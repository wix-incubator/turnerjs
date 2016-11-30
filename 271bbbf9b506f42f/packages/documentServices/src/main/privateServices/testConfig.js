define([
    'lodash',
    'documentServices/jsonConfig/jsonConfig',
    'documentServices/page/pagePublicAPI',
    'documentServices/theme/themePublicAPI',
    'documentServices/fonts/fontsPublicAPI',
    'documentServices/component/componentPublicAPI',
    'documentServices/smartBoxes/smartBoxesPublicAPI',
    'documentServices/dataModel/dataModelPublicAPI',
    'documentServices/componentsMetaData/componentsMetaDataPublicAPI',
    'documentServices/actionsAndBehaviors/actionsAndBehaviorsPublicAPI',
    'documentServices/siteMetadata/siteMetadataPublicAPI',
    'documentServices/feedback/feedbackPublicAPI',
    'documentServices/saveAPI/savePublicAPI',
    'documentServices/structure/structurePublicAPI',
    'documentServices/documentMode/documentModePublicAPI',
    'documentServices/menu/menuPublicAPI',
    'documentServices/componentDetectorAPI/componentDetectorPublicAPI',
    'documentServices/editorData/editorDataPublicAPI',
    'documentServices/wixapps/wixapps',
    'documentServices/smartBoxes/smartBoxes',
    'documentServices/tpa/tpaPublicAPI',
    'documentServices/bi/biPublicAPI',
    'documentServices/renderPlugins/renderPluginsPublicApi',
    'documentServices/mobileConversion/mobilePublicAPI',
    'documentServices/errors/errorsPublicAPI',
    'documentServices/layouters/layoutersPublicAPI',
    'documentServices/media/mediaPublicAPI',
    'documentServices/wixCode/wixCodePublicAPI',
    'documentServices/connections/connectionsPublicAPI',
    'documentServices/appControllerData/appControllerDataPublicAPI',
    'documentServices/siteMembers/siteMembersPublicAPI',
    'documentServices/platform/platformPublicAPI',
    'documentServices/routers/routersPublicAPI',
    'documentServices/autosave/autosavePublicAPI'
], function (_, jsonConfig) {
    'use strict';

    var modules = _.drop(arguments, 2);

    function getConfig(){
        return {
            modules: modules,
            shouldRender: false,
            isReadOnly: false,
            isTest: true,
            noUndo: false,
            runStylesGC: false,
            pathsInJsonData: jsonConfig.getPathsInJsonData(),
            undoablePaths: jsonConfig.getWhiteList(),
            nonUndoablePaths: jsonConfig.getNonUndoableList()
        };
    }

    return {
        getConfig: getConfig
    };
});
