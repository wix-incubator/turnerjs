define([
    'lodash',
    'testUtils',
    'jsonpatch',
    'wixCodeSeo/dataHelper/siteDataHelper'
], function(_, testUtils, jsonpatch, siteDataHelper) {
    'use strict';

    describe('siteDataHelper', function() {

        function getMockCompStructure(compId, layout) {
            return {
                id: compId,
                componentType: compId + 'Type',
                type: 'Component',
                skin: compId + 'skin',
                propertyQuery: compId + 'PropQuery',
                dataQuery: '#' + compId + 'DataQuery',
                styleId: compId + 'PropQuery',
                layout: layout || {},
                modes: {
                    overrides: [{
                        modeIds: ['acive-page-mode-1'],
                        layout: {
                            key: 'value'
                        }
                    }]
                }
            };
        }

        beforeEach(function() {
            this.fullSiteData = testUtils.mockFactory.mockSiteData();
            this.pageId = 'page1';
            this.compId = 'compId';
            this.compData = {id: this.compId + 'DataQuery', key: 'value'};

            this.fullSiteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults(this.pageId)
                .setPageComponents([getMockCompStructure(this.compId)], this.pageId)
                .addData(this.compData, this.pageId);

            this.fullSiteData.setRootNavigationInfo({pageId: this.pageId});

            this.site = testUtils.mockFactory.mockWixSiteReactFromFullJson(this.fullSiteData);
            this.viewerPrivateServices = this.site.props.viewerPrivateServices;
            this.siteDataAPI = this.viewerPrivateServices.siteDataAPI;
            this.displayedDAL = this.viewerPrivateServices.displayedDAL;
            this.pointers = this.viewerPrivateServices.pointers;
        });

        describe('extractSiteData', function() {
            it('should merge runtime data into the displayed dal and return the json patch operations', function() {
                this.siteDataAPI.runtime.setCompData(this.compId, {key1: 'value1'});

                var originalPageData = this.displayedDAL.get(this.pointers.page.getPagePointer(this.pageId));

                var result = siteDataHelper.extractSiteData(this.viewerPrivateServices, this.fullSiteData, this.fullSiteData.getViewMode(), [this.pageId]);

                var modifiedPageData = this.displayedDAL.get(this.pointers.page.getPagePointer(this.pageId));

                expect(result[this.pageId]).toBeDefined();
                expect(result[this.pageId]).toEqual(jsonpatch.compare(originalPageData, modifiedPageData));
            });

            it('should return an empty array given there were no runtime changes', function() {
                var result = siteDataHelper.extractSiteData(this.viewerPrivateServices, this.fullSiteData, this.fullSiteData.getViewMode(), [this.pageId]);

                expect(result[this.pageId]).toBeDefined();
                expect(result[this.pageId].length).toEqual(0);
            });
        });
    });
});
