describe("ItunesButton", function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.ItunesButton')
        .resources('W.Data', 'W.ComponentLifecycle');

    beforeEach(function () {
        this.componentLogic = null;

        var data = this.W.Data.createDataItem({
            type: 'ItunesButton',
            downloadUrl: 'https://itunes.apple.com/us/album/born-this-way/id438732291?uo=4'
        }),
        builder = new this.ComponentBuilder(document.createElement('div'));

        builder
            .withType('wysiwyg.viewer.components.ItunesButton')
            .withSkin('mock.viewer.skins.ItunesButtonSkin')
            .withData(data)
            ._with("htmlId", "mockId")
            .onWixified(function (component) {
                this.componentLogic = component;
                this.componentLogic.data = component.getDataItem();
                this.componentLogic.properties = component.getComponentProperties();
            }.bind(this))
            .create();

//        waitsFor(function () {
//
//            return this.componentLogic;
//        }, "Itunes Button to be ready", 1000);


          //A simpler way to initialize a component (without data & skin, only the functions)
//        var viewNode = document.createElement('div');
//        var compId = 'itunesButtonId';
//        this.componentLogic = new this.ItunesButton(compId, viewNode);
    });

    describe('tests for the components structure', function () {
        it('should have a download button element (DIV)', function () {
            expect(this.componentLogic._skinParts.downloadButton).toBeDefined();
        });

        it('should have an image element', function () {
            expect(this.componentLogic._skinParts.itunesImg).toBeDefined();
        });
    });

    describe('tests for component behavior', function () {
        it('should display an image according to the given language', function () {
            this.componentLogic.properties.setFields({'language': 'fr'});  //Change the default language
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

            var itunesImg = this.componentLogic._skinParts.itunesImg;
            var imageUrl = itunesImg.getAttribute('src');
            var langCode = this.componentLogic.properties.get('language');
            var expectedImageUrlSuffix = '_' + langCode.toUpperCase() + '.';  //Server saves data in lowercase, image file name is in uppercase

            expect(imageUrl).toContain(expectedImageUrlSuffix);
        });

        it('should open the download page in a new window (tab) when the target prop is _blank (New window)', function () {
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

            var downloadUrl = this.componentLogic.data.get('downloadUrl');
            spyOn(this.componentLogic, '_navigateInNewTab');

            this.componentLogic._skinParts.downloadButton.click();

            expect(this.componentLogic._navigateInNewTab).toHaveBeenCalledWith(downloadUrl);
        });

        it('should open the download page in the same window when the target prop is _self (Same window)', function () {
            var downloadUrl = this.componentLogic.data.get('downloadUrl');
            var openInProp = 'Same window';

            this.componentLogic.properties.setFields({'openIn': openInProp});
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
            spyOn(this.componentLogic, '_navigateInSameWindow');

            this.componentLogic._skinParts.downloadButton.click();

            expect(this.componentLogic._navigateInSameWindow).toHaveBeenCalledWith(downloadUrl);
        });

        it('should NOT allow click if URL was not provided', function () {
            var callCount = 0;
            this.componentLogic.data.setFields({'downloadUrl': ''});
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

            spyOn(this.componentLogic, '_navigateInNewTab');
            spyOn(this.componentLogic, '_navigateInSameWindow');

            this.componentLogic._skinParts.downloadButton.click();

            callCount = this.componentLogic._navigateInSameWindow.callCount + this.componentLogic._navigateInNewTab.callCount;
            expect(callCount).toBe(0);
        });

        it('should bind click event once', function () {
            var openInProp = 'Same window';
            var callCount=0;

            this.componentLogic.properties.setFields({'openIn': openInProp});
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

            spyOn(this.componentLogic, '_navigateInNewTab');
            spyOn(this.componentLogic, '_navigateInSameWindow');

            this.componentLogic._skinParts.downloadButton.click();

            callCount = this.componentLogic._navigateInSameWindow.callCount + this.componentLogic._navigateInNewTab.callCount;
            expect(callCount).toBe(1);
        });
    });
});
