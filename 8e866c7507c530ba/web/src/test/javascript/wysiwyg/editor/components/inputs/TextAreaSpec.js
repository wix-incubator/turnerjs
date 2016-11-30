describe('wysiwyg.editor.components.inputs.TextArea', function() {

    beforeEach(function() {

        W.Components.createComponent(
            'wysiwyg.editor.components.inputs.TextArea',
            'wysiwyg.editor.skins.inputs.TextAreaSkin',
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
        'TextArea component creation',
        1000);

    });

    describe('TextArea Public Functions', function(){
        describe('setValue', function(){
            it('should set the TextArea field value', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput._skinParts.textarea.get('value')).toBe(value);
            });
        });
        describe('getValue', function(){
            it('should get the TextArea field value', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput.getValue()).toBe(value);
            });
        });
        describe('disable/enable', function(){
            it('should set the TextArea to disabled', function(){
                this.testInput.disable();
                expect(this.testInput._skinParts.textarea.getAttribute('disabled')).toBe('disabled');
            });
            it('should set the TextArea to enabled', function(){
                this.testInput.enable();
                expect(this.testInput._skinParts.textarea.getAttribute('disabled')).toBeFalsy();
            });
        });
        describe('getTextAreaValidationErrorMessage', function(){

            it('should report a custom message when TextArea content fails validation defined in validators array', function(){
                this.testInput.setValue('1234567');
                this.testInput._validators = [function(value){return 'Error: custom error ' + value}];
                var message = this.testInput.getTextAreaValidationErrorMessage();
                expect(message).toBe('Error: custom error ' + this.testInput.getValue());
            });
        });
    });
    describe('TextArea Private Functions', function(){
        describe('_changeEventHandler', function(){
            it('should call getTextAreaValidationErrorMessage', function(){
                spyOn(this.testInput, 'getTextAreaValidationErrorMessage');
                this.testInput._changeEventHandler({});
                expect(this.testInput.getTextAreaValidationErrorMessage).toHaveBeenCalled();
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