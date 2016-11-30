define([
    'zepto',
    'lodash',
    'react',
    'reactDOM',
    'testUtils',
    'definition!core/siteRender/WixSiteReact',
    'core/siteRender/WixSiteReact',
    'core/siteRender/styleCollector',
    'core/siteRender/WixThemeReact',
    'core/siteRender/WixPageReact',
    'core/siteRender/wixBackgroundInstantiator',
    'layout',
    'utils',
    'core/siteRender/siteAspectsMixin',
    'animations',
    'core/siteRender/siteAspectsDomContainer',
    'core/siteRender/extraSiteHeight',
    'core/siteRender/blockingLayer',
    'santaProps',
    'core/siteRender/wixAdsInstatiator',
    'core/siteRender/mobileAppBannerInstantiator',
    'mousetrap',
    'core/core/siteBI',
    'core/components/renderDoneMixin',
    'core/siteRender/WixPopupRoot',
    'core/siteRender/siteClickHandler',
    'core/siteRender/siteTraversalMixin',
    'core/components/selectionSharer/selectionSharer',
    'core/core/SiteDataAPI',
    'experiment',
    'components'
], function ($,
             _,
             React,
             reactDOM,
             testUtils,
             wixSiteReactDef,
             WixSiteReactClass,
             styleCollector,
             wixThemeReactClass,
             wixPageReactClass,
             wixBackgroundInstantiator,
             layout,
             utils,
             siteAspectsMixin,
             animations,
             siteAspectsDomContainerClass,
             extraSiteHeightClass,
             blockingLayerClass,
             santaProps,
             wixAdsInstatiator,
             mobileAppBannerInstantiator,
             mousetrap,
             siteBI,
             renderDoneMixin,
             WixPopupContainerClass,
             siteClickHandler,
             siteTraversalMixin,
             selectionSharer,
             SiteDataAPI,
             experiment) {
    'use strict';

    describe('WixSiteReact', function () {
        var reactTestUtils = React.addons.TestUtils;
        var mockFactory = testUtils.mockFactory;

        describe('real lifecycle', function () {
            beforeEach(function () {
                this.siteData = mockFactory.mockSiteData({getPagesDataForRmi : function(){return [];}});
                this.siteData.addMeasureMap();
                this.siteData.setActiveModes({
                    'mainPage': {},
                    'anotherPage': {}
                });
                var siteDataWrapper = SiteDataAPI.createSiteDataAPIAndDal(this.siteData, _.noop);
                var viewerPrivateServices = {
                    pointers: siteDataWrapper.pointers,
                    displayedDAL: siteDataWrapper.displayedDal,
                    siteDataAPI: siteDataWrapper.siteDataAPI
                };
                this.props = {
                    siteData: this.siteData,
                    getSiteContainer: function () {
                        return React.DOM.div();
                    },
                    viewerPrivateServices: viewerPrivateServices
                };
                this.node = window.document.createElement('div');
                this.wixSite = testUtils.getComponentFromReactClass(WixSiteReactClass, this.props, this.node);// reactTestUtils.renderIntoDocument(React.createElement(WixSiteReactClass, this.props));
            });

            it('should have wixSite comp', function () {
                expect(this.wixSite).toBeTruthy();
            });

            it('should not delete measureMap from site data on first site update', function() {
                testUtils.getComponentFromReactClass(WixSiteReactClass, this.props, this.node);
                expect(this.siteData.measureMap).not.toBeUndefined();
            });

            it('should not delete measureMap when a new page without active modes has been added to activeModes map', function() {
                this.siteData.setActiveModes({
                    'mainPage': {},
                    'anotherPage': {},
                    'newPage': {}
                });
                testUtils.getComponentFromReactClass(WixSiteReactClass, this.props, this.node);
                expect(this.siteData.measureMap).not.toBeUndefined();
            });
        });

        describe('with mocked lifecycle', function () {
            function fakeLifecycleMethods(ReactClass) {
                spyOn(ReactClass.prototype, 'render').and.returnValue(React.DOM.div());
                spyOn(ReactClass.prototype, 'componentDidMount');
                spyOn(ReactClass.prototype, 'componentWillUnmount');
                spyOn(ReactClass.prototype, 'componentDidUpdate');
            }

            function fakeSetState(ReactClass) {
                spyOn(ReactClass.prototype, 'setState').and.callFake(function (nextState) {
                    this.state = _.assign({}, this.state, nextState);
                });
            }

            function fakeRenderSite() {
                var siteAPI = mockFactory.mockSiteAPI(mockFactory.mockSiteData({getPagesDataForRmi : function(){return [];}}));
                var siteDataMock = siteAPI.getSiteData();

                var siteDataWrapper = SiteDataAPI.createSiteDataAPIAndDal(siteDataMock, _.noop);
                var viewerPrivateServices = {
                    pointers: siteDataWrapper.pointers,
                    displayedDAL: siteDataWrapper.displayedDal,
                    siteDataAPI: siteDataWrapper.siteDataAPI
                };
                var displayedSiteData = siteDataWrapper.siteData;

                var props = {
                    className: displayedSiteData.rendererModel.siteInfo.documentType === 'WixSite' ? 'wixSiteProperties' : 'noop',
                    siteData: displayedSiteData,
                    rootId: "masterPage",
                    navigateMethod: jasmine.createSpy('navigateTo'),
                    updateHeadMethod: jasmine.createSpy('updatePageHeadTags'),
                    getSiteContainer: jasmine.createSpy('getSiteContainer'),
                    viewerPrivateServices: viewerPrivateServices,
                    wixCodeAppApi: {
                        init: jasmine.createSpy('init'),
                        sendMessage: jasmine.createSpy('sendMessage'),
                        registerMessageHandler: jasmine.createSpy('registerMessageHandler'),
                        registerMessageModifier: jasmine.createSpy('registerMessageModifier')
                    }
                };

                var mockSiteAPIClass = mockFactory.mockSiteAPIClass();

                //mockSiteAPIClass.prototype.getRuntimeDal.and.callFake(siteAPI.getRuntimeDal.bind(siteAPI));
                mockSiteAPIClass.prototype.getSiteAspect.and.callFake(function (name) {
                    if (name === 'siteMembers') {
                        return {
                            isPageAllowed: function () {
                                return true;
                            }
                        };
                    }

                    return {};
                });

                var WixSiteReact = wixSiteReactDef(
                    $,
                    _,
                    React,
                    reactDOM,
                    santaProps,
                    styleCollector,
                    wixThemeReactClass,
                    wixPageReactClass,
                    wixBackgroundInstantiator,
                    layout,
                    utils,
                    mockSiteAPIClass,
                    siteAspectsMixin,
                    animations,
                    siteAspectsDomContainerClass,
                    extraSiteHeightClass,
                    blockingLayerClass,
                    wixAdsInstatiator,
                    mobileAppBannerInstantiator,
                    mousetrap,
                    siteBI,
                    renderDoneMixin,
                    WixPopupContainerClass,
                    siteClickHandler,
                    siteTraversalMixin,
                    selectionSharer,
                    experiment
                );

                fakeLifecycleMethods(WixSiteReact);
                fakeSetState(WixSiteReact);

                return reactTestUtils.renderIntoDocument(React.createElement(WixSiteReact, props));
            }

            describe('getPrimaryPage', function () {
                it('should not throw if #props.rootId is "masterPage" and #refs is {}', function () {
                    var wixSite = fakeRenderSite();

                    expect(function () {
                        wixSite.getPrimaryPage.call({props: {rootId: 'masterPage'}, refs: {}});
                    }).not.toThrow();
                });
            });

            describe('getCurrentPopup:', function () {
                var wixSite;

                var testSuite = {
                    setup: function (sets) {
                        wixSite.props.siteData.getCurrentPopupId.and.returnValue(sets.popupId);
                        utils.reactComponentUtils.getRef.and.returnValue(sets.popupComponent);

                        return {
                            expect: function (currentPopup) {
                                return {
                                    toBe: function (popupComponent) {
                                        expect(currentPopup).toBe(popupComponent);
                                    }
                                };
                            }
                        };
                    }
                };

                beforeEach(function () {
                    wixSite = fakeRenderSite();
                    spyOn(wixSite.props.siteData, 'getCurrentPopupId');
                    spyOn(utils.reactComponentUtils, 'getRef');
                });

                it('should return "null" if there is no popup', function () {
                    testSuite.setup({popupId: null}).expect(wixSite.getCurrentPopup()).toBe(null);
                });

                it('should return popup ref if popup exists', function () {
                    testSuite.setup({
                        popupId: 'testPopupId',
                        popupComponent: 'popupComponent'
                    }).expect(wixSite.getCurrentPopup()).toBe('popupComponent');

                    testSuite.setup({
                        popupId: 'otherPopupId',
                        popupComponent: 'otherPopupComponent'
                    }).expect(wixSite.getCurrentPopup()).toBe('otherPopupComponent');
                });
            });

        });

        describe('navigation', function(){
            beforeEach(function(done){
                this.mockSiteData = testUtils.mockFactory.mockSiteData();
                this.newPageId = 'newPageId';
                this.mockSiteData.addPageWithDefaults(this.newPageId);
                requirejs(['widgets'], done);
            });
            describe('platform apps loading - sv_platform exp open', function(){
                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('sv_platform1');
                    this.mockSite = testUtils.mockFactory.mockWixSiteReact(this.mockSiteData, null, {});
                    this.widgetAspect = this.mockSite.siteAPI.getSiteAspect('WidgetAspect');
                    spyOn(this.widgetAspect, 'loadApps').and.callThrough();
                });
                it('should load apps when primary page was changed', function(){
                    this.navInfoOfNewPage = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.newPageId);
                    var newPageInfo = this.mockSiteData.getExistingRootNavigationInfo(this.newPageId);
                    var linkUrl = this.mockSiteData.getPageUrl(newPageInfo);

                    this.mockSite.handleNavigation(this.navInfoOfNewPage, linkUrl, true);

                    expect(this.widgetAspect.loadApps).toHaveBeenCalledWith([this.newPageId]);
                });

                it('should not load apps when focused page was not changed', function(){
                    var navInfoNoChange = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.mockSiteData.getPrimaryPageId());
                    var linkUrl = this.mockSiteData.getCurrentUrl();

                    this.mockSite.handleNavigation(navInfoNoChange, linkUrl, false);

                    expect(this.widgetAspect.loadApps).not.toHaveBeenCalled();
                });
            });

            describe('platform apps loading - sv_platform exp closed', function(){
                beforeEach(function(){
                    this.mockSite = testUtils.mockFactory.mockWixSiteReact(this.mockSiteData, null, {});
                    this.widgetAspect = this.mockSite.siteAPI.getSiteAspect('WidgetAspect');
                    spyOn(this.widgetAspect, 'loadApps').and.callThrough();
                });

                it('should not load apps if primary page was changed', function(){
                    var navInfoOfNewPage = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.newPageId);
                    var newPageInfo = this.mockSiteData.getExistingRootNavigationInfo(this.newPageId);
                    var linkUrl = this.mockSiteData.getPageUrl(newPageInfo);

                    this.mockSite.handleNavigation(navInfoOfNewPage, linkUrl, true);

                    expect(this.widgetAspect.loadApps).not.toHaveBeenCalled();
                });

                it('should not load apps in case focuse page was not changed', function(){
                    var navInfoNoChange = testUtils.mockFactory.mockNavInfo(this.mockSiteData, this.mockSiteData.getPrimaryPageId());
                    var linkUrl = this.mockSiteData.getCurrentUrl();

                    this.mockSite.handleNavigation(navInfoNoChange, linkUrl, false);

                    expect(this.widgetAspect.loadApps).not.toHaveBeenCalled();
                });
            });
        });
    });
});
