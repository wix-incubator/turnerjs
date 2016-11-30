define(['layout/util/layout', 'layout/util/anchors', 'layout/util/reduceDistancesAlgorithm/reduceDistancesAlgorithm', 'testUtils'], function (layout, anchors, reduceDistancesAlgorithm, testUtils) {
    'use strict';


    describe('layout units', function(){
        describe('reLayout', function(){
            beforeEach(function(){
                this.structuresDesc = {};
                var siteData = testUtils.mockFactory.mockSiteData();
                siteData.measureMap = null; // enforce full reLayout
                this.siteAPI = testUtils.mockFactory.mockSiteAPI(siteData);
                var pageId = siteData.getCurrentUrlPageId();
                this.structuresDesc[pageId] = {
                    structure: siteData.getPageData(pageId).structure,
                    pageId: pageId,
                    getDomNodeFunc: function(){}
                };
                this.noEnforceAnchors = false;
                this.lockedCompIds = [];
                this.reLayout = function(){
                    layout.reLayout(this.structuresDesc, this.siteAPI, this.noEnforceAnchors, this.lockedCompIds);
                };
            });
            it('should run enforceAnchors when running reLayout', function(){
                spyOn(anchors, 'enforceAnchors');
                this.reLayout();
                expect(anchors.enforceAnchors).toHaveBeenCalled();
            });
            describe('when experiment layout_verbs_with_anchors is open', function(){
                beforeEach(function(){
                    testUtils.experimentHelper.openExperiments('layout_verbs_with_anchors');
                });

                it('should run enforceStructure when running reLayout', function(){
                    spyOn(reduceDistancesAlgorithm, 'enforce');
                    this.reLayout();
                    expect(reduceDistancesAlgorithm.enforce).toHaveBeenCalled();
                });
            });
        });
    });
});
