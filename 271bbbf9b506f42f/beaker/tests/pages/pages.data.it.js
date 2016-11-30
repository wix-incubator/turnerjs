define(['lodash', 'santa-harness', 'apiCoverageUtils'], function (_, santa, apiCoverageUtils) {

    "use strict";
    describe('Document Services - Pages - Data', function () {

        let documentServices;
        let focusedPage, pageId;
        let pagesData;

        beforeAll(done => {
            santa.start().then(harness => {
                documentServices = harness.documentServices;
                pagesData = documentServices.pages.data;
                focusedPage = documentServices.pages.getFocusedPage();
                pageId = focusedPage.id;
                console.log('Testing pages data spec');
                done();
            });
        });

        describe('get', () => {
            it('should return valid data for existing page', () => {
                const pageData = pagesData.get(pageId);
                expect(_.isPlainObject(pageData)).toBeTruthy();
            });

            it('should return undefined for non existing page', () => {
                const pageData = pagesData.get('not-a-page');
                expect(pageData).toBeUndefined();
            });

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.data.get');
            });
        });

        describe('update', () => {
            it('should update data', done => {
                const hideTitle = pagesData.get(pageId).hideTitle;
                pagesData.update(pageId, {hideTitle: !hideTitle});
                documentServices.waitForChangesApplied(() => {
                    expect(pagesData.get(pageId).hideTitle).not.toEqual(hideTitle);
                    //TODO: Clone the data and make sure it's the same
                    //TODO: Make sure deep assignment works
                    done();
                });
            });

            afterAll(function () {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.data.update');
            });
        });

        describe('pageUriSEO', () => {
            describe('convertPageNameToUrl', () => {
                it('should return a URL-friendly version of the page name', ()=> {
                    const actual = pagesData.pageUriSEO.convertPageNameToUrl('Main Straße');
                    expect(actual).toBe('main-strasse');
                    apiCoverageUtils.checkFunctionAsTested('documentServices.pages.data.pageUriSEO.convertPageNameToUrl');
                });
            });

            describe('getValid', () => {
                it('should add a suffix if trying to use an existing page URI seo', done => {
                    const newPage = documentServices.pages.duplicate(pageId);
                    documentServices.waitForChangesApplied(() => {
                        const existingPageUriSEO = pagesData.get(pageId).pageUriSEO;
                        const actual = pagesData.pageUriSEO.getValid(newPage.id, existingPageUriSEO);
                        expect(_.startsWith(actual, existingPageUriSEO)).toBeTruthy();
                        expect(actual).not.toEqual(existingPageUriSEO);
                        apiCoverageUtils.checkFunctionAsTested('documentServices.pages.data.pageUriSEO.getValid');
                        done();
                    });
                });
            });
        });
    });
});
