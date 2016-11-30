define([], function () {
    'use strict';

    return {
        canBeStretched: true,
        styleCanBeApplied: true,

        defaultMobileProperties: function (ps, comp, desktopProps) {
            return {
                margin: Math.min(20, desktopProps.margin),
                numCols: Math.min(2, desktopProps.numCols)
            };
        },

        mobileConversionConfig: {
            category: 'visual',
            preserveAspectRatio: false
        }
    };
});
