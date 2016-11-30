define(['santa-harness', 'apiCoverageUtils'], function (santa, apiCoverageUtils) {
    'use strict';

    describe("Document Services - Site Segments", function () {

        var documentServices;

        beforeAll(function (done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing site segments spec');
                done();
            });
        });

        describe('getFooter', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.siteSegments.getFooter');
            });

            it('Should successfully retrieve footer pointer', function () {
                var footer = documentServices.siteSegments.getFooter();
                var compType = documentServices.components.getType(footer);
                expect(compType).toEqual("wysiwyg.viewer.components.FooterContainer");
                expect(documentServices.components.isShowOnAllPages(footer)).toBeTruthy();
            });
        });

        describe('getHeader', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.siteSegments.getHeader');
            });

            it('Should successfully retrieve header pointer', function () {
                var header = documentServices.siteSegments.getHeader();
                var compType = documentServices.components.getType(header);
                expect(compType).toEqual("wysiwyg.viewer.components.HeaderContainer");
                expect(documentServices.components.isShowOnAllPages(header)).toBeTruthy();
            });
        });

        describe('getPagesContainer', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.siteSegments.getPagesContainer');
            });

            it('Should successfully retrieve pages container pointer', function () {
                var pagesContainer = documentServices.siteSegments.getPagesContainer();
                var compType = documentServices.components.getType(pagesContainer);
                expect(compType).toEqual("wysiwyg.viewer.components.PagesContainer");
                expect(documentServices.components.isShowOnAllPages(pagesContainer)).toBeTruthy();
            });
        });

        describe('getSiteStructure', function () {

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.siteSegments.getSiteStructure');
            });

            it('Should successfully retrieve site structure pointer', function () {
                var masterPage = documentServices.siteSegments.getSiteStructure();
                var compType = documentServices.components.getType(masterPage);
                expect(masterPage.id).toEqual(documentServices.pages.getMasterPageId());
                expect(compType).toEqual("wysiwyg.viewer.components.WSiteStructure");
            });
        });
    });
});
