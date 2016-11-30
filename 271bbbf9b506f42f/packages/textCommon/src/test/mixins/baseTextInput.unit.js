define([
    'react',
    'lodash',
    'testUtils',
    'textCommon/mixins/baseTextInput'
], function (React, _, testUtils, baseTextInputMixin) {
    'use strict';

    var ReactTestUtils = React.addons.TestUtils;

    describe('baseTextInput mixin', function () {

        var textInputCompClass = React.createClass({
            displayName: 'testTextInput',
            mixins: [baseTextInputMixin],
            getSkinProperties: function () {
                return this.getBaseTextInputSkinProperties();
            }
        });

        function renderTextInputWithDefaultSkin(props, node) {
            props.skin = 'wysiwyg.viewer.skins.appinputs.AppsTextInputSkin';
            props.structure.componentType = 'wysiwyg.viewer.components.inputs.TextInput';
            return testUtils.getComponentFromReactClass(textInputCompClass, props, node);
        }

        function mockProps(siteAPI) {
            return testUtils.mockFactory.mockProps(null, siteAPI)
                .setCompProp(testUtils.mockFactory.dataMocks.textInputProperties())
                .setCompData(testUtils.mockFactory.dataMocks.textInputData());
        }

        describe('label skinpart', function () {

            it('label skinpart, has label', function () {
                var props = mockProps().setCompProp({
                    label: 'test label'
                });
                var textInputComp = renderTextInputWithDefaultSkin(props);

                var skinProperties = textInputComp.getSkinProperties();
                expect(skinProperties.label).toEqual({children: 'test label'});
                expect(textInputComp.state.$label).toEqual('hasLabel');
            });

            it('label skinpart, no label, display none', function () {
                var props = mockProps().setCompProp({
                    label: ''
                });
                var textInputComp = renderTextInputWithDefaultSkin(props);

                var skinProperties = textInputComp.getSkinProperties();
                expect(skinProperties.label).toEqual({style: {display: 'none'}});
                expect(textInputComp.state.$label).toEqual('noLabel');
            });

        });

        describe('input skinpart', function () {

            describe('input value', function () {

                it('should be empty when initialized with no data', function () {
                    var props = mockProps();
                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                    expect(inputHtmlNode.value).toEqual('');
                });

                it('should init with the value of compData.value when given', function () {
                    var props = mockProps().setCompData({value: 'test value'});
                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                    expect(inputHtmlNode.value).toEqual('test value');
                });

                it('should update its value when the user inputs new text', function () {
                    var props = mockProps();
                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                    React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: 'user value'}});
                    expect(inputHtmlNode.value).toEqual('user value');
                });

                it("should ignore user's value when given a new value via props", function () {
                    var node = window.document.createElement('div');
                    var props = mockProps();
                    var textInputComp = renderTextInputWithDefaultSkin(props, node);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                    React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: 'user value'}});

                    renderTextInputWithDefaultSkin(_.defaultsDeep({compData: {value: 'new value from props'}}, props), node);
                    expect(inputHtmlNode.value).toEqual('new value from props');
                });

                it('should update value to empty string if compData.value is an empty string', function () {
                    var node = window.document.createElement('div');
                    var props = _.defaultsDeep({compData: {value: 'initial value'}}, mockProps());
                    renderTextInputWithDefaultSkin(props, node); // first render with value

                    props = _.defaultsDeep({compData: {value: ''}}, props);
                    var textInputComp = renderTextInputWithDefaultSkin(props, node);

                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                    expect(inputHtmlNode.value).toEqual('');
                });

                it('should call onChange on blur', function () {
                    var props = mockProps();
                    props.onChange = jasmine.createSpy('onChange');
                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                    React.addons.TestUtils.Simulate.blur(inputHtmlNode, {target: {value: 'current value'}});
                    expect(props.onChange).toHaveBeenCalledWith(jasmine.objectContaining({target: {value: 'current value'}}));
                });

            });

            it('should be set with the given input type', function () {
                var node = window.document.createElement('div');
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props, node);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                _.forEach(["text", "email", "url", "number", "tel", "password"], function (textType) {
                    renderTextInputWithDefaultSkin(_.defaultsDeep({compData: {textType: textType}}, props), node);
                    expect(inputHtmlNode.getAttribute('type')).toEqual(textType);
                });
            });

            it('should pass "placeholder" attribute to the input element', function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.getAttribute('placeholder')).toBeFalsy();

                props = mockProps();
                props.compProp.placeholder = 'test placeholder';
                textInputComp = renderTextInputWithDefaultSkin(props);
                inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('placeholder')).toEqual('test placeholder');
            });

            it('should pass "required" attribute to the input element', function () {
                var values = [undefined, true, false];
                _.forEach(values, function (required) {
                    var props = mockProps();
                    props.compProp.required = required;
                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                    if (required) {
                        expect(inputHtmlNode.attributes.required).toBeDefined();
                    } else {
                        expect(inputHtmlNode.attributes.required).toBeUndefined();
                    }
                });
            });

            it('should set "autoComplete" attribute to on if the compProp.autoComplete is set to true', function () {
                var props = _.defaultsDeep({compProp: {autoComplete: true}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.getAttribute('autocomplete')).toEqual('on');
            });

            it('should not set "autoComplete" attribute to on if the compProp.autoComplete is set to false', function () {
                var props = _.defaultsDeep({compProp: {autoComplete: false}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.getAttribute('autocomplete')).toBeNull();
            });

            it('should not set "autoComplete" if the textType is password', function () {
                var props = _.defaultsDeep({compData: {textType: 'password'}, compProp: {autoComplete: true}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.getAttribute('autocomplete')).toBeNull();
            });

            it('should not pass "maxLength" attribute to the input element if it is not set', function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.attributes.maxLength).toBeUndefined();
            });

            it('should pass "maxLength" attribute to the input element', function () {
                var props = _.defaultsDeep({compData: {maxLength: 5}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.getAttribute('maxlength')).toEqual('5');
            });

            it('should not pass "min" attribute if the type is not a number', function () {
                var props = _.defaultsDeep({compData: {min: 5}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.min).toBeUndefined();
            });

            it('should not pass "min" attribute if the type is a number but min prop is not set', function () {
                var props = _.defaultsDeep({compData: {textType: 'number'}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.min).toBeUndefined();
            });

            it('should pass "min" attribute if the type is a number and min prop is set', function () {
                var props = _.defaultsDeep({compData: {textType: 'number', min: 5}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('min')).toEqual('5');
            });

            it('should pass "max" attribute to the input element', function () {
                var props = _.defaultsDeep({compData: {textType: 'number'}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.attributes.max).toBeUndefined();

                props = _.defaultsDeep({compData: {textType: 'number', max: 5}}, mockProps());
                textInputComp = renderTextInputWithDefaultSkin(props);
                inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('max')).toEqual('5');
            });

            it('should pass "isDisabled" attribute to the input element', function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.attributes.disabled).toBeUndefined();
                props = _.defaultsDeep({compProp: {isDisabled: true}}, props);
                textInputComp = renderTextInputWithDefaultSkin(props);
                inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.disabled).toBeDefined();

                props = _.defaultsDeep({compProp: {isDisabled: false}}, props);
                textInputComp = renderTextInputWithDefaultSkin(props);
                inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.disabled).toBeUndefined();
            });

            it('should pass "readOnly" attribute to the input element', function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                expect(inputHtmlNode.attributes.readonly).toBeUndefined();
                props = _.defaultsDeep({compProp: {readOnly: true}}, props);
                textInputComp = renderTextInputWithDefaultSkin(props);
                inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.readonly).toBeDefined();

                props = _.defaultsDeep({compProp: {readOnly: false}}, props);
                textInputComp = renderTextInputWithDefaultSkin(props);
                inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.readonly).toBeUndefined();
            });

            it('should not pass "pattern" attribute to the input element if it was not set', function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.pattern).toBeUndefined();
            });

            it('should pass "pattern" attribute to the input element if it was set', function () {
                var props = _.defaultsDeep({compData: {pattern: '.*@wix.com'}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('pattern')).toEqual('.*@wix.com');
            });

            it('should not pass "pattern" attribute to the input element if it set to null', function () {
                var props = _.defaultsDeep({compData: {pattern: null}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.pattern).toBeUndefined();
            });

            it('should not set "name" attribute if neither compProp.name nor nickname was set to the component', function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.name).toBeUndefined();
            });

            it('should set the "name" attribute according to the nickname when no compProp.name was defined', function () {
                var props = _.defaultsDeep({structure: {nickname: 'test_nickname'}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('name')).toEqual('test_nickname');
            });

            it('should not set the "name" attribute according to the compData.name if it was defined', function () {
                var props = _.defaultsDeep({compData: {name: 'test_name'}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('name')).toEqual('test_name');
            });

            it('should not set the "name" attribute according to the nickname if compData.name was not defined', function () {
                var props = _.defaultsDeep({structure: {nickname: 'test_name'}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('name')).toEqual('test_name');
            });

            it('should set the "name" attribute according to the compData.name if it was defined even if the component has nickname', function () {
                var props = _.defaultsDeep({compData: {name: 'test_name'}, structure: {nickname: 'test_nickname'}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('name')).toEqual('test_name');
            });

            it('should pass the "tabindex" attribute to the element', function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.attributes.tabindex).toBeUndefined();
            });

            it('should pass the "tabindex" attribute to the element', function () {
                var props = _.defaultsDeep({compProp: {tabIndex: 3}}, mockProps());
                var textInputComp = renderTextInputWithDefaultSkin(props);
                var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');
                expect(inputHtmlNode.getAttribute('tabindex')).toEqual('3');
            });
        });

        describe('message skinpart', function () {

            it('message skinpart - has message', function () {
                var props = mockProps()
                    .setProps({
                        message: 'test message'
                    });
                var textInputComp = renderTextInputWithDefaultSkin(props);

                var skinProperties = textInputComp.getSkinProperties();
                expect(skinProperties.message).toEqual({
                    children: 'test message',
                    style: {"whiteSpace": 'normal'}
                });
            });

            it('message skinpart - empty message, display none', function () {
                var props = mockProps()
                    .setProps({
                        message: ''
                    });
                var textInputComp = renderTextInputWithDefaultSkin(props);

                var skinProperties = textInputComp.getSkinProperties();
                expect(skinProperties.message).toEqual({
                    style: {display: 'none'}
                });
            });

            it('message skinpart - no message, display none', function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);

                var skinProperties = textInputComp.getSkinProperties();
                expect(skinProperties.message).toEqual({
                    style: {display: 'none'}
                });
            });

        });

        describe('validation', function () {

            it("isValid prop doesn't exist - css state is valid", function () {
                var props = mockProps();
                var textInputComp = renderTextInputWithDefaultSkin(props);

                expect(textInputComp.state.valid).toEqual(true);
            });

            it('isValid prop is true - css state is invalid', function () {
                var props = mockProps()
                    .setProps({
                        isValid: true
                    });
                var textInputComp = renderTextInputWithDefaultSkin(props);

                expect(textInputComp.state.valid).toEqual(true);
            });

            it('isValid prop is false - css state is invalid', function () {
                var props = mockProps()
                    .setProps({
                        isValid: false
                    });
                var textInputComp = renderTextInputWithDefaultSkin(props);

                expect(textInputComp.state.valid).toEqual(false);
            });

        });

        describe('Wix Code', function(){
            describe('compActions', function () {
                it('should handle change comp action on blur', function () {
                    var mockActions = {
                        change: {
                            type: 'comp',
                            sourceId: 'compId',
                            name: 'change'
                        }
                    };

                    var props = mockProps().setProps({
                        compActions: mockActions
                    });
                    var behaviorsAspect = props.siteAPI.getSiteAspect('behaviorsAspect');
                    spyOn(behaviorsAspect, 'handleAction');

                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                    React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: '222'}});
                    React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                    expect(behaviorsAspect.handleAction).toHaveBeenCalledWith(mockActions.change, jasmine.any(Object));
                });

                it('should handle blur comp action on blur', function () {
                    var mockAction = {
                        type: 'comp',
                        sourceId: 'compId',
                        name: 'blur'
                    };
                    var props = mockProps().setProps({
                        compActions: {blur: mockAction}
                    });
                    var behaviorsAspect = props.siteAPI.getSiteAspect('behaviorsAspect');
                    spyOn(behaviorsAspect, 'handleAction');

                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                    React.addons.TestUtils.Simulate.blur(inputHtmlNode);

                    expect(behaviorsAspect.handleAction).toHaveBeenCalledWith(mockAction, jasmine.any(Object));
                });

                it('should handle focus comp action on focus', function () {
                    var mockAction = {
                        type: 'comp',
                        sourceId: 'compId',
                        name: 'focus'
                    };
                    var props = mockProps().setProps({
                        compActions: {focus: mockAction}
                    });
                    var behaviorsAspect = props.siteAPI.getSiteAspect('behaviorsAspect');
                    spyOn(behaviorsAspect, 'handleAction');

                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                    React.addons.TestUtils.Simulate.focus(inputHtmlNode);

                    expect(behaviorsAspect.handleAction).toHaveBeenCalledWith(mockAction, jasmine.any(Object));
                });

                it('should handle keydown comp action on viewer component keyUp', function () {
                    var mockAction = {
                        type: 'comp',
                        sourceId: 'compId',
                        name: 'keyPress'
                    };
                    var props = mockProps().setProps({
                        compActions: {keyPress: mockAction}
                    });
                    var behaviorsAspect = props.siteAPI.getSiteAspect('behaviorsAspect');
                    spyOn(behaviorsAspect, 'handleAction');

                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                    React.addons.TestUtils.Simulate.keyUp(inputHtmlNode);

                    expect(behaviorsAspect.handleAction).toHaveBeenCalledWith(mockAction, jasmine.any(Object));
                });

            });

            describe('updating runtime DAL', function(){
                it('should update runtime DAL on change in order to sync data with comp state', function () {
                    var siteAPI = testUtils.mockFactory.mockSiteAPI();
                    var props = mockProps(siteAPI);

                    var textInputComp = renderTextInputWithDefaultSkin(props);
                    var inputHtmlNode = ReactTestUtils.findRenderedDOMComponentWithTag(textInputComp, 'input');

                    React.addons.TestUtils.Simulate.change(inputHtmlNode, {target: {value: 'foo'}});

	                var updatedData = siteAPI.getRuntimeDal().getCompData(props.id);
                    expect(updatedData.value).toEqual('foo');
                });

            });
        });


    });
});
