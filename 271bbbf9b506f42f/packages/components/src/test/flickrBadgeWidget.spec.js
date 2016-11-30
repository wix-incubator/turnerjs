define(['testUtils', 'utils', 'components/components/flickrBadgeWidget/flickrBadgeWidget'], function (testUtils, utils, flickrBadgeWidget) {
    'use strict';

    describe('Flickr Badge Widget Component', function () {

        var createFlickrBadgeWidgetComponent = function (width, height, imageCount, whichImages, imageSize, layoutOrientation, userId, tag) {
            var props = testUtils.mockFactory.mockProps().setCompData({
                imageCount: imageCount || 5,
                whichImages: whichImages || 'random',
                imageSize: imageSize || 's',
                layoutOrientation: layoutOrientation || 'h',
                userId: userId || 'mockUserId',
                tag: tag || 'tag'
            }).setNodeStyle({
                width: width || 100,
                height: height || 100
            });
            props.siteData.santaBase = 'mockSantaBase';
            props.structure.componentType = 'wysiwyg.viewer.components.FlickrBadgeWidget';

            return testUtils.getComponentFromDefinition(flickrBadgeWidget, props);
        };

        describe('Test the iframe', function () {

            beforeEach(function () {
                this.getIframe = function (widget) {
                    return widget.getSkinProperties().iframe;
                };

                this.getIframeSrc = function (widget) {
                    return this.getIframe(widget).src;
                };

                this.getIframeSize = function (widget) {
                    var iframe = this.getIframe(widget);
                    return {width: iframe.width, height: iframe.height};
                };
            });

            it('should return correct iframe src', function () {
                var fbw = createFlickrBadgeWidgetComponent(100, 100, 5, 'random', 's', 'h', 'mockUserId', 'tag'),
                    expectedSrc = 'mockSantaBase/static/external/flickrBadgeWidget.html?compId=' + fbw.props.id + '&imageCount=5&imageSize=s&layoutOrientation=h&origin=' + encodeURIComponent(utils.urlUtils.origin()) + '&tag=tag&userId=mockUserId&whichImages=random',
                    calculatedSrc = this.getIframeSrc(fbw);

                expect(calculatedSrc).toBe(expectedSrc);
            });

            it('should return correct width and height', function(){
                var fbw = createFlickrBadgeWidgetComponent(100, 100),
                    expectedSize = {width: 100, height: 100},
                    calculatedSize = this.getIframeSize(fbw);

                expect(calculatedSize).toEqual(expectedSize);

            });


        });

        describe('Test the overlayClick', function () {

            beforeEach(function () {
                this.overlayClickHref = function (widget) {
                    return widget.getSkinProperties().overlayClick.href;
                };
            });

            it('should return correct href', function () {
                var fbw = createFlickrBadgeWidgetComponent(100, 100, 5, 'random', 's', 'h', 'mockUserId', 'tag'),
                    expectedHref = 'http://www.flickr.com/photos/mockUserId/',
                    calculatedHref = this.overlayClickHref(fbw);

                expect(calculatedHref).toBe(expectedHref);
            });


        });

    });
});
