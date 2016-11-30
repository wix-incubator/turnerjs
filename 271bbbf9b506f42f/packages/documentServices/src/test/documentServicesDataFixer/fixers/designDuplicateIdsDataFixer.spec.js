define([
    'lodash',
    'testUtils',
    'documentServices/mockPrivateServices/privateServicesHelper',
    'documentServices/documentServicesDataFixer/fixers/designDuplicateIdsDataFixer'
], function(_, testUtils, privateServicesHelper, designDuplicateIdsDataFixer) {

    'use strict';

    describe('designDuplicateIdsDataFixer', function () {

        function addPageToSiteData(mockSiteData, pageId, pageDesignItems) {
            var page = mockSiteData.addPageWithDefaults(pageId, []);
            _.forEach(pageDesignItems, function(designItem) {
                page.addDesign(designItem, pageId);
            });
        }

        function createPagesDesignData() {
            var page1 = createPageDesignData('page1');
            var page2 = createPageDesignData('page2');
            var page3 = createPageDesignData('page3');
            return [page1, page2, page3];
        }

        function createPageDesignData(pageId) {
            return {
                id: pageId,
                designData: [createDesignDataWithRef(pageId),
                            createReferencedDesignData(),
                            createUniqueDesignData(pageId)]
            };
        }

        function createReferencedDesignData() {
            return {
                id: 'DUPLICATED-REFERRED-ID',
                alias: 'common-ref',
                mediaRef: null,
                imageOverlay: null,
                key1: 'que1',
                key2: 'que2',
                type: 'BackgroundMedia'
            };
        }

        function createDesignDataWithRef(pageId) {
            return {
                id: 'parent-design-' + pageId,
                alias: 'common',
                key1: 'bar1',
                key2: 'bar2',
                background: '#DUPLICATED-REFERRED-ID',
                type: 'MediaContainerDesignData'
            };
        }

        function createUniqueDesignData(pageId) {
            return {
                id: 'unique-design-id-on-page-' + pageId,
                alias: 'uncommon',
                key1: 'foo1',
                key2: 'foo2',
                posterImageRef: null,
                type: 'WixVideo'
            };
        }

        beforeEach(function() {
            var mockSiteData = testUtils.mockFactory.mockSiteData({}, true);
            var pages = createPagesDesignData();
            _.forEach(pages, function(page) {
                addPageToSiteData(mockSiteData, page.id, page.designData);
            });
            this.ps = privateServicesHelper.mockPrivateServicesWithRealDAL(mockSiteData);
        });


        describe('when a site has more than one page with design data items', function() {
            describe('when different design data items in different pages have same reference values/ids', function() {
                it('should leave no copy of the DUPLICATED-REFERRED-ID design item, all duplicated Ids should be changed', function() {
                    var page1DesignPointer = this.ps.pointers.page.getPageDesignData('page1');

                    designDuplicateIdsDataFixer.exec(this.ps);

                    var page1DesignData = createPageDesignData('page1').designData;
                    expect(this.ps.dal.full.get(page1DesignPointer)['parent-design-page1']).toEqual(_.assign({}, page1DesignData[0], {background: jasmine.any(String)}));
                    var backgroundRef = this.ps.dal.full.get(page1DesignPointer)['parent-design-page1'].background;
                    expect(backgroundRef).not.toEqual(page1DesignData[0].background);
                    expect(this.ps.dal.full.get(page1DesignPointer)[backgroundRef.replace('#', '')]).toBeDefined();
                    expect(this.ps.dal.full.get(page1DesignPointer)['unique-design-id-on-page-page1']).toEqual(page1DesignData[2]);
                    expect(this.ps.dal.full.get(page1DesignPointer)['DUPLICATED-REFERRED-ID']).not.toBeDefined();

                    var page2DesignPointer = this.ps.pointers.page.getPageDesignData('page2');
                    expect(this.ps.dal.full.get(page2DesignPointer)['DUPLICATED-REFERRED-ID']).not.toBeDefined();

                    var page3DesignPointer = this.ps.pointers.page.getPageDesignData('page3');
                    expect(this.ps.dal.full.get(page3DesignPointer)['DUPLICATED-REFERRED-ID']).not.toBeDefined();
                });

                it('should fix duplicated referenced design items recursively, so there will be no design items in the site with same ids', function() {
                    var page2DesignPointer = this.ps.pointers.page.getPageDesignData('page2');
                    var page3DesignPointer = this.ps.pointers.page.getPageDesignData('page3');

                    designDuplicateIdsDataFixer.exec(this.ps);

                    _.forEach([page2DesignPointer, page3DesignPointer], function(pageDesignPointer) {
                        var fixedParentDesignItemInPage = _.first(_.filter(this.ps.dal.full.get(pageDesignPointer), 'alias', 'common'));
                        expect(fixedParentDesignItemInPage.background).not.toEqual('#DUPLICATED-REFERRED-ID');
                        expect(fixedParentDesignItemInPage).toEqual({
                            id: jasmine.any(String),
                            background: jasmine.any(String),
                            alias: 'common',
                            key1: 'bar1',
                            key2: 'bar2',
                            type: 'MediaContainerDesignData'
                        });

                        var fixedDuplicatedReference = fixedParentDesignItemInPage.background.replace('#', '');
                        expect(this.ps.dal.full.get(pageDesignPointer)[fixedDuplicatedReference]).toEqual({
                            id: fixedDuplicatedReference,
                            alias: 'common-ref',
                            key1: 'que1',
                            key2: 'que2',
                            mediaRef: null,
                            imageOverlay: null,
                            type: 'BackgroundMedia'
                        });
                    }, this);
                });

                it('should leave unique design items untouched', function() {
                    designDuplicateIdsDataFixer.exec(this.ps);

                    var page1DesignPointer = this.ps.pointers.page.getPageDesignData('page1');
                    var page1UniqueDesignItem = createUniqueDesignData('page1');
                    expect(this.ps.dal.full.get(page1DesignPointer)[page1UniqueDesignItem.id]).toEqual(page1UniqueDesignItem);

                    var page2DesignPointer = this.ps.pointers.page.getPageDesignData('page2');
                    var page2UniqueDesignItem = createUniqueDesignData('page2');
                    expect(this.ps.dal.full.get(page2DesignPointer)[page2UniqueDesignItem.id]).toEqual(page2UniqueDesignItem);

                    var page3DesignPointer = this.ps.pointers.page.getPageDesignData('page3');
                    var page3UniqueDesignItem = createUniqueDesignData('page3');
                    expect(this.ps.dal.full.get(page3DesignPointer)[page3UniqueDesignItem.id]).toEqual(page3UniqueDesignItem);
                });
            });
        });
    });
});
