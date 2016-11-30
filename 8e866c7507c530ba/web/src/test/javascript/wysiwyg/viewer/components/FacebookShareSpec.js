describe("FacebookShare", function () {
    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.FacebookShare')
        .resources('W.Utils', 'W.Viewer', 'W.Data', 'W.ComponentLifecycle');

    beforeEach(function () {
        this.componentLogic = null;

        var data = this.W.Data.createDataItem({
                type: 'FacebookShareButton',
                urlChoice: 'Site Url',
                label: 'something something'
            }),
            builder = new this.ComponentBuilder(document.createElement('div'));

        builder
            .withType('wysiwyg.viewer.components.FacebookShare')
            .withSkin('mock.viewer.skins.FacebookShareSkin')
            .withData(data)
            ._with("htmlId", "mockId")
            .onWixified(function (component) {
                this.componentLogic = component;
            }.bind(this))
            .create();

        waitsFor(function () {
            return this.componentLogic;
        }, "Facebook share to be ready", 1000);
    });

    describe('tests for the components structure', function () {
        it('should contain exactly one DIV tag', function () {
            expect(this.componentLogic._skinParts.facebookShareButton.getElementsByTagName('DIV').length).toBe(1);
        });
        it('should contain exactly one child element', function () {
            expect(this.componentLogic._skinParts.facebookShareButton.children.length).toBe(1);
        });
    });

    describe('tests for components dataSchema', function () {
        it('the component should have the same text that was set in the Data', function () {
            var description = 'description for this test',
                actualDescription;

            this.componentLogic.getDataItem().setFields({label: description});

            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);

            actualDescription = this.componentLogic.$view.textContent;
            expect(actualDescription).toEqual(description);
        });
    });

    describe('tests for component behavior', function () {
        beforeEach(function(){
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
        });
        it('should open the share window in a new window', function () {

            spyOn(this.Utils, 'openPopupWindow');

            this.componentLogic._skinParts.facebookShareButton.click();

            expect(this.Utils.openPopupWindow).toHaveBeenCalled();
        });

        it('should call openPopupWindow with a url argument', function () {
            var actualUrl;
            spyOn(this.Utils, 'openPopupWindow').andCallFake(function (url, name, params) {
                actualUrl = url;
            });

            this.componentLogic._skinParts.facebookShareButton.click();

            expect(actualUrl).toBeDefined();
        });

        it('should call openPopupWindow with a name argument', function () {
            var actualName;
            spyOn(this.Utils, 'openPopupWindow').andCallFake(function (url, name, params) {
                actualName = name;
            });

            this.componentLogic._skinParts.facebookShareButton.click();

            expect(actualName).toBeDefined();
        });

        it('should call openPopupWindow with correct params argument', function () {
            var actualParams;
            spyOn(this.Utils, 'openPopupWindow').andCallFake(function (url, name, params) {
                actualParams = params;
            });

            this.componentLogic._skinParts.facebookShareButton.click();

            expect(actualParams).toBe('width=635,height=346,scrollbars=no,status=no,toolbar=no,menubar=no,location=no');
        });

        // fails on testicle (error 404)
        xit('should call _getUrlToBeShared when the button is clicked', function () {
            spyOn(this.componentLogic, '_getUrlToBeShared');

            this.componentLogic._skinParts.facebookShareButton.click();

            expect(this.componentLogic._getUrlToBeShared).toHaveBeenCalled();
        });
    });
});