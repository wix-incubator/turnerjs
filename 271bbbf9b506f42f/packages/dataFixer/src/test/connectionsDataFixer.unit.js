define(['lodash', 'testUtils', 'dataFixer/plugins/connectionsDataFixer'], function(_, testUtils, connectionsDataFixer) {
    'use strict';

    describe('connectionsDataFixer', function() {

        beforeEach(function(){
            this.mockSiteData = testUtils.mockFactory.mockSiteData();
            this.pageId = this.mockSiteData.getCurrentUrlPageId();
        });

        it('should create connections_data map when connectionsData experiment is open', function(){
            testUtils.experimentHelper.openExperiments('connectionsData');
            var pageJson = this.mockSiteData.getPageData(this.pageId);

            connectionsDataFixer.exec(pageJson);

            expect(_.get(pageJson, 'data.connections_data')).toBeDefined();
        });

        it('should not create connections_data map when connectionsData experiment is open', function(){
            var pageJson = this.mockSiteData.getPageData(this.pageId);

            connectionsDataFixer.exec(pageJson);

            expect(_.get(pageJson, 'data.connections_data')).toBeUndefined();
        });
    });
});
