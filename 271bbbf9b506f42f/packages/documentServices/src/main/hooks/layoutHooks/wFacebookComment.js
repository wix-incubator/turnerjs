define(['documentServices/component/component', 'documentServices/documentMode/documentModeInfo'], function (component, documentModeInfo) {
    'use strict';

    return function (ps, compPointer, newLayout) {
        if (!newLayout.width || documentModeInfo.isMobileView(ps)) {
            return;
        }

        component.properties.update(ps, compPointer, {width: Math.max(newLayout.width, 400)});
    };
});