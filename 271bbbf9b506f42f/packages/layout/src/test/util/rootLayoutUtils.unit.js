define([
    'lodash',
    'layout/util/rootLayoutUtils'
], function (
    _,
    rootLayoutUtils
) {
    'use strict';

    describe('rootLayoutUtils', function () {
        var PAGE_WIDTH = 980,
            SCREEN_WIDTH = 1920,
            SCROLL_BAR_WIDTH = 20,
            POPUPS_ROOT_WIDTH = SCREEN_WIDTH - SCROLL_BAR_WIDTH,
            POPUP_WIDTH = 630,
            siteData,
            measureMap;

        beforeEach(function () {
            measureMap = {
                width: {
                    screen: SCREEN_WIDTH,
                    ROOT_pageId: PAGE_WIDTH,
                    ROOT_popupId: POPUP_WIDTH
                },
                left: {
                    ROOT_pageId: (PAGE_WIDTH - SCREEN_WIDTH) / 2,
                    ROOT_popupId: (POPUP_WIDTH - POPUPS_ROOT_WIDTH) / 2
                }
            };

            siteData = {
                isMobileView: _.constant(false),
                isMobileDevice: _.constant(false),
                getScreenWidth: _.constant(SCREEN_WIDTH),
                getSiteWidth: _.constant(PAGE_WIDTH),
                getSiteX: _.constant((SCREEN_WIDTH - PAGE_WIDTH) / 2)
            };
        });

        describe('when rootId is a page id', function () {
            var rootId = 'pageId';

            it('returns page width in .getRootWidth(siteData, measureMap, rootId)', function () {
                var result = rootLayoutUtils.getRootWidth(siteData, measureMap, rootId);
                expect(result).toBe(PAGE_WIDTH);
            });

            it('returns -dx in .getRootLeft(siteData, measureMap, rootId)', function () {
                var result = rootLayoutUtils.getRootLeft(siteData, measureMap, rootId);
                expect(result).toBe(0.5 * (PAGE_WIDTH - SCREEN_WIDTH));
            });
        });

        describe('when rootId is a popupId id', function () {
            var rootId = 'popupId';

            it('returns page width in .getRootWidth(siteData, measureMap, rootId)', function () {
                var result = rootLayoutUtils.getRootWidth(siteData, measureMap, rootId);
                expect(result).toBe(POPUP_WIDTH);
            });

            it('returns -dx in .getRootLeft(siteData, measureMap, rootId)', function () {
                var result = rootLayoutUtils.getRootLeft(siteData, measureMap, rootId);
                expect(result).toBe(0.5 * (POPUP_WIDTH - POPUPS_ROOT_WIDTH));
            });
        });

        describe('when rootId is masterPage or unknown one', function () {
            var rootId = 'masterPage';

            it('returns page width in .getRootWidth(siteData, measureMap, rootId)', function () {
                var result = rootLayoutUtils.getRootWidth(siteData, measureMap, rootId);
                expect(result).toBe(PAGE_WIDTH);
            });

            it('returns -dx in .getRootLeft(siteData, measureMap, rootId)', function () {
                var result = rootLayoutUtils.getRootLeft(siteData, measureMap, rootId);
                expect(result).toBe(0.5 * (PAGE_WIDTH - SCREEN_WIDTH));
            });
        });
    });
});
