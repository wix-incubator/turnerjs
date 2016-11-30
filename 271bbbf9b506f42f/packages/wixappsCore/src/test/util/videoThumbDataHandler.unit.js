define(["wixappsCore/util/videoThumbDataHandler", 'testUtils'], function (videoThumbDataHandler, testUtils) {
    "use strict";

    describe("handleVideoThumbUrls", function () {

        describe('negative test', function(){
            beforeEach(function(){
                this.emptyVideoPostItem = {"_type": "wix:Video", "videoId": "", "videoType": "", "thumbnail": ""};
                this.siteData = testUtils.mockFactory.mockSiteData();
                this.siteData.santaBase = '';

                this.ret = videoThumbDataHandler.handleVideoThumbUrls([{item: this.emptyVideoPostItem}], this.siteData);
            });
            it('should return video error', function(){
                var expectedJsonUrl = "/static/images/video/not-found.png";

                expect(this.emptyVideoPostItem.imageSrc).toEqual(expectedJsonUrl);
            });
            it('should return an empty requests array', function(){
                expect(this.ret).toEqual([]);
            });
        });
        describe('Youtube videos', function(){
            beforeEach(function(){
                this.youtubeVideoPostItem = {"_type": "wix:Video", "videoId": "nCs4gdt-mPY", "videoType": "YOUTUBE", "thumbnail": ""};
                this.siteData = testUtils.mockFactory.mockSiteData();
                this.siteData.santaBase = '';

                this.ret = videoThumbDataHandler.handleVideoThumbUrls([{item: this.youtubeVideoPostItem}], this.siteData);
            });
            it('should build the thumbnail url and set it to the item imageSrc property', function () {
                var youtubeExpectedValue = '//img.youtube.com/vi/nCs4gdt-mPY/0.jpg';

                expect(this.youtubeVideoPostItem.imageSrc).toEqual(youtubeExpectedValue);
            });
            it('should return an empty requests array', function(){
                expect(this.ret).toEqual([]);
            });
        });

        describe('Vimeo videos', function(){
            beforeEach(function(){
                this.videoId = "103425574";
                this.vimeoVideoPostItem = {"_type": "wix:Video", "videoId": this.videoId, "videoType": "VIMEO", "thumbnail": ""};

                this.ret = videoThumbDataHandler.handleVideoThumbUrls([{item: this.vimeoVideoPostItem, path: ''}], this.siteData);
            });
            it('should build the thumbnail json url and a jsonp request', function(){
                var expectedDestination = '';
                var expectedJsonUrl = "//vimeo.com/api/v2/video/" + this.videoId + ".json";

                expect(this.ret[0].destination).toEqual(expectedDestination);
                expect(this.ret[0].url).toEqual(expectedJsonUrl);
            });
            it('should set the thumbnail url from Vimeo to imageSrc property', function(){
                var expectedVideoThumbUrl = '//i.vimeocdn.com/video/485669355_640.jpg';
                var response = [{
                    'id': this.videoId,
                    'thumbnail_large': expectedVideoThumbUrl
                }];

                this.ret[0].transformFunc(response, this.vimeoVideoPostItem);

                expect(this.vimeoVideoPostItem.imageSrc).toEqual(expectedVideoThumbUrl);
            });
        });
    });
});
