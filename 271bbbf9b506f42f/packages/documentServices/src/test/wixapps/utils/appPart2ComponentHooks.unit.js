define([
        'lodash',
        'documentServices/wixapps/utils/appPart2ComponentHooks',
        'testUtils',
        'documentServices/mockPrivateServices/MockPrivateServices',
        'documentServices/wixapps/services/listTemplates',
        'documentServices/wixapps/services/lists',
        'documentServices/wixapps/services/clientSpecMap',
        'documentServices/component/component',
        'documentServices/component/componentValidations',
        'documentServices/dataModel/dataModel',
        'documentServices/component/component',
        'documentServices/mockPrivateServices/privateServicesHelper',
        'documentServices/wixapps/utils/pathUtils',
        'documentServices/dataModel/dataValidators'
    ],
    function (_, appPart2ComponentHooks, testUtils, MockPrivateServices, listTemplates, lists, appBuilderClientSpecMap, componentDS, componentValidations, dataModel, component, privateServicesHelper, pathUtils, dataValidators) {
        'use strict';

        describe('appPart2ComponentHooks', function () {

            var ps, appPart2CompDef, fakeApplicationId;
            beforeEach(function () {
                fakeApplicationId = 12345;
                appPart2CompDef = {
                    componentType: 'wixapps.integration.components.AppPart2',
                    type: 'AppBuilderComponent',
                    skin: 'wysiwyg.viewer.skins.AppPartSkin',
                    styleId: 'app1',
                    layout: {
                        width: 500,
                        height: 500
                    },
                    data: {
                        type: 'AppBuilderComponent',
                        appInnerID: 2
                    },
                    custom: {
                        template: {fake: 'Fake AppPart2 template'}
                    }
                };

                var fakeContainerDef = {
                    id: 'container',
                    "layout": {
                        "width": 800, "height": 700,
                        "x": 100, "y": 100,
                        "scale": 1.0, "rotationInDegrees": 0.0,
                        "anchors": []
                    },
                    "type": "Container",
                    "skin": "wysiwyg.viewer.skins.area.RectangleArea",
                    "componentType": "mobile.core.components.Container",
                    "components": [],
                    "data": null,
                    "props": null
                };

                var siteData = privateServicesHelper.getSiteDataWithPages({mainPage: {components: [fakeContainerDef]}});
                siteData.wixapps = {
                    appbuilder: {metadata: {appbuilder_metadata: {requestedPartNames: []}}}
                };
                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData, {siteData: [{path: ['pagesData'], optional: false}, {path: ['wixapps'], optional: false}]});

                appPart2ComponentHooks.registerHooks();

                spyOn(appBuilderClientSpecMap, 'getApplicationId').and.returnValue(fakeApplicationId);
                spyOn(dataModel, 'updateDataItem');
                spyOn(listTemplates, 'createListFromTemplate').and.returnValue('newFakeListId');
                spyOn(dataValidators, 'validateDataBySchema');
            });

            afterEach(function () {
                appPart2ComponentHooks.unregisterAllHooks();
            });

            function getContainer() {
                var page = ps.pointers.components.getPage('mainPage', 'DESKTOP');
                return ps.pointers.components.getComponent('container', page);
            }

            function getNewComp(id) {
                return componentDS.getComponentToAddRef(ps, getContainer, null, id);
            }

            describe('afterAddAppPart2', function () {

                it('should use the given template to create a new list', function () {
                    componentDS.add(ps, getNewComp(), getContainer(), appPart2CompDef);
                    expect(listTemplates.createListFromTemplate).toHaveBeenCalledWith(ps, appPart2CompDef.custom.template);
                });

                it('should update the component\'s appPartName with the created list\'s ID', function () {
                    componentDS.add(ps, getNewComp(), getContainer(), appPart2CompDef);
                    expect(dataModel.updateDataItem).toHaveBeenCalledWith(ps, jasmine.any(Object), jasmine.objectContaining({appPartName: 'newFakeListId'}));
                });

                it('should update the component\'s appInnerID with the appbuilder application ID from the client spec map', function () {
                    componentDS.add(ps, getNewComp(), getContainer(), appPart2CompDef);
                    expect(dataModel.updateDataItem).toHaveBeenCalledWith(ps, jasmine.any(Object), jasmine.objectContaining({appInnerID: fakeApplicationId}));
                });

                it('should set the new part as requested', function () {
                    componentDS.add(ps, getNewComp(), getContainer(), appPart2CompDef);
                    var requested = ps.dal.getByPath(pathUtils.getAppbuilderMetadataPath('requestedPartNames'));
                    expect(requested).toEqual(['newFakeListId']);
                });

                it('should set the new part as loaded (i.e. loading = false)', function () {
                    var listId = 'newFakeListId';
                    componentDS.add(ps, getNewComp(), getContainer(), appPart2CompDef);
                    var metaData = ps.dal.getByPath(pathUtils.getAppPart2MetadataPath(listId));
                    expect(metaData).toEqual({loading: false});
                });
            });

            describe('afterSerializeAppPart2', function () {

                it('should add the list\'s template to the custom definition attribute', function () {
                    var fakeListId = 'testAppPartName';
                    var fakeTemplate = {fake: 'fake template'};
                    //spyOn(ps.dal, 'get').and.returnValue({ // bad to spy on every get, but couldn't find a better way to do it
                    //    componentType: 'wixapps.integration.components.AppPart2'
                    //});
                    spyOn(dataModel, 'getDataItem').and.returnValue({appPartName: fakeListId});
                    spyOn(listTemplates, 'generateTemplate').and.callFake(function (fakePs, listId) {
                        if (listId === fakeListId) {
                            return fakeTemplate;
                        }
                    });
                    var compPointer = getNewComp();
                    componentDS.add(ps, compPointer, getContainer(), appPart2CompDef);
                    var serializedComp = componentDS.serialize(ps, compPointer);
                    expect(serializedComp.custom.template).toEqual(fakeTemplate);
                });

            });

        });

        describe('afterDeleteList', function () {
            var arrayView, mobileArrayView, typeView, mobileTypeView, differentViewNameView, compRef, siteData, views, ps, dataItem, duplicateViewNameView;

            beforeEach(function () {
                arrayView = {
                    forType: "Array",
                    name: "BasicPostsView_testViewName"
                };

                mobileArrayView = {
                    forType: "Array",
                    name: "BasicPostsView_testViewName",
                    format: "Mobile"
                };

                typeView = {
                    forType: "BasicPosts_type",
                    name: "BasicPostsView_testViewName"
                };
                mobileTypeView = {
                    forType: "BasicPosts_type",
                    name: "BasicPostsView_testViewName",
                    format: "Mobile"
                };

                differentViewNameView = {
                    forType: "BasicPosts_type",
                    name: "BasicPostsView_differentViewName"
                };

                duplicateViewNameView = {
                    forType: "BasicPosts_type",
                    name: "BasicPostsView_testViewName_dup"
                };

                compRef = {
                    "type": "DESKTOP",
                    "id": "comp-i902zq8q"
                };

                siteData = testUtils.mockFactory.mockSiteData(null, true);

                views = [arrayView, mobileArrayView, typeView, mobileTypeView, differentViewNameView, duplicateViewNameView];
                siteData
                    .addPart('appPartName', 'dataSelectori71q3vsn1i71q3vsn2', 'BasicPosts_type', 'BasicPostsView_testViewName')
                    .addViews(views);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                dataItem = {type: "AppBuilderComponent", appInnerID: 2, appPartName: 'appPartName'};
            });

            it('should delete list views on desktop component', function () {
                appPart2ComponentHooks.afterDeleteList(ps, compRef, false, undefined, undefined, dataItem);

                var returnedViews = ps.dal.getByPath(pathUtils.getBaseViewsPath());

                var expectedResult = {};
                expectedResult[differentViewNameView.forType + '|' + differentViewNameView.name] = differentViewNameView;
                expectedResult[duplicateViewNameView.forType + '|' + duplicateViewNameView.name] = duplicateViewNameView;

                expect(returnedViews).toEqual(expectedResult);
            });

            it('should delete list views on mobile component', function () {
                compRef.type = 'MOBILE';
                var viewsBeforeHook = ps.dal.getByPath(pathUtils.getBaseViewsPath());

                appPart2ComponentHooks.afterDeleteList(ps, compRef, false, undefined, dataItem);

                var viewsAfterHook = ps.dal.getByPath(pathUtils.getBaseViewsPath());

                expect(viewsBeforeHook).toEqual(viewsAfterHook);
            });

            it('when deleting a list and no repo exists, should not throw', function () {
                siteData = testUtils.mockFactory.mockSiteData(null, true);

                ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);

                dataItem = {type: "AppBuilderComponent", appInnerID: 2, appPartName: "myViewName"};

                appPart2ComponentHooks.afterDeleteList(ps, compRef, false, undefined, undefined, dataItem);

                var returnedViews = ps.dal.getByPath(pathUtils.getBaseViewsPath());

                expect(returnedViews).toEqual({});
            });
        });

    });
