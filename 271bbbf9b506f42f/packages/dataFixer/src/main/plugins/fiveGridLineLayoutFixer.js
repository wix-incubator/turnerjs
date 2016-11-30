define(['lodash'], function(_) {
    'use strict';

    var skinToLayoutMap = {
        'wysiwyg.viewer.skins.line.FadeLine': {width: 90},
        'wysiwyg.viewer.skins.line.FadeNotchBottomLine': {width: 60},
        'wysiwyg.viewer.skins.line.FadeNotchTopLine': {width: 60},
        'wysiwyg.viewer.skins.line.ShadowBottomLine': {width: 200},
        'wysiwyg.viewer.skins.line.ShadowTopLine': {width: 200}
    };

    function fixFiveGridLineLayout(comps) {
        _.forEach(comps, function (comp) {
            if (_.has(skinToLayoutMap, comp.skin)) {
                var layout = skinToLayoutMap[comp.skin];
                comp.layout = _.mapValues(comp.layout, function (val, key) {
                    if (layout[key]) {
                        return Math.max(val, layout[key]);
                    }
                    return val;
                });
            }

            if (comp.components) {
                fixFiveGridLineLayout(comp.components);
            }
        });
    }

    /**
     * @exports utils/dataFixer/plugins/fiveGridLineLayoutFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            var structureData = pageJson.structure;
            if (!structureData) {
                return;
            }
            if (structureData.components) {
                fixFiveGridLineLayout(structureData.components);
            }
            if (structureData.children) {
                fixFiveGridLineLayout(structureData.children);
            }
            if (structureData.mobileComponents) {
                fixFiveGridLineLayout(structureData.mobileComponents);
            }
        }
    };

    return exports;
});