define(['lodash', 'testUtils', 'wixUrlParser'], function (_, testUtils, /** core.wixUrlParser */ wixUrlParser) {
    "use strict";

    describe("wixUrlParser", function () {

        function getUrlWithPath(siteData, path) {
            return siteData.getExternalBaseUrl() + (path || '');
        }

        function addPage(siteData, id, title) {
            siteData.addPageWithData(id, {pageUriSEO: title});
        }

        function setSiteFormat(siteData, format){
            siteData.urlFormatModel = {format: format || 'hashBang'};
        }

        function parseWithFormat(siteData, url, format){
            setSiteFormat(siteData, format);
            return wixUrlParser.parseUrl(siteData, url);
        }

        describe('parseUrl', function () {

            var url, mockSiteData, parsed;

            beforeEach(function () {
                mockSiteData = testUtils.mockFactory.mockSiteData();

                spyOn(mockSiteData, 'getExternalBaseUrl').and.returnValue('http://mockHostName/mockPath');

                addPage(mockSiteData, 'page-id', 'page-title');
            });

            it('should return null if the url is an external url', function () {
                var actual = wixUrlParser.parseUrl(mockSiteData, 'http://someexternaldomain.com/somepath');
                expect(actual).toBe(null);
            });

            it('should parse the current url if only a hash is sent as the url', function () {
                mockSiteData.currentUrl.full = getUrlWithPath(mockSiteData);

                var actual = wixUrlParser.parseUrl(mockSiteData, '#');
                var expected = wixUrlParser.parseUrl(mockSiteData, mockSiteData.currentUrl.full);

                expect(actual).toEqual(expected);
            });

            it('should parse url with page info in #!', function(){
                url = getUrlWithPath(mockSiteData, '#!page-title/page-id');
                parsed = wixUrlParser.parseUrl(mockSiteData, url);

                expect(parsed.pageId).toBe('page-id');
                expect(parsed.title).toBe('page-title');
            });

            it('should parse url with page info in path if site format is "slash"', function(){
                url = getUrlWithPath(mockSiteData, '/page-title');
                parsed = parseWithFormat(mockSiteData, url, 'slash');

                expect(parsed.pageId).toBe('page-id');
                expect(parsed.title).toBe('page-title');
            });

            it('should parse the same page id from both url parsers', function(){
                url = getUrlWithPath(mockSiteData);

                var parsedWithSlash = parseWithFormat(mockSiteData, url, 'slash');
                var parsedWithHashBang = parseWithFormat(mockSiteData, url, 'hashBang');

                expect(parsedWithSlash.pageId).toEqual(parsedWithHashBang.pageId);
            });

            describe('Wix Mobile App Banner integration', function(){
                it('should return null if the url is for the wix mobile app in slash format', function () {
                    var wixMobileAppUrl = mockSiteData.getExternalBaseUrl() + '/app';
                    var actual = parseWithFormat(mockSiteData, wixMobileAppUrl, 'slash');
                    expect(actual).toBe(null);
                });
                it('should return null if the url is for the wix mobile app in hashbang format', function () {
                    var wixMobileAppUrl = mockSiteData.getExternalBaseUrl() + '/app';
                    var actual = parseWithFormat(mockSiteData, wixMobileAppUrl, 'hashBang');
                    expect(actual).toBe(null);
                });
            });

        });

    });
});
