define(['core', 'utils'], function( /** core */ core, utils) {
    'use strict';


    /**
     * @class components.BgImageStrip
     * @extends {core.skinBasedComp}
     */



    return {
        displayName: "BgImageStrip",
        mixins: [core.compMixins.skinBasedComp],
        getSkinProperties: function() {

            return {
                "bg": {
                    style: {},
                    'data-type': utils.balataConsts.BG_IMAGE
                }
            };
        }
    };
});
