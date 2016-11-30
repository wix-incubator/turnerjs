define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/page/page',
    'documentServices/documentMode/documentMode'
], function (_, testUtils, privateServicesHelper, page, documentMode) {
    'use strict';
    var mockPrivateServices;
    var siteData;
    var pageTopAnchorName = 'PAGE_TOP_ANCHOR';
    //when refactoring getPageAnchors, this is the only line which should be changed:
    var getPageAnchors = page.getPageAnchors;

    function getAnchorData(id){
        return {type: 'Anchor', id: id, compId: id};
    }

    function createComp(id, y, isAnchor, children) {
        return testUtils.mockFactory.mockComponent(
            isAnchor ? 'AnchorComp' : 'NonAnchorComp',
            siteData,
            'mockPageId1',
            {data: isAnchor ? getAnchorData(id) : {type: 'NonAnchor', id: id, someStuff: 'bla bla'}},
            false,
            id,
            {layout: {y: y}, components: children, nickname: 'mockPageNickname1'}
        );
    }

    function createAnchorComp(n, y, children) {
        return createComp(n, y, true, children);
    }

    function createNonAnchorComp(n, y, children) {
        return createComp(n, y, false, children);
    }

    function getSortedAnchorsIdsFromFakeCompDataArray(components) {
        siteData.setPageComponents(components, 'mockPageId1');
        return _.pluck(getPageAnchors(mockPrivateServices, 'mockPageId1', pageTopAnchorName), 'compId');
    }

    function getSortedAnchorsIdsFromFakeCompDataArrayWithMobile(components, mobileComponents) {
        siteData.setPageComponents(components, 'mockPageId1');
        siteData.setPageComponents(mobileComponents, 'mockPageId1', true);
        return _.pluck(getPageAnchors(mockPrivateServices, 'mockPageId1', pageTopAnchorName), 'compId');
    }

    describe('getPageAnchors', function () {
        beforeEach(function () {
            siteData = testUtils.mockFactory.mockSiteData().addPageWithDefaults('mockPageId1');
            mockPrivateServices = privateServicesHelper.mockPrivateServicesWithRealDAL(siteData);
        });

        it('should get only PAGE_TOP_ANCHOR when no anchors', function(){
            var ids = getSortedAnchorsIdsFromFakeCompDataArray([]);

            expect(ids).toEqual(['PAGE_TOP_ANCHOR']);
        });

        it('should filter out non-anchor components sorted by comp layout y', function(){
            var ids = getSortedAnchorsIdsFromFakeCompDataArray([
                createAnchorComp('last', 99),
                createNonAnchorComp('not-anchor', 88),
                createAnchorComp('first', 11)
            ]);

            expect(ids).toEqual(['PAGE_TOP_ANCHOR', 'first', 'last']);
        });

        it('should use default location (top anchor) when component does not exist', function(){
            siteData.setPageComponents([createNonAnchorComp('not-anchor', 88), createAnchorComp('first', 11)], 'mockPageId1');
            siteData.addData(getAnchorData('non-existing'), 'mockPageId1');

            var sortedAnchorIds = _.pluck(getPageAnchors(mockPrivateServices, 'mockPageId1', pageTopAnchorName), 'compId');
            expect(sortedAnchorIds).toEqual(['non-existing', 'PAGE_TOP_ANCHOR', 'first']);
        });

        it('should use default location (top anchor) for non-direct children', function(){
            var ids = getSortedAnchorsIdsFromFakeCompDataArray([
                createAnchorComp('last', 99),
                createNonAnchorComp('not-anchor', 88, [createAnchorComp('non-direct', 55)]),
                createAnchorComp('first', 11)
            ]);

            expect(ids).toEqual(['non-direct', 'PAGE_TOP_ANCHOR', 'first', 'last']);
        });

        xit('should return anchors by desktop order even if mobile', function(){
            var desktopComps = [
                createAnchorComp('last', 99),
                createNonAnchorComp('not-anchor', 88),
                createAnchorComp('first', 11)
            ];

            var mobileComps = [
                createAnchorComp('last', 11),
                createNonAnchorComp('not-anchor', 88),
                createAnchorComp('first', 99)
            ];

            documentMode.setViewMode(mockPrivateServices, 'MOBILE');

            var ids = getSortedAnchorsIdsFromFakeCompDataArrayWithMobile(desktopComps, mobileComps);

            expect(ids).toEqual(['PAGE_TOP_ANCHOR', 'first', 'last']);
        });
    });
});
