describe('wysiwyg.editor.components.inputs.Label', function() {

    beforeEach(function() {

        W.Components.createComponent(
            'wysiwyg.editor.components.inputs.Label',
            'wysiwyg.editor.skins.inputs.LabelSkin',
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
        'Label component creation',
        1000);

    });

    describe('Label Public Functions', function(){

        describe('setValue', function(){
            it('should call setLabel because Label has no real value', function(){
                spyOn(this.testInput, 'setLabel');
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput.setLabel).toHaveBeenCalledWith(value);
            });
            it('should set a new label value', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput._skinParts.label.get('html')).toBe(value);
            });
        });
        describe('getValue', function(){
            it('should get the label text', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                var newValue = this.testInput.getValue();
                expect(newValue).toBe(value);
            });
        });
    });
});