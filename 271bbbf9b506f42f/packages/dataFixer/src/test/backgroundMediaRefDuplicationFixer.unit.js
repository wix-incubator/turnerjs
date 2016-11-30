define(['lodash', 'testUtils', 'dataFixer/plugins/backgroundMediaRefDuplicationFixer'], function (_, testUtils, backgroundMediaRefDuplicationFixer) {
    'use strict';

    describe('background MediaRef Duplication Fixer', function () {

        var exec = backgroundMediaRefDuplicationFixer.exec;


        function createPageWithBlankBackground(id, siteData) {
            siteData.addPageWithDefaults(id);
            var page = siteData.getData(id);
            siteData.setCurrentPage(id);
            siteData.addData(page, id);
            var desktopBg = siteData.mock.backgroundMediaDataNoImage(null, true);
            var mobileBg = siteData.mock.backgroundMediaDataNoImage(null, true);

            page.pageBackgrounds.desktop.ref = '#' + desktopBg.id;
            page.pageBackgrounds.mobile.ref = '#' + mobileBg.id;
        }

        function createPageWithBackgroundImage(id, siteData) {
            siteData.addPageWithDefaults(id);
            var page = siteData.getData(id);
            siteData.setCurrentPage(id);
            siteData.addData(page, id);
            var desktopBg = siteData.mock.backgroundMediaDataWithImage(null, true);
            var mobileBg = siteData.mock.backgroundMediaDataWithImage(null, true);

            page.pageBackgrounds.desktop.ref = '#' + desktopBg.id;
            page.pageBackgrounds.mobile.ref = '#' + mobileBg.id;
        }

        function createPageWithBackgroundVideo(id, siteData) {
            siteData.addPageWithDefaults(id);
            var page = siteData.getData(id);
            siteData.setCurrentPage(id);
            siteData.addData(page, id);

            var desktopBg = siteData.mock.backgroundMediaDataWithVideo(null, true);
            var mobileBg = siteData.mock.backgroundMediaDataWithVideo(null, true);
            page.pageBackgrounds.desktop.ref = '#' + desktopBg.id;
            page.pageBackgrounds.mobile.ref = '#' + mobileBg.id;

        }


        beforeEach(function() {
            this.siteData = testUtils.mockFactory.mockSiteData();
        });

        it("should do nothing if page has no background", function () {
            var pageId = 'page1';
            createPageWithBlankBackground(pageId, this.siteData);
            var page = this.siteData.getData(pageId);
            var clonedPage = _.cloneDeep(page);
            exec(this.siteData.pagesData.page1);
            expect(this.siteData.getData(pageId)).toEqual(clonedPage);
        });


        it("should set the mediaRef of page background with a value prefix format [pageId_type_refKey]", function () {
            var pageId = 'page1';

            createPageWithBackgroundImage(pageId, this.siteData);

            var page = this.siteData.getData(pageId);
            var bgDesktop = this.siteData.getData(page.pageBackgrounds.desktop.ref, pageId);
            var bgMobile = this.siteData.getData(page.pageBackgrounds.mobile.ref, pageId);
            var bgDesktopImg = this.siteData.getData(bgDesktop.mediaRef, pageId);
            var bgMobileImg = this.siteData.getData(bgMobile.mediaRef, pageId);

            expect(bgDesktop.mediaRef.indexOf(pageId)).toEqual(-1);
            expect(bgMobile.mediaRef.indexOf(pageId)).toEqual(-1);

            exec(this.siteData.pagesData[pageId]);
            bgDesktopImg = this.siteData.getData(bgDesktop.mediaRef, pageId);
            bgMobileImg = this.siteData.getData(bgMobile.mediaRef, pageId);

            expect(bgDesktop.mediaRef.indexOf('#' + pageId + '_desktop_mediaRef')).toEqual(0);
            expect(bgMobile.mediaRef.indexOf('#' + pageId + '_mobile_mediaRef')).toEqual(0);

            expect(bgDesktopImg.id.indexOf(pageId + '_desktop_mediaRef')).toEqual(0);
            expect(bgMobileImg.id.indexOf(pageId + '_mobile_mediaRef')).toEqual(0);

        });


        it("should set  posterImageRef, imageOverlay of page background video with a value prefix format [pageId_type_refKey]", function () {
            var pageId = 'page1';

            createPageWithBackgroundVideo(pageId, this.siteData);

            var page = this.siteData.getData(pageId);
            var bgDesktop = this.siteData.getData(page.pageBackgrounds.desktop.ref, pageId);

            var videoItem = this.siteData.getData(bgDesktop.mediaRef.replace('#', ''), pageId);


            expect(bgDesktop.mediaRef.indexOf(pageId)).toEqual(-1);
            expect(bgDesktop.imageOverlay.indexOf(pageId)).toEqual(-1);
            expect(videoItem.posterImageRef.indexOf(pageId)).toEqual(-1);

            exec(this.siteData.pagesData[pageId]);

            videoItem = this.siteData.getData(bgDesktop.mediaRef.replace('#', ''), pageId);
            var posterImg = this.siteData.getData(videoItem.posterImageRef, pageId);
            var overlayImg = this.siteData.getData(bgDesktop.imageOverlay, pageId);

            expect(bgDesktop.imageOverlay.indexOf('#' + pageId + '_desktop_imageOverlay')).toEqual(0);
            expect(overlayImg.id.indexOf(pageId + '_desktop_imageOverlay')).toEqual(0);

            expect(bgDesktop.mediaRef.indexOf('#' + pageId + '_desktop_mediaRef')).toEqual(0);
            expect(videoItem.id.indexOf(pageId + '_desktop_mediaRef')).toEqual(0);

            expect(videoItem.posterImageRef.indexOf('#' + pageId + '_desktop_posterImageRef')).toEqual(0);
            expect(posterImg.id.indexOf(pageId + '_desktop_posterImageRef')).toEqual(0);

        });





    });


});

