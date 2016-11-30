define(['lodash', 'documentServices/tpa/tpa', 'documentServices/tpa/core'], function(_, tpa, tpaCore){
    "use strict";

    return {
        methods: {
            tpa: _.merge(tpaCore, _.omit(tpa, 'initialize'))
        },
        initMethod: tpa.initialize
    };
});