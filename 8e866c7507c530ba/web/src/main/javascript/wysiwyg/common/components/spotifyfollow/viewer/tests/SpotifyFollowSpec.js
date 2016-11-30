describe('SpotifyFollow', function() {
    testRequire()
        .components('wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow')
        .classes('core.managers.components.ComponentBuilder')
        .resources('W.Data', 'W.ComponentLifecycle')
    ;

    function createComponent(){
        var that = this;
        this.componentLogic = null;
        this.mockData = this.W.Data.createDataItem({
            id: 'dummyData',
            type: 'SpotifyFollow',
            uri: 'spotify:artist:1vCWHaC5f2uS3yhpwWbIA6'
        });
        this.mockProps = this.W.Data.createDataItem({
            id: 'dummyProperties',
            type: 'SpotifyFollowProperties',
            size: 'large',
            theme: 'light',
            showFollowersCount: '1'
        });

        var builder = new this.ComponentBuilder(document.createElement('div'));
        builder
            .withType('wysiwyg.common.components.spotifyfollow.viewer.SpotifyFollow')
            .withSkin('wysiwyg.common.components.spotifyfollow.viewer.skins.SpotifyFollowSkin')
            .withData(this.mockData)
            .onWixified(function (component) {
                that.componentLogic = component;
                that.componentLogic.setComponentProperties(that.mockProps);
            })
            .create();
    }

    function setupComponentAndWaitForReady(){
        createComponent.call(this);

        waitsFor(function () {
            return this.componentLogic !== null;
        }, 'SpotifyFollow component to be ready', 1000);
    }

    describe('Component structure', function () {

        beforeEach(setupComponentAndWaitForReady);

        it('Skin parts should be defined', function () {
            expect(this.componentLogic._skinParts.iframe).toBeDefined();
        });

    });

    describe('Component functionality', function () {

        beforeEach(setupComponentAndWaitForReady);

        it('should ignore URI if empty', function () {
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            var expectedIframeUrl = 'https://embed.spotify.com/follow/1/?uri=spotify:artist:1vCWHaC5f2uS3yhpwWbIA6&size=detail&theme=light&show-count=1',
                calculatedIframeUrl;

            this.componentLogic._data.set('uri', '');
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            calculatedIframeUrl = this.componentLogic._skinParts.iframe.getAttribute('src');

            expect(calculatedIframeUrl).toBe(expectedIframeUrl);
        });

    });

    describe('Component layout & design', function(){

        beforeEach(setupComponentAndWaitForReady);

        it("should change iframe's theme to dark when theme property is changed to dark", function(){
            var expectedIframeUrl = 'https://embed.spotify.com/follow/1/?uri=spotify:artist:1vCWHaC5f2uS3yhpwWbIA6&size=detail&theme=dark&show-count=1',
                calculatedIframeUrl;

            this.componentLogic._properties.set('theme', 'dark');
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            calculatedIframeUrl = this.componentLogic._skinParts.iframe.getAttribute('src');

            expect(calculatedIframeUrl).toBe(expectedIframeUrl);
        });

        it("should set iframe's size to 156x25 when changing size property to small", function(){
            var expectedSize = {width: "156px", height: "25px"},
                calculatedSize;

            this.componentLogic._properties.set('size', 'small');
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            calculatedSize = {
                width: this.componentLogic._skinParts.iframe.getAttribute('width'),
                height: this.componentLogic._skinParts.iframe.getAttribute('height')
            };

            expect(calculatedSize).toEqual(expectedSize);
        });

        it("should hide iframe's counter when showFollowersCount property is disabled", function(){
            var expectedIframeUrl = 'https://embed.spotify.com/follow/1/?uri=spotify:artist:1vCWHaC5f2uS3yhpwWbIA6&size=detail&theme=light&show-count=0',
                calculatedIframeUrl;

            this.componentLogic._properties.set('showFollowersCount', false);
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            calculatedIframeUrl = this.componentLogic._skinParts.iframe.getAttribute('src');

            expect(calculatedIframeUrl).toBe(expectedIframeUrl);
        });

    });
});