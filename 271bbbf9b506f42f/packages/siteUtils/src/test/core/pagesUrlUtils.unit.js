define(['lodash', 'testUtils', 'coreUtils', 'siteUtils/core/pagesUrlUtils'], function (_, testUtils, coreUtils, pagesUrlUtils) {
    "use strict";

    describe('pagesUrlUtils', function () {
        describe('getMapFromPageUriSeoToPageId', function () {
            beforeEach(function() {
               this.mockSiteModel = {
                   publicModel: {
                       pageList: {
                           pages: [
                               {pageUriSEO: 'one', pageId: 'page1'},
                               {pageUriSEO: 'two', pageId: 'page2'}
                           ]
                       }
                   }
               };
            });

            it('should return an empty map for object that has no pageList', function () {
                var siteModel = {publicModel: {}};
                expect(pagesUrlUtils.getMapFromPageUriSeoToPageId(siteModel)).toEqual({});
            });

            it('should get an inverted map of pageUriSEO to pageIds', function () {
                var expected = {
                    one: 'page1',
                    two: 'page2'
                };
                expect(pagesUrlUtils.getMapFromPageUriSeoToPageId(this.mockSiteModel)).toEqual(expected);
            });

            it('should receive overrides from urlFormatModel', function () {
                _.set(this.mockSiteModel, ['urlFormatModel', 'pageIdToResolvedUriSEO', 'page1', 'curr'], 'juan');
                var expected = {
                    juan: 'page1',
                    two: 'page2'
                };
                expect(pagesUrlUtils.getMapFromPageUriSeoToPageId(this.mockSiteModel)).toEqual(expected);
            });

            it('should resolve as untitled for pages with no pageUriSEO or override', function() {
                this.mockSiteModel.publicModel.pageList.pages.push({pageId: 'page3'});
                var expected = {
                    one: 'page1',
                    two: 'page2'
                };
                expected[coreUtils.siteConstants.DEFAULT_PAGE_URI_SEO] = 'page3';
                expect(pagesUrlUtils.getMapFromPageUriSeoToPageId(this.mockSiteModel)).toEqual(expected);
            });
        });

        describe('ensureUrlFormatModel', function () {
            it('should create an empty urlFormatModel if one does not exist', function () {
                var siteModel = {};
                pagesUrlUtils.ensureUrlFormatModel(siteModel);
                expect(siteModel.urlFormatModel).toEqual({
                    format: coreUtils.siteConstants.URL_FORMATS.HASH_BANG,
                    forbiddenPageUriSEOs: {},
                    pageIdToResolvedUriSEO: {}
                });
            });

            it('should convert the forbiddenPageUriSEOs to a map', function () {
                var siteModel = {
                    urlFormatModel: {
                        forbiddenPageUriSEOs: ['app']
                    }
                };
                pagesUrlUtils.ensureUrlFormatModel(siteModel);
                expect(siteModel.urlFormatModel).toEqual({
                    format: coreUtils.siteConstants.URL_FORMATS.HASH_BANG,
                    forbiddenPageUriSEOs: {app: true},
                    pageIdToResolvedUriSEO: {}
                });
            });

            it('should retain the pageIdToResolvedUriSEO map and format', function () {
                var siteModel = {
                    urlFormatModel: {
                        format: coreUtils.siteConstants.URL_FORMATS.SLASH,
                        pageIdToResolvedUriSEO: {
                            page1: {
                                prev: 'app',
                                curr: 'app-page1'
                            }
                        },
                        forbiddenPageUriSEOs: ['app']
                    }
                };
                pagesUrlUtils.ensureUrlFormatModel(siteModel);
                expect(siteModel.urlFormatModel).toEqual({
                    format: coreUtils.siteConstants.URL_FORMATS.SLASH,
                    forbiddenPageUriSEOs: {app: true},
                    pageIdToResolvedUriSEO: {
                        page1: {
                            prev: 'app',
                            curr: 'app-page1'
                        }
                    }
                });
            });

            it('should override url format to slash if urlFormat experiment is open', function () {
                testUtils.experimentHelper.openExperiments('urlFormat');
                var siteModel = {
                    urlFormatModel: {
                        format: coreUtils.siteConstants.URL_FORMATS.HASH_BANG
                    }
                };
                pagesUrlUtils.ensureUrlFormatModel(siteModel);
                expect(siteModel.urlFormatModel.format).toBe(coreUtils.siteConstants.URL_FORMATS.SLASH);
            });
        });
    });
});

