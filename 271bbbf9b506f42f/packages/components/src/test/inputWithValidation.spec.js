define(['lodash', 'testUtils', 'components/components/inputWithValidation/inputWithValidation'],
    function (_, /** testUtils */ testUtils, inputWithValidation) {
    'use strict';

    function getInputComp(props){
        return testUtils.getComponentFromDefinition(inputWithValidation, props);
    }
    var minLengthValidator = function(str){return str.length < 6 ? "length is less than 6" : ''; };
    var invalidCharValidator = function(str){return _.includes(str, '#') ? '# is an invalid character' : ''; };



    describe("inputWithValidation component", function(){
        beforeEach(function () {
            this.props = testUtils.mockFactory.mockProps();
            this.props.type = "text";
            this.props.lazyValidation = false;
            this.props.validators = [minLengthValidator, invalidCharValidator];
            this.props.structure.componentType = 'wysiwyg.components.viewer.inputs.InputWithValidation';
        });

        describe("public methods", function(){
            var comp;
            beforeEach(function(){
                comp = getInputComp(this.props);
            });

            it("getInitialState() should an empty value and no error", function(){
                expect(comp.getInitialState()).toEqual(jasmine.objectContaining({value: '', error: false}));
            });

            it("getValue() should return the current input value", function(){
                comp.setState({value: 'asdasd'});
                expect(comp.getValue()).toBe('asdasd');
            });

            describe("validate()", function(){
                it("should run the validators and update the error state", function(){
                    comp.setState({value: 'five'});
                    comp.validate();
                    expect(comp.state.error).toBe("length is less than 6");
                });
                it("should stop running validators when it reaches the first error", function(){
                    comp.setState({value: '#'});
                    comp.validate();
                    expect(comp.state.error).toBe("length is less than 6");
                });
                it("should run subsequent validators if the previous ones did not return an error message", function(){
                    comp.setState({value: 'long with # (bad char)'});
                    comp.validate();
                    expect(comp.state.error).toBe("# is an invalid character");
                });
                it("should not cause an error state for a valid input", function(){
                    comp.setState({value: 'a valid string'});
                    comp.validate();
                    expect(comp.state.error).toBeFalsy();
                });
            });

            it("isValid() should return false if the input is invalid", function(){
                comp.setState({value: 'long with # (bad char)'});
                comp.validate();
                expect(comp.isValid()).toBeFalsy();
            });
            it("isValid() should return true if the input is valid", function(){
                comp.setState({value: 'a valid string'});
                comp.validate();
                expect(comp.isValid()).toBeTruthy();
            });
        });

        describe("The label ", function(){
            it("should display if it was included in the props", function(){
                this.props.label = "some label";
                var comp = getInputComp(this.props);
                var skinProperties = comp.getSkinProperties();
                expect(skinProperties.label.children).toBe(this.props.label);
            });
            it("should not display if there is no label", function(){
                var comp = getInputComp(this.props);
                var skinProperties = comp.getSkinProperties();
                expect(skinProperties.label.children).toBeUndefined();
            });
        });
        describe("The error message", function(){
            it("should display if there is an error after validation", function(){
                var comp = getInputComp(this.props);
                comp.setState({value: 'long with # (bad char)'});
                comp.validate();
                var skinProperties = comp.getSkinProperties();
                expect(skinProperties.errorMessage.children).toBe(comp.state.error);
            });
            it("should not display if there is no error message", function(){
                var comp = getInputComp(this.props);
                comp.setState({value: 'a valid string'});
                comp.validate();
                var skinProperties = comp.getSkinProperties();
                expect(skinProperties.errorMessage.children).toBeUndefined();
            });
        });
        describe("The input", function(){
            it("should be an input of the correct type", function(){
                this.props.type = "password";
                var comp = getInputComp(this.props);
                var skinProperties = comp.getSkinProperties();
                expect(skinProperties.input.type).toBe("password");
            });
            it("should show a placeholder if it was included", function(){
                this.props.placeholder = 'some placeholder text';
                var comp = getInputComp(this.props);
                var skinProperties = comp.getSkinProperties();
                expect(skinProperties.input.placeholder).toBe('some placeholder text');
            });
            //can't test non-lazy validation, since jasmine 2.0 has no waitsFor, and the mock clock does not
            //work for browser date, meaning the debounced function (in non-lazy validation) doesn't happen even though we tick
            it("should clear error state after change when lazyValidation is enabled", function(){
                this.props.lazyValidation = true;
                var comp = getInputComp(this.props);
                comp.setState({value: 'long with # (bad char)'});
                comp.validate();
                comp.onChange({target: {value: 'still#invalid'}, persist: function () {}});
                expect(comp.state.error).toBeFalsy();
            });

            it("should run the custom onChange passed to it as well as the default input onChange", function () {
                var wasRun = false;
                this.props.onChange = function () {wasRun = true;};
                var comp = getInputComp(this.props);
                comp.onChange({target: {value: 'still#invalid'}, persist: function () {}});
                expect(wasRun).toBeTruthy();
            });
        });
    });

});
















