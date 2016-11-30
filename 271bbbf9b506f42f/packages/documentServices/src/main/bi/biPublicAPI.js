define(['documentServices/bi/bi'], function(bi) {
    "use strict";
    return {
        methods: {
            bi: {
                event: bi.event,
                error: bi.error,
                register: bi.register
            }
        }
    };
});

