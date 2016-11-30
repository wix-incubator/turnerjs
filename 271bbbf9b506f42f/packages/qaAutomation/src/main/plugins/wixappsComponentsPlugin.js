/**
 *  Plugin functions that extend the viewer components to support the editing services
 **/

define(['skins'], function (skins) {
    'use strict';

    function init() {
        extendViewerComponents();
    }

    function addAppPartData(refData, skinTree, structure) {
        if (structure.componentType === "wixapps.integration.components.AppPart" ||
            structure.componentType === "wixapps.integration.components.AppPart2") {
            refData[""]["data-data-query"] = structure.dataQuery;
        }
    }

    function extendViewerComponents() {
        skins.registerRenderPlugin(addAppPartData);
    }

    return {
        init: init
    };
});
