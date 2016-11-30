define(['lodash', 'wPhoto'], function (_, wPhoto) {
    'use strict';

    /**
     * @class components.ClipArt
     * @extends {components.WPhoto}
     */
    var ClipArt = _.cloneDeep(wPhoto);

    ClipArt.displayName = "ClipArt";

    return ClipArt;
});
