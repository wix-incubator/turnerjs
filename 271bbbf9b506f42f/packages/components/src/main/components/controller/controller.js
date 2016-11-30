define(['core'], function (core) {
    'use strict';

    var mixins = core.compMixins;

    return {
        displayName: "Controller",

        mixins: [mixins.skinBasedComp],
        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () {
            return {};
        }
    };
});
