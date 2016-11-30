define([
    'documentServices/constants/constants',
    'documentServices/structure/siteGapMap',
    'experiment'
], function (consts, siteGapMap, experiment) {
    'use strict';

    function canBeFixedPosition(ps, compPointer) {
        return !ps.pointers.components.isMobile(compPointer);
    }

    return {
        resizableSides: [consts.RESIZE_SIDES.BOTTOM],
        moveDirections: function (ps) {
            if (experiment.isOpen('sv_zeroGapsThreshold')) {
                return [consts.MOVE_DIRECTIONS.VERTICAL];
            }
            var initialSiteGapMap = siteGapMap.getInitialGapMap(ps);
            return initialSiteGapMap.aboveHeader >= consts.SITE_SEGMENTS_GAP_THRESHOLD ? [consts.MOVE_DIRECTIONS.VERTICAL] : [];
        },
        canBeFixedPosition: canBeFixedPosition,
        removable: false,
        duplicatable: false,
        containable: false,
        fullWidth: true,
        enforceContainerChildLimitsByHeight: function(ps, compPointer) {
            return !ps.pointers.components.isMobile(compPointer);
        },
        styleCanBeApplied: function (ps) {
            var isStudioUserPointer = ps.pointers.general.getIsStudioUser();
            return ps.dal.get(isStudioUserPointer);
        },
        hiddenable: false,
        collapsible: false,
        mobileConversionConfig: {
            preserveAspectRatio: false,
            minHeight: 90,
            topRightMargin: [90, 90],
            descendantImageScaleFactor: 0.7,
            category: 'siteSegments'
        }
    };
});
