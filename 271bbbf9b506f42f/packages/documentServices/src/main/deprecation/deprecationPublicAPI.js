/**
 * Created by alexandreroitman on 23/11/2016.
 */
define(['documentServices/deprecation/deprecation'],
    function (deprecation) {
        'use strict';

        return {
            methods: {
                deprecation: {
                    setThrowOnDeprecation: deprecation.setThrowOnDeprecation
                }
            }
        };
    });
