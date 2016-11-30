define(['lodash', 'testUtils', 'textArea'], function (_, testUtils, textArea) {
    'use strict';

    function createTextAreaProps(partialProps) {
        return testUtils.santaTypesBuilder.getComponentProps(textArea, _.merge({
            compData: {},
            compProp: {}
        }, partialProps));
    }

    function createTextAreaComp(partialProps) {
        var props = createTextAreaProps(partialProps);
        return testUtils.getComponentFromDefinition(textArea, props);
    }


    describe("TextArea component", function () {

        describe('has label', function(){
            it('should have the label as children', function() {
                var textAreaComp = createTextAreaComp({
                    compProp: {label: 'some label'}
                });

                expect(textAreaComp.state.$label).toEqual("hasLabel");
            });

            it('should have hasLabel state', function() {
                var textAreaComp = createTextAreaComp({
                    compProp: {label: 'some label'}
                });
                var skinProperties = textAreaComp.getSkinProperties();

                expect(skinProperties.label).toEqual({
                    children: 'some label'
                });
            });
        });

        describe('no label', function(){
            it('should have children with a display:none style', function() {
                var textAreaComp = createTextAreaComp();
                var skinProperties = textAreaComp.getSkinProperties();

                expect(skinProperties.label).toEqual({style: {display: 'none'}});
            });

            it('should have noLabel state', function() {
                var textAreaComp = createTextAreaComp();

                expect(textAreaComp.state.$label).toEqual("noLabel");
            });
        });

        describe('input field', function(){
            it("should implement a textArea input field with onChangeFn", function () {
                var onChange = _.noop;
                var textAreaComp = createTextAreaComp({
                    compProp: {
                        onChange: onChange
                    }
                });
                var skinProperties = textAreaComp.getSkinProperties();
                var textAreaSkinPart = skinProperties.textarea;

                expect(textAreaSkinPart.onChange).toEqual(onChange);
            });

            it('should render value from data', function() {
                var textAreaComp = createTextAreaComp({
                    compData: {
                        value: 'text area value'
                    }
                });
                var skinProperties = textAreaComp.getSkinProperties();
                var textAreaSkinPart = skinProperties.textarea;

                expect(textAreaSkinPart.value).toEqual('text area value');
            });

            it('should render maxLength from data', function() {
                var textAreaComp = createTextAreaComp({
                    compData: {
                        maxLength: 50
                    }
                });
                var skinProperties = textAreaComp.getSkinProperties();
                var textAreaSkinPart = skinProperties.textarea;

                expect(textAreaSkinPart.maxLength).toEqual(50);
            });

            it('should receive placeholder from compProp', function() {
                var textAreaComp = createTextAreaComp({
                    compProp: {
                        placeholder: 'placeholder val'
                    }
                });
                var skinProperties = textAreaComp.getSkinProperties();
                var textAreaSkinPart = skinProperties.textarea;

                expect(textAreaSkinPart.placeholder).toEqual('placeholder val');
            });

            it('onClick should be a function', function() {
                var textAreaComp = createTextAreaComp();
                var skinProperties = textAreaComp.getSkinProperties();
                var textAreaSkinPart = skinProperties.textarea;

                expect(typeof textAreaSkinPart.onClick).toEqual('function');
            });
        });


        describe('state', function(){

            it('should have value in state if received from data', function() {
                var textAreaComp = createTextAreaComp({
                    compData: {
                        value: 'text area value'
                    }
                });

                spyOn(textAreaComp, 'setState');
                var newProps = _.assign(_.clone(textAreaComp.props), {compData: {value: 'new val'}});
                textAreaComp.componentWillReceiveProps(newProps);

                expect(textAreaComp.setState).toHaveBeenCalledWith({$validation: 'valid', $label: 'noLabel', value: 'new val'});
            });
        });


        it("should display a message if needed", function () {
            var textAreaComp = createTextAreaComp({
                compProp: {
                    message: 'message'
                }
            });
            var skinProperties = textAreaComp.getSkinProperties();

            expect(skinProperties.errorMessage).toEqual({
                children: 'message', style: {"whiteSpace": "normal"}
            });
            expect(textAreaComp.state.$validation).toEqual("invalid");
        });

        it("should not display a message if not needed", function () {
            var textAreaComp = createTextAreaComp({
                compProp: {
                    message: ''
                }
            });
            var skinProperties = textAreaComp.getSkinProperties();

            expect(skinProperties.errorMessage).toEqual({
                style: {display: "none"}
            });
            expect(textAreaComp.state.$validation).toEqual("valid");
        });
    });
});
