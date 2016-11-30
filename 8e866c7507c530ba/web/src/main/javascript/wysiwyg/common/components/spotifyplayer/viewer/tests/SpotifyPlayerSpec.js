describe('SpotifyPlayer Component', function() {
	testRequire()
        .classes('core.managers.components.ComponentBuilder', 'core.components.base.InvalidationCollector')
        .components('wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer')
        .resources('W.Data', 'W.ComponentLifecycle');

    function createComponent(){
        var that = this;
        this.componentLogic = null;
        this.mockData = this.W.Data.createDataItem({type: 'SpotifyPlayer', uri: 'xxx'});
        this.mockProps = this.W.Data.createDataItem({type: 'SpotifyPlayerProperties', size: 'compact', color: 'black', style: 'list'});

        var builder = new this.ComponentBuilder(document.createElement('div'));
        builder
            .withType('wysiwyg.common.components.spotifyplayer.viewer.SpotifyPlayer')
            .withSkin('wysiwyg.common.components.spotifyplayer.viewer.skins.SpotifyPlayerSkin')
            .withData(this.mockData)
            .onWixified(function (component) {
                that.componentLogic = component;
                that.componentLogic.setComponentProperties(that.mockProps);
                that.componentLogic.data = component.getDataItem();
                that.componentLogic.properties = component.getComponentProperties();
            })
            .create();
    }

    beforeEach(function (){
        createComponent.call(this);

        waitsFor(function () {
            return this.componentLogic !== null;
        }, 'SpotifyPlayer component to be ready', 1000);
    });

    describe('Component structure', function () {
        it('Skin parts should be defined', function () {
            expect(this.componentLogic._skinParts.iframe).toBeDefined();
        });
    });

    describe('Component functionality', function () {

        describe('New component (without uri data)', function () {
            it('Placeholder image it displayed', function () {
                this.componentLogic.data.setFields({'uri': ''});

                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

                var placeholderImgIsDisplayed = !this.componentLogic._skinParts.placeholder.hasClass('hidden');
                expect(placeholderImgIsDisplayed).toBe(true);
            });

            it('Player iframe it NOT displayed', function () {
                this.componentLogic.data.setFields({'uri': ''});

                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

                var iframeIsDisplayed = !this.componentLogic._skinParts.iframe.hasClass('hidden');
                expect(iframeIsDisplayed).toBe(false);
            });
        });

        describe('Test size limits', function () {
            it('Compact mode size limits are set', function () {
                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
                var actualSizeLimits = this.componentLogic._sizeLimits;
                var expectedSizeLimits = { minW: 250, minH: 80, maxW: 640, maxH: 80 };

                expect(JSON.stringify(actualSizeLimits)).toEqual(JSON.stringify(expectedSizeLimits));
            });

            it('Large mode size limits are set', function () {
                spyOn(this.componentLogic, '_setSizeLimits').andCallThrough();
                this.componentLogic.properties.setFields({'size': 'large'});
                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

                var actualSizeLimits = this.componentLogic._sizeLimits;
                var expectedSizeLimits = { minW: 250, minH: 330, maxW: 640, maxH: 720 };

                expect(JSON.stringify(actualSizeLimits)).toEqual(JSON.stringify(expectedSizeLimits));
            });
        });

        describe('Test _calculateHeight', function () {
            it('_calculateHeight returns correct value in default compact size mode', function () {
                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
                var givenWidth = 250;
                var expectedHeight = 80;
                var actualHeigthCalculation = this.componentLogic._calculateHeight(givenWidth);

                expect(actualHeigthCalculation).toBe(expectedHeight);
            });

            it('_calculateHeight returns correct value in custom compact size mode', function () {
                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
                var givenWidth = 600;
                var expectedHeight = 80;
                var actualHeigthCalculation = this.componentLogic._calculateHeight(givenWidth);

                expect(actualHeigthCalculation).toBe(expectedHeight);
            });

            it('_calculateHeight returns correct value in default large size mode', function () {
                var givenWidth = 250;
                var expectedHeight = 330;
                this.componentLogic.properties.setFields({'size': 'large'});
                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

                var actualHeigthCalculation = this.componentLogic._calculateHeight(givenWidth);

                expect(actualHeigthCalculation).toBe(expectedHeight);
            });

            it('_calculateHeight returns correct value in custom large size mode', function () {
                var givenWidth = 600;
                var expectedHeight = 680;
                this.componentLogic.properties.setFields({'size': 'large'});
                this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

                var actualHeigthCalculation = this.componentLogic._calculateHeight(givenWidth);

                expect(actualHeigthCalculation).toBe(expectedHeight);
            });
        });

        it('Iframe URL is build correctly', function () {
            this.componentLogic.data.setFields({'uri': 'xxx'});
            this.componentLogic.properties.setFields({'color': 'white'});
            this.componentLogic.properties.setFields({'style': 'coverart'});
            var expectedURL = 'https://embed.spotify.com/?uri=xxx&theme=white&view=coverart';

            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            var actualURL = this.componentLogic._skinParts.iframe.getAttribute('src');

            expect(actualURL).toEqual(expectedURL);
        });

        it('_setIframeSize sets the size of the iframe and refreshes it', function () {
            var expectedIframeWidth = 300;
            var expectedIframeHeight = 380;

            spyOn(this.componentLogic, 'getWidth').andReturn(expectedIframeWidth);
            spyOn(this.componentLogic, '_calculateHeight').andReturn(expectedIframeHeight);
            spyOn(this.componentLogic, '_refreshIframe').andReturn();

            this.componentLogic._setIframeSize();
            var actualIframeWidth = +this.componentLogic._skinParts.iframe.getAttribute('width');
            var actualIframeHeight = +this.componentLogic._skinParts.iframe.getAttribute('height');

            expect(actualIframeWidth).toBe(expectedIframeWidth);
            expect(actualIframeHeight).toBe(expectedIframeHeight);
            expect(this.componentLogic._refreshIframe).toHaveBeenCalledXTimes(1);
        });
    });
});