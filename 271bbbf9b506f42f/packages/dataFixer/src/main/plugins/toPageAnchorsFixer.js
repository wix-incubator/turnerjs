define(['lodash'], function(_) {
    'use strict';

    //you can reproduce the issue by adding a component bigger than page clicking it once and saving..

    function childrenAnchorsExist(childrenArr) {
        var childComp = _.first(childrenArr);
        return !!(_.get(childComp, 'layout.anchors'));
    }

    /**
     * @exports utils/dataFixer/plugins/toPageAnchorsFixer
     * @type {{exec: exec}}
     */
    var exports = {
        exec: function (pageJson) {
            var structureData = pageJson.structure;
            if (structureData && structureData.components && !_.isEmpty(structureData.components) && childrenAnchorsExist(structureData.components)) {
                var bottomMost = _.max(structureData.components, function (compStructure) {
                    var bottom = -1 * Number.MAX_VALUE;
                    if (compStructure.layout && _.isNumber(compStructure.layout.y) && _.isNumber(compStructure.layout.height)) {
                        bottom = compStructure.layout.y + compStructure.layout.height;
                    }
                    return bottom;
                });
                var toParentAnchor;
                if (bottomMost.layout && bottomMost.layout.anchors) {
                    toParentAnchor = _.find(bottomMost.layout.anchors, {'type': 'BOTTOM_PARENT'});
                }
                if (!toParentAnchor) {
                    bottomMost.layout = bottomMost.layout || {};
                    bottomMost.layout.anchors = bottomMost.layout.anchors || [];
                    bottomMost.layout.anchors.push({
                        distance: 0,
                        type: "BOTTOM_PARENT",
                        targetComponent: pageJson.structure.id,
                        locked: true,
                        originalValue: pageJson.structure.layout.height,
                        topToTop: bottomMost.layout.y
                    });
                }
            }
            //didn't see this problem in mobile
        }
    };

    return exports;
});
