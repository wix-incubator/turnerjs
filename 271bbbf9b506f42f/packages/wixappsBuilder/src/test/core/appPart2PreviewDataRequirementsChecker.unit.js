define(['lodash', 'utils', 'testUtils', 'wixappsCore', 'wixappsBuilder/core/appPart2PreviewDataRequirementsChecker', 'wixappsBuilder/core/dataSelectorFactory'], function (_, utils, testUtils, wixappsCore, dataRequirementsChecker, dataSelectorFactory) {
    'use strict';

    var APP_BUILDER_DEFINITION_ID = '3d590cbc-4907-4cc4-b0b1-ddf2c5edf297';

    describe('appPart2 preview data requirements checker', function () {
        it('should return empty request array if it called from published site and not in preview', function () {
            // create siteData without documentServicesModel (i.e. in the viewer)
            var siteData = testUtils.mockFactory.mockSiteData(undefined, false);
            var clientSpecMap = siteData.getClientSpecMapEntryByAppDefinitionId(APP_BUILDER_DEFINITION_ID);

            var repoRequest = dataRequirementsChecker.repoRequestGetter(siteData, clientSpecMap);
            expect(repoRequest).toEqual([]);

            // should return empty array no matter of the compInfo parameter.
            var partRequest = dataRequirementsChecker.partRequestGetter(siteData);
            expect(partRequest).toEqual([]);
        });

        describe('repo in preview mode', function () {
            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData(undefined, true);
                this.clientSpecMap = this.siteData.getClientSpecMapEntryByAppDefinitionId(APP_BUILDER_DEFINITION_ID);
            });

            it('should return a request to the published repo if the site was never saved (i.e. template)', function () {
                this.siteData.setAsTemplate(true);
                var request = dataRequirementsChecker.repoRequestGetter(this.siteData, this.clientSpecMap);

                var baseUrl = utils.urlUtils.baseUrl(this.siteData.currentUrl.full);
                var expectedUrl = baseUrl + '/apps/appBuilder/published/' + this.clientSpecMap.instanceId;

                expect(request.url).toEqual(expectedUrl);
            });

            it('should return a request to the saved store if the site was saved already', function () {
                var request = dataRequirementsChecker.repoRequestGetter(this.siteData, this.clientSpecMap);

                var baseUrl = utils.urlUtils.baseUrl(this.siteData.currentUrl.full);
                var expectedUrl = baseUrl + '/apps/appBuilder/saved/' + this.clientSpecMap.instanceId;
                expect(request.url).toEqual(expectedUrl);
            });

            it('should use force to always send the request', function () {
                var request = dataRequirementsChecker.repoRequestGetter(this.siteData, this.clientSpecMap);
                var expectedRequest = {
                    url: jasmine.any(String),
                    force: true,
                    destination: 'wixapps.appbuilder.descriptor'.split('.'),
                    transformFunc: jasmine.any(Function),
                    error: jasmine.any(Function)
                };

                expect(request).toEqual(expectedRequest);
            });

            it('should return empty array when called on the second time', function () {
                dataRequirementsChecker.repoRequestGetter(this.siteData, this.clientSpecMap);

                var request = dataRequirementsChecker.repoRequestGetter(this.siteData, this.clientSpecMap);
                expect(request).toEqual([]);
            });
        });

        describe('parts in preview mode', function () {
            function getAllItemsOfTypeRequest(siteData, clientSpecMap, typeName) {
                var repo = wixappsCore.wixappsDataHandler.getDescriptor(siteData, clientSpecMap.type);
                var allItemsOfTypeDataSelectorDef = {
                    logicalTypeName: 'IB.AllItemsOfType',
                    forType: typeName
                };
                var dataSelector = dataSelectorFactory.getDataSelector(allItemsOfTypeDataSelectorDef, siteData, clientSpecMap, repo.applicationInstanceVersion);
                var expectedRequest = dataSelector.getRequest({}, _.noop, _.noop);
                expectedRequest.transformFunc = jasmine.any(Function);
                expectedRequest.error = jasmine.any(Function);
                return expectedRequest;
            }

            function getCompInfo(compId, data) {
                return {
                    data: data,
                    id: compId,
                    properties: null,
                    skin: 'wysiwyg.viewer.skins.AppPartSkin'
                };
            }

            function addAndGetAppPartCompData(siteData, partName, typeName, dataSelectorId) {
                var pageId = siteData.getCurrentUrlPageId();
                siteData
                    .addAppPartCompData(partName, 'dataItem_test', pageId)
                    .addTypeDefinition(typeName)
                    .addManualDataSelector(dataSelectorId, typeName, ['item1'])
                    .addPart(partName, dataSelectorId, typeName, 'test_view');

                return siteData.getDataByQuery('dataItem_test', pageId);
            }

            beforeEach(function () {
                this.siteData = testUtils.mockFactory.mockSiteData(undefined, true);
                this.clientSpecMap = this.siteData.getClientSpecMapEntryByAppDefinitionId(APP_BUILDER_DEFINITION_ID);
            });

            it("should return empty array and set the component to loading state if the repo hasn't been loaded", function () {
                delete this.siteData.wixapps.appbuilder.descriptor;

                var partName = 'partName';
                var pageId = this.siteData.getCurrentUrlPageId();
                this.siteData.addAppPartCompData(partName, 'dataItem_test', pageId);
                var compData = this.siteData.getDataByQuery('dataItem_test', pageId);
                var compInfo = getCompInfo('comp1', compData);

                var actual = dataRequirementsChecker.partRequestGetter(this.siteData, compInfo);
                expect(actual).toEqual([]);

                var compMetadata = wixappsCore.wixappsDataHandler.getCompMetadata(this.siteData, 'appbuilder', partName);
                expect(compMetadata).toEqual({loading: true});
            });

            it("should return request for allItemsOfType for this part's type", function () {
                var partName = 'partName';
                var typeName = 'test_type';
                var dataSelectorId = 'dataSelector_test';
                var compData = addAndGetAppPartCompData(this.siteData, partName, typeName, dataSelectorId);
                var compInfo = getCompInfo('comp1', compData);
                var expectedRequest = getAllItemsOfTypeRequest(this.siteData, this.clientSpecMap, typeName);

                var actual = dataRequirementsChecker.partRequestGetter(this.siteData, compInfo);
                expect(actual).toEqual(expectedRequest);
            });

            it('should return empty array if the part data requested already', function () {
                var partName = 'partName';
                var typeName = 'test_type';
                var dataSelectorId = 'dataSelector_test';
                var compData = addAndGetAppPartCompData(this.siteData, partName, typeName, dataSelectorId);
                var compInfo = getCompInfo('comp1', compData);

                // First request
                dataRequirementsChecker.partRequestGetter(this.siteData, compInfo);

                // Second request to the same component
                var actual = dataRequirementsChecker.partRequestGetter(this.siteData, compInfo);
                expect(actual).toEqual([]);
            });

            it('should return empty array and set the component as error when there is no part definition in the repo for the component', function () {
                var partName = 'partName';
                this.siteData
                    .addAppPartCompData(partName, 'dataItem_test');

                var compData = this.siteData.getDataByQuery('dataItem_test');

                var compInfo = getCompInfo('comp1', compData);

                // First request
                var actual = dataRequirementsChecker.partRequestGetter(this.siteData, compInfo);
                expect(actual).toEqual([]);

                var compMetadata = wixappsCore.wixappsDataHandler.getCompMetadata(this.siteData, this.clientSpecMap.type, partName);
                expect(compMetadata).toEqual({loading: false, error: true});
            });
        });
    });
});
