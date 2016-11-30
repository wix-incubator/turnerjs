define([
        'documentServices/componentDetectorAPI/componentDetectorPublicAPI',
        'documentServices/dataModel/dataModelPublicAPI',
        'documentServices/menu/menuPublicAPI',
        'documentServices/page/pagePublicAPI',
        'documentServices/wixapps/wixapps',
        'documentServices/bi/biPublicAPI'
    ],
    function () {
        "use strict";

        return {
            modules: arguments,
            isReadOnly: false,
            shouldRender: false,
            noUndo: false,
            pathsInJsonData: {
                siteData: [{
                    path: ['rendererModel'],
                    optional: false
                }, {
                    path: ['wixapps'],
                    optional: false
                }]
            },
            undoablePaths: []
        };
    });
