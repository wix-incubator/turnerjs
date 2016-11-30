define(['zepto', 'lodash', 'experiment', 'core', 'utils', 'animations', 'react', 'definition!tpa/handlers/tpaHandlers',
        'tpa/handlers/tpaHandlers',
        'tpa/utils/tpaUtils', 'tpa/utils/tpaStyleUtils', 'fonts', 'tpa/utils/sitePages', 'tpa/bi/errors',
        'testUtils', 'tpa/handlers/anchorHandlers', 'tpa/services/clientSpecMapService'],
    function ($, _, experiment, core, utils, animations, React, tpaHandlerDef, tpaHandlers, tpaUtils, tpaStyleUtils, fonts, sitePages,
              tpaErrors, testUtils, anchorHandlers, clientSpecMapService) {
        'use strict';

        var pageTitle = 'pageTitle';
        var siteTitle = 'siteTitle';
        var url = 'http://www.hx0r.com/myPageId?foo=bar';
        var externalBaseUrl = 'http://www.hx0r.com/myPageId';
        var name = 'name';
        var userSession = 'userSession';
        var rectVal = {
            'left': 0,
            'right': 0,
            'top': 0,
            'bottom': 0,
            'height': 100,
            'width': 100
        };
        var offset = {
            left: 0,
            top: 0
        };
        var windowSize = {
            width: '100px',
            height: '100px'
        };
        var mockSitePages = [
            {
                hide: false,
                id: "pageId1",
                title: "Home"
            },
            {
                hide: false,
                id: "pageId2",
                title: "Home2"
            }
        ];
        var compMock,
            tpaStyleUtilsMock,
            TPAActivity = core.activityTypes.TPAActivity;

        var factory = testUtils.mockFactory;

        describe("tpaHandlers", function () {
            var siteAPI, activityTypes, siteData;
            var reactDOM, compNode, zeptoMock, sitePagesMock, pageServiceMock;

            beforeEach(function () {
                compNode = {
                    getBoundingClientRect: function () {
                        return rectVal;
                    }
                };
                reactDOM = {
                    findDOMNode: function () {
                        return compNode;
                    }
                };
                compMock = {
                    props: {
                        compData: {
                            applicationId: 1
                        },
                        structure: {
                            componentType: 'wysiwyg.viewer.components.tpapps.TPAWidget'
                        },
                        pageId: 'myPageId'
                    },
                    sendPostMessage: jasmine.createSpy(),
                    hasOrigComponent: function () {
                        return false;
                    }
                };

                siteData = factory.mockSiteData({
                    currentUrl: {
                        full: url,
                        protocol: 'http:',
                        host: 'www.hx0r.com/',
                        path: 'myPageId',
                        hostname: 'www.hx0r.com/'
                    }
                });
                siteData.addMeasureMap({siteMarginTop: 0});
                siteData.publicModel.externalBaseUrl = externalBaseUrl;
                siteData.rendererModel.siteInfo.siteTitleSEO = siteTitle;
                siteData.publicModel.pageList.mainPageId = 'myPageId';
                siteData.overrideClientSpecMap({
                    "1": {
                        applicationId: 1,
                        appDefinitionName: name

                    },
                    "2": {
                        applicationId: 2,
                        appDefinitionName: name + "2"

                    }
                });
                siteData.addPageWithData('myPageId', {
                    title: pageTitle,
                    pageTitleSEO: ''
                });
                siteData.setCurrentPage('myPageId');
                siteAPI = factory.mockSiteAspectSiteAPI(siteData);
                spyOn(siteAPI, 'getComponentById').and.returnValue(compMock);

                sitePagesMock = {
                    getSitePagesInfoData: jasmine.createSpy().and.returnValue(mockSitePages)
                };

                pageServiceMock = {
                    mapPageToWidgets: jasmine.createSpy()
                };

                activityTypes = core.activityTypes;
                core.activityTypes = {
                    TPAActivity: TPAActivity
                };

                spyOn(core.activityService, 'reportActivity');
                zeptoMock = function () {
                    return {
                        attr: jasmine.createSpy(),
                        offset: jasmine.createSpy().and.returnValue(offset),
                        width: function () {
                            return windowSize.width;
                        },
                        height: function () {
                            return windowSize.height;
                        }
                    };
                };

                tpaStyleUtilsMock = {
                    getTextPresets: jasmine.createSpy('getTextPresets'),
                    getSiteColors: jasmine.createSpy('getSiteColors'),
                    getStylesForSDK: jasmine.createSpy('getStylesForSDK'),
                    getStyleDataToPassIntoApp: jasmine.createSpy('getStylesForSDK')
                };

                this.tpaHandlers = tpaHandlerDef(zeptoMock, _, React, core, utils, animations, sitePagesMock, pageServiceMock, clientSpecMapService, tpaUtils, tpaStyleUtilsMock, tpaErrors, reactDOM, anchorHandlers, experiment);
            });

            afterEach(function () {
                core.activityTypes = activityTypes;
            });

            describe('site info', function () {

                it('should handle siteInfo', function () {
                    var callbackFn = jasmine.createSpy('callback');

                    this.tpaHandlers.siteInfo(siteAPI, {version: '1.40.0'}, callbackFn);
                    var callbackFnKeys = ['siteTitle', 'siteDescription', 'siteKeywords', 'pageTitle', 'referer', 'url', 'baseUrl'];
                    expect(callbackFn).toHaveBeenCalled();
                    var result = callbackFn.calls.first().args[0];

                    expect(result.pageTitle).toEqual(pageTitle);
                    expect(result.baseUrl).toEqual(externalBaseUrl);
                    expect(result.url).toEqual(url);


                    var expectedArgs = _.keys(result);
                    _.forEach(callbackFnKeys, function (key) {
                        expect(expectedArgs).toContain(key);
                    });
                });

                it('should have siteTitle and pageTitle if SDK version *BEFORE* 1.41.0', function () {
                    var callbackFn = jasmine.createSpy('callback');

                    this.tpaHandlers.siteInfo(siteAPI, {version: '1.40.0'}, callbackFn);
                    expect(callbackFn).toHaveBeenCalled();
                    var result = callbackFn.calls.first().args[0];

                    expect(result.siteTitle).toEqual(siteTitle);
                    expect(result.pageTitle).toBe(pageTitle);
                    expect(result.baseUrl).toEqual(externalBaseUrl);
                    expect(result.url).toEqual(url);
                });

                it('should have pageTitle only when SDK version is 1.42.0 and above', function () {
                    var callbackFn = jasmine.createSpy('callback');

                    this.tpaHandlers.siteInfo(siteAPI, {version: '1.42.0'}, callbackFn);
                    expect(callbackFn).toHaveBeenCalled();
                    var result = callbackFn.calls.first().args[0];

                    expect(result.siteTitle).toBe(undefined);

                    // it's not a mistake, siteTitle is actually the right title for the page. we kept that functionality until 1.42.0 SDK version.
                    expect(result.pageTitle).toEqual(siteTitle);
                    expect(result.baseUrl).toEqual(externalBaseUrl);
                    expect(result.url).toEqual(url);
                });

                it('should have siteTitle and pageTitle if SDK version is UNKNOWN', function () {
                    var callbackFn = jasmine.createSpy('callback');

                    this.tpaHandlers.siteInfo(siteAPI, {version: 'UNKNOWN'}, callbackFn);
                    expect(callbackFn).toHaveBeenCalled();
                    var result = callbackFn.calls.first().args[0];

                    expect(result.siteTitle).toEqual(siteTitle);
                    expect(result.pageTitle).toBe(pageTitle);
                    expect(result.baseUrl).toEqual(externalBaseUrl);
                    expect(result.url).toEqual(url);
                });
            });

            describe('setPageMetadata', function () {
                beforeEach(function () {
                    siteAPI.setRunTimePageTitle = jasmine.createSpy('setRunTimePageTitle');
                });

                it('should not set title for TPAWidget', function () {
                    compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';

                    this.tpaHandlers.setPageMetadata(siteAPI, {data: {title: 'title'}});

                    expect(siteAPI.setRunTimePageTitle).not.toHaveBeenCalled();
                });

                it('should not set title for TPAGluedWidget', function () {
                    compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAGluedWidget';

                    this.tpaHandlers.setPageMetadata(siteAPI, {data: {title: 'title'}});

                    expect(siteAPI.setRunTimePageTitle).not.toHaveBeenCalled();
                });

                it('should set title for TPASection', function () {
                    compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPASection';

                    this.tpaHandlers.setPageMetadata(siteAPI, {data: {title: 'title'}});

                    expect(siteAPI.setRunTimePageTitle).toHaveBeenCalledWith('title', '');
                });

                it('should set title for TPAMultiSection', function () {
                    compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAMultiSection';

                    this.tpaHandlers.setPageMetadata(siteAPI, {data: {title: 'title'}});

                    expect(siteAPI.setRunTimePageTitle).toHaveBeenCalledWith('title', '');
                });

                it('should set description for TPAMultiSection', function () {
                    compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAMultiSection';

                    this.tpaHandlers.setPageMetadata(siteAPI, {data: {description: 'description'}});

                    expect(siteAPI.setRunTimePageTitle).toHaveBeenCalledWith('pageTitle', 'description');
                });

                it('should set both title and description for TPAMultiSection', function () {
                    compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAMultiSection';

                    this.tpaHandlers.setPageMetadata(siteAPI, {data: {title: 'title', description: 'description'}});

                    expect(siteAPI.setRunTimePageTitle).toHaveBeenCalledWith('title', 'description');
                });

                it('should not set title if the comp is not on the current page', function () {
                    compMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAMultiSection';
                    compMock.props.pageId = '1';

                    this.tpaHandlers.setPageMetadata(siteAPI, {data: {title: 'title'}});

                    expect(siteAPI.setRunTimePageTitle).not.toHaveBeenCalled();
                });

            });

            describe('boundingRectAndOffsets', function () {
                it('should handle boundingRectAndOffsets', function () {
                    var msg = {
                        compId: 1381
                    };
                    var callbackFn = jasmine.createSpy('callback');
                    this.tpaHandlers.boundingRectAndOffsets(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({
                        rect: rectVal,
                        offsets: {
                            x: offset.left,
                            y: offset.top
                        },
                        scale: 1
                    });
                });

                it('should handle boundingRectAndOffsets and add scale', function () {
                    var msg = {
                        compId: 1381
                    };
                    siteData.renderFlags.siteScale = 0.5;
                    var callbackFn = jasmine.createSpy('callback');
                    this.tpaHandlers.boundingRectAndOffsets(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({
                        rect: rectVal,
                        offsets: {
                            x: offset.left,
                            y: offset.top
                        },
                        scale: 0.5
                    });
                });

                it('should handle boundingRectAndOffsets and floor values', function () {
                    var floatingPointValues = {
                        left: 10.5,
                        right: 3.5
                    };
                    var expectedValues = {
                        left: 10,
                        right: 3
                    };

                    var clonedCompNode = _.cloneDeep(compNode);
                    clonedCompNode.getBoundingClientRect = function () {
                        return floatingPointValues;
                    };
                    reactDOM = {
                        findDOMNode: function () {
                            return clonedCompNode;
                        }
                    };
                    var msg = {
                        compId: 1381
                    };

                    this.tpaHandlers = tpaHandlerDef(zeptoMock, _, React, core, utils, animations, sitePagesMock, pageServiceMock, clientSpecMapService, tpaUtils, tpaStyleUtilsMock, tpaErrors, reactDOM, anchorHandlers);
                    var callbackFn = jasmine.createSpy('callback');
                    this.tpaHandlers.boundingRectAndOffsets(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({
                        rect: expectedValues,
                        offsets: {
                            x: offset.left,
                            y: offset.top
                        },
                        scale: 1
                    });
                });

                it('should handle boundingRectAndOffsets for site with fixed position header', function () {
                    var msg = {
                        compId: 1381
                    };
                    var callbackFn = jasmine.createSpy('callback');
                    var SITE_HEADER_HEIGHT = 100;
                    siteData.addMeasureMap({
                        height: {
                            SITE_HEADER: SITE_HEADER_HEIGHT
                        },
                        custom: {
                            SITE_HEADER: {
                                isFixedPosition: true
                            }
                        }
                    });

                    var siteHeaderMock = {
                        props: {
                            structure: {
                                layout: {
                                    fixedPosition: true,
                                    height: SITE_HEADER_HEIGHT
                                }
                            }
                        }
                    };
                    siteAPI.getComponentById.and.callFake(function (args) {
                        if (args === 'SITE_HEADER') {
                            return siteHeaderMock;
                        }
                        return compMock;
                    });
                    this.tpaHandlers.boundingRectAndOffsets(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({
                        rect: {
                            'left': 0,
                            'right': 0,
                            'top': -SITE_HEADER_HEIGHT,
                            'bottom': 0,
                            'height': 100,
                            'width': 100
                        },
                        offsets: {
                            x: offset.left,
                            y: offset.top - SITE_HEADER_HEIGHT
                        },
                        scale: 1
                    });
                });
            });

            describe('navigateToPage', function () {

                beforeEach(function () {
                    spyOn(siteAPI, 'navigateToPage').and.callThrough();
                    spyOn(siteAPI, 'scrollToAnchor');
                    this.msg = {
                        data: {
                            pageId: 'currentPage'
                        }
                    };
                });

                it('should navigate to page if page exists', function () {
                    this.tpaHandlers.navigateToPage(siteAPI, this.msg);

                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'currentPage'});
                });

                it('should return error if page doesn\'t exist', function () {
                    this.msg.data.pageId = 'test';

                    this.tpaHandlers.navigateToPage(siteAPI, this.msg, function (error) {
                        expect(error).toEqual({
                            error: {
                                message: 'Page id "test" was not found.'
                            }
                        });
                        expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                    });
                });

                it('should not navigate if already on page', function () {
                    this.msg.data.pageId = 'myPageId';

                    this.tpaHandlers.navigateToPage(siteAPI, this.msg);

                    expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                });

                it('should navigate to page without transition in case noTransition is given ', function () {
                    this.msg.data.noTransition = true;

                    this.tpaHandlers.navigateToPage(siteAPI, this.msg);

                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: 'currentPage',
                        transition: 'none'
                    });
                });

                describe('with anchor', function () {

                    beforeEach(function () {
                        this.anchorData = siteData.mock.anchorData({
                            compId: 'anchor1',
                            name: 'anchor1',
                            pageId: 'myPageId'
                        });
                        testUtils.mockFactory.mockComponent('Anchor', siteData, 'myPageId', {data: this.anchorData});
                        siteAPI.getComponentById = jasmine.createSpy('getComponentById').and.returnValue({props: {compData: {id: this.anchorData.id}}});
                    });

                    it('should return error if anchor doesn\'t exist in page', function () {
                        this.msg.data.pageId = 'myPageId';
                        this.msg.data.anchorId = 'anchor2';

                        this.tpaHandlers.navigateToPage(siteAPI, this.msg, function (error) {
                            expect(error).toEqual({
                                error: {
                                    message: 'anchor with id "anchor2" was not found on the current page.'
                                }
                            });
                        });

                        expect(siteAPI.scrollToAnchor).not.toHaveBeenCalledWith(this.anchorData.id);
                        expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                    });

                    it('should scroll to anchor on the current page', function () {
                        this.msg.data.pageId = 'myPageId';
                        this.msg.data.anchorId = 'anchor1';

                        this.tpaHandlers.navigateToPage(siteAPI, this.msg);

                        expect(siteAPI.scrollToAnchor).toHaveBeenCalledWith(this.anchorData.id);
                        expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                    });

                    it('should navigate to page and scroll to anchor', function () {
                        this.site = testUtils.mockFactory.mockWixSiteReact(siteData);
                        spyOn(this.site.siteAPI, 'scrollToAnchor');
                        spyOn(this.site.siteAPI, 'navigateToPage').and.callThrough();
                        this.site.props.navigateMethod.and.callFake(function () {
                            anchorHandlers.navigateToAnchor(this.site.siteAPI, this.msg);
                        }.bind(this));
                        this.site.siteAPI.getComponentById = jasmine.createSpy('getComponentById').and.returnValue({props: {compData: {id: this.anchorData.id}}});
                        this.msg.data.pageId = 'currentPage';
                        this.msg.data.anchorId = 'anchor1';

                        this.tpaHandlers.navigateToPage(this.site.siteAPI, this.msg);

                        expect(this.site.siteAPI.navigateToPage).toHaveBeenCalledWith({pageId: 'currentPage'});
                        expect(this.site.siteAPI.scrollToAnchor).toHaveBeenCalledWith(this.anchorData.id);
                    });
                });
            });

            it('should handle getCurrentPageId', function () {
                var callbackFn = jasmine.createSpy('callback');
                this.tpaHandlers.getCurrentPageId(siteAPI, {}, callbackFn);
                expect(callbackFn).toHaveBeenCalledWith(siteData.getCurrentUrlPageId());
            });

            it('should handle getSitePages', function () {
                var callbackFn = jasmine.createSpy('callback');
                this.tpaHandlers.getSitePages(siteAPI, {}, callbackFn);
                expect(callbackFn).toHaveBeenCalledWith(mockSitePages);
            });

            it('should handle scrollBy', function () {
                spyOn(siteAPI, 'scrollSiteBy');
                this.tpaHandlers.scrollBy(siteAPI, {
                    data: {
                        x: 100,
                        y: 100
                    }
                });
                expect(siteAPI.scrollSiteBy).toHaveBeenCalledWith(100, 100);
            });

            it('should handle scrollTo', function () {
                spyOn(siteAPI, 'scrollSiteTo');
                this.tpaHandlers.scrollTo(siteAPI, {
                    data: {
                        x: 100,
                        y: 100
                    }
                });
                expect(siteAPI.scrollSiteTo).toHaveBeenCalledWith(100, 100);
            });

            describe('getCtToken', function () {
                it('should handle getCtToken', function () {
                    siteAPI.getSiteData = function() {
                        return {
                            getCTToken: function() {
                                return 'some token';
                            }
                        };
                    };
                    var callbackFn = jasmine.createSpy('callback');
                    this.tpaHandlers.getCtToken(siteAPI, {}, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith('some token');
                });

                it('should do nothing if callback is not a function', function () {
                    siteAPI.getSiteData = function() {
                        return {
                            getCTToken: function() {
                                return 'some token';
                            }
                        };
                    };
                    var callbackFn = jasmine.createSpy('callback');
                    this.tpaHandlers.getCtToken(siteAPI, {}, {});
                    expect(callbackFn).not.toHaveBeenCalled();
                });
            });
            describe('openModal', function () {

                it('should handle openModal', function () {
                    var msg = {
                        data: {
                            width: 100,
                            height: 110,
                            url: 'http://hx04.com'
                        },
                        compId: 1381
                    };

                    var data = {
                        width: 100,
                        height: 110,
                        url: 'http://hx04.com',
                        origCompId: 1381,
                        applicationId: 1,
                        origCompStyle: offset,
                        position: {origin: 'FIXED', placement: 'CENTER', x: 0, y: 0},
                        windowSize: windowSize,
                        tpaData: undefined
                    };

                    var callbackFn = jasmine.createSpy('callback');
                    var showModal = jasmine.createSpy();

                    siteAPI.getSiteAspect = function () {
                        return {
                            showModal: showModal
                        };
                    };

                    this.tpaHandlers.openModal(siteAPI, msg, callbackFn);

                    expect(showModal).toHaveBeenCalledWith(data, callbackFn);
                });

                it('should handle openModal and copy tpa data from orig comp', function () {
                    var copyCompMock = _.clone(compMock);
                    copyCompMock.props.compData.tpaData = '#tpaData_id';
                    var msg = {
                        data: {
                            width: 100,
                            height: 110,
                            url: 'http://hx04.com'
                        },
                        compId: 1381
                    };

                    var data = {
                        width: 100,
                        height: 110,
                        url: 'http://hx04.com',
                        origCompId: 1381,
                        applicationId: 1,
                        origCompStyle: offset,
                        position: {origin: 'FIXED', placement: 'CENTER', x: 0, y: 0},
                        windowSize: windowSize,
                        tpaData: '#tpaData_id'
                    };

                    var callbackFn = jasmine.createSpy('callback');
                    var showModal = jasmine.createSpy();
                    siteAPI.getComponentById.and.returnValue(copyCompMock);

                    siteAPI.getSiteAspect = function () {
                        return {
                            showModal: showModal
                        };
                    };

                    this.tpaHandlers.openModal(siteAPI, msg, callbackFn);

                    expect(showModal).toHaveBeenCalledWith(data, callbackFn);
                });
            });

            describe('openPopup', function () {

                it('should handle openPopup', function () {
                    var msg = {
                        data: {
                            width: 100,
                            height: 110,
                            url: 'http://hx04.com'
                        },
                        compId: 1381
                    };

                    var data = {
                        width: 100,
                        height: 110,
                        url: 'http://hx04.com',
                        origCompId: 1381,
                        applicationId: 1,
                        origCompStyle: offset,
                        position: {origin: 'FIXED', placement: 'CENTER', x: 0, y: 0},
                        windowSize: windowSize,
                        tpaData: undefined
                    };

                    var callbackFn = jasmine.createSpy('callback');
                    var showPopup = jasmine.createSpy();

                    siteAPI.getSiteAspect = function () {
                        return {
                            showPopup: showPopup
                        };
                    };

                    this.tpaHandlers.openPopup(siteAPI, msg, callbackFn);

                    expect(showPopup).toHaveBeenCalledWith(data, callbackFn);
                });

                it('should handle openPopup - throw error when opening it from modal', function () {
                    var msg = {
                        data: {
                            width: 100,
                            height: 110,
                            url: 'http://hx04.com'
                        },
                        compId: 1381
                    };

                    var callbackFn = jasmine.createSpy('callback');
                    var showPopup = jasmine.createSpy();
                    compMock.componentType = 'wysiwyg.viewer.components.tpapps.TPAModal';
                    siteAPI.getComponentById.and.returnValue(compMock);

                    siteAPI.getSiteAspect = function () {
                        return {
                            showPopup: showPopup
                        };
                    };

                    expect(this.tpaHandlers.openPopup.bind(siteAPI, msg, callbackFn)).toThrow();
                });
            });

            it('should handle getUserSession', function () {
                siteData.getSvSession = function () {
                    return userSession;
                };
                var callbackFn = jasmine.createSpy('callback');
                this.tpaHandlers.getUserSession(siteAPI, {}, callbackFn);
                expect(callbackFn).toHaveBeenCalledWith(userSession);
            });

            it('should handle closeWindow', function () {
                var msg = {
                    data: {
                        message: 'foo'
                    }
                };
                var hideComp = jasmine.createSpy();
                siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                    hide: hideComp
                });
                this.tpaHandlers.closeWindow(siteAPI, msg);
                expect(hideComp).toHaveBeenCalledWith(msg.data);
            });

            describe('appIsAlive', function () {
                it('should handle appIsAlive', function () {
                    var msg = {
                        compId: 1381
                    };
                    var callbackFn = jasmine.createSpy('callback');

                    this.tpaHandlers.appIsAlive(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalled();
                    expect(tpaStyleUtilsMock.getStyleDataToPassIntoApp).toHaveBeenCalledWith(jasmine.any(Object), compMock);
                });

                it('should return style data for runtime comps', function () {
                    var msg = {
                        compId: 1381
                    };
                    var callbackFn = jasmine.createSpy('callback');
                    var origComp = jasmine.createSpy('origComp');

                    compMock.hasOrigComponent = function () {
                        return true;
                    };
                    compMock.getOrigComponentId = function () {
                        return 'haxs0r';
                    };
                    siteAPI.getComponentById = function (id) {
                        if (id === compMock.getOrigComponentId()) {
                            return origComp;
                        }
                        return compMock;
                    };

                    this.tpaHandlers.appIsAlive(siteAPI, msg, callbackFn);
                    expect(tpaStyleUtilsMock.getStyleDataToPassIntoApp).toHaveBeenCalled();
                });

            });

            describe('resizeWindow', function () {
                describe('when a component with the specified id does not exist', function () {
                    beforeEach(function () {
                        siteAPI.getComponentById = jasmine.createSpy('getComponentById').and.returnValue(undefined);
                    });

                    it('should do nothing (and not throw)', function () {
                        var msg = {
                            data: {
                                width: 1,
                                height: 2
                            }
                        };

                        expect(function () {
                            this.tpaHandlers.resizeWindow(siteAPI, msg);
                        }.bind(this)).not.toThrow();
                    });
                });

                describe('when a component with the specified id exists', function () {
                    var comp;

                    beforeEach(function () {
                        comp = {
                            props: {
                                structure: {
                                    componentType: 'wysiwyg.viewer.components.tpapps.TPAGluedWidget'
                                }
                            }
                        };
                        siteAPI.getComponentById = jasmine.createSpy('getComponentById').and.returnValue(comp);
                    });

                    describe('when a component should not have resizeWindow functionality', function () {
                        it('should do nothing (and not throw)', function () {
                            comp = {
                                structure: {
                                    compType: 'not a glued widget type'
                                }
                            };
                            var msg = {
                                data: {
                                    width: 1,
                                    height: 2
                                }
                            };

                            expect(function () {
                                this.tpaHandlers.resizeWindow(siteAPI, msg);
                            }.bind(this)).not.toThrow();
                        });
                    });

                    describe('when a function "resizeWindow" exists on the component object', function () {
                        beforeEach(function () {
                            comp.resizeWindow = jasmine.createSpy('resizeWindow');
                        });

                        it('should call comp.resizeWindow and pass the msg.data property and the callback', function () {
                            var msg = {data: {width: 1, height: 2}};
                            var callback = _.noop;
                            this.tpaHandlers.resizeWindow(siteAPI, msg, callback);
                            expect(comp.resizeWindow).toHaveBeenCalledWith(1, 2, callback);
                        });

                        it('should support % values', function () {
                            var msg = {data: {width: '100%', height: '100%'}};
                            var callback = _.noop;
                            this.tpaHandlers.resizeWindow(siteAPI, msg, callback);
                            expect(comp.resizeWindow).toHaveBeenCalledWith('100%', '100%', callback);
                        });
                    });
                });
            });

            describe('Handle appStateChanged', function () {
                var state, msg, widget, section;
                beforeEach(function () {
                    state = 'test-state';
                    widget = {
                        props: {
                            structure: {
                                componentType: 'TPAWidget'
                            }
                        }
                    };
                    section = {
                        props: {
                            structure: {
                                componentType: 'wysiwyg.viewer.components.tpapps.TPASection'
                            }
                        },
                        setState: jasmine.createSpy()
                    };
                    siteAPI.getComponentById.and.returnValue(section);
                    //TODO: this is not good!! mock for real
                    spyOn(siteAPI, 'getRootOfComponentId').and.returnValue(0);
                    spyOn(siteData, 'getExistingRootNavigationInfo').and.returnValue({pageId: 0});
                    spyOn(siteAPI, 'navigateToPage');
                });

                it('should handle appStateChanged with state wrapper', function () {
                    msg = {
                        data: {
                            state: state
                        }
                    };

                    this.tpaHandlers.appStateChanged(siteAPI, msg);
                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: 0,
                        pageAdditionalData: state,
                        transition: 'none'
                    }, undefined, undefined);
                    expect(section.setState).toHaveBeenCalledWith({pushState: msg.data.state});
                });

                it('should handle appStateChanged with no wrapper', function () {
                    msg = {
                        data: state
                    };

                    this.tpaHandlers.appStateChanged(siteAPI, msg);
                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: 0,
                        pageAdditionalData: state,
                        transition: 'none'
                    }, undefined, undefined);
                    expect(section.setState).toHaveBeenCalledWith({pushState: msg.data});
                });

                it('should handle appStateChanged with state as a number', function () {
                    msg = {
                        data: "1"
                    };

                    this.tpaHandlers.appStateChanged(siteAPI, msg);
                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: 0,
                        pageAdditionalData: "1",
                        transition: 'none'
                    }, undefined, undefined);
                    expect(section.setState).toHaveBeenCalledWith({pushState: msg.data});
                });

                it('should not handle appStateChanged since comp is not a section', function () {
                    siteAPI.getComponentById.and.returnValue(widget);
                    msg = {
                        data: state
                    };

                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue();

                    this.tpaHandlers.appStateChanged(siteAPI, msg);
                    expect(siteAPI.navigateToPage).not.toHaveBeenCalledWith({pageId: 0, pageAdditionalData: state});
                });
            });

            describe('replace section state', function () {
                var state, msg, widget, section, multiSection;
                beforeEach(function () {
                    state = 'test-state';
                    widget = {
                        props: {
                            structure: {
                                componentType: 'TPAWidget'
                            }
                        }
                    };
                    section = {
                        props: {
                            structure: {
                                componentType: 'wysiwyg.viewer.components.tpapps.TPASection'
                            }
                        },
                        setState: jasmine.createSpy()
                    };
                    multiSection = {
                        props: {
                            structure: {
                                componentType: 'wysiwyg.viewer.components.tpapps.TPAMultiSection'
                            }
                        },
                        setState: jasmine.createSpy()
                    };
                    siteAPI.getComponentById.and.returnValue(section);
                    spyOn(siteAPI, 'getRootOfComponentId').and.returnValue(0);
                    spyOn(siteData, 'getExistingRootNavigationInfo').and.returnValue({pageId: 0});
                    spyOn(siteAPI, 'navigateToPage');
                });

                it('should replace history and set the new app state in the url', function () {
                    msg = {
                        data: {
                            state: state
                        }
                    };

                    this.tpaHandlers.replaceSectionState(siteAPI, msg);
                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: 0,
                        pageAdditionalData: state,
                        transition: 'none'
                    }, false, true);
                    expect(section.setState).toHaveBeenCalledWith({pushState: msg.data.state});
                });

                it('should handle a multi section comp', function () {
                    siteAPI.getComponentById.and.returnValue(multiSection);
                    msg = {
                        data: {
                            state: state
                        }
                    };

                    this.tpaHandlers.replaceSectionState(siteAPI, msg);
                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: 0,
                        pageAdditionalData: state,
                        transition: 'none'
                    }, false, true);
                    expect(multiSection.setState).toHaveBeenCalledWith({pushState: msg.data.state});
                });

                it('should not handle components that are not a section', function () {
                    siteAPI.getComponentById.and.returnValue(widget);
                    msg = {
                        data: state
                    };

                    this.tpaHandlers.replaceSectionState(siteAPI, msg);
                    expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                });

            it('should call updatePageNavInfo if rootOfComponentId is equal to primaryPageId', function() {
                msg = {
                    data: state
                };
                siteAPI.getComponentById.and.returnValue(section);
                siteAPI.getRootOfComponentId.and.returnValue('popupId');
                siteAPI.getSiteData = function() {
                    return {
                        getPrimaryPageId: function() {
                            return 'popupId';
                        }
                    };
                };
                spyOn(siteAPI, 'updatePageNavInfo');

                    this.tpaHandlers.replaceSectionState(siteAPI, msg);
                    expect(siteAPI.updatePageNavInfo).toHaveBeenCalled();
                });
            });

            describe('Handle postActivity', function () {
                var msg = {
                    data: {
                        activity: {
                            type: 'activity-type',
                            info: 'activity-info',
                            details: 'activity-details',
                            contactUpdate: '{}'
                        }
                    },
                    compId: 'comp-id',
                    callId: 2,
                    type: 'test-type'
                };

                beforeEach(function () {
                    spyOn(tpaUtils, 'getAppData').and.returnValue({});
                    spyOn(siteData, 'pubSvSession').and.callThrough();
                });
                it('should post an activity successfully', function () {
                    core.activityService.reportActivity.and.callFake(function (activity, onSuccess) {
                        onSuccess({
                            activityId: 'activityId',
                            contactId: 'contactId'
                        });
                    });

                    this.tpaHandlers.postActivity(siteAPI, msg);

                    expect(compMock.sendPostMessage).toHaveBeenCalledWith({
                        intent: 'TPA_RESPONSE',
                        compId: msg.compId,
                        callId: msg.callId,
                        type: msg.type,
                        status: true,
                        res: {
                            response: {
                                activityId: 'activityId',
                                contactId: 'contactId'
                            },
                            status: true
                        }
                    });

                    expect(siteData.pubSvSession).not.toHaveBeenCalled();
                });

                it('should post an activity successfully and set siteData svSession', function () {
                    core.activityService.reportActivity.and.callFake(function (activity, onSuccess) {
                        onSuccess({
                            activityId: 'activityId',
                            contactId: 'contactId',
                            userSessionToken: 'svSession'
                        });
                    });

                    spyOn(utils.cookieUtils, 'deleteCookie');
                    spyOn(utils.cookieUtils, 'setCookie');

                    this.tpaHandlers.postActivity(siteAPI, msg);

                    expect(compMock.sendPostMessage).toHaveBeenCalledWith({
                        intent: 'TPA_RESPONSE',
                        compId: msg.compId,
                        callId: msg.callId,
                        type: msg.type,
                        status: true,
                        res: {
                            response: {
                                activityId: 'activityId',
                                contactId: 'contactId'
                            },
                            status: true
                        }
                    });

                    expect(siteData.pubSvSession).toHaveBeenCalledWith('svSession');
                    var currentUrl = siteData.currentUrl;
                    expect(utils.cookieUtils.deleteCookie).toHaveBeenCalledWith('svSession', currentUrl.hostname, currentUrl.path);
                    expect(utils.cookieUtils.setCookie).toHaveBeenCalledWith('svSession', 'svSession', null, currentUrl.hostname, currentUrl.path);
                });

                it('should notify listeners on svSession change', function () {
                    core.activityService.reportActivity.and.callFake(function (activity, onSuccess) {
                        onSuccess({
                            activityId: 'activityId',
                            contactId: 'contactId',
                            userSessionToken: 'svSession'
                        });
                    });

                    var sessionChangedAspect = siteAPI.getSiteAspect('svSessionChangeEvent');
                    sessionChangedAspect.registerToSessionChanged(compMock);

                    this.tpaHandlers.postActivity(siteAPI, msg);

                    expect(compMock.sendPostMessage).toHaveBeenCalledWith({
                        intent: 'addEventListener',
                        eventType: 'SESSION_CHANGED',
                        params: {
                            userSession: 'svSession'
                        }
                    });
                });

                it('should post an activity with error', function () {
                    core.activityService.reportActivity.and.callFake(function (activity, onSuccess, onError) {
                        onError({
                            status: false,
                            res: {
                                test: true
                            }
                        });
                    });

                    this.tpaHandlers.postActivity(siteAPI, msg);

                    expect(compMock.sendPostMessage).toHaveBeenCalledWith({
                        intent: 'TPA_RESPONSE',
                        compId: msg.compId,
                        callId: msg.callId,
                        type: msg.type,
                        status: false,
                        res: {
                            response: jasmine.any(Object), // zepto's error response
                            status: false
                        }
                    });
                });
            });

            describe('getSectionUrl', function () {
                beforeEach(function () {
                    var pageToWidget = {
                        1: [
                            {
                                pageId: "pageId1",
                                tpaId: 1,
                                tpaPageId: undefined
                            }
                        ],
                        2: [
                            {
                                pageId: "pageId2",
                                tpaId: 2,
                                tpaPageId: undefined
                            },
                            {
                                pageId: "pageId3",
                                tpaId: 2,
                                tpaPageId: "tpaPageId"
                            }
                        ]
                    };
                    pageServiceMock = {
                        mapPageToWidgets: jasmine.createSpy().and.returnValue(pageToWidget)
                    };

                    spyOn(siteAPI, 'getPageUrlFor').and.returnValue('http://www.haxs0r.com');
                    this.tpaHandlers = tpaHandlerDef($, _, React, core, utils, animations, sitePages, pageServiceMock, clientSpecMapService, tpaUtils, tpaStyleUtilsMock, fonts, reactDOM, anchorHandlers);
                });

                it('should get default section url for app with only one page', function () {
                    var msg = {
                        data: {
                            sectionIdentifier: {
                                sectionId: 'page-1'
                            }
                        }
                    };
                    var callbackFn = jasmine.createSpy('callback');

                    this.tpaHandlers.getSectionUrl(siteAPI, msg, callbackFn);
                    expect(siteAPI.getPageUrlFor).toHaveBeenCalledWith('pageId1');
                    expect(callbackFn).toHaveBeenCalledWith({url: 'http://www.haxs0r.com'});

                });

                it('should get default section url for app with multi pages but wrong pageId was given', function () {
                    var msg = {
                        data: {
                            sectionIdentifier: {
                                sectionId: 'page-foo'
                            }
                        }
                    };
                    var callbackFn = jasmine.createSpy('callback');
                    this.tpaHandlers.getSectionUrl(siteAPI, msg, callbackFn);
                    expect(siteAPI.getPageUrlFor).toHaveBeenCalledWith('pageId1');
                    expect(callbackFn).toHaveBeenCalledWith({url: 'http://www.haxs0r.com'});
                });

                it('should get section url for app with multi pages and pageId', function () {
                    var msg = {
                        data: {
                            sectionIdentifier: 'tpaPageId'
                        }
                    };
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue({
                        props: {
                            compData: {
                                applicationId: 2,
                                tpaApplicationId: 'tpaPageId'
                            }
                        }
                    });
                    var callbackFn = jasmine.createSpy('callback');
                    this.tpaHandlers.getSectionUrl(siteAPI, msg, callbackFn);
                    expect(siteAPI.getPageUrlFor).toHaveBeenCalledWith('pageId3');
                });

                it('should return an error if comp is not defined', function () {
                    var msg = {
                        data: {
                            sectionIdentifier: 'tpaPageId'
                        }
                    };
                    siteAPI.getComponentById = jasmine.createSpy().and.returnValue(undefined);
                    var callbackFn = jasmine.createSpy('callback');
                    this.tpaHandlers.getSectionUrl(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({
                        error: {
                            message: 'Component was not found.'
                        }
                    });
                });
            });

            describe('getExternalId', function () {
                it('should handle getExternalId when comp has externalId', function () {
                    var msg = {
                        compId: 1381
                    };
                    var callbackFn = jasmine.createSpy('callback');
                    var comp = {
                        props: {
                            compData: {
                                referenceId: 'referenceId'
                            }
                        }
                    };
                    siteAPI.getComponentById = function () {
                        return comp;
                    };

                    this.tpaHandlers.getExternalId(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith('referenceId');
                });

                it('should handle getReferenceId when comp has no externalId', function () {
                    var msg = {
                        compId: 1381
                    };
                    var callbackFn = jasmine.createSpy('callback');
                    var comp = {
                        props: {
                            compData: {}
                        }
                    };
                    siteAPI.getComponentById = function () {
                        return comp;
                    };

                    this.tpaHandlers.getExternalId(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith(undefined);
                });
            });

            describe('getViewMode', function () {
                var callbackFn;
                var msg = {
                    compId: 1381
                };

                beforeEach(function () {
                    callbackFn = jasmine.createSpy('callback');
                });

                it('should return site if in viewer', function () {
                    this.tpaHandlers.getViewMode(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({editMode: 'site'});
                });

                it('should return preview default', function () {
                    delete siteData.publicModel;
                    this.tpaHandlers.getViewMode(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({editMode: 'preview'});
                });

                it('should return preview if in preview', function () {
                    delete siteData.publicModel;
                    siteData.renderFlags.componentViewMode = 'preview';
                    this.tpaHandlers.getViewMode(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({editMode: 'preview'});
                });

                it('should return editor if in editor', function () {
                    delete siteData.publicModel;
                    siteData.renderFlags.componentViewMode = 'editor';
                    this.tpaHandlers.getViewMode(siteAPI, msg, callbackFn);
                    expect(callbackFn).toHaveBeenCalledWith({editMode: 'editor'});
                });
            });

            describe('post messages for bi', function () {
                it('should have an empty implementation for', function () {
                    var handlers = [
                        'toWixDate',
                        'getCompId',
                        'getOrigCompId',
                        'getWidth',
                        'getLocale',
                        'getCacheKiller',
                        'getTarget',
                        'getInstanceId',
                        'getSignDate',
                        'getUid',
                        'getPermissions',
                        'getIpAndPort',
                        'getDemoMode',
                        'getDeviceType',
                        'getImageUrl',
                        'getResizedImageUrl',
                        'getAudioUrl',
                        'getDocumentUrl',
                        'getSwfUrl'
                    ];

                    _.forEach(handlers, function (handler) {
                        expect(this.tpaHandlers[handler]).toBeDefined();
                    }, this);
                });

                it('should have an empty worker handlers implementation for', function () {
                    var handlers = [
                        'getViewMode',
                        'getViewMode',
                        'getDeviceType',
                        'getLocale',
                        'getInstanceId',
                        'getIpAndPort'
                    ];

                    _.forEach(handlers, function (handler) {
                        expect(this.tpaHandlers.tpaWorker[handler]).toBeDefined();
                    }, this);
                });
            });

            describe('height changed', function () {
                beforeEach(function () {
                    spyOn(utils.logger, 'reportBI');
                });
                it('should report error if max height is exceeded', function () {
                    var msg = {
                        data: {
                            height: 1000001
                        }
                    };
                    var comp = {
                        registerReLayout: jasmine.createSpy(),
                        setState: jasmine.createSpy()
                    };

                    siteAPI.getComponentById = function () {
                        return comp;
                    };
                    this.tpaHandlers.heightChanged(siteAPI, msg);
                    var errorParams = {
                        height: 1000001
                    };
                    expect(utils.logger.reportBI).toHaveBeenCalledWith(jasmine.any(Object), tpaErrors.SDK_SET_HEIGHT_ERROR, errorParams);
                    expect(comp.registerReLayout).toHaveBeenCalled();
                    expect(comp.setState).toHaveBeenCalledWith({height: 1000001, ignoreAnchors: undefined});
                });

                it('should set the component height', function () {
                    var msg = {
                        data: {
                            height: 100
                        }
                    };
                    var mockComp = {
                        registerReLayout: jasmine.createSpy(),
                        setState: jasmine.createSpy()
                    };

                    siteAPI.getComponentById = function () {
                        return mockComp;
                    };
                    this.tpaHandlers.heightChanged(siteAPI, msg);

                    expect(utils.logger.reportBI).not.toHaveBeenCalled();
                    expect(mockComp.registerReLayout).toHaveBeenCalled();
                    expect(mockComp.setState).toHaveBeenCalledWith({height: 100, ignoreAnchors: undefined});
                });

                it('should set the component height without changing anchors', function () {
                    var msg = {
                        data: {
                            height: 100,
                            overflow: true
                        }
                    };
                    var mockComp = {
                        registerReLayout: jasmine.createSpy(),
                        setState: jasmine.createSpy()
                    };

                    siteAPI.getComponentById = function () {
                        return mockComp;
                    };
                    this.tpaHandlers.heightChanged(siteAPI, msg);

                    expect(utils.logger.reportBI).not.toHaveBeenCalled();
                    expect(mockComp.registerReLayout).toHaveBeenCalled();
                    expect(mockComp.setState).toHaveBeenCalledWith({height: 100, ignoreAnchors: true});
                });
            });

            describe('navigateToComponent', function () {
                var compPageId = 'page1';
                beforeEach(function () {
                    spyOn(animations, 'animate');
                    spyOn(utils.scrollAnchors, 'normalizeYOffset').and.callFake(function (val) {
                        return val;
                    });
                    spyOn(utils.domMeasurements, 'getElementRect').and.returnValue({top: 0, left: 0});

                    siteData.addPageWithDefaults('page1');
                    siteAPI.getComponentById.and.returnValue(null);
                    spyOn(siteAPI, 'navigateToPage');
                    spyOn(siteAPI, 'getSiteAspect').and.returnValue({
                        registerNavigationComplete: function (callback) {
                            callback();
                        }
                    });
                    spyOn(siteAPI, 'getComponentsByPageId').and.returnValue({});
                    compMock.props.rootId = compPageId;
                });

                it('should call onFailure in case page id is given and it is not valid', function () {
                    var msg = {
                        data: {
                            pageId: 'page4',
                            compId: 'comp1'
                        }
                    };
                    var onFailure = jasmine.createSpy('on failure');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                    expect(onFailure).toHaveBeenCalled();
                    expect(animations.animate).not.toHaveBeenCalled();
                });

                it('should call onFailure in case page id is not given and comp Id does not exists in current page', function () {
                    var msg = {
                        data: {
                            compId: 'comp3'
                        }
                    };
                    var onFailure = jasmine.createSpy('on failure');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                    expect(onFailure).toHaveBeenCalled();
                    expect(animations.animate).not.toHaveBeenCalled();
                });

                it('should call onFailure in case page id is given and comp Id does not exists in the given page id', function () {
                    var msg = {
                        data: {
                            pageId: 'page1',
                            compId: 'comp3'
                        }
                    };
                    var onFailure = jasmine.createSpy('on failure');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).toHaveBeenCalled();
                    expect(onFailure).toHaveBeenCalled();
                    expect(animations.animate).not.toHaveBeenCalled();
                });

                it('should navigate to component in case page id is not given and component is in the current page', function () {
                    var msg = {
                        data: {
                            compId: 'comp1'
                        }
                    };
                    var onFailure = jasmine.createSpy('on failure');
                    siteData.setCurrentPage(compPageId);
                    siteAPI.getComponentsByPageId.and.returnValue({
                        'comp1': compMock
                    });
                    //siteAPI.getCurrentPageId.and.returnValue('page1');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                    expect(onFailure).not.toHaveBeenCalled();
                    expect(animations.animate).toHaveBeenCalled();
                });

                it('should navigate to component in case page id is given and component is in the given page id', function () {
                    var msg = {
                        data: {
                            pageId: compPageId,
                            compId: 'comp1'
                        }
                    };
                    siteAPI.getComponentsByPageId.and.returnValue({
                        'comp1': compMock
                    });
                    var onFailure = jasmine.createSpy('on failure');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).toHaveBeenCalled();
                    expect(onFailure).not.toHaveBeenCalled();
                    expect(animations.animate).toHaveBeenCalled();
                });

                it('should navigate to component without transition in case page id and no transition is given and component is in the given page id', function () {
                    var msg = {
                        data: {
                            pageId: compPageId,
                            compId: 'comp1',
                            noPageTransition: true
                        }
                    };
                    siteAPI.getComponentsByPageId.and.returnValue({
                        'comp1': compMock
                    });
                    var onFailure = jasmine.createSpy('on failure');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: compPageId,
                        transition: 'none'
                    });
                    expect(onFailure).not.toHaveBeenCalled();
                    expect(animations.animate).toHaveBeenCalled();
                });

                it('should navigate to component with transition in case page id and no transition is given and component is in the given page id', function () {
                    var msg = {
                        data: {
                            pageId: compPageId,
                            compId: 'comp1',
                            noPageTransition: false
                        }
                    };
                    siteAPI.getComponentsByPageId.and.returnValue({
                        'comp1': compMock
                    });
                    var onFailure = jasmine.createSpy('on failure');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).toHaveBeenCalledWith({
                        pageId: compPageId
                    });
                    expect(onFailure).not.toHaveBeenCalled();
                    expect(animations.animate).toHaveBeenCalled();
                });

                it('should call onFailure in case trying to navigate to glued widget', function () {
                    var msg = {
                        data: {
                            pageId: compPageId,
                            compId: 'comp3'
                        }
                    };
                    var onFailure = jasmine.createSpy('on failure');
                    var gluedCompMock = _.clone(compMock);
                    gluedCompMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAGluedWidget';

                    siteData.setCurrentPage(compPageId);
                    siteAPI.getComponentById.and.returnValue(gluedCompMock);

                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).not.toHaveBeenCalled();
                    expect(onFailure).toHaveBeenCalled();
                    expect(animations.animate).not.toHaveBeenCalled();
                });

                it('should navigate to component that is on the master page', function () {
                    var msg = {
                        data: {
                            pageId: 'page2',
                            compId: 'comp1'
                        }
                    };

                    var showOnAllPagesCompMock = _.clone(compMock);
                    showOnAllPagesCompMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';
                    showOnAllPagesCompMock.props.rootId = 'masterPage';
                    siteData.setCurrentPage(compPageId);

                    siteAPI.getComponentById.and.returnValue(showOnAllPagesCompMock);
                    var onFailure = jasmine.createSpy('on failure');
                    siteData.addPageWithDefaults('page2');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).toHaveBeenCalled();
                    expect(onFailure).not.toHaveBeenCalled();
                    expect(animations.animate).toHaveBeenCalled();
                });

                it('should call onFailure in case comp exist but on different page than one given', function () {
                    var msg = {
                        data: {
                            pageId: 'page2',
                            compId: 'comp1'
                        }
                    };

                    var compNotExistsMock = _.clone(compMock);
                    compNotExistsMock.props.structure.componentType = 'wysiwyg.viewer.components.tpapps.TPAWidget';
                    compNotExistsMock.props.rootId = 'page3';
                    siteData.addPageWithDefaults('page5');
                    siteData.addPageWithDefaults('page2');
                    siteData.setCurrentPage('page5');
                    //siteAPI.getCurrentPageId.and.returnValue('page5');

                    siteAPI.getComponentById.and.returnValue(compNotExistsMock);
                    var onFailure = jasmine.createSpy('on failure');
                    this.tpaHandlers.navigateToComponent(siteAPI, msg, onFailure);
                    expect(siteAPI.navigateToPage).toHaveBeenCalled();
                    expect(onFailure).toHaveBeenCalled();
                    expect(animations.animate).not.toHaveBeenCalled();
                });
            });

            describe('urls with state', function () {

                var BASE_URL = 'http://mockHostName/mockPath';

                function getMockPageData(title) {
                    return {
                        pageUriSEO: title,
                        tpaApplicationId: 1
                    };
                }

                function addPage(theSiteData, title) {
                    var id = title + '-id';
                    theSiteData.addPageWithData(id, getMockPageData(title));
                    return id;
                }

                beforeEach(function () {
                    this.mockSiteData = factory.mockSiteData();
                    this.mockSiteData.urlFormatModel = {format: 'slash'};
                    this.mockSiteData.currentUrl = utils.urlUtils.parseUrl(BASE_URL);
                    spyOn(this.mockSiteData, 'getExternalBaseUrl').and.returnValue(BASE_URL);
                    addPage(this.mockSiteData, 'tpa-page');
                    this.mockSiteAPI = factory.mockSiteAspectSiteAPI(this.mockSiteData);
                    this.msg = {
                        data: {
                            sectionId: 'tpa-page',
                            state: 'state'
                        }
                    };
                    spyOn(this.mockSiteAPI, 'getComponentById').and.returnValue({props: {compData: {applicationId: 1}}});
                    spyOn(this.mockSiteData, 'getClientSpecMap').and.returnValue({
                        1: {applicationId: 1}
                    });
                    pageServiceMock.mapPageToWidgets.and.returnValue({
                        1: [{tpaPageId: 'tpa-page', pageId: 'tpa-page-id'}]
                    });
                });

                it('should return the currrent section URL with no state if both are empty', function (done) {
                    spyOn(this.mockSiteData, 'getCurrentUrlPageId').and.returnValue('tpa-page-id');
                    var expectedUrl = utils.wixUrlParser.getUrl(this.mockSiteData, {pageId: 'tpa-page-id'});
                    this.tpaHandlers.getStateUrl(this.mockSiteAPI, {
                        data: {
                            sectionId: '',
                            state: ''
                        }
                    }, function (result) {
                        expect(result.url).toBe(expectedUrl);
                        done();
                    });
                });

                it('should get url from state and pageId', function (done) {
                    var expectedUrl = utils.wixUrlParser.getUrl(this.mockSiteData, {
                        pageId: 'tpa-page-id',
                        pageAdditionalData: this.msg.data.state
                    });
                    this.tpaHandlers.getStateUrl(this.mockSiteAPI, this.msg, function (result) {
                        expect(result.url).toEqual(expectedUrl);
                        done();
                    });
                });

                it('should clear the query', function (done) {
                    var expectedUrl = utils.wixUrlParser.getUrl(this.mockSiteData, {
                        pageId: 'tpa-page-id',
                        pageAdditionalData: this.msg.data.state
                    });
                    this.mockSiteData.currentUrl = utils.urlUtils.parseUrl(BASE_URL + '?key=value');
                    this.tpaHandlers.getStateUrl(this.mockSiteAPI, this.msg, function (result) {
                        expect(result.url).toEqual(expectedUrl);
                        done();
                    });
                });

                it('should not use the state if the page delivered does not exist or is not a TPA page', function (done) {
                    var expectedUrl = utils.wixUrlParser.getUrl(this.mockSiteData, {pageId: 'tpa-page-id'});
                    this.tpaHandlers.getStateUrl(this.mockSiteAPI, {
                        data: {
                            sectionId: 'something-else',
                            state: 'some/internal/state'
                        }
                    }, function (result) {
                        expect(result.url).toEqual(expectedUrl);
                        done();
                    });
                });
            });

            describe('getComponentInfo', function () {
                var tpaWidgetId = 'tpaWidgetId';
                var appPageId = 'appPageId';
                var appData = {
                    widgets: {
                        widget1: {
                            tpaWidgetId: tpaWidgetId
                        },
                        widget2: {
                            appPage: {
                                name: 'appPage',
                                hidden: false,
                                id: appPageId
                            }
                        }
                    }
                };

                var mockComp = {
                    props: {
                        compData: {
                            widgetId: 'widget1'
                        },
                        pageId: 'page1'
                    }
                };

                var msg = {
                    compId: 'comp1'
                };

                var callback;

                var mockSiteAPI = {};
                beforeEach(function () {
                    callback = jasmine.createSpy('callback');
                    mockSiteAPI.getComponentById = jasmine.createSpy('getComponentById');
                    mockComp.getAppData = jasmine.createSpy('getAppData').and.returnValue(appData);
                });

                var expectedCompInfo = {
                    compId: 'comp1',
                    showOnAllPages: false,
                    pageId: 'page1',
                    tpaWidgetId: tpaWidgetId,
                    appPageId: ''
                };

                it('should return info with show on all pages true if comp is marked as show on all pages', function () {
                    var mockComp2 = _.cloneDeep(mockComp);
                    mockComp2.props.rootId = 'masterPage';

                    var expectedCompInfo2 = _.cloneDeep(expectedCompInfo);
                    expectedCompInfo2.pageId = '';
                    expectedCompInfo2.showOnAllPages = true;

                    mockSiteAPI.getComponentById.and.returnValue(mockComp2);
                    this.tpaHandlers.getComponentInfo(mockSiteAPI, msg, callback);

                    expect(callback).toHaveBeenCalledWith(expectedCompInfo2);
                });

                it('should return tpaWidgetId if comp is of type widget', function () {
                    mockSiteAPI.getComponentById.and.returnValue(mockComp);
                    this.tpaHandlers.getComponentInfo(mockSiteAPI, msg, callback);

                    expect(callback).toHaveBeenCalledWith(expectedCompInfo);
                });

                it('should return appPageId if comp is of type section', function () {
                    var mockComp2 = _.cloneDeep(mockComp);
                    mockComp2.props.compData.widgetId = '';

                    var expectedCompInfo2 = _.cloneDeep(expectedCompInfo);
                    expectedCompInfo2.appPageId = appPageId;
                    expectedCompInfo2.tpaWidgetId = '';
                    mockSiteAPI.getComponentById.and.returnValue(mockComp2);
                    this.tpaHandlers.getComponentInfo(mockSiteAPI, msg, callback);

                    expect(callback).toHaveBeenCalledWith(expectedCompInfo2);
                });
            });

            describe('getStyleParamsByStyleId', function () {
                beforeEach(function () {
                    this.callback = jasmine.createSpy();
                    this.siteData = testUtils.mockFactory.mockSiteData();
                    this.siteAPI = testUtils.mockFactory.mockSiteAPI(this.siteData);
                });

                it('should call the callback with the style param of the given style Id', function () {
                    var mockStyleParams = {id: 'mockStyle', style: {properties: {}}};
                    this.siteData.addCompTheme(mockStyleParams);
                    var msg = {
                        data: {
                            styleId: 'mockStyle'
                        }
                    };

                    tpaStyleUtilsMock.getStylesForSDK.and.returnValue(mockStyleParams.style);

                    this.tpaHandlers.getStyleParamsByStyleId(this.siteAPI, msg, this.callback);

                    expect(tpaStyleUtilsMock.getStylesForSDK).toHaveBeenCalledWith(this.siteData, msg.data.styleId);
                    expect(this.callback).toHaveBeenCalledWith(mockStyleParams.style);
                });

                it('should call the callback with error message if the styleId doesn\'t exists', function () {
                    var msg = {
                        data: {
                            styleId: '000'
                        }
                    };
                    var expectedError = {
                        error: {
                            message: 'Style id "000" was not found.'
                        }
                    };

                    this.tpaHandlers.getStyleParamsByStyleId(this.siteAPI, msg, this.callback);

                    expect(this.callback).toHaveBeenCalledWith(expectedError);
                });
            });
        });

        describe('', function () {
            var pageToWidget = {
                1: [
                    {
                        pageId: "pageId1",
                        tpaId: 1,
                        tpaPageId: undefined
                    }
                ],
                2: [
                    {
                        pageId: "pageId2",
                        tpaId: 2,
                        tpaPageId: "tpaPageId"
                    }
                ]
            };
            var siteAPI, compNode, reactDOM;
            beforeEach(function () {

                compNode = {
                    getBoundingClientRect: function () {
                        return rectVal;
                    }
                };
                reactDOM = {
                    findDOMNode: function () {
                        return compNode;
                    }
                };

                if (!siteAPI) {
                    siteAPI = {
                        navigateToPage: jasmine.createSpy(),
                        getComponentById: jasmine.createSpy().and.returnValue({
                            props: {
                                compData: {
                                    applicationId: 1,
                                    tpaApplicationId: 1
                                }
                            }
                        }),
                        getSiteData: function () {
                            var pagesData = [{
                                title: pageTitle
                            }];
                            var currentUrl = {
                                full: url,
                                protocol: 'http:',
                                host: 'www.hx0r.com/',
                                path: 'myPageId'

                            };
                            var getDataByQuery = function () {
                                return {};
                            };
                            var getClientSpecMap = function () {
                                return {
                                    "1": {
                                        applicationId: 1,
                                        appDefinitionName: name + "1"

                                    },
                                    "2": {
                                        applicationId: 2,
                                        appDefinitionName: name + "2"

                                    }
                                };
                            };
                            return {
                                pagesData: pagesData,
                                currentUrl: currentUrl,
                                getDataByQuery: getDataByQuery,
                                getClientSpecMap: getClientSpecMap
                            };
                        }
                    };
                }
                var sitePagesMock = {
                    getSitePagesInfoData: jasmine.createSpy().and.returnValue(mockSitePages)
                };
                var pageServiceMock = {
                    mapPageToWidgets: jasmine.createSpy().and.returnValue(pageToWidget)
                };

                siteAPI.navigateToPage = jasmine.createSpy();

                this.tpaHandlers = tpaHandlerDef($, _, React, core, utils, animations, sitePagesMock, pageServiceMock, clientSpecMapService, tpaUtils, tpaStyleUtilsMock, tpaErrors, reactDOM, anchorHandlers);
            });


            describe('registerEventListener', function () {
                var mockMsg;

                beforeEach(function () {
                    mockMsg = {
                        data: {
                            eventKey: 'test-event'
                        }
                    };
                    siteAPI = {
                        getComponentById: jasmine.createSpy()
                    };
                });

                it('should call start listen on component', function () {
                    var mockComp = {
                        startListen: jasmine.createSpy(),
                        isCompListensTo: jasmine.createSpy().and.returnValue(false)
                    };
                    siteAPI.getComponentById.and.returnValue(mockComp);

                    this.tpaHandlers.registerEventListener(siteAPI, mockMsg);

                    expect(mockComp.startListen).toHaveBeenCalledWith(mockMsg.data.eventKey);
                });

                it('should not call start listen on already listening component', function () {
                    var mockComp = {
                        startListen: jasmine.createSpy(),
                        isCompListensTo: jasmine.createSpy().and.returnValue(true)
                    };
                    siteAPI.getComponentById.and.returnValue(mockComp);

                    this.tpaHandlers.registerEventListener(siteAPI, mockMsg);

                    expect(mockComp.startListen).not.toHaveBeenCalled();
                });
            });

            describe('removeEventListener', function () {
                var mockMsg;

                beforeEach(function () {
                    mockMsg = {
                        data: {
                            eventKey: 'test-event'
                        }
                    };
                    siteAPI = {
                        getComponentById: jasmine.createSpy()
                    };
                });

                it('should call stop listen on component', function () {
                    var mockComp = {
                        stopListen: jasmine.createSpy()
                    };
                    siteAPI.getComponentById.and.returnValue(mockComp);

                    this.tpaHandlers.removeEventListener(siteAPI, mockMsg);

                    expect(mockComp.stopListen).toHaveBeenCalledWith(mockMsg.data.eventKey);
                });
            });

            describe('Site member handlers', function () {
                var siteMembersAspect,
                    msgCallback,
                    msg = {
                        compId: 'test-comp-id'
                    };

                beforeEach(function () {
                    msgCallback = msgCallback || jasmine.createSpy();
                });

                describe('when no logged in member', function () {
                    beforeEach(function () {
                        siteMembersAspect = {
                            getMemberDetails: jasmine.createSpy().and.returnValue(null),
                            showAuthenticationDialog: jasmine.createSpy().and.callFake(_.noop),
                            isLoggedIn: jasmine.createSpy().and.returnValue(false)
                        };
                        siteAPI.getSiteAspect = jasmine.createSpy().and.returnValue(siteMembersAspect);
                    });

                    it('should call requestLogin and show login dialog', function () {
                        this.tpaHandlers.smRequestLogin(siteAPI, msg, msgCallback);

                        expect(siteMembersAspect.showAuthenticationDialog).toHaveBeenCalledWith(jasmine.any(Function), 'en', undefined, undefined);
                        expect(msgCallback).not.toHaveBeenCalled();
                    });

                    it('should call requestLogin with mode=login and show login dialog', function () {
                        msg.data = {mode: 'login'};

                        this.tpaHandlers.smRequestLogin(siteAPI, msg, msgCallback);

                        expect(siteMembersAspect.showAuthenticationDialog).toHaveBeenCalledWith(jasmine.any(Function), 'en', true, undefined);
                    });

                    it('should call requestLogin with mode=signup and show signup dialog', function () {
                        msg.data = {mode: 'signup'};

                        this.tpaHandlers.smRequestLogin(siteAPI, msg, msgCallback);

                        expect(siteMembersAspect.showAuthenticationDialog).toHaveBeenCalledWith(jasmine.any(Function), 'en', false, undefined);
                    });

                    it('should call requestLogin with onCancel callback and language', function () {
                        msg.data = {mode: 'login', callOnCancel: true, language: 'es'};

                        this.tpaHandlers.smRequestLogin(siteAPI, msg, msgCallback);

                        expect(siteMembersAspect.showAuthenticationDialog).toHaveBeenCalledWith(jasmine.any(Function), 'es', true, jasmine.any(Function));
                    });

                    it('should call currentMember and get null data', function () {
                        this.tpaHandlers.smCurrentMember(siteAPI, msg, msgCallback);

                        expect(msgCallback).toHaveBeenCalledWith(null);
                    });

                    it('should call logOutCurrentMember and return error', function (done) {
                        this.tpaHandlers.logOutCurrentMember(siteAPI, msg, function (data) {
                            expect(data).toEqual({
                                onError: 'No member is logged in'
                            });
                            done();
                        });
                    });
                });

                describe('when there is logged in member', function () {
                    var memberData, comp;

                    beforeEach(function () {
                        comp = {
                            setSiteMemberDataState: jasmine.createSpy()
                        };
                        memberData = {
                            "id": "7e41240f-2b82-4f75-8486-13590e29f365"
                        };
                        siteMembersAspect = {
                            getMemberDetails: jasmine.createSpy().and.returnValue(memberData),
                            showSignUpDialog: jasmine.createSpy().and.callFake(_.noop),
                            isLoggedIn: jasmine.createSpy().and.returnValue(true),
                            logout: jasmine.createSpy()
                        };
                        siteAPI.getSiteAspect = jasmine.createSpy().and.returnValue(siteMembersAspect);
                        siteAPI.getComponentById = jasmine.createSpy().and.returnValue(comp);
                    });

                    it('should call requestLogin and get member data', function () {
                        this.tpaHandlers.smRequestLogin(siteAPI, msg, msgCallback);

                        expect(comp.setSiteMemberDataState).toHaveBeenCalledWith(null);
                        expect(siteMembersAspect.getMemberDetails).toHaveBeenCalledWith();
                        expect(siteMembersAspect.showSignUpDialog).not.toHaveBeenCalled();
                        expect(msgCallback).toHaveBeenCalledWith({
                            authResponse: true,
                            data: memberData
                        });
                    });

                    it('should call currentMember and get member data', function () {
                        this.tpaHandlers.smCurrentMember(siteAPI, msg, msgCallback);

                        expect(comp.setSiteMemberDataState).toHaveBeenCalledWith(null);
                        expect(siteMembersAspect.getMemberDetails).toHaveBeenCalledWith();
                        expect(msgCallback).toHaveBeenCalledWith(memberData);
                    });

                    describe('when returned member data in null', function () {
                        beforeEach(function () {
                            siteMembersAspect.getMemberDetails = jasmine.createSpy().and.returnValue(null);
                        });

                        it('should call requestLogin and get null member data', function () {
                            this.tpaHandlers.smRequestLogin(siteAPI, msg, msgCallback);

                            expect(comp.setSiteMemberDataState).toHaveBeenCalledWith({
                                callback: jasmine.any(Function)
                            });
                            expect(siteMembersAspect.getMemberDetails).toHaveBeenCalledWith();
                        });

                        it('should call currentMember and get null member data', function () {
                            this.tpaHandlers.smCurrentMember(siteAPI, msg, msgCallback);

                            expect(comp.setSiteMemberDataState).toHaveBeenCalledWith({
                                callback: jasmine.any(Function)
                            });
                            expect(siteMembersAspect.getMemberDetails).toHaveBeenCalledWith();
                        });
                    });

                    it('should call logOutCurrentMember and logout', function () {
                        this.tpaHandlers.logOutCurrentMember(siteAPI, msg);

                        expect(siteMembersAspect.logout).toHaveBeenCalled();
                    });
                });
            });

            describe('Public static data handlers', function () {

                var msg = {
                    data: {
                        key: 'key1',
                        scope: 'COMPONENT'
                    },
                    compId: 'comp1'
                };

                var callback, tempCompMock;

                var siteData = {};

                var mockSiteAPI = {};
                var tpaData = null;

                beforeEach(function () {
                    tempCompMock = {
                        props: {
                            compData: {
                                applicationId: 18
                            }
                        }
                    };

                    callback = jasmine.createSpy('callback');
                    siteData = factory.mockSiteData()
                        .addPageWithDefaults('page1')
                        .setCurrentPage('page1');

                    siteData.getDataByQuery = jasmine.createSpy().and.returnValue(tpaData);
                    mockSiteAPI = factory.mockSiteAspectSiteAPI(siteData);
                    mockSiteAPI.getComponentById = jasmine.createSpy().and.returnValue(tempCompMock);
                });

                describe('getValue', function () {
                    describe('from component scope', function () {
                        it('should return no value if comp has no data', function () {
                            this.tpaHandlers.getValue(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'key key1 not found in COMPONENT scope'
                                }
                            });
                        });

                        it('should return error if comp has data but key not exists in COMPONENT scope', function () {
                            tpaData = {
                                content: '{ "222" : "value2" }'
                            };
                            tempCompMock.props.compData.tpaData = tpaData;
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            mockSiteAPI.getComponentById(tempCompMock);
                            this.tpaHandlers.getValue(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'key key1 not found in COMPONENT scope'
                                }
                            });
                        });

                        it('should return value if key exist in component scope', function () {
                            tpaData = {
                                content: '{ "222" : "value1", "key1": "value2"}'
                            };
                            tempCompMock.props.compData.tpaData = tpaData;
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            mockSiteAPI.getComponentById(tempCompMock);
                            this.tpaHandlers.getValue(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({'key1': 'value2'});
                        });
                    });

                    describe('from global scope', function () {
                        beforeEach(function () {
                            msg.data.scope = 'APP';
                        });

                        it('should return error global data is not defined', function () {
                            siteData.getDataByQuery.and.returnValue(null);
                            this.tpaHandlers.getValue(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'key key1 not found in APP scope'
                                }
                            });
                        });

                        it('should return error if key not exist in global data', function () {
                            tpaData = {
                                content: '{ "222" : "value2" }'
                            };
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            this.tpaHandlers.getValue(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'key key1 not found in APP scope'
                                }
                            });
                        });

                        it('should return value if key exist in global data', function () {
                            tpaData = {
                                content: '{ "222" : "value1", "key1": "value2"}'
                            };
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            this.tpaHandlers.getValue(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({'key1': 'value2'});
                        });
                    });
                });

                describe('getvalues', function () {
                    describe('from component scope', function () {
                        beforeEach(function () {
                            msg.data.keys = ['key1', 'key2'];
                            msg.data.scope = 'COMPONENT';
                        });

                        it('should return no value if comp has no data', function () {
                            siteData.getDataByQuery.and.returnValue(null);
                            this.tpaHandlers.getValues(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'keys key1,key2 not found in COMPONENT scope'
                                }
                            });
                        });

                        it('should return error if comp has data but key not exists', function () {
                            tpaData = {content: '{ "key2" : "valu2" }'};
                            tempCompMock.props.compData.tpaData = tpaData;
                            mockSiteAPI.getComponentById(tempCompMock);
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            this.tpaHandlers.getValues(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'keys key1 not found in COMPONENT scope'
                                }
                            });
                        });

                        it('should return values if keys exist in comp data', function () {
                            tpaData = {
                                content: '{ "key1" : "value1", "key2": "value2"}'
                            };
                            tempCompMock.props.compData.tpaData = tpaData;
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            mockSiteAPI.getComponentById(tempCompMock);
                            this.tpaHandlers.getValues(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({"key1": "value1", "key2": "value2"});
                        });

                        it('should return values if duplicate keys exist in comp data', function () {
                            tpaData = {
                                content: '{ "key1" : "value1", "key2": "value2"}'
                            };
                            msg.data.keys = ['key1', 'key2', 'key2'];
                            tempCompMock.props.compData.tpaData = tpaData;
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            mockSiteAPI.getComponentById(tempCompMock);
                            this.tpaHandlers.getValues(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({"key1": "value1", "key2": "value2"});
                        });
                    });

                    describe('from app scope', function () {
                        beforeEach(function () {
                            msg.data.keys = ['key1', 'key2'];
                            msg.data.scope = 'APP';
                        });

                        it('should return no value if comp has no data', function () {
                            siteData.getDataByQuery.and.returnValue(null);
                            this.tpaHandlers.getValues(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'keys key1,key2 not found in APP scope'
                                }
                            });
                        });

                        it('should return error if comp has data but key not exists', function () {
                            tpaData = {content: '{ "key2" : "valu2" }'};
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            this.tpaHandlers.getValues(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({
                                error: {
                                    message: 'keys key1 not found in APP scope'
                                }
                            });
                        });

                        it('should return values if keys exist', function () {
                            tpaData = {
                                content: '{ "key1" : "value1", "key2": "value2"}'
                            };
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            this.tpaHandlers.getValues(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({"key1": "value1", "key2": "value2"});
                        });

                        it('should return values if duplicate keys exist', function () {
                            tpaData = {
                                content: '{ "key1" : "value1", "key2": "value2"}'
                            };
                            msg.data.keys = ['key1', 'key2', 'key1'];
                            siteData.getDataByQuery.and.returnValue(tpaData);
                            this.tpaHandlers.getValues(mockSiteAPI, msg, callback);
                            expect(callback).toHaveBeenCalledWith({"key1": "value1", "key2": "value2"});
                        });
                    });

                });
            });
        });

        describe('getStyleId', function () {
            var siteAPI;

            beforeEach(function () {
                var siteData = factory.mockSiteData({
                    currentUrl: {
                        full: url,
                        protocol: 'http:',
                        host: 'www.hx0r.com/',
                        path: 'myPageId',
                        hostname: 'www.hx0r.com/'
                    }
                });
                siteAPI = factory.mockSiteAspectSiteAPI(siteData);
                //var compProps = factory.mockProps()
                //    .addSiteData(siteData, 'siteData')
                //    .setCompProp({id: '222'})
                //    .setCompData({applicationId: '12', widgetId: 'widget'})
                //    .setThemeStyle({id: '1234'});

                //this.mockComp = testUtils.getComponentFromDefinition(tpaWidget, compProps);

                this.mockComp = {
                    props: {
                        compData: {
                            applicationId: '12',
                            widgetId: 'widget'
                        },
                        structure: {
                            styleId: '1234'
                        }
                    }
                };
                this.mockMsg = {
                    compId: '222'
                };
                this.callback = jasmine.createSpy();
                spyOn(siteAPI, 'getComponentById').and.returnValue(this.mockComp);
            });

            it('should return the component styleId', function () {
                var styleId = this.mockComp.props.structure.styleId;
                tpaHandlers.getStyleId(siteAPI, this.mockMsg, this.callback);
                expect(this.callback).toHaveBeenCalledWith(styleId);
            });
        });
    });
