define(['documentServices/constants/constants', 'documentServices/constants/constants'], function (consts, constants) {
    'use strict';

    return {
        anchors: {
            to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.THRESHOLD},
            from: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.ALWAYS}
        },
        resizableSides: [constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM],
        containable: false
    };
});