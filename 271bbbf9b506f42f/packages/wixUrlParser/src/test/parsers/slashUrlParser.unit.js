define(['lodash', 'testUtils', 'coreUtils', 'wixUrlParser/parsers/slashUrlParser'], function (_, testUtils, coreUtils, /** core.wixUrlParser */ slashUrlParser) {
    "use strict";

    describe("slashUrlParser", function () {

        function mockDynamicRouter(mockSiteData, mockRouter){
            mockRouter = mockRouter || {
                prefix: 'david_animals',
                appId: '34234',
                config: {
                    routerFunctionName: 'animals',
                    siteMapFunctionName: 'siteMapFunc'
                }
            };
            mockSiteData.routers = {
                configMap:{
                    1: mockRouter
                }
            };
            return mockRouter;
        }
        function getMockSiteData() {
            return testUtils.mockFactory.mockSiteData();
        }

        function getMockPageData(title) {
            return {
                pageUriSEO: title
            };
        }

        function getMockTpaPageData(title) {
            return _.assign(getMockPageData(title), {tpaApplicationId: 1});
        }

        function getMockListBuilderPageData(title) {
            return _.assign(getMockPageData(title), {type: 'AppPage', appPageType: 'AppBuilderPage'});
        }

        function getMockBlogPageData(title) {
            return _.assign(getMockPageData(title), {
                type: 'AppPage',
                appPageType: 'AppPage',
                appPageId: '79f391eb-7dfc-4adf-be6e-64434c4838d9'
            });
        }

        function getMockBlogSinglePostPageData(title) {
            return _.assign(getMockPageData(title), {
                type: 'AppPage',
                appPageType: 'AppPage',
                appPageId: '7326bfbb-4b10-4a8e-84c1-73f776051e10'
            });
        }

        function addPage(siteData, title, dataGetter) {
            var id = title + '-id';
            dataGetter = dataGetter || getMockPageData;
            siteData.addPageWithData(id, dataGetter(title));
            return id;
        }

        function addTpaPage(siteData, title) {
            addPage(siteData, title, getMockTpaPageData);
        }

        function addListBuilderPage(siteData, title) {
            return addPage(siteData, title, getMockListBuilderPageData);
        }

        function addBlogPage(siteData, title) {
            addPage(siteData, title, getMockBlogPageData);
        }

        function addBlogSinglePostPage(siteData, title) {
            addPage(siteData, title, getMockBlogSinglePostPageData);
        }

        function getMockPermalinkData(id) {
            return {
                type: 'PermaLink',
                id: id
            };
        }

        function addPermalink(siteData, id) {
            siteData.addData(getMockPermalinkData(id));
        }

        function getUrlWithPath(path, type) {
            var hostsTypes = {
                premium: 'mockPremiumHostName',
                preview: 'a.b.com/c/d/e/f/g/h/i',
                review: 'editor.wix.com/html/editor/review',
                wixSite: 'www.wix.com/about/us',
                freeSite: 'username.wixsite.com/sitename'
            };

            var host = hostsTypes[type] || 'mockHostName/mockPath';

            return 'http://' + host + (path || '');
        }

        function setHomePageId(siteData, pageId){
            siteData.setMainPage(pageId);
        }

        function setUrlFormat(siteData, format){
            siteData.urlFormatModel.format = format;
        }

        function setCurrentRootInfo(siteData, url){
            siteData.setRootNavigationInfo(slashUrlParser.parseUrl(siteData, url));
        }

        function setPremiumFeatures(siteData, features){
            siteData.rendererModel.premiumFeatures = features;
        }

        function setPreviewMode(siteData){
            delete siteData.publicModel;
        }

        function setDocumentType(siteData, documentType){
            siteData.rendererModel.siteInfo.documentType = documentType;
        }

        describe('parseUrl', function () {

            beforeEach(function () {
                this.mockSiteData = getMockSiteData();
                this.homePageId = addPage(this.mockSiteData, 'mock-home-page');

                spyOn(this.mockSiteData, 'getExternalBaseUrl').and.returnValue(getUrlWithPath());

                setUrlFormat(this.mockSiteData, 'slash');
                setHomePageId(this.mockSiteData, this.homePageId);
                setCurrentRootInfo(this.mockSiteData, this.mockSiteData.getExternalBaseUrl());
            });

            describe('Page', function () {

                describe('free site', function () {

                    it('dynamic router', function () {
                        testUtils.experimentHelper.openExperiments('sv_dpages');
                        this.url = getUrlWithPath('/david_animals/lion', '');
                        var mockRouter = mockDynamicRouter(this.mockSiteData);
                        var result = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(result).toEqual({
                            format: 'slash',
                            routerDefinition: mockRouter,
                            pageAdditionalData: 'david_animals/lion',
                            innerRoute: 'lion'
                        });
                    });

                    it('should parse url with no internal path as home page', function () {
                        this.url = getUrlWithPath('');
                        this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(this.parsedUrl).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
                    });

                    it('should parse url with specific page correctly', function () {
                        addPage(this.mockSiteData, 'about');

                        this.url = getUrlWithPath('/about');
                        this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(this.parsedUrl).toEqual({format: 'slash', pageId: 'about-id', title: 'about'});
                    });

                });

                describe('premium site with domain', function () {

                    beforeEach(function () {
                        setPremiumFeatures(this.mockSiteData, ['HasDomain']);
                        this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'premium'));
                    });
                    it('dynamic router', function () {
                        testUtils.experimentHelper.openExperiments('sv_dpages');
                        this.url = getUrlWithPath('/david_animals/lion', 'premium');
                        var mockRouter = mockDynamicRouter(this.mockSiteData);
                        var result = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(result).toEqual({
                            format: 'slash',
                            routerDefinition: mockRouter,
                            pageAdditionalData: 'david_animals/lion',
                            innerRoute: 'lion'
                        });
                    });

                    it('should parse url with only domain name as home page', function () {
                        this.url = getUrlWithPath('', 'premium');
                        this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(this.parsedUrl).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
                    });

                    it('should parse specific page in premium domain correctly', function () {
                        addPage(this.mockSiteData, 'about');

                        this.url = getUrlWithPath('/about', 'premium');
                        this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(this.parsedUrl).toEqual({format: 'slash', pageId: 'about-id', title: 'about'});
                    });

                });

                describe('preview', function () {

                    beforeEach(function () {
                        setPreviewMode(this.mockSiteData);
                        this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'preview'));
                    });
                    it('dynamic router', function () {
                        testUtils.experimentHelper.openExperiments('sv_dpages');
                        this.url = getUrlWithPath('/david_animals/lion', 'preview');
                        var mockRouter = mockDynamicRouter(this.mockSiteData);
                        var result = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(result).toEqual({
                            format: 'slash',
                            pageAdditionalData: 'david_animals/lion',
                            routerDefinition: mockRouter,
                            innerRoute: 'lion'
                        });
                    });

                    it('should parse preview url with no internal path as home page', function () {
                        this.url = getUrlWithPath('', 'preview');
                        this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(this.parsedUrl).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
                    });

                    it('should parse specific page url in preview correctly', function () {
                        addPage(this.mockSiteData, 'about');

                        this.url = getUrlWithPath('/about', 'preview');
                        this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(this.parsedUrl).toEqual({format: 'slash', pageId: 'about-id', title: 'about'});
                    });

                });

                describe('review', function () {

                    beforeEach(function () {
                        setPreviewMode(this.mockSiteData);
                        this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'review'));
                        spyOn(this.mockSiteData, 'isFeedbackEndpoint').and.returnValue(true);
                    });

                    it('dynamic router', function () {
                        testUtils.experimentHelper.openExperiments('sv_dpages');
                        this.url = getUrlWithPath('/david_animals/lion', 'review');
                        var mockRouter = mockDynamicRouter(this.mockSiteData);
                        var result = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(result).toEqual({
                            format: 'slash',
                            routerDefinition: mockRouter,
                            pageAdditionalData: 'david_animals/lion',
                            innerRoute: 'lion'
                        });
                    });

                    it('should parse preview url with no internal path as home page', function () {
                        this.url = getUrlWithPath('', 'review');
                        this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(this.parsedUrl).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
                    });

                    it('should parse specific page url in preview correctly', function () {
                        addPage(this.mockSiteData, 'about');

                        this.url = getUrlWithPath('/about', 'review');
                        this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(this.parsedUrl).toEqual({format: 'slash', pageId: 'about-id', title: 'about'});
                    });

                });

                describe('wix site', function () {

                    beforeEach(function () {
                        setDocumentType(this.mockSiteData, 'WixSite');
                    });

                    describe('internal to wix.com (e.g. http://www.wix.com/about/us)', function () {
                        beforeEach(function () {
                            this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'wixSite'));
                        });
                        it('dynamic router', function () {
                            testUtils.experimentHelper.openExperiments('sv_dpages');
                            this.url = getUrlWithPath('/david_animals/lion', 'wixSite');
                            var mockRouter = mockDynamicRouter(this.mockSiteData);
                            var result = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(result).toEqual({
                                format: 'slash',
                                routerDefinition: mockRouter,
                                pageAdditionalData: 'david_animals/lion',
                                innerRoute: 'lion'
                            });
                        });

                        it('should parse home page for empty internal path', function () {
                            this.url = getUrlWithPath('', 'wixSite');
                            this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(this.parsedUrl).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
                        });

                        it('should parse specific page by internal path', function () {
                            addPage(this.mockSiteData, 'inner');

                            this.url = getUrlWithPath('/inner', 'wixSite');
                            this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(this.parsedUrl).toEqual({format: 'slash', pageId: 'inner-id', title: 'inner'});
                        });
                    });

                    describe('external wix site (e.g. http://wixkickstart.com', function() {
                        beforeEach(function () {
                            this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'premium'));
                            setPremiumFeatures(this.mockSiteData, ['HasDomain']);
                        });
                        it('dynamic router', function () {
                            testUtils.experimentHelper.openExperiments('sv_dpages');
                            this.url = getUrlWithPath('/david_animals/lion', 'premium');
                            var mockRouter = mockDynamicRouter(this.mockSiteData);
                            var result = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(result).toEqual({
                                format: 'slash',
                                routerDefinition: mockRouter,
                                pageAdditionalData: 'david_animals/lion',
                                innerRoute: 'lion'
                            });
                        });

                        it('should parse home page for empty internal path', function () {
                            this.url = getUrlWithPath('', 'premium');
                            this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(this.parsedUrl).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
                        });

                        it('should parse specific page by internal path', function () {
                            addPage(this.mockSiteData, 'inner');

                            this.url = getUrlWithPath('/inner', 'premium');
                            this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(this.parsedUrl).toEqual({format: 'slash', pageId: 'inner-id', title: 'inner'});
                        });
                    });
                });

                describe('template', function () {

                    beforeEach(function () {
                        setDocumentType(this.mockSiteData, 'Template');
                    });
                    it('dynamic router', function () {
                        this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'wixSite'));
                        testUtils.experimentHelper.openExperiments('sv_dpages');
                        this.url = getUrlWithPath('/david_animals/lion', 'wixSite');
                        this.mockSiteData.currentUrl.full = this.url;
                        var mockRouter = mockDynamicRouter(this.mockSiteData);
                        var result = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                        expect(result).toEqual({
                            format: 'slash',
                            routerDefinition: mockRouter,
                            pageAdditionalData: 'david_animals/lion',
                            innerRoute: 'lion'
                        });
                    });

                    describe('public address', function () {
                        beforeEach(function () {
                            this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'wixSite'));
                        });
                        it('should parse home page for empty internal path', function () {
                            this.url = getUrlWithPath('', 'wixSite');
                            this.mockSiteData.currentUrl.full = this.url;
                            this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(this.parsedUrl).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
                        });

                        it('should parse specific page by internal path', function () {
                            addPage(this.mockSiteData, 'inner');

                            this.url = getUrlWithPath('/inner', 'wixSite');
                            this.mockSiteData.currentUrl.full = this.url;
                            this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(this.parsedUrl).toEqual({format: 'slash', pageId: 'inner-id', title: 'inner'});
                        });

                    });

                    describe('internal address (user.wixsite.com/sitename)', function () {
                        beforeEach(function () {
                            this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath(''));
                        });
                        it('should parse home page for empty internal path', function () {
                            this.url = getUrlWithPath('');
                            this.mockSiteData.currentUrl.full = this.url;
                            this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(this.parsedUrl).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
                        });

                        it('should parse specific page by internal path', function () {
                            addPage(this.mockSiteData, 'inner');

                            this.url = getUrlWithPath('/inner');
                            this.mockSiteData.currentUrl.full = this.url;
                            this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                            expect(this.parsedUrl).toEqual({format: 'slash', pageId: 'inner-id', title: 'inner'});
                        });
                    });
                });

            });

            it('Zoom Image', function () {
                this.url = getUrlWithPath('?lightbox=mockItemDataId');
                this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);
                expect(this.parsedUrl).toEqual({
                    format: 'slash',
                    pageId: this.homePageId,
                    title: 'mock-home-page',
                    pageItemId: 'mockItemDataId',
                    imageZoom: true
                });
            });

            describe('Old Ecom / News ("App Part 1")', function(){

                it('should parse url with _p prefix', function () {
                    addPermalink(this.mockSiteData, 'mockPermalinkDataId');

                    this.url = getUrlWithPath('/_p/mockPermalinkDataId/mockItemDataId/mockPageType/mockItemTitle');
                    this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);

                    expect(this.parsedUrl).toContain({
                        format: 'slash',
                        pageId: this.homePageId,
                        pageItemId: 'mockPermalinkDataId',
                        pageAdditionalData: 'mockItemDataId/mockPageType/mockItemTitle'
                    });
                });

                it('should parse url with _p prefix and with main page id if no current page exists', function () {
                    addPermalink(this.mockSiteData, 'mockPermalinkDataId');
                    setCurrentRootInfo(this.mockSiteData, this.mockSiteData.getExternalBaseUrl()); //home page

                    this.url = getUrlWithPath('/_p/mockPermalinkDataId/mockItemDataId/mockPageType/mockItemTitle');
                    this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);

                    expect(this.parsedUrl).toContain({
                        format: 'slash',
                        pageId: this.homePageId,
                        pageItemId: 'mockPermalinkDataId',
                        pageAdditionalData: 'mockItemDataId/mockPageType/mockItemTitle'
                    });
                });

            });

            it('List Builder', function () {
                addListBuilderPage(this.mockSiteData, 'list-builder-item-page');

                this.url = getUrlWithPath('/list-builder-item-page/mock-item-id/mock-item-title');
                this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);

                expect(this.parsedUrl).toContain({
                    format: 'slash',
                    title: 'mock-item-title',
                    pageId: 'list-builder-item-page-id',
                    pageAdditionalData: 'mock-item-id'
                });
            });

            it('TPA with encoded "?" and "#"', function () {
                addTpaPage(this.mockSiteData, 'tpa-page');

                this.url = getUrlWithPath('/tpa-page/free-text-parsed-by-app/can-be-anything/%3Fencoded-question-mark/%23encoded-hash');
                this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);

                expect(this.parsedUrl).toEqual({
                    format: 'slash',
                    title: 'tpa-page',
                    pageId: 'tpa-page-id',
                    pageAdditionalData: 'free-text-parsed-by-app/can-be-anything/?encoded-question-mark/#encoded-hash'
                });
            });

            it('Blog single post page', function () {
                addBlogSinglePostPage(this.mockSiteData, 'single-post');

                this.url = getUrlWithPath('/single-post/2015/11/23/post-title');
                this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);

                expect(this.parsedUrl).toEqual({
                    format: 'slash',
                    title: 'single-post',
                    pageId: 'single-post-id',
                    pageAdditionalData: '2015/11/23/post-title'
                });
            });

            it('Blog posts list', function () {
                addBlogPage(this.mockSiteData, 'blog');

                this.url = getUrlWithPath('/blog/Date/2015-07');
                this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, this.url);

                expect(this.parsedUrl).toEqual({
                    format: 'slash',
                    title: 'blog',
                    pageId: 'blog-id',
                    pageAdditionalData: 'Date/2015-07'
                });
            });

            it('should support already simply parsed url', function () {
                addPage(this.mockSiteData, 'mock-title');
                this.url = getUrlWithPath('/mock-title');
                this.parsedUrl = slashUrlParser.parseUrl(this.mockSiteData, {
                    hostname: 'mockHostName',
                    path: '/mockPath/mock-title',
                    full: this.url,
                    protocol: 'http:',
                    query: ''
                });

                expect(this.parsedUrl).toEqual({
                    format: 'slash',
                    title: 'mock-title',
                    pageId: 'mock-title-id'
                });
            });

            it('should return "null" when the passed url belongs to a different (external) website', function () {
                var differentUserUrl = 'http://externalHost/externalPath';
                var differentSiteNameUrl = 'http://mockHostName/externalPath';
                var containingUrl = 'http://mockHostName/currentSiteName-containing';
                var containedUrl = 'http://mockHostName/current';

                expect(slashUrlParser.parseUrl(this.mockSiteData, differentUserUrl)).toEqual(null);
                expect(slashUrlParser.parseUrl(this.mockSiteData, differentSiteNameUrl)).toEqual(null);
                expect(slashUrlParser.parseUrl(this.mockSiteData, containingUrl)).toEqual(null);
                expect(slashUrlParser.parseUrl(this.mockSiteData, containedUrl)).toEqual(null);
            });

            it('should support google cached url', function () {
                var premiumUrl = getUrlWithPath('', 'premium');
                var cachedUrl = 'http://webcache.googleusercontent.com/search?q=cache:Vp8xz9MjrdkJ:' + premiumUrl + '+&cd=2&hl=en&ct=clnk&gl=il';
                this.mockSiteData.getExternalBaseUrl.and.returnValue(premiumUrl);
                expect(slashUrlParser.parseUrl(this.mockSiteData, cachedUrl)).toEqual({format: 'slash', pageId: this.homePageId, title: 'mock-home-page'});
            });
        });

        describe('getUrl', function () {

            beforeEach(function () {
                this.mockSiteData = getMockSiteData();
                this.homePageId = addPage(this.mockSiteData, 'mock-home-page');

                setUrlFormat(this.mockSiteData, 'slash');
                setHomePageId(this.mockSiteData, this.homePageId);
                testUtils.experimentHelper.openExperiments('sv_dpages');
                this.mockSiteData.currentUrl = coreUtils.urlUtils.parseUrl(getUrlWithPath(''));
                spyOn(this.mockSiteData, 'getExternalBaseUrl').and.returnValue(getUrlWithPath(''));
            });

            describe('Page', function () {

                describe('free site', function () {
                    it('dynamic route, no inner route', function () {
                        mockDynamicRouter(this.mockSiteData);
                        var pageInfo = {
                            format: 'slash',
                            routerId: 1
                        };
                        this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                        expect(this.url).toBe(getUrlWithPath() + '/david_animals');
                    });
                    it('dynamic route, with inner route', function () {
                        mockDynamicRouter(this.mockSiteData);
                        var pageInfo = {
                            format: 'slash',
                            routerId: 1,
                            innerRoute:'lion'
                        };
                        this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                        expect(this.url).toBe(getUrlWithPath() + '/david_animals/lion');
                    });
                    it('home page', function () {
                        this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()});
                        expect(this.url).toBe(getUrlWithPath());
                    });

                    it('not home page', function () {
                        addPage(this.mockSiteData, 'notMainPage');
                        this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: 'notMainPage-id'});
                        expect(this.url).toBe(getUrlWithPath('/notMainPage'));
                    });

                    it('not home page with base URL ending with slash', function () {
                        addPage(this.mockSiteData, 'notMainPage');
                        this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: 'notMainPage-id'}, false, false, getUrlWithPath() + '/');
                        expect(this.url).toBe(getUrlWithPath('/notMainPage'));
                    });
                });

                describe('premium site with domain', function () {

                    beforeEach(function () {
                        setPremiumFeatures(this.mockSiteData, ['HasDomain']);
                    });

                    describe('connected to domain', function () {
                        beforeEach(function () {
                            this.mockSiteData.currentUrl = coreUtils.urlUtils.parseUrl(getUrlWithPath('', 'premium'));
                            this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'premium'));
                        });
                        it('dynamic route, no inner route', function () {
                            mockDynamicRouter(this.mockSiteData);
                            var pageInfo = {
                                format: 'slash',
                                routerId: 1
                            };
                            this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                            expect(this.url).toBe(getUrlWithPath('/david_animals', 'premium'));
                        });

                        it('dynamic route, with inner route', function () {
                            mockDynamicRouter(this.mockSiteData);
                            var pageInfo = {
                                format: 'slash',
                                routerId: 1,
                                innerRoute:'lion'
                            };
                            this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                            expect(this.url).toBe(getUrlWithPath('/david_animals/lion', 'premium'));
                        });

                        it('home page', function () {
                            this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()});
                            expect(this.url).toBe(getUrlWithPath('', 'premium'));
                        });

                        it('not home page', function () {
                            addPage(this.mockSiteData, 'notMainPage');
                            this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: 'notMainPage-id'});
                            expect(this.url).toBe(getUrlWithPath('/notMainPage', 'premium'));
                        });
                    });

                    describe('hasDomain but not connected', function () {
                        beforeEach(function () {
                            this.mockSiteData.currentUrl = coreUtils.urlUtils.parseUrl(getUrlWithPath('', 'freeSite'));
                            this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'freeSite'));
                        });
                        it('dynamic route, no inner route', function () {
                            mockDynamicRouter(this.mockSiteData);
                            var pageInfo = {
                                format: 'slash',
                                routerId: 1
                            };
                            this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                            expect(this.url).toBe(getUrlWithPath('/david_animals', 'freeSite'));
                        });

                        it('dynamic route, with inner route', function () {
                            mockDynamicRouter(this.mockSiteData);
                            var pageInfo = {
                                format: 'slash',
                                routerId: 1,
                                innerRoute:'lion'
                            };
                            this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                            expect(this.url).toBe(getUrlWithPath('/david_animals/lion', 'freeSite'));
                        });


                        it('home page', function () {
                            this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()});
                            expect(this.url).toBe(getUrlWithPath('', 'freeSite'));
                        });

                        it('not home page', function () {
                            addPage(this.mockSiteData, 'notMainPage');
                            this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: 'notMainPage-id'});
                            expect(this.url).toBe(getUrlWithPath('/notMainPage', 'freeSite'));
                        });
                    });

                    describe('hasDomain but is wix site', function () {
                        beforeEach(function () {
                            setDocumentType(this.mockSiteData, 'WixSite');
                            this.mockSiteData.currentUrl = coreUtils.urlUtils.parseUrl(getUrlWithPath('', 'wixSite'));
                            this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'wixSite'));
                        });
                        it('dynamic route, no inner route', function () {
                            mockDynamicRouter(this.mockSiteData);
                            var pageInfo = {
                                format: 'slash',
                                routerId: 1
                            };
                            this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                            expect(this.url).toBe(getUrlWithPath('/david_animals', 'wixSite'));
                        });

                        it('dynamic route, with inner route', function () {
                            mockDynamicRouter(this.mockSiteData);
                            var pageInfo = {
                                format: 'slash',
                                routerId: 1,
                                innerRoute:'lion'
                            };
                            this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                            expect(this.url).toBe(getUrlWithPath('/david_animals/lion', 'wixSite'));
                        });


                        it('home page', function () {
                            this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()});
                            expect(this.url).toBe(getUrlWithPath('', 'wixSite'));
                        });

                        it('not home page', function () {
                            addPage(this.mockSiteData, 'notMainPage');
                            this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: 'notMainPage-id'});
                            expect(this.url).toBe(getUrlWithPath('/notMainPage', 'wixSite'));
                        });
                    });
                });

                describe('preview', function () {

                    beforeEach(function () {
                        setPreviewMode(this.mockSiteData);
                        this.mockSiteData.currentUrl = coreUtils.urlUtils.parseUrl(getUrlWithPath('', 'preview'));
                        this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'preview'));
                    });

                    it('dynamic route, no inner route', function () {
                        mockDynamicRouter(this.mockSiteData);
                        var pageInfo = {
                            format: 'slash',
                            routerId: 1
                        };
                        this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                        expect(this.url).toBe(getUrlWithPath('/david_animals', 'preview'));
                    });

                    it('dynamic route, with inner route', function () {
                        mockDynamicRouter(this.mockSiteData);
                        var pageInfo = {
                            format: 'slash',
                            routerId: 1,
                            innerRoute:'lion'
                        };
                        this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                        expect(this.url).toBe(getUrlWithPath('/david_animals/lion', 'preview'));
                    });

                    it('home page', function () {
                        this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()});
                        expect(this.url).toBe(getUrlWithPath('', 'preview'));
                    });

                    it('not home page', function () {
                        addPage(this.mockSiteData, 'notMainPage');
                        this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: 'notMainPage-id'});
                        expect(this.url).toBe(getUrlWithPath('/notMainPage', 'preview'));
                    });
                });

                describe('wix site (e.g. http://www.wix.com/about/us)', function () {

                    beforeEach(function () {
                        setDocumentType(this.mockSiteData, 'WixSite');
                        this.mockSiteData.currentUrl = coreUtils.urlUtils.parseUrl(getUrlWithPath('', 'wixSite'));
                        this.mockSiteData.getExternalBaseUrl.and.returnValue(getUrlWithPath('', 'wixSite'));
                    });
                    it('dynamic route, no inner route', function () {
                        mockDynamicRouter(this.mockSiteData);
                        var pageInfo = {
                            format: 'slash',
                            routerId: 1
                        };
                        this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                        expect(this.url).toBe(getUrlWithPath('/david_animals', 'wixSite'));
                    });

                    it('dynamic route, with inner route', function () {
                        mockDynamicRouter(this.mockSiteData);
                        var pageInfo = {
                            format: 'slash',
                            routerId: 1,
                            innerRoute:'lion'
                        };
                        this.url = slashUrlParser.getUrl(this.mockSiteData, pageInfo);
                        expect(this.url).toBe(getUrlWithPath('/david_animals/lion', 'wixSite'));
                    });


                    it('home page', function () {
                        this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()});
                        expect(this.url).toBe(getUrlWithPath('', 'wixSite'));
                    });

                    it('specific page', function () {
                        addPage(this.mockSiteData, 'notMainPage');
                        this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: 'notMainPage-id'});
                        expect(this.url).toBe(getUrlWithPath('/notMainPage', 'wixSite'));
                    });

                });

                it('should return page in url even for home page if forceAddPageInfo param is true', function () {
                    this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()}, true);
                    expect(this.url).toBe(getUrlWithPath('/mock-home-page'));
                });

            });

            it('Zoom Image', function () {
                this.url = slashUrlParser.getUrl(this.mockSiteData, {
                    pageId: this.mockSiteData.getMainPageId(),
                    pageItemId: 'mockItemDataId',
                    imageZoom: true
                });
                expect(this.url).toBe(getUrlWithPath('?lightbox=mockItemDataId'));
            });

            describe('Old Ecom / News ("App Part 1")', function(){

                it('should get url with _p prefix', function () {
                    addPermalink(this.mockSiteData, 'mockPermalinkDataId');

                    this.url = slashUrlParser.getUrl(this.mockSiteData, {
                        pageItemId: 'mockPermalinkDataId',
                        pageAdditionalData: 'mockAdditionalData'
                    });
                    expect(this.url).toBe(getUrlWithPath('/_p/mockPermalinkDataId/mockAdditionalData'));
                });

                it('should get url with _p prefix and without page-uri-seo, even if current page is not home page', function(){
                    addPage(this.mockSiteData, 'mock-title');
                    addPermalink(this.mockSiteData, 'mockPermalinkDataId');

                    this.url = slashUrlParser.getUrl(this.mockSiteData, {
                        pageId: 'mock-title-id',
                        pageItemId: 'mockPermalinkDataId',
                        pageAdditionalData: 'mockAdditionalData'
                    });
                    expect(this.url).toBe(getUrlWithPath('/_p/mockPermalinkDataId/mockAdditionalData'));
                });

            });

            describe('List Builder', function () {
                it('item has title', function () {
                    var pageId = addListBuilderPage(this.mockSiteData, 'list-builder-item-page');

                    this.url = slashUrlParser.getUrl(this.mockSiteData, {
                        title: 'mock-item-title',
                        pageId: pageId,
                        pageAdditionalData: 'mock-item-id'
                    });

                    expect(this.url).toBe(getUrlWithPath('/list-builder-item-page/mock-item-id/mock-item-title'));

                });

                it('item has empty title', function () {
                    var pageId = addListBuilderPage(this.mockSiteData, 'list-builder-item-page');

                    this.url = slashUrlParser.getUrl(this.mockSiteData, {
                        title: '',
                        pageId: pageId,
                        pageAdditionalData: 'mock-item-id'
                    });

                    expect(this.url).toBe(getUrlWithPath('/list-builder-item-page/mock-item-id'));

                });
            });

            describe('TPA', function(){

                it('should encode # and ? in tpa state so it does not interfere with the query', function () {
                    addTpaPage(this.mockSiteData, 'tpa-page');

                    this.url = slashUrlParser.getUrl(this.mockSiteData, {
                        title: 'tpa-page',
                        pageId: 'tpa-page-id',
                        pageAdditionalData: 'free-text-parsed-by-app/can-be-anything/?encoded-question-mark/#encoded-hash'
                    });

                    expect(this.url).toEqual(getUrlWithPath('/tpa-page/free-text-parsed-by-app/can-be-anything/%3Fencoded-question-mark/%23encoded-hash'));
                });

                it('should add page info to url even if page is home page', function () {
                    addTpaPage(this.mockSiteData, 'tpa-page');
                    setHomePageId(this.mockSiteData, 'tpa-page-id');

                    this.url = slashUrlParser.getUrl(this.mockSiteData, {
                        title: 'tpa-page',
                        pageId: 'tpa-page-id',
                        pageAdditionalData: 'some-state'
                    });

                    expect(this.url).toEqual(getUrlWithPath('/tpa-page/some-state'));
                });

            });

            it('Blog single post page', function () {
                addBlogSinglePostPage(this.mockSiteData, 'single-post');
                this.url = slashUrlParser.getUrl(this.mockSiteData, {
                    pageId: 'single-post-id',
                    pageAdditionalData: '2015/11/23/post-title'
                });

                expect(this.url).toEqual(getUrlWithPath('/single-post/2015/11/23/post-title'));
            });

            describe('Blog posts list', function(){

                it('should add filter to url', function () {
                    addBlogPage(this.mockSiteData, 'blog');

                    this.url = slashUrlParser.getUrl(this.mockSiteData, {
                        pageId: 'blog-id',
                        pageAdditionalData: 'Date/2015-07'
                    });

                    expect(this.url).toEqual(getUrlWithPath('/blog/Date/2015-07'));
                });

                it('should add page info even if page is home page', function () {
                    addBlogPage(this.mockSiteData, 'blog');
                    setHomePageId(this.mockSiteData, 'blog-id');

                    this.url = slashUrlParser.getUrl(this.mockSiteData, {
                        pageId: 'blog-id',
                        pageAdditionalData: 'some-blog-filter'
                    });

                    expect(this.url).toEqual(getUrlWithPath('/blog/some-blog-filter'));
                });

            });

            it('should return url w/o query if cleanQuery param is true', function () {
                this.mockSiteData.currentUrl.query = {foo: 'bar'};
                this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()}, false, true);
                expect(this.url).toBe(getUrlWithPath());
            });

            it('should return url with overridden base url if one provided', function () {
                this.url = slashUrlParser.getUrl(this.mockSiteData, {pageId: this.mockSiteData.getMainPageId()}, false, false, 'overriddenBaseUrl');
                expect(this.url).toBe('overriddenBaseUrl');
            });

            it('should clean the query if the current URL is the google cached pages', function () {
                addPage(this.mockSiteData, 'otherPage');
                var premiumUrl = getUrlWithPath('', 'premium');
                this.mockSiteData.currentUrl = 'http://webcache.googleusercontent.com/search?q=cache:Vp8xz9MjrdkJ:' + premiumUrl + '+&cd=2&hl=en&ct=clnk&gl=il';
                this.mockSiteData.getExternalBaseUrl.and.returnValue(premiumUrl);
                expect(slashUrlParser.getUrl(this.mockSiteData, {pageId: 'otherPage-id'})).toEqual(getUrlWithPath('/otherPage', 'premium'));
            });
        });

    });
});
