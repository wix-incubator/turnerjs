define([
    'documentServices/constants/constants',
    'documentServices/structure/siteGapMap',
    'experiment'
], function (consts, siteGapMap, experiment) {
    'use strict';

    return {
        anchors: {
            to: {allow: true, allowBottomBottom: false, lock: consts.ANCHORS.LOCK_CONDITION.THRESHOLD},
            from: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS}
        },
        resizableSides: [],
        moveDirections: function(ps) {
            if (experiment.isOpen('sv_zeroGapsThreshold')) {
                return [consts.MOVE_DIRECTIONS.VERTICAL];
            }
            var initialSiteGapMap = siteGapMap.getInitialGapMap(ps);
            return initialSiteGapMap.abovePagesContainer >= consts.SITE_SEGMENTS_GAP_THRESHOLD ? [consts.MOVE_DIRECTIONS.VERTICAL] : [];
        },
        removable: false,
        duplicatable: false,
        containable: false,
        fullWidth: false,
        hiddenable: false,
        collapsible: false,
        mobileConversionConfig: {
            marginX: 20,
            category: 'siteSegments'
        }
    };
});
