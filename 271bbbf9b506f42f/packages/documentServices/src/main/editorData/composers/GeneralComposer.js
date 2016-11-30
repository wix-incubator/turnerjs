define(function() {
    'use strict';

    var COMPOSER_KEY = 'general';

    function compose(ps, pageData) {
        return {
            pagesSEO: composePagesSEO(ps, pageData),
            siteType: composeSiteType(ps, pageData)
        };
    }

    /*eslint no-unused-vars:0*/
    function composePagesSEO(ps, pageData) {
        // do something with pageData
        return null;
    }

    /*eslint no-unused-vars:0*/
    function composeSiteType(ps, pageData) {
        // do something with pageData
        return null;
    }

    return {
        key: COMPOSER_KEY,
        compose: compose
    };
});
