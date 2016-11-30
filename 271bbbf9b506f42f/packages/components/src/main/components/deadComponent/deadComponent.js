define(['core'], function (core) {
    'use strict';

    var mixins = core.compMixins;

    /**
     * @class components.DeadComponent
     * @extends {core.skinBasedComp}
     */
    return {
        displayName: 'DeadComponent',
        mixins: [mixins.skinBasedComp],
        getSkinProperties: function () {
            return {
                title: {
                },
                desc: {
                },
                desc2: {
                }
            };
        }

    };
});