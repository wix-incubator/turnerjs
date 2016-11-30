describe("WPhoto", function () {
    var photoId = 'test';

    testRequire()
        .classes('core.managers.components.ComponentBuilder')
        .components('wysiwyg.viewer.components.WPhoto', 'core.components.image.ImageNew')
        .resources('W.Data', 'W.ComponentLifecycle');

    var componentLogic,
        view,
        data,
        props,
        createComponentSpies = function () {
            spyOn(this.ImageNew.prototype, '_setImageSrc');
            spyOn(W.Layout, 'notifyPositionChanged');
        },
        createSkin = function () {
            this.define.skin('internal.skins.MockSkin', function (def) {
                def.inherits('core.managers.skin.BaseSkin2');
                def.skinParams([
                    {'id': 'txth', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_15'},
                    {'id': 'txt', 'type': Constants.SkinParamTypes.COLOR, 'defaultTheme': 'color_15'},
                    {'id': 'fnt', 'type': Constants.SkinParamTypes.FONT, 'defaultTheme': 'font_5'},

                    {'id': 'brw', 'type': Constants.SkinParamTypes.SIZE, 'defaultValue': '5px', 'noshow': true},
                    {'id': 'contentPaddingLeft', 'type': Constants.SkinParamTypes.SIZE, 'sumParams': ['brw'], 'usedInLogic': true},
                    {'id': 'contentPaddingRight', 'type': Constants.SkinParamTypes.SIZE, 'sumParams': ['brw'], 'usedInLogic': true},
                    {'id': 'contentPaddingBottom', 'type': Constants.SkinParamTypes.SIZE, 'sumParams': ['brw'], 'usedInLogic': true},
                    {'id': 'contentPaddingTop', 'type': Constants.SkinParamTypes.SIZE, 'sumParams': ['brw'], 'usedInLogic': true}
                ]);
                def.compParts({
                    'img': { skin: 'mock.viewer.skins.ImageNewMockSkin' }
                });
                def.html(
                        '<a skinPart="link">' +
                        '<div skinPart="img" skin="mobile.core.skins.ImageNewSkin"></div>' +
                        '</a>'
                );
            });
        },
        createComponent = function () {
            var element = new Element('div');
            element.__wixData = {
                'init':1
            };
            var builder = new this.ComponentBuilder(element);
            componentLogic = null;
            builder.withType('wysiwyg.viewer.components.WPhoto')
                .withSkin('internal.skins.MockSkin')
                .withData(data)
                ._with("htmlId", "mockId")
                .onWixified(function (component) {
                    componentLogic = component;
                    componentLogic.setComponentProperties(props);

                    componentLogic.setWidth(100);
                    componentLogic.setHeight(100);

                    this.setWidthSpy = spyOn(componentLogic, 'setWidth').andCallThrough();
                    this.setHeightSpy = spyOn(componentLogic, 'setHeight').andCallThrough();
                    this.setSettingsSpy = spyOn(componentLogic._skinParts.img, 'setSettings').andCallThrough();
                })
                .create();


            this.expect(componentLogic).not.toBeNull();
            view = componentLogic.getViewNode();
            this.expect(view).not.toBeNull();
            resetSpies();
        };


    beforeEach(function () {
        data = this.W.Data.createDataItem({
            "type": "Image",
            "uri": 'xxx',
            "title": '',
            "description": '',
            "width": '100',
            "height": '1000'
        });
        props = this.W.Data.createDataItem({
            'type': 'WPhotoProperties',
            'displayMode': 'fill'
        });

        createSkin.call(this);
        createComponentSpies.call(this);
        createComponent.call(this);
    });

    afterEach(function(){
        if(componentLogic){
            componentLogic.exterminate();
        }
    });

    function resetSpies() {
        window.setWidthSpy.reset();
        window.setHeightSpy.reset();
        window.setSettingsSpy.reset();
    }

    function testUpdateImageSettingOnly(componeentLogic) {
        expect(componeentLogic.setHeight).not.toHaveBeenCalled();
        expect(componeentLogic.setWidth).not.toHaveBeenCalled();
        expect(componeentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);
    }

    function testBothWidthAndHeightAreSet(componeentLogic, setMethod) {
        componeentLogic[setMethod](200);

        var rendered = false;
        componeentLogic.on(Constants.LifecycleSteps.RENDER, window, function(){
            rendered = true;
        });

        waitsFor(function () {
            return rendered;
        }, "WPhoto", 1000);

        runs(function () {
            expect(componeentLogic.setHeight).toHaveBeenCalledXTimes(1);
            expect(componeentLogic.setWidth).toHaveBeenCalledXTimes(1);
            expect(componeentLogic._skinParts.img.setSettings).toHaveBeenCalled();
        });
    }

    function testOnlyWidthIsSetOnWidthChange(componeentLogic) {
        componeentLogic.setWidth(200);
        expect(componeentLogic.setWidth).toHaveBeenCalledXTimes(1);
        expect(componeentLogic.setHeight).not.toHaveBeenCalled();
        expect(componeentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);
    }

    function testOnlyHeightIsSetOnHeightChange(componeentLogic) {
        componeentLogic.setHeight(200);
        expect(componeentLogic.setWidth).not.toHaveBeenCalled();
        expect(componeentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);
    }

    describe("data change", function () {
        it("should not update settings or size if crop mode isn't fit width/ height and image was changed", function () {
            var newData = W.ComponentData.createDataItem({ "type": "Image", "uri": 'yyy', "title": '', "description": '', "width": '1000', "height": '100' });
            componentLogic.setComponentProperty('displayMode', 'full');
            componentLogic.setDataItem(newData);

            this.ComponentLifecycle['@testRenderNow'](componentLogic);

            expect(componentLogic.setWidth).not.toHaveBeenCalled();
            expect(componentLogic.setHeight).not.toHaveBeenCalled();
            expect(componentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);
        });

        it("should update image settings, size and layout if mode is fit width and image was changed", function () {
            var newData = W.ComponentData.createDataItem({ "type": "Image", "uri": 'yyy', "title": '', "description": '', "width": '1000', "height": '100' });
            componentLogic.setComponentProperty('displayMode', 'fitWidthStrict');
            componentLogic.setDataItem(newData);

            this.ComponentLifecycle['@testRenderNow'](componentLogic);

            expect(componentLogic.setWidth).not.toHaveBeenCalled();
            expect(componentLogic.setHeight).toHaveBeenCalledXTimes(1);
            expect(componentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);

        });

        it("should update image settings, size and layout if mode is fit height and image was changed", function () {
            var newData = W.ComponentData.createDataItem({ "type": "Image", "uri": 'yyy', "title": '', "description": '', "width": '1000', "height": '100' });
            componentLogic.setComponentProperty('displayMode', 'fitHeightStrict');
            componentLogic.setDataItem(newData);

            this.ComponentLifecycle['@testRenderNow'](componentLogic);

            expect(componentLogic.setHeight).not.toHaveBeenCalled();
            expect(componentLogic.setWidth).toHaveBeenCalledXTimes(1);
            expect(componentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);

        });

        it("should not update image setting or size if other data was changed", function () {
            componentLogic.getDataItem().set('title', 'ttttt');

            expect(componentLogic.setWidth).not.toHaveBeenCalled();
            expect(componentLogic.setHeight).not.toHaveBeenCalled();
            expect(componentLogic._skinParts.img.setSettings).not.toHaveBeenCalled();
        });
    });

    describe('change crop mode', function () {

        it("should update only height when change mode to fitWidth", function () {
            var newData = W.ComponentData.createDataItem({ "type": "Image", "uri": 'yyy', "title": '', "description": '', "width": '1000', "height": '100' });
            componentLogic.setComponentProperty('displayMode', 'fitWidthStrict');
            componentLogic.setDataItem(newData);

            this.ComponentLifecycle['@testRenderNow'](componentLogic);

            expect(componentLogic.setHeight).toHaveBeenCalledXTimes(1);
            expect(componentLogic.setWidth).not.toHaveBeenCalled();
            expect(componentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);

        });

        it("update only image settings when changing mode to contains/full", function () {
            componentLogic.setComponentProperty('displayMode', 'full');

            this.ComponentLifecycle['@testRenderNow'](componentLogic);

            testUpdateImageSettingOnly(componentLogic);
        });

        it("update only image settings when changing mode to stretch", function () {
            componentLogic.setComponentProperty('displayMode', 'stretch');

            this.ComponentLifecycle['@testRenderNow'](componentLogic);

            testUpdateImageSettingOnly(componentLogic);
        });
    });

    describe("change size", function () {
        beforeEach(function(){
            getPlayGround().adopt(componentLogic.$view);
        });
        afterEach(function(){
            clearPlayGround();
        });

        it("should change height according to width if mode is fitWidth (strict)", function () {
            componentLogic.setComponentProperty('displayMode', 'fitWidthStrict');

            testBothWidthAndHeightAreSet(componentLogic, 'setWidth');
        });

        it("should change width according to height if mode is fitHeight (strict)", function () {
            componentLogic.setComponentProperty('displayMode', 'fitHeightStrict');

            testBothWidthAndHeightAreSet(componentLogic, 'setHeight');
        });

        it("should change height according to width if mode is fitWidth (not strict)", function () {
            componentLogic.setComponentProperty('displayMode', 'fitWidth');

            testBothWidthAndHeightAreSet(componentLogic, 'setWidth');
        });

        it("should not do anything if width is changed and mode is fitHeight (strict)", function () {
            componentLogic.setComponentProperty('displayMode', 'fitHeightStrict');
            componentLogic.setWidth(200);

            expect(componentLogic.setWidth).toHaveBeenCalledXTimes(1);
            expect(componentLogic.setHeight).not.toHaveBeenCalled();
            expect(componentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);
        });

        it("should not do anything if height is changed and mode is fitWidth (strict)", function () {
            componentLogic.setComponentProperty('displayMode', 'fitWidthStrict');
            componentLogic.setHeight(200);

            expect(componentLogic.setHeight).toHaveBeenCalledXTimes(1);
            expect(componentLogic.setWidth).not.toHaveBeenCalled();
            expect(componentLogic._skinParts.img.setSettings).toHaveBeenCalledXTimes(1);
        });


        xit("should change width according to height if mode is fitWidth (not strict)", function () {
            componentLogic.setComponentProperty('displayMode', 'fitWidth');

            testBothWidthAndHeightAreSet(componentLogic, 'setHeight');
        });

        it("should change width after change height", function () {
            componentLogic.setComponentProperty('displayMode', 'fitWidth');
            componentLogic.setWidth(200);

            var flag = true;
            setTimeout(function () {
                flag = false;
            }.bind(this), 500);
            waitsFor(function () {
                return !flag;
            }, "WPhoto", 1000);

            runs(function () {
                expect(componentLogic.setHeight).toHaveBeenCalledXTimes(1);
                expect(componentLogic.setWidth).toHaveBeenCalledXTimes(1);
            });
        });

        xit("should change only width when width is set if mode is fill", function () {
            componentLogic.setComponentProperty('displayMode', 'fill');

            testOnlyWidthIsSetOnWidthChange(componentLogic);
        });

        it("should change only height when height is set if mode is fill", function () {
            componentLogic.setComponentProperty('displayMode', 'fill');

            testOnlyHeightIsSetOnHeightChange(componentLogic);
        });

        it("should change only width when width is set if mode is stretch", function () {
            componentLogic.setComponentProperty('displayMode', 'stretch');

            testOnlyWidthIsSetOnWidthChange(componentLogic);
        });

        it("should change only height when height is set if mode is stretch", function () {
            componentLogic.setComponentProperty('displayMode', 'stretch');

            testOnlyHeightIsSetOnHeightChange(componentLogic);
        });

        it("should change only width when width is set if mode is full", function () {
            componentLogic.setComponentProperty('displayMode', 'full');

            testOnlyWidthIsSetOnWidthChange(componentLogic);
        });

        it("should change only height when height is set if mode is full", function () {
            componentLogic.setComponentProperty('displayMode', 'full');

            testOnlyHeightIsSetOnHeightChange(componentLogic);
        });

    });

    describe("touch state", function () {
        var modernizrTouch;

        beforeEach(function () {
            modernizrTouch = Modernizr.touch;
        });

        afterEach(function () {
            Modernizr.touch = modernizrTouch;
        });

        it("should set hasTouch state if touch is detected", function () {
            Modernizr.touch = true;
            this.ComponentLifecycle['@testRenderNow'](componentLogic);

            expect(componentLogic.getState('touch')).toBe('hasTouch');
        });

        it("should set noTouch state if touch is not supported", function () {
            Modernizr.touch = false;
            this.ComponentLifecycle['@testRenderNow'](componentLogic);

            expect(componentLogic.getState('touch')).toBe('noTouch');
        });
    });
});

