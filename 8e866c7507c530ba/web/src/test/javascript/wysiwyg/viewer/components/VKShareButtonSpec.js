describe("VKShare", function () {

    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.VKShareButton')
        .resources('W.Data', 'W.ComponentLifecycle', 'W.Viewer');

    beforeEach(function () {
        this.vkButton = null;
        this.vkIframeId;

        var data = this.W.Data.createDataItem({
            type: 'VKShareButton',
            style: 'Button',
            rightAngles: true,
            text: 'blabla'
        });

        var builder = new this.ComponentBuilder(document.createElement('div'));
        builder.withType('wysiwyg.viewer.components.VKShareButton')
            .withSkin('mock.viewer.skins.VKShareButtonMockSkin')
            .withData(data)
            ._with("htmlId", "mockId")
            .onWixified(function (component) {
                this.vkButton = component;
                this.vkButton.setComponentProperties(data);
                this.vkIframeId = this.vkButton.getComponentUniqueId();
            }.bind(this))
            .create();

        waitsFor(function () {
            return this.vkButton;
        }, "VK Share Button to be ready", 1000);
    });

    describe('Acceptance Test', function () {
        it('should have a VK Share iframe in the DOM', function () {
            var iframe = this.vkButton._skinParts.iframe;

            expect(iframe).toBeDefined();
        });
    });

    describe('basic features', function () {
        it("should have the expected params in the iframe's url", function () {
            //Fix for WOH-3374: rightAngles was changed to 'rounded corners' so we send the iframe an opposite value
            var actualParamsString,
                fakeCurrentSiteUrl = 'http://some.fakeurl.com/mysite',
                expectedParamsString = 'id=' + this.vkIframeId + '&url=' + encodeURIComponent(fakeCurrentSiteUrl) + '&style=Button&text=blabla';
            spyOn(this.W.Viewer, 'isSiteReady').andReturn(true);
            spyOn(this.vkButton, '_getPageInfo').andReturn({ url: fakeCurrentSiteUrl });

            this.ComponentLifecycle["@testRenderNow"](this.vkButton);

            actualParamsString = this.vkButton._skinParts.iframe.getAttribute('src').split('?')[1];
            expect(actualParamsString).toBe(expectedParamsString);
        });

        //See additional tests in IT framework
    });
});
