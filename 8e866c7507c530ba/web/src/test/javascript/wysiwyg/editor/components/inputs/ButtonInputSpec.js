describe('wysiwyg.editor.components.inputs.ButtonInput', function() {
    testRequire().
        components('wysiwyg.editor.components.inputs.ButtonInput');

    beforeEach(function() {
        define.skin('test.ButtonBaseSkin', function(def) {
            def.inherits('mobile.core.skins.BaseSkin');
            def.html(
                '<div skinpart="icon"></div>' +
                '<div skinpart="label"></div>'
            )
        });
        define.skin('test.ButtonInputSkin', function(def) {
            def.inherits('mobile.core.skins.BaseSkin');
            def.compParts({
                button : { skin: 'test.ButtonBaseSkin' }
            });
            def.html(
                '<label skinpart="label"></label>' +
                '<div skinpart="button"></div>'
            )
        });
        W.Components.createComponent(
            'wysiwyg.editor.components.inputs.ButtonInput',
            'test.ButtonInputSkin',
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
        'ButtonInput component creation',
        1000);
    });

    describe('ButtonInput Public Functions', function(){
        describe('setValue', function(){
            it('should set the button value', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput._value).toBe(value);
            });
        });
        describe('getValue', function(){
            it('should get the  button value', function(){
                var value = 'Changed Value';
                this.testInput.setValue(value);
                expect(this.testInput.getValue()).toBe(value);
                expect(this.testInput.getValue()).toBe(this.testInput._value);
            });
        });
        describe('disable/enable', function(){
            it('should set the inner button to disabled', function(){
                this.testInput.disable();
                expect(this.testInput._skinParts.button.isEnabled()).toBeFalsy();
            });
            it('should set the input to enabled', function(){
                this.testInput.enable();
                expect(this.testInput._skinParts.button.isEnabled()).toBeTruthy();
            });
        });
    });
    describe('ButtonInput Private Functions', function(){
        describe('_tunnelButtonEvent', function(){
            it('should tunnel an event passed from the inner button', function(){
                var e = {type: 'test'};
                var event = {value: this.testInput._value, origEvent: e, compLogic: this.testInput};
                spyOn(this.testInput, 'fireEvent');
                this.testInput._tunnelButtonEvent(e);
                expect(this.testInput.fireEvent).toHaveBeenCalledWith(e.type, event);
            });
            it('should tunnel a mouseover event passed from the inner button to an up event', function(){
                var e = {type: Constants.CoreEvents.MOUSE_OVER};
                var event = {value: this.testInput._value, origEvent: e, compLogic: this.testInput};
                spyOn(this.testInput, 'fireEvent');
                this.testInput._tunnelButtonEvent(e);
                expect(this.testInput.fireEvent).toHaveBeenCalledWith('over', event);
            });
            it('should tunnel a mouseout event passed from the inner button to an up event', function(){
                var e = {type: Constants.CoreEvents.MOUSE_OUT};
                var event = {value: this.testInput._value, origEvent: e, compLogic: this.testInput};
                spyOn(this.testInput, 'fireEvent');
                this.testInput._tunnelButtonEvent(e);
                expect(this.testInput.fireEvent).toHaveBeenCalledWith('up', event);
            });
        });

//        describe('Generic component tests', function() {
        // General component tests
        ComponentsTestUtil.runBasicComponentTestSuite('wysiwyg.editor.components.inputs.ButtonInput', 'wysiwyg.editor.skins.inputs.button.ButtonInputSkin',  '', {'componentReadyTimeout':1000});
//        });


    });
});