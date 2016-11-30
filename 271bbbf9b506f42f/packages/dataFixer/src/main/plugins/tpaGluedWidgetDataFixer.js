define(['lodash'], function (_) {
    'use strict';

    return {
        /*
         * Add a 'fixedPosition: true' property to glued widgets' layout
         */
        exec: function (pageJson) {
            _.forEach(pageJson.structure.children, function (compStructure) { //eslint-disable-line lodash3/prefer-filter
                if (compStructure.componentType === 'wysiwyg.viewer.components.tpapps.TPAGluedWidget') {
                    compStructure.layout.fixedPosition = true;
                }
            });
        }
    };
});
