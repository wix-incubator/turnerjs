define(['lodash', 'documentServices/component/component'], function (_, component) {
    'use strict';

    return function (ps, compPointer, layout) {
        var siteWidth, siteCenterX, menuOrientation;
        if (layout.docked) {
            menuOrientation = layout.docked.right ? 'right' : 'left';
        } else {
            siteWidth = ps.siteAPI.getSiteWidth();
            siteCenterX = siteWidth / 2;
            menuOrientation = layout.x + layout.width / 2 > siteCenterX ? 'right' : 'left';
        }

        component.properties.update(ps, compPointer, {orientation: menuOrientation});
    };
});
