describe("SoundCloudWidget", function() {
    beforeEach(function(){
        this.isComplete = false;
        this.logic = null;
        this.widget = (W.Components).createComponent("wysiwyg.viewer.components.SoundCloudWidget",
                                                "wysiwyg.viewer.skins.IFrameComponentSkin",

                                                 W.Data.createDataItem({
                                                        type:'SoundCloudWidget',
                                                        embedCode:"prd",
                                                        showArtWork:false
                                                    }),
                                                    undefined,
                                                null,
                                                function(logic) {
                                                    this.isComplete = true;
                                                    this.logic = logic;
                                                }.bind(this));
        waitsFor(function() {
            return this.isComplete;
        }.bind(this),
        'SoundCloudWidget component creation',
        1000);
    });

    it("_getUrl() should correctly add showArtWork to the url (test with showArtWork=false)", function() {
        this.logic._data.set("url", 'http://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/31675263');
        this.logic._data.set("showArtWork", false);
        expect(this.logic._getSoundCloudUrl() ).toBe("http://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/31675263&show_artwork=false&auto_play=false");
    });

    it("_getUrl() should correctly add showArtWork to the url (test with showArtWork=true)", function() {
        this.logic._data.set("url", 'http://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/31675263');
        this.logic._data.set("showArtWork", true);
        expect(this.logic._getSoundCloudUrl() ).toBe("http://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/31675263&show_artwork=true&auto_play=false");
    });

//    it("_getUrl() should return empty string if url is not set", function() {
//        expect(this.logic._getUrl() ).toBe("");
//    });

});