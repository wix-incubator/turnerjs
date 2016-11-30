define([
        'lodash',
        'documentServices/jsonConfig/jsonConfig',
        'documentServices/page/pagePublicAPI',
        'documentServices/theme/themePublicAPI',
        'documentServices/component/componentPublicAPI',
        'documentServices/dataModel/dataModelPublicAPI',
        'documentServices/componentsMetaData/componentsMetaDataPublicAPI',
        'documentServices/actionsAndBehaviors/actionsAndBehaviorsPublicAPI',
        'documentServices/siteMetadata/siteMetadataPublicAPI',
        'documentServices/structure/structurePublicAPI',
        'documentServices/documentMode/documentModePublicAPI',
        'documentServices/menu/menuPublicAPI',
        'documentServices/componentDetectorAPI/componentDetectorPublicAPI',
        'documentServices/editorData/editorDataPublicAPI',
        'documentServices/wixapps/wixapps',
        'documentServices/mobileConversion/mobilePublicAPI'],
    function (_, jsonConfig) {
        "use strict";



        var modules = _.drop(arguments, 2);

        function getFullConfig(){
            return {
                modules: modules,
                shouldRender: false,
                isReadOnly: true,
                noUndo: true,
                pathsInJsonData: jsonConfig.getPathsInJsonData(),
                undoablePaths: []
            };
        }

        return {
            getConfig: getFullConfig
        };
    });
