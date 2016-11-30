define([], function() {
    'use strict';
    var metaData = {
        canBeStretched: true,
        styleCanBeApplied:true,
        layoutLimits: {
            minWidth: 45,
            minHeight: 70
        },

        defaultMobileProperties: function (ps, comp, desktopProps) {
            return {
                margin: Math.min(20, desktopProps.margin),
                numCols: desktopProps.numCols >= 2 ? 2 : 1
            };
        },

        mobileConversionConfig: {
            category: 'visual',
            preserveAspectRatio: false
        }
    };

    return metaData;
});
