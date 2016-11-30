define(['lodash'], function(_) {
    'use strict';

    return {
        mobileConversionConfig: {
            isSuitableForProportionGrouping: true
        },
        rotatable: true,
        layoutLimits: function (ps, compPtr) {
            var styleId = ps.dal.get(ps.pointers.getInnerPointer(compPtr, 'styleId'));
            var styleObj = ps.dal.get(ps.pointers.data.getThemeItem(styleId.replace('#', '')));

            var strokeWidth = parseInt(_.get(styleObj, 'style.properties.strokewidth', 0), 0);
            var minWidth = strokeWidth + 1;
            var minHeight = strokeWidth + 1;

            var originalAspectRatio = ps.siteAPI.getShapeOriginalAspectRatio(compPtr);
            if (originalAspectRatio) {
                if (originalAspectRatio > 1) {
                    minHeight = strokeWidth + 1;
                    minWidth = minHeight * originalAspectRatio;
                } else {
                    minWidth = strokeWidth + 1;
                    minHeight = minWidth / originalAspectRatio;
                }
            }

            return {
                minWidth: Math.ceil(minWidth),
                minHeight: Math.ceil(minHeight),
                maxHeight: 2000
            };
        }
    };
});
