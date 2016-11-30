define([
    "lodash",
    "react",
    "utils",
    "testUtils",
    "imageButton"
], function (_, React, utils, testUtils, imageButton) {
    "use strict";

    var windowFocusEvents;

    function createImageButtonProps(partialProps) {

        var compData = testUtils.mockFactory.dataMocks.imageButtonData({});
        var compProp = testUtils.mockFactory.dataMocks.imageButtonProperties({});
        var style = testUtils.mockFactory.dataMocks.imageButtonStyle({});

        windowFocusEvents = {
            registerToFocusEvent: jasmine.createSpy('registerToFocusEvent'),
            unregisterFromFocusEvent: jasmine.createSpy('unregisterFromFocusEvent')
        };

        return testUtils.santaTypesBuilder.getComponentProps(imageButton, _.merge({
            compData: compData,
            compProp: compProp,
            skin: 'wysiwyg.common.components.imagebutton.viewer.skins.ImageButtonSkin',
            style: style,
            windowFocusEvents: windowFocusEvents
        }, partialProps));
    }

    function createImageButtonComp(partialProps) {
        var props = createImageButtonProps(partialProps);
        return testUtils.getComponentFromDefinition(imageButton, props);
    }

    describe("ImageButton component", function () {

        describe("CSS state", function () {
            it("should have $opacity = 'supports_opacity'", function () {
                expect(createImageButtonComp().getInitialState().$opacity).toBe('supports_opacity');
            });

            it("should have $transition = 'transition_none' when transition is set to 'none'", function () {
                expect(createImageButtonComp({
                    compProp: {
                        transition: 'none'
                    }
                }).getInitialState().$transition).toBe('transition_none');
            });

            it("should have $transition = 'transition_fade' when transition is set to 'fade'", function () {
                expect(createImageButtonComp({
                    compProp: {
                        transition: 'fade'
                    }
                }).getInitialState().$transition).toBe('transition_fade');
            });
        });

        describe("the default image", function () {
            var IMAGE_URI = '1731b3_c1cd1ba960b34dada2faae0a6625dd42.png';

            it("should display default image src", function () {
                var imageButtonComp = createImageButtonComp({
                    compData: {
                        defaultImage: {uri: IMAGE_URI}
                    }
                });
                expect(imageButtonComp.getSkinProperties().defaultImage.props.imageData.uri).toBe(IMAGE_URI);
            });

            it("should use image button Alt text", function () {
                var imageButtonComp = createImageButtonComp({
                    compData: {
                        alt: "Default Alt",
                        defaultImage: {}
                    }
                });
                expect(imageButtonComp.getSkinProperties().defaultImage.props.imageData.alt).toBe("Default Alt");
            });
        });

        describe("the hover image", function () {
            var IMAGE_URI = '1731b3_d294fe832cf944d69eb663cd981089fb.png';

            it("should display hover image src", function () {
                var imageButtonComp = createImageButtonComp({
                    compData: {
                        hoverImage: {uri: IMAGE_URI}
                    }
                });
                expect(imageButtonComp.getSkinProperties().hoverImage.props.imageData.uri).toBe(IMAGE_URI);
            });

            it("should use image button Alt text", function () {
                var imageButtonComp = createImageButtonComp({
                    compData: {
                        hoverImage: {},
                        alt: "Hover Alt"
                    }
                });
                expect(imageButtonComp.getSkinProperties().hoverImage.props.imageData.alt).toBe("Hover Alt");
            });
        });

        describe("the active image", function () {
            var IMAGE_URI = '1731b3_d576a3da470d41cc8251b841b3e851fa.png';

            it("should display active image src", function () {
                var imageButtonComp = createImageButtonComp({
                    compData: {
                        activeImage: {uri: IMAGE_URI}
                    }
                });
                expect(imageButtonComp.getSkinProperties().activeImage.props.imageData.uri).toBe(IMAGE_URI);
            });

            it("should use image button Alt text", function () {
                var imageButtonComp = createImageButtonComp({
                    compData: {
                        alt: "Default Alt",
                        activeImage: {}
                    }
                });
                expect(imageButtonComp.getSkinProperties().activeImage.props.imageData.alt).toBe("Default Alt");
            });
        });

        describe("the link", function () {
            describe("when it is present", function () {

                it("should have href, target and title equal to ImageButton's alt", function () {

                    var imageButtonComp = createImageButtonComp({
                        compData: {
                            link: testUtils.mockFactory.dataMocks.externalLinkData(),
                            alt: 'spider pig'
                        }
                    });

                    expect(imageButtonComp.getSkinProperties().link.href).toBe("http://www.wix.com");
                    expect(imageButtonComp.getSkinProperties().link.target).toBe("_blank");
                    expect(imageButtonComp.getSkinProperties().link.title).toBe('spider pig');

                });
            });

            describe("when it is missing", function () {

                it("should not have href or target and take title = alt", function () {
                    var imageButtonComp = createImageButtonComp({
                        compData: {
                            link: null,
                            alt: 'spider pig'
                        }
                    });

                    expect(imageButtonComp.getSkinProperties().link.href).not.toBeDefined();
                    expect(imageButtonComp.getSkinProperties().link.target).not.toBeDefined();
                    expect(imageButtonComp.getSkinProperties().link.title).toBe('spider pig');
                });

            });
        });

        describe("the behavior", function () {
            var component, view;

            beforeEach(function () {
                spyOn(utils.animationFrame, 'request').and.callFake(function (callback) {
                    callback();
                });
            });

            describe("on modern desktop browser", function () {
                beforeEach(function () {
                    component = createImageButtonComp();
                    view = component.refs[''];
                });

                it("prevents dragging", function () {
                    var e = jasmine.createSpyObj('event', ['preventDefault']);

                    React.addons.TestUtils.Simulate.dragStart(view, e);

                    expect(e.preventDefault).toHaveBeenCalled();
                });

                describe("when mouse is over", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseEnter(view);
                    });

                    it("should change state to $hovered = 'hovered'", function () {
                        expect(component.state.$hovered).toBe('hovered');
                    });

                    it("should keep empty state of $pressed", function () {
                        expect(component.state.$pressed).toBe('');
                    });
                });

                describe("when mouse is over and out", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseEnter(view);
                        React.addons.TestUtils.Simulate.mouseLeave(view);
                    });

                    it("should empty the $hovered state", function () {
                        expect(component.state.$hovered).toBe('');
                    });

                    it("should keep empty state of $pressed", function () {
                        expect(component.state.$pressed).toBe('');
                    });

                    describe("when 'mouseLeave' event is repeated", function () {
                        beforeEach(function () {
                            React.addons.TestUtils.Simulate.mouseLeave(view);
                        });

                        it("should keep empty state of $hovered", function () {
                            expect(component.state.$hovered).toBe('');
                        });

                        it("should keep empty state of $pressed", function () {
                            expect(component.state.$pressed).toBe('');
                        });
                    });
                });

                describe("when 'mouseEnter' event is repeated twice", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseEnter(view);
                        React.addons.TestUtils.Simulate.mouseEnter(view);
                    });

                    it("should keep state of $hovered = 'hovered'", function () {
                        expect(component.state.$hovered).toBe('hovered');
                    });

                    it("should keep empty state of $pressed", function () {
                        expect(component.state.$pressed).toBe('');
                    });
                });

                describe("when mouse is down", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseDown(view);
                    });

                    it("should keep empty state of $hovered", function () {
                        expect(component.state.$hovered).toBe('');
                    });

                    it("should change state to $pressed = 'pressed'", function () {
                        expect(component.state.$pressed).toBe('pressed');
                    });
                });

                describe("when mouse is down and out", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseDown(view);
                        React.addons.TestUtils.Simulate.mouseLeave(view);
                    });

                    it("should empty the $hovered state", function () {
                        expect(component.state.$hovered).toBe('');
                    });

                    it("should empty the $pressed state", function () {
                        expect(component.state.$pressed).toBe('');
                    });

                    describe("when 'mouseLeave' event is repeated", function () {
                        beforeEach(function () {
                            React.addons.TestUtils.Simulate.mouseLeave(view);
                        });

                        it("should keep empty state of $hovered", function () {
                            expect(component.state.$hovered).toBe('');
                        });

                        it("should keep empty state of $pressed", function () {
                            expect(component.state.$pressed).toBe('');
                        });
                    });
                });

                describe("when 'mousedown' event is repeated twice", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseDown(view);
                        React.addons.TestUtils.Simulate.mouseDown(view);
                    });

                    it("should keep empty state of $hovered", function () {
                        expect(component.state.$hovered).toBe('');
                    });

                    it("should keep state of $pressed = 'pressed'", function () {
                        expect(component.state.$pressed).toBe('pressed');
                    });
                });

                describe("when mouse is over and down", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseEnter(view);
                        React.addons.TestUtils.Simulate.mouseDown(view);
                    });

                    it("should keep state of $hovered = 'hovered'", function () {
                        expect(component.state.$hovered).toBe('hovered');
                    });

                    it("should change state to $pressed = 'pressed'", function () {
                        expect(component.state.$pressed).toBe('pressed');
                    });

                    describe("when 'mouseEnter' event is repeated", function () {
                        beforeEach(function () {
                            React.addons.TestUtils.Simulate.mouseEnter(view);
                        });

                        it("should keep state of $hovered = 'hovered'", function () {
                            expect(component.state.$hovered).toBe('hovered');
                        });

                        it("should keep state of $pressed = 'pressed'", function () {
                            expect(component.state.$pressed).toBe('pressed');
                        });
                    });

                    describe("when 'mousedown' event is repeated", function () {
                        beforeEach(function () {
                            React.addons.TestUtils.Simulate.mouseDown(view);
                        });

                        it("should keep state of $hovered = 'hovered'", function () {
                            expect(component.state.$hovered).toBe('hovered');
                        });

                        it("should keep state of $pressed = 'pressed'", function () {
                            expect(component.state.$pressed).toBe('pressed');
                        });
                    });

                    describe("when mouse is out", function () {
                        beforeEach(function () {
                            React.addons.TestUtils.Simulate.mouseLeave(view);
                        });

                        it("should empty the $hovered state", function () {
                            expect(component.state.$hovered).toBe('');
                        });

                        it("should empty the $pressed state", function () {
                            expect(component.state.$pressed).toBe('');
                        });
                    });

                    describe("when 'mouseLeave' event is repeated twice", function () {
                        beforeEach(function () {
                            React.addons.TestUtils.Simulate.mouseLeave(view);
                            React.addons.TestUtils.Simulate.mouseLeave(view);
                        });

                        it("should keep empty state of $hovered", function () {
                            expect(component.state.$hovered).toBe('');
                        });

                        it("should keep empty state of $pressed", function () {
                            expect(component.state.$pressed).toBe('');
                        });
                    });
                });

                describe("when mouse is over and down, and window is blurred", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseEnter(view);
                        React.addons.TestUtils.Simulate.mouseDown(view);
                        component.onBlur();
                    });

                    it("should empty the $hovered state", function () {
                        expect(component.state.$hovered).toBe('');
                    });

                    it("should empty the $pressed state", function () {
                        expect(component.state.$pressed).toBe('');
                    });

                    it("should call the blur event handler with the component", function () {
                        expect(windowFocusEvents.registerToFocusEvent).toHaveBeenCalledWith('blur', component);
                    });

                    describe("when 'blur' event is repeated", function () {
                        beforeEach(function () {
                            component.onBlur();
                        });

                        it("should keep empty state of $hovered", function () {
                            expect(component.state.$hovered).toBe('');
                        });

                        it("should keep empty state of $pressed", function () {
                            expect(component.state.$pressed).toBe('');
                        });
                    });
                });

                describe("when mouse is over, down and then - up", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseEnter(view);
                        React.addons.TestUtils.Simulate.mouseDown(view);
                        React.addons.TestUtils.Simulate.mouseUp(view);
                    });

                    it("should keep state of $hovered = 'hovered'", function () {
                        expect(component.state.$hovered).toBe('hovered');
                    });

                    it("should empty the $pressed state", function () {
                        expect(component.state.$pressed).toBe('');
                    });

                    describe("when 'mouseup' event is repeated", function () {
                        beforeEach(function () {
                            React.addons.TestUtils.Simulate.mouseUp(view);
                        });

                        it("should keep state of $hovered = 'hovered'", function () {
                            expect(component.state.$hovered).toBe('hovered');
                        });

                        it("should keep empty state of $pressed", function () {
                            expect(component.state.$pressed).toBe('');
                        });
                    });
                });
            });

            describe("when transitions are disabled", function () {
                beforeEach(function () {
                    component = createImageButtonComp({compProp: {transition: 'none'}});
                    view = component.refs[''];
                });

                describe("when mouse is over and down", function () {
                    beforeEach(function () {
                        React.addons.TestUtils.Simulate.mouseEnter(view);
                        React.addons.TestUtils.Simulate.mouseDown(view);
                    });

                    it("should change state of $hovered = 'hovered'", function () {
                        expect(component.state.$hovered).toBe('hovered');
                    });

                    it("should change state to $pressed = 'pressed'", function () {
                        expect(component.state.$pressed).toBe('pressed');
                    });

                    describe("when mouse is out", function () {
                        beforeEach(function () {
                            React.addons.TestUtils.Simulate.mouseLeave(view);
                        });

                        it("should empty the $hovered state", function () {
                            expect(component.state.$hovered).toBe('');
                        });

                        it("should empty the $pressed state", function () {
                            expect(component.state.$pressed).toBe('');
                        });

                        describe("when 'mouseLeave' event is repeated", function () {
                            beforeEach(function () {
                                React.addons.TestUtils.Simulate.mouseLeave(view);
                            });

                            it("should keep empty state of $hovered", function () {
                                expect(component.state.$hovered).toBe('');
                            });

                            it("should keep empty state of $pressed", function () {
                                expect(component.state.$pressed).toBe('');
                            });
                        });
                    });
                });

            });
        });

        describe("the global listeners", function () {
            it("when component is hovered and pressed, should reset hover/press state after window.blur", function () {
                var component = createImageButtonComp();
                var view = component.refs[''];

                React.addons.TestUtils.Simulate.mouseEnter(view);
                React.addons.TestUtils.Simulate.mouseDown(view);

                component.onBlur();

                expect(component.state.$hovered).toBe('');
                expect(component.state.$pressed).toBe('');
            });
        });
    });
});
