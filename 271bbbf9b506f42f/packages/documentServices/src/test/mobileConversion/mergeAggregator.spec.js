define([
    'lodash',
    'testUtils',
    'documentServices/constants/constants',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/mobileConversion/mobileActions',
    'documentServices/mobileConversion/mobileConversionFacade',
    'documentServices/mobileConversion/modules/mergeAggregator',
    'documentServices/documentMode/documentMode',
    'documentServices/page/page',
    'documentServices/hooks/hooks'
], function (_, testUtils, constants, privateServicesHelper, mobileActions, mobileConversion, mergeAggregator, documentMode, page, hooks) {
    'use strict';

    describe('Merge Aggregator', function () {

        function getMobileCompPosition(ps, compId, pageId) {
            var mobilePagePointer = ps.pointers.components.getPage(pageId, constants.VIEW_MODES.MOBILE);
            var componentPointer = ps.pointers.components.getComponent(compId, mobilePagePointer);
            var mobileComp = ps.dal.get(componentPointer);
            return _.pick(mobileComp.layout, ['x', 'y']);
        }

        function createMockComp(siteData, position, pageId) {
            var comp = testUtils.mockFactory.mockComponent('mobile.core.components.Container', siteData, pageId);
            _.assign(comp.layout, position, {width: 50, height: 50});
            _.assign(comp, {styleId: 'c1', components: []});
            return comp;
        }

        function initializeTestContext(testContext) {
            testContext.page1 = 'page1';
            testContext.page2 = 'page2';
            testContext.siteData = testUtils.mockFactory.mockSiteData()
                .addPageWithDefaults(testContext.page1)
                .addPageWithDefaults(testContext.page2);

            testContext.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(testContext.siteData);
            mergeAggregator.initialize(testContext.ps);
            mobileActions.initialize(testContext.ps);

            testContext.compA = createMockComp(testContext.siteData, {x: 100, y: 100}, testContext.page1);
            testContext.compB = createMockComp(testContext.siteData, {x: 100, y: 200}, testContext.page1);
        }

        describe('when sv_mergeAggregator experiment is closed', function () {
            beforeEach(function () {
                initializeTestContext(this);
            });

            it('should commit results of save merges', function () {
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});
                _.assign(this.compA.layout, {x: 100, y: 300});
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});

                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 20});
                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 80});
            });

            it('should commit results of non save merges', function () {
                mobileConversion.convertMobileStructure(this.ps);
                _.assign(this.compA.layout, {x: 100, y: 300});
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});

                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 20});
                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 80});
            });
        });

        describe('when sv_mergeAggregator experiment is open', function () {
            beforeEach(function () {
                testUtils.experimentHelper.openExperiments('sv_mergeAggregator');
                initializeTestContext(this);
            });

            it('should ignore results of intermediate save merges', function () {
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});
                _.assign(this.compA.layout, {x: 100, y: 300});
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});

                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 10});
                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 70});
            });

            it('should ignore results of intermediate save merges running on multiple pages', function () {
                this.compC = createMockComp(this.siteData, {x: 100, y: 200}, this.page2);
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});
                this.compD = createMockComp(this.siteData, {x: 100, y: 100}, this.page2);
                _.assign(this.compA.layout, {x: 100, y: 300});
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});

                expect(getMobileCompPosition(this.ps, this.compD.id, this.page2)).toEqual({x: 135, y: 10});
                expect(getMobileCompPosition(this.ps, this.compC.id, this.page2)).toEqual({x: 135, y: 70});

                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 10});
                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 70});
            });


            it('should commit results of merges running on "duplicate page"', function () {
                var newPagePointer = page.getPageIdToAdd(this.ps);
                page.duplicate(this.ps, newPagePointer, this.page1);
                _.assign(this.compA.layout, {x: 100, y: 300});
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});
                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 20});
                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 80});
            });

            it('should commit results of merges running on "publish"', function () {
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});
                hooks.executeHook(hooks.HOOKS.PUBLISH.BEFORE);
                _.assign(this.compA.layout, {x: 100, y: 300});
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});

                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 20});
                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 80});
            });

            it('should commit results of merges running on "switch to mobile"', function () {
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});
                _.assign(this.compA.layout, {x: 100, y: 300});
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.MOBILE);

                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 10});
                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 70});
            });

            it('should commit results of non save merges', function () {
                mobileConversion.convertMobileStructure(this.ps);
                _.assign(this.compA.layout, {x: 100, y: 300});
                mobileConversion.convertMobileStructure(this.ps, {commitConversionResults: false});

                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 20});
                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 80});
            });

            it('should commit results of merges running on "switch view"', function () {
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.MOBILE);
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.DESKTOP);
                _.assign(this.compA.layout, {x: 100, y: 300});
                documentMode.setViewMode(this.ps, constants.VIEW_MODES.MOBILE);

                expect(getMobileCompPosition(this.ps, this.compA.id, this.page1)).toEqual({x: 135, y: 20});
                expect(getMobileCompPosition(this.ps, this.compB.id, this.page1)).toEqual({x: 135, y: 80});
            });
        });

        // describe('when sv_HoverBox experiment is open', function () {
        //
        //
        // });
    });
});
