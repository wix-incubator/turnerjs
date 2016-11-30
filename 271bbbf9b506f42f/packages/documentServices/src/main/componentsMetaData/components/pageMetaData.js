define(['documentServices/constants/constants'], function (consts) {
    'use strict';

    var metaData = {
        anchors: {
            to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.NEVER},
            from: false
        },
        resizableSides: [],
        moveDirections: [],
        containable: false,
        duplicatable: false,
        removable: false,
        fullWidth: true,
        styleCanBeApplied: function (ps, compRef) {
            return !(ps.siteAPI.getCurrentPopupId() === compRef.id);
        },
        hiddenable: false,
        collapsible: false,
        dockable: false,
        mobileConversionConfig: {
            marginX: 20,
            category: 'page'
        }
    };

    return metaData;
});
