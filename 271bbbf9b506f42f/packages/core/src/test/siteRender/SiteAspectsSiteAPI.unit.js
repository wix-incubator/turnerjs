define(['lodash', 'utils', 'testUtils', 'core/siteRender/SiteAspectsSiteAPI', 'core/core/SiteDataAPI'],
    function (_, utils, testUtils, SiteAspectsSiteAPI, SiteDataAPI) {
        'use strict';

        var factory = testUtils.mockFactory;
        
        describe("SiteAspectsSiteAPI", function () {

            beforeEach(function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                siteData.siteId = 'testSite';
                siteData.setCurrentPage('page1');
                this.siteData = siteData;

                this.addPage = function (pageId) {
                    siteData.addPageWithDefaults(pageId);
                    this.site.addRenderedPage(pageId);
                };

                this.getPage = function (pageId) {
                    return this.site.refs.masterPage.refs.SITE_PAGES.refs[pageId];
                };

                var siteDataWrapper = SiteDataAPI.createSiteDataAPIAndDal(siteData, _.noop);
                var viewerPrivateServices = {
                    siteDataAPI: siteDataWrapper.siteDataAPI,
                    pointers: siteDataWrapper.pointers,
                    displayedDAL: siteDataWrapper.displayedDal
                };
                this.site = factory.mockWixSiteReact(siteData, viewerPrivateServices);


                this.getSiteAPI = function () {
                    var api = new SiteAspectsSiteAPI(this.site);
                    this.site.siteAPI = api;
                    return api;
                };
            });

            //TODO: Alissa probably should add tests
            describe("getComponentById", function () {
                it("should return comp if it's on masterPage", function () {
                    this.site.refs.masterPage.refs.comp1 = 'comp';
                    var api = this.getSiteAPI();

                    expect(api.getComponentById('comp1')).toBe('comp');
                });
                it("should return comp if it's on current page", function () {
                    this.site.getPrimaryPage().refs.comp1 = 'comp';
                    var api = this.getSiteAPI();

                    expect(api.getComponentById('comp1')).toBe('comp');
                });


            it('should return component if it is on current popup page', function () {
                var api = this.getSiteAPI();

                spyOn(api, 'getRootOfComponentId').and.returnValue('root');
                spyOn(api, 'getComponentsByPageId').and.returnValue({'comp1': 'comp'});

                expect(api.getComponentById('comp1')).toBe('comp');
            });

                it("should return page id if comp is on other page and the comp is rendered", function () {
                    this.addPage('otherPage');
                    this.getPage('otherPage').refs = {comp1: 'comp'};
                    var api = this.getSiteAPI();

                    expect(api.getComponentById('comp1')).toBe('comp');
                });

                it("should return null if component exists in some page but isn't rendered", function () {
                    this.siteData.addPageWithDefaults('otherPage');
                    var api = this.getSiteAPI();

                    expect(api.getComponentById('comp1')).toBe(null);
                });

                it("should return null if no such comp", function () {
                    var api = this.getSiteAPI();
                    expect(api.getComponentById('comp1')).toBeNull();
                });

                it("should return null and not throw if there are no rendered pages - no master page", function () {
                    this.siteData.addPageWithDefaults('page1');
                    this.siteData.setCurrentPage('page1');
                    this.site = testUtils.mockFactory.mockWixSiteReact(this.siteData);
                    var api = testUtils.mockFactory.mockSiteAspectSiteAPI(this.siteData, this.site);
                    delete this.site.refs.masterPage;

                    expect(api.getComponentById('comp1')).toBeNull();
                });
            });

            //TODO: Alissa implement
            describe("getRootOfComponentId", function () {
                it("should return master page react comp if on master", function () {

                });
                it("should return primary page react comp if on page", function () {

                });

                it("should return popup react comp if comp on popup", function () {

                });
                it("should return null if comp in some other container, like aspects container", function () {

                });
                it("should return null if comp isn't rendered", function () {

                });
            });

        describe('getCurrentPopup:', function () {
            var site;
            var api;

            function setAPI(currentPopup) {
                site = {
                    getCurrentPopup: jasmine.createSpy('getCurrentPopup').and.returnValue(currentPopup)
                };

                api = new SiteAspectsSiteAPI(site);
            }

            it('should get current popup from current site', function () {
                setAPI();
                api.getCurrentPopup();

                expect(site.getCurrentPopup).toHaveBeenCalled();
            });

            it('should return gotten current popup', function () {
                setAPI('currentPopup');
                expect(api.getCurrentPopup()).toBe('currentPopup');

                setAPI('otherCurrentPopup');
                expect(api.getCurrentPopup()).toBe('otherCurrentPopup');
            });
        });

            describe("simple methods", function () {
                beforeEach(function () {
                    this.site.registerAspectToEvent = function (evName, callback) {
                        callback(evName);
                    };
                    this.api = this.getSiteAPI();
                });

                it("registerToMessage", function () {
                    var callback = jasmine.createSpy('callback');
                    this.api.registerToMessage(callback);

                    expect(callback).toHaveBeenCalledWith('message');
                });

                it("registerToComponentDidMount", function () {
                    var callback = jasmine.createSpy('callback');
                    this.api.registerToComponentDidMount(callback);

                    expect(callback).toHaveBeenCalledWith('mount');
                });
            });

            var url = 'URL';
            describe('navigateToPage', function () {
                beforeEach(function () {
                    spyOn(utils.wixUrlParser, 'getUrl').and.returnValue(url);
                    this.site.tryToNavigate = jasmine.createSpy("tryToNavigate");
                });
                it('should create site url for the given page id if exist on site', function () {
                    this.api = this.getSiteAPI();
                    this.api.navigateToPage({pageId: 'page1'});

                    var pageInfo = this.site.tryToNavigate.calls.argsFor(0)[0];
                    expect(pageInfo).toEqual({
                        pageId: 'page1'
                    });
                });

                it('should create site url with state for the given page id if exist on site', function () {
                    this.api = this.getSiteAPI();
                    this.api.navigateToPage({pageId: 'page1', pageAdditionalData: 'state'});

                    var pageInfo = this.site.tryToNavigate.calls.argsFor(0)[0];
                    expect(pageInfo).toEqual({
                        pageId: 'page1',
                        pageAdditionalData: 'state'
                    });
                });

                it('should not call navigateMethod when pageId does not exist', function () {
                    this.api = this.getSiteAPI();
                    this.site.getDataByQuery = function () {
                        return undefined;
                    };
                    spyOn(this.api, 'getSiteData').and.returnValue(this.site);
                    this.api.navigateToPage({pageId: 'nonExistingPage'});
                    expect(this.site.props.navigateMethod).not.toHaveBeenCalled();
                });
            });

            describe('setSiteRootHiddenState', function () {
                beforeEach(function () {
                    this.site.setState = jasmine.createSpy();
                });
                it('should set siteRootHidden to be true', function () {
                    this.api = this.getSiteAPI();
                    this.api.setSiteRootHiddenState(true, function () {
                    });
                    expect(this.api._site.setState).toHaveBeenCalledWith({
                        siteRootHidden: true
                    }, jasmine.any(Function));
                });

                it('should set siteRootHidden to be false', function () {
                    this.api = this.getSiteAPI();
                    this.api.setSiteRootHiddenState(false, function () {
                    });
                    expect(this.api._site.setState).toHaveBeenCalledWith({
                        siteRootHidden: false
                    }, jasmine.any(Function));
                });
            });
        });
    });
