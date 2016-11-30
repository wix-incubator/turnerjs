define(function() {
    'use strict';

    var COMPOSER_KEY = 'wixapps';

    function compose(ps, pageData) {
        return {
            countByParts: composePartsCountByType(ps, pageData)
        };
    }

    /*eslint no-unused-vars:0*/
    function composePartsCountByType(ps, pageData) {
        // do something with pageData
        return null;
    }

    return {
        key: COMPOSER_KEY,
        compose: compose
    };
});