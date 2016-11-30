define([], function () {
    'use strict';

    var ANCHOR_DEFAULT_MARGIN = 10;

    return {
        getAnchorMinDistance: function(anchor){
            return anchor.locked ? anchor.distance : ANCHOR_DEFAULT_MARGIN;
        }
    };
});
