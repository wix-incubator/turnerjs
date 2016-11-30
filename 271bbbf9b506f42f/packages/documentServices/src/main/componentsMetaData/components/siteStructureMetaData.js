define(['documentServices/constants/constants'], function (consts) {
    'use strict';

    return {
        anchors: {
            to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS, distance: 0},
            from: {allow: false, lock: consts.ANCHORS.LOCK_CONDITION.NEVER}
        },
        resizableSides: [],
        moveDirections: [],
        removable: false,
        duplicatable: false,
        containable: false,
        fullWidth: true,
        collapsible: false,
        hiddenable: false
    };
});
