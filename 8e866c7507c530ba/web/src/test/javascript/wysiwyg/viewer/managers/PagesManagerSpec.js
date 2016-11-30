

xdescribe('PagesManager', function(){
    var asyncSpec =  new AsyncSpec(this);

    testRequire().classes('wysiwyg.viewer.managers.PageManager',
        'wysiwyg.viewer.managers.pages.data.RemoteDataResolver',
        'wysiwyg.viewer.managers.pages.data.LocalDataResolver',
        'wysiwyg.viewer.managers.pages.data.DataResolverFactory',
        'wysiwyg.viewer.managers.pages.MasterPageHandler',
        'wysiwyg.viewer.managers.pages.LazyPageLoader',
        'wysiwyg.viewer.managers.pages.PageHandler');


    beforeEach(function(){
        this._siteNode = new Element('div');
        var specScope = this;
        spyOn(this.MasterPageHandler.prototype, '_getSiteNode').andReturn(window.getPlayGround());
        spyOn(this.PageHandler.prototype, 'loadPage').andCallFake(function(){
            var self = this;
            return this._getPageData()
                .then(function(){
                    return {
                        'pageId': self._pageId,
                        'pageNode': null,
//                        'timedOut': [],
                        'failed': [],
                        'nodes': {}
                    };
                });

        });
        spyOn(this.MasterPageHandler.prototype, 'loadMasterSignatureHtml').andCallFake(function(){
            return this._getPageData()
                .then(function(){
                    return {
                        'rootCompNode': specScope._siteNode,
                        'pagesContainerNode': {
                            $logic:{
                                'getWidth': function(){
                                    return 100;
                                }
                            }
                        },
                        'pageNodes': {
                            'mainPage': new Element('div'),
                            'c240r': new Element('div'),
                            'c199t': new Element('div'),
                            'c1n0f': new Element('div'),
                            'cyuu': new Element('div'),
                            'c65q': new Element('div')
                        },
                        'compNodes': [new Element('div'), new Element('div')]
                    };
                });
        });
        spyOn(this.MasterPageHandler.prototype, 'wixifyMasterPage').andCallFake(function(nodes){
            return Q({
                'pageId': 'master',
                'pageNode': null,
////                        'timedOut': [],
                'failed': [],
                nodes:nodes
            });
        });
    });

    afterEach(function(){
        delete define._definitions.resource.pages;
    });

    describe("loadSite", function(){
        beforeEach(function(){
            var dataResolver = new this.RemoteDataResolver(PageManagerDataMocks.RemoteData);

            this.pagesManager = new this.PageManager(Constants.ViewerTypesParams.TYPES.DESKTOP, dataResolver);
        });

        asyncSpec.it("Should trigger site loaded event when site is loaded", function(done){
            var siteLoadedFunc = jasmine.createSpy('siteLoaded');
            var siteLoadedEvent = this.pagesManager.EVENTS.SITE_LOADED;
            this.pagesManager.addEvent(siteLoadedEvent, siteLoadedFunc);

            this.pagesManager.loadSite().then(function(){
                expect(siteLoadedFunc).toHaveBeenCalled();
                done();
            }).done();
        });

        asyncSpec.it("Should trigger site loaded event and pass the site structure node", function(done){
            var asyncExpectReady = getAsyncExpects();
            var siteLoadedEvent = this.pagesManager.EVENTS.SITE_LOADED;
            this.pagesManager.addEvent(siteLoadedEvent, asyncExpectReady.callback);

            var self = this;
            this.pagesManager.loadSite().then(function(){
                expect(asyncExpectReady.callback).toHaveBeenCalledWith(self._siteNode);
                done();
            }).done();
        });
    });

    describe('Remote DataResolver when home page id different from main pageid ', function(){

        beforeEach(function(){

            spyOn(this.RemoteDataResolver.prototype, 'isAllPagesDataLoaded').andReturn(true);
            spyOn(this.RemoteDataResolver.prototype, 'getMainPageId').andReturn('c240r');
            var dataResolver = new this.RemoteDataResolver(PageManagerDataMocks.RemoteData);
            this.pagesManager = new this.PageManager(Constants.ViewerTypesParams.TYPES.DESKTOP, dataResolver);

            this.pagesManager.loadSite();

            waitsFor(function(){
                return this.pagesManager.isPageLoadingCompleted();
            }.bind(this), 'isPageLoadingCompleted to return true', 1000);
        });

        it('should have mainPage id equal c240r', function(){
            expect(this.pagesManager.getDataResolver().getMainPageId()).toEqual('c240r');
        });


        it('should not have main page data', function(){
            expect(this.pagesManager.getDataResolver().getDataById('mainPage')).toBeUndefined();
        });

        it('should not c240r page data', function(){
            expect(this.pagesManager.getDataResolver().getDataById('c240r')).toBeDefined();
        });
    });

    describe('Remote DataResolver', function(){

        beforeEach(function(){
            spyOn(this.RemoteDataResolver.prototype, 'isAllPagesDataLoaded').andReturn(true);
            var dataResolver = new this.RemoteDataResolver(PageManagerDataMocks.RemoteData);
            this.pagesManager = new this.PageManager(Constants.ViewerTypesParams.TYPES.DESKTOP, dataResolver);

            this.pagesManager.loadSite();

            waitsFor(function(){
                return this.pagesManager.isPageLoadingCompleted();
            }.bind(this), 'isPageLoadingCompleted to return true', 1000);
        });

        it('should data resolver to be of type remote data resolver', function(){
            expect(this.pagesManager.getDataResolver() instanceof this.RemoteDataResolver).toBe(true);
        });

        it('should have page Ids', function(){
            expect(this.pagesManager.getDataResolver().getPagesIds().length).toBeGreaterThan(0);
        });

        it('should have pageIds to load', function(){
            expect(this.pagesManager.getDataResolver().getPagesIdsToLoad().length).toBeGreaterThan(0);
        });

        it('should have mainPage Id', function(){
            expect(this.pagesManager.getDataResolver().getMainPageId()).toEqual('mainPage');
        });


        it('should have master page data', function(){

            expect(this.pagesManager.getDataResolver().getDataById('master')).toBeDefined();

        });

        it('should have main page data', function(){
            expect(this.pagesManager.getDataResolver().getDataById('mainPage')).toBeDefined();
        });

        it('should not  have next page data', function(){
            expect(this.pagesManager.getDataResolver().getDataById('c240r')).toBeUndefined();
        });
    });

    describe('Local (inline static data) DataResolver', function(){

        beforeEach(function(){

            var dataResolver = new this.LocalDataResolver(PageManagerDataMocks.LocalData);
            this.pagesManager = new this.PageManager(Constants.ViewerTypesParams.TYPES.DESKTOP, dataResolver);

            this.pagesManager.loadSite();

            waitsFor(function(){
                return this.pagesManager.isPageLoadingCompleted();
            }.bind(this), 'isPageLoadingCompleted to return true', 1000);
        });

        it('should data resolver to be of type local data resolver', function(){
            expect(this.pagesManager.getDataResolver() instanceof this.LocalDataResolver).toBe(true);
        });

        it('should have page Ids', function(){
            expect(this.pagesManager.getDataResolver().getPagesIds().length).toBeGreaterThan(0);
        });

        it('should have pageIds to load', function(){
            expect(this.pagesManager.getDataResolver().getPagesIdsToLoad().length).toEqual(0);
        });


        it('should have main page data', function(){
            expect(this.pagesManager.getDataResolver().getDataById('mainPage')).toBeDefined();
        });

        it('should have next page data', function(){
            expect(this.pagesManager.getDataResolver().getDataById('c240r')).toBeDefined();
        });
    });


    describe('Lazy Loading Load Page', function(){

        beforeEach(function(){

            var remoteDataResolver = new this.RemoteDataResolver(PageManagerDataMocks.RemoteData);

            spyOn(this.DataResolverFactory.prototype, 'getDataResolver').andReturn(remoteDataResolver);

            var lazyPageLoader = new this.LazyPageLoader(remoteDataResolver);
            lazyPageLoader.FirstLazyPageLoadDelay = 0;
            lazyPageLoader.NextLazyPageLoadDelay = 0;

            spyOn(this.PageManager.prototype, '_createLazyPageLoader').andReturn(lazyPageLoader);

            this.pagesManager = new this.PageManager(Constants.ViewerTypesParams.TYPES.DESKTOP, remoteDataResolver);


            this.pagesManager.loadSite();

            waitsFor(function(){
                return this.pagesManager.isPageLoadingCompleted();
            }.bind(this), 'isPageLoadingCompleted to return true', 2000);
        });


        it('pages should be lazy loaded', function(){

            waitsFor(function(){
                return this.pagesManager.getDataResolver().getDataById('c240r');
            }.bind(this), 'lazy page should be loaded id: c240r', 2000);

            runs(function(){
                expect(this.pagesManager.getDataResolver().getDataById('c240r')).toBeDefined();

            });

            waitsFor(function(){
                return this.pagesManager.getDataResolver().getDataById('c199t');
            }.bind(this), 'lazy page should be loaded id: c199t', 2000);

            runs(function(){
                expect(this.pagesManager.getDataResolver().getDataById('c199t')).toBeDefined();
            });

        });


    });
});


