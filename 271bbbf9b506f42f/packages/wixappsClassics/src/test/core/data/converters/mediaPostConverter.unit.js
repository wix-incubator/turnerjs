define([
    'wixappsClassics/core/data/converters/mediaPostConverter',
    'utils'
], function (
    mediaPostConverter,
    utils
) {
    'use strict';

    describe('mediaPostConverter', function () {
        describe('fixMasterPageIdInLinksInside', function () {
            it('should replace page ID "#SITE_STRUCTURE" with master page ID in text', function () {
                var post = {
                    text: {
                        links: [{
                            pageId: '#SITE_STRUCTURE'
                        }]
                    }
                };

                mediaPostConverter.fixMasterPageIdInLinksInside(post);

                expect(post).toEqual({
                    text: {
                        links: [{
                            pageId: utils.siteConstants.MASTER_PAGE_ID
                        }]
                    }
                });
            });

            it('should replace page ID "#SITE_STRUCTURE" with master page ID in media text', function () {
                var post = {
                    mediaText: {
                        links: [{
                            pageId: '#SITE_STRUCTURE'
                        }]
                    }
                };

                mediaPostConverter.fixMasterPageIdInLinksInside(post);

                expect(post).toEqual({
                    mediaText: {
                        links: [{
                            pageId: utils.siteConstants.MASTER_PAGE_ID
                        }]
                    }
                });
            });
        });
    });
});
