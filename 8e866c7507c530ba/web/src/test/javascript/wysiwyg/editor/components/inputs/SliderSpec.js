describe('wysiwyg.editor.components.inputs.Slider', function() {

    beforeEach(function() {

        W.Components.createComponent(
            'wysiwyg.editor.components.inputs.Slider',
            'wysiwyg.editor.skins.inputs.SliderSkin',
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
                var value = 10;
                this.testInput.setValue(value);
                expect(Number(this.testInput._skinParts.input.getValue())).toBe(value);
            });
        });
        describe('getValue', function(){
            it('should get the input field value', function(){
                var value = 10;
                this.testInput.setValue(value);
                expect(Number(this.testInput.getValue())).toBe(value);
            });
        });
    });
    describe('Input Private Functions', function(){
        describe('_normalizeNumber', function(){
            it('should set the number to min value', function(){
                this.testInput.min = 10;
                var newNum = this.testInput._normalizeNumber(1);
                expect(Number(newNum)).toBe(Number(this.testInput.min));
            });
            it('should set the number to max value', function(){
                this.testInput.max = 10;
                var newNum = this.testInput._normalizeNumber(30);
                expect(Number(newNum)).toBe(Number(this.testInput.max));
            });
            it('should set the number to the nearest multiple of step', function(){
                this.testInput.step = 7;
                var newNum = this.testInput._normalizeNumber(20);
                expect(Number(newNum)).toBe(21);
            });
        });
        describe('_percentFromValue', function(){
            it('should return the same value as the processed number', function(){
                this.testInput.min = 0;
                this.testInput.max = 100;
                var num1 = 0;
                var num2 = 36;
                var num3 = 100;
                expect(this.testInput._percentFromValue(num1)).toBeEquivalentTo(num1);
                expect(this.testInput._percentFromValue(num2)).toBeEquivalentTo(num2);
                expect(this.testInput._percentFromValue(num3)).toBeEquivalentTo(num3);
            });
            it('should return the percentage location of the processed number inside a range', function(){
                this.testInput.min = -30;
                this.testInput.max = 300;
                var num1 = -30;
                var num2 = 77;
                var num3 = 300;
                expect(this.testInput._percentFromValue(num1)).toBeEquivalentTo(0);
                expect(Math.round(this.testInput._percentFromValue(num2))).toBeEquivalentTo(32);
                expect(this.testInput._percentFromValue(num3)).toBeEquivalentTo(100);
            });
        });
        describe('_valueFromPercent', function(){
            it('should return the same value as the processed number', function(){
                this.testInput.min = 0;
                this.testInput.max = 100;
                var num1 = 0;
                var num2 = 36;
                var num3 = 100;
                expect(this.testInput._valueFromPercent(num1)).toBeEquivalentTo(num1);
                expect(this.testInput._valueFromPercent(num2)).toBeEquivalentTo(num2);
                expect(this.testInput._valueFromPercent(num3)).toBeEquivalentTo(num3);
            });
            it('should return the percentage location of the processed number inside a range', function(){
                this.testInput.min = -30;
                this.testInput.max = 300;
                var num1 = 0;
                var num2 = 32;
                var num3 = 100;
                expect(this.testInput._valueFromPercent(num1)).toBeEquivalentTo(-30);
                expect(Math.round(this.testInput._valueFromPercent(num2))).toBeEquivalentTo(76);
                expect(this.testInput._valueFromPercent(num3)).toBeEquivalentTo(300);
            });
        });

        describe('_changeEventHandler', function(){
            it('should fire a custom "inputChanged" event', function(){
                spyOn(this.testInput, 'fireEvent');
                var num = 32;
                var e = {};
                var event = {value: num, origEvent: e, compLogic: this.testInput};
                this.testInput.setValue(num);
                this.testInput._changeEventHandler(e);
                expect(this.testInput.fireEvent).toHaveBeenCalledWith('inputChanged', event);
            });
        });
    });
});