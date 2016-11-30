define([
        'lodash',
        'testUtils',
        'react',
        'radioGroup'
    ],
    function(_, /** testUtils */testUtils, React, radioGroup) {
        'use strict';

        var compProp = {};
        var compData = {};
        var firstRadioButton = {};
        firstRadioButton.label = 'firstRadioButtonLabel';
        firstRadioButton.value = 'firstRadioButtonValue';
        firstRadioButton.type = 'RadioButton';

        var secondRadioButton = {};
        secondRadioButton.label = 'secondRadioButtonLabel';
        secondRadioButton.value = 'secondRadioButtonValue';
        secondRadioButton.type = 'RadioButton';



        function createRadioGroupComponent(partialProps, options) {

            var props = testUtils.santaTypesBuilder.getComponentProps(radioGroup, _.merge({
                compData: _.merge({
                    type: 'RadioGroup',
                    options: options
                }, compData),

                compProp: _.merge({
                    type: 'RadioGroupProperties',
                    alignment: 'left',
                    layout: 'horizontal'
                }, compProp),

                skin: 'skins.input.RadioGroupDefaultSkin'
            }, partialProps));

            return testUtils.getComponentFromDefinition(radioGroup, props);
        }

        describe('radioGroup component', function () {

            describe('create a radio group', function(){
                it('Create a radioGroup', function () {
                    var radioGroupComp = createRadioGroupComponent();

                    expect(radioGroupComp).toBeDefined();

                });
                it('Create component and select item', function () {
                    var options = [firstRadioButton];
                    var radioGroupComp = createRadioGroupComponent({}, options);
                    var firstRadioInputNode = radioGroupComp.refs.radio0.refs['radio-input'];

                    React.addons.TestUtils.Simulate.change(firstRadioInputNode);

                    expect(radioGroupComp.state.value).toBe('firstRadioButtonValue');


                });
            });

            describe('validate', function(){
                it('should return false if radio group is required but has no value', function() {
                    compProp.required = true;
                    compData.value = null;
                    var radioGroupComp = createRadioGroupComponent({}, {});

                    expect(radioGroupComp.validate()).toBeFalsy();
                });

                it('should return true if radio group is required and has a default value', function() {
                    compProp.required = true;
                    compData.defaultValue = 'defaultValue';
                    var radioGroupComp = createRadioGroupComponent({}, {});

                    expect(radioGroupComp.validate()).toBe(true);
                });

                it('should return true if radio group is required and has a value', function() {
                    compProp.required = true;
                    compData.value = 'value';
                    var radioGroupComp = createRadioGroupComponent({}, {});

                    expect(radioGroupComp.validate()).toBe(true);
                });

                it('should return true if radio group is not required', function() {
                    compProp.required = false;
                    compData.value = null;
                    compData.defaultValue = null;
                    var radioGroupComp = createRadioGroupComponent({}, {});

                    expect(radioGroupComp.validate()).toBe(true);
                });

            });

            describe('createChildRadioButton', function(){
                it('should create a radio button without margin if it is the only one', function(){
                    var options = [firstRadioButton];
                    var radioGroupComp = createRadioGroupComponent({}, options);
                    spyOn(radioGroupComp, 'createChildComponent');

                    radioGroupComp.createChildRadioButton(firstRadioButton, 0);
                    var radioButtonProps = radioGroupComp.createChildComponent.calls.mostRecent().args[3];

                    expect(radioButtonProps.style).toEqual({});

                });

                it('should create a radio button without margin if it is the last one out of two radio buttons', function(){
                    var options = [firstRadioButton, secondRadioButton];
                    var radioGroupComp = createRadioGroupComponent({}, options);
                    spyOn(radioGroupComp, 'createChildComponent');

                    radioGroupComp.createChildRadioButton(secondRadioButton, 1);
                    var secondRadioButtonProps = radioGroupComp.createChildComponent.calls.mostRecent().args[3];

                    expect(secondRadioButtonProps.style).toEqual({});

                });

                it('should create a radio button with margin if it is not the last one', function(){
                    var options = [firstRadioButton, secondRadioButton];
                    compProp.buttonsMargin = 10;
                    compProp.layout = 'vertical';
                    var radioGroupComp = createRadioGroupComponent({}, options);
                    spyOn(radioGroupComp, 'createChildComponent');

                    radioGroupComp.createChildRadioButton(firstRadioButton, 0);
                    var firstRadioButtonProps = radioGroupComp.createChildComponent.calls.mostRecent().args[3];

                    expect(firstRadioButtonProps.style).toEqual({marginBottom: 10});

                });

                it('should create a radio button with checked = true  ', function(){
                    var options = [firstRadioButton];
                    compData.value = firstRadioButton.value;
                    var radioGroupComp = createRadioGroupComponent({}, options);
                    spyOn(radioGroupComp, 'createChildComponent');

                    radioGroupComp.createChildRadioButton(firstRadioButton, 0);
                    var radioButtonProps = radioGroupComp.createChildComponent.calls.mostRecent().args[3];

                    expect(radioButtonProps.checked).toEqual(true);
                });
            });
        });
    });
