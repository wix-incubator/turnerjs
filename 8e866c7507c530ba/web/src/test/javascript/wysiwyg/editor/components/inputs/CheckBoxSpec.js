describe('wysiwyg.editor.components.inputs.CheckBox', function() {

    beforeEach(function() {

        W.Components.createComponent(
            'wysiwyg.editor.components.inputs.CheckBox',
            'wysiwyg.editor.skins.inputs.CheckBoxSkin',
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
        'CheckBox component creation',
        1000);

    });

    describe('CheckBox Public Functions', function(){

        describe('setValue', function(){
            it('should set the CheckBox field value if the value is a string', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput._skinParts.checkBox.get('value')).toBe(value);
            });
            it('should not change the CheckBox field value if the value is not a string', function(){
                var stringValue = 'Changed Value';
                this.testInput.setValue(stringValue);
                var nonStringValue = 1234;
                expect(this.testInput._skinParts.checkBox.get('value')).not.toBe(nonStringValue);
            });
            it('should set the CheckBox to "checked" if the value is truthy', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput._skinParts.checkBox.get('checked')).toBeTruthy();
            });
            it('should set the CheckBox to "not checked" if the value is falsy', function(){
                var value = '';
                this.testInput.setValue(value);
                expect(this.testInput._skinParts.checkBox.get('checked')).toBeFalsy();
            });
        });
        describe('getValue', function(){
            it('should get the CheckBox field value', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput.getValue()).toBeTruthy();
            });
        });
        describe('setChecked', function(){
            it('should set the CheckBox status to checked', function(){
                this.testInput.setChecked(true);
                expect(this.testInput._skinParts.checkBox.get('checked')).toBeTruthy();
            });
            it('should set the CheckBox status to unchecked', function(){
                this.testInput.setChecked(false);
                expect(this.testInput._skinParts.checkBox.get('checked')).toBeFalsy();
            });
        });
        describe('getChecked', function(){
            it('should return the CheckBox field checked/unchecked status', function(){
                this.testInput.setChecked(true);
                expect(this.testInput.getChecked()).toBeTruthy();

                this.testInput.setChecked(false);
                expect(this.testInput.getChecked()).toBeFalsy();
            });
        });
        describe('disable/enable', function(){
            it('should set the CheckBox to disabled', function(){
                this.testInput.disable();
                expect(this.testInput._skinParts.checkBox.getAttribute('disabled')).toBe('disabled');
            });
            it('should set the CheckBox to enabled', function(){
                this.testInput.enable();
                expect(this.testInput._skinParts.checkBox.getAttribute('disabled')).toBeFalsy();
            });
        });
    });
    describe('CheckBox Private Functions', function(){
        describe('_changeEventHandler', function(){
            it('should fire a custom "inputChanged" event (with valueString)', function(){
                spyOn(this.testInput, 'fireEvent');
                spyOn(this.testInput, 'getValue').andReturn('test');
                var e = {};
                var event = {value: this.testInput.getValue(), origEvent: e, valueString: this.testInput.getValueString(), compLogic: this.testInput};
                this.testInput._changeEventHandler(e);
                expect(this.testInput.fireEvent).toHaveBeenCalledWith('inputChanged', event);
            });
        });
    });
});