describe('ImageButton', function() {
    testRequire().
        classes('core.managers.components.ComponentBuilder').
        components('wysiwyg.common.components.imagebutton.viewer.ImageButton').
        resources('W.Data', 'W.ComponentLifecycle', 'W.ComponentData');

    function createComponent() {
        var that = this,
            manager = this.W.Data;

        manager.addDataItems({
            'dataLink':         { type: 'ExternalLink' },
            'dataDefaultImage': { type: "Image" },
            'dataHoverImage':   { type: "Image" },
            'dataActiveImage':  { type: "Image" }
        });

        this.componentLogic = null;

        this.mockData = manager.createDataItem({
            id:           'mockData',
            type:         'ImageButton',
            link:         '#dataLink',
            defaultImage: '#dataDefaultImage',
            hoverImage:   '#dataHoverImage',
            activeImage:  '#dataActiveImage'
        });

        this.mockProps = manager.createDataItem({
            id: 'mockProps',
            type: 'ImageButtonProperties'
        });

        var builder = new this.ComponentBuilder(document.createElement('DIV'));
        builder.
            withType('wysiwyg.common.components.imagebutton.viewer.ImageButton').
            withSkin('mock.viewer.skins.IimageButtonMockSkin').
            withData(this.mockData).
            onWixified(function (component) {
                that.componentLogic = component;
                that.componentLogic.debugMode = true;
                that.componentLogic.setComponentProperties(that.mockProps);
            }).
            create();
    }

    function simulate(eventName) {
        return {
            on: function (element) {
                var e;

                if (document.createEvent) {
                    e = document.createEvent('MouseEvents');
                    e.initEvent(eventName, true, false );
                    element.dispatchEvent(e);
                }
            }
        };
    }

    beforeEach(function () {
        createComponent.call(this);

        this.forceRenderComponent = function () {
            this.ComponentLifecycle["@testRenderNow"](this.componentLogic);
        };

        spyOn(W.Utils, 'callOnNextRender').andCallFake(function (callback) {
            callback();
        });

        waitsFor(function () {
            return this.componentLogic !== null;
        }, "ImageButton component to be ready", 1000);
    });

    afterEach(function(){
        if(this.componentLogic){
            this.componentLogic.exterminate();
        }
    });


    describe("component skinparts", function () {
        it("should have link skinpart", function () {
            expect(this.componentLogic._skinParts.link).toBeInstanceOf(HTMLAnchorElement);
        });

        it("should have default image skinpart", function () {
            expect(this.componentLogic._skinParts.defaultImage.$className).toMatch(/ImageNew/);
        });

        it("should have hover image skinpart", function () {
            expect(this.componentLogic._skinParts.hoverImage.$className).toMatch(/ImageNew/);
        });

        it("should have active image skinpart", function () {
            expect(this.componentLogic._skinParts.activeImage.$className).toMatch(/ImageNew/);
        });
    });

    describe("component data by default", function () {
        var componentData;

        beforeEach(function () {
            componentData = this.componentLogic.getDataItem();
        });

        it("should have empty alt string", function () {
            var alt = componentData.get('alt');

            expect(alt).toBe("");
        });

        it("should have link ref", function () {
            var ref = componentData.get('link'),
                refData = W.Data.getDataByQuery(ref);

            expect(refData._data.type).toBe("ExternalLink");
        });

        it("should have default image ref", function () {
            var ref = componentData.get('defaultImage'),
                refData = W.Data.getDataByQuery(ref);

            expect(refData._data.type).toBe("Image");
        });

        it("should have hover image ref", function () {
            var ref = componentData.get('hoverImage'),
                refData = W.Data.getDataByQuery(ref);

            expect(refData._data.type).toBe("Image");
        });

        it("should have active image ref", function () {
            var ref = componentData.get('activeImage'),
                refData = W.Data.getDataByQuery(ref);

            expect(refData._data.type).toBe("Image");
        });
    });

    describe("component properties by default", function () {
        var componentProperties;

        beforeEach(function () {
            componentProperties = this.componentLogic.getComponentProperties();
        });

        it("should have transition = 'fade'", function () {
            expect(componentProperties.get('transition')).toBe('fade');
        });
    });

    describe("component states", function () {
        beforeEach(function () {
            this.forceRenderComponent();

            this.state = function (group) {
                return this.componentLogic.getState(group);
            };
        });

        describe("opacity state", function () {
            it("should be 'no_opacity' when opacity is not supported", function () {
                spyOn(this.componentLogic, 'isOpacitySupported').andReturn(false);
                this.forceRenderComponent();

                expect(this.state('opacity')).toBe('no_opacity');
            });

            it("should be 'supports_opacity' when opacity is supported", function () {
                spyOn(this.componentLogic, 'isOpacitySupported').andReturn(true);
                this.forceRenderComponent();

                expect(this.state('opacity')).toBe('supports_opacity');
            });
        });

        describe("hover state", function () {
            it("should be 'not_hovered' by default", function () {
                expect(this.state('hover')).toBe('not_hovered');
            });

            describe("when hovered", function () {
                beforeEach(function () {
                    this.componentLogic.hover.call({});
                });

                it("should be 'hovered'", function () {
                    expect(this.state('hover')).toBe('hovered');
                });

                it("should be 'not_hovered' when unhovered after that", function () {
                    this.componentLogic.unhover.call({});
                    expect(this.state('hover')).toBe('not_hovered');
                });
            });

            it("should remain 'not_hovered' on touch", function () {
                this.componentLogic.touch.call({});
                expect(this.state('hover')).toBe('not_hovered');
            });
        });

        describe("press state", function () {
            it("should be 'not_pressed' by default", function () {
                expect(this.state('press')).toBe('not_pressed');
            });

            describe("when touched", function () {
                beforeEach(function () {
                    this.componentLogic.touch.call({});
                });

                it("should be 'pressed'", function () {
                    expect(this.state('press')).toBe('pressed');
                });

                it("should be 'not_pressed' when untouched after that", function () {
                    this.componentLogic.untouch.call({});
                    expect(this.state('press')).toBe('not_pressed');
                });
            });

            describe("when pressed", function () {
                beforeEach(function () {
                    this.componentLogic.press.call({});
                });

                it("should be 'pressed'", function () {
                    expect(this.state('press')).toBe('pressed');
                });

                it("should be 'not_pressed' when unpressed after that", function () {
                    this.componentLogic.unpress.call({});
                    expect(this.state('press')).toBe('not_pressed');
                });
            });

            it("should remain 'not_pressed' on hover", function () {
                this.componentLogic.hover.call({});
                expect(this.state('press')).toBe('not_pressed');
            });
        });

        describe("transition state", function () {
            var componentProperties;

            beforeEach(function () {
                componentProperties  = this.componentLogic.getComponentProperties();
            });

            it("should be 'transition_none' when 'transition' property = none", function () {
                componentProperties.set('transition', 'none');
                this.forceRenderComponent();

                expect(this.state('transition')).toBe('transition_none');
            });

            it("should be 'transition_fade' when 'transition' property = fade", function () {
                componentProperties.set('transition', 'fade');
                this.forceRenderComponent();

                expect(this.state('transition')).toBe('transition_fade');
            });
        });
    });

    describe("component transition functionality", function () {
        describe("transition preparation", function () {
            var setTransitionClass,
                skinParts,
                spyFunction = jasmine.createSpy('dummy');

            beforeEach(function () {
                this.jasminPrintDepth = jasmine.MAX_PRETTY_PRINT_DEPTH;
                jasmine.MAX_PRETTY_PRINT_DEPTH = 1;

                spyOn(this.componentLogic, '_setTransitionClass');
                setTransitionClass = this.componentLogic._setTransitionClass;
                this.forceRenderComponent();

                skinParts = this.componentLogic._skinParts;

                this.componentLogic.prepareTransition({
                    previous: 'default',
                    next: 'hover',
                    other: 'active',
                    callback: spyFunction
                });
            });
            afterEach(function(){
                jasmine.MAX_PRETTY_PRINT_DEPTH = this.jasminPrintDepth;
            });


            it("sets 'prev' class on previous image", function () {
                expect(setTransitionClass).toHaveBeenCalledWith(skinParts.defaultImage, 'prev');
            });

            it("sets 'next' class on next image", function () {
                expect(setTransitionClass).toHaveBeenCalledWith(skinParts.hoverImage, 'next');
            });

            it("sets 'other' class on other image", function () {
                expect(setTransitionClass).toHaveBeenCalledWith(skinParts.activeImage, 'other');
            });

            it("calls callback", function () {
                expect(spyFunction).toHaveBeenCalled();
            });
        });

        describe("direction of preparation", function () {
            var prepareTransition;

            beforeEach(function () {
                spyOn(this.componentLogic, 'prepareTransition');
                prepareTransition = this.componentLogic.prepareTransition;
            });

            it("is 'default -> hover' (on hover)", function () {
                this.componentLogic.hover();

                expect(prepareTransition).toHaveBeenCalledWith({
                    previous: 'default',
                    next: 'hover',
                    other: 'active',
                    callback: jasmine.any(Function)
                });
            });

            it("is 'hover -> default' (on unhover)", function () {
                this.componentLogic.setState('hovered', 'hover');
                this.componentLogic.unhover();

                expect(prepareTransition).toHaveBeenCalledWith({
                    previous: 'hover',
                    next: 'default',
                    other: 'active',
                    callback: jasmine.any(Function)
                });
            });

            it("is 'hover -> active' (on press)", function () {
                this.componentLogic.press();

                expect(prepareTransition).toHaveBeenCalledWith({
                    previous: 'hover',
                    next: 'active',
                    other: 'default',
                    callback: jasmine.any(Function)
                });
            });

            it("is 'active -> hover' (on unpress)", function () {
                this.componentLogic.setState('pressed', 'press');
                this.componentLogic.unpress();

                expect(prepareTransition).toHaveBeenCalledWith({
                    previous: 'active',
                    next: 'hover',
                    other: 'default',
                    callback: jasmine.any(Function)
                });
            });

            it("is 'default -> active' (on touch)", function () {
                this.componentLogic.touch();

                expect(prepareTransition).toHaveBeenCalledWith({
                    previous: 'default',
                    next: 'active',
                    other: 'hover',
                    callback: jasmine.any(Function)
                });
            });

            it("is 'active -> default' (on untouch)", function () {
                this.componentLogic.setState('pressed', 'press');
                this.componentLogic.untouch();

                expect(prepareTransition).toHaveBeenCalledWith({
                    previous: 'active',
                    next: 'default',
                    other: 'hover',
                    callback: jasmine.any(Function)
                });
            });
        });
    });

    describe("component interaction", function () {
        var view;

        beforeEach(function () {
            view = this.componentLogic.$view;
            spyOn(this.componentLogic, 'hover');
            spyOn(this.componentLogic, 'unhover');
            spyOn(this.componentLogic, 'press');
            spyOn(this.componentLogic, 'unpress');
            spyOn(this.componentLogic, 'touch');
            spyOn(this.componentLogic, 'untouch');
            spyOn(this.componentLogic, 'preventDefaultAction').andCallThrough();

            this.componentLogic.attachListeners();
        });

        describe("on touch device", function () {
            beforeEach(function () {
                spyOn(this.componentLogic, 'isTouchSupported').andReturn(true);
                this.componentLogic.attachListeners();

                simulate('touchstart').on(view);
            });

            it("should become touched", function () {
                expect(this.componentLogic.touch).toHaveBeenCalled();
            });

            it("should become untouched when touch is ended", function () {
                simulate('touchend').on(view);

                expect(this.componentLogic.untouch).toHaveBeenCalled();
            });

            it("should become untouched when touch is cancelled", function () {
                simulate('touchcancel').on(view);

                expect(this.componentLogic.untouch).toHaveBeenCalled();
            });

            it("should become untouched when click happens", function () {
                simulate('click').on(view);

                expect(this.componentLogic.untouch).toHaveBeenCalled();
            });

            it("should not immediately untouch on 'touchmove'", function () {
                simulate('touchmove').on(view);
                expect(this.componentLogic.untouch).not.toHaveBeenCalled();
            });

            it("should delay untouch for 500ms on 'touchmove'", function () {
                jasmine.Clock.useMock();
                simulate('touchmove').on(view);
                jasmine.Clock.tick(500);

                expect(this.componentLogic.untouch).toHaveBeenCalled();
            });
        });

        it("should become pressed on mousedown", function () {
            simulate('mousedown').on(view);

            expect(this.componentLogic.press).toHaveBeenCalled();
        });

        it("should become unpressed on mouseup", function () {
            simulate('mousedown').on(view);
            simulate('mouseup').on(view);

            expect(this.componentLogic.unpress).toHaveBeenCalled();
        });

        it("listents to dragging", function () {
            simulate('dragstart').on(view);

            expect(this.componentLogic.preventDefaultAction).toHaveBeenCalled();
        });

        it("prevents dragging", function () {
            var prevented = false;

            this.componentLogic.preventDefaultAction({
                preventDefault: function () {
                    prevented = true;
                }
            });

            expect(prevented).toBe(true);
        });
    });

    describe("component rendering", function () {
        describe("link data binding", function () {
            var linkElement, linkData;

            beforeEach(function () {
                linkElement = this.componentLogic._skinParts.link;
                linkData = W.Data.getDataByQuery("#dataLink");
            });

            it("should change 'target' attribute if 'target' data is changed", function () {
                linkData.set('target', '_self');
                this.forceRenderComponent();

                expect(linkElement.get('target')).toBe('_self');
            });

            it("should change 'href' attribute if 'url' data is changed", function () {
                linkData.set('url', 'http://unit-test.wix.com/');
                this.forceRenderComponent();

                expect(linkElement.href).toBe('http://unit-test.wix.com/');
            });

            it("should change 'title' attribute if image button 'alt' is changed and even if link = null", function () {
                this.componentLogic.getDataItem().setFields({
                    'alt': 'test title',
                    'link': ''
                });
                this.forceRenderComponent();

                expect(linkElement.title).toBe('test title');
            });
        });

        describe("image data binding", function () {
            var imageComponent, imageData;

            it("should work for default image", function () {
                imageComponent = this.componentLogic._skinParts.defaultImage;
                imageData = W.Data.getDataByQuery("#dataDefaultImage");
            });

            it("should work for hover image", function () {
                imageComponent = this.componentLogic._skinParts.hoverImage;
                imageData = W.Data.getDataByQuery("#dataHoverImage");
            });

            it("should work for active data", function () {
                imageComponent = this.componentLogic._skinParts.activeImage;
                imageData = W.Data.getDataByQuery("#dataActiveImage");
            });

            afterEach(function () {
                this.forceRenderComponent();
                expect(imageComponent.getDataItem()).toEqual(imageData);
            });
        });
    });
});
