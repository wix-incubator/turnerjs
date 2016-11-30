define(['react', 'zepto', 'lodash', 'core', 'tpa', 'testUtils', 'tpa/bi/errors', 'tpa/services/clientSpecMapService', 'tpa/utils/tpaUtils', 'definition!tpa/mixins/tpaCompBaseMixin'],
    function (React, $, _, core, tpa, testUtils, tpaErrors, clientSpecMapService, tpaUtils, tpaCompBaseMixinDef) {
    'use strict';

        var reactestUtils = React.addons.TestUtils;

    describe('tpaCompBaseMixin', function () {
        var mixin;

        beforeEach(function() {
            mixin = tpaCompBaseMixinDef(null, _, null, tpaErrors, clientSpecMapService, tpaUtils);
        });

        describe('getInitialState', function() {
            beforeEach(function() {
                mixin.getBaseUrl = jasmine.createSpy('getBaseUrl');
                mixin.props = {
                    style: {width: 100},
                    siteData: {
                        currentUrl: {protocol: 'whoadude'},
                        isMobileView: function () {}
                    }
                };
            });

            it('should return the correct initial state', function() {
                var state = mixin.getInitialState();
                expect(state).toBeDefined();
                expect(state.overlay).toBe(null);
                expect(state.isAlive).toBeFalsy();
                expect(state.initialWidth).toBe(100);
            });

        });

        describe('getInitialState form section under mobile not optimized', function() {
            beforeEach(function() {
                mixin.getBaseUrl = jasmine.createSpy('getBaseUrl');
                mixin.props = {
                    style: {width: 100},
                    siteData: {
                        currentUrl: {protocol: 'whoadude'},
                        isMobileView: function () {
                            return true;
                        }
                    }
                };
                mixin.isMobileReady = function () {
                    return false;
                };
            });

            it('should return overlay initial state', function() {
                var state = mixin.getInitialState();
                expect(state).toBeDefined();
                expect(state.overlay).toBe('unavailableInMobile');
                expect(state.isAlive).toBeFalsy();
                expect(state.initialWidth).toBe(100);
            });

        });

        describe('componentDidMount', function () {
            var widgetUrl = 'http://widgeturl';
            var appDefinitionId = 'appDefinitionId';

            beforeEach(function() {
                mixin.props = {
                    currentPage: 'currentPage',
                    siteData: {
                        isViewerMode: function () {
                            return true;
                        }
                    }
                };
                mixin.getAppData = jasmine.createSpy().and.returnValue({
                    appDefinitionId: appDefinitionId,
                    widgets: {
                        widget1: {
                            widgetUrl: widgetUrl
                        }
                    }
                });
            });

            describe('when state.isAlive is truthy', function () {
                beforeEach(function() {
                    mixin.state = {isAlive: true};
                });

                it('should not set _appIsAliveTimeout', function() {
                    mixin.componentDidMount();
                    expect(mixin._appAliveTimeout).toBeFalsy();
                });
            });

            describe('when state.isAlive is falsy', function() {
                beforeEach(function() {
                    jasmine.clock().install();
                    mixin.state = {isAlive: false, overlay: 'correctState'};
                    spyOn(mixin, '_showOverlayIfNeeded');
                });

                afterEach(function() {
                    jasmine.clock().uninstall();
                });

                it('should set _appIsAliveTimeout', function() {
                    mixin.componentDidMount();
                    expect(mixin._appAliveTimeout).toBeTruthy();
                });

                it('should invoke this._onAppAliveTimeoutExpires after ALIVE_TIMEOUT', function() {
                    spyOn(mixin, '_onAppAliveTimeoutExpires');
                    mixin.componentDidMount();
                    jasmine.clock().tick(mixin.ALIVE_TIMEOUT + 1);
                    expect(mixin._onAppAliveTimeoutExpires).toHaveBeenCalled();
                });

                describe('BI event for non responsive apps', function () {

                    beforeEach(function () {
                        var siteData = testUtils.mockFactory.mockSiteData();
                        siteData.isMobileView = function () {
                            return false;
                        };
                        siteData.rendererModel.clientSpecMap[14] = {
                            appDefinitionId: appDefinitionId,
                            widgets: {
                                widget1: {
                                    widgetUrl: widgetUrl
                                }
                            }
                        };
                        siteData.rendererModel.clientSpecMap[15] = {
                            appDefinitionId: appDefinitionId,
                            widgets: {
                                section: {
                                    widgetUrl: widgetUrl,
                                    appPage: {
                                        name: 'name',
                                        hidden: false
                                    }
                                }
                            }
                        };
                        mixin.props.siteData = siteData;
                        this.mockProps = testUtils.mockFactory
                            .mockProps(siteData)
                            .setCompData({
                                applicationId: '14',
                                widgetId: 'widget1'
                            });
                        this.compWithMixin = React.createClass({
                            displayName: 'compWithMixin',
                            mixins: [mixin],
                            render: function () {
                                return React.createElement('div', {});
                            }
                        });
                    });

                    it('should invoke BI event after ALIVE_TIMEOUT in viewer for widget', function (done) {
                        var params = {
                            "endpoint": widgetUrl,
                            "app_id": appDefinitionId
                        };

                        var self = this;
                        spyOn(this.mockProps.siteAPI, 'reportBI').and.callFake(function () {
                            expect(self.mockProps.siteAPI.reportBI).toHaveBeenCalledWith(tpaErrors.APP_IS_NOT_RESPONSIVE, params);
                            done();
                        });
                        var instance = React.createElement(this.compWithMixin, this.mockProps);
                        reactestUtils.renderIntoDocument(instance);
                        jasmine.clock().tick(mixin.ALIVE_TIMEOUT + 1);
                    });

                    it('should invoke BI event after ALIVE_TIMEOUT in viewer for section', function (done) {
                        var params = {
                            "endpoint": widgetUrl,
                            "app_id": appDefinitionId
                        };
                        this.mockProps.compData = {
                            applicationId: '15',
                            widgetId: null
                        };
                        mixin.getAppData.and.returnValue({
                            appDefinitionId: appDefinitionId,
                            widgets: {
                                section: {
                                    widgetUrl: widgetUrl,
                                    appPage: {
                                        name: 'name',
                                        hidden: false
                                    }
                                }
                            }
                        });
                        var self = this;
                        spyOn(this.mockProps.siteAPI, 'reportBI').and.callFake(function () {
                            expect(self.mockProps.siteAPI.reportBI).toHaveBeenCalledWith(tpaErrors.APP_IS_NOT_RESPONSIVE, params);
                            done();
                        });
                        var instance = React.createElement(this.compWithMixin, this.mockProps);
                        reactestUtils.renderIntoDocument(instance);
                        jasmine.clock().tick(mixin.ALIVE_TIMEOUT + 1);
                    });

                    it('should not invoke BI event for responsive app', function () {
                        spyOn(this.mockProps.siteAPI, 'reportBI');
                        var instance = React.createElement(this.compWithMixin, this.mockProps);
                        reactestUtils.renderIntoDocument(instance);
                        expect(this.mockProps.siteAPI.reportBI).not.toHaveBeenCalledWith(jasmine.any(Object), tpaErrors.APP_IS_NOT_RESPONSIVE, jasmine.any(Object));
                    });

                });
            });

            describe('when state.isAlive is falsy and state.overlay is incorrect', function() {
                beforeEach(function() {
                    jasmine.clock().install();
                    mixin.state = {isAlive: false, overlay: 'unavailableInMobile'};
                    spyOn(mixin, '_showOverlayIfNeeded');
                    spyOn(mixin, '_onAppAliveTimeoutExpires');
                });

                afterEach(function() {
                    jasmine.clock().uninstall();
                });

                it('should not set _appIsAliveTimeout', function() {
                    mixin.componentDidMount();
                    expect(mixin._appAliveTimeout).toBeFalsy();
                });

                it('should not invoke this._onAppAliveTimeoutExpires after ALIVE_TIMEOUT', function() {
                    mixin.componentDidMount();
                    jasmine.clock().tick(mixin.ALIVE_TIMEOUT + 1);
                    expect(mixin._onAppAliveTimeoutExpires).not.toHaveBeenCalled();
                });
            });
        });

        describe('componentWillUnmount', function() {
            beforeEach(function() {
                mixin.state = {registeredEvents: []};
                mixin.setState = jasmine.createSpy('setState');
                spyOn(mixin, '_clearAliveTimeout');
            });

            it('should call _clearAliveTimeout', function() {
                mixin.componentWillUnmount();
                expect(mixin._clearAliveTimeout).toHaveBeenCalled();
            });
        });

        describe('_clearAliveTimeout', function() {
            var origClearTimeout = clearTimeout;

            beforeEach(function() {
                window.clearTimeout = jasmine.createSpy('clearTimeout');
            });

            afterEach(function() {
                window.clearTimeout = origClearTimeout;
            });

            describe('when this._appAliveTimeout is falsy', function() {
                beforeEach(function() {
                    mixin._appAliveTimeout = null;
                });

                it('should not call clearTimeout', function() {
                    mixin._clearAliveTimeout();
                    expect(clearTimeout).not.toHaveBeenCalled();
                });
            });

            describe('when this._appAliveTimeout is truthy', function() {
                var intervalId = 123123123123;
                beforeEach(function() {
                    mixin._appAliveTimeout = intervalId;
                });

                it('should call clearTimeout', function() {
                    mixin._clearAliveTimeout();
                    expect(clearTimeout).toHaveBeenCalledWith(intervalId);
                });
            });
        });

        describe('setAppIsAlive', function() {
            var newState;

            beforeEach(function() {
                spyOn(mixin, '_clearAliveTimeout');
                mixin.state = {};
                mixin.setState = jasmine.createSpy('setState').and.callFake(function(state) { newState = state; });
            });

            it('should call _clearAliveTimeout', function() {
                mixin.setAppIsAlive();
                expect(mixin._clearAliveTimeout).toHaveBeenCalled();
            });

            describe('setState', function() {
                it('should call setState with isAlive=true', function() {
                    mixin.setAppIsAlive();
                    expect(newState.isAlive).toBe(true);
                });

                describe('when this.state.overlay !== "preloader"', function() {
                    beforeEach(function(){
                        mixin.state.overlay = 'foo';
                    });

                    it('should call setState with overlay=null', function() {
                        mixin.setAppIsAlive();
                        expect(newState.overlay).toBe('foo');
                    });
                });

                describe('when this.state.overlay === "preloader"', function() {
                    beforeEach(function(){
                        mixin.state.overlay = 'preloader';
                    });

                    it('should call setState with overlay=null', function() {
                        mixin.setAppIsAlive();
                        expect(newState.overlay).toBeNull();
                    });
                });
            });
        });

        describe('_isUrlSecure', function() {
            it('should return false for http', function() {
                expect(mixin._isUrlSecure('http://example.org')).toBe(false);
            });

            it('should return true for https', function() {
                expect(mixin._isUrlSecure('https://example.org')).toBe(true);
            });
        });

        describe('_getInitialOverlay', function() {
            it('should return "preloader" when both urls are insecure', function() {
                expect(mixin._getInitialOverlay('http://myapp.com', 'http://mysite.com')).toBe('preloader');
            });

            it('should return "preloader" when the site url is secure and the iframe url is not', function() {
                expect(mixin._getInitialOverlay('http://myapp.com', 'http://mysite.com')).toBe('preloader');
            });

            it('should return "preloader" when the iframe url is secure and the site url is not', function() {
                expect(mixin._getInitialOverlay('https://myapp.com', 'http://mysite.com')).toBe('preloader');
            });
        });

        describe('ecom params', function () {
            it('should return has no ecom parmas by default', function () {
                mixin.getAppData = jasmine.createSpy().and.returnValue({
                    appDefinitionId: '123'
                });
                var ecomParam = mixin.getEcomParams();
                expect(ecomParam).toBeFalsy();
            });

            it('should return has no ecom parmas for ecom app when site has no proper query param', function () {
                mixin.getAppData = jasmine.createSpy().and.returnValue({
                    appDefinitionId: '1380b703-ce81-ff05-f115-39571d94dfcd'
                });
                mixin.props = {
                    siteData: {
                        currentUrl: {
                            query: {
                                appDefinitionId: '123'
                            }
                        }
                    }
                };
                var ecomParam = mixin.getEcomParams();
                expect(ecomParam).toBeFalsy();
            });

            it('should return ecom parmas for ecom app when site has ecom-tpa-params query param', function () {
                mixin.getAppData = jasmine.createSpy().and.returnValue({
                    appDefinitionId: '1380b703-ce81-ff05-f115-39571d94dfcd'
                });
                var param = 'foo:bar';
                var query = {};
                query['ecom-tpa-params'] = param;
                mixin.props = {
                    siteData: {
                        currentUrl: {
                            query: query
                        }
                    }
                };
                var ecomParam = mixin.getEcomParams();
                expect(ecomParam).toBe(param);
            });
        });

        describe("_shouldShowIframe", function() {
            it("should not show iframe if in viewer and renderer model is not loaded", function() {
                mixin.props = {
                    siteData: {
                        publicModel : {
                        },
                        isViewerMode: function () {return true;}
                    }
                };

                var state = {overlay: 'preloader'};

                expect(mixin._shouldShowIframe(state)).toBeTruthy();
            });

            it("should show iframe if in preview and renderer model is not loaded", function() {
                mixin.props = {
                    siteData: {
                        isViewerMode: function () {return false;}
                    }
                };

                var state = {overlay: 'preloader'};

                expect(mixin._shouldShowIframe(state)).toBeTruthy();
            });

            it("should show iframe if in preview and renderer model is not loaded", function() {
                mixin.props = {
                    siteData: {
                        isViewerMode: function () {return false;}
                    }
                };

                var state = {};

                expect(mixin._shouldShowIframe(state)).toBeTruthy();
            });
        });

        describe("_showOverlayIfNeeded", function() {
            beforeEach(function () {
                jasmine.clock().install();
                mixin.state = {overlay: null};
                mixin.props = {
                    siteData: {
                        isViewerMode: jasmine.createSpy().and.returnValue(true)
                    }
                };
                mixin.getAppData = jasmine.createSpy().and.returnValue({
                });
                spyOn(mixin, '_showOverlayIfNeeded');
            });

            afterEach(function() {
                jasmine.clock().uninstall();
            });

            it("should not call _showOverlayIfNeeded before mixin.OVERLAY_GRACE timeout", function() {
                mixin.componentDidMount();
                expect(mixin._showOverlayIfNeeded).not.toHaveBeenCalled();
            });

            it("should call _showOverlayIfNeeded after mixin.OVERLAY_GRACE timeout", function() {
                mixin.componentDidMount();
                jasmine.clock().tick(mixin.OVERLAY_GRACE + 1);
                expect(mixin._showOverlayIfNeeded).toHaveBeenCalled();
            });
        });

        describe('shouldRenderIFrame', function(){
            beforeEach(function() {
                mixin.state = {};
                mixin.props = {
                    siteData: {
                        isViewerMode: jasmine.createSpy()
                    }
                };
            });

            it('should return false if the overlay state is one of DENY_IFRAME_RENDERING_STATES', function() {
                mixin.state.overlay = 'unavailableInMobile';
                expect(mixin.shouldRenderIframe()).toBeFalsy();
            });

            it('should return false if the overlay state is unresponsive', function() {
                mixin.state.overlay = 'unresponsive';
                expect(mixin.shouldRenderIframe()).toBeFalsy();
            });

            it('should return true if in viewer mode', function() {
                mixin.state.overlay = '';
                mixin.props.siteData.isViewerMode.and.returnValue(true);
                expect(mixin.shouldRenderIframe()).toBeTruthy();
            });

            it('should return true if not in viewer mode and state is empty', function() {
                mixin.state.overlay = '';
                mixin.props.siteData.isViewerMode.and.returnValue(false);
                expect(mixin.shouldRenderIframe()).toBeTruthy();
            });
        });
    });
});
