describe('FlashComponentSpec', function () {
    testRequire()
        .components('wysiwyg.viewer.components.FlashComponent')
        .classes('core.managers.components.ComponentBuilder')
        .resources('W.Data', 'W.ComponentLifecycle')
    ;

//     window.serviceTopology.staticMediaUrl = '//static.wixstatic.com/media';

    function createComponent() {
        var that = this;
        this.componentLogic = null;
        this.mockData = this.W.Data.createDataItem({type: 'LinkableFlashComponent', uri: "6d059d_48a6b19b8f01422da8bc6b61eb0cff32.swf", height: 90, width: 500});

        var builder = new this.ComponentBuilder(document.createElement('div'));
        builder
            .withType('wysiwyg.viewer.components.FlashComponent')
            .withSkin('mock.viewer.skins.FlashComponentMockSkin')
            .withData(this.mockData)
            .onWixified(function (component) {
                that.componentLogic = component;
//                 that.componentLogic.data = component.getDataItem();
            })
            .create();
    }

    beforeEach(function () {
        createComponent.call(this);

//        waitsFor(function () {
//            return this.componentLogic !== null;
//        }, 'SecureFlashComponent component to be ready', 1000);
    });

    describe('Component structure', function () {
        it('Skin parts should be defined', function () {
            expect(this.componentLogic._skinParts.flashContainer).toBeDefined();
            expect(this.componentLogic._skinParts.link).toBeDefined();
            expect(this.componentLogic._skinParts.mouseEventCatcher).toBeDefined();
            expect(this.componentLogic._skinParts.noFlashImg).toBeDefined();
            expect(this.componentLogic._skinParts.noFlashImgContainer).toBeDefined();
            expect(this.componentLogic._skinParts.view).toBeDefined();
        });
    });

    describe('allowscriptaccess test', function () {
        it('allowscriptaccess should be never', function () {
            var currentAccessLevel = this.componentLogic._getFlashScriptAccess();
            expect(currentAccessLevel).toBe("never");
        });

    });

});
