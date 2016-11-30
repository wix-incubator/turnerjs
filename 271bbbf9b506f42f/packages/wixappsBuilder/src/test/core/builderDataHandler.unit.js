define([
    'lodash',
    'testUtils',
    'wixappsCore',
    'wixappsBuilder/core/appPart2DataFetchingStateManager',
    'wixappsBuilder/core/builderDataHandler'
], function (_, testUtils, wixapps, dataFetchingStateManager, builderDataHandler) {
    'use strict';

    describe('builderDataHandler', function () {
        describe('getBundledPartsDataRequest', function () {
            it('should mark all parts as loading when creating the request', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});
                var partNames = ['partName-1', 'partName-2'];
                builderDataHandler.getBundledPartsDataRequest(siteData, appService, partNames);

                _.forEach(partNames, function (partName) {
                    expect(wixapps.wixappsDataHandler.getCompMetadata(siteData, 'appbuilder', partName)).toContain({loading: true});
                });
            });

            it('should mark all parts metadata as success when transformFunc is called', function () {
                var siteData = testUtils.mockFactory.mockSiteData();
                var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});
                var partName = 'partName';
                var requestDescriptors = builderDataHandler.getBundledPartsDataRequest(siteData, appService, [partName]);
                requestDescriptors[0].transformFunc({}, {});

                expect(requestDescriptors.length).toEqual(1);
                expect(wixapps.wixappsDataHandler.getCompMetadata(siteData, 'appbuilder', partName)).toContain({loading: false});
            });

            describe('when response return null', function () {
                it('should mark all parts as error', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});
                    var partName = 'partName';
                    var requestDescriptors = builderDataHandler.getBundledPartsDataRequest(siteData, appService, [partName]);
                    requestDescriptors[0].transformFunc(null, {});

                    expect(requestDescriptors.length).toEqual(1);
                    expect(dataFetchingStateManager.isPartErroneous(siteData, appService, partName)).toEqual(true);
                });

                it('should return the same currentValue when transformFunc is called', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});
                    var partName = 'partName';
                    var requestDescriptors = builderDataHandler.getBundledPartsDataRequest(siteData, appService, [partName]);
                    var currentValue = {test: true};

                    var newValue = requestDescriptors[0].transformFunc(null, currentValue);

                    expect(newValue).toEqual(currentValue);
                });

                it('should return empty object if the currentValue that was passed to the transformFunc was undefined', function () {
                    var siteData = testUtils.mockFactory.mockSiteData();
                    var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});
                    var partName = 'partName';
                    var requestDescriptors = builderDataHandler.getBundledPartsDataRequest(siteData, appService, [partName]);

                    var newValue = requestDescriptors[0].transformFunc(null, null);

                    expect(newValue).toEqual({});
                });
            });
        });

        describe('getApplicationRepoRequest', function () {
            it('should get the published data when the site never saved', function () {
                var siteData = testUtils.mockFactory.mockSiteData(null, true);
                siteData.documentServicesModel.neverSaved = true;
                siteData.updateCurrentUrl({full: 'http://test.wix.com/html/editor/web/renderer/edit'});
                var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});

                var actual = builderDataHandler.getApplicationRepoRequest(siteData, appService);

                expect(actual.url).toEqual('http://test.wix.com/apps/appBuilder/published/' + appService.instanceId);
            });

            it('should get the saved data when the site was saved before', function () {
                var siteData = testUtils.mockFactory.mockSiteData(null, true);
                siteData.documentServicesModel.neverSaved = false;
                siteData.updateCurrentUrl({full: 'http://test.wix.com/html/editor/web/renderer/edit'});
                var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});

                var actual = builderDataHandler.getApplicationRepoRequest(siteData, appService);

                expect(actual.url).toEqual('http://test.wix.com/apps/appBuilder/saved/' + appService.instanceId);
            });

            it('should set force property to true', function () {
                var siteData = testUtils.mockFactory.mockSiteData(null, true);
                var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});

                var actual = builderDataHandler.getApplicationRepoRequest(siteData, appService);

                expect(actual.force).toEqual(true);
            });

            it('should set the destination to the descriptor of the appbuilder store', function () {
                var siteData = testUtils.mockFactory.mockSiteData(null, true);
                var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});

                var actual = builderDataHandler.getApplicationRepoRequest(siteData, appService);

                expect(actual.destination).toEqual(['wixapps', appService.type, 'descriptor']);
            });

            it('should mark package as error if the error callback is called', function () {
                var siteData = testUtils.mockFactory.mockSiteData(null, true);
                var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});

                var repoRequest = builderDataHandler.getApplicationRepoRequest(siteData, appService);
                repoRequest.error();

                var actual = dataFetchingStateManager.isPackageErroneous(siteData, appService);
                expect(actual).toEqual(true);
            });

            it('should mark repo as error if the response success propery is false', function () {
                var siteData = testUtils.mockFactory.mockSiteData(null, true);
                var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});

                var repoRequest = builderDataHandler.getApplicationRepoRequest(siteData, appService);
                repoRequest.transformFunc({success: false});

                var actual = dataFetchingStateManager.isPackageErroneous(siteData, appService);
                expect(actual).toEqual(true);
            });

            describe('add Missing views when needed', function () {

                function addPartDefinitionToPayload(payload, partId) {
                    payload.types.push({
                        displayName: _.uniqueId('type-displayName-'),
                        fields: [],
                        baseTypes: [],
                        version: 0,
                        name: partId + '-type'
                    });

                    payload.dataSelectors.push({
                        forType: partId + '-type',
                        id: partId + '-selector',
                        dataProviderId: 'wixdb',
                        logicalTypeName: 'IB.ManualSelectedList',
                        itemIds: []
                    });

                    payload.parts[partId] = {
                        dataSelector: partId + '-selector',
                        viewName: partId + '-view',
                        type: partId + '-type',
                        displayName: partId + '-displayName'
                    };

                    return payload.parts[partId];
                }

                function getViewsForPart(partDef) {
                    return [
                        {forType: 'Array', name: partDef.viewName, id: 'ArrayView', comp: {name: 'VBox', items: []}},
                        {forType: 'Array', name: partDef.viewName, id: 'MobileArrayView', comp: {name: 'VBox', items: []}, format: 'Mobile'},
                        {forType: partDef.type, name: partDef.viewName, id: 'ItemView', comp: {name: 'VBox', items: []}},
                        {forType: partDef.type, name: partDef.viewName, id: 'MobileItemView', comp: {name: 'VBox', items: []}, format: 'Mobile'}
                    ];
                }

                function addAppPart2Component(appPartName, siteData, appService, pageId) {
                    var appPart2Data = testUtils.mockFactory.dataMocks.appPart2Data({
                        appInnerID: appService.applicationId,
                        appPartName: appPartName
                    });
                    return testUtils.mockFactory.mockComponent('wixapps.integration.components.AppPart2', siteData, pageId || 'masterPage', {data: appPart2Data});
                }

                beforeEach(function () {
                    this.siteData = testUtils.mockFactory.mockSiteData(null, true);
                    this.appService = _.find(this.siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});
                    this.responseData = {
                        success: true,
                        payload: {
                            dataProviders: {
                                wixdb: {
                                    type: 'WixDb'
                                }
                            },
                            dataSelectors: [],
                            parts: {},
                            views: [],
                            pages: {},
                            types: [],
                            applicationInstanceVersion: 4,
                            serverTime: '2016-07-11T08:21:58.475Z'
                        }
                    };
                });

                it("should set an empty repo when there are AppPart2 components and the repo doesn't exist in the server", function () {
                    addAppPart2Component('part1', this.siteData, this.appService);
                    var repoRequest = builderDataHandler.getApplicationRepoRequest(this.siteData, this.appService);
                    this.responseData.payload = _.pick(this.responseData.payload, ['applicationInstanceVersion', 'serverTime']);

                    var repo = repoRequest.transformFunc(this.responseData);

                    expect(repo.views).toEqual({});
                    expect(repo.types).toEqual({});
                    expect(repo.dataSelectors).toEqual({});
                    expect(repo.parts).toEqual({});
                });

                it('should ignore AppPart2 components that has no part definition in the repo', function () {
                    var partDef = addPartDefinitionToPayload(this.responseData.payload, 'part1');
                    this.responseData.payload.views = getViewsForPart(partDef);

                    addAppPart2Component('part1', this.siteData, this.appService);
                    addAppPart2Component('notExistPart', this.siteData, this.appService);
                    var repoRequest = builderDataHandler.getApplicationRepoRequest(this.siteData, this.appService);

                    var repo = repoRequest.transformFunc(this.responseData);

                    expect(_.values(repo.views)).toContain(this.responseData.payload.views);
                    expect(_.size(repo.views)).toEqual(this.responseData.payload.views.length);
                });

                it('should not add missing views for parts that has no AppPart2 component', function () {
                    addPartDefinitionToPayload(this.responseData.payload, 'part1');
                    var repoRequest = builderDataHandler.getApplicationRepoRequest(this.siteData, this.appService);
                    var repo = repoRequest.transformFunc(this.responseData);

                    expect(_.keys(repo.views)).toEqual([]);
                });

                it('should add missing views for part definitions that has AppPart2 component in masterPage', function () {
                    var part = addPartDefinitionToPayload(this.responseData.payload, 'part1');
                    addAppPart2Component('part1', this.siteData, this.appService);

                    var repoRequest = builderDataHandler.getApplicationRepoRequest(this.siteData, this.appService);
                    var repo = repoRequest.transformFunc(this.responseData);

                    var expectedViews = [
                        {forType: 'Array', name: part.viewName},
                        {forType: 'Array', name: part.viewName, format: 'Mobile'},
                        {forType: part.type, name: part.viewName},
                        {forType: part.type, name: part.viewName, format: 'Mobile'}
                    ];

                    _.forEach(expectedViews, function (expView) {
                        expect(_.some(repo.views, expView)).toBeTruthy();
                    });

                    expect(_.size(repo.views)).toEqual(4);
                });

                it('should add missing views for part definitions that has AppPart2 component not in masterPage', function () {
                    var part = addPartDefinitionToPayload(this.responseData.payload, 'part1');
                    this.siteData.addPageWithDefaults('test-page');
                    addAppPart2Component('part1', this.siteData, this.appService, 'test-page');

                    var repoRequest = builderDataHandler.getApplicationRepoRequest(this.siteData, this.appService);
                    var repo = repoRequest.transformFunc(this.responseData);

                    var expectedViews = [
                        {forType: 'Array', name: part.viewName},
                        {forType: 'Array', name: part.viewName, format: 'Mobile'},
                        {forType: part.type, name: part.viewName},
                        {forType: part.type, name: part.viewName, format: 'Mobile'}
                    ];

                    _.forEach(expectedViews, function (expView) {
                        expect(_.some(repo.views, expView)).toBeTruthy();
                    });

                    expect(_.size(repo.views)).toEqual(4);
                });

                it('should add missing views only for part definitions that has AppPart2 component', function () {
                    var partDef = addPartDefinitionToPayload(this.responseData.payload, 'part1');
                    addPartDefinitionToPayload(this.responseData.payload, 'part2');
                    addAppPart2Component('part1', this.siteData, this.appService);

                    var repoRequest = builderDataHandler.getApplicationRepoRequest(this.siteData, this.appService);
                    var repo = repoRequest.transformFunc(this.responseData);

                    expect(_.every(repo.views, {name: partDef.viewName})).toBeTruthy();
                });

                it('should remove views that have no component that is using it', function () {
                    var partDef = addPartDefinitionToPayload(this.responseData.payload, 'part1');
                    this.responseData.payload.views = getViewsForPart(partDef);

                    var repoRequest = builderDataHandler.getApplicationRepoRequest(this.siteData, this.appService);
                    var repo = repoRequest.transformFunc(this.responseData);

                    expect(repo.views).toEqual({});
                });

                it('should remove views that have no component that is using it and keep the rest', function () {
                    var part1Def = addPartDefinitionToPayload(this.responseData.payload, 'part1');
                    var part2Def = addPartDefinitionToPayload(this.responseData.payload, 'part2');
                    var expected = getViewsForPart(part1Def);
                    this.responseData.payload.views = expected.concat(getViewsForPart(part2Def));

                    addAppPart2Component('part1', this.siteData, this.appService);
                    var repoRequest = builderDataHandler.getApplicationRepoRequest(this.siteData, this.appService);
                    var repo = repoRequest.transformFunc(this.responseData);

                    expect(_.toArray(repo.views)).toEqual(expected);
                });

                it('should not break when some pages are not loaded', function () {
                    var siteData = testUtils.mockFactory.mockSiteData(); // this siteData should be the one we'll have in the viewer.
                    var appService = _.find(siteData.rendererModel.clientSpecMap, {type: 'appbuilder'});

                    siteData.addPageWithDefaults('test-page');
                    delete siteData.pagesData['test-page'];

                    var repoRequest = builderDataHandler.getApplicationRepoRequest(siteData, appService);
                    expect(repoRequest.transformFunc.bind(repoRequest, this.responseData)).not.toThrow();
                });
            });
        });
    });
});
