define(['documentServices/constants/constants'], function (consts) {
    'use strict';

    return {
        anchors: {
            to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.THRESHOLD},
            from: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS}
        },
        resizableSides: [],
        moveDirections: [],
        removable: false,
        duplicatable: false,
        fullWidth: true,
        collapsible: false,
        hiddenable: false
    };
});
