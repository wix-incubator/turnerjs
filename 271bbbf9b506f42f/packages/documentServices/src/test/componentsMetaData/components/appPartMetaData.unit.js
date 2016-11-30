define([
    'wixappsClassics',
    'testUtils',
    'documentServices/componentsMetaData/components/appPartMetaData',
    'documentServices/wixapps/utils/classicsUtils',
    'documentServices/dataModel/dataModel',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'experiment'
], function (wixappsClassics,
             testUtils,
             appPartMetaData,
             classicsUtils,
             dataModel,
             constants,
             privateServicesHelper,
             experiment
) {
    'use strict';
    describe('appPartMetaData', function () {

        describe('resizableSides', function () {
            function testKnobs(doesAllowHeightResize, expectedSides) {
                var ps = privateServicesHelper.mockPrivateServices();
                var compPointer = 'some comp pointer';
                var packageName = 'blog';
                var appInnerID = '14';
                var viewName = 'some viewName';
                var appPartName = 'some appPartName';
                var appPartDefinition = {
                    doesAllowHeightResize: doesAllowHeightResize
                };

                spyOn(dataModel, 'getDataItem').and.callFake(function (privateServices, cPointer) {
                    if (cPointer === compPointer) {
                        return {
                            appPartName: appPartName,
                            appInnerID: appInnerID,
                            viewName: viewName
                        };
                    }
                });

                spyOn(classicsUtils, 'getPackageName').and.callFake(function (privateServices, applicationInnerID) {
                    if (applicationInnerID === appInnerID) {
                        return packageName;
                    }
                });

                spyOn(classicsUtils, 'getAppPartDefinition').and.callFake(function (privateServices, pName, aPartName) {
                    if (pName === packageName && aPartName === appPartName) {
                        return appPartDefinition;
                    }
                });

                spyOn(wixappsClassics.descriptorUtils, 'doesAllowHeightResize').and.callFake(function (aPartDefinition, vName) {
                    if (aPartDefinition === appPartDefinition && vName === viewName) {
                        return doesAllowHeightResize;
                    }
                });

                expect(appPartMetaData.resizableSides(ps, compPointer)).toEqual(expectedSides);
            }

            it('should return only left and right knobs', function () {
                testKnobs(false, [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT]);
            });

            it('should return all of the knobs', function () {
                testKnobs(true, [constants.RESIZE_SIDES.LEFT, constants.RESIZE_SIDES.RIGHT, constants.RESIZE_SIDES.TOP, constants.RESIZE_SIDES.BOTTOM]);
            });
        });

        describe('containable', function () {
            var ps, compPointer, masterPagePointer;

            function getCompPointer(compId, pageId) {
                var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                return ps.pointers.components.getComponent(compId, page);
            }

            beforeEach(function () {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1', [{id: 'comp'}]);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                compPointer = getCompPointer('comp', 'page1');
                masterPagePointer = ps.pointers.components.getMasterPage(constants.VIEW_MODES.DESKTOP);
                spyOn(dataModel, 'getDataItem').and.returnValue({});
            });

            it('should return true if not changing scope', function () {
                var pagePointer = ps.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);
                expect(appPartMetaData.containable(ps, compPointer, pagePointer)).toBe(true);
            });

            describe('if changing scope', function () {
                it('should return false if the component is a blog feed', function () {
                    spyOn(classicsUtils, 'getPackageName').and.returnValue('blog');
                    spyOn(classicsUtils, 'getAppPartRole').and.returnValue('BLOG_FEED');
                    expect(appPartMetaData.containable(ps, compPointer, masterPagePointer)).toBe(false);
                });

                it('should return false if the component is a single post', function () {
                    spyOn(classicsUtils, 'getPackageName').and.returnValue('blog');
                    spyOn(classicsUtils, 'getAppPartRole').and.returnValue('SINGLE_POST');
                    expect(appPartMetaData.containable(ps, compPointer, masterPagePointer)).toBe(false);
                });

                it('should return true if the component is a different blog component', function () {
                    spyOn(classicsUtils, 'getAppPartRole').and.returnValue('SOME OTHER ROLE');
                    spyOn(classicsUtils, 'getPackageName').and.returnValue('blog');
                    expect(appPartMetaData.containable(ps, compPointer, masterPagePointer)).toBe(true);
                });

                it('should return true if the component is not a blog component', function () {
                    spyOn(classicsUtils, 'getAppPartRole').and.returnValue('SOME OTHER ROLE');
                    spyOn(classicsUtils, 'getPackageName').and.returnValue('NOT blog');
                    expect(appPartMetaData.containable(ps, compPointer, masterPagePointer)).toBe(true);
                });

            });
        });

        describe('canBeStretched', function () {
            var ps, compPointer;

            function getCompPointer(compId, pageId) {
                var page = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.DESKTOP);
                return ps.pointers.components.getComponent(compId, page);
            }

            beforeEach(function () {
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1', [{id: 'comp'}]);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
                compPointer = getCompPointer('comp', 'page1');
                spyOn(dataModel, 'getDataItem').and.returnValue({});
            });

            it('should return true if the component is a posts gallery', function () {
                spyOn(classicsUtils, 'getPackageName').and.returnValue('blog');
                spyOn(classicsUtils, 'getAppPartRole').and.returnValue('POST_GALLERY');
                expect(appPartMetaData.canBeStretched(ps, compPointer)).toBe(true);
            });

            it('should return false if the component is a different blog component', function () {
                spyOn(classicsUtils, 'getAppPartRole').and.returnValue('SOME OTHER ROLE');
                spyOn(classicsUtils, 'getPackageName').and.returnValue('blog');
                expect(appPartMetaData.canBeStretched(ps, compPointer)).toBe(false);
            });

            it('should return false if the component is not a blog component', function () {
                spyOn(classicsUtils, 'getAppPartRole').and.returnValue('SOME ROLE');
                spyOn(classicsUtils, 'getPackageName').and.returnValue('NOT blog');
                expect(appPartMetaData.canBeStretched(ps, compPointer)).toBe(false);
            });
        });

        describe('containableByStructure', function () {
            var ps;

            var relatedPostsAppPart = {
                "type": "Component",
                "skin": "wysiwyg.viewer.skins.AppPartSkin",
                "layout": {
                    "width": 697,
                    "height": 297,
                    "x": 19,
                    "y": 58,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false
                },
                "componentType": "wixapps.integration.components.AppPart",
                "data": {
                    "type": "AppPart",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "appInnerID": "18",
                    "appPartName": "related-posts",
                    "viewName": "RelatedPosts",
                    "appLogicCustomizations": [],
                    "appLogicParams": {}
                },
                "props": {
                    "type": "AppPartProperties",
                    "metaData": {
                        "schemaVersion": "1.0"
                    },
                    "direction": "ltr"
                },
                "style": "blog_e000b4bf-9ff1-4e66-a0d3-d4b365ba3af5_1",
                "id": "i74zy4hy_1"
            };

            var notRelatedPostsComponent = {
                "type": "Component",
                "skin": "wysiwyg.viewer.skins.AppPartSkin",
                "layout": {
                    "width": 697,
                    "height": 297,
                    "x": 19,
                    "y": 58,
                    "scale": 1,
                    "rotationInDegrees": 0,
                    "fixedPosition": false
                },
                "componentType": "wixapps.integration.components.AppPart",
                "data": {
                    "type": "AppPart",
                    "metaData": {
                        "isPreset": false,
                        "schemaVersion": "1.0",
                        "isHidden": false
                    },
                    "appInnerID": "18",
                    "appPartName": "fake-app-part",
                    "viewName": "FakeView",
                    "appLogicCustomizations": [],
                    "appLogicParams": {}
                },
                "props": {
                    "type": "AppPartProperties",
                    "metaData": {
                        "schemaVersion": "1.0"
                    },
                    "direction": "ltr"
                },
                "style": "blog_e000b4bf-9ff1-4e66-a0d3-d4b365ba3af5_1",
                "id": "i74zy4hy_1"
            };

            var metaDataUtilsMock = {
                notContainableByPopup: function () {}
            };
            var dependenciesMock = {
                'documentServices/componentsMetaData/metaDataUtils': metaDataUtilsMock,
                experiment: experiment
            };

            beforeEach(function () {
                testUtils.experimentHelper.openExperiments(['sv_blogRelatedPosts']);
                var siteData = testUtils.mockFactory.mockSiteData()
                    .addPageWithDefaults('page1')
                    .addPopupPageWithDefaults('popup')
                    .addPageWithData('singlePostPage', {
                        type: 'AppPage',
                        appPageType: 'AppPage',
                        appPageId: '7326bfbb-4b10-4a8e-84c1-73f776051e10'
                    });

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            });

            testUtils.requireWithMocks('documentServices/componentsMetaData/components/appPartMetaData', dependenciesMock, function (metaData) {
                describe('not conainable', function () {
                    beforeEach(function () {
                        spyOn(metaDataUtilsMock, 'notContainableByPopup').and.returnValue(true);
                    });

                    it('popup is open', function () {
                        metaDataUtilsMock.notContainableByPopup.and.returnValue(false);
                        var popupPage = ps.pointers.components.getPage('popup', constants.VIEW_MODES.DESKTOP);


                        testUtils.experimentHelper.openExperiments(['sv_blogRelatedPosts']);
                        expect(metaData.containableByStructure(ps, notRelatedPostsComponent, popupPage)).toBe(false);
                    });

                    it('add RelatedPost component to the page', function () {
                        var pagePointer = ps.pointers.components.getPage('page1', constants.VIEW_MODES.DESKTOP);

                        expect(metaData.containableByStructure(ps, relatedPostsAppPart, pagePointer)).toBe(false);
                    });
                });

                describe('containable', function () {
                    beforeEach(function () {
                        spyOn(metaDataUtilsMock, 'notContainableByPopup').and.returnValue(true);
                    });

                    it('popup is closed', function () {
                        metaDataUtilsMock.notContainableByPopup.and.returnValue(true);
                        var popupPage = ps.pointers.components.getPage('popup', constants.VIEW_MODES.DESKTOP);

                        expect(metaData.containableByStructure(ps, notRelatedPostsComponent, popupPage)).toBe(true);
                    });

                    it('add RelatedPost component to SinglePost page', function () {
                        var singlePostPage = ps.pointers.components.getPage('singlePostPage', constants.VIEW_MODES.DESKTOP);
                        spyOn(ps.siteAPI, 'getFocusedRootId').and.returnValue(singlePostPage.id);

                        expect(metaData.containableByStructure(ps, relatedPostsAppPart, singlePostPage)).toBe(true);
                    });
                });
            });
        });
    });
});
