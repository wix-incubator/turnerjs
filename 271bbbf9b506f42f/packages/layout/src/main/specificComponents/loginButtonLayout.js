define(['lodash', 'layout/util/layout'], function(_, /**layout.layout*/ layout) {
    'use strict';

    function measureLoginButton(id, measureMap) {
        var containerId = id + "container";
        measureMap.minHeight[id] = measureMap.height[containerId];

        if (measureMap.height[containerId] > measureMap.height[id]) {
            measureMap.height[id] = measureMap.height[containerId];
        }
    }

    function patchLoginButton(id, patchers, measureMap) {
        var containerId = id + "container";
        var componentHeight = measureMap.height[id];
        var textContainerHeight = measureMap.height[containerId];

        var containerMarginTop = (componentHeight - textContainerHeight) / 2;
        patchers.css(containerId, {
            'margin-top': containerMarginTop + "px"
        });
    }

    layout.registerRequestToMeasureChildren("wysiwyg.viewer.components.LoginButton", [["container"]]);
    layout.registerCustomMeasure("wysiwyg.viewer.components.LoginButton", measureLoginButton);
    layout.registerSAFEPatcher("wysiwyg.viewer.components.LoginButton", patchLoginButton);
});