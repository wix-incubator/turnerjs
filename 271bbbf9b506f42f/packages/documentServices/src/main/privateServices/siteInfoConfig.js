define([
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
    function () {
        "use strict";

        return {
            modules: arguments,
            shouldRender: false,
            isReadOnly: true,
            noUndo: true,
            pathsInJsonData: {siteData: [{path :['pagesData'], optional: false}, {path :['editorData'], optional: false}]},
            undoablePaths: []
        };
    });
