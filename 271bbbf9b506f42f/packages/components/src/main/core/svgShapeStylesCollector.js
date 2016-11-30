define(['lodash', 'core'], function (_, /** core */ core) {
    'use strict';

    function addStyle(structureInfo, themeData, siteData, loadedStyles/*, pageId*/) {
        var styleId = _.get(structureInfo, 'styleItem.id') || _.get(structureInfo, 'structure.styleId');
        if (styleId) {
            loadedStyles[styleId] = styleId;
        }
        var structureOverrides = _.get(structureInfo.structure, ['modes', 'overrides']);
        _.forEach(structureOverrides, function (overrideObj) {
            var overrideStyleId = overrideObj.styleId;
            if (overrideStyleId && themeData[overrideStyleId]) {
                loadedStyles[overrideStyleId] = overrideStyleId;
            }
        });
    }

    core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.svgshape.SvgShape", addStyle);
    core.styleCollector.registerClassBasedStyleCollector("wysiwyg.viewer.components.PopupCloseIconButton", addStyle);
});
