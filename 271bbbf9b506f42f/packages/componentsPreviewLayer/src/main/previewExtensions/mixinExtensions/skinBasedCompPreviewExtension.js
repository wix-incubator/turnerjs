define(['lodash', 'core', 'santaProps'], function(_, core, santaProps){
    'use strict';



    return {
        extension: {
            propTypes: {
                renderRealtimeConfig: santaProps.Types.renderRealtimeConfig
            }
        },
        mixin: core.compMixins.skinBasedComp
    };
});
