/**
 *  Plugin functions that extend the viewer components to support the editing services
 **/

define(['skins'], function(skins) {
    'use strict';

    // External Api (public methods) Object
    var external = {};

    // Public Methods
    external.extendViewerComponents = function extendViewerComponents(){
        skins.registerRenderPlugin(markComponentHtmlElements);
    };

    function markComponentHtmlElements(refData){
        refData['']['data-wix-component'] = '';
    }

    return external;
});
