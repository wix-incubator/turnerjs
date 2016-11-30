describe('VideoPanel', function() {

    var videoType;

    testRequire().
        resources('W.Utils').
        components('wysiwyg.editor.components.panels.VideoPanel');


    beforeEach(function() {
       this.videoPanelLogic = new this.VideoPanel('videoPanel_id', new Element("videoPanel_node"));
    });

    describe('URL Parsing and Validation Methods', function(){
        describe('_videoUrlValidationMessage', function(){
            it('should return false if the url is valid', function(){
                spyOn(this.W.Utils, 'isValidUrl').andReturn(true);
                spyOn(this.videoPanelLogic, '_getYoutubeId').andReturn(true);
                expect(this.videoPanelLogic._videoUrlValidationMessage()).toBeFalsy();
            });

            it('should return an error message if the url is invalid', function(){
                spyOn(this.W.Utils, 'isValidUrl').andReturn(false);
                spyOn(this.videoPanelLogic, '_getYoutubeId').andReturn(true);
                spyOn(this.videoPanelLogic, '_getVideoType').andCallFake(function(key){return key;});
                expect(this.videoPanelLogic._videoUrlValidationMessage()).toBeOfType('string');
            });

            it('should return an error message if the url is not a youtube url', function(){
                spyOn(this.W.Utils, 'isValidUrl').andReturn(true);
                spyOn(this.videoPanelLogic, '_getYoutubeId').andReturn(false);
                expect(this.videoPanelLogic._videoUrlValidationMessage()).toBeOfType('string');
            });
        });

        describe('_getYoutubeId', function(){
            it('should extract an id from a valid long youtube url', function(){

                var url1 = 'http://youtube.com/watch/?v=valid_youtube_id_1';
                var url2 = 'youtube.com/watch?v=valid_youtube_id_2';
                var url3 = 'http://youtube.com/watch?x=some_attr&v=valid_youtube_id_3';
                var url4 = 'http://youtube.com/watch?v=valid_youtube_id_4&x=some_attr';

                expect(this.videoPanelLogic._getYoutubeId(url1)).toBe('valid_youtube_id_1');
                expect(this.videoPanelLogic._getYoutubeId(url2)).toBe('valid_youtube_id_2');
                expect(this.videoPanelLogic._getYoutubeId(url3)).toBe('valid_youtube_id_3');
                expect(this.videoPanelLogic._getYoutubeId(url4)).toBe('valid_youtube_id_4');
            });

            it('should extract an id from a valid short youtube url', function(){
                var url1 = 'http://youtu.be/valid_youtube_id_1';
                var url2 = 'youtu.be/valid_youtube_id_2';
                var url3 = 'http://youtu.be/valid_youtube_id_3&x=some_attr';

                expect(this.videoPanelLogic._getYoutubeId(url1)).toBe('valid_youtube_id_1');
                expect(this.videoPanelLogic._getYoutubeId(url2)).toBe('valid_youtube_id_2');
                expect(this.videoPanelLogic._getYoutubeId(url3)).toBe('valid_youtube_id_3');
            });

            it('should extract an id from a valid vimeo url', function(){
                var url1 = 'http://www.vimeo.com/111111';
                var url2 = 'http://vimeo.com/222222';
                var url3 = 'vimeo.com/333333';
                var url4 = 'www.vimeo.com/444444';

                expect(this.videoPanelLogic._getVimeoId(url1)).toBe('111111');
                expect(this.videoPanelLogic._getVimeoId(url2)).toBe('222222');
                expect(this.videoPanelLogic._getVimeoId(url3)).toBe('333333');
                expect(this.videoPanelLogic._getVimeoId(url4)).toBe('444444');
            });

            it('should fail on extracting an id from a malformed vimeo url', function(){
                var url1 = 'http://www.vimeo.com/111a11';
                var url2 = 'http://vimeo.com/222222a';
                var url3 = 'vimeo.com/?param=param&param2=param2';
                var url4 = 'www.vimeo.com/444444&v=3';

                expect(this.videoPanelLogic._getVimeoId(url1)).toBe('');
                expect(this.videoPanelLogic._getVimeoId(url2)).toBe('');
                expect(this.videoPanelLogic._getVimeoId(url3)).toBe('');
                expect(this.videoPanelLogic._getVimeoId(url4)).toBe('');
            });

            it('should fail on extracting an id from a malformed youtube url', function(){
                var url1 = 'http://youtube.com/watch/valid_youtube_id_1';
                var url2 = 'http://youtube.com?v=valid_youtube_id_2';
                var url3 = 'http://youtube.com/watch?x=some attr with blanks&v=valid_youtube_id_3';
                var url4 = 'http://youtube.com/watch?x=valid_youtube_id_4';

                expect(this.videoPanelLogic._getYoutubeId(url1)).toBe('');
                expect(this.videoPanelLogic._getYoutubeId(url2)).toBe('');
                expect(this.videoPanelLogic._getYoutubeId(url3)).toBe('');
                expect(this.videoPanelLogic._getYoutubeId(url4)).toBe('');
            });

            it('should fail on extracting an id from non youtube url', function(){
                var url1 = 'http://google.com/watch/?v=valid_youtube_id_1';
                var url2 = 'foo.bar?v=valid_youtube_id_2';
                var url3 = 'valid_youtube_id_3';

                expect(this.videoPanelLogic._getYoutubeId(url1)).toBe('');
                expect(this.videoPanelLogic._getYoutubeId(url2)).toBe('');
                expect(this.videoPanelLogic._getYoutubeId(url3)).toBe('');
            });
        });

        describe('Data Transformation Functions (bindHooks)', function(){

            it('should transform a short url to id and back and get the same value', function(){
                videoType = "YOUTUBE"
                var videoUrl = 'http://youtu.be/valid_youtube_id';
                var idAndType = {videoId:"", videoType:""};
                var transformedUrl = "";

                idAndType = this.videoPanelLogic._getVideoDataFromVideoUrl(videoUrl);
                expect(idAndType.videoId).toBe("valid_youtube_id");
                expect(idAndType.videoType).toBe("YOUTUBE");

                transformedUrl = this.videoPanelLogic._getVideoUrlFromVideoData(idAndType);
                expect(transformedUrl).toBe(videoUrl);

                idAndType = this.videoPanelLogic._getVideoDataFromVideoUrl(videoUrl);
                expect(idAndType.videoId).toBe("valid_youtube_id");
                expect(idAndType.videoType).toBe("YOUTUBE");

                videoType = "VIMEO"
                videoUrl = 'http://vimeo.com/123456';

                idAndType = this.videoPanelLogic._getVideoDataFromVideoUrl(videoUrl);
                expect(idAndType.videoId).toBe("123456");
                expect(idAndType.videoType).toBe("VIMEO");

                transformedUrl = this.videoPanelLogic._getVideoUrlFromVideoData(idAndType);
                expect(transformedUrl).toBe(videoUrl);

                idAndType = this.videoPanelLogic._getVideoDataFromVideoUrl(videoUrl);
                expect(idAndType.videoId).toBe("123456");
                expect(idAndType.videoType).toBe("VIMEO");
            });
        });
    });
});