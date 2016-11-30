define(['lodash', 'documentServices/component/component'], function (_, component) {
    'use strict';

    return function (ps, compPointer, newLayout) {
        if (_.isUndefined(newLayout.height)) {
            return;
        }
        component.properties.update(ps, compPointer, {height: newLayout.height});
    };
});