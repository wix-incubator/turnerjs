describe('wysiwyg.editor.components.inputs.ColorInput', function() {

    testRequire().
        resources('W.Components').
        components('wysiwyg.editor.components.inputs.ColorInput').
        skins('wysiwyg.editor.skins.inputs.ColorInputSkin');
    beforeEach(function() {

        W.Components.createComponent(
            'wysiwyg.editor.components.inputs.ColorInput',
            'wysiwyg.editor.skins.inputs.ColorInputSkin',
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
        'ColorInput component creation',
        1000);

    });

    describe('ColorInput Public Functions', function(){
        describe('setValue', function(){
            it('should set the ColorInput field value', function(){
                var value = '4,3,2,1';
                this.testInput.setValue(value);
                expect(this.testInput._skinParts.colorButton.getColor().getRgba()).toBe(value);
            });
        });
        describe('setColor', function(){
            it('should set the ColorInput field value', function(){
                var value = '4,3,2,1';
                this.testInput.setColor(value);
                expect(this.testInput._skinParts.colorButton.getColor().getRgba()).toBe(value);
            });
        });
        describe('getValue', function(){
            it('should get the ColorInput field value', function(){
                var value = '4,3,2,1';
                this.testInput.setValue(value);
                expect(this.testInput.getValue()).toBe(value);
            });
        });
    });
//    xdescribe('ColorInput Private Functions', function(){
//        describe('_showPicker', function(){
//            it('should call the color picker of the button with the calling event instance', function(){
//                spyOn(this.testInput._skinParts.colorButton, 'openColorPicker');
//                var e = {};
//                this.testInput._showPicker(e);
//                expect(this.testInput._skinParts.colorButton.openColorPicker).toHaveBeenCalledWith(e);
//            });
//            it('should fire a custom "inputChanged" event', function(){
//                spyOn(this.testInput, 'fireEvent');
//                var value = '4,3,2,1';
//                var e = {};
//                var event = {value: value, origEvent: e, compLogic: this.testInput};
//                this.testInput.setValue(value);
//                this.testInput._changeEventHandler(e);
//                expect(this.testInput.fireEvent).toHaveBeenCalledWith('inputChanged', event);
//            });
//        });
 //   });
});