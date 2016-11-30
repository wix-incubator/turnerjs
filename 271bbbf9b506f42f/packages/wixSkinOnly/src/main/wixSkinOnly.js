define(['core'], function (core) {
    'use strict';

    var mixins = core.compMixins;

    return {
        displayName: "WixSkinOnly",

        mixins: [mixins.skinBasedComp],

        statics: {
            useSantaTypes: true
        },

        getSkinProperties: function () {
            return {};
        }
    };
});
