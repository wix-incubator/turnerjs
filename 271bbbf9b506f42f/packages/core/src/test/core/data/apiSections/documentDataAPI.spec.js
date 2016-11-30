define([
    'core/core/SiteDataAPI',
    'lodash',
    'testUtils'
], function(SiteDataAPI, _, testUtils) {
    'use strict';

    describe('documentDataAPI', function() {

        beforeEach(function() {
            this.testContainerId = 'testContainer';
            this.testModeId = 'testMode';
            this.compNotInTestMode = 'compNotInTestMode';
            this.compOutOfContainer = 'compOutOfContainer';
            this.testPageId = 'testPage';
            var fullSiteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults(this.testPageId)
                .setPageComponents([
                    testUtils.mockFactory.createStructure(this.compOutOfContainer + 'Type', {}, this.compOutOfContainer),
                    testUtils.mockFactory.createStructure('mobile.core.components.Container', {
                        modes: {definitions: [{modeId: this.testModeId}]},
                        components: _.map(['desktopComp1', 'desktopComp2'], function (desktopCompId) {
                            return testUtils.mockFactory.createStructure(desktopCompId + 'Type', {}, desktopCompId);
                        }, this).concat(
                            testUtils.mockFactory.createStructure(this.compNotInTestMode + 'Type', {
                                layout: {testParam: 'original'},
                                modes: {
                                    isHiddenByModes: false,
                                    overrides: [{
                                        modeIds: [this.testModeId],
                                        layout: {testParam: 'override'},
                                        isHiddenByModes: true
                                    }]
                                }
                            }, this.compNotInTestMode)
                        )
                    }, this.testContainerId)
                ], this.testPageId)
                .setPageComponents([testUtils.mockFactory.createStructure('mobile.core.components.Container', {
                    modes: {definitions: [{modeId: this.testModeId}]},
                    components: _.map(['mobileComp1', 'mobileComp2'], function (desktopCompId) {
                        return testUtils.mockFactory.createStructure(desktopCompId + 'Type', {}, desktopCompId);
                    }, this)
                }, this.testContainerId)], this.testPageId, true)
                .setCurrentPage(this.testPageId);

            var siteDataApiWrapper = SiteDataAPI.createSiteDataAPIAndDal(fullSiteData, _.noop);
            siteDataApiWrapper.siteData.pagesData = _.cloneDeep(siteDataApiWrapper.siteData.pagesData);  // ensure that fullJson != displayedJson
            this.siteData = siteDataApiWrapper.siteData;
            this.siteDataAPI = siteDataApiWrapper.siteDataAPI;
	        this.pointers = siteDataApiWrapper.pointers;
        });

        describe('getAllCompsUnderRoot', function() {

            it('should return components that are under the given node in the current view mode', function() {
                this.siteData.isMobileView = jasmine.createSpy('isMobileView').and.returnValue(false); // TODO: replace with a mockSiteData method
                this.siteData.getViewMode = jasmine.createSpy('getViewMode').and.returnValue('DESKTOP');
                var returnedCompsInDesktop = this.siteDataAPI.document.getAllCompsUnderRoot(this.testPageId, this.testContainerId);
                expect(_.map(returnedCompsInDesktop, 'id').sort()).toEqual([
                        this.testContainerId,
                        this.compNotInTestMode,
                        'desktopComp1', 'desktopComp2'
                    ].sort()
                );

                this.siteData.isMobileView = jasmine.createSpy('isMobileView').and.returnValue(true); // TODO: replace with a mockSiteData method
                this.siteData.getViewMode = jasmine.createSpy('getViewMode').and.returnValue('MOBILE');
                var returnedCompsInMobile = this.siteDataAPI.document.getAllCompsUnderRoot(this.testPageId, this.testContainerId);
                expect(_.map(returnedCompsInMobile, 'id').sort()).toEqual([
                        this.testContainerId,
                        'mobileComp1', 'mobileComp2'
                    ].sort()
                );
            });

            it('should not return components which are not under the given node', function() {
                var returnedComponents = this.siteDataAPI.document.getAllCompsUnderRoot(this.testPageId, this.testContainerId);
                expect(_.map(returnedComponents, 'id')).not.toContain(this.compOutOfContainer);
            });

            it('should return components even if they are not currently displayed', function() {
                this.siteDataAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
                var returnedComponents = this.siteDataAPI.document.getAllCompsUnderRoot(this.testPageId, this.testContainerId);
                expect(_.map(returnedComponents, 'id')).toContain(this.compNotInTestMode);
            });

        });

	    describe('getFullStructureProperty', function () {

		    it("should return the component's property from the full json when it's in the active mode", function () {
			    var pagePointer = this.pointers.full.components.getPage(this.testPageId, this.siteData.getViewMode());
			    var compPointer = this.pointers.full.components.getComponent(this.compNotInTestMode, pagePointer);
			    var compType = this.siteDataAPI.document.getFullStructureProperty(compPointer, 'componentType');
			    expect(compType).toEqual(this.compNotInTestMode + 'Type');
		    });

		    it("should return the component's property from the full json even when it was override in the active mode", function () {
			    this.siteDataAPI.activateModeById(this.testContainerId, this.testPageId, this.testModeId);
			    var pagePointer = this.pointers.full.components.getPage(this.testPageId, this.siteData.getViewMode());
			    var compPointer = this.pointers.full.components.getComponent(this.compNotInTestMode, pagePointer);
			    var compType = this.siteDataAPI.document.getFullStructureProperty(compPointer, 'layout');
			    expect(compType).toContain({testParam: 'original'});
		    });
	    });
    });
});
