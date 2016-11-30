define(['documentServices/validation/validation'],
    function (validation) {
        'use strict';

        return {
            methods: {
                validate: {
                    allComponents: validation.validateAllComponents,
                    components: validation.validateComponents
                }
            }
        };
    });
