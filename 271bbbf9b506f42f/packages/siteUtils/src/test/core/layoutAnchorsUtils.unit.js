define(['lodash', 'testUtils', 'siteUtils/core/layoutAnchorsUtils'], function (_, testUtils, /** layoutAnchorsUtils */layoutAnchorsUtils) {
    'use strict';

    describe('layout anchors utils', function () {
        beforeEach(function () {
            this.siteData = testUtils.mockFactory.mockSiteData();
            var compInPage = testUtils.mockFactory.createCompStructure('wysiwyg.viewer.components.SiteButton');
            _.set(compInPage, 'layout.anchors', []);
            this.siteData.pagesData.currentPage.structure.components = [compInPage];
            this.siteData.pagesData.currentPage.structure.mobileComponents = [compInPage];
        });

        describe('shouldCreateAnchorsForPage', function () {
            describe('when in public viewer', function () {
                beforeEach(function () {
                    window.publicModel = true;
                });

                afterEach(function () {
                    window.publicModel = null;
                });

                describe('when viewerGeneratedAnchors is open', function () {
                    beforeEach(function () {
                        testUtils.experimentHelper.openExperiments('viewerGeneratedAnchors');
                    });

                    it('should return false if page texts are not packed', function () {
                        var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(this.siteData.pagesData.currentPage.structure, false, true);

                        expect(result).toBeFalsy();
                    });

                    it('should return true if page texts are packed', function () {
                        var displayedPageStructure = this.siteData.pagesData.currentPage.structure;
                        displayedPageStructure.isPagePackedDesktop = true;

                        var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(this.siteData.pagesData.currentPage.structure, false, true);

                        expect(result).toEqual(true);
                    });

                    it('should return false if page is not marked to ignoreBottomBottomAnchors', function () {
                        var displayedPageStructure = this.siteData.pagesData.currentPage.structure;
                        displayedPageStructure.isPagePackedDesktop = true;

                        var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(this.siteData.pagesData.currentPage.structure, false, false);

                        expect(result).toEqual(false);
                    });

                    it('should return false if in mobile and page texts in mobile are not packed', function () {
                        var displayedPageStructure = this.siteData.pagesData.currentPage.structure;
                        displayedPageStructure.isPagePackedDesktop = true;

                        var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(displayedPageStructure, true, true);

                        expect(result).toBeFalsy();
                    });

                    it('should return true, if no json anchors, but pages are not marked to ignoreBottomBottomAnchors', function () {
                        var displayedPageStructure = this.siteData.pagesData.currentPage.structure;
                        displayedPageStructure.isPagePackedDesktop = true;
                        this.siteData.pagesData.currentPage.structure.components[0].layout.anchors = undefined;

                        var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(this.siteData.pagesData.currentPage.structure, false, false);

                        expect(result).toEqual(true);
                    });

                    it('should return true, if no compsInPage, but pages are not marked to ignoreBottomBottomAnchors', function () {
                        var displayedPageStructure = this.siteData.pagesData.currentPage.structure;
                        displayedPageStructure.isPagePackedDesktop = true;
                        this.siteData.pagesData.currentPage.structure.components = [];

                        var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(this.siteData.pagesData.currentPage.structure, false, false);

                        expect(result).toEqual(true);
                    });
                });

                describe('when viewerGeneratedAnchors is closed', function () {
                    it('should return false', function () {
                        var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(this.siteData.pagesData.currentPage.structure, false, true);

                        expect(result).toBeFalsy();
                    });
                });
            });

            describe('when not in public viewer', function () {
                beforeEach(function () {
                    window.publicModel = null;
                    testUtils.experimentHelper.openExperiments('viewerGeneratedAnchors');
                });

                it('should return true if components in the page no longer have json anchors property in layout', function () {
                    var compInPage = {
                        id: 'someChild',
                        layout: {
                            x: 10,
                            y: 20
                        }
                    };
                    this.siteData.setPageComponents([compInPage], 'currentPage');

                    var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(this.siteData.pagesData.currentPage.structure, false, true);

                    expect(result).toEqual(true);
                });

                it('should return false if components in the page still have json anchors, even if the anchors array is empty', function () {
                    var compInPage = {
                        id: 'someChild',
                        layout: {
                            x: 10,
                            y: 20,
                            anchors: []
                        }
                    };
                    this.siteData.setPageComponents([compInPage], 'currentPage');

                    var result = layoutAnchorsUtils.shouldCreateAnchorsForPage(this.siteData.pagesData.currentPage.structure, false, true);

                    expect(result).toBeFalsy();
                });
            });
        });
    });
});
