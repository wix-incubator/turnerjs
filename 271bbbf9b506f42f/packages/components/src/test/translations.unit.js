define([
    'lodash',
    'utils',
    //'components/components/dialogs/translations/dialogMixinTranslations',
    'wixSites/components/homePageLogin/translations/homePageLoginTranslations',
    'loginButton/translations/loginButtonTranslations',
    'core/util/translations/siteMembersTranslations',
    'wixSites/components/wixOfTheDay/translations/wixOfTheDayTranslations'
],
function (_,
          utils,
          //dialogMixinTranslations,
          homePageLoginTranslations,
          loginButtonTranslations,
          siteMembersTranslations
          /*,
    wixOfTheDayTranslations*/) {
    'use strict';
    var translationFeatures = {
        contactForm: utils.translations.contactFormTranslations,
        //dialogMixin: dialogMixinTranslations
        homePageLogin: homePageLoginTranslations,
        loginButton: loginButtonTranslations,
        siteMembers: siteMembersTranslations,
        subscribeForm: utils.translations.subscribeFormTranslations
        //wixOfTheDay: wixOfTheDayTranslations
    };

    describe('translations', function() {
        _.forEach(translationFeatures, function(featureTranslations, featureName) {
           describe(featureName + 'Translations', function() {
               utils.languages.forEach(function (locale) {
                   it('should have same keys as english in ' + locale, function() {
                       expect(featureTranslations[locale]).toHaveAllKeysOf(featureTranslations.en, locale + ' ' + featureName);
                   });
               });
           });
        });
    });
});
