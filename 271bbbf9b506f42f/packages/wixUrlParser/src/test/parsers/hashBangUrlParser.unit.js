define(['lodash', 'testUtils', 'wixUrlParser/parsers/hashBangUrlParser'], function (_, testUtils, /** core.wixUrlParser */ hashBangUrlParser) {
    "use strict";

    describe("hashBangUrlParser", function () {
        beforeEach(function () {
            this.siteDataMock = testUtils.mockFactory
              .mockSiteData()
              .addPageWithDefaults('home')
              .addPageWithDefaults('page1')
              .setCurrentPage('home');

            this.siteDataMock = _.assign(this.siteDataMock, {
                getMainPageId: jasmine.createSpy('getMainPageId').and.returnValue('home'),
                getAllPageIds: jasmine.createSpy('getAllPageIds').and.returnValue(['home', 'page1']),
                currentUrl: {
                    protocol: 'http:',
                    hostname: 'mockHostName',
                    path: '/mockPath',
                    full: "http://mockHostName/mockPath",
                    query: {}
                },
                isUsingUrlFormat: function () {
                    return false;
                },
                getUrlFormat: function () {
                    return 'hashBang';
                },
                getExternalBaseUrl: function () {
                    return "http://mockHostName/mockPath";
                },
                getUnicodeExternalBaseUrl: function () {
                    return "http://mockHostName/mockPath";
                }
            });

        });

            describe("getUrl", function () {
                beforeEach(function () {
                    this.siteDataMock.currentUrl.query = {};
                });

                it("should return url for pageId", function () {
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'page1',
                        title: 'pageTitle'
                    });

                    expect(url).toBe("http://mockHostName/mockPath#!pageTitle/page1");
                });

                it("should return only base for home page", function () {
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'home',
                        title: 'someTitle'
                    });

                    expect(url).toBe("http://mockHostName/mockPath");
                });

                it("should return full url for home page but forceAddHash is true", function () {
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'home',
                        title: 'someTitle'
                    }, true);

                    expect(url).toBe("http://mockHostName/mockPath#!someTitle/home");
                });

                it("should return correct url for zoom image", function () {
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'page1',
                        pageItemId: 'image1',
                        title: 'imageTitle',
                        imageZoom: true
                    });

                    expect(url).toBe("http://mockHostName/mockPath#!imageTitle/zoom/page1/image1");
                });

                it("should return url for item id + additionalInfo", function () {
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageItemId: 'item1',
                        pageAdditionalData: 'productTitle/productId',
                        title: 'product'
                    });

                    expect(url).toBe("http://mockHostName/mockPath#!product/item1/productTitle/productId");
                });

                it("should return url for page id + additionalInfo", function () {
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'page1',
                        title: 'pageTitle',
                        pageAdditionalData: 'someTPAStuff'
                    });

                    expect(url).toBe("http://mockHostName/mockPath#!pageTitle/page1/someTPAStuff");
                });

                it("should add existing query to query", function () {
                    this.siteDataMock.currentUrl.query = {a: 'a', b: 'b'};
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'page1',
                        title: 'pageTitle'
                    });

                    expect(url).toBe("http://mockHostName/mockPath?a=a&b=b#!pageTitle/page1");
                });

                it('should return url w/o query if cleanQuery param is true', function () {
                    this.siteDataMock.currentUrl.query = {a: 'a', b: 'b'};
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'page1',
                        title: 'pageTitle'
                    }, false, true);

                    expect(url).toBe("http://mockHostName/mockPath#!pageTitle/page1");
                });

                it('should return wixwebsite.com domain for non premium domains', function () {
                    spyOn(this.siteDataMock, 'getExternalBaseUrl').and.returnValue('http://user.wix.com/site');
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'home',
                        title: 'someTitle'
                    });

                    expect(url).toBe("http://user.wix.com/site");
                });

                it('should return url with overridden base url if one provided', function(){
                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'home',
                        title: 'someTitle'
                    }, false, false, 'overriddenBaseUrl');
                    expect(url).toBe('overriddenBaseUrl');
                });

                it("should return url for blog page", function () {
                    spyOn(this.siteDataMock, 'getDataByQuery').and.returnValue({
                        id: 'page1',
                        type: 'AppPage',
                        appPageType: 'AppPage',
                        appPageId: '7326bfbb-4b10-4a8e-84c1-73f776051e10'
                    });

                    var url = hashBangUrlParser.getUrl(this.siteDataMock, {
                        pageId: 'page1',
                        pageAdditionalData: '2016/10/10/aaa'
                    }, undefined, undefined, undefined, {'2016/10/10/aaa': {id:123, title:'bbb'}});

                    expect(url).toBe("http://mockHostName/mockPath#!bbb/page1/123");
                });
            });

            describe("parseUrl", function () {
                it("should support no page id and set page id to home page", function () {
                    var url = "http://mockHostName/mockPath";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({
                        pageId: 'home'
                    });
                });

                it("should add page title to pageInfo object from url", function () {
                    var url = "http://mockHostName/mockPath#!pageTitle/page1";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({
                        title: 'pageTitle',
                        pageId: 'page1'
                    });
                });

                it("should NOT add 'title' property if there is nothing between '#!' and '/' in the passed url", function () {
                    var url = "http://mockHostName/mockPath#!/pageId1";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed.title).toBeUndefined();
                });

                //isn't supported anymore
                xit("should support page id in the path for dev", function () {
                    var url = "base/page1";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({
                        pageId: 'page1'
                    });
                });

                it("should support page id and title !#title/pageid", function () {
                    var url = "http://mockHostName/mockPath#!pageTitle/page1";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({
                        title: 'pageTitle',
                        pageId: 'page1'
                    });
                });

                it("should support page with other stuff, like tpa data or app page data title/pageId/additionalInfo", function () {
                    var url = "http://mockHostName/mockPath#!pageTitle/page1/someText/someId";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({
                        title: 'pageTitle',
                        pageId: 'page1',
                        pageAdditionalData: 'someText/someId'
                    });
                });

                describe('handling external and internal urls', function () {
                    beforeEach(function () {
                        _.assign(this.siteDataMock.currentUrl, {
                            protocol: 'http:',
                            hostname: 'mockHostName',
                            path: '/currentSiteName',
                            full: "http://mockHostName/currentSiteName"
                        });
                        spyOn(this.siteDataMock, 'getExternalBaseUrl').and.callFake(function () {
                            return 'http://mockHostName/currentSiteName';
                        });
                    });

                    it('should return "null" when the passed url belongs to a different (external) website', function () {
                        var differentUserUrl = 'http://externalHost/externalPath';
                        var differentSiteNameUrl = 'http://mockHostName/externalPath';
                        var containingUrl = 'http://mockHostName/currentSiteName-containing';
                        var containedUrl = 'http://mockHostName/current';

                        expect(hashBangUrlParser.parseUrl(this.siteDataMock, differentUserUrl)).toEqual(null);
                        expect(hashBangUrlParser.parseUrl(this.siteDataMock, differentSiteNameUrl)).toEqual(null);
                        expect(hashBangUrlParser.parseUrl(this.siteDataMock, containingUrl)).toEqual(null);
                        expect(hashBangUrlParser.parseUrl(this.siteDataMock, containedUrl)).toEqual(null);
                    });

                    it('should return parsed url when the url belongs to the current site', function () {
                        var correctUrl = "http://mockHostName/currentSiteName#!pageTitle/page1";
                        var parsedCorrectly = {
                            title: 'pageTitle',
                            pageId: 'page1'
                        };

                        expect(hashBangUrlParser.parseUrl(this.siteDataMock, correctUrl)).toEqual(parsedCorrectly);
                    });

                    describe('When url hostname is Yandex WebVisor proxy', function () {

                        /**
                         * https://yandex.ru/support/metrika/general/counter-webvisor.xml
                         */

                        it('should consider it internal url and parse hash', function () {
                            var yandexProxyExampleUrl = 'http://fakeSubDomain.mtproxy.yandex.net/?SomeQuery#!somePageTitle/page1';
                            var parsedCorrectly = {
                                title: 'somePageTitle',
                                pageId: 'page1'
                            };

                            expect(hashBangUrlParser.parseUrl(this.siteDataMock, yandexProxyExampleUrl)).toEqual(parsedCorrectly);
                        });
                    });
                });

                describe('Handling International Domain Names which are represented differently in some browsers', function () {
                    beforeEach(function () {
                        spyOn(this.siteDataMock, 'getExternalBaseUrl').and.callFake(function () {
                            // Punicode representation of IDN
                            return 'http://www.xn---63-rddnckl6ad4abij8byf.xn--p1ai/';
                        });
                        spyOn(this.siteDataMock, 'getUnicodeExternalBaseUrl').and.callFake(function () {
                            return 'http://www.купить-теплицу63.рф/';
                        });
                    });

                    describe('In Firefox and IE', function () {
                        beforeEach(function () {
                            var tempCurrentUrl = {
                                "full": "http://www.купить-теплицу63.рф/#!buy-a-greenhouse/page1",
                                "protocol": "http:",
                                "host": "www.купить-теплицу63.рф",
                                "hostname": "www.купить-теплицу63.рф",
                                "port": "",
                                "path": "/",
                                "search": "",
                                "query": {},
                                "hash": "#!buy-a-greenhouse/c1ylq"
                            };
                            _.assign(this.siteDataMock.currentUrl, tempCurrentUrl);
                        });

                        it('Should parse the candidate url', function () {
                            var candidate = "http://www.купить-теплицу63.рф/#!buy-a-greenhouse/page1";
                            var parsedCorrectly = {
                                title: "buy-a-greenhouse",
                                pageId: "page1"
                            };

                            expect(hashBangUrlParser.parseUrl(this.siteDataMock, candidate)).toEqual(parsedCorrectly);
                        });
                    });

                    describe('In Chrome', function () {
                        beforeEach(function () {
                            var tempCurrentUrl = {
                                "full": "http://www.xn---63-rddnckl6ad4abij8byf.xn--p1ai/#!buy-a-greenhouse/page1",
                                "protocol": "http:",
                                "host": "www.xn---63-rddnckl6ad4abij8byf.xn--p1ai",
                                "hostname": "www.xn---63-rddnckl6ad4abij8byf.xn--p1ai",
                                "port": "",
                                "path": "/",
                                "search": "",
                                "query": {},
                                "hash": "#!buy-a-greenhouse/c1ylq"
                            };
                            _.assign(this.siteDataMock.currentUrl, tempCurrentUrl);
                        });

                        it('Should parse the candidate url', function () {
                            var candidate = "http://www.xn---63-rddnckl6ad4abij8byf.xn--p1ai/#!buy-a-greenhouse/page1";
                            var parsedCorrectly = {
                                title: "buy-a-greenhouse",
                                pageId: "page1"
                            };

                            expect(hashBangUrlParser.parseUrl(this.siteDataMock, candidate)).toEqual(parsedCorrectly);
                        });

                    });
                });

                describe("when 'zoom' url is passed", function () {

                    it("should support image zoom imageTitle/zoom/imageId/pageId", function () {
                        var url = "http://mockHostName/mockPath#!imageTitle/zoom/page1/image1";
                        var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                        expect(parsed).toEqual({
                            title: 'imageTitle',
                            pageId: 'page1',
                            pageItemId: 'image1',
                            imageZoom: true
                        });
                    });

                    it("should NOT add 'title' property to pageInfo if it's an empty string", function () {
                        var url = "http://mockHostName/mockPath#!/zoom/page1/image1";
                        var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                        expect(parsed.title).toBeUndefined();
                    });

                });

                it("should support other page item (perma link), pageId should be home page title/itemId/additionalInfo", function () {
                    var url = "http://mockHostName/mockPath#!itemTitle/perma1/someText";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({
                        title: 'itemTitle',
                        pageId: 'home',
                        pageItemId: 'perma1',
                        pageAdditionalData: 'someText'
                    });
                });

                it("should support already simply parsed url", function () {
                    var url = "http://mockHostName/mockPath#!pageTitle/page1";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, {
                        hostname: 'mockHostName',
                        path: '/mockPath',
                        full: url,
                        hash: "#!pageTitle/page1",
                        protocol: 'http:'
                    });

                    expect(parsed).toEqual({
                        title: 'pageTitle',
                        pageId: 'page1'
                    });
                });

                it('Should support links with "|" before their pageId', function () {
                    var url = "http://mockHostName/mockPath#!pageTitle|page1";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({
                        title: 'pageTitle',
                        pageId: 'page1'
                    });
                });

                it("should return mainPage if wrong base and currentUrl is equal to url", function () {
                    var url = "wrong";
                    this.siteDataMock.currentUrl.full = "wrong";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({
                        pageId: 'home'
                    });
                });

                it("should return null if wrong base and current is not equal to url", function () {
                    var url = "wrong#!pageTitle/page1";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toBeNull();
                });

                it("should return the mainPageId if there is no match after a hashbang/hash", function () {
                    var url = "http://mockHostName/mockPath#!pageTitle";
                    var parsed = hashBangUrlParser.parseUrl(this.siteDataMock, url);

                    expect(parsed).toEqual({pageId: this.siteDataMock.getMainPageId()});
                });

            });
        });

});
