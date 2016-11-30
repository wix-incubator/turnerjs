define([
    'utils', 'lodash'
], function (utils, _) {
    'use strict';

    function translate(lang, key) {
        var blogTranslations = utils.translations.blogTranslations;
        var valueInSelectedLang = _.get(blogTranslations, [lang, key]);
        
        var defaultLang = 'en';
        return valueInSelectedLang || _.get(blogTranslations, [defaultLang, key]) || key; 
    }

    return {
        translate: translate
    };
});
