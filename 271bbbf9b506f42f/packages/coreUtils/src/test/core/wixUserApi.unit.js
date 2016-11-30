define(['lodash', 'definition!coreUtils/core/wixUserApi', 'fake!coreUtils/core/cookieUtils', 'fake!coreUtils/core/ajaxLibrary'], function(_, WixUserApiDef, cookieUtils, ajaxLibrary) {
    'use strict';

    describe('WixUserApi', function() {

        var wixUserApi, siteData;
        var fakeLanguages = ['en', 'de', 'fr', 'es'];

        function initWixUserApi() {
            wixUserApi = new WixUserApiDef(_, fakeLanguages, cookieUtils, ajaxLibrary);
        }

        beforeEach(function() {
            siteData = {
                requestModel: {
                    cookie: 'someDocumentCookie'
                }
            };
            initWixUserApi();
        });

        describe('setLanguage', function() {

            beforeEach(function() {
                spyOn(ajaxLibrary, 'temp_jsonp');
            });

            it('Should send ajax call with setLanguage params', function() {
                var lang = 'de';
                var jsonpOnComplete = _.noop;

                wixUserApi.setLanguage(lang, null, jsonpOnComplete);

                var expectedArgs = {
                    url: "https://users.wix.com//wix-users//user/setLanguage?language=" + lang,
                    dataType: "jsonp",
                    data: { },
                    complete: jsonpOnComplete
                };
                var callArgs = ajaxLibrary.temp_jsonp.calls.mostRecent().args;
                expect(callArgs[0]).toEqual(expectedArgs);
            });

        });

        describe('getLanguage', function() {

            it('Should get default en as default language', function() {
                _.merge(siteData, {currentUrl: {host: 'wix.com'}});
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({});

                var lang = wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);

                expect(lang).toBe('en');
            });

            it('Should get lang from url query param as first priority', function() {
                _.merge(siteData, {currentUrl: {host: 'fr.wix.com'}});
                _.merge(siteData, {currentUrl: {query: {lang: 'es'}}});
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({wixLanguage: 'de'});

                var lang = wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);

                expect(lang).toBe('es');
            });

            it('Should get lang from domain as higher priority', function() {
                _.merge(siteData, {currentUrl: {host: 'fr.wix.com'}});
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({wixLanguage: 'de'});

                var lang = wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);

                expect(lang).toBe('fr');
            });

            it('Should get lang from wixLanguage cookie as fallback', function() {
                _.merge(siteData, {currentUrl: {host: 'wix.com'}});
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({wixLanguage: 'de'});

                var lang = wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);

                expect(lang).toBe('de');
            });

            it('should return a 2-letter lang string, and cut the region part', function() {
                _.merge(siteData, {currentUrl: {host: 'wix.com'}});
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({wixLanguage: 'es-ES'});

                var lang = wixUserApi.getLanguage(siteData.requestModel.cookie, siteData.currentUrl);

                expect(lang).toBe('es');
            });
        });

        describe('getUsername', function() {

            it('Should return null if there is no wixClient cookie', function() {
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({});

                var userName = wixUserApi.getUsername(siteData);

                expect(userName).toBe(null);
            });

            it('Should return parsed details from wixClient', function() {
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({
                    wixClient: 'myUser|myUser@wix.com|VERIFIED_OPT_IN|7662|1409817343817|1411113343817|dc6fabbd-0554-4c7f-a702-0b7266691277|{}'
                });

                var userName = wixUserApi.getUsername(siteData);

                expect(userName).toBe('myUser');
            });
        });

        describe('logout', function() {

            it('Should delete wixClient cookie', function() {
                _.merge(siteData, {currentUrl: {host: 'wix.com'}});
                spyOn(cookieUtils, 'deleteCookie');

                wixUserApi.logout(siteData);

                var deletedCookies = _.map(cookieUtils.deleteCookie.calls.allArgs(), _.first);
                expect(_.xor(deletedCookies, ['wixClient'])).toEqual([]);
            });
        });

        describe('isSessionValid', function() {

            it('Should be valid when wixClient exists', function() {
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({
                    wixClient: 'myUser|myUser@wix.com|VERIFIED_OPT_IN|7662|1409817343817|1411113343817|dc6fabbd-0554-4c7f-a702-0b7266691277|{}'
                });

                var isSessionValid = wixUserApi.isSessionValid(siteData.requestModel.cookie);

                expect(isSessionValid).toBe(true);
            });

            it('Should NOT be valid if wixClient does not exists', function() {
                spyOn(cookieUtils, 'parseCookieString').and.returnValue({});

                var isSessionValid = wixUserApi.isSessionValid(siteData.requestModel.cookie);

                expect(isSessionValid).toBe(false);
            });

        });
    });

});
