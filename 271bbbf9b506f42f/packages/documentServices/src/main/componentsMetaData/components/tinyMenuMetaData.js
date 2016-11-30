define(['lodash'], function (_) {
    'use strict';

    return {
        canBeFixedPosition: true,
        layoutLimits: {minWidth: 40, minHeight: 40},

        modal: function (ps, compPointer) {
            var renderFlagPointer = ps.pointers.general.getRenderFlag('componentPreviewStates');
            var componentPreviewStates = ps.dal.get(renderFlagPointer, {});
            return _.get(componentPreviewStates, compPointer.id) === 'open';
        },

        styleCanBeApplied: function (ps) {
            var isStudioUserPointer = ps.pointers.general.getIsStudioUser();
            return ps.dal.get(isStudioUserPointer);
        },

        mobileOnly: true
    };
});
