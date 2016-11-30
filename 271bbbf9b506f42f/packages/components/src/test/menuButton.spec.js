define(['lodash', 'utils', 'testUtils', 'reactDOM', 'components/components/menuButton/menuButton'], function
    (_, utils, /** testUtils */ testUtils, ReactDOM, menuButton) {
    'use strict';

    describe('menuButton tests', function () {
        var linkRenderer = utils.linkRenderer;
        var createMenuButton = function (additionalProps) {
            var props = testUtils.mockFactory.mockProps().setCompData({
                label: "mockMenuTitle",
                link: {
                    render: {
                        href: "mockHref",
                        target: "_self"
                    }
                },
                id: "mockId"
            }).setCompProp({
                alignText: "center"
            });

            _.assign(props, {
                menuBtnPageId: "mockId",
                isContainer: true,
                isSelected: false,
                isDropDownButton: false,
                lineHeight: "100%",
                display: "inline",
                skin: "wysiwyg.viewer.skins.dropmenubutton.SolidColorMenuButtonNSkin",
                mouseEnterHandler: _.noop,
                mouseLeaveHandler: _.noop,
                onMouseClick: _.noop,
                structure: {componentType: 'core.components.MenuButton'}
            }, additionalProps);

            utils.compFactory.register('menuButton', menuButton);
            var comp = testUtils.componentBuilder('menuButton', props);

            spyOn(ReactDOM, 'findDOMNode').and.returnValue({
                getAttribute: function () {
                    return "center";
                }
            });

            comp.state = {
                $container: "menu",
                $selected: "selected",
                $state: "idle"
            };
            return comp;
        };

        function getProperty(menuBtn, property) {
            return menuBtn.getSkinProperties()[property];
        }

        describe('menuButton  Component', function () {

            describe('menuButton Initial State', function () {
                it('get Initial state return values based on defaults', function () {

                    var menuBtn = createMenuButton();
                    var initialState = menuBtn.getInitialState();
                    expect(initialState.$container).toEqual("drop");
                    expect(initialState.$selected).toEqual("");
                    expect(initialState.$state).toEqual("idle");

                });
            });

            describe('menuButton componentWillReceiveProps', function () {
                it('componentWillReceiveProps - isSelected prop change sets selected state', function () {

                    var menuBtn = createMenuButton();
                    var nextProps = _.merge({}, menuBtn.props, {
                        isSelected: true
                    });
                    menuBtn.componentWillReceiveProps(nextProps);
                    expect(menuBtn.state.$selected).toEqual("selected");
                });
                it('componentWillReceiveProps -  isSelected prop change sets selected state', function () {

                    var menuBtn = createMenuButton();
                    var nextProps = _.merge({}, menuBtn.props, {
                        isSelected: false
                    });
                    menuBtn.componentWillReceiveProps(nextProps);
                    expect(menuBtn.state.$selected).toEqual("");

                });
            });

            describe('menuButton mouseEvents', function () {
                it('onMouseEnter - should change the state to over and call dropDownHandler', function () {
                    var menuBtn = createMenuButton();

                    menuBtn.onMouseEnter();

                    expect(menuBtn.state.$state).toEqual("over");
                });

                it('onMouseLeave - if menuButton is  not in drop down should keep the state', function () {

                    var menuBtn = createMenuButton();
                    menuBtn.onMouseEnter();
                    expect(menuBtn.state.$state).toEqual("over");
                    menuBtn.onMouseLeave();
                    expect(menuBtn.state.$state).toEqual("over");
                });

                it('onMouseLeave - if menuButton is in  drop down should change the state to idle', function () {

                    var menuBtn = createMenuButton({isDropDownButton: true});
                    menuBtn.onMouseEnter();
                    expect(menuBtn.state.$state).toEqual("over");
                    menuBtn.onMouseLeave();
                    expect(menuBtn.state.$state).toEqual("idle");
                });
            });

            describe('menuButton setIdleState', function () {
                it('setIdleState - should change the state to idle', function () {

                    var menuBtn = createMenuButton();
                    menuBtn.onMouseEnter();
                    expect(menuBtn.state.$state).toEqual("over");
                    menuBtn.setIdleState();
                    expect(menuBtn.state.$state).toEqual("idle");
                });
            });

            describe('menuButton getSkinProperties', function () {
                it('bg skin part should receive the correct text alignment', function () {
                    var menuBtn = createMenuButton();
                    spyOn(linkRenderer, 'renderPageLink').and.callFake(function () {
                        return "";
                    });
                    var bgSkinPart = getProperty(menuBtn, "bg");
                    expect(bgSkinPart.style.textAlign).toEqual("center");
                });

                it('label skin part - should get correct style and title ', function () {
                    var menuBtn = createMenuButton();
                    spyOn(linkRenderer, 'renderPageLink').and.callFake(function () {
                        return "";
                    });
                    var labelSkinPart = getProperty(menuBtn, "label");
                    expect(labelSkinPart.style.lineHeight).toEqual("100%");
                    expect(labelSkinPart.style.textAlign).toEqual("center");
                    expect(labelSkinPart.children).toEqual('mockMenuTitle');
                });

                it('menu Btn comp should have correct style and have event handlers', function () {
                    var menuBtn = createMenuButton();
                    var compSkinPart = getProperty(menuBtn, "");
                    expect(compSkinPart.href).toEqual('mockHref');
                    expect(compSkinPart.onMouseEnter).toBeDefined();
                    expect(compSkinPart.onMouseLeave).toBeDefined();
                    expect(compSkinPart.onClick).toBeDefined();
                });

                it('menu Btn comp style color should be grey by default', function () {
                    var menuBtn = createMenuButton();
                    var compSkinPart = getProperty(menuBtn, "");
                    expect(compSkinPart.style.color).toEqual('grey');
                });
            });
        });

    });

});
