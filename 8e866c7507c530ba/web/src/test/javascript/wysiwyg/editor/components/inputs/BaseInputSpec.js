describe('wysiwyg.editor.components.inputs.BaseInput', function() {
	var reportError = LOG.reportError;

    describe("test errors when listenToInputs isnt implemented", function(){
        beforeEach(function() {

			LOG.reportError = function(){};

            /**
             * BaseInput cannot be created as a standalone component so we create a mock component
             * class that inherits BaseComponent
             */
            define.component('test.TestInput', function(def) {
                def.inherits('wysiwyg.editor.components.inputs.BaseInput');
                def.skinParts({label: {type: 'htmlElement'}});
            });
            /**
             * Also BaseComponent has no skin so we create a mock skin class
             */
            define.skin('test.TestInputSkin', function(def) {
                def.inherits('mobile.core.skins.BaseSkin');
                def.html('<div skinPart="label"></div>');
            });
            /**
             * Create a new component based on the previously created component and skin
             */
            W.Components.createComponent(
                'test.TestInput',
                'test.TestInputSkin',
                undefined,
                {labelText: ''},
				null,
                function(logic){
					LOG.reportError = reportError;
                    this.testInput = logic;
                    this.isComplete = true;
                }.bind(this)
            );

            waitsFor( function(){
                return this.isComplete;
            }.bind(this),
            'test input component creation',
            1000);

        });

        describe('BaseInput Abstract Functions', function(){
            function itShouldReportMissingMethodError(method){
                return it('should report error on missing ' + method + ' override', function(){
                    expect(this.testInput[method]).toBeDefined();
                    expect(this.testInput[method].bind(this.testInput)).toReportError(wixErrors.MISSING_METHOD, 'test.TestInput', method);
                });
            }
            itShouldReportMissingMethodError('_listenToInput');
            itShouldReportMissingMethodError('_stopListeningToInput');

        });
    });

    describe("test base input", function(){
        beforeEach(function() {
            /**
             * BaseInput cannot be created as a standalone component so we create a mock component
             * class that inherits BaseComponent
             */
            define.component('test.TestInput', function(def) {
                def.inherits('wysiwyg.editor.components.inputs.BaseInput');
                def.skinParts({label: {type: 'htmlElement'}});
                def.methods({
                    _listenToInput: function(){},
                    _stopListeningToInput:function(){}
                });
            });
            /**
             * Also BaseComponent has no skin so we create a mock skin class
             */
            define.skin('test.TestInputSkin', function(def) {
                def.inherits('mobile.core.skins.BaseSkin');
                def.html('<div skinPart="label"></div>');
            });
            /**
             * Create a new component based on the previously created component and skin
             */
            W.Components.createComponent(
                'test.TestInput',
                'test.TestInputSkin',
                undefined,
                null,
                {labelText: ''},
                function(logic){
                    this.testInput = logic;
                    this.isComplete = true;
                }.bind(this)
            );

            waitsFor( function(){
                return this.isComplete;
            }.bind(this),
            'test input component creation',
            1000);

        });

        describe('BaseInput public functions', function(){
            describe('setLabel', function(){
                it('should set a new text to the label skin part', function(){
                    var compLabel = '';
                    var label = 'New Label';
                    this.testInput.setLabel(label);
                    compLabel = this.testInput._skinParts.label.get('html');
                    expect(compLabel).toBe(label);
                });
                it('should show the label and set the component state to hasLabel', function(){
                    var label = 'New Label';
                    var state = '';
                    spyOn(this.testInput._skinParts.label, 'uncollapse');
                    this.testInput.setLabel(label);
                    state = this.testInput.getState();
                    expect(this.testInput._skinParts.label.uncollapse).toHaveBeenCalled();
                    expect(state).toContainString('hasLabel');
                });
                it('should hide the label and set the component state to noLabel', function(){
                    var label = null;
                    var state = '';
                    spyOn(this.testInput._skinParts.label, 'collapse');
                    this.testInput.setLabel(label);
                    state = this.testInput.getState();
                    expect(this.testInput._skinParts.label.collapse).toHaveBeenCalled();
                    expect(state).toContainString('noLabel');
                });
            });
            describe('dispose', function(){
                it('should call the local _stopListeningToInput function', function(){
                    spyOn(this.testInput, '_stopListeningToInput');

                    this.testInput.dispose();
                    expect(this.testInput._stopListeningToInput).toHaveBeenCalled();
                });
                it('should call BaseComponent dispose function and empty the component view', function(){
                    this.testInput.dispose();
                    expect(this.testInput.getIsDisposed()).toBeTruthy();
                    expect(this.testInput._view).toBeFalsy();
                });

            });
        });
        describe('BaseInput private functions', function(){
            describe('_changeEventHandler', function(){
                it('should fire a custom "inputChanged" event', function(){
                    spyOn(this.testInput, 'fireEvent');
                    spyOn(this.testInput, 'getValue').andReturn('test');
                    var e = {};
                    var event = {value: 'test', origEvent: e, compLogic: this.testInput};
                    this.testInput._changeEventHandler(e);
                    expect(this.testInput.fireEvent).toHaveBeenCalledWith('inputChanged', event);
                });
            });
        });
    });
});