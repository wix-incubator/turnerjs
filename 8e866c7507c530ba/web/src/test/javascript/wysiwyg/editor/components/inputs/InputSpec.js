describe('wysiwyg.editor.components.inputs.Input', function() {

    testRequire().
        components('wysiwyg.editor.components.inputs.Input');

    beforeEach(function() {

        W.Components.createComponent(
            'wysiwyg.editor.components.inputs.Input',
            'mock.viewer.skins.InputSkin',
            undefined,
            {labelText: ''},
            null,
            function(logic){
                this.testInput = logic;
                this.isComplete = true;
            }.bind(this)
        );

        waitsFor( function(){
            return this.isComplete;
        }.bind(this),
        'Input component creation',
        1000);

    });

    describe('Input Public Functions', function(){
        describe('setValue', function(){
            it('should set the input field value', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput._skinParts.input.get('value')).toBe(value);
            });
        });
        describe('getValue', function(){
            it('should get the input field value', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput.getValue()).toBe(value);
            });
        });
        describe('disable/enable', function(){
            it('should set a "disabled" attribute on the input', function(){
                this.testInput.disable();
                expect(this.testInput._skinParts.input.getAttribute('disabled')).toBe('disabled');
            });
            it('should remove the "disabled" attribute from the input', function(){
                this.testInput.enable();
                expect(this.testInput._skinParts.input.getAttribute('disabled')).toBeFalsy();
            });
        });
        describe('getInputValidationErrorMessage', function(){
            it('should return a falsy value when there are no validation errors', function(){
                this.testInput.setValue('Good Value');
                this.testInput._minLength = 0;
                this.testInput._maxLength = 100;
                this.testInput._validators = [];
                var message = this.testInput.getInputValidationErrorMessage();
                expect(message).toBeFalsy();
            });
            it('should return a message when input contents are shorter than the defined minimum length', function(){
                var value = 'Short Value';
                this.testInput.setValue(value);
                this.testInput._minLength = value.length + 1;
                this.testInput._maxLength = 100;
                 this.testInput._validators = [];
                var expectedErrorMessage = this.testInput._minLengthErrorMessage + ' ' + this.testInput._minLength;
                var message = this.testInput.getInputValidationErrorMessage();
                expect(message).toBe(expectedErrorMessage);
            });
            it('should report a message when input contents are longer than the defined maximum length', function(){
                var value = 'Long Value';
                this.testInput.setValue(value);
                this.testInput._minLength = 0;
                this.testInput._maxLength = value.length - 1;
                 this.testInput._validators = [];
                var expectedErrorMessage = this.testInput._maxLengthErrorMessage + ' ' + this.testInput._maxLength
                var message = this.testInput.getInputValidationErrorMessage();
                expect(message).toBe(expectedErrorMessage);
            });
            it('should report a  message when input fails a validation in validators array', function(){
                var value = 'Validatable Value';
                var expectedErrorMessage = 'Error: custom error ' + value;
                this.testInput.setValue('Validatable Value');
                this.testInput._minLength = 0;
                this.testInput._maxLength = 100;
                this.testInput._validators = [function(){return expectedErrorMessage}];
                var message = this.testInput.getInputValidationErrorMessage();
                expect(message).toBe(expectedErrorMessage);
            });
            it('should report a message when input fails the first failed validation in validators array', function(){
                var value = 'Validatable Value';
                var skippedErrorMessage = null;
                var expectedErrorMessage = 'Error: custom error ' + value;
                var anotherErrorMessage = 'Error: custom error 2 ' + value;
                this.testInput.setValue('Validatable Value');
                this.testInput._minLength = 0;
                this.testInput._maxLength = 100;
                this.testInput._validators = [
                    function(){return skippedErrorMessage},
                    function(){return expectedErrorMessage},
                    function(){return anotherErrorMessage}
                ];
                var message = this.testInput.getInputValidationErrorMessage();
                expect(message).toBe(expectedErrorMessage);
            });
        });
        describe('setPlaceholder', function(){
            it('should set a new value to the placeholder', function(){
                var placeholder = 'New Text';
                this.testInput.setPlaceholder(placeholder);
                expect(this.testInput._skinParts.input.getAttribute('placeholder')).toBe(placeholder);
            });
        });
    });
    describe('Input Private Functions', function(){
        describe('_changeEventHandler', function(){
            it('should call getInputValidationErrorMessage', function(){
                spyOn(this.testInput, 'getInputValidationErrorMessage');
                this.testInput._changeEventHandler({});
                expect(this.testInput.getInputValidationErrorMessage).toHaveBeenCalled();
            });
            it('should fire a custom "inputChanged" event', function(){
                spyOn(this.testInput, 'fireEvent');
                this.testInput.setValue('test');
                var e = {};
                var event = {value: 'test', origEvent: e, compLogic: this.testInput};
                this.testInput._changeEventHandler(e);
                expect(this.testInput.fireEvent).toHaveBeenCalledWith('inputChanged', event);
            });
        });
    });
});