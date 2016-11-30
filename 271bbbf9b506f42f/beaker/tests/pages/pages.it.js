define(['lodash', 'santa-harness', 'errorUtils', 'apiCoverageUtils', 'generalUtils'],
    function(_, santa, errorUtils, apiCoverageUtils, generalUtils) {
    'use strict';

    describe('Document Services - Pages', function() {

        var documentServices;

        beforeEach(function(done) {
            santa.start().then(function (harness) {
                documentServices = harness.documentServices;
                console.log('Testing pages spec');
                done();
            });
        });

        describe('add', function() {

            afterAll(function() {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.add');
            });

            it('should add a page with a given title', function(done) {
                var newPageTitle = 'newPageTitle';

                var newPagePointer = documentServices.pages.add(newPageTitle);

                documentServices.waitForChangesApplied(function() {
                    var newPage = generalUtils.getPageDataById(documentServices, newPagePointer.id);

                    expect(newPage).toBeDefined();
                    expect(newPage.title).toEqual(newPageTitle);
                    expect(newPage.pageUriSEO).toMatch(/blank.*/);
                    done();
                });
            });

            it('should add a page with properties from given serialized page data', function(done) {
                var newPageTitle = 'newPageTitle';
                var pageUriSEO = 'newpageuriseo';
                var pageType = 'Page';
                var serializedPage = {
                    type: pageType,
                    data: {
                        type: pageType,
                        title: newPageTitle,
                        pageUriSEO: pageUriSEO
                    }
                };

                var newPagePointer = documentServices.pages.add(null, serializedPage);

                documentServices.waitForChangesApplied(function() {
                    var newPage = generalUtils.getPageDataById(documentServices, newPagePointer.id);

                    expect(newPage).toBeDefined();
                    expect(newPage.type).toEqual(pageType);
                    expect(newPage.title).toEqual(serializedPage.data.title);
                    expect(newPage.pageUriSEO).toEqual(serializedPage.data.pageUriSEO);
                    done();
                });
            });

        });

        describe('remove', function() {

            afterAll(function() {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.remove');
            });

            it('should remove a page', function(done) {
                var newPageTitle = 'newPageTitle';

                var newPagePointer = documentServices.pages.add(newPageTitle);
                documentServices.pages.remove(newPagePointer.id);

                documentServices.waitForChangesApplied(function() {
                    var newPage = generalUtils.getPageDataById(documentServices, newPagePointer.id);
                    expect(newPage).not.toBeDefined();
                    done();
                });
            });

            it('should call the complete callback after the page was remove', function(done) {
                var newPageTitle = 'newPageTitle';

                var newPagePointer = documentServices.pages.add(newPageTitle);
                documentServices.pages.remove(newPagePointer.id, function() {
                    var newPage = generalUtils.getPageDataById(documentServices, newPagePointer.id);
                    expect(newPage).not.toBeDefined();
                    done();
                });
            });

            it('should throw in error when trying to remove a non existing page', function(done) {
                errorUtils.waitForError(documentServices, done);

                documentServices.pages.remove('someNonExistingPageId');
            });

        });

        describe('duplicate', function() {

            afterAll(function() {
                apiCoverageUtils.checkFunctionAsTested('documentServices.pages.duplicate');
            });

            it('should duplicate a page', function(done) {
                var currentPagePointer = documentServices.pages.getFocusedPage();
                var currentPage = generalUtils.getPageDataById(documentServices, currentPagePointer.id);

                var duplicatedPagePointer = documentServices.pages.duplicate(currentPagePointer.id);

                documentServices.waitForChangesApplied(function() {
                    var duplicatedPage = generalUtils.getPageDataById(documentServices, duplicatedPagePointer.id);
                    expect(duplicatedPage).toBeDefined();
                    expect(_.startsWith(duplicatedPage.pageUriSEO, currentPage.pageUriSEO + '-')).toBe(true);
                    done();
                });
            });

        });

        describe('navigateTo', function() {




        });

    });

});
