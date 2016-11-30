define(['zepto', 'lodash', 'testUtils', 'utils', 'core/siteRender/siteClickHandler'],
    function ($, _, testUtils, utils, siteClickHandler) {
        'use strict';
        describe("clickHandler", function () {
            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData();
                this.site = testUtils.mockFactory.mockWixSiteReact(this.siteData);
                _.assign(this.site.constructor.prototype, siteClickHandler);

                //TODO get rid of all these spies... (I needed the tests to break down the function)
                spyOn(this.siteData, 'getExternalBaseUrl').and.returnValue('http://mockExternalBaseUrl/'); //tired..
                this.scrollToAnchorSpy = spyOn(this.site.siteAPI, 'scrollToAnchor');
                this.scrollToTopSpy = spyOn(this.site, 'scrollToTop');
                this.openWixLoginSpy = spyOn(this.site.siteAPI.getSiteAspect('LoginToWix'), 'openLoginToWixForm');

                var self = this;
                this.site.props.navigateMethod = function (site, siteDataAPI, url, rootNavigationInfo, addToHistory) {
                    self.context = rootNavigationInfo.pageItemAdditionalData;
                    self.linkUrl = url;
                    self.navInfo = rootNavigationInfo;
                    self.addToHistory = addToHistory;
                    self.anchorData = rootNavigationInfo.anchorData;
                };
            });

            function getClickEvent(target) {
                return {
                    target: target,
                    stopPropagation: _.noop,
                    preventDefault: _.noop
                };
            }

            function getNavInfo(overrides) {
                var info = {pageId: undefined, anchorData: undefined, pageItemAdditionalData: undefined, title: utils.siteConstants.DEFAULT_PAGE_URI_SEO};
                _.assign(info, overrides);
                return info;
            }

            describe("finding the link dom element", function () {
                beforeEach(function () {
                    this.siteData.addPageWithDefaults('page1');
                    this.url = utils.wixUrlParser.getUrl(this.siteData, {pageId: 'page1'});
                    this.expectedNavInfo = getNavInfo({pageId: 'page1'});
                });

                it("should get the link when it's the target of the click and return false", function () {
                    var a = $('<a href=' + this.url + '></a>')[0];
                    var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                    expect(defaultBehavior).toBeFalsy();
                    expect(this.navInfo).toEqual(this.expectedNavInfo);
                });
                it("should get the link when it's the ancestor of the target and return false", function () {
                    var a = $('<a href=' + this.url + '><span>sdfsdfsdf<span id="span"> df df df df</span> </span></a>')[0];
                    var defaultBehavior = this.site.clickHandler(getClickEvent(a.querySelector('#span')));

                    expect(defaultBehavior).toBeFalsy();
                    expect(this.navInfo).toEqual(this.expectedNavInfo);
                });
                it("should return true if there is no link related", function () {
                    var div = window.document.createElement('div');
                    var defaultBehavior = this.site.clickHandler(getClickEvent(div));

                    expect(defaultBehavior).toBeTruthy();
                    expect(this.navInfo).toBeUndefined();
                });
            });

            describe("internal site navigation", function () {
                describe("navigate to different page", function () {
                    beforeEach(function () {
                        this.siteData.addPageWithDefaults('page1');
                        this.url = utils.wixUrlParser.getUrl(this.siteData, {pageId: 'page1'});
                        var self = this;
                        this.checkNothingElseHappened = function (hasAnchor, movedToMobile) {
                            expect(this.openWixLoginSpy).not.toHaveBeenCalled();
                            expect(this.scrollToAnchorSpy).not.toHaveBeenCalled();
                            expect(this.scrollToTopSpy).not.toHaveBeenCalled();
                            if (!movedToMobile) {
                                expect(self.siteData.isMobileView()).toBeFalsy();
                            }
                        };
                    });

                    it("should pass the page item context as well", function () {
                        var a = $('<a href=' + this.url + ' data-page-item-context="context"></a>')[0];
                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(this.navInfo).toEqual(getNavInfo({pageId: 'page1', pageItemAdditionalData: 'context'}));
                        this.checkNothingElseHappened();
                        expect(defaultBehavior).toBeFalsy();
                    });
                    it("should pass the anchor data as well", function () {
                        var a = $('<a href=' + this.url + ' data-anchor="anchor"></a>')[0];
                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(this.navInfo).toEqual(getNavInfo({pageId: 'page1', anchorData: 'anchor'}));
                        expect(defaultBehavior).toBeFalsy();
                        this.checkNothingElseHappened(true);
                    });

                    it("should not navigate and cancel event if page not allowed", function () {
                        this.siteData.addPageWithData('page2', {pageSecurity: {requireLogin: true}});
                        this.url = utils.wixUrlParser.getUrl(this.siteData, {pageId: 'page2'});
                        var a = $('<a href=' + this.url + '></a>')[0];
                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeFalsy();
                        expect(this.linkUrl).toBeUndefined();
                        this.checkNothingElseHappened();
                    });

                    it("should set mobile view and then navigate as usual if data-mobile=true", function () {
                        var a = $('<a href=' + this.url + ' data-mobile="true"></a>')[0];
                        expect(this.siteData.isMobileView()).toBeFalsy();

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeFalsy();
                        expect(this.navInfo).toEqual(getNavInfo({pageId: 'page1'}));
                        expect(this.siteData.isMobileView()).toBeTruthy();
                        this.checkNothingElseHappened(false, true);
                    });

                    it("should do all :)", function(){
                        var a = $('<a href=' + this.url + ' data-mobile="true" data-anchor="anchor" data-page-item-context="context"></a>')[0];
                        expect(this.siteData.isMobileView()).toBeFalsy();

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeFalsy();
                        expect(this.siteData.isMobileView()).toBeTruthy();
                        expect(this.navInfo).toEqual(getNavInfo({pageId: 'page1', anchorData: 'anchor', pageItemAdditionalData: 'context'}));
                        this.checkNothingElseHappened(true, true);
                        expect(this.addToHistory).toBe(true);
                    });
                });

                describe("navigate without changing url", function(){
                    beforeEach(function(){
                        this.siteData.addPageWithDefaults('popup1');
                        var info = {pageId: 'popup1', title: 'title'};
                        this.url = utils.wixUrlParser.getUrl(this.siteData, info);
                        var self = this;
                        this.checkNothingElseHappened = function (hasAnchor, movedToMobile) {
                            expect(this.openWixLoginSpy).not.toHaveBeenCalled();
                            expect(this.scrollToAnchorSpy).not.toHaveBeenCalled();
                            expect(this.scrollToTopSpy).not.toHaveBeenCalled();
                            if (!movedToMobile) {
                                expect(self.siteData.isMobileView()).toBeFalsy();
                            }
                        };
                    });
                    it("should navigate to a page (in reality popup page)", function(){
                        var a = $('<a href="javascript:void()" data-no-physical-url=' + this.url + '></a>')[0];

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeFalsy();
                        expect(this.navInfo).toEqual(getNavInfo({pageId: 'popup1', title: 'title'}));
                        expect(this.addToHistory).toBe(false);
                        this.checkNothingElseHappened();
                    });

                    it("should do all :)", function(){
                        this.siteData.addPageWithDefaults('popup1');
                        var a = $('<a href="javascript:void()" data-no-physical-url=' + this.url + ' data-mobile="true" data-anchor="anchor" data-page-item-context="context"></a>')[0];
                        expect(this.siteData.isMobileView()).toBeFalsy();

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));


                        expect(defaultBehavior).toBeFalsy();
                        expect(this.siteData.isMobileView()).toBeTruthy();
                        expect(this.navInfo).toEqual(getNavInfo({pageId: 'popup1', title: 'title', anchorData: 'anchor', pageItemAdditionalData: 'context'}));
                        expect(this.addToHistory).toBe(false);
                        this.checkNothingElseHappened(true, true);
                    });
                });

                describe("same page navigation", function () {
                    beforeEach(function () {
                        this.siteData.addPageWithDefaults('page1');
                        this.siteData.setCurrentPage('page1');
                        this.url = utils.wixUrlParser.getUrl(this.siteData, {pageId: 'page1'});
                        this.siteData.currentUrl.full = this.url;

                        var self = this;
                        this.checkNothingElseHappened = function (movedToMobile) {
                            expect(this.openWixLoginSpy).not.toHaveBeenCalled();
                            if (!movedToMobile) {
                                expect(self.siteData.isMobileView()).toBeFalsy();
                            }
                        };
                    });
                    it("should navigate and scroll to top if tpa section wixapps or something", function () {
                        var info = {pageId: 'page1', pageAdditionalData: 'someState'};
                        this.url = utils.wixUrlParser.getUrl(this.siteData, info);
                        var a = $('<a href=' + this.url + '></a>')[0];

                        this.site.clickHandler(getClickEvent(a));

                        expect(this.navInfo).toEqual(getNavInfo(info));
                        expect(this.scrollToTopSpy).toHaveBeenCalled();
                        expect(this.scrollToAnchorSpy).not.toHaveBeenCalled();
                        this.checkNothingElseHappened();
                    });
                    it("should navigate but NOT scroll to top if image zoom", function () {
                        var info = {pageId: 'page1', pageItemId: 'image1', imageZoom: true};
                        this.url = utils.wixUrlParser.getUrl(this.siteData, info);
                        var a = $('<a href=' + this.url + '></a>')[0];

                        this.site.clickHandler(getClickEvent(a));

                        expect(this.navInfo).toEqual(getNavInfo(info));
                        expect(this.scrollToTopSpy).not.toHaveBeenCalled();
                        expect(this.scrollToAnchorSpy).not.toHaveBeenCalled();
                        this.checkNothingElseHappened();
                    });
                    it("should only scroll to anchor if has only anchor data", function () {
                        var a = $('<a href="#" data-anchor=' + this.anchorId + '></a>')[0];

                        this.site.clickHandler(getClickEvent(a));

                        expect(this.navInfo).toBeUndefined();
                        expect(this.scrollToAnchorSpy).toHaveBeenCalled();
                        expect(this.scrollToTopSpy).not.toHaveBeenCalled();
                        this.checkNothingElseHappened();
                    });
                    it("should both navigate and scroll to anchor if has navigation and anchor data", function () {
                        var info = {pageId: 'page1', pageAdditionalData: 'someState', anchorData: 'anchor1'};
                        this.url = utils.wixUrlParser.getUrl(this.siteData, info);
                        var a = $('<a href=' + this.url + ' data-anchor="anchor1"></a>')[0];

                        this.site.clickHandler(getClickEvent(a));

                        expect(this.navInfo).toEqual(getNavInfo(info));
                        expect(this.scrollToAnchorSpy).toHaveBeenCalled();
                        expect(this.scrollToTopSpy).not.toHaveBeenCalled();
                        this.checkNothingElseHappened();
                    });
                });
            });

            describe("external site navigation", function () {
                beforeEach(function () {
                    var self = this;
                    this.checkNothingElseHappened = function (isWixLogin) {
                        if (!isWixLogin) {
                            expect(this.openWixLoginSpy).not.toHaveBeenCalled();
                        }
                        expect(this.scrollToAnchorSpy).not.toHaveBeenCalled();
                        expect(this.scrollToTopSpy).not.toHaveBeenCalled();
                        expect(self.siteData.isMobileView()).toBeFalsy();
                        expect(this.navInfo).toBeUndefined();
                    };
                });

                describe('email link', function () {
                    it("should not navigate and show tooltip if navigation not allowed, there is tooltip and target=self", function () {
                        var a = $('<a href="mailto://test@test.com" target="_self"></a>')[0];
                        this.siteData.renderRealtimeConfig.previewTooltipCallback = jasmine.createSpy('tooltip');
                        this.siteData.renderFlags.isExternalNavigationAllowed = false;

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeFalsy();
                        expect(this.siteData.renderRealtimeConfig.previewTooltipCallback).toHaveBeenCalled();
                        this.checkNothingElseHappened();
                    });
                });

                describe("actual external link", function () {
                    beforeEach(function () {
                        this.url = "http://google.com";
                    });
                    it("should not navigate and show tooltip if navigation not allowed, there is tooltip and target=self", function () {
                        var a = $('<a href=' + this.url + ' target="_self"></a>')[0];
                        this.siteData.renderRealtimeConfig.previewTooltipCallback = jasmine.createSpy('tooltip');
                        this.siteData.renderFlags.isExternalNavigationAllowed = false;

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeFalsy();
                        expect(this.siteData.renderRealtimeConfig.previewTooltipCallback).toHaveBeenCalled();
                        this.checkNothingElseHappened();
                    });

                    //that is odd...
                    it("should navigate out if navigation not allowed, there is tooltip and no target specified", function () {
                        var a = $('<a href=' + this.url + '></a>')[0];
                        this.siteData.renderRealtimeConfig.previewTooltipCallback = jasmine.createSpy('tooltip');
                        this.siteData.renderFlags.isExternalNavigationAllowed = false;

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeTruthy();
                        expect(this.siteData.renderRealtimeConfig.previewTooltipCallback).not.toHaveBeenCalled();
                        this.checkNothingElseHappened();
                    });

                    //that is odd..
                    it("should navigate out if navigation NOT allowed, target=self but there is no tooltip callback", function () {
                        var a = $('<a href=' + this.url + ' target="_self"></a>')[0];
                        this.siteData.renderFlags.isExternalNavigationAllowed = false;

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeTruthy();
                        this.checkNothingElseHappened();
                    });

                    it("should navigate out if navigation not allowed, there is tooltip but target=blank", function () {
                        var a = $('<a href=' + this.url + ' target="_blank"></a>')[0];
                        this.siteData.renderRealtimeConfig.previewTooltipCallback = jasmine.createSpy('tooltip');
                        this.siteData.renderFlags.isExternalNavigationAllowed = false;

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeTruthy();
                        expect(this.siteData.renderRealtimeConfig.previewTooltipCallback).not.toHaveBeenCalled();
                        this.checkNothingElseHappened();
                    });
                });

                it("should navigate out if link is internal but target=_blank", function () {
                    this.siteData.addPageWithDefaults('page1');
                    this.url = utils.wixUrlParser.getUrl(this.siteData, {pageId: 'page1'});
                    var a = $('<a href=' + this.url + ' target="_blank"></a>')[0];

                    var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                    expect(defaultBehavior).toBeTruthy();
                    expect(this.navInfo).toBeUndefined();
                    this.checkNothingElseHappened();
                });

                describe("login to wix", function () {
                    beforeEach(function () {
                        this.url = utils.linkRenderer.CONSTS.LOGIN_TO_WIX_URL + 'something';
                    });

                    it("should follow the login link with regular navigation", function () {
                        this.siteData.renderFlags.isExternalNavigationAllowed = true;
                        var a = $('<a href=' + this.url + '></a>')[0];

                        var defaultBehavior = this.site.clickHandler(getClickEvent(a));

                        expect(defaultBehavior).toBeTruthy();
                        this.checkNothingElseHappened();
                    });
                });

            });
        });
    });
