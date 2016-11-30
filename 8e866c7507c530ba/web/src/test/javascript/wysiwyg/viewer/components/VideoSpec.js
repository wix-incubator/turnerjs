describe('Video', function() {

    testRequire().components('wysiwyg.viewer.components.Video');

    beforeEach(function() {
        this.videoLogic = new this.Video('video_id', new Element("video_node"));
    });

    describe('_getPlayerParamsAsQueryString', function(){
        it('should create a valid url query string from the playerParams object', function(){
            spyOn(this.videoLogic, 'getComponentProperty').andCallFake(function(key){return key;});

            this.videoLogic._options.videoType = "YOUTUBE";
            var expectedString = "wmode=transparent&theme=light&loop=1&playlist=&showinfo=1&rel=0";
            var _getPlayerParamsAsQueryString = this.videoLogic._getPlayerParamsAsQueryString();
            expect(_getPlayerParamsAsQueryString).toBe(expectedString);

            this.videoLogic._options.videoType = "VIMEO";
            expectedString = 'loop=loop&byline=showinfo&portrait=showinfo&title=showinfo';
            expect(this.videoLogic._getPlayerParamsAsQueryString()).toBe(expectedString);
        });
    });

});