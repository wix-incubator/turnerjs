define([
    'lodash',
    'testUtils',
    'textInput'
],
    function(_, /** testUtils */testUtils, textInput) {
        'use strict';
	    describe('textInput component', function () {


            var textInputComp;

            function renderTextInputWithDefaultSkin(props) {
                props.skin = 'wysiwyg.viewer.skins.appinputs.AppsTextInputSkin';
                props.structure.componentType = 'wysiwyg.viewer.components.inputs.TextInput';
                return testUtils.getComponentFromDefinition(textInput, props);
            }

            function mockProps () {
                return testUtils.mockFactory.mockProps()
                    .setCompProp(testUtils.mockFactory.dataMocks.textInputProperties())
                    .setCompData(testUtils.mockFactory.dataMocks.textInputData());
            }

            it('Create a textInput', function () {
                var props = mockProps();
                textInputComp = renderTextInputWithDefaultSkin(props);

                expect(textInputComp).toBeDefined();
            });

            it('input should be disabled if compProp.isDisabled is true', function () {
                var props = mockProps().setCompProp({
                    isDisabled: true
                });

                textInputComp = renderTextInputWithDefaultSkin(props);
                var skinProperties = textInputComp.getSkinProperties();
                var input = skinProperties.input;

                expect(input.disabled).toEqual(true);
            });

            it('input should get padding from its props', function () {
                var props = mockProps().setCompProp({
                    textPadding: '10px',
                    textAlignment: 'left'
                });

                textInputComp = renderTextInputWithDefaultSkin(props);
                var skinProperties = textInputComp.getSkinProperties();
                var input = skinProperties.input;

                expect(input.style.paddingLeft).toEqual("10px");
            });

            it('padding should be undefined if input does not get the textAlignment from its props ', function () {
                var props = mockProps().setCompProp({
                    textPadding: '10px'
                });

                textInputComp = renderTextInputWithDefaultSkin(props);
                var skinProperties = textInputComp.getSkinProperties();
                var input = skinProperties.input;

                expect(input.style.paddingLeft).toBe(undefined);
                expect(input.style.paddingRight).toBe(undefined);
            });

            it('root should get "right-direction" class if compProp.textAlignment is right', function () {
                var props = mockProps().setCompProp({
                    textAlignment: 'right'
                });

                textInputComp = renderTextInputWithDefaultSkin(props);
                spyOn(textInputComp, 'classSet').and.callFake(function (className) {
                    return className;
                });

                var skinProperties = textInputComp.getSkinProperties();
                var root = skinProperties[""];

                expect(root.className['right-direction']).toEqual(true);
            });


        });

    });
