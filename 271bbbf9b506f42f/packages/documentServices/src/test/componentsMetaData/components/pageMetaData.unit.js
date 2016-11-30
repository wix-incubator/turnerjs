define([
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/constants/constants',
    'documentServices/documentMode/documentModeInfo',
    'definition!documentServices/componentsMetaData/components/pageMetaData'
], function (testUtils,
             privateServicesHelper,
             consts,
             documentInfo,
             pageMetaDataDef) {
    'use strict';

    describe('pageMetaData', function () {
        var pageMetaData, mockFactory, siteData, ps, viewMode;

        beforeEach(function () {
            mockFactory = testUtils.mockFactory;
            siteData = mockFactory.mockSiteData();
            ps = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
            viewMode = documentInfo.getViewMode(ps);
            siteData.addPopupPageWithDefaults('popup1');
            generatePageMetaData();
        });


        function generatePageMetaData() {
            pageMetaData = pageMetaDataDef(consts);
        }

        it('anchors', function () {
            var expectedAnchors = {
                to: {allow: true, lock: consts.ANCHORS.LOCK_CONDITION.NEVER},
                from: false
            };

            expect(pageMetaData.anchors).toEqual(expectedAnchors);
        });


        it('should have styleCanBeApplied method', function () {
            expect(pageMetaData.styleCanBeApplied).toEqual(jasmine.any(Function));
        });

        it('should be truthy for styleCanBeApplied if comp is not popup', function () {
            siteData.addPageWithDefaults('page1');

            expect(pageMetaData.styleCanBeApplied(ps, ps.pointers.components.getPage('page1', viewMode))).toBeTruthy();
        });

        it('should be falsy for styleCanBeApplied if comp is popup', function () {
            siteData._currentPageIds.popupPage = 'popup1';

            expect(pageMetaData.styleCanBeApplied(ps, ps.pointers.components.getPage('popup1', viewMode))).toBeFalsy();
        });
    });


});
