define(['editingRendererPlugins/plugins/componentsPlugin'], function (componentsPlugin) {
    'use strict';

    // External Api (public methods) Object
    var external = {};

    // Public Methods
    external.init = function init() {
        componentsPlugin.extendViewerComponents();
    };

    return external;
});
