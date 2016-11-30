define(['lodash', 'testUtils', 'wixappsCore/proxies/areaProxy', 'components'], function (_, /** testUtils */testUtils) {
    'use strict';

    describe('Video Thumbnail proxy', function () {
        beforeEach(function () {
            this.viewDef = {
                "comp": {
                    "name": "VideoThumb",
                    "imageMode": "fill",
                    "style": "wp2"
                }
            };
            this.data = {
                "_type": "wix:Video",
                "videoId": "zMrNAljWWMQ",
                "videoType": "YOUTUBE",
                "thumbnail": ""
            };
        });

        describe('YOUTUBE', function () {
            beforeEach(function () {
                this.data.videoId = "zMrNAljWWMQ";
                this.data.videoType = "YOUTUBE";
                this.data.imageSrc = "http://img.youtube.com/vi/zMrNAljWWMQ/0.jpg";

                var props = testUtils.proxyPropsBuilder(this.viewDef, this.data);
                var proxy = testUtils.proxyBuilder('VideoThumb', props);
                this.component = proxy.refs.component;
            });
            it('should create a photo with a valid youtube url', function () {
                var expectedUrl = 'http://img.youtube.com/vi/zMrNAljWWMQ/0.jpg';
                expect(this.component.props.compData.uri).toEqual(expectedUrl);
            });
        });
        describe('VIMEO', function () {
            beforeEach(function () {
                this.data.videoId = "71716158";
                this.data.videoType = "VIMEO";
                this.data.imageSrc = "http://i.vimeocdn.com/video/445369611_640.jpg";

                var props = testUtils.proxyPropsBuilder(this.viewDef, this.data);
                this.proxy = testUtils.proxyBuilder('VideoThumb', props);
                this.component = this.proxy.refs.component;
            });
            it('should create a photo with a valid vimeo url', function () {
                var expectedUrl = 'http://i.vimeocdn.com/video/445369611_640.jpg';

                expect(this.component.props.compData.uri).toEqual(expectedUrl);
            });
        });
    });
});
