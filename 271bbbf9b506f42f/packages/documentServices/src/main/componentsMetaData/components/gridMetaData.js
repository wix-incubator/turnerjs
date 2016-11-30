define([], function () {
    'use strict';

    return {
        defaultMobileProperties: {
            columnLayout: 'manual'
        },
        mobileConversionConfig: {
            fixedSize: function (ps, component) {
                return {height: component.layout.height};
            }
        }
    };
});
