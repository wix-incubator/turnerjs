define(['lodash'], function (_) {
    'use strict';

    var GROUP_COMP_TYPE = 'wysiwyg.viewer.components.Group';
    var GROUP_SKIN = 'wysiwyg.viewer.components.GroupSkin';

    function fixSkin(compStructure) {
        if (compStructure.componentType === GROUP_COMP_TYPE) {
            compStructure.skin = GROUP_SKIN;
        }
    }

    function runOnAllComps(comps) {
        _.forEach(comps, function fixGroupCompSkin(comp) {
            fixSkin(comp);
            runOnAllComps(comp.components);
        });
    }

    var exports = {
        exec: function (pageJson) {
            var structureData = pageJson.structure;
            if (structureData) {
                var desktopComps = structureData.components || structureData.children;
                var mobileComps = structureData.mobileComponents;

                if (desktopComps) {
                    runOnAllComps(desktopComps);
                }

                if (mobileComps) {
                    runOnAllComps(mobileComps);
                }
            }
        }
    };

    return exports;
});
