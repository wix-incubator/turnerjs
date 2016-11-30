define.component('wysiwyg.common.components.numericstepper.viewer.NumericStepper', function (componentDefinition) {
    /**@type core.managers.component.ComponentDefinition */
    var def = componentDefinition;

    def.resources(['W.Data', 'W.Config']);

    def.inherits('core.components.base.BaseComp');

    def.propertiesSchemaType('NumericStepperProperties');

    def.dataTypes(['NumericStepper']);

    def.binds(['_changeEventHandler', '_fireKeyUp', '_fireBlur']);

    def.skinParts({
        inputNumberInput: {
            type: 'htmlElement'
        },
        controls: {
            type: 'htmlElement'
        }
    });

    def.methods({

        _params: {},

        _onRender: function (renderEvent) {
            var invalidations = renderEvent.data.invalidations;

            // TODO add invalidations filter if needed

            if (invalidations.isInvalidated([this.INVALIDATIONS.FIRST_RENDER])) {
                this._firstRender();
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.DATA_CHANGE])) {
                this._onDataChange();
            }

            if (invalidations.isInvalidated([this.INVALIDATIONS.SKIN_CHANGE])) {
                this._setValues();
                this._attachEvents();
            }
        },

        _setValues: function () {
            var properties = this.getComponentProperties();

            this._params.min = properties.get('minValue');
            this._params.max = properties.get('maxValue');

            this._skinParts.inputNumberInput.set('value', this.getDataItem().get('text'));
        },

        _attachEvents: function () {

            this._checkInput();

            var plus = this._skinParts.controls.getElement('.plus'),
                minus = this._skinParts.controls.getElement('.minus');

            if (plus && minus) {
                plus.addEvent('click', (function () {
                    this._changeValue(1);
                }).bind(this));

                minus.addEvent('click', (function () {
                    this._changeValue(-1);
                }).bind(this));
            }

            this._skinParts.inputNumberInput.addEvent('mousewheel', function (e) {
                if (document.activeElement != this._skinParts.inputNumberInput) {
                    return;
                }

                e.preventDefault();

                // TODO add delay

                if (e.wheel > 0) {
                    if (!this._changeValue(1)) e.preventDefault();
                } else {
                    if (!this._changeValue(-1)) e.preventDefault();
                }
            }.bind(this));

            this._skinParts.inputNumberInput.addEvent(Constants.CoreEvents.KEY_DOWN, (function (e) {

                return e.key != 'space'
                    && (!e.shift || e.code >= 35 && e.code <= 40)
                    && (e.key.length != 1 || e.control || e.meta || e.shift || e.code >= 48 && e.code <= 57 || e.code >= 96 && e.code <= 105);

            }).bind(this));

            this._skinParts.inputNumberInput.addEvent(Constants.CoreEvents.CUT, this._changeEventHandler);
            this._skinParts.inputNumberInput.addEvent(Constants.CoreEvents.PASTE, this._changeEventHandler);
            this._skinParts.inputNumberInput.addEvent(Constants.CoreEvents.CHANGE, this._changeEventHandler);

            this._skinParts.inputNumberInput.addEvent(Constants.CoreEvents.KEY_UP, this._fireKeyUp);
            this._skinParts.inputNumberInput.addEvent(Constants.CoreEvents.BLUR, this._fireBlur);

        },

        _changeEventHandler: function (e) {

            if (this._skinParts.inputNumberInput.get('value') != '') {
                this._checkInput();
            }

        },

        _fireKeyUp: function(e) {

            if (this._skinParts.inputNumberInput.get('value') != '' || e.code == '13') {
                this._checkInput();
            }

            this.fireEvent(Constants.CoreEvents.KEY_UP, e);

        },

        _fireBlur: function(e) {

            this._checkInput();

            this.fireEvent(Constants.CoreEvents.BLUR, e);

        },

        _checkInput: function () {
            var value = this._skinParts.inputNumberInput.get('value'),
                intValue = parseInt(value),
                oldValue = this.getDataItem().get('text');

            if (value == '' || isNaN(intValue) || intValue.toString() !== value) {
                intValue = oldValue;
                this._skinParts.inputNumberInput.set('value', intValue);

            } else if (intValue < this._params.min) {
                intValue = this._params.min;
                this._skinParts.inputNumberInput.set('value', intValue);

            } else if (intValue > this._params.max) {
                intValue = this._params.max;
                this._skinParts.inputNumberInput.set('value', intValue);
                this._skinParts.inputNumberInput.blur();

                this.fireEvent('validationFailed', {value: intValue, validValue: this._params.max});
            }

            if (oldValue != intValue) {

                this.getDataItem().set('text', intValue);

                this.fireEvent('inputChanged', {value: intValue, compLogic: this});

            }
        },

        _firstRender: function () {

            //this._attachEvents();

        },

        _onDataChange: function () {

            this._skinParts.inputNumberInput.set('value', this.getDataItem().get('text'));

        },

        _changeValue: function (delta) {
            var nextValue = parseInt(this._skinParts.inputNumberInput.get('value')) + parseInt(delta);

            if (nextValue < this._params.min || nextValue > this._params.max) {
                return false;
            }

            this._skinParts.inputNumberInput.set('value', nextValue);

            this._checkInput();

            return true;
        }

    });
});