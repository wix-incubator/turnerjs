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
        'documentServices/validation/validationPublicAPI',
        'documentServices/media/mediaPublicAPI',
        'documentServices/wixCode/wixCodePublicAPI',
        'documentServices/siteMembers/siteMembersPublicAPI',
        'documentServices/connections/connectionsPublicAPI',
        'documentServices/appControllerData/appControllerDataPublicAPI',
        'documentServices/platform/platformPublicAPI',
        'documentServices/routers/routersPublicAPI',
        'documentServices/autosave/autosavePublicAPI',
        'documentServices/deprecation/deprecationPublicAPI'
    ],
    function(_, jsonConfig){
        "use strict";

        var modules = _.drop(arguments, 2);

        function getFullConfig(){
            return {
                modules: modules,
                shouldRender: true,
                isReadOnly: false,
                noUndo: false,
                runStylesGC: true,
                pathsInJsonData: jsonConfig.getPathsInJsonData(),
                undoablePaths: jsonConfig.getWhiteList(),
                nonUndoablePaths: jsonConfig.getNonUndoableList(),
                autosavePaths: jsonConfig.getAutosavePaths()
            };
        }

        return {
            getConfig: getFullConfig
        };
    });
