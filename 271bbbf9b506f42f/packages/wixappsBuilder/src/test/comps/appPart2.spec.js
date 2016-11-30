define(['lodash', 'zepto', 'testUtils', 'utils', 'wixappsCore', 'wixappsBuilder/comps/appPart2'
], function (_, $, /** testUtils */ testUtils, utils, wixapps) {
    'use strict';

    describe('AppPart2 component', function () {

        var viewDef = {
            name: 'testView',
            forType: 'testType',
            data: 'title',
            comp: {
                "name": "Label"
            }
        };

        var arrayViewDef = {
            "name": "testView",
            "forType": "Array",
            "comp": {
                "name": "List2"
            }
        };

        var mobileArrayViewDef = _.assign({}, arrayViewDef, {format: "Mobile"});

        var simpleView = {
            name: 'simpleView',
            forType: 'testType',
            comp: {
                "name": "Label"
            }
        };

        var arraySimpleViewDef = _.assign({}, arrayViewDef, {name: 'simpleView'});

        /** @type AppRepoDefinition */
        var appRepo = {
            applicationInstanceVersion: '1',
            parts: {
                'testPart': {
                    dataSelector: 'dataSelector1',
                    viewName: 'testView',
                    type: 'testType',
                    displayName: 'test part'
                },
                'simplePart': {
                    dataSelector: 'dataSelector1',
                    viewName: 'simpleView',
                    type: 'testType',
                    displayName: 'test part'
                },
                'itemPart': {
                    dataSelector: 'itemSelector',
                    viewName: 'testView',
                    type: 'testType',
                    displayName: 'test part'
                }
            },
            dataSelectors: {
                dataSelector1: {
                    id: 'dataSelector1',
                    logicalTypeName: 'IB.ManualSelectedList',
                    itemIds: ['itemId1', 'itemId2'],
                    forType: 'testType'
                },
                itemSelector: {
                    id: 'itemSelector',
                    forType: 'testType',
                    dataProviderId: 'wixdb',
                    logicalTypeName: 'IB.PageSelectedItem',
                    appPageId: '5ab66b31-7b04-f3ed-c916-ae7b53f4fe76'
                }
            },
            views: {
                'Array|testView': arrayViewDef,
                'Array|testView|Mobile': mobileArrayViewDef,
                'testType|testView': viewDef,
                'testType|simpleView': simpleView,
                'Array|simpleView': arraySimpleViewDef
            }
        };

        var item1 = {
            _iid: 'itemId1',
            _type: 'testType',
            title: 'title 1'
        };

        var item2 = {
            _iid: 'itemId2',
            _type: 'testType',
            title: 'title 2'

        };

        var item3 = {
            _iid: 'itemId3',
            title: 'title 3'
        };

        var siteModel = {
            rendererModel: {
                clientSpecMap: {
                    2: {
                        type: "appbuilder"
                    }
                },
                siteInfo: {
                    siteId: '1'
                }
            },
            wixapps: {
                appbuilder: {
                    descriptor: appRepo,
                    items: {
                        testType: {
                            itemId1: item1,
                            itemId2: item2
                        },
                        anotherType: {
                            itemId1: item3
                        }
                    }
                }
            },
            pagesData: {
                masterPage: {
                    data: {
                        theme_data: {
                            'vr1': {
                                skin: 'skins.core.VerySimpleSkin'
                            }
                        }
                    }
                }
            },
            requestModel: {
                userAgent: ''
            },
            serviceTopology: {
                biServerUrl: ''
            },
            currentUrl: utils.urlUtils.parseUrl('http://www.wix.com/')
        };

        var siteAPI, props;

        function getProps(appPartName) {
            var compProps = testUtils.mockFactory.mockProps(siteAPI.getSiteData(), siteAPI)
                .setSkin('wysiwyg.viewer.skins.AppPartSkin')
                .setCompData({
                    appPartName: appPartName,
                    appInnerID: '2'
                });
            compProps.structure.componentType = 'wixapps.integration.components.AppPart2';

            return compProps;
        }

        beforeEach(function () {
            var siteData = testUtils.mockFactory.mockSiteData(siteModel);
            siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            props = getProps('testPart');
        });

        it('should set the right view definition and data and define all abstract methods of viewsRenderer', function () {
            var appPart2 = testUtils.componentBuilder('wixapps.integration.components.AppPart2', props);

            var verticalList = appPart2.refs.rootProxy.refs.child;

            // Validate that the root proxy gets the correct initial properties.
            expect(verticalList.props.viewDef).toEqual(_.assign(arrayViewDef, {id: jasmine.any(String)}));
            var data = [item1, item2];
            expect(verticalList.proxyData).toEqual(data);

            // Validate that the AppPart2 implement the abstract methods of viewsRenderer
            expect(verticalList.props.viewProps.getViewDef).toBe(appPart2.getViewDef);
            expect(verticalList.props.viewProps.getLocalizationBundle).toBe(appPart2.getLocalizationBundle);
        });

        it('should use mobile view if it was defined', function () {
            spyOn(siteAPI.getSiteData(), 'isMobileView').and.returnValue(true);

            var appPart2 = testUtils.componentBuilder('wixapps.integration.components.AppPart2', props);
            var verticalList = appPart2.refs.rootProxy.refs.child;

            expect(verticalList.props.viewDef).toEqual(_.assign(mobileArrayViewDef, {id: jasmine.any(String)}));
        });

        it('should use the formatName from props.formatName if it was set', function () {
            props.formatName = 'Mobile';
            var appPart2 = testUtils.componentBuilder('wixapps.integration.components.AppPart2', props);
            var verticalList = appPart2.refs.rootProxy.refs.child;

            expect(verticalList.props.viewDef).toEqual(_.assign(mobileArrayViewDef, {id: jasmine.any(String)}));
        });

        it('should set the title of the page to the item title and the list title if the dataSelector is IB.PageSelectedItem', function () {
            props = getProps('itemPart');
            spyOn(wixapps.wixappsUrlParser, 'getPageSubItemId').and.returnValue('itemId1');
            spyOn(siteAPI, 'setPageTitle').and.callThrough();

            testUtils.componentBuilder('wixapps.integration.components.AppPart2', props);

            var expectedTitle = item1.title + ' | ' + appRepo.parts.itemPart.displayName;
            expect(siteAPI.setPageTitle).toHaveBeenCalledWith(_.unescape(expectedTitle), expectedTitle);
        });

        it('should not set the title of the page if the dataSelector is not IB.PageSelectedItem', function () {
            props = getProps('testPart');
            spyOn(siteAPI, 'setPageTitle').and.callThrough();

            testUtils.componentBuilder('wixapps.integration.components.AppPart2', props);

            expect(siteAPI.setPageTitle).not.toHaveBeenCalled();
        });

        it('should throw AppPart data is not valid and send errorBI when the repo is empty', function () {
            var wixappsData = {
                appbuilder: {
                    descriptor: {
                        views: {},
                        types: {},
                        dataSelectors: {},
                        parts: {},
                        offsetFromServerTime: {},
                        tags: {}
                    },
                    items: {}
                }
            };
            var modelWithEmptyListsRepo = _.defaults({wixapps: wixappsData}, siteModel);
            var siteData = testUtils.mockFactory.mockSiteData(modelWithEmptyListsRepo);
            siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            props = getProps('testPart');

            spyOn(wixapps.wixappsLogger, 'reportError');

            expect(testUtils.componentBuilder.bind(testUtils, 'wixapps.integration.components.AppPart2', props)).toThrow('AppPart data is not valid.');
            expect(wixapps.wixappsLogger.reportError).toHaveBeenCalledWith(siteData, wixapps.wixappsLogger.errors.APP_PART2_FAILED_TO_LOAD, undefined);
        });

        it('should create this.dataSelector before rendering the component', function () {
            var wixappsData = {
                appbuilder: {
                    descriptor: {
                        views: {},
                        types: {},
                        dataSelectors: {},
                        parts: {},
                        offsetFromServerTime: {},
                        tags: {}
                    },
                    items: {}
                }
            };
            var modelWithEmptyListsRepo = _.defaults({wixapps: wixappsData}, siteModel);
            var siteData = testUtils.mockFactory.mockSiteData(modelWithEmptyListsRepo);
            siteData.isDebugMode.and.returnValue(false);
            siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            props = getProps('testPart');

            var node = $('<div/>')[0];
            var appPart2 = testUtils.componentBuilder('wixapps.integration.components.AppPart2', props, node);
            expect(appPart2.dataSelector).toBeUndefined();


            // second render (content phase)
            siteData = testUtils.mockFactory.mockSiteData(siteModel);
            siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
            props = getProps('testPart');
            spyOn(appPart2, 'getSkinProperties').and.callFake(function () {
                expect(appPart2.state.$displayMode).toEqual('content');
                expect(appPart2.dataSelector).toBeDefined();

                return {};
            });

            testUtils.componentBuilder('wixapps.integration.components.AppPart2', props, node);
        });
    });
});
